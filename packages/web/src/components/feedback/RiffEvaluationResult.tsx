import React from 'react';
import type { GradeSummary } from '../../audio/GuitarFeedbackEngine';

type Props = {
  accuracy: number;
  xp: number;
  achievements: string[];
  summary?: GradeSummary | null;
};

export default function RiffEvaluationResult({ accuracy, xp, achievements, summary }: Props) {
  const grade = summary?.gradePercent ?? accuracy;
  const pitch = summary?.pitchAccuracyPct ?? accuracy;
  const timing = summary?.timingAccuracyPct ?? accuracy;
  const combined = summary?.noteCorrectnessPct ?? accuracy;
  const misses = summary?.misses.length ?? 0;
  const extras = summary?.extraNoteCount ?? 0;
  const meanOffset = summary?.meanOffsetMs ?? 0;
  const offsetLabel =
    Math.abs(meanOffset) < 1 ? 'on grid' : `${meanOffset.toFixed(0)} ms ${meanOffset > 0 ? 'late' : 'early'}`;

  return (
    <div
      style={{
        background: '#111',
        padding: 20,
        color: 'white',
        border: '1px solid #333',
        borderRadius: 8,
        fontFamily: 'monospace',
        display: 'grid',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ margin: 0 }}>Riff Complete</h2>
        <span style={{ fontSize: 14, opacity: 0.8 }}>XP: {xp}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8 }}>
        <Metric label="Grade" value={`${grade.toFixed(1)}%`} />
        <Metric label="Pitch accuracy" value={`${pitch.toFixed(1)}%`} />
        <Metric label="Timing accuracy" value={`${timing.toFixed(1)}%`} />
        <Metric label="Notes correct" value={`${combined.toFixed(1)}%`} />
      </div>

      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8, fontSize: 12 }}>
          <Small label="Coverage" value={`${summary.coveragePct.toFixed(1)}%`} />
          <Small label="Avg abs offset" value={`${summary.avgTimingErrorMs.toFixed(0)} ms`} />
          <Small label="Jitter" value={`${summary.timingJitterMs.toFixed(0)} ms`} />
        </div>
      )}

      {summary && (
        <div style={{ fontSize: 12, opacity: 0.85 }}>
          Missed: {misses} • Extra: {extras} • Median offset: {summary.medianTimingErrorMs.toFixed(0)} ms • Bias:{' '}
          {offsetLabel}
        </div>
      )}

      <div>
        <h4 style={{ margin: '8px 0 4px 0' }}>Achievements</h4>
        {achievements.length === 0 ? (
          <p style={{ opacity: 0.8, margin: 0 }}>No new achievements this run — keep shredding!</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {achievements.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: '1px solid #2d2d2d',
        borderRadius: 8,
        padding: '8px 10px',
        background: '#0b0b0b',
      }}
    >
      <div style={{ fontSize: 11, opacity: 0.7 }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Small({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: '1px solid #2d2d2d',
        borderRadius: 6,
        padding: '6px 8px',
        background: '#0b0b0b',
      }}
    >
      <div style={{ fontSize: 11, opacity: 0.7 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}
