# Metal Master — VST Companion

Small bridge service that relays WebSocket messages to a MIDI output (used to integrate the VST/plugin with Metal Master).

Quick start

- Requirements: Node.js >= 18, native build tools for the `midi` package on Windows (Build Tools / windows-build-tools).
- Install deps from repo root:

```bash
yarn install
```

- Build the package:

```bash
yarn workspace @metalmaster/vst-companion build
```

- Run in development (auto-reload):

```bash
yarn workspace @metalmaster/vst-companion dev
```

Notes

- The service looks for a MIDI output name configured in `src/config.ts` — ensure your VST or virtual MIDI driver is running and the name matches.
- If TypeScript reports missing types for `midi`, run `yarn workspace @metalmaster/vst-companion add -D @types/midi` from the repo root (this repo already adds it).
