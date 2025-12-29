/**
 * Types for the guitar performance grading results and inputs.
 */

export interface ExpectedNote {
  /** Expected note onset time in milliseconds from start of piece */
  time: number;
  /** Bar number (1-indexed) where this note occurs, as per the score */
  barNumber: number;
  // Future fields like pitch, string/fret, duration could be added here for pitch/technique grading.
}

/** Result of grading a single note's performance */
export interface NoteGradeResult {
  /** The expected onset time of the note (ms) */
  expectedTime: number;
  /** The detected actual onset time of the note (ms), or null if not played (miss) */
  detectedTime: number | null;
  /** Timing error in milliseconds (detectedTime - expectedTime). Negative = played early, positive = late, null if miss */
  timingErrorMs: number | null;
  /** Whether the note was played within the allowed timing window (hit) or missed */
  hit: boolean;
  /** Bar number in which this note resides (from the ExpectedNote data) */
  barNumber: number;
  // Optional: we could include a per-note timing score or pitch correctness fields in the future.
}

/** Aggregated grading results for a single bar (measure) of the piece */
export interface BarGradeResult {
  /** Bar number (1-indexed) */
  barNumber: number;
  /** List of note grading results for notes in this bar */
  notes: NoteGradeResult[];
  /** Count of notes hit in this bar */
  hitCount: number;
  /** Count of notes missed in this bar */
  missCount: number;
  /** Timing score for this bar (0–100) based on the notes' timing in this bar */
  score: number;
}

/** Overall performance grading result structure */
export interface PerformanceGradeResult {
  /** Overall performance score (0–100) combining all factors (currently just timing) */
  overallScore: number;
  /** Timing accuracy score (0–100) – identical to overallScore for now, but separated for future factors */
  timingScore: number;
  /** Per-note detailed results */
  notes: NoteGradeResult[];
  /** Per-bar aggregated results */
  bars: BarGradeResult[];
  /** Feedback flags highlighting notable aspects of performance (e.g., consistent timing issues) */
  feedbackFlags: string[];
}
