'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const AUDIO_URL = 'https://img.assets.five-plus-one.com/img/2026/09/3aaea3590be5c7fe0312e9ca4d6f195a.mp3';
const LRC_URL = 'https://img.assets.five-plus-one.com/img/2026/09/9392fcd19d94a28ce606e276fd79375b.lrc';

type Lyric = { time: number; text: string };
type Spark = { id: number; x: number; y: number; word: string };
const SPARK_WORDS = ['清醒', '自由', '热烈', '柔软', '坚定', '好梦'];

const FALLBACK_LYRICS: Lyric[] = [
  [13.8, '扑火，我们相视笑着扑火，'], [21.23, '什么都不说。不说的，是真的；'],
  [28.6, '我们相视笑着，是梦也快乐。'], [34.82, '当你穿越爱的历史向我走来，'],
  [42.31, '我在你眼里看尽了相恋的年代；'], [47.56, '曾经的黑白，此刻灿烂。'],
  [57.68, '于是你不停散落，我不停拾获，'], [63.18, '我们在遥远的路上白天黑夜为彼此是艳火。'],
  [68.06, '如果你在前方回头，而我亦回头，'], [73.31, '我们就错过。'],
  [79.5, '很久以前人们都许诺···'], [83.37, '许诺要是什么，可以不说？'],
  [90.189, '扑火，我们相视笑着扑火，'], [97.61, '什么都不说。不说的，是真的；'],
  [104.93, '我们相视笑着，是梦也快乐。'], [111.429, '当你原谅所有遗憾，对我依赖，'],
  [118.75, '我在你怀里想起了最初的感慨，'], [124.1, '第一次等待，此刻还在。'],
  [131.4, '于是你不停散落，我不停拾获，'], [136.97, '我们在遥远的路上白天黑夜为彼此是艳火。'],
  [141.91, '如果你在前方回头，而我亦回头，'], [147.22, '我们就错过。'],
  [152.4, '于是你不断地爱我，'], [155.3, '我能如何便如何，'],
  [158.14, '在遥远的路上即使尘埃看今夜艳火，'], [162.83, '我等你在前方回头，而我不回头，'],
  [168.19, '你要不要我。'], [173.63, '你要不要我。'],
  [231.37, '扑火，我们相视笑着扑火。'], [238.8, '什么都不说。不说的是真的。'],
  [246.05, '我们相视笑着，'], [249.36, '有梦了，快乐。'],
].map(([time, text]) => ({ time: time as number, text: text as string }));

function parseLrc(raw: string): Lyric[] {
  return raw.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\[(\d{2}):(\d{2}(?:\.\d+)?)\](.*)$/);
    if (!match || !match[3].trim()) return [];
    return [{ time: Number(match[1]) * 60 + Number(match[2]), text: match[3].trim() }];
  });
}

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number | null>(null);
  const [lyrics, setLyrics] = useState(FALLBACK_LYRICS);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(255);
  const [ended, setEnded] = useState(false);
  const [notice, setNotice] = useState('');
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    fetch(LRC_URL).then((res) => res.text()).then((text) => {
      const parsed = parseLrc(text);
      if (parsed.length > 20) setLyrics(parsed);
    }).catch(() => undefined);
  }, []);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const tick = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setTime(audio.currentTime);
    if (!audio.paused && !audio.ended) rafRef.current = requestAnimationFrame(tick);
  };

  const begin = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setNotice('');
    setStarted(true);
    audio.load();
    try {
      await audio.play();
      setPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setStarted(false);
      setNotice('声音没有成功开启，请再轻触一次');
    }
  };

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await audio.play(); setPlaying(true); rafRef.current = requestAnimationFrame(tick);
    } else { audio.pause(); setPlaying(false); }
  };

  const replay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0; setEnded(false); setTime(0); await audio.play(); setPlaying(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  const leaveSpark = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const spark = {
      id: Date.now() + Math.random(),
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      word: SPARK_WORDS[Math.floor(Math.random() * SPARK_WORDS.length)],
    };
    setSparks((current) => [...current.slice(-7), spark]);
    window.setTimeout(() => setSparks((current) => current.filter((item) => item.id !== spark.id)), 2200);
  };

  const lyricIndex = useMemo(() => {
    let index = -1;
    for (let i = 0; i < lyrics.length; i += 1) { if (time >= lyrics[i].time) index = i; else break; }
    return index;
  }, [lyrics, time]);
  const currentLyric = lyricIndex >= 0 ? lyrics[lyricIndex].text : '';
  const progress = Math.min(100, (time / duration) * 100 || 0);
  const intensity = Math.max(0, Math.min(1, (time - 12) / 180));

  return (
    <main className={`experience ${started ? 'is-started' : ''} ${ended ? 'is-ended' : ''}`} style={{ '--progress': `${progress}%`, '--intensity': intensity } as React.CSSProperties}>
      <audio ref={audioRef} src={AUDIO_URL} preload="metadata" playsInline
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 255)}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setEnded(true); setTime(duration); }} />

      <section className="prologue" aria-hidden={started} onClick={begin} role="button" tabIndex={started ? -1 : 0}
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') begin(); }} aria-label="轻触任意位置，开始播放">
        <div className="prologue-grain" />
        <div className="ember-trigger" aria-hidden="true">
          <span className="ember-core" /><span className="ember-ring" />
        </div>
        <div className="title-lockup"><h1>艳火</h1><p>PYROJEWEL</p></div>
        <p className="sound-note">轻触任意位置 · 开启声音</p>
        {notice && <p className="audio-notice" role="alert">{notice}</p>}
      </section>

      <section className="main-scene" aria-hidden={!started} onPointerDown={leaveSpark}>
        <div className="halo" /><div className="fire-trace" />
        <div className="dust dust-a" /><div className="dust dust-b" />

        {time < 12.5 && <div className="opening-copy"><p>给仍然相信灿烂的你</p></div>}

        {!ended && currentLyric && (
          <div className={`lyric-field ${currentLyric ? 'has-lyric' : ''}`} key={lyricIndex}>
            <p className="lyric-current">{currentLyric}</p>
          </div>
        )}

        <p className="touch-hint">触碰，留下一点光</p>
        <div className="spark-layer" aria-hidden="true">
          {sparks.map((spark) => (
            <span className="touch-spark" key={spark.id} style={{ left: spark.x, top: spark.y }}>
              <i /><em>{spark.word}</em>
            </span>
          ))}
        </div>

        <div className="player-chrome" onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" onClick={toggle} className="play-toggle" aria-label={playing ? '暂停' : '继续播放'}>
            <span className={playing ? 'pause-mark' : 'play-mark'} />
          </button>
          <div className="progress-track"><i /></div>
          <span className="track-name">艳火 · 张悬</span>
        </div>
      </section>

      <section className="blessing" aria-hidden={!ended}>
        <div className="blessing-mark" />
        <p>愿你有梦可做</p>
        <p>也有自己的艳火</p>
        <div className="blessing-space" />
        <p className="blessing-small">清醒，自由，灿烂</p>
        <button type="button" onClick={replay}>再听一次</button>
      </section>
    </main>
  );
}
