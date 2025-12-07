'use client';

import '@/app/alphaTab.css';
import AlphaTabWrapper, { AlphaTabScore } from '@/components/AlphaTabWrapper';
import ImprovedTabPlayer from '@/components/ImprovedTabPlayer';
import SettingsPanel from '@/components/SettingsPanel';
import TrackPanel from '@/components/TrackPanel';
import TransportControls from '@/components/TransportControls';
import { alphaTabScoreToTabSong, createTabSyncEngine, TabSong } from '@metalmaster/shared-types';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';

type DemoFile = {
  label: string;
  path: string;
  description?: string;
  backingUrl?: string;
};

type PlayerPositionChangedEvent = {
  currentTime: number;
};

const demoFiles: DemoFile[] = [
  {
    label: 'Metallica - Mercyful Fate (GP3)',
    path: '/tabs/metallica-mercyful_fate.gp3',
    description: 'Compact demo tab for quick loading.',
    backingUrl: '/jam/jam1.mp3',
  },
  {
    label: 'Metallica - Master of Puppets (GP5)',
    path: '/tabs/metallica-master_of_puppets.gp5',
    description: 'Full arrangement with multiple tracks.',
    backingUrl: '/jam/jam2.mp3',
  },
  {
    label: 'Lesson 1 - Palm Muted Chunk (GP5)',
    path: '/lessons/lesson-1-palm-muted.gp5',
    description: 'Beginner palm-muting and chunking riff.',
  },
  {
    label: 'Lesson 2 - Power Chords & Downpicking (GP5)',
    path: '/lessons/lesson-2-power-chords-downpicking.gp5',
    description: 'Downpicked power-chord workout.',
  },
  {
    label: 'Lesson 3 - Alternate Picking Drill (GP5)',
    path: '/lessons/lesson-3-alternate-picking.gp5',
    description: 'Alternate picking endurance/precision drill.',
  },
  {
    label: 'Lesson 4 - Classic Gallop (GP5)',
    path: '/lessons/lesson-4-classic-gallup.gp5',
    description: 'Gallop rhythm practice.',
  },
  {
    label: 'Lesson 5 - Riff Etude (GP5)',
    path: '/lessons/lesson-5.gp5',
    description: 'Mid-tempo riff study.',
  },
  {
    label: 'Lesson 6 - Groove Builder (GP5)',
    path: '/lessons/lesson-6.gp5',
    description: 'Groove and timing focus.',
  },
  {
    label: 'Lesson 7 - Fast Downpicking (GP5)',
    path: '/lessons/lesson-7-fast-downpicking.gp5',
    description: 'Stamina drill for downpicking.',
  },
];

const formatMs = (ms: number | undefined): string => {
  if (!ms || Number.isNaN(ms)) return '0:00';
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = `${totalSeconds % 60}`.padStart(2, '0');
  return `${minutes}:${seconds}`;
};

type PlayerState = {
  state: number;
};

type AlphaTabError = Error | { message: string };

type NoteEvent = {
  note?: number;
  velocity?: number;
  track?: {
    index?: number;
  };
};

interface AlphaTabApiInstance {
  playerPositionChanged: { on: (callback: (evt: PlayerPositionChangedEvent) => void) => void };
  playerStateChanged: {
    on: (callback: (state: PlayerState) => void) => void;
    off?: (callback: (state: PlayerState) => void) => void;
  };
  readyForPlayback?: { on: (callback: () => void) => void; off?: (callback: () => void) => void };
  soundFontLoaded?: { on: (callback: () => void) => void; off?: (callback: () => void) => void };
  midiLoadFailed?: {
    on: (callback: (err: AlphaTabError) => void) => void;
    off?: (callback: (err: AlphaTabError) => void) => void;
  };
  error?: {
    on: (callback: (err: AlphaTabError) => void) => void;
    off?: (callback: (err: AlphaTabError) => void) => void;
  };
  scoreLoaded: { on: (callback: (score: AlphaTabScore) => void) => void };
  player?: {
    notePlayed?: {
      on: (callback: (ev: NoteEvent) => void) => void;
      off?: (callback: (ev: NoteEvent) => void) => void;
    };
    noteReleased?: {
      on: (callback: (ev: NoteEvent) => void) => void;
      off?: (callback: (ev: NoteEvent) => void) => void;
    };
  };
  destroy?: () => void;
  load: (fileSource: ArrayBuffer | string) => void;
  playPause?: () => boolean | void;
  play?: () => boolean | void;
  stop?: () => void;
  render?: () => void;
  tracks?: unknown[];
  playbackSpeed?: number;
  metronomeVolume?: number;
  countInVolume?: number;
  isLooping?: boolean;
  isReadyForPlayback?: boolean;
  audioContext?: AudioContext;
}

export default function TabPlayerPage() {
  const [selectedFile, setSelectedFile] = useState<DemoFile | null>(demoFiles[0]);
  const [fileSource, setFileSource] = useState<ArrayBuffer | string | null>(demoFiles[0].path);
  const [api, setApi] = useState<any>(null);
  const [score, setScore] = useState<AlphaTabScore | null>(null);
  const [positionMs, setPositionMs] = useState(0);
  const [tabSong, setTabSong] = useState<TabSong | null>(null);
  const [activeBeatId, setActiveBeatId] = useState<string | null>(null);
  const [playerPlaying, setPlayerPlaying] = useState(false);
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(true);
  const [loadedFileLabel, setLoadedFileLabel] = useState<string>(demoFiles[0].label);
  const [canPlay, setCanPlay] = useState(false);
  const [backingUrl, setBackingUrl] = useState<string | null>(demoFiles[0].backingUrl ?? null);
  const [backingEnabled, setBackingEnabled] = useState(false);
  const positionUpdateRaf = useRef<number | null>(null);
  const lastPositionMsRef = useRef<number>(0);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  const [viewOnlyTrackIndex, setViewOnlyTrackIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null);
  const [midiOutputs, setMidiOutputs] = useState<MIDIOutput[]>([]);
  const [selectedMidiId, setSelectedMidiId] = useState<string>('');
  const midiOutputRef = useRef<MIDIOutput | null>(null);
  const [midiStatus, setMidiStatus] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (positionUpdateRaf.current !== null) {
        cancelAnimationFrame(positionUpdateRaf.current);
        positionUpdateRaf.current = null;
      }
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
    },
    []
  );

  useEffect(() => {
    if (!audioRef.current) return;
    if (backingUrl && backingEnabled) {
      audioRef.current.src = backingUrl;
      audioRef.current.load();
    } else {
      audioRef.current.removeAttribute('src');
    }
  }, [backingUrl, backingEnabled]);

  useEffect(() => {
    if (!api) return;
    const handleStateChanged = (state: PlayerState) => {
      if (!audioRef.current) return;
      if (state.state === 1) {
        audioRef.current.playbackRate = api.playbackSpeed ?? 1;
        void audioRef.current.play().catch(() => {
          // Backing track play may fail if user hasn't interacted with page yet
        });
        setPlayerPlaying(true);
      } else if (state.state === 0) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setPlayerPlaying(false);
      } else if (state.state === 2) {
        audioRef.current.pause();
        setPlayerPlaying(false);
      }
    };
    api.playerStateChanged.on(handleStateChanged);
    return () => api.playerStateChanged.off?.(handleStateChanged);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    let poll: ReturnType<typeof setInterval> | null = null;
    const checkReady = () => {
      if (api.isReadyForPlayback) {
        setCanPlay(true);
        setIsLoadingFile(false);
        setLoadError(null);
        if (poll) {
          clearInterval(poll);
          poll = null;
        }
      }
    };
    checkReady();
    poll = setInterval(checkReady, 400);
    return () => {
      if (poll) clearInterval(poll);
    };
  }, [api]);

  // Initialize WebMIDI and capture available outputs
  useEffect(() => {
    let cancelled = false;
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
      setMidiStatus('WebMIDI not available in this browser.');
      return;
    }
    navigator
      .requestMIDIAccess()
      .then((access) => {
        if (cancelled) return;
        setMidiAccess(access);
        const outs = Array.from(access.outputs.values());
        setMidiOutputs(outs);
        setMidiStatus(outs.length ? null : 'No MIDI outputs detected. Start loopMIDI/IAC Driver.');
        access.onstatechange = () => {
          const latest = Array.from(access.outputs.values());
          setMidiOutputs(latest);
          if (!latest.length) {
            setMidiStatus('No MIDI outputs detected. Start loopMIDI/IAC Driver.');
          }
        };
      })
      .catch(() => {
        if (!cancelled) setMidiStatus('MIDI access was blocked. Allow MIDI permissions.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Route alphaTab note events to the selected MIDI output
  useEffect(() => {
    if (!api) return;
    const handleNoteOn = (ev: NoteEvent) => {
      const output = midiOutputRef.current;
      if (!output) return;
      const note = ev?.note ?? 60;
      const velocity = Math.max(1, Math.min(127, Math.floor((ev?.velocity ?? 0.8) * 127)));
      const channel = Math.max(0, Math.min(15, ev?.track?.index ?? 0));
      output.send([0x90 + channel, note, velocity]);
    };
    const handleNoteOff = (ev: NoteEvent) => {
      const output = midiOutputRef.current;
      if (!output) return;
      const note = ev?.note ?? 60;
      const channel = Math.max(0, Math.min(15, ev?.track?.index ?? 0));
      output.send([0x80 + channel, note, 0]);
    };
    api.player?.notePlayed?.on(handleNoteOn);
    api.player?.noteReleased?.on(handleNoteOff);
    return () => {
      api.player?.notePlayed?.off?.(handleNoteOn);
      api.player?.noteReleased?.off?.(handleNoteOff);
    };
  }, [api]);

  const handleSelectMidi = (id: string) => {
    setSelectedMidiId(id);
    const next = midiOutputs.find((o) => o.id === id) ?? null;
    midiOutputRef.current = next;
    setMidiStatus(
      next
        ? `Routing MIDI to ${next.name || next.id}`
        : midiOutputs.length
        ? 'No MIDI output selected.'
        : 'No MIDI outputs detected. Start loopMIDI/IAC Driver.'
    );
  };

  const handleLocalFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScore(null);
    setTabSong(null);
    setPositionMs(0);
    setActiveBeatId(null);
    setSelectedFile(null);
    setLocalFileName(file.name);
    setLoadError(null);
    setIsLoadingFile(true);
    setLoadedFileLabel(file.name);
    setBackingUrl(null);
    setBackingEnabled(false);
    setCanPlay(false);

    try {
      const buf = await file.arrayBuffer();
      setFileSource(buf);
      setLoadError(null);
    } catch {
      setLoadError('Failed to read local file.');
      setFileSource(null);
    } finally {
      event.target.value = '';
      setIsLoadingFile(false);
    }
  };

  const currentLabel = localFileName ?? loadedFileLabel ?? selectedFile?.label ?? 'No file loaded';
  const currentDescription = localFileName
    ? 'Local Guitar Pro file'
    : selectedFile?.description ?? 'AlphaTab demo Guitar Pro file';

  useEffect(() => {
    if (api && Number.isFinite(selectedTrackIndex)) {
      try {
        api.tracks = [selectedTrackIndex];
        api.render?.();
      } catch (err) {
        // Failed to apply track selection
      }
    }
  }, [api, selectedTrackIndex]);

  const durationMs = useMemo(() => {
    if (!score) return 0;
    return score.duration ?? score.playbackDuration ?? 0;
  }, [score]);

  const bpm = useMemo(() => {
    if (!score) return 0;
    return score.tempo ?? score.playbackInfo?.tempo ?? 0;
  }, [score]);

  const syncEngine = useMemo(() => {
    if (!tabSong) return null;
    return createTabSyncEngine(tabSong);
  }, [tabSong]);

  useEffect(() => {
    if (!syncEngine) return;
    const currentBeat = syncEngine.getActiveBeat(positionMs / 1000);
    setActiveBeatId(currentBeat?.id ?? null);
  }, [positionMs, syncEngine]);

  const currentTimeSeconds = positionMs / 1000;

  const handlePlayRequest = (delayMs: number) => {
    if (!audioRef.current || !backingUrl || !backingEnabled) return;
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.playbackRate = api?.playbackSpeed ?? 1;
    const start = () =>
      void audioRef.current?.play().catch(() => {
        // Backing track play may fail if user hasn't interacted with page yet
      });
    if (delayMs > 0) {
      playTimerRef.current = setTimeout(start, delayMs);
    } else {
      start();
    }
  };

  const handleStopRequest = () => {
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const handleSpeedChange = (speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Handlers to integrate ImprovedTabPlayer transport with AlphaTab API and backing audio
  const handlePlayerRequestPlay = (delayMs = 0) => {
    if (!api) return;
    try {
      if (api.audioContext?.state === 'suspended') {
        void api.audioContext.resume();
      }
    } catch {
      // Intentionally ignore errors when resuming audio context
    }

    const didPlay = api.playPause ? api.playPause() : api.play?.();
    // If AlphaTab play returned false, likely not ready for playback.
    // You may want to show a user-facing error or handle this case.
    if (didPlay === false) {
      // TODO: handle play failure (e.g., show notification)
    }
    // start backing track if enabled
    handlePlayRequest(delayMs);
    setPlayerPlaying(true);
  };

  const handlePlayerRequestPause = () => {
    if (api) api.playPause?.();
    if (audioRef.current) audioRef.current.pause();
    setPlayerPlaying(false);
  };

  const handlePlayerRequestStop = () => {
    api?.stop?.();
    handleStopRequest();
    setPlayerPlaying(false);
  };

  const handlePlayerRequestSeek = (seconds: number) => {
    // Try alphaTab seek if available, otherwise seek backing audio and update position
    const s = Math.max(0, seconds);
    type AlphaTabApiWithSeek = AlphaTabApiInstance & { seek?: (seconds: number) => void };
    const apiWithSeek = api as AlphaTabApiWithSeek;
    if (apiWithSeek.seek) {
      try {
        apiWithSeek.seek(s);
      } catch {
        // alphaTab seek failed; fallback to audio position update below
      }
    } else {
      if (audioRef.current) audioRef.current.currentTime = s;
      setPositionMs(Math.round(s * 1000));
    }
  };

  const handlePlayerRequestTempoChange = (multiplier: number) => {
    const speed = multiplier;
    if (api) api.playbackSpeed = speed;
    handleSpeedChange(speed);
  };

  useEffect(() => {
    setScore(null);
    setTabSong(null);
    setPositionMs(0);
    setActiveBeatId(null);
    if (positionUpdateRaf.current !== null) {
      cancelAnimationFrame(positionUpdateRaf.current);
      positionUpdateRaf.current = null;
    }
    setSyncError(null);
    setLoadError(null);
    if (selectedFile) {
      setIsLoadingFile(true);
      setFileSource(selectedFile.path);
      setLocalFileName(null);
      setLoadedFileLabel(selectedFile.label);
      setBackingUrl(selectedFile.backingUrl ?? null);
      setBackingEnabled(false);
      setCanPlay(false);
      setSelectedTrackIndex(0);
      lastPositionMsRef.current = 0;
    }
  }, [selectedFile]);

  return (
    <div className="relative min-h-screen bg-metal-900 text-gray-100 pb-16">
      <audio ref={audioRef} preload="auto" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-56 w-56 rounded-full bg-linear-to-br from-metal-accent/30 via-orange-500/20 to-amber-300/10 blur-3xl" />
        <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-linear-to-tr from-purple-800/25 via-slate-800/50 to-black/60 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-6 pt-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">AlphaTab Playground</p>
            <h1 className="font-display text-3xl md:text-4xl text-white">Tab Player</h1>
            <p className="text-sm text-gray-300">
              Guitar Pro playback with track, loop, and speed control.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/"
                className="px-3 py-1 rounded text-sm font-semibold text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-white/5"
              >
                Home
              </Link>
              <Link
                href="/lessons"
                className="px-3 py-1 rounded text-sm font-semibold text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-white/5"
              >
                Lessons
              </Link>
              <Link
                href="/library"
                className="px-3 py-1 rounded text-sm font-semibold text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-white/5"
              >
                Library
              </Link>
              <Link
                href="/docs"
                className="px-3 py-1 rounded text-sm font-semibold text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-white/5"
              >
                Docs
              </Link>
              <Link
                href="/settings"
                className="px-3 py-1 rounded text-sm font-semibold text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-white/5"
              >
                Settings
              </Link>
            </nav>

            <div className="text-right">
              <p className="text-xs text-gray-400">Now Loaded</p>
              <p className="text-sm font-semibold text-white max-w-[220px] truncate">
                {currentLabel}
              </p>
              <p className="text-xs text-gray-500">{currentDescription}</p>
            </div>

            <span className="px-3 py-1 rounded-full border border-metal-accent/60 bg-metal-accent/10 text-xs font-semibold text-metal-accent whitespace-nowrap">
              Beta
            </span>
          </div>
        </header>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-gray-900/80 via-gray-900/60 to-black/70 min-h-[70vh] shadow-2xl">
            <div className="absolute inset-0 opacity-60 blur-3xl bg-linear-to-br from-metal-accent/20 via-purple-700/25 to-black/70" />
            <div className="relative">
              {fileSource ? (
                <AlphaTabWrapper
                  fileSource={fileSource}
                  className="w-full h-[75vh] bg-zinc-900 overflow-auto"
                  onApiReady={(instance) => setApi(instance)}
                  onScoreLoaded={(loadedScore) => {
                    setIsLoadingFile(false);
                    setScore(loadedScore);
                    setSelectedTrackIndex(0);
                    try {
                      const mapped = alphaTabScoreToTabSong(loadedScore);
                      setTabSong(mapped);
                      setSyncError(null);
                    } catch (err) {
                      setSyncError('Loaded tab, but could not build sync data.');
                      setTabSong(null);
                    }
                  }}
                  onPositionChanged={(ms) => {
                    // Avoid tight update loops by throttling and ignoring identical positions.
                    if (Math.abs(ms - lastPositionMsRef.current) < 0.5) return;
                    if (positionUpdateRaf.current !== null) {
                      cancelAnimationFrame(positionUpdateRaf.current);
                    }
                    positionUpdateRaf.current = requestAnimationFrame(() => {
                      lastPositionMsRef.current = ms;
                      setPositionMs(ms);
                      positionUpdateRaf.current = null;
                    });
                  }}
                  onError={(message) => {
                    setLoadError(message);
                    setIsLoadingFile(false);
                    setCanPlay(false);
                  }}
                  onPlaybackReady={() => {
                    setLoadError(null);
                    setIsLoadingFile(false);
                    setCanPlay(true);
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm px-4 text-center py-16">
                  {loadError
                    ? loadError
                    : isLoadingFile
                    ? 'Loading tab...'
                    : "Couldn't load the tab yet. Try picking a demo or local file."}
                </div>
              )}
            </div>
          </div>

          {fileSource && loadError && (
            <div className="rounded-xl border border-red-800/40 bg-red-900/30 text-red-200 text-sm px-3 py-2">
              {loadError}
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-linear-to-br from-gray-900/80 via-gray-900/60 to-black/70 px-4 py-3 shadow-xl">
            <TransportControls
              api={api}
              score={score}
              durationMs={durationMs}
              positionMs={positionMs}
              canPlay={canPlay}
              onPlayRequest={handlePlayRequest}
              onStopRequest={handleStopRequest}
              onSpeedChange={handleSpeedChange}
              demoOptions={demoFiles}
              selectedDemoPath={selectedFile?.path ?? ''}
              currentLabel={currentLabel}
              onSelectDemo={(path) => {
                const next = demoFiles.find((f) => f.path === path);
                if (next) {
                  setLocalFileName(null);
                  setSelectedFile(next);
                  setBackingUrl(next.backingUrl ?? null);
                  setBackingEnabled(false);
                  setLoadedFileLabel(next.label);
                  setFileSource(next.path);
                  setTabSong(null);
                  setScore(null);
                  setPositionMs(0);
                  setActiveBeatId(null);
                  setCanPlay(false);
                  setIsLoadingFile(true);
                }
              }}
            />
            <div className="mt-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                    External MIDI Out
                  </p>
                  <p className="text-sm text-gray-200">Route alphaTab playback to your DAW synth</p>
                </div>
                {midiAccess ? (
                  <select
                    className="ml-auto bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-sm text-gray-100"
                    value={selectedMidiId}
                    onChange={(e) => handleSelectMidi(e.target.value)}
                  >
                    <option value="">-- No Output --</option>
                    {midiOutputs.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name || o.id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="ml-auto text-xs text-red-300">WebMIDI not available</div>
                )}
              </div>
              {midiStatus && <p className="mt-2 text-xs text-gray-400">{midiStatus}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4">
            <div className="rounded-2xl border border-white/10 bg-linear-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-4 shadow-xl space-y-4">
              <SettingsPanel api={api} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-semibold block">
                    Load Local File
                  </label>
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/15 bg-black/40 text-xs font-semibold text-white cursor-pointer hover:border-metal-accent/50 w-full justify-center">
                    <span>Choose GP file</span>
                    <input
                      type="file"
                      accept=".gp3,.gp4,.gp5,.gpx,.gp,.guitarpro"
                      className="hidden"
                      onChange={handleLocalFile}
                    />
                  </label>
                  <p className="text-[11px] text-gray-500">
                    {localFileName ? `Loaded: ${localFileName}` : 'Supports .gp3, .gp4, .gp5, .gpx'}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-gray-400 md:col-span-2">
                  <label className="uppercase tracking-[0.2em] font-semibold">Backing Track</label>
                  <button
                    type="button"
                    disabled={!backingUrl}
                    onClick={() => setBackingEnabled((v) => !v)}
                    className={`px-3 py-2 rounded-lg font-semibold text-xs transition ${
                      backingEnabled
                        ? 'bg-green-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500'
                    }`}
                  >
                    {backingEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                  <span className="text-gray-500 text-[11px]">
                    {backingUrl
                      ? 'Toggle playback of the bundled jam track.'
                      : 'No backing track available for this tab.'}
                  </span>
                </div>

                {score && (
                  <div className="space-y-0.5 text-[11px] text-gray-400 md:col-span-2">
                    <p>
                      BPM: <span className="text-gray-200">{bpm || '--'}</span>
                    </p>
                    <p>
                      Length: <span className="text-gray-200">{formatMs(durationMs)}</span>
                    </p>
                    <p>
                      Tracks: <span className="text-gray-200">{score.tracks?.length ?? 0}</span>
                    </p>
                  </div>
                )}
              </div>

              {tabSong && (
                <div className="mt-4 rounded-2xl border border-white/15 bg-linear-to-br from-black/50 via-gray-900/40 to-black/60 p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">
                        ♪ Tab Player
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Interactive playback with synchronized tab display
                      </p>
                    </div>
                    <p className="text-sm font-mono text-gray-400 bg-black/50 px-3 py-1 rounded-lg">
                      Beat:{' '}
                      <span className="text-metal-accent font-bold">
                        {activeBeatId ? activeBeatId.slice(0, 8) : '--'}
                      </span>
                    </p>
                  </div>
                  <ImprovedTabPlayer
                    song={tabSong}
                    width={760}
                    height={300}
                    onRequestPlay={handlePlayerRequestPlay}
                    onRequestPause={handlePlayerRequestPause}
                    onRequestStop={handlePlayerRequestStop}
                    onRequestSeek={handlePlayerRequestSeek}
                    onRequestTempoChange={handlePlayerRequestTempoChange}
                    externalCurrentTime={currentTimeSeconds}
                    isExternalPlaying={playerPlaying}
                  />
                </div>
              )}

              {!tabSong && syncError && (
                <div className="mt-3 text-xs text-red-300 bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2">
                  {syncError}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-linear-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-4 shadow-xl">
              {score && score.tracks ? (
                <TrackPanel
                  tracks={score.tracks}
                  api={api}
                  score={score}
                  selectedTrackIndex={selectedTrackIndex}
                  viewOnlyTrackIndex={viewOnlyTrackIndex}
                  onSelectTrack={(idx) => {
                    setSelectedTrackIndex(idx);
                    setViewOnlyTrackIndex(idx);
                    if (api && score?.tracks) {
                      try {
                        // AlphaTab API expects track objects for change/muting APIs; pass the track object here.
                        const trackObj = score.tracks[idx];
                        if (trackObj) {
                          api.tracks = [trackObj];
                          api.render?.();
                        }
                      } catch (err) {
                        // Failed to switch track
                      }
                    }
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
                  Load a tab to view tracks
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
