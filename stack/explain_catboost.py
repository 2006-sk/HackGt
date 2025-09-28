import numpy as np
from catboost import CatBoostClassifier, Pool
from stack.preprocess_tabular import preprocess

def explain(global_only=False, row_index=0):
    # 1. Load model
    model = CatBoostClassifier()
    model.load_model("stack/catboost_tuned.cbm")

    # 2. Load validation data
    _, X_val, _, y_val, cat_cols = preprocess()

    # === Global Importance ===
    print("\n=== GLOBAL FEATURE IMPORTANCE (Risk Drivers) ===")
    importances = model.get_feature_importance(prettified=True)
    print(importances.head(15))  # top 15 features globally
    if not global_only:
        print(f"\n=== LOCAL EXPLANATION for row {row_index} ===")
        sample = X_val.iloc[[row_index]]
        prob = model.predict_proba(sample)[:,1][0]

    # Wrap in Pool so CatBoost knows cat_features
        pool = Pool(sample, cat_features=cat_cols)

    # Get SHAP values
        shap_values = model.get_feature_importance(pool, type="ShapValues")

    # Last column = expected value (bias), drop it
        contribs = shap_values[0][:-1]

    # Pair feature names with contributions
        contribs = sorted(
            zip(sample.columns, contribs),
            key=lambda x: abs(x[1]),
            reverse=True
        )

        print(f"True label : {y_val[row_index]}")
        print(f"Pred prob  : {prob:.3f}")
        print("\nTop drivers for this patient:")
        for feat, val in contribs[:5]:
            direction = "↑ risk" if val > 0 else "↓ risk"
            print(f"{feat} = {sample.iloc[0][feat]} ({direction}, impact={val:.3f})")
if __name__ == "__main__":
    # Show both global + one patient explanation
    explain(global_only=False, row_index=5)