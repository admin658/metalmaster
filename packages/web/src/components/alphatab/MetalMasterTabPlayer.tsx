'use client';

import * as alphaTab from '@coderline/alphatab';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { applyMetalContainerStyles, attachMetalTheme } from './metalTheme';

type MetalMasterTabPlayerProps = {
  scoreUrl?: string;
  scoreData?: string | ArrayBuffer;
  alphaTex?: string;
  soundFontUrl?: string;
  className?: string;
  header?: ReactNode;
  disableTheme?: boolean;
};

const formatDuration = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const requiredColor = (hex: string) => alphaTab.model.Color.fromJson(hex) ?? new alphaTab.model.Color(0, 0, 0, 255);

const applyScoreColors = (score: alphaTab.model.Score) => {
  const fretColors: Record<number, alphaTab.model.Color> = {
    12: requiredColor('#bb4648'),
    13: requiredColor('#ab519f'),
    14: requiredColor('#3953a5'),
    15: requiredColor('#70ccd6'),
    16: requiredColor('#6abd45'),
    17: requiredColor('#e1a90e'),
  };

  score.style = new alphaTab.model.ScoreStyle();
  score.style.colors.set(alphaTab.model.ScoreSubElement.Title, requiredColor('#426d9d'));
  score.style.colors.set(alphaTab.model.ScoreSubElement.Artist, requiredColor('#4cb3d4'));

  for (const track of score.tracks) {
    for (const staff of track.staves) {
      for (const bar of staff.bars) {
        for (const voice of bar.voices) {
          for (const beat of voice.beats) {
            if (beat.hasTuplet) {
              beat.style = new alphaTab.model.BeatStyle();
              const color = requiredColor('#00DD00');
              beat.style.colors.set(alphaTab.model.BeatSubElement.StandardNotationTuplet, color);
              beat.style.colors.set(alphaTab.model.BeatSubElement.StandardNotationBeams, color);
            }

            for (const note of beat.notes) {
              const color = fretColors[note.fret];
              if (!color) continue;
              note.style = new alphaTab.model.NoteStyle();
              note.style.colors.set(alphaTab.model.NoteSubElement.StandardNotationNoteHead, color);
              note.style.colors.set(alphaTab.model.NoteSubElement.GuitarTabFretNumber, color);
            }
          }
        }
      }
    }
  }
};

/**
 * MetalMasterTabPlayer
 * A focused, high-contrast tab player built on alphaTab.
 * - Loads Guitar Pro or AlphaTex.
 * - Provides play/pause/stop, loop, metronome, count-in.
 * - Track selector, zoom and layout controls.
 * - Metal-styled cursors/highlights via CSS.
 */
export function MetalMasterTabPlayer({
  scoreUrl,
  scoreData,
  alphaTex,
  soundFontUrl = '/alphatab/soundfont/sonivox.sf2',
  className,
  header,
  disableTheme = true,
}: MetalMasterTabPlayerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<alphaTab.AlphaTabApi | null>(null);

  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoadingScore, setIsLoadingScore] = useState(true);
  const [soundFontProgress, setSoundFontProgress] = useState<number | null>(null);
  const [tracks, setTracks] = useState<alphaTab.model.Track[]>([]);
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);
  const [position, setPosition] = useState<{ current: number; end: number }>({
    current: 0,
    end: 0,
  });
  const [zoom, setZoom] = useState(0.5);
  const [layoutMode, setLayoutMode] = useState<'page' | 'horizontal'>('page');
  const [error, setError] = useState<string | null>(null);

  const selectedTrack = useMemo(() => tracks[activeTrackIndex] ?? null, [tracks, activeTrackIndex]);

  // Initialize alphaTab once on mount.
  useEffect(() => {
    if (!hostRef.current) return;

    setReady(false);
    setIsLoadingScore(true);
    setError(null);

    const api = new alphaTab.AlphaTabApi(hostRef.current, {
      core: {
        ...(alphaTex ? { tex: true } : {}),
        file: scoreUrl,
        fontDirectory: '/alphatab/font/',
      },
      player: {
        enablePlayer: false, // Temporarily disable to test rendering
        soundFont: soundFontUrl,
        scrollElement: hostRef.current,
      },
      display: {
        scale: zoom,
        layoutMode: alphaTab.LayoutMode.Horizontal,
      },
    });
    apiRef.current = api;

    const applyColors = (score: alphaTab.model.Score) => {
      score.style = new alphaTab.model.ScoreStyle();
      score.style.colors.set(
        alphaTab.model.ScoreSubElement.Title,
        requiredColor('#426d9d')
      );
      score.style.colors.set(
        alphaTab.model.ScoreSubElement.Artist,
        requiredColor('#4cb3d4')
      );

      const fretColors: Record<number, alphaTab.model.Color> = {
        12: requiredColor('#bb4648'),
        13: requiredColor('#ab519f'),
        14: requiredColor('#3953a5'),
        15: requiredColor('#70ccd6'),
        16: requiredColor('#6abd45'),
        17: requiredColor('#e1a90e'),
      };

      for (const track of score.tracks) {
        for (const staff of track.staves) {
          for (const bar of staff.bars) {
            for (const voice of bar.voices) {
              for (const beat of voice.beats) {
                if (beat.hasTuplet) {
                  beat.style = new alphaTab.model.BeatStyle();
                  const color = requiredColor('#00DD00');
                  beat.style.colors.set(alphaTab.model.BeatSubElement.StandardNotationTuplet, color);
                  beat.style.colors.set(alphaTab.model.BeatSubElement.StandardNotationBeams, color);
                }
                for (const note of beat.notes) {
                  const color = fretColors[note.fret];
                  if (!color) continue;
                  note.style = new alphaTab.model.NoteStyle();
                  note.style.colors.set(alphaTab.model.NoteSubElement.StandardNotationNoteHead, color);
                  note.style.colors.set(alphaTab.model.NoteSubElement.GuitarTabFretNumber, color);
                }
              }
            }
          }
        }
      }
    };

    // Theme is disabled by default; opt-in via disableTheme={false}
    if (!disableTheme) {
      attachMetalTheme(api, alphaTab);
      applyMetalContainerStyles(hostRef.current);
    }

    const onPlayerReady = () => {
      setReady(true);
      setIsLooping(Boolean(api.isLooping));
      setIsLoadingScore(false);
    };
    const onScoreLoaded = (score: alphaTab.model.Score) => {
      applyColors(score);
      setTracks(score.tracks ?? []);
      setActiveTrackIndex(0);
      setIsLoadingScore(false);
      setReady(true); // Set ready when score loads
      // Default render all tracks.
      if (score.tracks?.length) {
        api.renderTracks(score.tracks);
        api.render();
      }
    };
    const onPlayerStateChanged = (e: alphaTab.synth.PlayerStateChangedEventArgs) => {
      setIsPlaying(e.state === alphaTab.synth.PlayerState.Playing);
    };
    const onPositionChanged = (e: alphaTab.synth.PositionChangedEventArgs) => {
      setPosition({ current: e.currentTime, end: e.endTime });
    };
    const onSoundFontLoad = (e: { loaded: number; total: number }) => {
      const pct = Math.floor((e.loaded / e.total) * 100);
      setSoundFontProgress(pct);
    };
    const onError = (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err ?? 'Unknown error');
      console.error('[MetalMasterTabPlayer] alphaTab error', err);
      setError(message);
      setIsLoadingScore(false);
    };

    api.playerReady.on(onPlayerReady);
    api.scoreLoaded.on(onScoreLoaded);
    api.playerStateChanged.on(onPlayerStateChanged);
    api.playerPositionChanged.on(onPositionChanged);
    api.soundFontLoad.on(onSoundFontLoad);
    api.error.on(onError);

    // Load content when mounted.
    if (alphaTex) {
      api.tex(alphaTex);
    } else if (scoreData) {
      api.load(scoreData);
    } else if (scoreUrl) {
      api.load(scoreUrl);
    }

    return () => {
      api.playerReady.off(onPlayerReady);
      api.scoreLoaded.off(onScoreLoaded);
      api.playerStateChanged.off(onPlayerStateChanged);
      api.playerPositionChanged.off(onPositionChanged);
      api.soundFontLoad.off(onSoundFontLoad);
      api.error.off(onError);
      api.destroy();
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when source changes.
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    setIsLoadingScore(true);
    setReady(false);
    if (alphaTex) {
      api.settings.core.tex = true;
      api.tex(alphaTex);
    } else if (scoreData) {
      if (typeof scoreData === 'string') {
        api.settings.core.file = scoreData;
      }
      api.load(scoreData);
    } else if (scoreUrl) {
      api.settings.core.file = scoreUrl;
      api.load(scoreUrl);
    } else {
      // Load default alphaTex for testing
      api.settings.core.tex = true;
      api.tex('\\title "Test" \\tempo 120 . 1.1 2.2 3.3');
    }
  }, [scoreUrl, scoreData, alphaTex]);

  const handlePlayPause = () => {
    if (!apiRef.current || !ready) return;
    apiRef.current.playPause();
  };
  const handleStop = () => {
    if (!apiRef.current || !ready) return;
    apiRef.current.stop();
  };
  const handleLoopToggle = () => {
    const api = apiRef.current;
    if (!api) return;
    const next = !isLooping;
    api.isLooping = next;
    setIsLooping(next);
  };
  const handleMetronomeToggle = () => {
    const api = apiRef.current;
    if (!api) return;
    api.metronomeVolume = api.metronomeVolume > 0 ? 0 : 1;
  };
  const handleCountInToggle = () => {
    const api = apiRef.current;
    if (!api) return;
    api.countInVolume = api.countInVolume > 0 ? 0 : 1;
  };
  const handleTrackSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    setActiveTrackIndex(idx);
    const api = apiRef.current;
    const track = tracks[idx];
    if (api && track) {
      api.renderTracks([track]);
      api.render();
    }
  };
  const handleZoomChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setZoom(value);
    const api = apiRef.current;
    if (api) {
      api.settings.display.scale = value;
      api.updateSettings();
      api.render();
    }
  };
  const handleLayoutChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as 'page' | 'horizontal';
    setLayoutMode(mode);
    const api = apiRef.current;
    if (api) {
      api.settings.display.layoutMode =
        mode === 'page' ? alphaTab.LayoutMode.Page : alphaTab.LayoutMode.Horizontal;
      api.updateSettings();
      api.render();
    }
  };

  return (
    <div className={['metal-tab-player', className].filter(Boolean).join(' ')}>
      {header}
      <div className="metal-controls">
        <div className="control-group">
          <button onClick={handlePlayPause} disabled={!ready || isLoadingScore}>
            {isLoadingScore ? 'Loading…' : isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={handleStop} disabled={!ready || isLoadingScore}>
            Stop
          </button>
          <button
            onClick={handleLoopToggle}
            className={isLooping ? 'active' : ''}
            disabled={!ready || isLoadingScore}
          >
            Loop
          </button>
          <button onClick={handleMetronomeToggle} disabled={!ready || isLoadingScore}>
            Metronome
          </button>
          <button onClick={handleCountInToggle} disabled={!ready || isLoadingScore}>
            Count-in
          </button>
        </div>
        <div className="control-group">
          <label>
            Track
            <select
              value={activeTrackIndex}
              onChange={handleTrackSelect}
              disabled={tracks.length === 0}
            >
              {tracks.map((track, idx) => (
                <option key={track.index ?? idx} value={idx}>
                  {track.name || `Track ${idx + 1}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            Zoom
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={zoom}
              onChange={handleZoomChange}
              disabled={!ready}
            />
            <span className="value">{Math.round(zoom * 100)}%</span>
          </label>
          <label>
            Layout
            <select value={layoutMode} onChange={handleLayoutChange} disabled={!ready}>
              <option value="page">Page</option>
              <option value="horizontal">Horizontal</option>
            </select>
          </label>
        </div>
        <div className="control-group now-playing">
          <span>
            {formatDuration(position.current)} / {formatDuration(position.end)}
          </span>
          {soundFontProgress !== null && !ready && (
            <span className="loading">SoundFont: {soundFontProgress}%</span>
          )}
        </div>
      </div>

      <div ref={hostRef} className="metal-viewport" />

      {error && <div className="error-banner">alphaTab error: {error}</div>}

      <style jsx>{`
        .metal-tab-player {
          --metal-bg: #0b0b0f;
          --metal-panel: #15151f;
          --metal-border: #2c2c3a;
          --metal-accent: #ff7800;
          --metal-text: #e8e8ef;
          --metal-muted: #9ea0b3;
          background: var(--metal-bg);
          color: var(--metal-text);
          border: 1px solid var(--metal-border);
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .metal-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: var(--metal-panel);
          border: 1px solid var(--metal-border);
          border-radius: 8px;
          padding: 10px;
        }
        .control-group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
        }
        .control-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--metal-muted);
        }
        .control-group select,
        .control-group input[type='range'] {
          background: #0f0f18;
          color: var(--metal-text);
          border: 1px solid var(--metal-border);
          border-radius: 6px;
          padding: 6px;
        }
        .control-group .value {
          min-width: 42px;
          text-align: right;
          color: var(--metal-text);
        }
        .control-group button {
          background: #1e1e2b;
          color: var(--metal-text);
          border: 1px solid var(--metal-border);
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .control-group button:hover:not(:disabled) {
          border-color: var(--metal-accent);
        }
        .control-group button.active {
          background: rgba(255, 120, 0, 0.15);
          border-color: var(--metal-accent);
        }
        .control-group button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .now-playing {
          color: var(--metal-muted);
          font-size: 13px;
          justify-content: space-between;
        }
        .loading {
          color: var(--metal-accent);
          font-weight: 600;
        }
        .metal-viewport {
          background: #0f0f18;
          border: 1px solid var(--metal-border);
          border-radius: 8px;
          padding: 12px;
          min-height: 320px;
          max-height: 70vh;
          overflow: auto;
        }
        /* Make tab numbers visible */
        .metal-viewport svg text {
          fill: #ff7800 !important;
        }
        .error-banner {
          background: #301010;
          border: 1px solid #ff4d4d;
          color: #ffb3b3;
          padding: 10px;
          border-radius: 6px;
        }
        /* Playback overlays from alphaTab (guides/styling-player.mdx) */
        .metal-viewport .at-cursor-bar {
          background: rgba(255, 120, 0, 0.2);
        }
        .metal-viewport .at-cursor-beat {
          background: #ff7800;
          width: 3px;
        }
        .metal-viewport .at-selection div {
          background: rgba(120, 200, 255, 0.18);
        }
        .metal-viewport .at-highlight * {
          fill: #ff7800;
          stroke: #ff7800;
        }
      `}</style>
    </div>
  );
}

export default MetalMasterTabPlayer;
