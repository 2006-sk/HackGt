from typing import Dict
from openai import OpenAI
import os
from dotenv import load_dotenv
from app.utils import band_from_score
from app.diagnosis_normalizer import denormalize_diagnosis

# Load API key from .env
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def _map_feature_to_clinical(feat: str, val):
    """Translate raw feature/value into a clinical statement."""
    if val is None or val == "None":
        return None

    if feat == "num_medications":
        return f"high medication burden ({val} active meds)"
    if feat == "A1Cresult":
        return f"poor glycemic control (A1C {val})"
    if feat == "time_in_hospital":
        return f"prolonged hospitalization ({val} days)"
    if feat == "number_inpatient":
        return f"multiple prior inpatient admissions ({val})"
    if feat == "number_emergency":
        return f"frequent ER visits ({val})"
    if feat == "number_outpatient":
        return f"high outpatient utilization ({val})"
    if feat.startswith("diag") and val:
        return f"diagnosis: {denormalize_diagnosis(val)}"
    if feat == "age":
        return f"age {val} (risk increases with age)"
    if feat == "weight":
        return f"weight category {val}"
    return f"{feat} = {val}"


def explain_with_openai(input_dict: dict, risk_score: float, top_features: Dict[str, float] = None) -> str:
    band = band_from_score(risk_score)

    # Extract top 3 SHAP drivers
    driver_texts = []
    if top_features:
        sorted_drivers = sorted(top_features.items(), key=lambda x: abs(x[1]), reverse=True)[:3]
        for feat, contrib in sorted_drivers:
            val = input_dict.get(feat, None)
            clinical_text = _map_feature_to_clinical(feat, val)
            if clinical_text:
                driver_texts.append(f"- {clinical_text} (impact {contrib:.3f})")

    driver_block = "\n".join(driver_texts) or "- Insufficient feature data available"

    prompt = f"""
    A machine learning model predicted a hospital readmission risk score of {risk_score:.3f} ({band} risk).

    Top contributing features (already mapped to clinical terms):
    {driver_block}

    Task:
    Provide 2–4 bullet points for clinicians that:
    - ONLY explain the listed features (do not mention age, weight, or inpatient admissions unless explicitly in the list)
    - Describe why each listed feature elevates readmission risk in clinical terms
    - Keep it concise, logical, and evidence-based
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=220,
            temperature=0.2
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        return (
            f"Readmission risk is {band} (score {risk_score:.2f}).\n"
            f"Top factors:\n{driver_block}\n"
            f"(Automated explanation unavailable due to: {str(e)}.)"
        )