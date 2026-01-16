from pathlib import Path
import sys

import numpy as np

sys.path.append(str(Path(__file__).resolve().parents[1]))

import audio_analysis_lib


def _synth_audio(preset: audio_analysis_lib.TonePreset, sr: int = 44100) -> np.ndarray:
    duration = 0.5
    t = np.linspace(0.0, duration, int(sr * duration), endpoint=False)
    low = (0.25 + preset.amp_bass) * np.sin(2 * np.pi * 120.0 * t)
    mid = (0.25 + preset.amp_mid) * np.sin(2 * np.pi * 800.0 * t)
    high = (0.2 + preset.amp_treble) * np.sin(2 * np.pi * 4000.0 * t)
    fizz = (0.05 + 0.15 * preset.amp_treble) * np.sin(2 * np.pi * 9000.0 * t)
    audio = low + mid + high + fizz
    rms = float(np.sqrt(np.mean(audio**2) + 1e-12))
    if rms > 0.0:
        audio = audio * (0.2 / rms)
    return audio


def test_no_ice_pick(monkeypatch):
    base = audio_analysis_lib.TonePreset(amp_bass=0.45, amp_mid=0.45, amp_treble=0.4)
    bright = audio_analysis_lib.TonePreset(amp_bass=0.2, amp_mid=0.2, amp_treble=0.9)

    def simulate(preset: audio_analysis_lib.TonePreset) -> np.ndarray:
        return _synth_audio(preset)

    monkeypatch.setattr(audio_analysis_lib, "simulate_audio", simulate)
    audio_analysis_lib.library_presets[:] = [base, bright]
    audio_analysis_lib.library_feature_list[:] = [
        audio_analysis_lib.analyze_guitar_tone(simulate(base), 44100),
        audio_analysis_lib.analyze_guitar_tone(simulate(bright), 44100),
    ]

    target_features = audio_analysis_lib.analyze_guitar_tone(simulate(base), 44100)
    suggested = audio_analysis_lib.suggest_tone(target_features)
    output_features = audio_analysis_lib.analyze_guitar_tone(simulate(suggested), 44100)

    ref_high = target_features.get("band_high_ratio", 0.0)
    out_high = output_features.get("band_high_ratio", 0.0)
    ref_fizz = target_features.get("band_fizz_ratio", 0.0)
    out_fizz = output_features.get("band_fizz_ratio", 0.0)
    ref_rms = target_features.get("RMS", 0.0)
    out_rms = output_features.get("RMS", 0.0)

    assert out_high <= ref_high + 0.05, (
        f"High frequencies too pronounced: {out_high} vs {ref_high}"
    )
    assert out_fizz <= ref_fizz + 0.05, (
        f"Fizz frequencies too high: {out_fizz} vs {ref_fizz}"
    )
    assert out_rms <= ref_rms * 1.1, (
        f"Output louder than reference by more than 10% (ref {ref_rms}, out {out_rms})"
    )
