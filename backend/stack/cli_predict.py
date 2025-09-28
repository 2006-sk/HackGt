import argparse
import joblib
from catboost import CatBoostClassifier
from stack.preprocess_tabular import preprocess

def risk_band(prob, low=0.2, high=0.5):
    if prob < low:
        return "Low"
    elif prob < high:
        return "Medium"
    else:
        return "High"

def main():
    parser = argparse.ArgumentParser(description="Predict readmission risk")
    parser.add_argument("row", type=int, help="Row index from validation set")
    args = parser.parse_args()
    row = args.row

    # Load dataset (get val split only)
    _, X_val, _, y_val, cat_cols = preprocess()

    if row < 0 or row >= len(X_val):
        print(f"Row {row} out of range (0..{len(X_val)-1})")
        return

    # Load CatBoost model
    model = CatBoostClassifier()
    try:
        model.load_model("stack/catboost_tuned.cbm")
    except:
        model.load_model("stack/catboost_model.cbm")

    # Raw probability
    raw_prob = float(model.predict_proba(X_val.iloc[[row]])[:, 1][0])

    # Try calibrated probability
    try:
        platt = joblib.load("stack/calibrator_platt.pkl")
        raw_score = model.predict(X_val.iloc[[row]], prediction_type="RawFormulaVal")[0]
        cal_prob = float(platt.predict_proba([[raw_score]])[:, 1][0])
    except:
        cal_prob = raw_prob

    # Risk band
    band = risk_band(cal_prob)

    # Print result
    print("\n=== PREDICTION RESULT ===")
    print(f"Row index   : {row}")
    print(f"True label  : {y_val[row]}")
    print(f"Raw prob    : {raw_prob:.3f}")
    print(f"Calib prob  : {cal_prob:.3f}")
    print(f"Risk band   : {band}")
    print("=========================\n")

if __name__ == "__main__":
    main()