# app/diagnosis_normalizer.py

# Simple dictionary mapping of common conditions to ICD codes
# app/diagnosis_normalizer.py

DIAGNOSIS_MAP = {
    # Metabolic / Endocrine
    "diabetes": "250",
    "type 1 diabetes": "250",
    "type 2 diabetes": "250",
    "obesity": "278",
    "hyperlipidemia": "272",
    "hypothyroidism": "244",
    "hyperthyroidism": "242",

    # Cardiovascular
    "hypertension": "401",
    "high blood pressure": "401",
    "congestive heart failure": "428",
    "heart failure": "428",
    "coronary artery disease": "414",
    "myocardial infarction": "410",
    "heart attack": "410",
    "angina": "413",
    "cardiac arrhythmia": "427",
    "atrial fibrillation": "427.31",
    "stroke": "434",
    "transient ischemic attack": "435",
    "peripheral vascular disease": "443",

    # Respiratory
    "asthma": "493",
    "chronic obstructive pulmonary disease": "496",
    "copd": "496",
    "pneumonia": "486",
    "respiratory failure": "518.81",

    # Renal
    "chronic kidney disease": "585",
    "acute kidney failure": "584",
    "end stage renal disease": "585.6",
    "urinary tract infection": "599",

    # Hematologic
    "anemia": "285",
    "iron deficiency anemia": "280",
    "leukemia": "208",

    # Neurologic
    "dementia": "290",
    "alzheimers": "331",
    "parkinson's disease": "332",
    "epilepsy": "345",

    # Musculoskeletal
    "osteoarthritis": "715",
    "arthritis": "715",
    "rheumatoid arthritis": "714",
    "fracture of femur": "820",
    "hip fracture": "820",
    "osteoporosis": "733",

    # Infectious diseases
    "sepsis": "995.91",
    "septicemia": "038",
    "hiv": "042",
    "tuberculosis": "011",
    "influenza": "487",

    # Gastrointestinal
    "cirrhosis": "571",
    "hepatitis": "070",
    "gastrointestinal bleed": "578",
    "peptic ulcer": "533",
    "cholelithiasis": "574",

    # Cancer
    "lung cancer": "162",
    "breast cancer": "174",
    "colon cancer": "153",
    "prostate cancer": "185",
    "pancreatic cancer": "157",

    # Psychiatric
    "depression": "311",
    "major depressive disorder": "296.2",
    "bipolar disorder": "296.4",
    "schizophrenia": "295",
    "anxiety": "300",
    "substance abuse": "305",
    "alcohol dependence": "303",

    # Other common
    "complications of device": "996",
    "injury": "959",
    "pregnancy complications": "646",
}


def normalize_diagnosis(diagnosis_text: str) -> str:
    """
    Normalize doctor-entered diagnosis text into an ICD code if available.
    Falls back to raw input if no mapping is found.
    """
    if not diagnosis_text:
        return diagnosis_text

    text = diagnosis_text.strip().lower()
    return DIAGNOSIS_MAP.get(text, diagnosis_text)

def normalize_all_diagnoses(details: dict) -> dict:
    """Normalize all diag_1, diag_2, diag_3 fields if present."""
    out = {}
    for k, v in details.items():
        if k.startswith("diag_") and v:
            out[k] = normalize_diagnosis(v)
        else:
            out[k] = v
    return out

# Reverse map for ICD → text (pick first term for duplicates like hypertension/401)
ICD_TO_TEXT = {v: k for k, v in DIAGNOSIS_MAP.items()}

def denormalize_diagnosis(icd_code: str) -> str:
    """Convert ICD code back to human-readable text if known."""
    if not icd_code:
        return icd_code
    return ICD_TO_TEXT.get(icd_code, icd_code)

def denormalize_all_diagnoses(details: dict | None) -> dict:
    """Convert diag_1, diag_2, diag_3 fields from ICD codes back to readable terms."""
    if not details:
        return {}

    out = {}
    for k, v in details.items():
        if k.startswith("diag_") and v:
            out[k] = denormalize_diagnosis(v)
        else:
            out[k] = v
    return out

