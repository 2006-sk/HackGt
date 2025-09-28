import argparse
from catboost import CatBoostClassifier, Pool
from stack.preprocess_tabular import preprocess

def test_counterfactual(row_index, new_diag):
    # Load model
    model = CatBoostClassifier()
    model.load_model("stack/catboost_tuned.cbm")

    # Load validation data
    _, X_val, _, _, cat_cols = preprocess()

    # Get patient row
    if row_index >= len(X_val):
        raise ValueError(f"Row {row_index} out of range (val set has {len(X_val)} rows).")

    original = X_val.iloc[[row_index]]
    modified = original.copy()

    # Change diagnosis
    modified["diag_1"] = new_diag

    # Wrap in Pool
    pool_orig = Pool(original, cat_features=cat_cols)
    pool_mod  = Pool(modified, cat_features=cat_cols)

    # Predict
    prob_orig = model.predict_proba(pool_orig)[:,1][0]
    prob_mod  = model.predict_proba(pool_mod)[:,1][0]

    print("\n=== Counterfactual Test ===")
    print(f"Row index     : {row_index}")
    print(f"Original diag : {original['diag_1'].values[0]}  -> Pred prob = {prob_orig:.3f}")
    print(f"New diag      : {new_diag}  -> Pred prob = {prob_mod:.3f}")
    print("============================\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Counterfactual test: change diagnosis and compare risk.")
    parser.add_argument("--row", type=int, required=True, help="Row index from validation set")
    parser.add_argument("--diag", type=str, required=True, help="New diagnosis code for diag_1")
    args = parser.parse_args()

    test_counterfactual(args.row, args.diag)