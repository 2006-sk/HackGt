import numpy as np
from catboost import CatBoostClassifier
from stack.preprocess_tabular import preprocess

def predict():
    _, X_val, _, y_val, cat_cols = preprocess()

    model = CatBoostClassifier()
    model.load_model("stack/catboost_model.cbm")

    preds = model.predict_proba(X_val)[:,1]
    np.save("stack/p_catboost.npy", preds)
    np.save("stack/y_val.npy", y_val)

if __name__ == "__main__":
    predict()