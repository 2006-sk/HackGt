from catboost import CatBoostClassifier
from sklearn.metrics import roc_auc_score
from stack.preprocess_tabular import preprocess
import numpy as np

def train():
    # Preprocess once with fixed val split
    X_train, X_val, y_train, y_val, cat_cols = preprocess()

    # Handle imbalance
    pos_weight = (len(y_train) - sum(y_train)) / sum(y_train)

    # Initialize model with tuned hyperparameters
    model = CatBoostClassifier(
        iterations=2000,
        learning_rate=0.03,
        depth=8,
        l2_leaf_reg=6,
        subsample=0.8,
        colsample_bylevel=0.8,
        loss_function="Logloss",
        eval_metric="AUC",          # ✅ stays in init
        scale_pos_weight=pos_weight,
        random_seed=42,
        od_type="Iter",             # early stopping
        od_wait=50,
        verbose=200
    )

    # Fit (eval_metric removed here ✅)
    model.fit(
        X_train, y_train,
        eval_set=(X_val, y_val),
        cat_features=cat_cols,
        use_best_model=True
    )

    # Evaluate
    preds = model.predict_proba(X_val)[:,1]
    auc = roc_auc_score(y_val, preds)
    print(f"Final CatBoost AUC: {auc:.3f}")

    # Save model + predictions
    model.save_model("stack/catboost_tuned.cbm")
    np.save("stack/p_catboost.npy", preds)
    np.save("stack/y_val.npy", y_val)

if __name__ == "__main__":
    train()