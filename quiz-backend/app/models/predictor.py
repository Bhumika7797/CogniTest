import numpy as np
from app.models.model import model
from app.models.scaler import scaler
from app.models.label_encoder import label_encoder

# predictor.py
def predict_cognitive_state(features_list):
    if features_list is None or len(features_list) == 0:
        return "unknown"

    prediction = model.predict(scaler.transform(features_list))
    label = label_encoder.inverse_transform(prediction)[0]
    return label

