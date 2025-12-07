import React from 'react';

interface Props { daysLeft?: number }

export const TrialBadge: React.FC<Props> = ({ daysLeft }) => {
  if (typeof daysLeft !== 'number') return null;
  return (
    <div className="inline-block bg-yellow-500 text-black px-2 py-1 rounded text-xs font-semibold">
      🔥 Trial Active – {daysLeft} days left
    </div>
  );
};

export default TrialBadge;
