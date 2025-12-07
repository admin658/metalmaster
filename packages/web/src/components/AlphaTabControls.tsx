// packages/web/src/components/AlphaTabControls.tsx
"use client";

import React, { useEffect, useState } from "react";

interface AlphaTabControlsProps {
  api: any | null;
  score: any | null;
}

const AlphaTabControls: React.FC<AlphaTabControlsProps> = ({ api, score }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);
  const [metronome, setMetronome] = useState(false);

  // update playing status
  useEffect(() => {
    if (!api) return;
    api.playerStateChanged.on((state: any) => {
      setIsPlaying(state.isPlaying);
    });
  }, [api]);

  const handlePlayPause = () => api?.playPause();
  const handleStop = () => api?.stop();

  const handleSpeedChange = (v: number) => {
    setSpeed(v);
    if (api) api.playbackSpeed = v;
  };

  const handleLoopToggle = () => {
    const newState = !loop;
    setLoop(newState);
    if (api) api.isLooping = newState;
  };

  const handleMetronomeToggle = () => {
    const newState = !metronome;
    setMetronome(newState);
    if (api) api.metronomeVolume = newState ? 1 : 0;
  };

  const handleSolo = (i: number) => api?.changeTrackSolo([score.tracks[i]], true);
  const handleMute = (i: number) => api?.changeTrackMute([score.tracks[i]], true);

  const handleSectionJump = (i: number) => api?.playBeat(i, 0);

  const sections =
    score?.masterBars
      ?.map((bar: any, i: number) =>
        bar.section ? { name: bar.section.text, index: i } : null
      )
      .filter(Boolean) || [];

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-4 flex flex-col gap-4 shadow-lg">
      {/* TOP ROW */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 font-bold"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          onClick={handleStop}
          className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 font-bold"
        >
          Stop
        </button>

        <button
          onClick={handleLoopToggle}
          className={`px-3 py-2 rounded font-bold ${
            loop ? "bg-red-700" : "bg-zinc-700 hover:bg-zinc-600"
          }`}
        >
          Loop
        </button>

        <button
          onClick={handleMetronomeToggle}
          className={`px-3 py-2 rounded font-bold ${
            metronome ? "bg-red-700" : "bg-zinc-700 hover:bg-zinc-600"
          }`}
        >
          Metronome
        </button>
      </div>

      {/* SPEED SLIDER */}
      <div className="flex flex-col">
        <label className="text-xs text-red-400 font-bold">
          Speed: {Math.round(speed * 100)}%
        </label>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.01"
          value={speed}
          onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
          className="accent-red-600 w-full"
        />
      </div>

      {/* TRACK CONTROLS */}
      {score && (
        <div className="border-t border-zinc-700 pt-3">
          <h3 className="text-red-400 font-bold mb-2">Tracks</h3>
          {score.tracks.map((t: any, i: number) => (
            <div
              key={i}
              className="flex items-center justify-between bg-zinc-800 px-3 py-2 rounded mb-2"
            >
              <span className="font-bold">{t.name || `Track ${i + 1}`}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSolo(i)}
                  className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700"
                >
                  Solo
                </button>
                <button
                  onClick={() => handleMute(i)}
                  className="px-2 py-1 text-xs rounded bg-zinc-600 hover:bg-zinc-500"
                >
                  Mute
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION NAVIGATION */}
      {sections.length > 0 && (
        <div className="border-t border-zinc-700 pt-3">
          <h3 className="text-red-400 font-bold mb-2">Sections</h3>
          <select
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
            onChange={(e) => handleSectionJump(Number(e.target.value))}
          >
            <option>Jump to section...</option>
            {sections.map((s: any, i: number) => (
              <option key={i} value={s.index}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default AlphaTabControls;
