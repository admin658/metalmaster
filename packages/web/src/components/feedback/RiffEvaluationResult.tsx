import React from 'react';

type Props = {
  accuracy: number;
  xp: number;
  achievements: string[];
};

export default function RiffEvaluationResult({ accuracy, xp, achievements }: Props) {
  return (
    <div
      style={{
        background: '#111',
        padding: 20,
        color: 'white',
        border: '1px solid #333',
        borderRadius: 8,
        fontFamily: 'monospace',
      }}
    >
      <h2>Riff Complete!</h2>
      <p>Accuracy: {accuracy.toFixed(1)}%</p>
      <p>XP Earned: {xp}</p>
      <h3>Achievements:</h3>
      {achievements.length === 0 ? (
        <p style={{ opacity: 0.8 }}>No new achievements this run — keep shredding!</p>
      ) : (
        <ul>
          {achievements.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
