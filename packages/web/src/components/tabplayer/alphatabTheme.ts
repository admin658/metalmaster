// A practical dark/metal baseline. You can get way more detailed later.
export const alphaTabSettingsJson = {
  // Rendering
  core: {
    // engine: "svg" // optional; alphaTab chooses sensible defaults
    fontDirectory: "/alphatab/font/",
    // Explicitly point to the bundled UMD build so worker resolution doesn't break in Next.js
    scriptFile: "/alphatab/alphaTab.js",
    // Keep it on the main thread to avoid importScripts issues in Next app-router
    useWorkers: false,
  },
  display: {
    // Try horizontal scrolling layouts later when you enable cursor scrolling.
  },

  // Player defaults
  player: {
    // These are "settings" defaults. Runtime speed/seek we set via API props.
    enablePlayer: true,
    soundFont: "/alphatab/soundfont/sonivox.sf2",
    percussionSoundFont: "/alphatab/soundfont/sonivox.sf2",
  },

  // Notation visibility toggles you can wire to your overlay chips later.
  notation: {
    // elements is a Map internally; JSON supports enum names case-insensitive. :contentReference[oaicite:9]{index=9}
  },
} as const;
