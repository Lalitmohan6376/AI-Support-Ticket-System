import os
import joblib
import pickle
import numpy as np
import pandas as pd
import keras
from tensorflow.keras.preprocessing.sequence import pad_sequences

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

CATEGORY_CLASSES = [
    "Billing Inquiry",
    "Cancellation Request",
    "Product Inquiry",
    "Refund Request",
    "Technical Support"
]

spam_model = joblib.load(os.path.join(MODELS_DIR, "ticket_spam_detector.joblib"))
csat_model = joblib.load(os.path.join(MODELS_DIR, "customer_satisfaction_model.joblib"))

with open(os.path.join(MODELS_DIR, "priority_tokenizer.pkl"), "rb") as f:
    tokenizer = pickle.load(f)

with open(os.path.join(MODELS_DIR, "priority_label_encoder.pkl"), "rb") as f:
    priority_encoder = pickle.load(f)

priority_model = keras.models.load_model(os.path.join(MODELS_DIR, "ticket_priority_bilstm.keras"))
category_model = keras.models.load_model(os.path.join(MODELS_DIR, "ticket_category_bilstm.keras"))

def predict_ticket(text, age=30):
    text_clean = str(text or "").strip()
    if not text_clean:
        text_clean = "General support inquiry"

    spam_pred = int(spam_model.predict([text_clean])[0])
    spam_prob = float(spam_model.predict_proba([text_clean])[0][1])
    is_spam = bool(spam_pred == 1)

    p_seq = pad_sequences(tokenizer.texts_to_sequences([text_clean]), maxlen=160)
    p_pred = priority_model.predict(p_seq, verbose=0)[0]
    p_idx = int(np.argmax(p_pred))
    priority = str(priority_encoder.inverse_transform([p_idx])[0])
    priority_conf = float(np.max(p_pred))

    c_seq = np.array(pad_sequences(tokenizer.texts_to_sequences([text_clean]), maxlen=120))
    c_seq[c_seq >= 20000] = 0
    c_pred = category_model.predict(c_seq, verbose=0)[0]
    c_idx = int(np.argmax(c_pred))
    category = CATEGORY_CLASSES[c_idx]
    category_conf = float(np.max(c_pred))

    csat_df = pd.DataFrame([{
        "Ticket_Text": text_clean,
        "Ticket Type": category,
        "Ticket Priority": priority.capitalize(),
        "Ticket Channel": "Email",
        "Customer Age": age
    }])
    csat = int(csat_model.predict(csat_df)[0])

    return {
        "is_spam": is_spam,
        "spam_probability": round(spam_prob * 100, 2),
        "priority": priority,
        "priority_confidence": round(priority_conf * 100, 2),
        "category": category,
        "category_confidence": round(category_conf * 100, 2),
        "csat_rating": csat
    }

