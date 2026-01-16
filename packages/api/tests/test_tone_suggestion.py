import numpy as np

import audio_analysis_lib


def _synth_audio(preset: audio_analysis_lib.TonePreset, sr: int = 44100) -> np.ndarray:
    duration = 0.25
    t = np.linspace(0.0, duration, int(sr * duration), endpoint=False)
    low = (0.2 + preset.amp_bass) * np.sin(2 * np.pi * 120.0 * t)
    mid = (0.2 + preset.amp_mid) * np.sin(2 * np.pi * 800.0 * t)
    high = (0.2 + preset.amp_treble) * np.sin(2 * np.pi * 4000.0 * t)
    return low + mid + high


def test_suggest_tone_improves_distance(monkeypatch):
    base = audio_analysis_lib.TonePreset(amp_bass=0.4, amp_mid=0.4, amp_treble=0.4)
    closer = audio_analysis_lib.TonePreset(amp_bass=0.5, amp_mid=0.5, amp_treble=0.5)
    farther = audio_analysis_lib.TonePreset(amp_bass=0.1, amp_mid=0.1, amp_treble=0.1)

    def simulate(preset: audio_analysis_lib.TonePreset) -> np.ndarray:
        return _synth_audio(preset)

    monkeypatch.setattr(audio_analysis_lib, "simulate_audio", simulate)
    audio_analysis_lib.library_presets[:] = [closer, farther]
    audio_analysis_lib.library_feature_list[:] = [
        audio_analysis_lib.analyze_guitar_tone(simulate(closer), 44100),
        audio_analysis_lib.analyze_guitar_tone(simulate(farther), 44100),
    ]

    target_features = audio_analysis_lib.analyze_guitar_tone(simulate(base), 44100)
    suggested = audio_analysis_lib.suggest_tone(target_features)

    base_features = audio_analysis_lib.analyze_guitar_tone(simulate(closer), 44100)
    base_score = audio_analysis_lib._distance(target_features, base_features)
    suggested_features = audio_analysis_lib.analyze_guitar_tone(simulate(suggested), 44100)
    suggested_score = audio_analysis_lib._distance(target_features, suggested_features)

    assert suggested_score <= base_score + 1e-6
