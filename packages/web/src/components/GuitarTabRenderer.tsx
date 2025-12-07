import type { TabBeat, TabMeasure, TabSong } from '@metalmaster/shared-types';
import React, { useEffect, useMemo, useRef } from 'react';
import * as Vex from 'vexflow';

interface LegacyTabShape {
  title?: string;
  measures: Array<{
    notes: Array<{
      string: number;
      fret: number;
    }>;
  }>;
}

/**
 * Props for GuitarTabRenderer component.
 * Supports synchronized playback highlighting and multi-track rendering.
 */
export interface GuitarTabRendererProps {
  song?: TabSong;
  /**
   * Legacy tab shape for simple render-only scenarios.
   */
  tab?: LegacyTabShape;
  /**
   * Canvas width in pixels. Default: 760.
   */
  width?: number;
  /**
   * Canvas height in pixels. Default: 220.
   */
  height?: number;
  /**
   * Current playback time in seconds (used for synchronized highlighting).
   */
  currentTime?: number;
  /**
   * ID of the selected track to highlight or emphasize.
   */
  selectedTrackId?: string;
  /**
   * Deprecated: use selectedTrackId instead. Kept for backwards compatibility.
   */
  highlightedTrackId?: string;
  /**
   * ID of the active beat from the sync engine.
   */
  activeBeatId?: string;
}

const groupBeatsByMeasure = (
  beats: TabBeat[],
  timeSignature?: TabSong['timeSignature']
): TabMeasure[] => {
  const grouped: Record<number, TabBeat[]> = {};
  beats.forEach((beat) => {
    grouped[beat.measureIndex] = grouped[beat.measureIndex] || [];
    grouped[beat.measureIndex].push(beat);
  });

  return Object.entries(grouped).map(([idx, beatsInMeasure]) => {
    const sorted = [...beatsInMeasure].sort((a, b) => a.timeSeconds - b.timeSeconds);
    const startSeconds = sorted[0]?.timeSeconds ?? 0;
    const endSeconds =
      (sorted[sorted.length - 1]?.timeSeconds ?? startSeconds) +
      (sorted[sorted.length - 1]?.durationSeconds ?? 0);

    return {
      index: Number(idx),
      startSeconds,
      endSeconds,
      beats: sorted,
      timeSignature,
    };
  });
};

export const GuitarTabRenderer: React.FC<GuitarTabRendererProps> = ({
  song,
  tab,
  width = 760,
  height = 220,
  currentTime,
  selectedTrackId,
  highlightedTrackId,
  activeBeatId,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const measures: TabMeasure[] = useMemo(() => {
    if (song?.measures && song.measures.length) return song.measures;
    if (song?.beats && song.beats.length) {
      return groupBeatsByMeasure(song.beats, song.timeSignature);
    }
    if (tab?.measures?.length) {
      const beatDuration = 60 / Math.max(song?.bpm ?? 120, 1);
      return tab.measures.map((measure, idx) => ({
        index: idx,
        startSeconds: idx * beatDuration * 4,
        endSeconds: (idx + 1) * beatDuration * 4,
        beats: [
          {
            id: `legacy-m${idx}`,
            timeSeconds: idx * beatDuration * 4,
            durationSeconds: beatDuration * 4,
            measureIndex: idx,
            beatIndex: 0,
            trackId: song?.tracks[0]?.id ?? 'track-0',
            notes: measure.notes.map((n) => ({ string: n.string, fret: n.fret })),
          },
        ],
        timeSignature: song?.timeSignature,
      }));
    }
    return [];
  }, [song, tab]);

  const activeBeat = useMemo(() => {
    if (activeBeatId && song?.beats) {
      return song.beats.find((beat) => beat.id === activeBeatId) ?? null;
    }
    if (currentTime != null && song?.beats) {
      return (
        song.beats.find(
          (beat) =>
            currentTime >= beat.timeSeconds && currentTime < beat.timeSeconds + beat.durationSeconds
        ) ?? null
      );
    }
    return null;
  }, [activeBeatId, currentTime, song?.beats]);

  const highlightTrackId = highlightedTrackId || selectedTrackId;

  useEffect(() => {
    if (!canvasRef.current || !measures.length) return;
    canvasRef.current.innerHTML = '';
    const VF = Vex;
    const renderer = new VF.Renderer(canvasRef.current, VF.Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();
    context.setFont('Arial', 10, '').setBackgroundFillStyle('#222');

    // Draw title
    const title = song?.title ?? tab?.title ?? 'Tab';
    if (title) {
      context.fillText(title, 10, 20);
    }

    const stave = new VF.TabStave(10, 40, width - 20);
    stave.addClef('tab').addTimeSignature('4/4');
    stave.setContext(context).draw();

    const tabNotes: any[] = [];
    measures.forEach((measure) => {
      measure.beats.forEach((beat) => {
        const highlightBeat =
          (activeBeat && activeBeat.id === beat.id) ||
          (currentTime != null &&
            currentTime >= beat.timeSeconds &&
            currentTime < beat.timeSeconds + beat.durationSeconds);
        const highlightTrack = highlightTrackId && beat.trackId === highlightTrackId;

        const positions =
          beat.notes.length > 0
            ? beat.notes.map((note) => ({ str: note.string, fret: note.fret }))
            : [{ str: 3, fret: 0 }];

        const tabNote: any = new VF.TabNote({
          positions,
          duration: 'q',
        });

        // Make all notes bright neon green for maximum contrast on the dark theme.
        // Keep a slightly thicker line so the notes read clearly at small sizes.
        tabNote.setStyle({
          fillStyle: '#39FF14',
          strokeStyle: '#39FF14',
          lineWidth: 2,
        });

        tabNotes.push(tabNote);
      });
    });

    if (!tabNotes.length) return;

    const voice = new VF.Voice({ numBeats: tabNotes.length, beatValue: 4 });
    voice.addTickables(tabNotes);
    const formatter = new VF.Formatter();
    formatter.joinVoices([voice]).format([voice], width - 40);
    voice.draw(context, stave);
  }, [activeBeat, currentTime, highlightTrackId, measures, song?.title, tab?.title, width, height]);

  return (
    <div
      ref={canvasRef}
      style={{
        width,
        height,
        background: 'linear-gradient(to bottom, #1a1a1a, #0f0f0f)',
        borderRadius: 8,
        overflow: 'auto',
        border: '1px solid rgba(248, 113, 113, 0.2)',
      }}
    />
  );
};

export default GuitarTabRenderer;
