from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
from typing import List, Optional
import librosa
import numpy as np
import torch
import uuid
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dummy ML models
class DummyPalmMuteModel(torch.nn.Module):
    def forward(self, audio_tensor):
        return torch.tensor([0.5])
class DummyPickAttackModel(torch.nn.Module):
    def forward(self, audio_tensor):
        return torch.tensor([0.8])
palm_mute_model = DummyPalmMuteModel()
pick_attack_model = DummyPickAttackModel()

class FeedbackResult(BaseModel):
    accuracy: float
    timing_deviation: float
    noise_score: float
    pick_attack_score: float
    raw_data: Dict

@app.post("/feedback", response_model=FeedbackResult)
async def analyze_feedback(file: UploadFile = File(...)):
    if file.content_type not in ["audio/wav", "audio/mpeg", "audio/x-wav"]:
        raise HTTPException(status_code=400, detail="Invalid audio file type.")
    temp_path = f"/tmp/{uuid.uuid4()}.wav"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    y, sr = librosa.load(temp_path, sr=22050)
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr, backtrack=True)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)
    if len(onset_times) > 1:
        intervals = np.diff(onset_times)
        mean_interval = np.mean(intervals)
        std_interval = np.std(intervals)
        accuracy = float(np.clip(1.0 - std_interval / mean_interval, 0, 1))
        timing_deviation = float(std_interval)
    else:
        accuracy = 0.0
        timing_deviation = 0.0
    audio_tensor = torch.tensor(y, dtype=torch.float32)
    noise_score = float(np.clip(np.mean(np.abs(y)), 0, 1))
    palm_mute_depth = float(palm_mute_model(audio_tensor).item())
    pick_attack_score = float(pick_attack_model(audio_tensor).item())
    os.remove(temp_path)
    return FeedbackResult(
        accuracy=accuracy,
        timing_deviation=timing_deviation,
        noise_score=noise_score,
        pick_attack_score=pick_attack_score,
        raw_data={"onsets": onset_times.tolist()}
    )


class AnalyzeResult(BaseModel):
    tempo: float
    timing_accuracy: float
    onset_times: Dict


@app.post("/analyze", response_model=AnalyzeResult)
async def analyze_onsets(file: UploadFile = File(...)):
    if file.content_type not in ["audio/wav", "audio/mpeg", "audio/x-wav"]:
        raise HTTPException(status_code=400, detail="Invalid audio file type.")
    import tempfile

    data = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tf:
        tf.write(data)
        temp_path = tf.name
    try:
        y, sr = librosa.load(temp_path, sr=22050)
        # Onset detection
        onset_frames = librosa.onset.onset_detect(y=y, sr=sr, backtrack=True)
        onset_times = librosa.frames_to_time(onset_frames, sr=sr)
        # Tempo estimation (beats per minute)
        tempo_est = librosa.beat.tempo(y=y, sr=sr)
        tempo = float(np.mean(tempo_est)) if len(tempo_est) > 0 else 0.0
        # Timing accuracy: use variability of inter-onset intervals
        if len(onset_times) > 1:
            intervals = np.diff(onset_times)
            mean_interval = np.mean(intervals)
            std_interval = np.std(intervals)
            timing_accuracy = float(np.clip(1.0 - (std_interval / mean_interval), 0, 1))
        else:
            timing_accuracy = 0.0
    finally:
        try:
            os.remove(temp_path)
        except Exception:
            pass

    return AnalyzeResult(tempo=tempo, timing_accuracy=timing_accuracy, onset_times={"onsets": onset_times.tolist()})

# Run: uvicorn ai_feedback_api:app --reload


class DetectedNote(BaseModel):
    start: float
    end: Optional[float]
    midi: int
    note: str


class TabMapping(BaseModel):
    string: int
    fret: int


class GenerateTabResult(BaseModel):
    detected_notes: List[DetectedNote]
    simple_tab: List[Dict]


def midi_to_name(midi: int) -> str:
    names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    name = names[midi % 12]
    octave = (midi // 12) - 1
    return f"{name}{octave}"


def map_midi_to_guitar(midi: int):
    # Standard tuning E2 A2 D3 G3 B3 E4
    open_strings = [40, 45, 50, 55, 59, 64]
    candidates = []
    for idx, open_m in enumerate(open_strings):
        string_number = 6 - idx
        fret = midi - open_m
        if 0 <= fret <= 24:
            candidates.append((string_number, int(fret)))
    if candidates:
        # choose smallest fret, prefer lower-pitched string on ties
        chosen = min(candidates, key=lambda x: (x[1], -x[0]))
        return {"string": chosen[0], "fret": chosen[1]}
    # if no direct playable candidate, choose nearest fret (may be negative or high)
    best = None
    best_dist = None
    for idx, open_m in enumerate(open_strings):
        string_number = 6 - idx
        fret = midi - open_m
        dist = abs(fret)
        if best is None or dist < best_dist:
            best = (string_number, int(fret))
            best_dist = dist
    return {"string": best[0], "fret": best[1]}


@app.post("/generate-tab", response_model=GenerateTabResult)
async def generate_tab(file: UploadFile = File(...)):
    """Generate a simple guitar tab from an uploaded audio file using Spotify Basic Pitch.

    The endpoint attempts to import and run `basic_pitch`. If the package is not available,
    it returns HTTP 501 (Not Implemented).
    """
    if file.content_type not in ["audio/wav", "audio/mpeg", "audio/x-wav"]:
        raise HTTPException(status_code=400, detail="Invalid audio file type.")
    import tempfile

    data = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tf:
        tf.write(data)
        temp_path = tf.name
    try:
        # Try to import Basic Pitch inference functions
        try:
            from basic_pitch.inference import predict_file
            predictor = predict_file
        except Exception:
            try:
                from basic_pitch.inference import predict
                predictor = predict
            except Exception:
                predictor = None

        if predictor is None:
            raise HTTPException(status_code=501, detail="basic_pitch is not installed in the environment.")

        # Call predictor. Different versions of basic_pitch may return different shapes.
        predictions = None
        try:
            # Many builds provide predict_file(path) returning a dict/list
            predictions = predictor(temp_path)
        except TypeError:
            # Some predictors may expect audio arrays — fall back to librosa + predict
            try:
                y, sr = librosa.load(temp_path, sr=22050)
                predictions = predictor(y, sr)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"basic_pitch prediction failed: {e}")

        # Normalize predicted notes
        raw_notes = None
        if isinstance(predictions, dict) and 'notes' in predictions:
            raw_notes = predictions['notes']
        elif isinstance(predictions, list):
            raw_notes = predictions
        else:
            raw_notes = getattr(predictions, 'notes', None)

        if raw_notes is None:
            raise HTTPException(status_code=500, detail="Unexpected basic_pitch output format")

        detected = []
        simple_tab = []
        for n in raw_notes:
            # support dict-like or object-like note representations
            if isinstance(n, dict):
                start = float(n.get('start', n.get('start_time', n.get('start_seconds', 0.0))))
                end = n.get('end', n.get('end_time', n.get('end_seconds', None)))
                pitch = n.get('midi', n.get('pitch', n.get('pitch_number', None)))
            else:
                # object with attributes
                start = float(getattr(n, 'start', getattr(n, 'start_time', 0.0)))
                end = getattr(n, 'end', getattr(n, 'end_time', None))
                pitch = getattr(n, 'midi', getattr(n, 'pitch', None))
            if pitch is None:
                # try pitch name -> midi conversion not implemented here, skip
                continue
            midi_val = int(pitch)
            note_name = midi_to_name(midi_val)
            detected.append(DetectedNote(start=start, end=(None if end is None else float(end)), midi=midi_val, note=note_name))
            mapping = map_midi_to_guitar(midi_val)
            simple_tab.append({"start": start, "string": mapping['string'], "fret": mapping['fret'], "note": note_name})
    finally:
        try:
            os.remove(temp_path)
        except Exception:
            pass

    return GenerateTabResult(detected_notes=detected, simple_tab=simple_tab)

