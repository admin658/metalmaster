'use client';

import * as alphaTab from '@coderline/alphatab';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

interface TabPlayerProps {
  fileUrl: string;
}

// Next.js TabPlayer component integrating alphaTab with heavy-metal theme and optional WebMIDI routing.
export default function TabPlayer({ fileUrl }: TabPlayerProps) {
  const [api, setApi] = useState<alphaTab.AlphaTabApi | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [isLoadingScore, setIsLoadingScore] = useState(true);
  const [tracks, setTracks] = useState<alphaTab.model.Track[]>([]);
  const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null);
  const [midiOutput, setMidiOutput] = useState<MIDIOutput | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [scoreDurationTicks, setScoreDurationTicks] = useState<number | null>(null);
  const [looping, setLooping] = useState(false);
  const [loopStartPct, setLoopStartPct] = useState(0);
  const [loopEndPct, setLoopEndPct] = useState(100);
  const [midiEventCount, setMidiEventCount] = useState(0);
  const [midiMonitorEnabled, setMidiMonitorEnabled] = useState(false);
  const [lastMidiEvent, setLastMidiEvent] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const midiOutputRef = useRef<MIDIOutput | null>(null);
  const midiEventCountRef = useRef(0);

  useEffect(() => {
    midiOutputRef.current = midiOutput;
  }, [midiOutput]);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    setReady(false);
    setTracks([]);

    // Initialize alphaTab API on the container element.
    // Enable player and set a SoundFont for playback.
    const settings = {
      player: {
        enablePlayer: true,
        // Use local Sonivox soundfont packaged under /public/alphatab.
        soundFont: '/alphatab/soundfont/sonivox.sf2',
        // (Optional) scroll element can be specified for cursor scrolling.
        scrollElement: null,
      },
      display: {},
    } as unknown as alphaTab.Settings;
    const alpha = new alphaTab.AlphaTabApi(containerRef.current, settings);
    setApi(alpha);

    const handlePlayerReady = () => {
      setReady(true);
      setPlaybackSpeed(alpha.playbackSpeed ?? 1);
      setLooping(Boolean(alpha.isLooping));
      setIsLoadingScore(false);
    };

    const handleScoreLoaded = (score: alphaTab.model.Score) => {
      setTracks(score.tracks ?? []);
      // Calculate total duration in ticks from masterBars
      let totalTicks = 0;
      if (score.masterBars && score.masterBars.length > 0) {
        for (const masterBar of score.masterBars) {
          // Each masterBar has a timeSignatureNumerator and timeSignatureDenominator
          const numerator = masterBar.timeSignatureNumerator ?? 4;
          const denominator = masterBar.timeSignatureDenominator ?? 4;
          totalTicks += numerator * (960 / denominator);
        }
      }
      setScoreDurationTicks(totalTicks > 0 ? totalTicks : null);
      setIsLoadingScore(false);
    };

    const handlePlayerStateChanged = (e: alphaTab.synth.PlayerStateChangedEventArgs) => {
      setIsPlaying(e.state === alphaTab.synth.PlayerState.Playing);
    };

    // Route MIDI events to external MIDI device via WebMIDI if connected.
    const handleMidiEventsPlayed = (e: alphaTab.synth.MidiEventsPlayedEventArgs) => {
      for (const midiEvent of e.events) {
        const output = midiOutputRef.current;
        if (!output) continue;

        if (midiEvent instanceof alphaTab.midi.NoteOnEvent) {
          // Construct and send a MIDI Note On message: 0x90 + channel, noteKey, velocity.
          output.send([0x90 | midiEvent.channel, midiEvent.noteKey, midiEvent.noteVelocity]);

          // Monitor MIDI event (for UI feedback)
          if (midiMonitorEnabled) {
            midiEventCountRef.current++;
            setMidiEventCount(midiEventCountRef.current);
            setLastMidiEvent(
              `Note On: Key ${midiEvent.noteKey}, Velocity ${midiEvent.noteVelocity}, Channel ${midiEvent.channel}`
            );
          }
        }
        if (midiEvent instanceof alphaTab.midi.NoteOffEvent) {
          // Construct and send a MIDI Note Off message: 0x80 + channel, noteKey, release velocity (0).
          output.send([0x80 | midiEvent.channel, midiEvent.noteKey, 0]);

          // Monitor MIDI event (for UI feedback)
          if (midiMonitorEnabled) {
            midiEventCountRef.current++;
            setMidiEventCount(midiEventCountRef.current);
            setLastMidiEvent(`Note Off: Key ${midiEvent.noteKey}, Channel ${midiEvent.channel}`);
          }
        }
      }
    };

    alpha.playerReady.on(handlePlayerReady);
    alpha.scoreLoaded.on(handleScoreLoaded);
    alpha.playerStateChanged.on(handlePlayerStateChanged);
    alpha.midiEventsPlayed.on(handleMidiEventsPlayed);

    // Load the tab file into alphaTab (Guitar Pro or similar supported format).
    setIsLoadingScore(true);
    alpha.load(fileUrl);

    // Clean up on unmount.
    return () => {
      alpha.playerReady.off(handlePlayerReady);
      alpha.scoreLoaded.off(handleScoreLoaded);
      alpha.playerStateChanged.off(handlePlayerStateChanged);
      alpha.midiEventsPlayed.off(handleMidiEventsPlayed);
      alpha.destroy();
    };
  }, [fileUrl]);

  // Initialize WebMIDI access for routing MIDI to external devices.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
      // WebMIDI not supported - gracefully skip initialization
      return;
    }

    let cancelled = false;
    navigator
      .requestMIDIAccess()
      .then((access) => {
        if (cancelled) return;
        setMidiAccess(access);
        // Default to the first available MIDI output, if any.
        const outputs = Array.from(access.outputs.values());
        if (outputs.length > 0) {
          setMidiOutput(outputs[0]);
        }
      })
      .catch(() => {
        // MIDI access request denied or failed - continue without MIDI routing
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Handler for play/pause button.
  const handlePlayPause = () => {
    if (api && ready) api.playPause();
  };

  // Handler for stop button.
  const handleStop = () => {
    if (api && ready) api.stop();
    // Reset MIDI monitoring counters on stop
    midiEventCountRef.current = 0;
    setMidiEventCount(0);
    setLastMidiEvent(null);
  };

  // Toggle looping.
  const handleToggleLoop = () => {
    if (!api) return;
    const next = !looping;
    api.isLooping = next;
    setLooping(next);
  };

  const applyLoopRange = (startPct: number, endPct: number) => {
    if (!api || scoreDurationTicks === null) return;
    if (endPct <= startPct) {
      api.playbackRange = null;
      return;
    }
    const startTick = Math.max(0, Math.round((startPct / 100) * scoreDurationTicks));
    const endTick = Math.max(startTick + 1, Math.round((endPct / 100) * scoreDurationTicks));
    api.playbackRange = { startTick, endTick };
  };

  // Change playback speed (percentage of original).
  const handleSpeedChange = (e: ChangeEvent<HTMLInputElement>) => {
    const speed = parseFloat(e.target.value);
    setPlaybackSpeed(speed);
    if (api) api.playbackSpeed = speed;
  };

  // Change volume for a given track using alphaTab API.
  const handleTrackVolume = (trackIndex: number, e: ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value) / 100; // convert 0-100 to 0.0-1.0
    if (api && tracks[trackIndex]) {
      api.changeTrackVolume([tracks[trackIndex]], vol);
    }
  };

  // Change selected MIDI output device.
  const handleMidiOutputChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const output = midiAccess?.outputs.get(id) ?? null;
    setMidiOutput(output);
  };

  return (
    <div className="tab-player-container">
      {/* Controls Toolbar */}
      <div className="at-controls">
        <button onClick={handlePlayPause} disabled={!ready || isLoadingScore}>
          {isLoadingScore ? 'Loading…' : isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={handleStop} disabled={!ready || isLoadingScore}>
          ⏹ Stop
        </button>
        <button onClick={handleToggleLoop} disabled={!ready || isLoadingScore}>
          {looping ? '🔁 Loop: On' : '🔁 Loop: Off'}
        </button>
        <label>
          Speed:
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={playbackSpeed}
            onChange={handleSpeedChange}
            disabled={!ready || isLoadingScore}
          />
          {(playbackSpeed * 100).toFixed(0)}%
        </label>
        {scoreDurationTicks !== null && (
          <div className="loop-controls">
            <label>
              Loop Start
              <input
                type="range"
                min="0"
                max="99"
                step="1"
                value={loopStartPct}
                onChange={(e) => {
                  const pct = Number(e.target.value);
                  setLoopStartPct(pct);
                  applyLoopRange(pct, loopEndPct);
                }}
                disabled={!ready || isLoadingScore}
              />
              {loopStartPct}%
            </label>
            <label>
              Loop End
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={loopEndPct}
                onChange={(e) => {
                  const pct = Number(e.target.value);
                  setLoopEndPct(pct);
                  applyLoopRange(loopStartPct, pct);
                }}
                disabled={!ready || isLoadingScore}
              />
              {loopEndPct}%
            </label>
            <button
              onClick={() => {
                setLoopStartPct(0);
                setLoopEndPct(100);
                if (api) api.playbackRange = null;
              }}
              disabled={!ready || isLoadingScore}
            >
              Reset Loop
            </button>
          </div>
        )}
        {/* MIDI Output Selector */}
        {midiAccess && (
          <label>
            MIDI Out:
            <select onChange={handleMidiOutputChange} value={midiOutput?.id ?? ''}>
              <option value="">-- No Output --</option>
              {Array.from(midiAccess.outputs.values()).map((output) => (
                <option key={output.id} value={output.id}>
                  {output.name || output.id}
                </option>
              ))}
            </select>
          </label>
        )}
        {!midiAccess && (
          <div className="midi-status-unavailable">
            ⚠️ WebMIDI not available (Chrome required for local output, or enable the flag)
          </div>
        )}
        {midiAccess && !midiOutput && (
          <div className="midi-status-warning">
            ⚠️ No MIDI output selected. Check loopMIDI or IAC Driver is running.
          </div>
        )}
        {midiOutput && (
          <div className="midi-status-ok">
            ✓ MIDI Output: <strong>{midiOutput.name || midiOutput.id}</strong>
          </div>
        )}
      </div>

      {/* MIDI Monitor Panel (Optional) */}
      <div className="midi-monitor-panel">
        <label className="monitor-toggle">
          <input
            type="checkbox"
            checked={midiMonitorEnabled}
            onChange={(e) => {
              setMidiMonitorEnabled(e.target.checked);
              if (!e.target.checked) {
                midiEventCountRef.current = 0;
                setMidiEventCount(0);
                setLastMidiEvent(null);
              }
            }}
          />
          Monitor MIDI Events
        </label>
        {midiMonitorEnabled && (
          <div className="monitor-display">
            <div className="monitor-stat">
              <span className="label">Events Sent:</span>
              <span className="value">{midiEventCount}</span>
            </div>
            {lastMidiEvent && (
              <div className="monitor-stat">
                <span className="label">Last Event:</span>
                <span className="value">{lastMidiEvent}</span>
              </div>
            )}
            <button
              className="reset-monitor"
              onClick={() => {
                midiEventCountRef.current = 0;
                setMidiEventCount(0);
                setLastMidiEvent(null);
              }}
            >
              Reset Counter
            </button>
          </div>
        )}
      </div>

      {/* AlphaTab rendering container */}
      <div ref={containerRef} className="alphaTab-container" id="alphaTabContainer"></div>

      {/* Mixer: Volume controls per track */}
      {tracks.map((track, idx) => (
        <div className="track-slider" key={idx}>
          <label>{track.name || `Track ${idx + 1}`}</label>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="100"
            disabled={!ready || isLoadingScore}
            onChange={(e) => handleTrackVolume(idx, e)}
          />
        </div>
      ))}

      {/* Heavy metal theme CSS: scoped to this container to avoid global overrides */}
      <style jsx global>{`
        /* Container for the alphaTab content */
        #alphaTabContainer {
          background-color: #000; /* black background */
          border: 1px solid #f00;
          margin-top: 10px;
        }
        /* Cursor and highlight styling for heavy metal theme */
        .at-cursor-bar {
          background: rgba(255, 0, 0, 0.25) !important;
        }
        .at-cursor-beat {
          background: rgba(0, 255, 0, 1) !important;
          width: 3px !important;
        }
        /* Highlights notes/beats in red when played */
        .at-highlight * {
          fill: #00ff00 !important;
          stroke: #00ff00 !important;
        }
        /* Controls styling */
        .at-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          background-color: #111;
          padding: 8px;
          align-items: center;
        }
        .at-controls button {
          background: #222;
          color: #f00;
          border: 1px solid #f00;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 14px;
        }
        .at-controls button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .at-controls label {
          color: #f00;
          font-size: 14px;
        }
        .at-controls input[type='range'] {
          vertical-align: middle;
          margin: 0 5px;
        }
        .track-slider {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 6px;
        }
        .track-slider label {
          width: 100px;
          color: #f00;
          font-size: 14px;
        }
        .track-slider input[type='range'] {
          flex: 1;
        }
        .loop-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .loop-controls label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #f00;
          font-size: 14px;
        }
        .loop-controls input[type='range'] {
          width: 120px;
        }
        /* MIDI Status Indicators */
        .midi-status-ok {
          color: #0f0;
          font-size: 13px;
          padding: 4px 8px;
          background-color: rgba(0, 255, 0, 0.1);
          border: 1px solid #0f0;
          border-radius: 3px;
        }
        .midi-status-ok strong {
          font-weight: bold;
        }
        .midi-status-warning {
          color: #ff8000;
          font-size: 13px;
          padding: 4px 8px;
          background-color: rgba(255, 128, 0, 0.1);
          border: 1px solid #ff8000;
          border-radius: 3px;
        }
        .midi-status-unavailable {
          color: #f00;
          font-size: 13px;
          padding: 4px 8px;
          background-color: rgba(255, 0, 0, 0.1);
          border: 1px solid #f00;
          border-radius: 3px;
        }
        /* MIDI Monitor Panel */
        .midi-monitor-panel {
          background-color: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 10px;
          margin-top: 10px;
          font-size: 13px;
        }
        .monitor-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #f00;
          cursor: pointer;
          user-select: none;
        }
        .monitor-toggle input[type='checkbox'] {
          cursor: pointer;
        }
        .monitor-display {
          background-color: #0a0a0a;
          border: 1px solid #444;
          border-radius: 3px;
          padding: 8px;
          margin-top: 8px;
          font-family: monospace;
        }
        .monitor-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          border-bottom: 1px solid #333;
        }
        .monitor-stat:last-child {
          border-bottom: none;
        }
        .monitor-stat .label {
          color: #888;
          font-weight: bold;
        }
        .monitor-stat .value {
          color: #0f0;
          font-weight: bold;
          font-size: 12px;
        }
        .reset-monitor {
          margin-top: 8px;
          background: #222;
          color: #f00;
          border: 1px solid #f00;
          padding: 4px 10px;
          cursor: pointer;
          font-size: 12px;
          border-radius: 3px;
        }
        .reset-monitor:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
}
