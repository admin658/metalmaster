import usePitchDetection from '@/hooks/usePitchDetection';
import { useEffect, useRef, useState } from 'react';

function midiToNoteName(m: number) {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const n = Math.round(m);
  const name = names[((n % 12) + 12) % 12];
  const oct = Math.floor(n / 12) - 1;
  return `${name}${oct}`;
}

export default function Tuner() {
  const { start, stop, detectPitch } = usePitchDetection();
  const [running, setRunning] = useState(false);
  const [freq, setFreq] = useState<number | null>(null);
  const [midi, setMidi] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stop();
    };
  }, []);

  const update = () => {
    const f = detectPitch();
    if (f) {
      const m = 12 * Math.log2(f / 440) + 69;
      setFreq(f);
      setMidi(m);
    } else {
      setFreq(null);
      setMidi(null);
    }
    rafRef.current = requestAnimationFrame(update);
  };

  async function handleStart() {
    try {
      await start();
      setRunning(true);
      rafRef.current = requestAnimationFrame(update);
    } catch (err) {
      console.warn('Tuner: microphone access failed', err);
    }
  }

  function handleStop() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stop();
    setRunning(false);
    setFreq(null);
    setMidi(null);
  }

  const noteName = midi != null ? midiToNoteName(midi) : '--';
  const cents = midi != null ? Math.round((midi - Math.round(midi)) * 100) : 0;
  const inTune = Math.abs(cents) <= 5;

  return (
    <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{noteName}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {freq ? `${freq.toFixed(1)} Hz` : 'No signal'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, color: inTune ? '#34d399' : '#fb7185' }}>
            {inTune ? 'In Tune' : `${cents}¢`}
          </div>
          <div style={{ marginTop: 6 }}>
            {running ? (
              <button onClick={handleStop} style={{ padding: '6px 10px', borderRadius: 8 }}>
                Stop
              </button>
            ) : (
              <button onClick={handleStart} style={{ padding: '6px 10px', borderRadius: 8 }}>
                Start Tuner
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Simple needle visualization */}
      <div style={{ marginTop: 12 }}>
        <div
          style={{
            height: 8,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 6,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: `${50 + (cents / 50) * 50}%`,
              top: -6,
              width: 2,
              height: 20,
              background: inTune ? '#34d399' : '#fb7185',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            marginTop: 6,
            opacity: 0.8,
          }}
        >
          <div>-50¢</div>
          <div>0¢</div>
          <div>+50¢</div>
        </div>
      </div>
    </div>
  );
}
