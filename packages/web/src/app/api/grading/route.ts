import { NextResponse } from "next/server";
import { gradePerformance } from "@/lib/grading/gradingEngine";
import type { ExpectedNote, PerformanceGradeResult } from "@metalmaster/shared";
import * as wav from "node-wav"; // Dependency: npm install node-wav @types/node-wav

// Next.js Route Handler for POST /api/grading
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Parse the incoming form data (expects a file and pieceId or expected notes data)
    const formData = await request.formData();
    const file = formData.get("file");
    const pieceId = formData.get("pieceId") as string | null;
    const expectedNotesPayload = formData.get("expectedNotes") as string | null;
    const bpmPayload = formData.get("bpm") as string | null;
    // (If using JSON instead of FormData, you would parse JSON similarly)

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }
    // file could be a Blob in this context (Next.js will provide a Blob for file uploads)
    const fileData = Buffer.from(await (file as Blob).arrayBuffer());

    // Decode audio file to PCM samples
    // Accept only WAV or WebM (Opus) as per spec. For MVP, implement WAV decoding.
    let audioSamples: Float32Array;
    let sampleRate: number;
    // Determine file format by header or filename
    if (fileData.slice(0, 4).toString() === "RIFF") {
      // WAV format
      const wavData = wav.decode(fileData);
      sampleRate = wavData.sampleRate;
      const channels = wavData.channelData;
      // Mix down to mono if not already
      if (channels.length > 1) {
        const length = channels[0].length;
        const mono = new Float32Array(length);
        for (let i = 0; i < length; i++) {
          let sum = 0;
          for (let ch = 0; ch < channels.length; ch++) {
            sum += channels[ch][i];
          }
          mono[i] = sum / channels.length;
        }
        audioSamples = mono;
      } else {
        audioSamples = channels[0];
      }
    } else {
      // For WebM/Opus or other formats, we would need to use a decoder (e.g., ffmpeg or audio-decode library)
      // TODO: Implement WebM (Opus) decoding if needed (possibly using ffmpeg WASM or server-side ffmpeg).
      return NextResponse.json(
        { error: "Unsupported audio format (only PCM WAV supported in MVP)" },
        { status: 400 },
      );
    }

    // Retrieve expected note timing data for the piece.
    let expectedNotes: ExpectedNote[] = [];
    let tempoBpm: number | undefined = undefined;
    if (bpmPayload) {
      const parsedBpm = Number(bpmPayload);
      tempoBpm = Number.isFinite(parsedBpm) ? parsedBpm : undefined;
    }
    if (pieceId) {
      // TODO: Fetch expectedNotes and tempo from database (Supabase) or cache using the pieceId.
      // This could involve querying a table that stores note timings (and possibly tempo and time signatures).
      // For now, we will assume this data is available. If not, we cannot proceed.
      // Example (pseudo-code):
      // const { data } = await supabase.from('SongNotes').select('time, barNumber').eq('pieceId', pieceId);
      // expectedNotes = data;
      // Also fetch tempo if stored: tempoBpm = (await supabase.from('Songs').select('bpm').eq('id', pieceId)).data?.[0]?.bpm;
      return NextResponse.json({ error: "Expected note data not provided" }, { status: 400 });
    } else if (expectedNotesPayload) {
      try {
        const parsedNotes = JSON.parse(expectedNotesPayload) as ExpectedNote[];
        if (!Array.isArray(parsedNotes)) {
          return NextResponse.json({ error: "Expected notes must be an array" }, { status: 400 });
        }
        expectedNotes = parsedNotes;
      } catch {
        return NextResponse.json({ error: "Invalid expected notes JSON" }, { status: 400 });
      }
    } else {
      return NextResponse.json(
        { error: "No pieceId or expected notes provided" },
        { status: 400 },
      );
    }

    // Call the grading engine to get the performance result
    const gradingResult: PerformanceGradeResult = await gradePerformance(
      audioSamples,
      sampleRate,
      expectedNotes,
      { toleranceMs: undefined, bpm: tempoBpm },
    );

    // Respond with the grading result as JSON
    return NextResponse.json(gradingResult);
  } catch (err: any) {
    console.error("Error in grading route:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message ?? err.toString() },
      { status: 500 },
    );
  }
}
