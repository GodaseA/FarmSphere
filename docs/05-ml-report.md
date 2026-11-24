# AgriConnect — Machine Learning Technical Report

## 1. Plant Leaf Disease Classification Model

### 1.1 Dataset Architecture
- **Dataset**: PlantVillage public agricultural benchmark (54,303 leaf images).
- **Classes**: 38 classes across 14 crop species (e.g. Tomato, Potato, Apple, Corn, Grape, Bell Pepper) covering healthy and blighted specimens.
- **Split Strategy**: Stratified 70% Training (~38,012 images), 15% Validation (~8,145 images), 15% Testing (~8,146 images).

### 1.2 Model Architecture & Transfer Learning
- **Base Architecture**: `MobileNetV2` pretrained on ImageNet (lightweight, optimized for low latency in-process inference under 300 ms).
- **Classification Head**:
  ```
  Input: (224, 224, 3) normalized [-1, 1]
  -> Data Augmentation (RandomFlip, RandomRotation(0.15), RandomZoom(0.15), RandomContrast(0.1))
  -> MobileNetV2 Base (Feature Extractor)
  -> GlobalAveragePooling2D
  -> Dropout(0.3)
  -> Dense(38, activation='softmax')
  ```
- **Training Strategy**:
  - Phase 1: Frozen base feature extractor, trained with Adam (LR = 1e-3) for 5 epochs.
  - Phase 2: Unfreeze top 30 layers, fine-tuned with Adam (LR = 1e-5) for 10 epochs using EarlyStopping and ReduceLROnPlateau.

### 1.3 Target Performance Metrics
- **Test Accuracy**: > 96.4%
- **Top-3 Accuracy**: > 99.2%
- **Inference Latency**: ~ 180 ms on CPU per 224x224 RGB image.

### 1.4 Confidence & Uncertainty Governance
- When top prediction confidence is below **60.0% (`0.60`)**, `is_uncertain` is set to `True`.
- The user interface renders an alert banner recommending direct consultation with local Krishi Vigyan Kendra (KVK) extension agronomists.

---

## 2. Crop Mandi Price Regressor

### 2.1 Methodology
- Regressor based on **Random Forest / XGBoost** modeling monthly and seasonal price fluctuations.
- **Features**: Crop category, District, State, Month index, Kharif/Rabi/Zaid seasonality factor, and 3-month lagged moving averages (`lag_1`, `lag_2`, `lag_3`).
- **Serving Output**: 3 forward months projected with:
  - Expected mandi wholesale price (₹/kg)
  - Lower confidence band (₹/kg)
  - Upper confidence band (₹/kg)
  - Trend direction (`rising`, `stable`, `falling`)
- **Ethical Rule**: Presented strictly as guidance; never auto-populates or constrains listing sale prices.

---

## 3. Custom Training & Artifact Directory
- The notebooks for training both models are provided in `backend/ml_training/`:
  - `backend/ml_training/train_disease_model.ipynb`
  - `backend/ml_training/train_price_model.ipynb`
- Exported weights are placed into `backend/app/ml/artifacts/v1/` (`disease_model.keras` and `price_model.pkl`), where the backend automatically loads them.
