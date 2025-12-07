import React, { useEffect, useLayoutEffect, useRef } from 'react';

interface Note {
  time: number;
  string: number;
  fret: number;
}

export default function NoteHighway2D({
  notes,
  currentTime,
}: {
  notes: Note[];
  currentTime: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dprRef = useRef<number>(1);

  // Resize canvas to match container and device pixel ratio
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = dprRef.current;
    const W = canvas.width;
    const H = canvas.height;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    // Draw string lanes
    const lanes = 6;
    const margin = 20;
    const usableHeight = H / dpr - margin * 2;
    const laneGap = usableHeight / (lanes - 1);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < lanes; i += 1) {
      const y = margin + i * laneGap;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W / dpr, y);
      ctx.stroke();
    }

    // Playhead line
    const playheadX = (W / dpr) * 0.22;
    ctx.strokeStyle = 'rgba(248,113,113,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, H / dpr);
    ctx.stroke();

    notes.forEach((note) => {
      const dt = note.time - currentTime;
      const x = playheadX + dt * 220;
      const clampedString = Math.max(0, Math.min(lanes - 1, note.string));
      const y = margin + clampedString * laneGap;

      if (x < -40 || x > W / dpr + 40) return;

      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = '12px monospace';
      ctx.fillText(note.fret.toString(), x - 3, y + 4);
    });
    ctx.restore();
  }, [currentTime, notes]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: 320,
        background: 'radial-gradient(circle at 20% 20%, rgba(248,113,113,0.12), rgba(0,0,0,0.9))',
        border: '1px solid #222',
        borderRadius: 12,
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)',
      }}
    />
  );
}
