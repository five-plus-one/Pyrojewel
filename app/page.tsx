'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type TouchEvent, type WheelEvent } from 'react';
import HanziWriter from 'hanzi-writer';

const AUDIO_URL = 'https://img.assets.five-plus-one.com/img/2026/09/3aaea3590be5c7fe0312e9ca4d6f195a.mp3';
const LRC_URL = 'https://img.assets.five-plus-one.com/img/2026/09/9392fcd19d94a28ce606e276fd79375b.lrc';
const IMAGES = {
  cover: 'https://img.assets.five-plus-one.com/img/2026/09/bd1c63d9a06351b7992f51e9da83a516',
  color: 'https://img.assets.five-plus-one.com/img/2026/09/e04d3643bb614d4f5f7fec6cc0c54d74',
  ember: 'https://img.assets.five-plus-one.com/img/2026/09/b8bb993665dc4c474e4f3c649271c2e3',
  prism: 'https://img.assets.five-plus-one.com/img/2026/09/74447e5b260707b5ddf7c0dae2f31cdc',
  road: 'https://img.assets.five-plus-one.com/img/2026/09/d59d1b0996d2e93efd5291d51ea3b08a',
  ending: 'https://img.assets.five-plus-one.com/img/2026/09/447b47cd2a13a935c57d88e142ae6078',
};
const COSMIC_WORDS = ['清醒','自由','热烈','柔软','勇气','好梦','远方','灿烂','真诚','从容','好奇','快乐','微光','温柔','明亮','自在'];

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

function HandwrittenWish({ active }: { active: boolean }) {
  const cellsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const lines = ['愿你拥有自己的艳火', '也永远有梦有快乐'];
  const characters = lines.join('').split('');

  useEffect(() => {
    if (!active) return;
    const writers = characters.map((character, index) => {
      const target = cellsRef.current[index];
      if (!target) return null;
      target.innerHTML = '';
      return HanziWriter.create(target, character, {
        width: 29,
        height: 33,
        padding: 1,
        showOutline: false,
        showCharacter: false,
        strokeColor: '#d9d1c5',
        strokeAnimationSpeed: 7.2,
        delayBetweenStrokes: 12,
      });
    });
    let cancelled = false;
    const write = (index: number) => {
      if (cancelled || index >= writers.length) return;
      const writer = writers[index];
      if (!writer) { write(index + 1); return; }
      writer.animateCharacter({ onComplete: () => window.setTimeout(() => write(index + 1), index === lines[0].length - 1 ? 180 : 18) });
    };
    const timer = window.setTimeout(() => write(0), 6200);
    return () => { cancelled = true; window.clearTimeout(timer); writers.forEach((writer) => writer?.cancelQuiz()); };
  }, [active]);

  let cursor = 0;
  return (
    <div className="stroke-letter" aria-label="愿你拥有自己的艳火，也永远有梦有快乐">
      {lines.map((line) => (
        <div className="stroke-line" key={line}>
          {line.split('').map((character) => {
            const index = cursor++;
            return <span key={`${character}-${index}`} ref={(element) => { cellsRef.current[index] = element; }} />;
          })}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const pageTimerRef = useRef<number | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const postcardTimerRef = useRef<number | null>(null);
  const introDoneRef = useRef(false);
  const pageReadyRef = useRef(false);
  const touchStartRef = useRef<number | null>(null);
  const touchTimeRef = useRef(0);
  const [lyrics, setLyrics] = useState(FALLBACK_LYRICS);
  const [started, setStarted] = useState(false);
  const [opened, setOpened] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(255);
  const [activePage, setActivePage] = useState(0);
  const [contentPage, setContentPage] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [postcard, setPostcard] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetch(LRC_URL).then((res) => res.text()).then((text) => {
      const parsed = parseLrc(text); if (parsed.length > 20) setLyrics(parsed);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!introDone || contentPage < 0) return;
    pageReadyRef.current = false;
    setPageReady(false);
    if (pageTimerRef.current) window.clearTimeout(pageTimerRef.current);
    const duration = contentPage === 7 ? 18400 : 4300;
    pageTimerRef.current = window.setTimeout(() => {
      pageReadyRef.current = true;
      setPageReady(true);
    }, duration);
    return () => { if (pageTimerRef.current) window.clearTimeout(pageTimerRef.current); };
  }, [contentPage, introDone]);

  useEffect(() => {
    setPostcard(false);
    if (contentPage !== 7) return;
    postcardTimerRef.current = window.setTimeout(() => setPostcard(true), 15800);
    return () => { if (postcardTimerRef.current) window.clearTimeout(postcardTimerRef.current); };
  }, [contentPage]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
    if (pageTimerRef.current) window.clearTimeout(pageTimerRef.current);
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
    if (postcardTimerRef.current) window.clearTimeout(postcardTimerRef.current);
  }, []);
  const tick = () => {
    const audio = audioRef.current; if (!audio) return;
    setTime(audio.currentTime);
    if (audio.currentTime >= 13.25 && !introDoneRef.current) {
      introDoneRef.current = true;
      setIntroDone(true);
    }
    if (!audio.paused && !audio.ended) rafRef.current = requestAnimationFrame(tick);
  };
  const begin = async () => {
    const audio = audioRef.current; if (!audio) return;
    setNotice(''); audio.load();
    try {
      await audio.play(); setStarted(true); setPlaying(true); rafRef.current = requestAnimationFrame(tick);
      openTimerRef.current = window.setTimeout(() => setOpened(true), 2950);
    }
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
  const goToPage = (nextPage: number) => {
    if (!introDoneRef.current || !pageReadyRef.current || nextPage < 0 || nextPage > 7 || nextPage === activePage) {
      setDragOffset(0);
      return;
    }
    pageReadyRef.current = false;
    setPageReady(false);
    setContentPage(-1);
    setPostcard(false);
    setActivePage(nextPage);
    setDragOffset(0);
    revealTimerRef.current = window.setTimeout(() => setContentPage(nextPage), 980);
  };
  const backToBeginning = () => {
    pageReadyRef.current = false;
    setPageReady(false);
    setContentPage(-1);
    setPostcard(false);
    setActivePage(0);
    revealTimerRef.current = window.setTimeout(() => setContentPage(0), 980);
  };
  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    if (!pageReadyRef.current) return;
    touchStartRef.current = event.touches[0]?.clientY ?? null;
    touchTimeRef.current = performance.now();
    setDragging(true);
  };
  const handleTouchMove = (event: TouchEvent<HTMLElement>) => {
    if (touchStartRef.current === null || !pageReadyRef.current) return;
    const current = event.touches[0]?.clientY ?? touchStartRef.current;
    let offset = current - touchStartRef.current;
    if ((activePage === 0 && offset > 0) || (activePage === 7 && offset < 0)) offset *= 0.22;
    setDragOffset(offset);
  };
  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartRef.current === null) return;
    const delta = touchStartRef.current - (event.changedTouches[0]?.clientY ?? touchStartRef.current);
    const elapsed = Math.max(1, performance.now() - touchTimeRef.current);
    touchStartRef.current = null;
    setDragging(false);
    if (Math.abs(delta) > 64 || Math.abs(delta / elapsed) > 0.52) goToPage(activePage + (delta > 0 ? 1 : -1));
    else setDragOffset(0);
  };
  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    if (Math.abs(event.deltaY) > 24) goToPage(activePage + (event.deltaY > 0 ? 1 : -1));
  };

  const lyricIndex = useMemo(() => {
    let index = -1; for (let i = 0; i < lyrics.length; i += 1) { if (time >= lyrics[i].time) index = i; else break; } return index;
  }, [lyrics, time]);
  const currentLyric = lyricIndex >= 0 ? lyrics[lyricIndex].text : '';
  const progress = Math.min(100, (time / duration) * 100 || 0);

  return (
    <main className={`experience ${started ? 'is-started' : ''} ${opened ? 'is-opened' : ''} ${introDone ? 'is-ready' : ''}`}>
      <audio ref={audioRef} src={AUDIO_URL} preload="metadata" playsInline
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 255)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />

      <section className="cover" onClick={begin} role="button" tabIndex={started ? -1 : 0}
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') begin(); }} aria-hidden={started} aria-label="打开祝福">
        <img src={IMAGES.cover} alt="暗色中掠过的一束红光" />
        <div className="cover-shade" />
        <div className="cover-kicker"><span>TO</span> 啵啵老师</div>
        <div className="cover-title"><span>艳</span><span>火</span><small>PYROJEWEL</small></div>
        <div className="cover-note"><span>一份写在艳火里的祝福</span><b>轻触任意位置打开</b></div>
        {notice && <p className="audio-notice" role="alert">{notice}</p>}
      </section>

      {started && !introDone && (
        <section className={`cosmic-prologue ${opened ? 'active' : ''} ${time > 10.6 ? 'converging' : ''}`} aria-label="祝福序章">
          <div className="word-universe">
            {COSMIC_WORDS.map((word, index) => (
              <span key={`${word}-${index}`} style={{
                '--x': `${((index * 47) % 104) - 52}vw`,
                '--y': `${((index * 31) % 112) - 56}vh`,
                '--z': `${-980 + ((index * 83) % 760)}px`,
                '--rz': `${((index * 29) % 42) - 21}deg`,
                '--delay': `${(index % 8) * -0.72}s`,
                '--duration': `${7.5 + (index % 5) * 1.1}s`,
              } as CSSProperties}>{word}</span>
            ))}
          </div>
          <div className="cosmic-center"><i /><p>有些词语，想先送给你</p><b>艳火</b></div>
          <div className="cosmic-depth"><span>01</span><i /></div>
        </section>
      )}

      <section className="pages" ref={scrollRef} aria-hidden={!started} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd} onWheel={handleWheel}>
        <div className={`pages-track ${dragging ? 'is-dragging' : ''}`} style={{ transform: `translate3d(0, calc(-${activePage * 100}dvh + ${dragOffset}px), 0)` }}>
        <article className={`wish wish-one ${contentPage === 0 ? 'active' : ''}`} data-page="0">
          <img src={IMAGES.color} alt="黑暗中的光谱" />
          <div className="wish-one-mono" />
          <span className="folio">愿望之一</span>
          <div className="wish-copy"><p>愿你看见黑白</p><p>也始终看得见灿烂</p></div>
          <small className="wish-footnote">世界有它的明暗，而你有选择颜色的自由</small>
          <i className="swipe-cue">向上翻阅</i>
        </article>

        <article className={`wish wish-two ${contentPage === 1 ? 'active' : ''}`} data-page="1">
          <img src={IMAGES.ember} alt="暗处散落的红色微光" />
          <div className="wish-two-card"><span className="folio">愿望之二</span><div className="wish-copy"><p>愿你清醒</p><p>却不因此失去热烈</p></div><small>不必为了证明什么而燃烧</small></div>
        </article>

        <article className={`wish wish-three ${contentPage === 2 ? 'active' : ''}`} data-page="2">
          <img src={IMAGES.prism} alt="白墙上的彩色折射" />
          <span className="folio">愿望之三</span>
          <div className="wish-copy"><p>愿你理解世界</p><p>也允许它保留神秘</p></div>
          <small>在所有确定之外，仍有梦可做</small>
        </article>

        <article className={`wish wish-four ${contentPage === 3 ? 'active' : ''}`} data-page="3">
          <div className="margin-rule" />
          <span className="folio">愿望之四</span>
          <div className="wish-copy"><p>愿你拥有理解疼痛的专业</p><p>也拥有远离疲惫的幸运</p></div>
          <div className="margin-note"><span>以及——</span><p>在照顾许多人以前<br />记得把自己也算进去</p></div>
        </article>

        <article className={`wish wish-five ${contentPage === 4 ? 'active' : ''}`} data-page="4">
          <img src={IMAGES.ember} alt="散落后重新亮起的光" />
          <div className="joy-window"><span className="folio">愿望之五</span><div className="wish-copy"><p>愿那些看似无用的快乐</p><p>也一直被你认真珍藏</p></div></div>
          <div className="joy-words"><i>一首喜欢的歌</i><i>一个悠闲的下午</i><i>一场好梦</i><i>一次意外的好运</i></div>
        </article>

        <article className={`wish wish-six ${contentPage === 5 ? 'active' : ''}`} data-page="5">
          <img src={IMAGES.road} alt="驶向远方的夜路" />
          <div className="road-frame" />
          <span className="folio">愿望之六</span>
          <div className="wish-copy"><p>愿遥远的路</p><p>都成为自由的一部分</p></div>
          <small>不必急着抵达，也不必时时回头</small>
        </article>

        <article className={`wish wish-seven ${contentPage === 6 ? 'active' : ''}`} data-page="6">
          <img src={IMAGES.ending} alt="黑夜中留下的艳红光迹" />
          <span className="folio">愿望之七</span>
          <div className="wish-copy"><p>愿所有未说出的美好</p><p>都在属于你的时刻发亮</p></div>
          <strong>有梦了，快乐。</strong>
        </article>

        <article className={`wish ending-page ${contentPage === 7 ? 'active' : ''} ${postcard ? 'is-postcard' : ''}`} data-page="7">
          <span className="ending-label">THE END, AND MORE</span>
          <div className="letter">
            <p className="letter-to">To 啵啵老师：</p>
            <p>这些愿望不必一次实现。</p>
            <p>它们可以散落在以后很长的日子里，<br />在某个普通时刻，忽然被你拾获。</p>
            <HandwrittenWish active={contentPage === 7} />
            <p className="signature-word">五加一</p>
          </div>
          <p className="postcard-credit">艳火 <em>Pyrojewel</em></p>
          <div className="ending-actions"><button type="button" onClick={backToBeginning}>再看一遍</button><button type="button" onClick={replay}>从头再听</button></div>
        </article>
        </div>
      </section>

      {introDone && currentLyric && <div className={`floating-lyric lyric-on-${activePage}`} key={lyricIndex}>{currentLyric}</div>}
      {introDone && <nav className="page-dots" aria-label="祝福页进度">{[0,1,2,3,4,5,6,7].map((page) => <i key={page} className={activePage === page ? 'active' : ''} />)}</nav>}
      {introDone && <div className={`turn-state ${pageReady ? 'ready' : ''}`}><i /><span>{pageReady ? (activePage === 7 ? '可以回看' : '上滑继续') : '祝福正在展开'}</span></div>}
      {introDone && <div className="player-bar">
        <button type="button" onClick={toggle} aria-label={playing ? '暂停' : '播放'}><span className={playing ? 'pause-mark' : 'play-mark'} /></button>
        <div className="progress"><i style={{ width: `${progress}%` }} /></div><span>艳火 · 张悬</span>
      </div>}
    </main>
  );
}
