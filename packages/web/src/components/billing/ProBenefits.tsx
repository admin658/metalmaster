import React from 'react';

export const ProBenefits: React.FC = () => {
  const benefits = [
    'Daily Riff every day',
    'Unlimited Speed Trainer sessions',
    'Full practice heatmap',
    'AI Tone Assistant',
    'AI Feedback & Tab Generator',
  ];

  return (
    <ul className="space-y-2">
      {benefits.map((b) => (
        <li key={b} className="flex items-start gap-3 text-gray-200">
          <span className="text-red-500">✓</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
};

export default ProBenefits;
