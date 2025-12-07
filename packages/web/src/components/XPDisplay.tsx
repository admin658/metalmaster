import React, { useEffect, useRef, useState } from 'react';
import './XPDisplay.css';

const TIER_ICONS = [
  '🥉', // Bronze
  '🥈', // Silver
  '🥇', // Gold
  '🏆', // Platinum
];

function getTier(level: number) {
  if (level >= 30) return 3;
  if (level >= 20) return 2;
  if (level >= 10) return 1;
  return 0;
}

interface XPDisplayProps {
  xp: number;
  level: number;
  xpToNext: number;
  onLevelUp?: (level: number) => void;
}

export const XPDisplay = ({ xp, level, xpToNext, onLevelUp }: XPDisplayProps) => {
  const [progress, setProgress] = useState(xp / xpToNext);
  const [spark, setSpark] = useState(false);
  const prevLevel = useRef(level);

  useEffect(() => {
    setProgress(xp / xpToNext);
    if (level > prevLevel.current) {
      setSpark(true);
      if (onLevelUp) onLevelUp(level);
      setTimeout(() => setSpark(false), 1200);
    }
    prevLevel.current = level;
  }, [xp, level, xpToNext, onLevelUp]);

  const tier = getTier(level);

  return (
    <div className="xp-container">
      <div className="xp-header">
        <span className="xp-tier-icon">{TIER_ICONS[tier]}</span>
        <span className="xp-level">Lv. {level}</span>
      </div>
      <div className="xp-bar-bg">
        <div
          className={`xp-bar-fill${spark ? ' xp-bar-spark' : ''}`}
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>
      <div className="xp-labels">
        <span>{xp} XP</span>
        <span>{xpToNext} XP to next</span>
      </div>
      {spark && <div className="xp-spark-effect" />}
    </div>
  );
};

// XPDisplay.css (place in the same folder):
/*
.xp-container {
  background: #1a1a1a;
  border-radius: 14px;
  padding: 18px 24px;
  color: #fff;
  box-shadow: 0 2px 12px #d9042940;
  width: 320px;
  margin: 16px auto;
  position: relative;
}
.xp-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.xp-tier-icon {
  font-size: 2rem;
  margin-right: 10px;
}
.xp-level {
  font-size: 1.3rem;
  font-weight: bold;
  letter-spacing: 1px;
}
.xp-bar-bg {
  background: #333;
  border-radius: 8px;
  height: 18px;
  overflow: hidden;
  margin-bottom: 8px;
}
.xp-bar-fill {
  background: linear-gradient(90deg, #d90429 60%, #ffb700 100%);
  height: 100%;
  border-radius: 8px 0 0 8px;
  transition: width 0.7s cubic-bezier(.4,2,.3,1);
}
.xp-bar-spark {
  box-shadow: 0 0 16px 6px #fffbe6, 0 0 32px 12px #d90429;
  animation: spark 1.2s linear;
}
@keyframes spark {
  0% { filter: brightness(1.5); }
  50% { filter: brightness(2.5); }
  100% { filter: brightness(1); }
}
.xp-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  opacity: 0.85;
}
.xp-spark-effect {
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  pointer-events: none;
  background: radial-gradient(circle, #fffbe6 0%, #d9042900 70%);
  opacity: 0.5;
  animation: spark-fade 1.2s linear;
}
@keyframes spark-fade {
  0% { opacity: 0.7; }
  100% { opacity: 0; }
}
*/
