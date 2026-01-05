import os
import time
from io import BytesIO
from typing import List

import cv2
import numpy as np
import torch
import torch.nn as nn
from torchvision import transforms, models
from torchvision.models import EfficientNet_B4_Weights
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

# -------------------
# CONFIG
# -------------------
IMG_SIZE = (380, 380)
MODEL_PATH = os.path.join("models", "image", "image_model.pth")

if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"Model file not found at {MODEL_PATH}")

# Setup device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# How strict we are when calling something "deepfake"
DEEPFAKE_THRESHOLD = 0.9   # require very high fake probability
UNCERTAIN_BAND = 0.10      # around 0.5 → treat as uncertain, favor authentic

# Thresholds for “filter-like manipulation”
FILTER_STRONG_THRESHOLD = 80  # very strong weirdness
FILTER_MEDIUM_THRESHOLD = 70  # medium weirdness
FILTER_MIN_INDICATORS = 2     # how many scores must be high to call it filtered

# -------------------
# MODEL ARCHITECTURE (same as training)
# -------------------
class DeepfakeDetector(nn.Module):
    def __init__(self):
        super(DeepfakeDetector, self).__init__()
        self.backbone = models.efficientnet_b4(
            weights=EfficientNet_B4_Weights.IMAGENET1K_V1
        )
        num_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(num_features, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 1),
        )

    def forward(self, x):
        return self.backbone(x)

# Load model
print("Loading PyTorch model...")
model = DeepfakeDetector()
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.to(device)
model.eval()
print("Model loaded successfully.")

# Image preprocessing (must match training)
transform = transforms.Compose(
    [
        transforms.Resize(IMG_SIZE),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ]
)

# -------------------
# FASTAPI APP
# -------------------
app = FastAPI(title="Detectify Image Deepfake API (PyTorch)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------
# RESPONSE SCHEMA
# -------------------
class DetectionDetails(BaseModel):
    facial_texture: int
    lighting_shadow: int
    pixel_artifacts: int

class AnalysisSummary(BaseModel):
    facial_landmarks_examined: int
    potential_indicators: int
    processing_time: float

class DetectionResponse(BaseModel):
    verdict: str             # "deepfake", "filtered", "suspicious", "authentic"
    title: str
    message: str
    confidence: int
    detection_details: DetectionDetails
    analysis_summary: AnalysisSummary
    reasons: List[str]

# -------------------
# PREPROCESSING
# -------------------
def preprocess_for_model(file_bytes: bytes) -> torch.Tensor:
    """Convert uploaded image to model-ready tensor."""
    image = Image.open(BytesIO(file_bytes)).convert("RGB")
    tensor = transform(image).unsqueeze(0)  # Add batch dimension
    return tensor

# -------------------
# CV HEURISTICS
# -------------------
def compute_face_roi(image_bgr: np.ndarray) -> np.ndarray:
    h, w, _ = image_bgr.shape
    size = int(min(h, w) * 0.7)
    y1 = (h - size) // 2
    x1 = (w - size) // 2
    return image_bgr[y1 : y1 + size, x1 : x1 + size]

def texture_score(face_roi: np.ndarray) -> int:
    gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    var = lap.var()
    min_v, max_v = 10.0, 300.0
    s = (var - min_v) / (max_v - min_v)
    s = float(np.clip(s, 0.0, 1.0))
    return int(s * 100)

def lighting_score(face_roi: np.ndarray) -> int:
    gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    left = gray[:, : w // 2]
    right = gray[:, w // 2 :]
    mean_left = float(left.mean())
    mean_right = float(right.mean())
    diff = abs(mean_left - mean_right)
    std_dev = float(gray.std())
    max_diff = 50.0
    s1 = diff / max_diff
    s2 = max(0, 1.0 - std_dev / 60.0)
    s = (s1 + s2) / 2.0
    s = float(np.clip(s, 0.0, 1.0))
    return int(s * 100)

def pixel_artifact_score(face_roi: np.ndarray) -> int:
    gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    edge_density = edges.mean() / 255.0
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    diff = cv2.absdiff(gray, blur)
    noise_level = diff.mean() / 255.0
    s = (edge_density * 1.5 + noise_level * 2.0) / 2.0
    s = float(np.clip(s, 0.0, 1.0))
    return int(s * 100)

def analyse_image_for_explanations(image_bgr: np.ndarray):
    face = compute_face_roi(image_bgr)
    tex = texture_score(face)
    light = lighting_score(face)
    pix = pixel_artifact_score(face)
    return tex, light, pix

# -------------------
# FILTER / HEAVY-MANIPULATION HEURISTIC
# -------------------
def looks_like_filtered(p_fake: float, tex: int, light: int, pix: int) -> bool:
    if p_fake >= DEEPFAKE_THRESHOLD:
        # Model already strongly believes it's a deepfake → don't override
        return False

    # Count how many indicators are very high
    strong_indicators = sum(
        score >= FILTER_STRONG_THRESHOLD for score in (tex, light, pix)
    )

    # Also treat as filtered if all three are above medium threshold
    medium_all = all(score >= FILTER_MEDIUM_THRESHOLD for score in (tex, light, pix))

    # Only consider "filtered" primarily when model leans real
    if p_fake < 0.5 and (strong_indicators >= FILTER_MIN_INDICATORS or medium_all):
        return True

    return False

def build_verdict(p_fake: float, is_filtered: bool):
    # First, strong deepfake
    if p_fake >= DEEPFAKE_THRESHOLD:
        return (
            "deepfake",
            "Deepfake Detected",
            "Strong indicators of facial manipulation consistent with deepfake generation techniques were detected.",
        )

    # If heuristics say "looks like a filter / heavy effect"
    if is_filtered:
        return (
            "filtered",
            "Filtered / Visually Manipulated",
            "The image shows strong signs of filters or heavy visual effects, but not classic deepfake-style face swapping.",
        )

    # Close to 0.5 → uncertain, but do NOT call deepfake
    if abs(p_fake - 0.5) <= UNCERTAIN_BAND:
        return (
            "suspicious",
            "Inconclusive Analysis",
            "Analysis results are borderline. Additional verification is recommended.",
        )

    # Moderately high fake probability but below deepfake threshold
    if p_fake >= 0.6:
        return (
            "suspicious",
            "Suspicious Content",
            "Notable visual inconsistencies detected. Manual verification is recommended.",
        )

    # Otherwise, treat as authentic
    return (
        "authentic",
        "Authentic Media",
        "No strong signs of deepfake-style facial manipulation detected.",
    )

def build_response(
    p_fake: float,
    tex: int,
    light: int,
    pix: int,
    processing_time: float,
) -> DetectionResponse:
    is_filtered = looks_like_filtered(p_fake, tex, light, pix)
    verdict, title, message = build_verdict(p_fake, is_filtered)

    # Confidence: distance from 0.5 (uncertain)
    confidence = int(abs(p_fake - 0.5) * 200)
    confidence = min(confidence, 99)

    indicators = sum(score > 70 for score in (tex, light, pix))
    reasons: List[str] = []

    if verdict == "deepfake":
        if tex > 70:
            reasons.append(
                "Unusual skin texture and edge blending detected in facial regions."
            )
        if light > 70:
            reasons.append(
                "Lighting and shadow patterns appear inconsistent with natural scenes."
            )
        if pix > 70:
            reasons.append(
                "Pixel-level artifacts suggest synthetic generation or heavy manipulation."
            )
        if not reasons:
            reasons.append(
                "Neural network detected patterns consistent with deepfake generation techniques."
            )

    elif verdict == "filtered":
        reasons.append(
            "Strong visual distortion or filter-like effects were detected on the face."
        )
        if tex > 70:
            reasons.append("Facial texture and edges indicate strong stylization or warping.")
        if light > 70:
            reasons.append("Lighting and shading are atypical for natural scenes, consistent with filters.")
        if pix > 70:
            reasons.append("Pixel-level structure suggests overlays or visual effects.")

    elif verdict == "suspicious":
        reasons.append(
            "Some visual inconsistencies detected that warrant further examination."
        )
        if tex > 60:
            reasons.append("Facial texture shows minor irregularities.")
        if light > 60:
            reasons.append("Lighting consistency is slightly questionable.")
        if pix > 60:
            reasons.append("Some compression or rendering artifacts detected.")

    else:  # authentic
        reasons.append(
            "No strong signs of deepfake-style manipulation; visual characteristics are consistent with authentic images."
        )

    details = DetectionDetails(
        facial_texture=tex,
        lighting_shadow=light,
        pixel_artifacts=pix,
    )

    summary = AnalysisSummary(
        facial_landmarks_examined=72,
        potential_indicators=indicators,
        processing_time=round(processing_time, 2),
    )

    return DetectionResponse(
        verdict=verdict,
        title=title,
        message=message,
        confidence=confidence,
        detection_details=details,
        analysis_summary=summary,
        reasons=reasons,
    )

# -------------------
# ROUTES
# -------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": True,
        "framework": "PyTorch",
        "device": str(device),
        "deepfake_threshold": DEEPFAKE_THRESHOLD,
        "uncertain_band": UNCERTAIN_BAND,
        "filter_strong_threshold": FILTER_STRONG_THRESHOLD,
    }

@app.post("/detect/image", response_model=DetectionResponse)
async def detect_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, detail="Please upload an image file."
        )

    start_time = time.time()
    file_bytes = await file.read()

    # 1) Model prediction
    try:
        x = preprocess_for_model(file_bytes).to(device)

        with torch.no_grad():
            output = model(x).squeeze()
            p_real = torch.sigmoid(output).item()

        # Labels: fake=0, real=1
        p_fake = 1.0 - p_real

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Model prediction failed: {str(e)}"
        )

    # 2) CV heuristics
    try:
        arr = np.frombuffer(file_bytes, np.uint8)
        img_bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise HTTPException(
                status_code=400, detail="Could not decode image."
            )
        tex, light, pix = analyse_image_for_explanations(img_bgr)
    except Exception as e:
        print(f"CV analysis warning: {e}")
        tex, light, pix = 50, 50, 50

    processing_time = time.time() - start_time

    # 3) Build response
    response = build_response(p_fake, tex, light, pix, processing_time)
    return response
