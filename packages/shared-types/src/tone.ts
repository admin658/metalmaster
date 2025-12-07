export interface TonePreset {
  name: string;
  distortion: number;
  irFile: string | null;
  reverb: number;
  eq: {
    bass: number;
    mid: number;
    treble: number;
  };
}

export type TonePresetId = string;
