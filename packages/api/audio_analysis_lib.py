import librosa
import numpy as np
import torch
from typing import Callable, Dict, Any, List

try:
    from .tone_preset import TonePreset
except ImportError:  # pragma: no cover - allow direct module usage
    from tone_preset import TonePreset

# Placeholder PyTorch model for palm-mute and pick attack detection
class DummyPalmMuteModel(torch.nn.Module):
    def forward(self, audio_tensor):
        # Simulate palm-mute depth detection
        return torch.tensor([0.5])  # 0.0 (no mute) to 1.0 (full mute)

class DummyPickAttackModel(torch.nn.Module):
    def forward(self, audio_tensor):
        # Simulate pick attack consistency scoring
        return torch.tensor([0.8])  # 0.0 (inconsistent) to 1.0 (consistent)

palm_mute_model = DummyPalmMuteModel()
pick_attack_model = DummyPickAttackModel()

library_presets: List[TonePreset] = []
library_feature_list: List[Dict[str, float]] = []

# Optional hook for audio rendering (DI -> preset -> audio).
simulate_audio: Callable[[TonePreset], np.ndarray] | None = None

def analyze_guitar_audio(audio_path: str, sr: int = 22050) -> Dict[str, Any]:
    y, _ = librosa.load(audio_path, sr=sr)
    # 1. Extract transients (onsets)
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr, backtrack=True)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)

    # 2. Measure note timing accuracy (assume target grid is regular 16th notes for demo)
    if len(onset_times) > 1:
        intervals = np.diff(onset_times)
        mean_interval = np.mean(intervals)
        std_interval = np.std(intervals)
        timing_accuracy = float(np.clip(1.0 - std_interval / mean_interval, 0, 1))
    else:
        timing_accuracy = 0.0

    # 3. Detect palm-mute depth (dummy model)
    audio_tensor = torch.tensor(y, dtype=torch.float32)
    palm_mute_depth = float(palm_mute_model(audio_tensor).item())

    # 4. Score pick attack consistency (dummy model)
    pick_attack_score = float(pick_attack_model(audio_tensor).item())

    return {
        "transients": onset_times.tolist(),
        "timing_accuracy": timing_accuracy,
        "palm_mute_depth": palm_mute_depth,
        "pick_attack_score": pick_attack_score
    }


def analyze_guitar_tone(audio_samples: np.ndarray, sample_rate: int) -> Dict[str, float]:
    features: Dict[str, float] = {}

    if audio_samples.size == 0:
        return {
            "spectral_centroid_hz": 0.0,
            "band_low_ratio": 0.0,
            "band_mid_ratio": 0.0,
            "band_high_ratio": 0.0,
            "band_fizz_ratio": 0.0,
            "spectral_tilt": 0.0,
            "RMS": 0.0,
            "crest_factor": 0.0,
            "noise_floor": 0.0,
        }

    if audio_samples.ndim > 1:
        audio = librosa.to_mono(audio_samples)
    else:
        audio = audio_samples

    rms = float(np.sqrt(np.mean(audio**2) + 1e-12))
    features["RMS"] = rms

    centroid = librosa.feature.spectral_centroid(y=audio, sr=sample_rate)
    features["spectral_centroid_hz"] = float(np.mean(centroid))

    n_fft = 4096
    S = np.abs(librosa.stft(audio, n_fft=n_fft)) ** 2
    freqs = librosa.fft_frequencies(sr=sample_rate, n_fft=n_fft)
    psd = np.mean(S, axis=1)
    total_power = float(np.sum(psd))

    bands = {
        "low": (20.0, 250.0),
        "mid": (250.0, 2000.0),
        "high": (2000.0, 8000.0),
        "fizz": (8000.0, 12000.0),
    }
    for band_name, (low_f, high_f) in bands.items():
        band_mask = (freqs >= low_f) & (freqs < high_f)
        band_power = float(np.sum(psd[band_mask]))
        features[f"band_{band_name}_ratio"] = band_power / (total_power + 1e-9)

    freq_mask = (freqs >= 50.0) & (freqs <= 10000.0)
    log_freqs = np.log10(freqs[freq_mask] + 1e-9)
    log_psd = np.log10(psd[freq_mask] + 1e-12)
    if log_freqs.size > 0:
        A = np.vstack([log_freqs, np.ones_like(log_freqs)]).T
        m, _ = np.linalg.lstsq(A, log_psd, rcond=None)[0]
        features["spectral_tilt"] = float(m)
    else:
        features["spectral_tilt"] = 0.0

    peak = float(np.max(np.abs(audio)))
    features["crest_factor"] = peak / (rms + 1e-9)

    threshold = peak * (10 ** (-60 / 20))
    if threshold > 0.0:
        silent_parts = audio[np.abs(audio) < threshold]
        if silent_parts.size > 0:
            noise_rms = float(np.sqrt(np.mean(silent_parts**2) + 1e-12))
        else:
            noise_rms = rms
    else:
        noise_rms = rms
    features["noise_floor"] = noise_rms

    return features


def _distance(feat1: Dict[str, float], feat2: Dict[str, float], keys: List[str] | None = None) -> float:
    if keys is None:
        keys = [
            "band_low_ratio",
            "band_mid_ratio",
            "band_high_ratio",
            "band_fizz_ratio",
            "spectral_centroid_hz",
        ]
    d = 0.0
    for key in keys:
        d += (feat1.get(key, 0.0) - feat2.get(key, 0.0)) ** 2
    return float(np.sqrt(d))


def _clamp_0_1(value: float) -> float:
    return float(max(0.0, min(1.0, value)))


def suggest_tone(target_features: Dict[str, float]) -> TonePreset:
    best_idx = None
    best_dist = float("inf")
    for i, lib_feat in enumerate(library_feature_list):
        dist = _distance(target_features, lib_feat)
        if dist < best_dist:
            best_dist = dist
            best_idx = i

    if best_idx is None:
        base_preset = TonePreset()
    else:
        base_preset = library_presets[best_idx]

    if simulate_audio is None:
        return base_preset

    best_preset = TonePreset(**vars(base_preset))
    best_features = analyze_guitar_tone(simulate_audio(best_preset), sample_rate=44100)
    best_score = _distance(target_features, best_features)

    steps = (-0.1, 0.1)
    for param in ("amp_bass", "amp_mid", "amp_treble"):
        for step in steps:
            new_preset = TonePreset(**vars(best_preset))
            value = _clamp_0_1(getattr(best_preset, param) + step)
            setattr(new_preset, param, value)
            new_feat = analyze_guitar_tone(simulate_audio(new_preset), sample_rate=44100)
            new_score = _distance(target_features, new_feat)
            if new_score < best_score:
                best_score = new_score
                best_preset = new_preset

    return best_preset

# Example usage:
# result = analyze_guitar_audio("example.wav")
# print(result)
