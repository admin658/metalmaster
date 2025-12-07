import os
import sys
import tempfile
import types
import json
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient
import pytest

from ai_feedback_api import app


def make_sample_wav(path, sr=22050):
    # Generate two short sinusoidal notes (E4 ~329.63 Hz, G4 ~392.00 Hz)
    t1 = np.linspace(0, 0.5, int(sr * 0.5), endpoint=False)
    t2 = np.linspace(0, 0.4, int(sr * 0.4), endpoint=False)
    note1 = 0.2 * np.sin(2 * np.pi * 329.63 * t1)
    note2 = 0.2 * np.sin(2 * np.pi * 392.00 * t2)
    audio = np.concatenate([note1, np.zeros(int(sr * 0.1)), note2])
    sf.write(path, audio, sr, subtype='PCM_16')


@pytest.fixture
def sample_wav_path(tmp_path):
    p = tmp_path / "sample.wav"
    make_sample_wav(str(p))
    return str(p)


def inject_fake_basic_pitch():
    # Create a fake basic_pitch.inference module with predict_file
    inference_mod = types.SimpleNamespace()

    def predict_file(path):
        # Return a simple list of note dicts (start, end, midi)
        return [
            {"start": 0.0, "end": 0.5, "midi": 64},
            {"start": 0.6, "end": 1.0, "midi": 67},
        ]

    inference_mod.predict_file = predict_file
    fake_bp = types.SimpleNamespace(inference=inference_mod)
    sys.modules['basic_pitch'] = fake_bp
    sys.modules['basic_pitch.inference'] = inference_mod


def test_generate_tab_endpoint(sample_wav_path, monkeypatch):
    # Inject fake basic_pitch implementation
    inject_fake_basic_pitch()

    client = TestClient(app)
    with open(sample_wav_path, 'rb') as f:
        files = {"file": ("sample.wav", f, "audio/wav")}
        resp = client.post('/generate-tab', files=files)

    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert 'detected_notes' in data
    assert 'simple_tab' in data
    assert len(data['detected_notes']) == 2
    assert len(data['simple_tab']) == 2
    # Check mapping fields
    for entry in data['simple_tab']:
        assert 'string' in entry and 'fret' in entry and 'note' in entry
