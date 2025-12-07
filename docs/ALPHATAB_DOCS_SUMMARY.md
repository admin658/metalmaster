# AlphaTab Official Docs Integration Guide

This file maps the official alphaTab documentation (`https://www.alphatab.net/docs`, current stable 1.7.1) to MetalMaster so the team can jump to the right pages quickly and apply settings without hunting through the site.

## Quick Navigation
- Home/Intro: https://www.alphatab.net/docs/introduction
- Install (Web): https://www.alphatab.net/docs/getting-started/installation-web (also Vite/Webpack variants)
- Config (Web): https://www.alphatab.net/docs/getting-started/configuration-web
- API Reference Index: https://www.alphatab.net/docs/reference/api
- Settings Reference Index: https://www.alphatab.net/docs/reference/settings
- AlphaTex (text notation): https://www.alphatab.net/docs/alphatex/introduction
- Guides (coloring, MIDI events, audio/video sync, exporter, templates, styling, multiple soundfonts): https://www.alphatab.net/docs/guides/audio-video-sync (use sidebar for the rest)
- Release Notes: https://www.alphatab.net/docs/releases/release1_7
- Migration (1.x and pre-1.0): https://www.alphatab.net/docs/migration/data-attributes
- Tutorials (Web/.NET/Android step-by-step): https://www.alphatab.net/docs/tutorials

## Essentials for MetalMaster (Web)
- Installation: follow the Web (or Vite) guide; package name `@coderline/alphatab`. Our bundler already ships alphaTab via `packages/web/public/alphatab` assets.
- Configuration: review `configuration-web` for container setup, worker usage, and asset paths. We already expose `/alphatab/soundfont/sonivox.sf2`; double-check `fontDirectory` and `file` defaults if we move assets.
- Playback API: `play`, `pause`, `stop`, `playPause`, `seekTo`, `playbackRange`, `isReadyForPlayback`, `playerStateChanged`, `playerPositionChanged`, `playerFinished`.
- MIDI events: `midiEventsPlayed` + `midiEventsPlayedFilter` docs show event payloads and filtering. This underpins our WebMIDI output hook.
- Rendering: `render`, `renderTracks`, `resize`, `scrollToCursor`, `postRenderFinished`; pair with settings like `tracks`, `layoutMode`, and display padding options in the settings reference.
- Tracks/mixer: `changeTrackVolume`, `changeTrackMute`, `changeTrackSolo`, `changeTrackTranspositionPitch`, `tracks` accessor.
- SoundFont loading: `loadSoundFont`, `loadSoundFontFromUrl`, `resetSoundFonts`; check `useWorkers` and `engine` settings for performance.
- Export: `downloadMidi`, `exportAudio`, `print`, `tex` (render AlphaTex); see `audio-export` and `exporter` guides.
- Sync with media: `audio-video-sync` and `media-sync-editor` guides cover aligning backing tracks/video with score positions; use `updateSyncPoints` API.
- Styling: `styling-player` and `coloring` guides describe CSS + data-attribute hooks and color overrides for notes/voices.

## Settings Reference (what to check first)
- Core: `engine` (worker vs wasm), `file`, `tracks`, `tex`, `useWorkers`, `fontDirectory`, `includeNoteBounds`, `smuflFontSources`, `logLevel`.
- Display/Layout: `barsPerRow`, `barCount`, `justifyLastSystem`, `firstSystemPaddingTop`, `lastSystemPaddingBottom`, `effectStaffPaddingTop/Bottom`, `effectBandPaddingBottom`, `accoladeBarPaddingRight`.
- Playback: `loop`, `countInVolume`, `metronomeVolume`, `masterVolume`, `playbackSpeed`, `playbackRange`.
- SoundFonts: `soundFonts` collection (urls, formats), `multipleSoundFonts` guide for layering.
- Export/Print: `print` options, `renderScore`/`renderTracks` combos.
- Performance: `enableLazyLoading`, `useWorkers`, `resizeObserver` hooks; pair with `renderer` choices (Canvas vs SVG).

## AlphaTex (text notation)
- Intro + syntax: https://www.alphatab.net/docs/alphatex/introduction and `/syntax`.
- Structure: `/document-structure`, `/score-metadata`, `/staff-metadata`, `/bar-metadata`, `/structural-metadata`.
- Notes/beats: `/note-properties`, `/beat-properties`.
- Tooling: `/lsp` (language server), `/monaco` (editor integration), `/importer` (convert to Score).

## Guides & Tutorials (highly relevant)
- MIDI events handling: https://www.alphatab.net/docs/guides/handling-midi-events (maps to our WebMIDI bridge).
- Multiple soundfonts: `/guides/multiple-soundfonts` (stacking SF2/SF3; useful if we want better drums).
- Audio/video sync + media-sync-editor: `/guides/audio-video-sync`, `/guides/media-sync-editor`.
- Formatting/templates & coloring/styling: `/guides/formatting-templates`, `/guides/coloring`, `/guides/styling-player`, `/guides/smufl`.
- Exporter/audio-export: `/guides/exporter`, `/guides/audio-export`.
- Low-level APIs & Node: `/guides/lowlevel-apis`, `/guides/nodejs` (for future SSR/offline rendering).
- Tutorials (Web): `/docs/tutorial-web/*` walk through container setup, viewport, controls, player, track selector, wrap-up.

## Migration & Release Notes
- Breaking changes and data-attribute/DOM-event migrations: `/docs/migration/*`.
- Version history 1.0–1.7: `/docs/releases/release1_0` … `/release1_7` (good for tracking API changes and defaults).

## Supported Formats (importers)
- Guitar Pro 3–8 (`.gp3/.gp4/.gp5/.gpx/.gp`): `/docs/formats/guitar-pro-*`.
- MusicXML (`.xml`): `/docs/formats/musicxml`.
- Capella (`.cap`): `/docs/formats/capella`.
- AlphaTex text format: `/docs/alphatex/*`.

## How to Use This in MetalMaster
- When touching `packages/web/src/components/alphatab/TabPlayer.tsx`, consult:
  - API reference pages for the events/methods you call (`midieventsplayed`, `playbackRangeChanged`, `setOutputDevice`, etc.).
  - Settings reference when adjusting render or playback options; keep `useWorkers` and `engine` aligned with our bundler.
  - Styling/coloring guides before changing note colors or adding custom CSS hooks.
- For new features:
  - Backing track sync: use `updateSyncPoints` API + `audio-video-sync` guide.
  - Offline export: follow `exportAudio`/`downloadMidi` docs and `exporter` guide.
  - Alternate notation/alphaTex lessons: use AlphaTex intro/syntax pages and `tex` API to render inline.
- Keep links handy: add URLs in PR descriptions when you touch alphaTab-facing code so reviewers know which doc page you followed.

## Local Mirroring Tips
- If the site is unavailable, pages can be saved via `Invoke-WebRequest <url> -OutFile <name>.html` and opened locally; the sitemap at `https://www.alphatab.net/sitemap.xml` lists every doc page.
- Avoid copying the entire site into the repo; store curated notes (like this file) and deep links instead of raw HTML exports.
