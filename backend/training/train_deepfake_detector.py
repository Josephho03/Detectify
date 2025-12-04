"""
PyTorch Training Script for Deepfake Detection
Better GPU support on Windows!
"""

import os
import glob
import shutil
import random
import zipfile
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms, models
from PIL import Image
from tqdm import tqdm

import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns

# ----------------- CONFIG -----------------
IMG_SIZE = (380, 380)
BATCH_SIZE = 16
SEED = 42
LEARNING_RATE = 1e-3
NUM_WORKERS = 0       
PIN_MEMORY = False 

# Reproducibility
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent  # -> backend/
DATA_DIR = BASE_DIR / "data"                       # image dataset
SMALL_BASE = BASE_DIR / "data_small"               # small image dataset
EXPORT_DIR = BASE_DIR / "models" / "image"         # <--- changed
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

N_TRAIN_PER_CLASS = 10000
N_VALID_PER_CLASS = 1500
N_TEST_PER_CLASS = 1500
# ------------------------------------------

# Check GPU
def setup_device():
    """Setup PyTorch device"""
    if torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"✅ GPU detected: {torch.cuda.get_device_name(0)}")
        print(f"   GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
        print(f"   CUDA Version: {torch.version.cuda}")
        return device
    else:
        device = torch.device("cpu")
        print("⚠️  No GPU detected. Training will use CPU (slower)")
        response = input("Continue with CPU? (y/n): ")
        if response.lower() != 'y':
            print("Exiting...")
            exit()
        return device


def ensure_kaggle_credentials():
    """Ensure kaggle.json exists"""
    home_kaggle_dir = Path.home() / ".kaggle"
    home_kaggle_dir.mkdir(exist_ok=True)

    home_kaggle_json = home_kaggle_dir / "kaggle.json"
    if home_kaggle_json.exists():
        print(f"✅ Found kaggle.json")
        return

    local_kaggle_json = BASE_DIR / "kaggle.json"
    if local_kaggle_json.exists():
        shutil.copy(local_kaggle_json, home_kaggle_json)
        os.chmod(home_kaggle_json, 0o600)
        print(f"✅ Copied kaggle.json")
        return

    raise FileNotFoundError("❌ kaggle.json not found!")


def download_dataset():
    """Download dataset from Kaggle"""
    target_dir = DATA_DIR / "real_vs_fake"
    if target_dir.exists():
        print("✅ Dataset already exists")
        return

    ensure_kaggle_credentials()
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    print("⬇️  Downloading dataset...")
    os.system(f'kaggle datasets download -d xhlulu/140k-real-and-fake-faces -p "{DATA_DIR}"')

    zip_files = list(DATA_DIR.glob("*.zip"))
    if zip_files:
        print(f"📦 Unzipping...")
        with zipfile.ZipFile(zip_files[0], "r") as zf:
            zf.extractall(DATA_DIR)
        print("✅ Download complete")


def create_balanced_dataset():
    """Create balanced dataset"""
    orig_base = DATA_DIR / "real_vs_fake" / "real-vs-fake"

    if SMALL_BASE.exists():
        print("🗑️  Removing old data...")
        shutil.rmtree(SMALL_BASE)

    subdirs = ["train/real", "train/fake", "valid/real", "valid/fake", "test/real", "test/fake"]
    for sub in subdirs:
        (SMALL_BASE / sub).mkdir(parents=True, exist_ok=True)

    def copy_n(src_dir: Path, dst_dir: Path, n: int):
        files = glob.glob(str(src_dir / "*.jpg"))
        random.shuffle(files)
        for f in files[:min(n, len(files))]:
            shutil.copy(f, dst_dir)
        print(f"  ✓ {dst_dir.name}: {min(n, len(files))} images")

    print("\n📋 Creating balanced dataset...")
    copy_n(orig_base / "train" / "real", SMALL_BASE / "train" / "real", N_TRAIN_PER_CLASS)
    copy_n(orig_base / "train" / "fake", SMALL_BASE / "train" / "fake", N_TRAIN_PER_CLASS)
    copy_n(orig_base / "valid" / "real", SMALL_BASE / "valid" / "real", N_VALID_PER_CLASS)
    copy_n(orig_base / "valid" / "fake", SMALL_BASE / "valid" / "fake", N_VALID_PER_CLASS)
    copy_n(orig_base / "test" / "real", SMALL_BASE / "test" / "real", N_TEST_PER_CLASS)
    copy_n(orig_base / "test" / "fake", SMALL_BASE / "test" / "fake", N_TEST_PER_CLASS)
    print("✅ Dataset ready\n")


# Custom Dataset
class DeepfakeDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = Path(root_dir)
        self.transform = transform
        self.images = []
        self.labels = []

        # fake=0, real=1 (alphabetical order for consistency)
        for label, class_name in enumerate(['fake', 'real']):
            class_dir = self.root_dir / class_name
            for img_path in class_dir.glob("*.jpg"):
                self.images.append(str(img_path))
                self.labels.append(label)

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path = self.images[idx]
        label = self.labels[idx]
        image = Image.open(img_path).convert('RGB')

        if self.transform:
            image = self.transform(image)

        return image, torch.tensor(label, dtype=torch.float32)


def get_data_loaders():
    """Create PyTorch data loaders"""
    # Training transforms with augmentation
    train_transform = transforms.Compose([
        transforms.Resize(IMG_SIZE),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(8),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Validation/Test transforms (no augmentation)
    eval_transform = transforms.Compose([
        transforms.Resize(IMG_SIZE),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    train_dataset = DeepfakeDataset(SMALL_BASE / "train", train_transform)
    val_dataset = DeepfakeDataset(SMALL_BASE / "valid", eval_transform)
    test_dataset = DeepfakeDataset(SMALL_BASE / "test", eval_transform)

    train_loader = DataLoader(train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=NUM_WORKERS,
        pin_memory=PIN_MEMORY
    )

    val_loader = DataLoader(val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
        pin_memory=PIN_MEMORY
    )

    test_loader = DataLoader(test_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
        pin_memory=PIN_MEMORY
    )

    print(f"✅ Data loaders ready:")
    print(f"   Train: {len(train_dataset)} images")
    print(f"   Val:   {len(val_dataset)} images")
    print(f"   Test:  {len(test_dataset)} images\n")

    return train_loader, val_loader, test_loader


# Model Architecture
class DeepfakeDetector(nn.Module):
    def __init__(self):
        super(DeepfakeDetector, self).__init__()
        # Use EfficientNet-B4 as backbone
        self.backbone = models.efficientnet_b4(weights='IMAGENET1K_V1')
        
        # Replace classifier
        num_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(num_features, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 1)
        )

    def forward(self, x):
        return self.backbone(x)


def train_epoch(model, loader, criterion, optimizer, device):
    """Train for one epoch"""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    pbar = tqdm(loader, desc="Training")
    for images, labels in pbar:
        images, labels = images.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(images).squeeze()
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        predicted = (torch.sigmoid(outputs) > 0.5).float()
        correct += (predicted == labels).sum().item()
        total += labels.size(0)

        pbar.set_postfix({'loss': f'{loss.item():.4f}', 'acc': f'{100*correct/total:.2f}%'})

    return running_loss / len(loader), correct / total


def validate(model, loader, criterion, device):
    """Validate model"""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in tqdm(loader, desc="Validating"):
            images, labels = images.to(device), labels.to(device)
            outputs = model(images).squeeze()
            loss = criterion(outputs, labels)

            running_loss += loss.item()
            predicted = (torch.sigmoid(outputs) > 0.5).float()
            correct += (predicted == labels).sum().item()
            total += labels.size(0)

    return running_loss / len(loader), correct / total


def train_model(model, train_loader, val_loader, device, num_epochs_stage1=10, num_epochs_stage2=15):
    """Two-stage training"""
    criterion = nn.BCEWithLogitsLoss()
    
    # STAGE 1: Train only classifier
    print("=" * 70)
    print("📚 STAGE 1: Training classifier only")
    print("=" * 70 + "\n")
    
    for param in model.backbone.features.parameters():
        param.requires_grad = False
    
    optimizer = optim.Adam(model.backbone.classifier.parameters(), lr=LEARNING_RATE)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=2)
    
    history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}
    best_val_acc = 0.0
    
    for epoch in range(num_epochs_stage1):
        print(f"\nEpoch {epoch+1}/{num_epochs_stage1}")
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        
        print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc*100:.2f}%")
        print(f"Val Loss:   {val_loss:.4f} | Val Acc:   {val_acc*100:.2f}%")
        
        scheduler.step(val_loss)

        # 🔹 Save checkpoint for this epoch (Stage 1)
        ckpt_path = EXPORT_DIR / f"checkpoint_stage1_epoch_{epoch+1}.pth"
        torch.save({
            "stage": 1,
            "epoch": epoch + 1,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "best_val_acc": best_val_acc,
            "train_loss": train_loss,
            "val_loss": val_loss,
            "train_acc": train_acc,
            "val_acc": val_acc,
        }, ckpt_path)
        print(f"💾 Checkpoint saved: {ckpt_path.name}")
        
        # 🔹 Save best model so far
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), EXPORT_DIR / "best_model.pth")
            print("✅ Best model saved!")

    
    # STAGE 2: Fine-tune entire model
    print("\n" + "=" * 70)
    print("🔧 STAGE 2: Fine-tuning entire network")
    print("=" * 70 + "\n")
    
    for param in model.backbone.features.parameters():
        param.requires_grad = True
    
    # Freeze early layers
    for i, param in enumerate(model.backbone.features.parameters()):
        if i < 200:
            param.requires_grad = False
    
    optimizer = optim.Adam(model.parameters(), lr=5e-6)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=2)
    
    for epoch in range(num_epochs_stage2):
        print(f"\nEpoch {epoch+1}/{num_epochs_stage2}")
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        
        print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc*100:.2f}%")
        print(f"Val Loss:   {val_loss:.4f} | Val Acc:   {val_acc*100:.2f}%")
        
        scheduler.step(val_loss)

        # 🔹 Save checkpoint for this epoch (Stage 2)
        ckpt_path = EXPORT_DIR / f"checkpoint_stage2_epoch_{epoch+1}.pth"
        torch.save({
            "stage": 2,
            "epoch": epoch + 1,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "best_val_acc": best_val_acc,
            "train_loss": train_loss,
            "val_loss": val_loss,
            "train_acc": train_acc,
            "val_acc": val_acc,
        }, ckpt_path)
        print(f"💾 Checkpoint saved: {ckpt_path.name}")
        
        # 🔹 Save best model so far
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), EXPORT_DIR / "best_model.pth")
            print("✅ Best model saved!")

    
    return history


def evaluate_model(model, test_loader, device):
    """Final evaluation"""
    print("\n" + "=" * 70)
    print("📊 FINAL EVALUATION")
    print("=" * 70 + "\n")
    
    model.load_state_dict(torch.load(EXPORT_DIR / "best_model.pth"))
    model.eval()
    
    y_true = []
    y_pred = []
    
    with torch.no_grad():
        for images, labels in tqdm(test_loader, desc="Testing"):
            images = images.to(device)
            outputs = model(images).squeeze()
            predicted = (torch.sigmoid(outputs) > 0.5).float()
            
            y_true.extend(labels.cpu().numpy())
            y_pred.extend(predicted.cpu().numpy())
    
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    
    accuracy = (y_true == y_pred).mean()
    
    print(f"\n✅ Test Accuracy: {accuracy*100:.2f}%\n")
    
    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Fake', 'Real'], yticklabels=['Fake', 'Real'])
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(EXPORT_DIR / "confusion_matrix.png", dpi=300)
    print(f"✅ Confusion matrix saved")
    
    # Classification Report
    print("\n📋 Classification Report:")
    print(classification_report(y_true, y_pred, target_names=['Fake', 'Real']))
    
    return accuracy


def plot_history(history):
    """Plot training history"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
    
    epochs = range(1, len(history['train_loss']) + 1)
    
    ax1.plot(epochs, history['train_loss'], 'b-', label='Train Loss')
    ax1.plot(epochs, history['val_loss'], 'r-', label='Val Loss')
    ax1.axvline(x=10, color='g', linestyle='--', label='Fine-tuning Start')
    ax1.set_title('Training and Validation Loss')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Loss')
    ax1.legend()
    ax1.grid(True)
    
    ax2.plot(epochs, [x*100 for x in history['train_acc']], 'b-', label='Train Acc')
    ax2.plot(epochs, [x*100 for x in history['val_acc']], 'r-', label='Val Acc')
    ax2.axvline(x=10, color='g', linestyle='--', label='Fine-tuning Start')
    ax2.set_title('Training and Validation Accuracy')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Accuracy (%)')
    ax2.legend()
    ax2.grid(True)
    
    plt.tight_layout()
    plt.savefig(EXPORT_DIR / "training_history.png", dpi=300)
    print("✅ Training history saved")


def main():
    """Main training pipeline"""
    print("=" * 70)
    print("🚀 PYTORCH DEEPFAKE DETECTION TRAINING")
    print("   Model: EfficientNet-B4 | Image Size: 380x380")
    print("=" * 70 + "\n")
    
    # Setup
    device = setup_device()
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Prepare data
    download_dataset()
    create_balanced_dataset()
    train_loader, val_loader, test_loader = get_data_loaders()
    
    # Build model
    print("🏗️  Building model...")
    model = DeepfakeDetector().to(device)
    print(f"✅ Model ready on {device}\n")
    
    # Train
    history = train_model(model, train_loader, val_loader, device)
    
    # Evaluate
    test_acc = evaluate_model(model, test_loader, device)
    
    # Plot
    plot_history(history)
    
    # Save final model
    torch.save(model.state_dict(), EXPORT_DIR / "image_model.pth")
    
    print("\n" + "=" * 70)
    print("🎉 TRAINING COMPLETE!")
    print("=" * 70)
    print(f"\n✅ Model saved:     {EXPORT_DIR / 'image_model.pth'}")
    print(f"✅ Confusion matrix: {EXPORT_DIR / 'confusion_matrix.png'}")
    print(f"✅ Training history: {EXPORT_DIR / 'training_history.png'}")
    print(f"\n📊 Final Accuracy:  {test_acc*100:.2f}%")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()