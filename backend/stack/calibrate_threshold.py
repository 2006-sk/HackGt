import numpy as np
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, brier_score_loss
from sklearn.model_selection import train_test_split
from catboost import CatBoostClassifier
from stack.preprocess_tabular import load_tabular

def calibrate():
    # Load dataset
    X, y, cat_cols = load_tabular(return_cat_cols=True)

    # Train/val split (same stratification as model training)
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    # Load CatBoost model
    model = CatBoostClassifier()
    try:
        model.load_model("stack/catboost_tuned.cbm")
    except:
        model.load_model("stack/catboost_model.cbm")

    # Get raw scores (logits) instead of probs
    raw_val = model.predict(X_val, prediction_type="RawFormulaVal")

    # Fit Platt scaling (logistic regression on raw scores)
    platt = LogisticRegression(max_iter=2000)
    platt.fit(raw_val.reshape(-1, 1), y_val)

    # Apply calibration
    p_raw = model.predict_proba(X_val)[:, 1]
    p_cal = platt.predict_proba(raw_val.reshape(-1, 1))[:, 1]

    # Metrics
    auc_raw = roc_auc_score(y_val, p_raw)
    auc_cal = roc_auc_score(y_val, p_cal)
    brier_raw = brier_score_loss(y_val, p_raw)
    brier_cal = brier_score_loss(y_val, p_cal)

    print(f"AUC raw={auc_raw:.3f} | AUC calib={auc_cal:.3f}")
    print(f"Brier raw={brier_raw:.3f} | Brier calib={brier_cal:.3f}")

    # Save calibrator
    joblib.dump(platt, "stack/calibrator_platt.pkl")
    print("✓ Saved stack/calibrator_platt.pkl")

if __name__ == "__main__":
    calibrate()