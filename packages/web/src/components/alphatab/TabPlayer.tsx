'use client';

import * as alphaTab from '@coderline/alphatab';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

interface TabPlayerProps {
  source: string | ArrayBuffer;
}

const applyColors = (score: alphaTab.model.Score) => {
  // Create custom style on score level.
  score.style = new alphaTab.model.ScoreStyle();
  score.style.colors.set(
    alphaTab.model.ScoreSubElement.Title,
    alphaTab.model.Color.fromJson('#426d9d')
  );
  score.style.colors.set(
    alphaTab.model.ScoreSubElement.Artist,
    alphaTab.model.Color.fromJson('#4cb3d4')
  );

  const fretColors: Record<number, alphaTab.model.Color> = {
    12: alphaTab.model.Color.fromJson('#bb4648'),
    13: alphaTab.model.Color.fromJson('#ab519f'),
    14: alphaTab.model.Color.fromJson('#3953a5'),
    15: alphaTab.model.Color.fromJson('#70ccd6'),
    16: alphaTab.model.Color.fromJson('#6abd45'),
    17: alphaTab.model.Color.fromJson('#e1a90e'),
  };

  // Traverse hierarchy and apply colors as desired.
  for (const track of score.tracks) {
    for (const staff of track.staves) {
      for (const bar of staff.bars) {
        for (const voice of bar.voices) {
          for (const beat of voice.beats) {
            if (beat.hasTuplet) {
              beat.style = new alphaTab.model.BeatStyle();
              const color = alphaTab.model.Color.fromJson('#00DD00');
              beat.style.colors.set(
                alphaTab.model.BeatSubElement.StandardNotationTuplet,
                color
              );
              beat.style.colors.set(
                alphaTab.model.BeatSubElement.StandardNotationBeams,
                color
              );
            }

            for (const note of beat.notes) {
              const color = fretColors[note.fret];
              if (!color) continue;
              note.style = new alphaTab.model.NoteStyle();
              note.style.colors.set(
                alphaTab.model.NoteSubElement.StandardNotationNoteHead,
                color
              );
              note.style.colors.set(
                alphaTab.model.NoteSubElement.GuitarTabFretNumber,
                color
              );
            }
          }
        }
      }
    }
  }
};

const GM_INSTRUMENTS: Array<{ label: string; program: number }> = [
  { label: 'Distortion Guitar', program: 30 },
  { label: 'Overdriven Guitar', program: 29 },
  { label: 'Electric Guitar (clean)', program: 27 },
  { label: 'Acoustic Guitar (steel)', program: 25 },
  { label: 'Rock Organ', program: 19 },
  { label: 'Synth Lead', program: 80 },
  { label: 'Square Lead', program: 81 },
  { label: 'Saw Lead', program: 82 },
  { label: 'Muted Trumpet', program: 59 },
  { label: 'Choir Aahs', program: 52 },
];

// Reset TabPlayer: standard controls + MIDI routing, minimal styling for readability.
export default function TabPlayer({ source }: TabPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const midiOutputRef = useRef<MIDIOutput | null>(null);

  const [api, setApi] = useState<alphaTab.AlphaTabApi | null>(null);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingScore, setIsLoadingScore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tracks, setTracks] = useState<alphaTab.model.Track[]>([]);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [looping, setLooping] = useState(false);
  const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null);
  const [midiOutput, setMidiOutput] = useState<MIDIOutput | null>(null);
  const [midiProgram, setMidiProgram] = useState<number>(30); // Distortion Guitar

  useEffect(() => {
    midiOutputRef.current = midiOutput;
  }, [midiOutput]);

  const sendProgramChange = (program: number) => {
    const output = midiOutputRef.current;
    if (!output) return;
    // Send program change on all channels to keep things in sync
    for (let ch = 0; ch < 16; ch += 1) {
      output.send([0xc0 | ch, program]);
    }
  };
  // Send initial program when output becomes available
  useEffect(() => {
    if (midiOutput) {
      sendProgramChange(midiProgram);
    }
  }, [midiOutput]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize alphaTab
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    setReady(false);
    setIsLoadingScore(true);
    setTracks([]);
    setError(null);

    const settings = new alphaTab.Settings();
    // Core paths
    settings.core.useWorkers = false;
    settings.core.scriptFile = '/alphatab/alphaTab.js';
    settings.core.workerFile = '/alphatab/alphaTab.worker.min.mjs';
    settings.core.fontDirectory = '/alphatab/font/';
    const smuflFontSources =
      (alphaTab as any)?.model?.CoreSettings?.buildDefaultSmuflFontSources?.('/alphatab/font/');
    if (smuflFontSources) settings.core.smuflFontSources = smuflFontSources;

    // Player
    settings.player.enablePlayer = true;
    settings.player.playerMode = alphaTab.PlayerMode.Enabled;
    settings.player.soundFont = '/alphatab/soundfont/sonivox.sf2';

    const alpha = new alphaTab.AlphaTabApi(containerRef.current, settings);
    setApi(alpha);

    const handlePlayerReady = () => {
      setReady(true);
      setPlaybackSpeed(alpha.playbackSpeed ?? 1);
      setLooping(Boolean(alpha.isLooping));
      setIsLoadingScore(false);
    };

    const handleScoreLoaded = (score: alphaTab.model.Score) => {
      applyColors(score);
      setTracks(score.tracks ?? []);
      setIsLoadingScore(false);
      // In case playerReady didn't fire (e.g., player disabled), allow controls after load
      setReady(true);
      setSelectedTrackIndex(0);
      if (score.tracks && score.tracks[0]) {
        try {
          alpha.renderTracks([score.tracks[0]]);
          alpha.render();
        } catch (err) {
          handleError(err);
        }
      }
    };

    const handlePlayerStateChanged = (e: alphaTab.synth.PlayerStateChangedEventArgs) => {
      setIsPlaying(e.state === alphaTab.synth.PlayerState.Playing);
    };

    const handleMidiEventsPlayed = (e: alphaTab.synth.MidiEventsPlayedEventArgs) => {
      const output = midiOutputRef.current;
      if (!output) return;
      for (const midiEvent of e.events) {
        if (midiEvent instanceof alphaTab.midi.NoteOnEvent) {
          output.send([0x90 | midiEvent.channel, midiEvent.noteKey, midiEvent.noteVelocity]);
        } else if (midiEvent instanceof alphaTab.midi.NoteOffEvent) {
          output.send([0x80 | midiEvent.channel, midiEvent.noteKey, 0]);
        }
      }
    };

    const handleError = (e: any) => {
      const message = e?.message || (typeof e === 'string' ? e : 'Unknown error');
      console.error('[alphaTab error]', e);
      setError(message);
      setIsLoadingScore(false);
    };

    alpha.playerReady.on(handlePlayerReady);
    alpha.scoreLoaded.on(handleScoreLoaded);
    alpha.playerStateChanged.on(handlePlayerStateChanged);
    alpha.midiEventsPlayed.on(handleMidiEventsPlayed);
    alpha.error.on(handleError);

    try {
      alpha.load(source);
    } catch (e) {
      handleError(e);
    }

    return () => {
      alpha.playerReady.off(handlePlayerReady);
      alpha.scoreLoaded.off(handleScoreLoaded);
      alpha.playerStateChanged.off(handlePlayerStateChanged);
      alpha.midiEventsPlayed.off(handleMidiEventsPlayed);
      alpha.error.off(handleError);
      alpha.destroy();
    };
  }, [source]);

  // Initialize WebMIDI for routing
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) return;
    let cancelled = false;
    navigator
      .requestMIDIAccess()
      .then((access) => {
        if (cancelled) return;
        setMidiAccess(access);
        const outputs = Array.from(access.outputs.values());
        if (outputs.length > 0) setMidiOutput(outputs[0]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePlayPause = () => {
    if (!api || !ready || isLoadingScore) return;
    if (isPlaying) {
      api.playPause();
    } else if (typeof (api as any).play === 'function') {
      (api as any).play();
    } else {
      api.playPause();
    }
  };

  const handleStop = () => {
    if (api && ready) api.stop();
  };

  const handleToggleLoop = () => {
    if (!api) return;
    const next = !looping;
    api.isLooping = next;
    setLooping(next);
  };

  const handleSpeedChange = (e: ChangeEvent<HTMLInputElement>) => {
    const speed = parseFloat(e.target.value);
    setPlaybackSpeed(speed);
    if (api) api.playbackSpeed = speed;
  };

  const handleTrackVolume = (trackIndex: number, e: ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value) / 100;
    if (api && tracks[trackIndex]) {
      api.changeTrackVolume([tracks[trackIndex]], vol);
    }
  };

  const handleMidiOutputChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const output = midiAccess?.outputs.get(id) ?? null;
    setMidiOutput(output);
  };

  const handleMidiProgramChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const program = Number(e.target.value);
    setMidiProgram(program);
    sendProgramChange(program);
  };

  const handleTrackSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    setSelectedTrackIndex(idx);
    if (api && tracks[idx]) {
      api.renderTracks([tracks[idx]]);
      api.render();
    }
  };

  // Ensure current track selection is rendered when tracks arrive or selection changes.
  useEffect(() => {
    if (!api) return;
    const track = tracks[selectedTrackIndex];
    if (track) {
      api.renderTracks([track]);
      api.render();
    }
  }, [api, tracks, selectedTrackIndex]);

  return (
    <div className="tab-player">
      <div className="controls">
        <button onClick={handlePlayPause} disabled={!ready || isLoadingScore}>
          {isLoadingScore ? 'Loading…' : isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={handleStop} disabled={!ready || isLoadingScore}>
          Stop
        </button>
        <button onClick={handleToggleLoop} disabled={!ready || isLoadingScore}>
          {looping ? 'Loop: On' : 'Loop: Off'}
        </button>
        <label className="inline">
          Speed
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={playbackSpeed}
            onChange={handleSpeedChange}
            disabled={!ready || isLoadingScore}
          />
          <span>{(playbackSpeed * 100).toFixed(0)}%</span>
        </label>
        {midiAccess && (
          <label className="inline">
            MIDI Out
            <select onChange={handleMidiOutputChange} value={midiOutput?.id ?? ''}>
              <option value="">-- None --</option>
              {Array.from(midiAccess.outputs.values()).map((output) => (
                <option key={output.id} value={output.id}>
                  {output.name || output.id}
                </option>
              ))}
            </select>
          </label>
        )}
        {tracks.length > 0 && (
          <label className="inline">
            Track
            <select value={selectedTrackIndex} onChange={handleTrackSelectChange}>
              {tracks.map((track, idx) => (
                <option key={idx} value={idx}>
                  {track.name || `Track ${idx + 1}`}
                </option>
              ))}
            </select>
          </label>
        )}
        {midiOutput && (
          <label className="inline">
            Instrument
            <select value={midiProgram} onChange={handleMidiProgramChange}>
              {GM_INSTRUMENTS.map((inst) => (
                <option key={inst.program} value={inst.program}>
                  {inst.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {!midiAccess && (
          <span className="notice">WebMIDI not available in this browser.</span>
        )}
      </div>

      <div ref={containerRef} className="alphaTabContainer" id="alphaTabContainer"></div>

      {tracks.length > 0 && (
        <div className="mixer">
          {tracks.map((track, idx) => (
            <label key={idx} className="inline">
              {track.name || `Track ${idx + 1}`}
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="100"
                onChange={(e) => handleTrackVolume(idx, e)}
                disabled={!ready || isLoadingScore}
              />
            </label>
          ))}
        </div>
      )}

      {error && (
        <div className="error-banner">
          <strong>alphaTab error:</strong> {error}
        </div>
      )}

      <style jsx global>{`
        .tab-player {
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
          color: #111;
        }
        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          background: #f7f7f7;
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 6px;
        }
        .controls button {
          padding: 6px 12px;
          border: 1px solid #ccc;
          background: #fff;
          cursor: pointer;
          border-radius: 4px;
        }
        .controls button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .controls .inline {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
        }
        .controls select,
        .controls input[type='range'] {
          cursor: pointer;
        }
        .notice {
          font-size: 13px;
          color: #555;
        }
        .alphaTabContainer {
          background: #fff;
          color: #000;
          border: 1px solid #ccc;
          border-radius: 6px;
          min-height: 320px;
          padding: 8px;
          overflow: auto;
        }
        .mixer {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #f7f7f7;
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 6px;
        }
        .mixer .inline {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mixer input[type='range'] {
          flex: 1;
        }
        .error-banner {
          margin-top: 8px;
          padding: 10px;
          border: 1px solid #dc2626;
          background: #fef2f2;
          color: #991b1b;
          border-radius: 6px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
