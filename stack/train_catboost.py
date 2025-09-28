from catboost import CatBoostClassifier
from sklearn.metrics import roc_auc_score
from stack.preprocess_tabular import preprocess
import numpy as np
def train():
    X_train, X_val, y_train, y_val, cat_cols = preprocess()

    model = CatBoostClassifier(
        iterations=500,
        depth=6,
        learning_rate=0.05,
        loss_function="Logloss",
        eval_metric="AUC",
        cat_features=cat_cols,
        nan_mode = "Min",
        random_seed=42,
        verbose=100
    )
    model.fit(X_train, y_train, eval_set=(X_val, y_val), use_best_model=True)

    preds = model.predict_proba(X_val)[:,1]
    print("CatBoost AUC:", roc_auc_score(y_val, preds))
    np.save("stack/p_catboost.npy", preds)
    model.save_model("stack/catboost_model.cbm")

if __name__ == "__main__":
    train()