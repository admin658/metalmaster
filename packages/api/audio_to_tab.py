import librosa
import numpy as np
from typing import List, Tuple

# Dummy classifier for string/fret mapping (replace with ML model for real use)
def classify_fret_string(freq: float) -> Tuple[int, int]:
    # Standard tuning EADGBE, 6 strings
    string_freqs = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63]  # E2, A2, D3, G3, B3, E4
    for string, open_freq in enumerate(string_freqs[::-1], 1):  # 1 = high E
        for fret in range(0, 25):
            note_freq = open_freq * (2 ** (fret / 12))
            if abs(freq - note_freq) < 1.0:
                return (7 - string, fret)  # 0 = low E, 5 = high E
    return (None, None)

def detect_notes(y: np.ndarray, sr: int) -> List[Tuple[float, float]]:
    # Use librosa's pitch tracking
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr, fmin=75, fmax=1200)
    notes = []
    for t in range(pitches.shape[1]):
        index = magnitudes[:, t].argmax()
        freq = pitches[index, t]
        if freq > 0:
            notes.append((t * 512 / sr, freq))  # 512 = default hop_length
    return notes

def notes_to_tab(notes: List[Tuple[float, float]]) -> List[str]:
    tab_lines = ["e|", "B|", "G|", "D|", "A|", "E|"]
    last_time = 0
    for time, freq in notes:
        string, fret = classify_fret_string(freq)
        if string is not None and fret is not None:
            for i in range(6):
                if i == string:
                    tab_lines[i] += f"-{fret}-"
                else:
                    tab_lines[i] += "---"
        last_time = time
    return tab_lines

def audio_to_tab(audio_path: str) -> str:
    y, sr = librosa.load(audio_path, sr=22050)
    notes = detect_notes(y, sr)
    tab = notes_to_tab(notes)
    return "\n".join(tab)

# Example usage:
# print(audio_to_tab("guitar.wav"))
