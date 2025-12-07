"""Simple helper to generate a sample WAV for manual testing.

Run from the repo root:

python packages/api/tests/generate_sample_wav.py packages/api/tests/sample.wav

"""
import sys
import numpy as np
import soundfile as sf


def make_sample_wav(path, sr=22050):
    t1 = np.linspace(0, 0.5, int(sr * 0.5), endpoint=False)
    t2 = np.linspace(0, 0.4, int(sr * 0.4), endpoint=False)
    note1 = 0.2 * np.sin(2 * np.pi * 329.63 * t1)
    note2 = 0.2 * np.sin(2 * np.pi * 392.00 * t2)
    audio = np.concatenate([note1, np.zeros(int(sr * 0.1)), note2])
    sf.write(path, audio, sr, subtype='PCM_16')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python generate_sample_wav.py <output_path>')
        sys.exit(1)
    make_sample_wav(sys.argv[1])
    print('Wrote', sys.argv[1])
