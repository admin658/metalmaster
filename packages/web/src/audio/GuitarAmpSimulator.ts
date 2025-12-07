// packages/web/src/audio/GuitarAmpSimulator.ts
//
// High-quality guitar amp simulator using Tone.js.
// Chain: PolySynth → GainStage → Distortion → EQ3 → Convolver IR → Reverb → Destination
//
// Fully supports:
// - Preset switching
// - IR loading (cabinet simulation)
// - Runtime adjustments
// - Triggering notes from MIDI or alphaTab
// - Clean class-based API
//

import * as Tone from "tone";

// 🎛 Tone preset interface
export interface GuitarAmpPreset {
  name: string;
  gain: number;           // volume into the amp
  distortion: number;     // 0–1 amount
  eq: {
    bass: number;         // -20 to +20 dB
    mid: number;
    treble: number;
  };
  reverb: number;         // 0–1 wet
  irUrl: string | null;   // cabinet IR file url
}

export const DEFAULT_GUITAR_PRESET: GuitarAmpPreset = {
  name: "Metal Master Default",
  gain: 1.0,
  distortion: 0.75,
  eq: { bass: 6, mid: -4, treble: 3 },
  reverb: 0.12,
  irUrl: "/IRs/mesa-4x12.wav",
};

export class GuitarAmpSimulator {
  public input: Tone.Gain;
  private synth: Tone.PolySynth;
  private gainStage: Tone.Gain;
  private distortion: Tone.Distortion;
  private eq: Tone.EQ3;
  private convolver: Tone.Convolver;
  private reverb: Tone.Reverb;

  private currentPreset: GuitarAmpPreset = DEFAULT_GUITAR_PRESET;

  constructor(preset: GuitarAmpPreset = DEFAULT_GUITAR_PRESET) {
    // External input (for other sources) and internal synth
    this.input = new Tone.Gain({ gain: 1 });
    this.synth = new Tone.PolySynth(Tone.Synth, {
      volume: -12,
      oscillator: { type: "sawtooth" },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.9,
        release: 0.2,
      },
    });

    // Gain stage before distortion
    this.gainStage = new Tone.Gain(preset.gain);

    // Distortion before EQ/IR
    this.distortion = new Tone.Distortion({
      distortion: preset.distortion,
      oversample: "4x",
    });

    // 3-band amp-style EQ
    this.eq = new Tone.EQ3({
      low: preset.eq.bass,
      mid: preset.eq.mid,
      high: preset.eq.treble,
    });

    // Amp cabinet IR
    this.convolver = new Tone.Convolver(preset.irUrl ?? "");

    // Amp room reverb
    this.reverb = new Tone.Reverb({
      decay: 2.2,
      preDelay: 0.01,
      wet: preset.reverb,
    });

    // Final output chain
    this.input
      .connect(this.gainStage)
      .connect(this.distortion)
      .connect(this.eq)
      .connect(this.convolver)
      .connect(this.reverb)
      .toDestination();

    // Route internal synth through the same chain
    this.synth.connect(this.input);

    // Load preset IR
    if (preset.irUrl) {
      this.convolver.load(preset.irUrl);
    }
  }

  /** 🔥 Load and apply new tone preset at runtime */
  async loadPreset(preset: GuitarAmpPreset) {
    const next = {
      ...DEFAULT_GUITAR_PRESET,
      ...preset,
      eq: { ...DEFAULT_GUITAR_PRESET.eq, ...(preset?.eq ?? {}) },
    };
    this.currentPreset = next;

    this.gainStage.gain.value = next.gain;
    this.distortion.distortion = next.distortion;

    this.eq.low.value = next.eq.bass;
    this.eq.mid.value = next.eq.mid;
    this.eq.high.value = next.eq.treble;

    this.reverb.wet.value = next.reverb;

    if (next.irUrl) {
      await this.convolver.load(next.irUrl);
    } else {
      this.convolver.buffer = null;
    }
  }

  /** 🎵 Trigger a note using MIDI number + duration in seconds */
  triggerMidi(
    midi: number,
    duration: number = 0.3,
    velocity: number = 0.9
  ) {
    const freq = Tone.Frequency(midi, "midi").toFrequency();
    this.synth.triggerAttackRelease(freq, duration, undefined, velocity);
  }

  /** 🎸 Note-on only (useful if you want manual note-off) */
  noteOn(midi: number, velocity: number = 0.9) {
    const freq = Tone.Frequency(midi, "midi").toFrequency();
    this.synth.triggerAttack(freq, undefined, velocity);
  }

  /** 🎸 Note-off */
  noteOff(midi: number) {
    const freq = Tone.Frequency(midi, "midi").toFrequency();
    this.synth.triggerRelease(freq);
  }

  /** 🔇 Kill everything */
  stopAll() {
    this.synth.releaseAll();
  }

  /** 🔍 Get current preset */
  getPreset() {
    return this.currentPreset;
  }
}

export default GuitarAmpSimulator;
