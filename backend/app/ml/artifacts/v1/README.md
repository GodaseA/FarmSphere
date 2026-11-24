# ML Artifacts v1 Directory

This directory holds the exported model weights and configurations for the AgriConnect Leaf Disease Detection and Mandi Price Forecasting modules.

## Expected Files

1. **`disease_model.keras`**:
   - The compiled Keras model trained using `backend/ml_training/train_disease_model.ipynb`.
   - Input shape: `(None, 224, 224, 3)`, float normalized pixel values `[-1, 1]`.
   - Output shape: `(None, 38)` softmax probabilities matching `class_names.json`.
   - When present, `app/ml/predictor.py` automatically detects and loads this file at FastAPI startup into memory.

2. **`class_names.json`**:
   - The 38 class mapping order used during training.

3. **`model_meta.json`**:
   - Metadata, version tag, and confidence threshold configurations.

4. **`price_model.pkl`** (optional):
   - Scikit-learn regressor export (Random Forest / XGBoost) trained via `backend/ml_training/train_price_model.ipynb` for 3-month mandi price trend forecasting.

> **Note**: While you are training your models, AgriConnect provides an intelligent heuristic and feature-based inference fallback in `app/ml/predictor.py` so the complete web app, UI diagnosis screen, and API run end-to-end without crashing. Once your trained `disease_model.keras` file is saved here, it is automatically utilized for inference.
