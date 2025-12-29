import importlib
import wave

import numpy as np
from fastapi.testclient import TestClient
import pytest


def make_sample_wav(path, sr=22050):
    t1 = np.linspace(0, 0.5, int(sr * 0.5), endpoint=False)
    t2 = np.linspace(0, 0.4, int(sr * 0.4), endpoint=False)
    note1 = 0.2 * np.sin(2 * np.pi * 329.63 * t1)
    note2 = 0.2 * np.sin(2 * np.pi * 392.00 * t2)
    audio = np.concatenate([note1, np.zeros(int(sr * 0.1)), note2])
    pcm = (audio * 32767).astype(np.int16)
    with wave.open(path, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sr)
        wav_file.writeframes(pcm.tobytes())


@pytest.fixture
def sample_wav_path(tmp_path):
    p = tmp_path / "sample.wav"
    make_sample_wav(str(p))
    return str(p)


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv("AUDIO_ANALYSIS_ENABLED", "true")
    import audio_analysis_service

    importlib.reload(audio_analysis_service)
    return TestClient(audio_analysis_service.app)


def _post_audio(client, path, endpoint):
    with open(path, "rb") as f:
        files = {"file": ("sample.wav", f, "audio/wav")}
        return client.post(endpoint, files=files)


def test_timing_endpoint(client, sample_wav_path):
    resp = _post_audio(client, sample_wav_path, "/analyze/timing")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert 0.0 <= data["metric"] <= 1.0
    assert "timing_deviation_ms" in data["details"]
    assert "onset_count" in data["details"]


def test_noise_endpoint(client, sample_wav_path):
    resp = _post_audio(client, sample_wav_path, "/analyze/noise")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert 0.0 <= data["metric"] <= 1.0
    assert "noise_floor_db" in data["details"]
    assert "noise_score" in data["details"]


def test_pick_attack_endpoint(client, sample_wav_path):
    resp = _post_audio(client, sample_wav_path, "/analyze/pick-attack")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert 0.0 <= data["metric"] <= 1.0
    assert "attack_sharpness" in data["details"]
    assert "attack_consistency" in data["details"]
    assert "onset_count" in data["details"]
