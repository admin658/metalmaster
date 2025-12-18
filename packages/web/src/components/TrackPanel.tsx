'use client';

import * as alphaTab from '@coderline/alphatab';
import { useState } from 'react';

interface TrackPanelProps {
  tracks: alphaTab.model.Track[];
  api: alphaTab.AlphaTabApi | null;
  selectedTrackIndex?: number | null;
  viewOnlyTrackIndex?: number | null;
  onSelectTrack?: (index: number) => void;
}

export default function TrackPanel({
  tracks,
  api,
  selectedTrackIndex,
  viewOnlyTrackIndex,
  onSelectTrack,
}: TrackPanelProps) {
  const [soloedTracks, setSoloedTracks] = useState<Set<number>>(new Set());
  const [mutedTracks, setMutedTracks] = useState<Set<number>>(new Set());
  const [trackVolumes, setTrackVolumes] = useState<Record<number, number>>({});

  const getTrack = (trackIndex: number) => {
    return tracks?.[trackIndex];
  };

  const handleSolo = (trackIndex: number) => {
    const track = getTrack(trackIndex);
    if (!api || !track) return;

    const next = new Set(soloedTracks);
    if (next.has(trackIndex)) {
      next.delete(trackIndex);
    } else {
      next.add(trackIndex);
    }
    setSoloedTracks(next);
    api.changeTrackSolo([track], next.has(trackIndex));
  };

  const handleMute = (trackIndex: number) => {
    const track = getTrack(trackIndex);
    if (!api || !track) return;

    const next = new Set(mutedTracks);
    if (next.has(trackIndex)) {
      next.delete(trackIndex);
    } else {
      next.add(trackIndex);
    }
    setMutedTracks(next);
    api.changeTrackMute([track], next.has(trackIndex));
  };

  const handleVolumeChange = (trackIndex: number, volume: number) => {
    const track = getTrack(trackIndex);
    if (!api || !track) return;

    const nextVolumes = { ...trackVolumes, [trackIndex]: volume };
    setTrackVolumes(nextVolumes);
    api.changeTrackVolume([track], volume / 100);
  };

  const handleTranspose = (trackIndex: number, semitones: number) => {
    const track = getTrack(trackIndex);
    if (!api || !track) return;
    api.changeTrackTranspositionPitch([track], semitones);
  };

  const handleSelectTrack = (trackIndex: number) => {
    if (onSelectTrack) onSelectTrack(trackIndex);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-l border-red-900/30">
      <div className="px-4 py-3 border-b border-red-900/30">
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Tracks</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tracks.map((track, idx) => (
          <div key={idx} className="px-3 py-3 border-b border-zinc-800/40 hover:bg-zinc-900/50">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-zinc-100 truncate">
                    {track.name || `Track ${idx + 1}`}
                  </p>
                  {viewOnlyTrackIndex === idx && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white whitespace-nowrap">
                      View Only
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">Staff 1</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleSelectTrack(idx)}
                  className={`p-1.5 rounded text-xs font-bold transition ${
                    selectedTrackIndex === idx
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                  title="Show only this track"
                >
                  View
                </button>
                <button
                  onClick={() => handleSolo(idx)}
                  className={`p-1.5 rounded text-xs font-bold transition ${
                    soloedTracks.has(idx)
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                  title="Solo this track"
                >
                  Solo
                </button>
                <button
                  onClick={() => handleMute(idx)}
                  className={`p-1.5 rounded text-xs font-bold transition ${
                    mutedTracks.has(idx)
                      ? 'bg-zinc-700 text-zinc-400'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                  title="Mute this track"
                >
                  Mute
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-zinc-400">Volume</label>
                  <span className="text-xs text-zinc-500">{trackVolumes[idx] ?? 100}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={trackVolumes[idx] ?? 100}
                  onChange={(e) => handleVolumeChange(idx, parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Transpose</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleTranspose(idx, -1)}
                    className="flex-1 px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 rounded transition text-zinc-300"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => handleTranspose(idx, 1)}
                    className="flex-1 px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 rounded transition text-zinc-300"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
