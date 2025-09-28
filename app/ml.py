import pandas as pd
import numpy as np
import shap
import json
import os
from catboost import CatBoostClassifier

# Load model
MODEL_PATH = "stack/catboost_model.cbm"
model = CatBoostClassifier()
model.load_model(MODEL_PATH)

# Load expected features
with open("models/feature_names.json") as f:
    EXPECTED_FEATURES = json.load(f)

# Load categorical features (with fallback)
if os.path.exists("models/cat_features.json"):
    with open("models/cat_features.json") as f:
        CAT_FEATURES = json.load(f)
else:
    CAT_FEATURES = [
        "race", "gender", "weight", "payer_code", "medical_specialty",
        "diag_1", "diag_2", "diag_3", "max_glu_serum", "A1Cresult",
        "metformin", "repaglinide", "nateglinide", "chlorpropamide",
        "glimepiride", "acetohexamide", "glipizide", "glyburide",
        "tolbutamide", "pioglitazone", "rosiglitazone", "acarbose",
        "miglitol", "troglitazone", "tolazamide", "examide",
        "citoglipton", "insulin", "glyburide_metformin",
        "glipizide_metformin", "glimepiride_pioglitazone",
        "metformin_rosiglitazone", "metformin_pioglitazone",
        "change", "diabetesMed"
    ]

def run_ml_model(input_json: dict):
    """
    Run CatBoost model on provided input.
    - Missing categorical features → "missing"
    - Missing numeric features → np.nan
    - Gracefully ignore bad inputs (like string for numeric)
    """

    row = {}
    for f in EXPECTED_FEATURES:
        val = input_json.get(f, None)

        if f in CAT_FEATURES:
            row[f] = str(val) if val is not None and val == val else "missing"
        else:
            try:
                row[f] = float(val) if val is not None else np.nan
            except (ValueError, TypeError):
                row[f] = np.nan

    X = pd.DataFrame([row])

    # Predict probability
    prob = float(model.predict_proba(X)[:, 1][0])

    # SHAP explanation
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)
    feature_contribs = dict(zip(EXPECTED_FEATURES, shap_values[0]))

    # Only return drivers for features provided
    top_features = {k: v for k, v in feature_contribs.items() if k in input_json}

    # Risk band
    if prob < 0.33:
        band = "low"
    elif prob < 0.66:
        band = "medium"
    else:
        band = "high"

    return {
        "risk_score": prob,
        "band": band,
        "top_features": top_features
    }
