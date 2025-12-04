"""
Lightweight & Aggressive Face-Only Video Deepfake Detector (EfficientNet-B0)

Optimized for:
- GTX 1650 (4GB VRAM)
- Faster Convergence (Higher LR)
- Better Generalization on Small Datasets

Run:
    python train_ffpp_video_model.py
"""

import os
import random
from pathlib import Path
from typing import List, Tuple

import numpy as np
import cv2
from PIL import Image
from tqdm import tqdm

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
import timm
from facenet_pytorch import MTCNN
import kagglehub
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt

# Set KaggleHub Cache
os.environ["KAGGLEHUB_CACHE"] = "D:/FYP/KaggleHub"

# ------------------ CONFIG (OPTIMIZED FOR GTX 1650) ------------------
SEED = 42

# SWITCHED TO B0: Smaller model, faster training, easier to fit in VRAM
BACKBONE_NAME = "tf_efficientnet_b0_ns" 
IMG_SIZE = (224, 224)           # Reduced size for B0 (standard is 224)

FRAMES_PER_VIDEO = 10           # Reduced slightly to allow larger batches internally
BATCH_SIZE = 2                  # Try 2. If OOM, revert to 1.
ACCUMULATION_STEPS = 8          # Effective Batch = 16

NUM_WORKERS = 0                 

MAX_REAL_VIDEOS = 1000          
MAX_FAKE_VIDEOS = 1000          

TRAIN_RATIO = 0.7
VAL_RATIO = 0.15                

STAGE1_EPOCHS = 5               # Shorter stage 1
STAGE2_EPOCHS = 15              # Main fine-tuning

# AGGRESSIVE LEARNING RATES (To break the 50% plateau)
LR_STAGE1 = 1e-3                
LR_STAGE2 = 1e-4                # Increased from 1e-6 to 1e-4

BASE_DIR = Path(__file__).resolve().parent.parent   
EXPORT_DIR = BASE_DIR / "models" / "video"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

FAKE_FOLDERS = [
    "DeepFakeDetection", "Deepfakes", "Face2Face", 
    "FaceShifter", "FaceSwap", "NeuralTextures",
]
REAL_FOLDER = "original"
# ---------------------------------------------------------------------

def set_seed(seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

def get_device():
    if torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"✅ Using GPU: {torch.cuda.get_device_name(0)}")
    else:
        device = torch.device("cpu")
        print("⚠️ Using CPU (training will be slower)")
    return device

def download_ffpp_dataset() -> Path:
    print("⬇️  Checking FaceForensics++ Dataset...")
    path = kagglehub.dataset_download("xdxd003/ff-c23")
    dataset_root = Path(path)
    
    # Path Adjustment Logic
    NESTED_FOLDER_NAME = "FaceForensics++_C23"
    if (dataset_root / NESTED_FOLDER_NAME).exists():
        dataset_root = dataset_root / NESTED_FOLDER_NAME
        print(f"➡️ Adjusted root: {dataset_root}")
    return dataset_root

def list_videos_in_folder(folder: Path) -> List[Path]:
    exts = ["*.mp4", "*.avi", "*.mov", "*.mkv"]
    files = []
    for ext in exts:
        files.extend(folder.rglob(ext))
    return sorted(files)

def build_video_list(dataset_root: Path) -> Tuple[List[Tuple[Path, int]], List[Tuple[Path, int]], List[Tuple[Path, int]]]:
    # Real videos
    real_root = dataset_root / REAL_FOLDER
    real_videos = list_videos_in_folder(real_root)
    
    if len(real_videos) == 0: raise RuntimeError(f"No real videos found in {real_root}")
    if MAX_REAL_VIDEOS: real_videos = random.sample(real_videos, min(MAX_REAL_VIDEOS, len(real_videos)))

    # Fake videos
    fake_videos_all = []
    for f in FAKE_FOLDERS:
        f_root = dataset_root / f
        if f_root.exists():
            vids = list_videos_in_folder(f_root)
            fake_videos_all.extend(vids)
    
    if len(fake_videos_all) == 0: raise RuntimeError("No fake videos found")
    if MAX_FAKE_VIDEOS: fake_videos_all = random.sample(fake_videos_all, min(MAX_FAKE_VIDEOS, len(fake_videos_all)))

    print(f"Stats: {len(real_videos)} Real | {len(fake_videos_all)} Fake")

    # Split
    def stratified_split(paths):
        n = len(paths)
        n_train = int(TRAIN_RATIO * n)
        n_val = int(VAL_RATIO * n)
        return paths[:n_train], paths[n_train:n_train+n_val], paths[n_train+n_val:]

    random.shuffle(real_videos)
    random.shuffle(fake_videos_all)

    r_train, r_val, r_test = stratified_split(real_videos)
    f_train, f_val, f_test = stratified_split(fake_videos_all)

    def labelize(paths, lbl): return [(p, lbl) for p in paths]

    train = labelize(r_train, 1) + labelize(f_train, 0)
    val = labelize(r_val, 1) + labelize(f_val, 0)
    test = labelize(r_test, 1) + labelize(f_test, 0)

    random.shuffle(train)
    random.shuffle(val)
    random.shuffle(test)
    
    return train, val, test

def sample_frame_indices(num_frames: int, num_samples: int) -> List[int]:
    if num_frames <= 0: return [0] * num_samples
    
    # Add randomness to sampling (Temporal Augmentation)
    indices = np.linspace(0, num_frames - 1, num_samples, dtype=int)
    jitter = np.random.randint(-1, 2, size=num_samples) # +/- 1 frame jitter
    indices = np.clip(indices + jitter, 0, num_frames - 1)
    
    return indices.tolist()

def load_video_frames_face_only(video_path: Path, num_frames: int, mtcnn: MTCNN, transform: transforms.Compose) -> torch.Tensor:
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened(): raise RuntimeError(f"Cannot open {video_path}")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0: total_frames = num_frames

    indices = sample_frame_indices(total_frames, num_frames)
    frames = []

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
        ret, frame = cap.read()
        if not ret:
            if len(frames) > 0: frames.append(frames[-1])
            continue
        
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(frame_rgb)

        # Detect face
        face = mtcnn(pil_img)
        
        # Robust Logic: Use full frame if face fails, or resize logic
        if face is None:
            # Resize full frame to IMG_SIZE directly if no face found
            img_for_transform = pil_img.resize(IMG_SIZE)
            img_t = transforms.ToTensor()(img_for_transform)
            img_t = transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])(img_t)
        else:
            # MTCNN returns a tensor, we need to ensure it's PIL for transform or just use it
            face_pil = transforms.ToPILImage()(face)
            img_t = transform(face_pil)

        frames.append(img_t)

    cap.release()
    
    # Padding if video was too short/corrupt
    while len(frames) < num_frames:
        if len(frames) > 0: frames.append(frames[-1])
        else: return torch.zeros((num_frames, 3, IMG_SIZE[0], IMG_SIZE[1])) # Return black frames if total fail

    return torch.stack(frames[:num_frames], dim=0)

class FFPPVideoDataset(Dataset):
    def __init__(self, samples, mtcnn, num_frames, transform):
        self.samples = samples
        self.mtcnn = mtcnn
        self.num_frames = num_frames
        self.transform = transform

    def __len__(self): return len(self.samples)

    def __getitem__(self, idx):
        attempts = 0
        cur_idx = idx
        while attempts < 5:
            try:
                path, label = self.samples[cur_idx]
                frames = load_video_frames_face_only(path, self.num_frames, self.mtcnn, self.transform)
                return frames, torch.tensor(label, dtype=torch.float32)
            except Exception as e:
                # print(f"⚠️ Error loading {self.samples[cur_idx][0].name}, retrying...")
                cur_idx = random.randint(0, len(self.samples) - 1)
                attempts += 1
        
        # Fallback tensor
        return torch.zeros((self.num_frames, 3, IMG_SIZE[0], IMG_SIZE[1])), torch.tensor(0.0)

class VideoDeepfakeModel(nn.Module):
    def __init__(self, backbone_name=BACKBONE_NAME, hidden_size=128, bidirectional=True):
        super().__init__()
        
        # Load EfficientNet-B0 (Much lighter than B4)
        self.backbone = timm.create_model(backbone_name, pretrained=True, num_classes=0, global_pool="avg")
        feature_dim = self.backbone.num_features

        self.gru = nn.GRU(
            input_size=feature_dim, 
            hidden_size=hidden_size, 
            num_layers=1, 
            batch_first=True, 
            bidirectional=bidirectional
        )
        
        # Simplified Head
        self.classifier = nn.Sequential(
            nn.Linear(hidden_size * 2, 128),
            nn.LayerNorm(128),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(128, 1)
        )

    def forward(self, x):
        B, T, C, H, W = x.shape
        x = x.view(B * T, C, H, W)
        
        # Extract features
        feats = self.backbone(x) # (B*T, F)
        feats = feats.view(B, T, -1)
        
        # Temporal Modeling
        out, _ = self.gru(feats)
        
        # Take mean of all time steps (More robust than just last step)
        out = torch.mean(out, dim=1)
        
        return self.classifier(out).squeeze(-1)

def train_epoch(model, loader, criterion, optimizer, device, accum_steps):
    model.train()
    total_loss, correct, total = 0, 0, 0
    optimizer.zero_grad()
    
    pbar = tqdm(loader, desc="Train", leave=False)
    for i, (vid, lbl) in enumerate(pbar):
        vid, lbl = vid.to(device), lbl.to(device)
        
        out = model(vid)
        loss = criterion(out, lbl) / accum_steps
        loss.backward()
        
        if (i + 1) % accum_steps == 0:
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0) # Clip gradients
            optimizer.step()
            optimizer.zero_grad()
            
        total_loss += loss.item() * accum_steps
        preds = (torch.sigmoid(out) > 0.5).float()
        correct += (preds == lbl).sum().item()
        total += lbl.size(0)
        
        pbar.set_postfix({'loss': f"{loss.item()*accum_steps:.4f}", 'acc': f"{100*correct/total:.1f}%"})
        
    return total_loss / len(loader), correct / total

def validate(model, loader, criterion, device):
    model.eval()
    total_loss, correct, total = 0, 0, 0
    with torch.no_grad():
        for vid, lbl in tqdm(loader, desc="Val", leave=False):
            vid, lbl = vid.to(device), lbl.to(device)
            out = model(vid)
            loss = criterion(out, lbl)
            total_loss += loss.item()
            preds = (torch.sigmoid(out) > 0.5).float()
            correct += (preds == lbl).sum().item()
            total += lbl.size(0)
    return total_loss / len(loader), correct / total

def main():
    set_seed(SEED)
    device = get_device()
    
    # Data Setup
    root = download_ffpp_dataset()
    train_s, val_s, test_s = build_video_list(root)
    
    # Smaller image size for B0
    tfms = transforms.Compose([
        transforms.Resize(IMG_SIZE),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # Initializing MTCNN
    print("Loading MTCNN...")
    mtcnn = MTCNN(image_size=IMG_SIZE[0], margin=0, keep_all=False, post_process=False, device=device)

    train_ds = FFPPVideoDataset(train_s, mtcnn, FRAMES_PER_VIDEO, tfms)
    val_ds = FFPPVideoDataset(val_s, mtcnn, FRAMES_PER_VIDEO, tfms)
    test_ds = FFPPVideoDataset(test_s, mtcnn, FRAMES_PER_VIDEO, tfms)
    
    train_dl = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=NUM_WORKERS)
    val_dl = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=NUM_WORKERS)
    test_dl = DataLoader(test_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=NUM_WORKERS)
    
    # Model Setup
    print(f"Initializing {BACKBONE_NAME}...")
    model = VideoDeepfakeModel().to(device)
    criterion = nn.BCEWithLogitsLoss()
    
    # STAGE 1: Head Only
    print("\n=== STAGE 1: Training Head ===")
    for p in model.backbone.parameters(): p.requires_grad = False
    opt = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=LR_STAGE1)
    
    best_acc = 0.0
    for ep in range(STAGE1_EPOCHS):
        tl, ta = train_epoch(model, train_dl, criterion, opt, device, ACCUMULATION_STEPS)
        vl, va = validate(model, val_dl, criterion, device)
        print(f"Ep {ep+1}: Train Loss {tl:.4f} Acc {ta:.1%}, Val Loss {vl:.4f} Acc {va:.1%}")
        if va > best_acc:
            best_acc = va
            torch.save(model.state_dict(), EXPORT_DIR / "video_best_model.pth")
            
    # STAGE 2: Fine Tuning
    print("\n=== STAGE 2: Fine Tuning (Aggressive) ===")
    for p in model.backbone.parameters(): p.requires_grad = True
    opt = optim.Adam(model.parameters(), lr=LR_STAGE2) # Higher LR here
    
    for ep in range(STAGE2_EPOCHS):
        tl, ta = train_epoch(model, train_dl, criterion, opt, device, ACCUMULATION_STEPS)
        vl, va = validate(model, val_dl, criterion, device)
        print(f"Ep {ep+1}: Train Loss {tl:.4f} Acc {ta:.1%}, Val Loss {vl:.4f} Acc {va:.1%}")
        if va >= best_acc:
            best_acc = va
            torch.save(model.state_dict(), EXPORT_DIR / "video_best_model.pth")
            print("✅ Saved new best model")

    # Evaluation
    print("\n=== Final Evaluation ===")
    model.load_state_dict(torch.load(EXPORT_DIR / "video_best_model.pth", map_location=device))
    model.eval()
    
    all_preds, all_lbls = [], []
    with torch.no_grad():
        for vid, lbl in tqdm(test_dl, desc="Test"):
            vid = vid.to(device)
            out = torch.sigmoid(model(vid))
            all_preds.extend((out > 0.5).float().cpu().numpy())
            all_lbls.extend(lbl.numpy())
            
    print(classification_report(all_lbls, all_preds, target_names=["Fake", "Real"]))
    print("Confusion Matrix:\n", confusion_matrix(all_lbls, all_preds))
    
    # Save Confusion Matrix Plot
    cm = confusion_matrix(all_lbls, all_preds)
    plt.figure(figsize=(5,5))
    plt.imshow(cm, cmap='Blues')
    plt.title(f"Test Acc: {np.mean(np.array(all_preds) == np.array(all_lbls)):.1%}")
    plt.savefig(EXPORT_DIR / "video_confusion_matrix.png")
    print(f"✅ Saved results to {EXPORT_DIR}")

if __name__ == "__main__":
    main()