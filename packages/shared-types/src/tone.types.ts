export interface ToneSettings {
  artist: string;
  gear: string;
  amp: string;
  cab: string;
  pedals: string[];
  settings: {
    gain: string;
    bass: string;
    mid: string;
    treble: string;
    presence?: string;
    notes?: string;
  };
  description: string;
}
