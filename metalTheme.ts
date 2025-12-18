// metalTheme.ts
// High-contrast heavy metal color theme for alphaTab

export function attachMetalTheme(api: any) {
  api.scoreLoaded.on((score: any) => {
    applyMetalTheme(score);
    // alphaTab doesn't auto-detect style changes; force a re-layout + render
    api.render();
  });
}

// --- PALETTE ---------------------------------------------------------------
const METAL_PALETTE = {
  background: "#050608",   // near-black
  primary: "#ff1b2d",      // blood red
  secondary: "#f97316",    // fiery orange
  accent: "#22d3ee",       // toxic ice blue
  accent2: "#a855f7",      // neon purple
  muted: "#9ca3af",        // cool gray
  staffLine: "#4b5563",    // dark steel
  restGlyphs: "#e5e7eb",   // light gray for rests
};

// Fret -> color mapping for tab numbers + noteheads
const METAL_FRET_COLORS = new Map<number, string>([
  [0, METAL_PALETTE.accent2],  // open strings: purple
  [1, METAL_PALETTE.accent],
  [2, METAL_PALETTE.primary],
  [3, METAL_PALETTE.secondary],
  [5, METAL_PALETTE.accent],
  [7, METAL_PALETTE.primary],
  [9, METAL_PALETTE.secondary],
  [12, "#facc15"],             // octave: toxic yellow
  [15, METAL_PALETTE.accent2],
  [17, METAL_PALETTE.accent],
  [19, METAL_PALETTE.primary],
]);

function getFretColor(fret: number): string {
  return METAL_FRET_COLORS.get(fret) || METAL_PALETTE.muted;
}

// Optionally call this once on your container element for background:
export function applyMetalContainerStyles(container: HTMLElement | null) {
  if (!container) return;
  container.style.backgroundColor = METAL_PALETTE.background;
  container.style.color = METAL_PALETTE.muted;
}

// --- CORE THEME LOGIC ------------------------------------------------------

export function applyMetalTheme(score: any) {
  const m = (alphaTab as any).model;
  const Color = m.Color;

  // ---------- SCORE LEVEL (title, credits, etc.) ----------
  if (!score.style) {
    score.style = new m.ScoreStyle();
  }
  const scoreColors = score.style.colors;
  scoreColors.set(m.ScoreSubElement.Title, Color.fromJson(METAL_PALETTE.primary));
  scoreColors.set(m.ScoreSubElement.SubTitle, Color.fromJson(METAL_PALETTE.accent2));
  scoreColors.set(m.ScoreSubElement.Artist, Color.fromJson(METAL_PALETTE.accent));
  scoreColors.set(m.ScoreSubElement.Album, Color.fromJson(METAL_PALETTE.muted));
  scoreColors.set(m.ScoreSubElement.Copyright, Color.fromJson(METAL_PALETTE.muted));
  scoreColors.set(m.ScoreSubElement.CopyrightSecondLine, Color.fromJson(METAL_PALETTE.muted));
  scoreColors.set(m.ScoreSubElement.ChordDiagramList, Color.fromJson(METAL_PALETTE.accent));

  // ---------- TRACK / BAR / NOTE THEMING ----------
  for (const track of score.tracks) {
    // TRACK LEVEL (track name, tuning, braces)
    if (!track.style) {
      track.style = new m.TrackStyle();
    }
    const trackColors = track.style.colors;
    trackColors.set(m.TrackSubElement.TrackName, Color.fromJson(METAL_PALETTE.primary));
    trackColors.set(m.TrackSubElement.BracesAndBrackets, Color.fromJson(METAL_PALETTE.staffLine));
    trackColors.set(m.TrackSubElement.SystemSeparator, Color.fromJson(METAL_PALETTE.staffLine));
    trackColors.set(m.TrackSubElement.StringTuning, Color.fromJson(METAL_PALETTE.accent2));

    for (const staff of track.staves) {
      for (const bar of staff.bars) {
        // BAR LEVEL (staff lines, bar lines, bar numbers, clefs)
        if (!bar.style) {
          bar.style = new m.BarStyle();
        }
        const barColors = bar.style.colors;

        // Staff lines: dark steel
        barColors.set(m.BarSubElement.GuitarTabsStaffLine, Color.fromJson(METAL_PALETTE.staffLine));
        barColors.set(m.BarSubElement.StandardNotationStaffLine, Color.fromJson(METAL_PALETTE.staffLine));

        // Bar lines + numbers: light contrast + highlight
        barColors.set(m.BarSubElement.GuitarTabsBarLines, Color.fromJson(METAL_PALETTE.muted));
        barColors.set(m.BarSubElement.StandardNotationBarLines, Color.fromJson(METAL_PALETTE.muted));
        barColors.set(m.BarSubElement.GuitarTabsBarNumber, Color.fromJson(METAL_PALETTE.accent));
        barColors.set(m.BarSubElement.StandardNotationBarNumber, Color.fromJson(METAL_PALETTE.accent));

        // Clefs / signatures: subtle but readable
        barColors.set(m.BarSubElement.StandardNotationClef, Color.fromJson(METAL_PALETTE.muted));
        barColors.set(m.BarSubElement.GuitarTabsClef, Color.fromJson(METAL_PALETTE.muted));
        barColors.set(m.BarSubElement.StandardNotationTimeSignature, Color.fromJson(METAL_PALETTE.muted));
        barColors.set(m.BarSubElement.GuitarTabsTimeSignature, Color.fromJson(METAL_PALETTE.muted));
        barColors.set(m.BarSubElement.StandardNotationKeySignature, Color.fromJson(METAL_PALETTE.muted));

        for (const voice of bar.voices) {
          // VOICE LEVEL (generic glyphs – safety net)
          if (!voice.style) {
            voice.style = new m.VoiceStyle();
          }
          voice.style.colors.set(
            m.VoiceSubElement.Glyphs,
            Color.fromJson(METAL_PALETTE.restGlyphs)
          );

          for (const beat of voice.beats) {
            // BEAT LEVEL (stems, beams, tuplets, rests, beat-level effects)
            if (!beat.style) {
              beat.style = new m.BeatStyle();
            }
            const beatColors = beat.style.colors;

            // Standard notation stems / beams: fiery orange
            beatColors.set(m.BeatSubElement.StandardNotationStem, Color.fromJson(METAL_PALETTE.secondary));
            beatColors.set(m.BeatSubElement.StandardNotationFlags, Color.fromJson(METAL_PALETTE.secondary));
            beatColors.set(m.BeatSubElement.StandardNotationBeams, Color.fromJson(METAL_PALETTE.secondary));
            beatColors.set(m.BeatSubElement.StandardNotationTuplet, Color.fromJson(METAL_PALETTE.accent));

            // Tab stems / beams: icy accent
            beatColors.set(m.BeatSubElement.GuitarTabStem, Color.fromJson(METAL_PALETTE.accent));
            beatColors.set(m.BeatSubElement.GuitarTabFlags, Color.fromJson(METAL_PALETTE.accent));
            beatColors.set(m.BeatSubElement.GuitarTabBeams, Color.fromJson(METAL_PALETTE.accent));
            beatColors.set(m.BeatSubElement.GuitarTabTuplet, Color.fromJson(METAL_PALETTE.accent2));

            // Rests: high contrast light gray
            beatColors.set(m.BeatSubElement.StandardNotationRests, Color.fromJson(METAL_PALETTE.restGlyphs));
            beatColors.set(m.BeatSubElement.GuitarTabRests, Color.fromJson(METAL_PALETTE.restGlyphs));
            beatColors.set(m.BeatSubElement.SlashRests, Color.fromJson(METAL_PALETTE.restGlyphs));
            beatColors.set(m.BeatSubElement.NumberedRests, Color.fromJson(METAL_PALETTE.restGlyphs));

            for (const note of beat.notes) {
              // NOTE LEVEL (noteheads + tab numbers colored by fret)
              if (!note.style) {
                note.style = new m.NoteStyle();
              }
              const noteColors = note.style.colors;
              const fretColor = getFretColor(note.fret);

              // Standard notation notehead + accidentals
              noteColors.set(
                m.NoteSubElement.StandardNotationNoteHead,
                Color.fromJson(fretColor)
              );
              noteColors.set(
                m.NoteSubElement.StandardNotationAccidentals,
                Color.fromJson(fretColor)
              );

              // Tab fret number
              noteColors.set(
                m.NoteSubElement.GuitarTabFretNumber,
                Color.fromJson(fretColor)
              );

              // Optional: slash / numbered notations
              noteColors.set(
                m.NoteSubElement.SlashNoteHead,
                Color.fromJson(fretColor)
              );
              noteColors.set(
                m.NoteSubElement.NumberedNumber,
                Color.fromJson(fretColor)
              );
            }
          }
        }
      }
    }
  }
}

// Optional CommonJS export
declare const module: any;
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    attachMetalTheme,
    applyMetalTheme,
    applyMetalContainerStyles,
  };
}
