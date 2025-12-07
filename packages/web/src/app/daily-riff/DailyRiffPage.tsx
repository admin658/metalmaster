import React from 'react';

interface DailyRiffPageProps {
  riff?: any;
  completed?: boolean;
  xp_earned?: number;
  xp_reward?: number;
  onComplete?: () => void;
}

export const DailyRiffPage: React.FC<DailyRiffPageProps> = ({ 
  riff, 
  completed = false, 
  xp_earned = 0, 
  xp_reward = 0, 
  onComplete 
}) => (
  <div style={{ background: '#111', minHeight: '100vh', color: '#fff', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <div style={{ background: '#1A1A1A', borderRadius: 18, padding: 40, border: '2px solid #D90429', boxShadow: '0 2px 12px #D9042940', minWidth: 320, maxWidth: 400 }}>
      <div style={{ color: '#D90429', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', marginBottom: 8 }}>Daily Riff</div>
      <div style={{ color: '#fff', fontWeight: 900, fontSize: 28, marginBottom: 6 }}>{riff?.title || 'No Riff Today'}</div>
      <div style={{ color: '#ccc', fontSize: 16, marginBottom: 10 }}>{riff?.artist}</div>
      <div style={{ color: '#FFD700', fontWeight: 700, marginBottom: 10 }}>XP Reward: {xp_reward}</div>
      {completed ? (
        <div style={{ color: '#4ade80', fontWeight: 700, fontSize: 18, marginTop: 10 }}>Completed! +{xp_earned} XP</div>
      ) : (
        <button
          style={{ background: 'linear-gradient(90deg, #FFD700 60%, #D90429 100%)', color: '#1A1A1A', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 8, padding: '12px 32px', marginTop: 8, cursor: 'pointer', boxShadow: '0 0 12px #FFD70088' }}
          onClick={onComplete}
        >
          Mark as Complete
        </button>
      )}
    </div>
  </div>
);

// Usage: <DailyRiffPage riff={riff} completed={completed} xp_earned={xp_earned} xp_reward={xp_reward} onComplete={...} />
