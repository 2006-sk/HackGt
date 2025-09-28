import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
import joblib
from stack.preprocess_tabular import preprocess

def train():
    # Preprocess
    X_train, X_val, y_train, y_val, cat_cols = preprocess()

    # Column transformer: one-hot for categorical, passthrough numeric
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
            ("num", "passthrough", [c for c in X_train.columns if c not in cat_cols])
        ]
    )

    # Pipeline: preprocessing + Logistic Regression
    model = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", LogisticRegression(
            max_iter=5000,
            solver="saga",
            penalty="l1",   # sparsity for feature selection
            n_jobs=-1
        ))
    ])

    # Fit
    model.fit(X_train, y_train)

    # Validation predictions
    preds = model.predict_proba(X_val)[:, 1]
    print("LogReg AUC:", roc_auc_score(y_val, preds))

    # Save validation preds
    np.save("stack/p_lr.npy", preds)

    # Save full pipeline (preprocessing + model)
    joblib.dump(model, "stack/lr_model.pkl")
    print("✓ Saved lr_model.pkl and validation preds")

if __name__ == "__main__":
    train()