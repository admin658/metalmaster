from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import Dict, Tuple
import os
import tempfile

import librosa
import numpy as np
import uvicorn

app = FastAPI(title="Audio Analysis Service")
ANALYSIS_ENABLED = os.getenv("AUDIO_ANALYSIS_ENABLED", "false").lower() == "true"
TARGET_SAMPLE_RATE = 22050
MIN_DURATION_SECONDS = 0.2
MAX_DURATION_SECONDS = 120.0

def _ensure_analysis_enabled(feature: str) -> None:
    if not ANALYSIS_ENABLED:
        raise HTTPException(
            status_code=501,
            detail=f"{feature} analysis is placeholder-only. Set AUDIO_ANALYSIS_ENABLED=true to enable.",
        )

class AnalysisResult(BaseModel):
    metric: float
    details: Dict[str, float] = {}

async def _load_audio_from_upload(file: UploadFile, sr: int = TARGET_SAMPLE_RATE) -> Tuple[np.ndarray, int, float]:
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty audio file.")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp.write(raw)
            tmp.flush()
            tmp_path = tmp.name

        y, loaded_sr = librosa.load(tmp_path, sr=sr, mono=True)
        duration = float(librosa.get_duration(y=y, sr=loaded_sr))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Failed to read audio file.") from exc
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

    if duration < MIN_DURATION_SECONDS:
        raise HTTPException(status_code=400, detail="Audio clip too short for analysis.")
    if duration > MAX_DURATION_SECONDS:
        raise HTTPException(status_code=400, detail="Audio clip too long for analysis.")

    return y, loaded_sr, duration

def _timing_analysis(y: np.ndarray, sr: int) -> AnalysisResult:
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr, backtrack=True)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)
    onset_count = float(len(onset_times))
    if len(onset_times) < 2:
        return AnalysisResult(metric=0.0, details={"onset_count": onset_count, "timing_deviation_ms": 0.0})

    intervals = np.diff(onset_times)
    mean_interval = float(np.mean(intervals))
    std_interval = float(np.std(intervals))
    if mean_interval <= 0:
        return AnalysisResult(metric=0.0, details={"onset_count": onset_count, "timing_deviation_ms": 0.0})

    timing_score = float(np.clip(1.0 - (std_interval / mean_interval), 0.0, 1.0))
    timing_deviation_ms = float(std_interval * 1000.0)
    return AnalysisResult(
        metric=timing_score,
        details={"onset_count": onset_count, "timing_deviation_ms": timing_deviation_ms},
    )

def _noise_analysis(y: np.ndarray) -> AnalysisResult:
    rms = librosa.feature.rms(y=y).flatten()
    if rms.size == 0:
        return AnalysisResult(metric=0.0, details={"noise_floor_db": 0.0, "noise_score": 0.0})

    noise_floor = float(np.percentile(rms, 10))
    ref = float(np.max(rms)) if np.max(rms) > 0 else 1e-6
    noise_floor_db = float(librosa.amplitude_to_db(np.array([noise_floor]), ref=ref)[0])
    noise_score = float(np.clip(abs(noise_floor_db) / 60.0, 0.0, 1.0))
    return AnalysisResult(metric=noise_score, details={"noise_floor_db": noise_floor_db, "noise_score": noise_score})

def _pick_attack_analysis(y: np.ndarray, sr: int) -> AnalysisResult:
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    if onset_env.size == 0:
        return AnalysisResult(metric=0.0, details={"attack_sharpness": 0.0, "attack_consistency": 0.0})

    peaks = librosa.util.peak_pick(
        onset_env, pre_max=3, post_max=3, pre_avg=3, post_avg=3, delta=0.1, wait=5
    )
    if peaks.size == 0:
        peaks = np.array([int(np.argmax(onset_env))])

    peak_strengths = onset_env[peaks]
    mean_strength = float(np.mean(peak_strengths))
    max_strength = float(np.max(peak_strengths)) if np.max(peak_strengths) > 0 else 1e-6
    sharpness = float(np.clip(mean_strength / max_strength, 0.0, 1.0))
    variability = float(np.std(peak_strengths) / (mean_strength + 1e-6))
    consistency = float(np.clip(1.0 - variability, 0.0, 1.0))
    metric = float(np.clip((sharpness + consistency) / 2.0, 0.0, 1.0))
    return AnalysisResult(
        metric=metric,
        details={
            "attack_sharpness": sharpness,
            "attack_consistency": consistency,
            "onset_count": float(len(peaks)),
        },
    )

@app.post("/analyze/timing", response_model=AnalysisResult)
async def analyze_timing(file: UploadFile = File(...)):
    _ensure_analysis_enabled("Timing")
    if file.content_type not in ["audio/wav", "audio/mpeg", "audio/x-wav"]:
        raise HTTPException(status_code=400, detail="Invalid audio file type.")
    y, sr, _ = await _load_audio_from_upload(file)
    return _timing_analysis(y, sr)

@app.post("/analyze/noise", response_model=AnalysisResult)
async def analyze_noise(file: UploadFile = File(...)):
    _ensure_analysis_enabled("Noise")
    if file.content_type not in ["audio/wav", "audio/mpeg", "audio/x-wav"]:
        raise HTTPException(status_code=400, detail="Invalid audio file type.")
    y, _, _ = await _load_audio_from_upload(file)
    return _noise_analysis(y)

@app.post("/analyze/pick-attack", response_model=AnalysisResult)
async def analyze_pick_attack(file: UploadFile = File(...)):
    _ensure_analysis_enabled("Pick attack")
    if file.content_type not in ["audio/wav", "audio/mpeg", "audio/x-wav"]:
        raise HTTPException(status_code=400, detail="Invalid audio file type.")
    y, sr, _ = await _load_audio_from_upload(file)
    return _pick_attack_analysis(y, sr)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
