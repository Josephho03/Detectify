"""
FastAPI Video Deepfake Detection API
Uses trained model from:
    backend/models/testing/video_best_model.pth
"""

import os
import time
import uuid
from pathlib import Path

import torch
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from facenet_pytorch import MTCNN
from torchvision import transforms
from pydantic import BaseModel

# -----------------------------------------------------------
# IMPORT FROM TRAINING PIPELINE FOR PERFECT CONSISTENCY
# -----------------------------------------------------------
from training.train_ffpp_video_model import (
    VideoDeepfakeModel,
    load_video_frames_face_only,
    IMG_SIZE as TRAIN_IMG_SIZE,
    FRAMES_PER_VIDEO as TRAIN_FRAMES,
)

# -----------------------------------------------------------
# CONFIG
# -----------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent

DEFAULT_MODEL_PATH = BASE_DIR / "models" / "video" / "video_best_model.pth"
env_model_path = os.getenv("VIDEO_MODEL_PATH")
MODEL_PATH = Path(env_model_path) if env_model_path else DEFAULT_MODEL_PATH

if not MODEL_PATH.exists():
    raise RuntimeError(f"Video model not found at: {MODEL_PATH}")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# MUST match training exactly
IMG_SIZE = TRAIN_IMG_SIZE
FRAMES_PER_VIDEO = TRAIN_FRAMES

# How many times to resample frames & average predictions
N_PASSES = 3  # increase for more stability (with more latency)

# -----------------------------------------------------------
# TRANSFORMS (MATCH TRAINING)
# -----------------------------------------------------------
frame_transform = transforms.Compose([
    transforms.Resize(IMG_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

# -----------------------------------------------------------
# LOAD MODEL
# -----------------------------------------------------------
print(f"Loading video deepfake model from: {MODEL_PATH}")

model = VideoDeepfakeModel()
state_dict = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(state_dict)
model.to(device)
model.eval()

print("Model loaded successfully.")

# -----------------------------------------------------------
# MTCNN (MATCH TRAINING SETTINGS)
# -----------------------------------------------------------
mtcnn = MTCNN(
    image_size=IMG_SIZE[0],
    margin=0,
    keep_all=False,
    post_process=False,
    device=device,
)

# -----------------------------------------------------------
# FASTAPI APP
# -----------------------------------------------------------
app = FastAPI(title="Detectify Video Deepfake API (PyTorch)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------
# RESPONSE SCHEMA
# -----------------------------------------------------------
class VideoResponse(BaseModel):
    verdict: str           # "real" or "deepfake"
    confidence: float      # percentage 0-100
    message: str
    processing_time: float # seconds

# -----------------------------------------------------------
# CLASSIFICATION CONFIGURATION
# -----------------------------------------------------------
# High threshold: require very strong evidence to call "deepfake"
DEEPFAKE_THRESHOLD = 0.9

# Around 0.5, treat as "uncertain but likely real"
UNCERTAIN_BAND = 0.15  # e.g., prob_fake in [0.35, 0.65]

# -----------------------------------------------------------
# ENDPOINT
# -----------------------------------------------------------
@app.post("/detect/video", response_model=VideoResponse)
async def detect_video(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Please upload a valid video file.")

    start = time.time()

    # Save temporary video file
    video_bytes = await file.read()
    temp_filename = f"temp_{uuid.uuid4().hex}.mp4"
    temp_path = BASE_DIR / temp_filename

    with open(temp_path, "wb") as f:
        f.write(video_bytes)

    try:
        prob_real_list = []
        prob_fake_list = []

        for _ in range(N_PASSES):
            # Extract frames (T, C, H, W) using same logic as training
            frames = load_video_frames_face_only(
                temp_path,
                FRAMES_PER_VIDEO,
                mtcnn,
                frame_transform,
            )

            # Add batch dimension -> (1, T, C, H, W)
            frames = frames.unsqueeze(0).to(device)

            with torch.no_grad():
                logits = model(frames)
                logit = logits.squeeze().item()

                # Training convention: 1 = real, 0 = fake
                p_real = torch.sigmoid(torch.tensor(logit)).item()
                p_fake = 1.0 - p_real

            prob_real_list.append(p_real)
            prob_fake_list.append(p_fake)

        # Average probabilities over passes
        prob_real = float(sum(prob_real_list) / len(prob_real_list))
        prob_fake = float(sum(prob_fake_list) / len(prob_fake_list))

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Error processing video: {str(e)}. "
                "Check that the video contains clear faces, "
                "uses a supported codec, and is not corrupt."
            ),
        )

    finally:
        # Clean up temp file
        try:
            temp_path.unlink(missing_ok=True)
        except Exception:
            pass

    processing_time = round(time.time() - start, 2)

    # Decision logic with threshold + uncertain zone
    if prob_fake >= DEEPFAKE_THRESHOLD:
        verdict = "deepfake"
        confidence = prob_fake
        message = "Video likely manipulated (deepfake)."
    elif abs(prob_fake - 0.5) <= UNCERTAIN_BAND:
        # In the "uncertain" zone around 0.5 → favor real, but warn
        verdict = "real"
        confidence = prob_real
        message = "Video appears real, but the model is not very confident."
    else:
        verdict = "real"
        confidence = prob_real
        message = "Video appears authentic."

    return VideoResponse(
        verdict=verdict,
        confidence=round(confidence * 100.0, 2),
        message=message,
        processing_time=processing_time,
    )

# -----------------------------------------------------------
# HEALTH CHECK
# -----------------------------------------------------------
@app.get("/health_video")
def health_video():
    return {
        "status": "ok",
        "model_loaded": True,
        "device": str(device),
        "frames_per_video": FRAMES_PER_VIDEO,
        "img_size": IMG_SIZE,
        "model_path": str(MODEL_PATH),
        "n_passes": N_PASSES,
        "deepfake_threshold": DEEPFAKE_THRESHOLD,
        "uncertain_band": UNCERTAIN_BAND,
    }

# -----------------------------------------------------------
# RUN (for local testing)
# -----------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8002)
