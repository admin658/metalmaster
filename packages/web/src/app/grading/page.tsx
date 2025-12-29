"use client";

import { useState } from "react";
import type { PerformanceGradeResult } from "@metalmaster/shared";
import TimingHeatmap from "@/components/grading/TimingHeatmap";

const EXPECTED_NOTES_PLACEHOLDER = `[
  { "time": 0, "barNumber": 1 },
  { "time": 500, "barNumber": 1 },
  { "time": 1000, "barNumber": 1 }
]`;

export default function GradingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pieceId, setPieceId] = useState("");
  const [expectedNotesJson, setExpectedNotesJson] = useState("");
  const [bpm, setBpm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PerformanceGradeResult | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Add a WAV file to grade.");
      return;
    }

    const trimmedPieceId = pieceId.trim();
    const trimmedExpectedNotes = expectedNotesJson.trim();
    if (!trimmedPieceId && !trimmedExpectedNotes) {
      setError("Provide a piece ID or expected notes JSON.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (trimmedPieceId) {
      formData.append("pieceId", trimmedPieceId);
    }
    if (!trimmedPieceId && trimmedExpectedNotes) {
      formData.append("expectedNotes", trimmedExpectedNotes);
    }
    if (bpm.trim()) {
      formData.append("bpm", bpm.trim());
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/grading", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Grading failed.");
      }
      const data = (await response.json()) as PerformanceGradeResult;
      setResult(data);
    } catch (err: any) {
      setError(err?.message ?? "Grading failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0c10] via-[#0f1117] to-black text-white">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-5 pb-16 pt-12 sm:px-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Grading Lab</p>
          <h1 className="font-display text-3xl sm:text-4xl">Timing analysis for clean takes</h1>
          <p className="text-gray-200 max-w-2xl">
            Upload a recorded take and compare it against expected note timings. Use a piece ID to
            pull notes from the server, or paste expected notes JSON for local testing.
          </p>
        </header>

        <section className="grid gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#14161f] via-[#10121a] to-black p-6 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
              <label className="grid gap-2 text-sm font-semibold text-gray-200">
                Performance WAV
                <input
                  type="file"
                  accept=".wav,audio/wav"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-gray-200 file:mr-4 file:rounded-full file:border-0 file:bg-amber-300/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-amber-100"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-gray-200">
                BPM (optional)
                <input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={bpm}
                  onChange={(event) => setBpm(event.target.value)}
                  placeholder="120"
                  className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-gray-200"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
              <label className="grid gap-2 text-sm font-semibold text-gray-200">
                Piece ID
                <input
                  type="text"
                  value={pieceId}
                  onChange={(event) => setPieceId(event.target.value)}
                  placeholder="song_123"
                  className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-gray-200"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-gray-200">
                Expected Notes JSON (optional)
                <textarea
                  value={expectedNotesJson}
                  onChange={(event) => setExpectedNotesJson(event.target.value)}
                  placeholder={EXPECTED_NOTES_PLACEHOLDER}
                  rows={6}
                  className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-gray-200"
                />
              </label>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-black shadow-[0_14px_45px_rgba(255,191,71,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgba(255,191,71,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Grading..." : "Run grading"}
              </button>
              <span className="text-xs uppercase tracking-[0.2em] text-gray-400">
                WAV only for MVP
              </span>
            </div>
          </form>
        </section>

        {result && (
          <section className="grid gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#12141c] via-[#0f1117] to-black p-6 shadow-[0_18px_60px_rgba(0,0,0,0.4)]">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Overall</p>
                <p className="mt-2 text-3xl font-semibold text-amber-200">{result.overallScore}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Timing</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-200">{result.timingScore}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Notes graded</p>
                <p className="mt-2 text-3xl font-semibold text-white">{result.notes.length}</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Feedback flags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.feedbackFlags.length > 0 ? (
                  result.feedbackFlags.map((flag) => (
                    <span
                      key={flag}
                      className="rounded-full border border-amber-300/40 bg-amber-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100"
                    >
                      {flag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-300">No flags detected.</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Timing heatmap</p>
              <div className="mt-4">
                <TimingHeatmap result={result} />
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
