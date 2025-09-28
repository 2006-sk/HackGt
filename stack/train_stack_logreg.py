import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
import joblib

def train():
    p_cat = np.load("stack/p_catboost.npy")
    p_lr  = np.load("stack/p_lr.npy")
    y_val = np.load("stack/y_val.npy") if "stack/y_val.npy" else None

    # Stack base model predictions
    X_stack = np.column_stack([p_cat, p_lr])

    stacker = LogisticRegression(max_iter=2000)
    stacker.fit(X_stack, y_val)

    p_stack = stacker.predict_proba(X_stack)[:,1]

    print(f"CatBoost AUC={roc_auc_score(y_val, p_cat):.3f}")
    print(f"Logistic Regression AUC={roc_auc_score(y_val, p_lr):.3f}")
    print(f"Stacked AUC={roc_auc_score(y_val, p_stack):.3f}")

    joblib.dump(stacker, "stack/stacker_logreg.pkl")
    print("✓ Saved stacker_logreg.pkl")

if __name__ == "__main__":
    train()