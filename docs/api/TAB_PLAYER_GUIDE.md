# Tab Player Guide

## Overview

The **MetalMaster Tab Player** is an interactive guitar tab learning tool built with React, TypeScript, VexFlow, and Web Audio API. It integrates with AlphaTab for professional score rendering and playback, providing musicians with synchronized visuals, tempo control, looping, and precise beat-click metronome.

Located at: `/tab-player` route in the web app.

## Current Tab Player (Dec 2025)

The current UI is the new Tab Lab experience (`TabPlayerShell`) built on AlphaTab with a dedicated control bar, section chips, and a fullscreen mode that keeps the bottom transport visible.

### What's New (Recent)

- **Fullscreen mode** now expands the lesson canvas while keeping the bottom transport bar available.
- **Lesson dropdown** is generated from `packages/web/public/lessons`.
  - Regenerate after adding/removing lessons:
    ```powershell
    yarn workspace @metalmaster/web run generate:tab-demos
    ```

### Current File Locations

| File                                                   | Purpose                                                                 |
| ------------------------------------------------------ | ----------------------------------------------------------------------- |
| `packages/web/src/app/tab-player/page.tsx`             | Tab Player page entry (Tab Lab).                                        |
| `packages/web/src/components/tabplayer/TabPlayerShell.tsx` | Main shell with lesson dropdown, layout, and bottom bar.            |
| `packages/web/src/components/tabplayer/MainStage.tsx`  | Section chips + fullscreen button + AlphaTab canvas.                    |
| `packages/web/src/components/tabplayer/AlphaTabCanvas.tsx` | AlphaTab mount + scroll container sizing.                           |
| `packages/web/src/components/tabplayer/useAlphaTab.ts` | AlphaTab setup, track sync, cursor scroll, and theming.                 |
| `packages/web/src/app/tab-player/demoFiles.generated.ts` | Auto-generated demo list from `/public/lessons` + `/public/tabs`.   |

> Note: The sections below document the legacy ImprovedTabPlayer/VexFlow implementation. Keep them for reference, but the current Tab Lab uses the files above.

## Features

### Playback Controls

- **Play / Pause / Stop** - Control playback with buttons or keyboard (Space bar).
- **Seek / Timeline** - Drag the progress bar or use Arrow keys (← -5s, → +5s) to jump through the tab.
- **Tempo Control** - Adjust playback speed from 50% to 200% of the original BPM.
  - Visual BPM display updates in real-time (e.g., "60 BPM" at 0.5x tempo).
  - All timing remains accurate relative to the song's beat structure.

### Looping

- **Loop Enable/Disable** - Checkbox to toggle looping mode.
- **Loop Start / End** - Numeric inputs (seconds) to define the loop region.
  - When playback reaches the Loop End time, it automatically rewinds to Loop Start.
  - Useful for isolating difficult passages and practicing them repeatedly.

### Master Volume

- **Volume Slider** - Control the metronome click volume independently (0–100%).
- Routed through Web Audio API master gain node for clean, glitch-free fading.

### Tab Notes

- **Bright Green Highlight** - All tab notes render in neon green (`#39FF14`) for maximum contrast on the dark theme.
- **Synced Playback Indicator** - Notes are highlighted in real-time as the playhead progresses.

### Track Management

- **Track Panel** (right sidebar) displays all available tracks with controls:
  - **View** button - Show only that track's staff in the score.
  - **Solo** button - Mute all other tracks (AlphaTab audio engine).
  - **Mute** button - Silence this track.
  - **Volume Slider** - Per-track volume control (0–100%).
  - **Transpose** buttons - Shift the track up/down by semitones.
  - **View Only Indicator** - Green badge shows which track is currently displayed.

### File Loading

- **Demo Files** - Pre-loaded Metallica tabs (.gp3, .gp5 formats).
- **Local Upload** - Drag or select your own Guitar Pro files (.gp3, .gp4, .gp5, .gpx).
- **Backing Track** - Toggle bundled jam track playback (synced to score playback).

### Keyboard Shortcuts

| Shortcut          | Action            |
| ----------------- | ----------------- |
| `Space`           | Toggle Play/Pause |
| `←` (Left Arrow)  | Seek -5 seconds   |
| `→` (Right Arrow) | Seek +5 seconds   |

## Architecture

### Component Structure

```
Tab Player Page
├── AlphaTabWrapper
│   └── (Renders score using alphaTab library)
├── ImprovedTabPlayer
│   ├── (Play/Pause/Stop buttons)
│   ├── (Seek slider + time display)
│   ├── (Tempo control)
│   ├── (Loop controls)
│   ├── (Master volume)
│   └── GuitarTabRenderer
│       └── (VexFlow-based tab display with real-time highlighting)
├── TransportControls
│   └── (Speed, learn mode, metronome, count-in settings)
├── TrackPanel
│   └── (Track list with view/solo/mute/volume/transpose)
└── SettingsPanel
    └── (AlphaTab rendering settings)
```

### Data Flow

1. **File Loading:**

   - User selects a demo tab or uploads a local Guitar Pro file.
   - `AlphaTabWrapper` initializes the alphaTab library and loads the score.
   - `alphaTabScoreToTabSong()` converts the alphaTab score into a `TabSong` object for VexFlow rendering.

2. **Playback:**

   - **AlphaTab Engine** (left): Plays the full score with synthesized instruments via Web Audio (soundfont).
   - **ImprovedTabPlayer** (center): Schedules metronome clicks via Web Audio API, synced to tempo.
   - Both engines receive transport commands (play/pause/seek) from unified handlers.

3. **Synchronization:**

   - `playerPlaying` state reflects alphaTab's playback state.
   - `positionMs` (from alphaTab) is converted to `currentTimeSeconds` for display and VexFlow highlighting.
   - ImprovedTabPlayer receives `externalCurrentTime` and `isExternalPlaying` props, delegating control to alphaTab.

4. **Tempo & Speed:**
   - Tempo multiplier (0.5–2.0) is applied in ImprovedTabPlayer's metronome scheduling.
   - Same multiplier is set on `api.playbackSpeed` to sync alphaTab audio engine.
   - Backing audio playback rate is updated via `audioRef.current.playbackRate`.

### State Management

Key state variables in `tab-player/page.tsx`:

```typescript
// File & Score
const [selectedFile, setSelectedFile] = useState<DemoFile | null>(demoFiles[0]);
const [fileSource, setFileSource] = useState<ArrayBuffer | string | null>(null);
const [score, setScore] = useState<AlphaTabScore | null>(null);
const [tabSong, setTabSong] = useState<TabSong | null>(null);

// Playback
const [positionMs, setPositionMs] = useState(0);
const [playerPlaying, setPlayerPlaying] = useState(false);

// Tracks & Views
const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
const [viewOnlyTrackIndex, setViewOnlyTrackIndex] = useState<number | null>(null);
const [activeBeatId, setActiveBeatId] = useState<string | null>(null);

// Audio
const [backingUrl, setBackingUrl] = useState<string | null>(null);
const [backingEnabled, setBackingEnabled] = useState(false);
```

## File Locations

| File                                                | Purpose                                                          |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| `packages/web/src/app/tab-player/page.tsx`          | Main Tab Player page; orchestrates all components.               |
| `packages/web/src/components/ImprovedTabPlayer.tsx` | Self-contained player with controls (play, tempo, loop, volume). |
| `packages/web/src/components/GuitarTabRenderer.tsx` | VexFlow-based tab rendering with real-time beat highlighting.    |
| `packages/web/src/components/TrackPanel.tsx`        | Track list UI with solo/mute/volume/transpose.                   |
| `packages/web/src/components/AlphaTabWrapper.tsx`   | Wrapper for alphaTab library initialization & playback.          |
| `packages/web/src/components/TransportControls.tsx` | Speed, learn mode, metronome, count-in controls.                 |
| `packages/web/src/components/SettingsPanel.tsx`     | AlphaTab rendering settings (stave profile, etc.).               |

## Key Dependencies

- **alphaTab** (`@coderline/alphatab`) - Professional score rendering and MIDI playback.
- **VexFlow** (`vexflow`) - Tab staff rendering and notation.
- **Web Audio API** - Metronome click scheduling and volume control.
- **React** + **TypeScript** - UI and type safety.
- **Tailwind CSS** - Dark theme styling (blacks, reds, neons).

## Customization

### Change Note Colors

Edit `packages/web/src/components/GuitarTabRenderer.tsx`, line ~160:

```typescript
tabNote.setStyle({
  fillStyle: '#39FF14', // Change to your preferred hex color
  strokeStyle: '#39FF14',
  lineWidth: 2,
});
```

### Adjust Metronome Click Frequency

In `packages/web/src/components/ImprovedTabPlayer.tsx`, line ~14:

```typescript
osc.frequency.value = 1000; // Change to desired Hz
```

### Modify Tempo Range

In `ImprovedTabPlayer.tsx` tempo input (~230):

```tsx
<input
  type="range"
  min={0.5} // Change min
  max={2} // Change max
  step={0.01}
/>
```

## Integration Notes

### Transport Delegation

`ImprovedTabPlayer` can operate in two modes:

1. **Standalone** - No parent callbacks provided; uses internal Web Audio metronome.
2. **Delegated** - Parent provides `onRequestPlay`, `onRequestPause`, `onRequestStop`, `onRequestSeek`, `onRequestTempoChange` callbacks. The UI acts as a remote control for an external playback engine (alphaTab).

In the Tab Player page, it operates in **delegated mode**, with handlers that call the alphaTab API and manage backing audio.

### Seeking

The current implementation attempts `api.seek(seconds)` if available; otherwise it seeks the backing audio and updates display time. If your alphaTab instance has a different seek method (e.g., `api.player.setCurrentTime(...)`), update `handlePlayerRequestSeek()` in `page.tsx`.

### Beat Synchronization

`createTabSyncEngine()` (from `@metalmaster/shared-types`) builds a timeline of beat events from the `TabSong`. The engine is queried on each position update to find the active beat, which is then passed to `GuitarTabRenderer` for real-time highlighting.

## Future Enhancements

- **Audio Recording** - Record user's playing and compare against the original tab.
- **Difficulty Settings** - Hide certain frets or strings based on skill level.
- **Alternate Tunings** - Support for non-standard tunings.
- **Tab Editor** - Built-in editor to create or modify tabs.
- **Performance Stats** - Timing accuracy, note hit percentage, etc.
- **Sampled Metronome** - Replace oscillator clicks with high-quality drum samples.

## Troubleshooting

### Track switching doesn't work

- Ensure the alphaTab API object is defined and ready (`api && api.tracks`).
- Check browser console for warnings: `console.warn('Failed to switch track', err)`.
- Verify the track object (not index) is being passed: `api.tracks = [trackObj]`.

### No sound from metronome

- Check master volume slider (bottom left of ImprovedTabPlayer).
- Verify Web Audio context is not suspended (click any button to resume if needed).
- Check browser DevTools Audio tab for Web Audio context state.

### Tab notes not highlighting in sync

- Confirm `currentTime` is being updated (check the time display).
- Verify `tabSong` and `song.beats` exist and have valid `timeSeconds` values.
- Check that `GuitarTabRenderer` is receiving the `currentTime` prop.

### Backing track is out of sync

- Ensure `backingEnabled` is toggled on.
- Verify the backing URL is correct in `demoFiles` array.
- Check that playback rate is updated: `audioRef.current.playbackRate = speed`.

## Development

### Run Local Dev Server

```powershell
cd f:\metalmaster
yarn workspace @metalmaster/web dev
```

### Build for Production

```powershell
yarn workspace @metalmaster/web build
```

### Test Tab Player

1. Navigate to `http://localhost:3000/tab-player` (adjust port as needed).
2. Load a demo tab or upload a local Guitar Pro file.
3. Click Play and verify metronome clicks and score scrolling.
4. Test track switching, tempo, and looping.
5. Toggle backing track and verify sync.

## MIDI Output & Reaper Integration

The tab player supports **real-time MIDI output** to external DAWs (Reaper, Ableton, Logic, Cubase, etc.).

### Quick Start

1. **Windows:** Install loopMIDI (creates virtual MIDI port)

   - Download: https://www.tobias-erichsen.de/software/loopmidi.html
   - Run and click "+" to create a port

2. **macOS:** Enable IAC Driver

   - Audio MIDI Setup → IAC Driver → Enable checkbox

3. **Configure DAW:**

   - Reaper: Preferences → MIDI Devices → Check your port
   - Create MIDI track with input = your port
   - Add VST instrument (ReaGuitar, Kontakt, etc.)

4. **Use MetalMaster:**
   - Select MIDI output from dropdown (watch for ✓ green status)
   - Load tab and click Play
   - Hear guitar from DAW's instrument!

### Features

- **MIDI Output Selector** - Auto-detects available MIDI devices
- **Status Indicator** - Shows connection state (✓ green, ⚠️ orange, ✗ red)
- **MIDI Monitor** - Optional: Toggle to see live event count and last event details

### Documentation

- **Quick Start:** `REAPER_QUICK_START.md` (5 minutes)
- **Full Guide:** `REAPER_MIDI_INTEGRATION.md` (comprehensive reference)
- **Technical:** `MIDI_OUTPUT_REAPER_IMPLEMENTATION.md`
- **Diagrams:** `REAPER_ARCHITECTURE_DIAGRAMS.md`
- **Master Index:** `README_REAPER_MIDI.md`

## Related Docs

- **Project Setup:** `SETUP.md`
- **Shared Types:** `packages/shared-types/README.md`
- **AlphaTab Docs:** https://www.alphatab.net/docs/reference/api
- **VexFlow Docs:** https://github.com/0xfe/vexflow
- **Reaper Integration:** `REAPER_MIDI_INTEGRATION.md`

---

**Last Updated:** December 2025  
**Version:** 1.0
