import numpy as np
import joblib
import tensorflow as tf
from tensorflow.keras import layers, models
from typing import Optional
import os

# --- Config ---
MODEL_WEIGHTS_PATH = "models/model.h5"
SCALER_PATH = "models/scaler.pkl"
SEQUENCE_LENGTH = 60  # default, can be inferred from data too
FEATURE_DIM = 5        # default for OHLCV

# --- Globals ---
model: Optional[tf.keras.Model] = None
scaler = None

# --- Positional Encoding Function ---
def positional_encoding(sequence_length, d_model):
    positions = np.arange(sequence_length)[:, np.newaxis]
    dimensions = np.arange(d_model)[np.newaxis, :]
    angle_rates = 1 / np.power(10000, (2 * (dimensions // 2)) / np.float32(d_model))
    angle_rads = positions * angle_rates
    angle_rads[:, 0::2] = np.sin(angle_rads[:, 0::2])
    angle_rads[:, 1::2] = np.cos(angle_rads[:, 1::2])
    return tf.cast(angle_rads[np.newaxis, ...], dtype=tf.float32)

# --- Transformer Autoencoder ---
def build_transformer_autoencoder(sequence_length: int, feature_dim: int,
                                   embed_dim=32, num_heads=6, ff_dim=128, dropout_rate=0.1):
    inputs = layers.Input(shape=(sequence_length, feature_dim))
    pos_encoding = tf.Variable(positional_encoding(sequence_length, embed_dim), trainable=False)
    x = layers.Dense(embed_dim)(inputs) + pos_encoding

    for _ in range(3):  # 3 encoder blocks
        attention_output = layers.MultiHeadAttention(num_heads=num_heads, key_dim=embed_dim, dropout=dropout_rate)(x, x)
        x = layers.LayerNormalization()(x + attention_output)
        ff_output = layers.Dense(ff_dim, activation="relu")(x)
        ff_output = layers.Dropout(dropout_rate)(ff_output)
        ff_output = layers.Dense(embed_dim)(ff_output)
        x = layers.LayerNormalization()(x + ff_output)

    decoded = layers.Dense(feature_dim, activation="linear")(x)
    return models.Model(inputs, decoded, name="transformer_autoencoder")

# --- Load Model and Scaler ---
def load_model_and_scaler():
    global model, scaler

    try:
        if not os.path.exists(MODEL_WEIGHTS_PATH):
            raise FileNotFoundError(f"Model weights file not found at: {MODEL_WEIGHTS_PATH}")
        if not os.path.exists(SCALER_PATH):
            raise FileNotFoundError(f"Scaler file not found at: {SCALER_PATH}")

        print(f"Loading scaler from: {SCALER_PATH}")
        scaler = joblib.load(SCALER_PATH)
        print(f"Scaler loaded successfully. Features: {getattr(scaler, 'n_features_in_', 'Unknown')}")

        # Infer input shape from scaler (or hardcode)
        feature_dim = scaler.n_features_in_ if hasattr(scaler, 'n_features_in_') else FEATURE_DIM
        print(f"Building model with sequence_length={SEQUENCE_LENGTH}, feature_dim={feature_dim}")

        base_model = build_transformer_autoencoder(
            sequence_length=SEQUENCE_LENGTH,
            feature_dim=feature_dim
        )
        
        print(f"Loading model weights from: {MODEL_WEIGHTS_PATH}")
        base_model.load_weights(MODEL_WEIGHTS_PATH)
        model = base_model
        print("Model loaded successfully")
        
    except Exception as e:
        print(f"!!! Error loading model and scaler: {e}")
        raise

# --- Inference Function ---
def predict_reconstruction_error(window: np.ndarray) -> float:
    """Expects shape (60, feature_dim). Returns MSE reconstruction error."""
    global model, scaler
    if model is None or scaler is None:
        raise ValueError("Model or scaler not loaded. Call load_model_and_scaler() first.")

    if window.shape[0] != SEQUENCE_LENGTH:
        raise ValueError(f"Expected window with shape (60, N), got {window.shape}")

    scaled_window = scaler.transform(window)
    input_tensor = np.expand_dims(scaled_window, axis=0)  # shape: (1, 60, N)
    reconstructed = model.predict(input_tensor, verbose=0)

    error = np.mean((reconstructed[0] - scaled_window) ** 2)
    return float(error)
