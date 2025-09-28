import pandas as pd
import numpy as np
import json
from sklearn.model_selection import StratifiedShuffleSplit

def convert_age(age_str: str) -> int:
    """
    Convert age like '[70-80)' to midpoint (e.g., 75).
    """
    if pd.isna(age_str):
        return np.nan
    age_str = age_str.strip("[]()")
    try:
        lo, hi = age_str.split("-")
        return (int(lo) + int(hi)) // 2
    except Exception:
        return np.nan

def preprocess(path="data/diabetic_data.csv"):
    df = pd.read_csv(path)

    # Target: drop >30, map to binary
    df = df[df["readmitted"] != ">30"]
    df["target"] = df["readmitted"].map({"<30": 1, "NO": 0})
    df = df.drop(columns=["encounter_id", "patient_nbr", "readmitted"])

    df = df.replace("?", np.nan)

    # Drop known leakage-prone columns
    drop_cols = ["discharge_disposition_id"]
    df = df.drop(columns=[c for c in drop_cols if c in df.columns])

    # Convert age into midpoint
    if "age" in df.columns:
        df["age"] = df["age"].apply(convert_age)

    # Categorical vs numeric
    cat_cols = df.select_dtypes(include="object").columns.tolist()
    for c in cat_cols:
        df[c] = df[c].fillna("missing").astype(str)

    num_cols = [c for c in df.columns if c not in cat_cols + ["target"]]
    df[num_cols] = df[num_cols].apply(pd.to_numeric, errors="coerce").fillna(0)

    X = df[cat_cols + num_cols]
    y = df["target"].astype(int).values

    # One consistent train/val split
    sss = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, val_idx = next(sss.split(X, y))

    # Save validation indices
    np.save("stack/val_idx.npy", val_idx)

    # Save feature names & categorical columns
    feature_names = list(X.columns)
    with open("models/feature_names.json", "w") as f:
        json.dump(feature_names, f)

    with open("models/cat_features.json", "w") as f:
        json.dump(cat_cols, f)

    return X.iloc[train_idx], X.iloc[val_idx], y[train_idx], y[val_idx], cat_cols

if __name__ == "__main__":
    preprocess()
    print("✓ Preprocessing complete, feature_names.json & cat_features.json saved")
