/**
 * React component to visualize timing errors as a heatmap.
 * Each note is represented by a colored block, where color indicates timing accuracy.
 * Green = on time, blue = early, red = late, gray = missed.
 */
import React from "react";
import type { NoteGradeResult, PerformanceGradeResult } from "@metalmaster/shared";
import { DEFAULT_TOLERANCE_MS } from "@metalmaster/shared";

interface TimingHeatmapProps {
  result: PerformanceGradeResult;
}

// Optional: define max tolerance used for coloring (should match grading tolerance)
const MAX_TOLERANCE_MS = DEFAULT_TOLERANCE_MS;

/**
 * Convert a note's timing error to a color.
 * - On-time (0 ms) -> Green.
 * - Early -> Blue hues, Late -> Red hues (hue interpolation from blue to red through green).
 * - Miss -> Gray.
 */
function errorToColor(note: NoteGradeResult): string {
  if (!note.hit || note.timingErrorMs === null) {
    return "#888"; // Missed notes as gray
  }
  const errorMs = note.timingErrorMs;
  // Clamp the error to the maximum tolerance range for color mapping
  const clampedError = Math.max(-MAX_TOLERANCE_MS, Math.min(MAX_TOLERANCE_MS, errorMs));
  // Normalize error to [-1, 1] range
  const normalized = clampedError / MAX_TOLERANCE_MS;
  // Map normalized error to hue: -1 -> 240 (blue), 0 -> 120 (green), 1 -> 0 (red)
  const hue = 120 - normalized * 120;
  return `hsl(${hue}, 100%, 50%)`;
}

const TimingHeatmap: React.FC<TimingHeatmapProps> = ({ result }) => {
  return (
    <div className="timing-heatmap">
      {result.bars.map((bar) => (
        <div
          key={bar.barNumber}
          className="bar-row"
          style={{ whiteSpace: "nowrap", overflowX: "auto", margin: "4px 0" }}
        >
          <span style={{ display: "inline-block", width: "60px", color: "#444" }}>
            Bar {bar.barNumber}:
          </span>
          {bar.notes.map((note, idx) => {
            const color = errorToColor(note);
            // Prepare a tooltip describing the note timing
            let tooltip = "";
            if (!note.hit) {
              tooltip = "miss";
            } else if (note.timingErrorMs !== null) {
              const ms = Math.abs(note.timingErrorMs);
              if (ms < 1) {
                tooltip = "perfect"; // ~0ms error
              } else if (note.timingErrorMs < 0) {
                tooltip = `${ms.toFixed(0)}ms early`;
              } else if (note.timingErrorMs > 0) {
                tooltip = `${ms.toFixed(0)}ms late`;
              }
            }
            return (
              <span
                key={idx}
                className="note-cell"
                title={tooltip}
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  margin: "0 1px",
                  backgroundColor: color,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default TimingHeatmap;
