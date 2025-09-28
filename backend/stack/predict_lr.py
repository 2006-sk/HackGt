import numpy as np
import joblib
from stack.preprocess_tabular import preprocess

def predict():
    _, X_val, _, y_val, cat_cols = preprocess()

    model, oe, cat_cols = joblib.load("stack/lr_model.pkl")

    X_val_enc = X_val.copy()
    X_val_enc[cat_cols] = oe.transform(X_val[cat_cols])

    preds = model.predict_proba(X_val_enc)[:,1]

    np.save("stack/p_lr.npy", preds)
    np.save("stack/y_val.npy", y_val)
    print("Saved LR predictions to stack/p_lr.npy")

if __name__ == "__main__":
    predict()