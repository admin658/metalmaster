# MetalMaster API (packages/api)

This package provides a small FastAPI-based audio analysis API used by the MetalMaster project. It contains endpoints for generating ML-backed feedback and an onset/tempo analysis route.

## Endpoints

- `POST /feedback`
  - Description: Runs the project's feedback analysis pipeline (dummy ML models in the repo) and returns a structured feedback response.
  - Request: multipart form upload with field `file` containing an audio file (WAV or MP3).
  - Response: JSON with fields such as `accuracy`, `timing_deviation`, `noise_score`, `pick_attack_score`, and `raw_data.onsets` (list of onset times in seconds).

- `POST /analyze`
  - Description: Runs onset detection and tempo estimation using `librosa` and returns tempo and a simple timing accuracy metric.
  - Request: multipart form upload with field `file` containing an audio file (WAV or MP3).
  - Response: JSON with:
    - `tempo`: estimated beats-per-minute (float)
    - `timing_accuracy`: a 0..1 metric where 1.0 indicates very consistent inter-onset intervals
    - `onset_times`: object containing `onsets`, a list of onset timestamps in seconds

## Requirements

Python dependencies are listed in `requirements.txt`. Key packages:

- `fastapi`, `uvicorn` - web framework and ASGI server
- `librosa` - audio feature extraction / onset detection / tempo estimation
- `numpy` - numerical operations
- `torch` - used by example/dummy models in the package
- `python-multipart` - for file uploads

Install in a virtual environment (recommended):

```powershell
cd f:\metalmaster\packages\api
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If `py -3` is not available, use the appropriate Python 3 executable on your system.

Note: `librosa` requires `soundfile` (and system libs) to read some audio formats. Installing via `pip` from `requirements.txt` will typically pull the needed packages; on some systems you may need OS-level packages for `libsndfile`.

## Run the API (development)

From the `packages/api` directory run:

```powershell
# From PowerShell
cd f:\metalmaster\packages\api
uvicorn ai_feedback_api:app --reload --host 0.0.0.0 --port 3000
```

## Examples

Test `/analyze` with `curl` (Windows PowerShell: prefer `curl.exe` to avoid alias behavior):

```powershell
curl.exe -X POST -F "file=@C:\path\to\your_audio.wav" http://localhost:3000/analyze
```

Python `requests` example:

```python
import requests
files = { 'file': open(r'C:\path\to\your_audio.wav', 'rb') }
r = requests.post('http://localhost:3000/analyze', files=files)
print(r.json())
```

Sample response (approx.):

```json
{
  "tempo": 120.5,
  "timing_accuracy": 0.87,
  "onset_times": { "onsets": [0.25, 0.75, 1.25, ...] }
}
```

## Notes & Next Steps

- The timing accuracy metric in `/analyze` is a simple heuristic: it computes the standard deviation of inter-onset intervals and converts that to a 0..1 score. You can replace or augment it with more advanced metrics (e.g., compare against a reference beatmap or a score aligned to a metronome).
- If you want automated tests, I can add a small test script and a sample audio file to `packages/api/tests` for CI verification.

If you'd like, I can also add OpenAPI documentation snippets or an example Postman collection.
