'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const AUDIO_URL = 'https://img.assets.five-plus-one.com/img/2026/09/3aaea3590be5c7fe0312e9ca4d6f195a.mp3';
const LRC_URL = 'https://img.assets.five-plus-one.com/img/2026/09/9392fcd19d94a28ce606e276fd79375b.lrc';
const IMAGES = {
  cover: 'https://images.unsplash.com/photo-1618601594423-d631b89a8472?auto=format&fit=crop&q=86&w=1200',
  color: 'https://images.unsplash.com/photo-1573655349936-de6bed86f839?auto=format&fit=crop&q=86&w=1200',
  ember: 'https://images.unsplash.com/photo-1708447782261-cdbecd7c97c6?auto=format&fit=crop&q=86&w=1200',
  prism: 'https://images.unsplash.com/photo-1773291933748-32be19245c48?auto=format&fit=crop&q=86&w=1200',
  road: 'https://images.unsplash.com/photo-1708358096865-5b53dbd5b079?auto=format&fit=crop&q=86&w=1200',
  ending: 'https://images.unsplash.com/photo-1774317255256-4b4c36637376?auto=format&fit=crop&q=86&w=1200',
};

type Lyric = { time: number; text: string };
const FALLBACK_LYRICS: Lyric[] = [
  [13.8, '扑火，我们相视笑着扑火，'], [21.23, '什么都不说。不说的，是真的；'], [28.6, '我们相视笑着，是梦也快乐。'],
  [34.82, '当你穿越爱的历史向我走来，'], [42.31, '我在你眼里看尽了相恋的年代；'], [47.56, '曾经的黑白，此刻灿烂。'],
  [57.68, '于是你不停散落，我不停拾获，'], [63.18, '我们在遥远的路上白天黑夜为彼此是艳火。'], [68.06, '如果你在前方回头，而我亦回头，'], [73.31, '我们就错过。'],
  [79.5, '很久以前人们都许诺···'], [83.37, '许诺要是什么，可以不说？'], [90.189, '扑火，我们相视笑着扑火，'],
  [97.61, '什么都不说。不说的，是真的；'], [104.93, '我们相视笑着，是梦也快乐。'], [111.429, '当你原谅所有遗憾，对我依赖，'],
  [118.75, '我在你怀里想起了最初的感慨，'], [124.1, '第一次等待，此刻还在。'], [131.4, '于是你不停散落，我不停拾获，'],
  [136.97, '我们在遥远的路上白天黑夜为彼此是艳火。'], [141.91, '如果你在前方回头，而我亦回头，'], [147.22, '我们就错过。'],
  [152.4, '于是你不断地爱我，'], [155.3, '我能如何便如何，'], [158.14, '在遥远的路上即使尘埃看今夜艳火，'],
  [162.83, '我等你在前方回头，而我不回头，'], [168.19, '你要不要我。'], [173.63, '你要不要我。'],
  [231.37, '扑火，我们相视笑着扑火。'], [238.8, '什么都不说。不说的是真的。'], [246.05, '我们相视笑着，'], [249.36, '有梦了，快乐。'],
].map(([time, text]) => ({ time: time as number, text: text as string }));

function parseLrc(raw: string): Lyric[] {
  return raw.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\[(\d{2}):(\d{2}(?:\.\d+)?)\](.*)$/);
    return !match || !match[3].trim() ? [] : [{ time: Number(match[1]) * 60 + Number(match[2]), text: match[3].trim() }];
  });
}

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const [lyrics, setLyrics] = useState(FALLBACK_LYRICS);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(255);
  const [activePage, setActivePage] = useState(0);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetch(LRC_URL).then((res) => res.text()).then((text) => {
      const parsed = parseLrc(text); if (parsed.length > 20) setLyrics(parsed);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!started || !scrollRef.current) return;
    const pages = [...scrollRef.current.querySelectorAll<HTMLElement>('[data-page]')];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActivePage(Number((entry.target as HTMLElement).dataset.page)); });
    }, { root: scrollRef.current, threshold: 0.58 });
    pages.forEach((page) => observer.observe(page));
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);
  const tick = () => {
    const audio = audioRef.current; if (!audio) return;
    setTime(audio.currentTime);
    if (!audio.paused && !audio.ended) rafRef.current = requestAnimationFrame(tick);
  };
  const begin = async () => {
    const audio = audioRef.current; if (!audio) return;
    setNotice(''); audio.load();
    try { await audio.play(); setStarted(true); setPlaying(true); rafRef.current = requestAnimationFrame(tick); }
    catch { setNotice('声音没有成功开启，请再轻触一次'); }
  };
  const toggle = async () => {
    const audio = audioRef.current; if (!audio) return;
    if (audio.ended) audio.currentTime = 0;
    if (audio.paused) { await audio.play(); setPlaying(true); rafRef.current = requestAnimationFrame(tick); }
    else { audio.pause(); setPlaying(false); }
  };
  const replay = async () => {
    const audio = audioRef.current; if (!audio) return;
    audio.currentTime = 0; setTime(0); await audio.play(); setPlaying(true); rafRef.current = requestAnimationFrame(tick);
  };

  const lyricIndex = useMemo(() => {
    let index = -1; for (let i = 0; i < lyrics.length; i += 1) { if (time >= lyrics[i].time) index = i; else break; } return index;
  }, [lyrics, time]);
  const currentLyric = lyricIndex >= 0 ? lyrics[lyricIndex].text : '';
  const progress = Math.min(100, (time / duration) * 100 || 0);

  return (
    <main className={`experience ${started ? 'is-started' : ''}`}>
      <audio ref={audioRef} src={AUDIO_URL} preload="metadata" playsInline
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 255)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />

      <section className="cover" onClick={begin} role="button" tabIndex={started ? -1 : 0}
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') begin(); }} aria-hidden={started} aria-label="打开祝福">
        <img src={IMAGES.cover} alt="暗色中掠过的一束红光" />
        <div className="cover-shade" />
        <div className="cover-kicker">给你的一份祝福</div>
        <div className="cover-title"><span>艳</span><span>火</span><small>PYROJEWEL</small></div>
        <div className="cover-note"><span>五个小小的愿望</span><b>轻触任意位置打开</b></div>
        {notice && <p className="audio-notice" role="alert">{notice}</p>}
      </section>

      <section className="pages" ref={scrollRef} aria-hidden={!started}>
        <article className={`wish wish-one ${activePage === 0 ? 'active' : ''}`} data-page="0">
          <img src={IMAGES.color} alt="黑暗中的光谱" />
          <div className="wish-one-mono" />
          <span className="folio">愿望之一</span>
          <div className="wish-copy"><p>愿你看见黑白</p><p>也始终看得见灿烂</p></div>
          <i className="swipe-cue">向上翻阅</i>
        </article>

        <article className={`wish wish-two ${activePage === 1 ? 'active' : ''}`} data-page="1">
          <img src={IMAGES.ember} alt="暗处散落的红色微光" />
          <div className="wish-two-card"><span className="folio">愿望之二</span><div className="wish-copy"><p>愿你清醒</p><p>却不因此失去热烈</p></div><small>不必为了证明什么而燃烧</small></div>
        </article>

        <article className={`wish wish-three ${activePage === 2 ? 'active' : ''}`} data-page="2">
          <img src={IMAGES.prism} alt="白墙上的彩色折射" />
          <span className="folio">愿望之三</span>
          <div className="wish-copy"><p>愿你理解世界</p><p>也允许它保留神秘</p></div>
          <small>在所有确定之外，仍有梦可做</small>
        </article>

        <article className={`wish wish-four ${activePage === 3 ? 'active' : ''}`} data-page="3">
          <img src={IMAGES.road} alt="驶向远方的夜路" />
          <div className="road-frame" />
          <span className="folio">愿望之四</span>
          <div className="wish-copy"><p>愿遥远的路</p><p>都成为自由的一部分</p></div>
        </article>

        <article className={`wish wish-five ${activePage === 4 ? 'active' : ''}`} data-page="4">
          <img src={IMAGES.ending} alt="黑夜中留下的艳红光迹" />
          <span className="folio">最后一个愿望</span>
          <div className="wish-copy"><p>愿所有未说出的美好</p><p>都在属于你的时刻发亮</p></div>
          <strong>有梦了，快乐。</strong>
          <button type="button" onClick={replay}>从头再听</button>
        </article>
      </section>

      {started && currentLyric && <div className={`floating-lyric lyric-on-${activePage}`} key={lyricIndex}>{currentLyric}</div>}
      {started && <nav className="page-dots" aria-label="祝福页进度">{[0,1,2,3,4].map((page) => <i key={page} className={activePage === page ? 'active' : ''} />)}</nav>}
      {started && <div className="player-bar">
        <button type="button" onClick={toggle} aria-label={playing ? '暂停' : '播放'}><span className={playing ? 'pause-mark' : 'play-mark'} /></button>
        <div className="progress"><i style={{ width: `${progress}%` }} /></div><span>艳火 · 张悬</span>
      </div>}
    </main>
  );
}
