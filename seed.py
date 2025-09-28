# -*- coding: utf-8 -*-
# seed.py
import uuid
from app.db import SessionLocal, Customer, Patient
import sqlalchemy
db = SessionLocal()

# 🧹 Clean old data
db.query(Patient).delete()
db.query(Customer).delete()
db.commit()

# 🧑‍⚕️ Add demo customer
cust = Customer(id="CUST1", name="Demo Hospital")
db.add(cust)
db.commit()

# 🧪 15 patient profiles: low, medium, and high risk
profiles = [
    # --- CHILD (0-10) ---
    {
        "id": "P1", "name": "Alice Nguyen",
        "details": {
            "race": "Asian", "gender": "Female", "weight": "20-25", "payer_code": "SP",
            "medical_specialty": "Pediatrics", "diag_1": "Asthma", "diag_2": "Allergy", "diag_3": "None",
            "max_glu_serum": "None", "A1Cresult": "None", "metformin": "No", "insulin": "No",
            "change": "No", "diabetesMed": "No",
            "time_in_hospital": 3, "num_lab_procedures": 12, "num_procedures": 0, "num_medications": 3,
            "number_outpatient": 2, "number_emergency": 1, "number_inpatient": 0, "number_diagnoses": 2, "age": 2
        }
    },

    # --- TEENS / YOUNG ADULT (10-25) ---
    {
        "id": "P2", "name": "Brian Thompson",
        "details": {
            "race": "Caucasian", "gender": "Male", "weight": "60-70", "payer_code": "MC",
            "medical_specialty": "Emergency", "diag_1": "Fracture", "diag_2": "None", "diag_3": "None",
            "max_glu_serum": "None", "A1Cresult": "None", "metformin": "No", "insulin": "No",
            "change": "No", "diabetesMed": "No",
            "time_in_hospital": 2, "num_lab_procedures": 10, "num_procedures": 0, "num_medications": 2,
            "number_outpatient": 1, "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 1, "age": 3
        }
    },
    {
        "id": "P3", "name": "Sara Ali",
        "details": {
            "race": "AfricanAmerican", "gender": "Female", "weight": "55-65", "payer_code": "MD",
            "medical_specialty": "Endocrinology", "diag_1": "Type1 Diabetes", "diag_2": "None", "diag_3": "None",
            "max_glu_serum": "150", "A1Cresult": "9", "metformin": "No", "insulin": "Up",
            "change": "Ch", "diabetesMed": "Yes",
            "time_in_hospital": 7, "num_lab_procedures": 30, "num_procedures": 1, "num_medications": 8,
            "number_outpatient": 0, "number_emergency": 1, "number_inpatient": 1, "number_diagnoses": 4, "age": 4
        }
    },

    # --- ADULT (25-50) ---
    {
        "id": "P4", "name": "David Kim",
        "details": {
            "race": "Asian", "gender": "Male", "weight": "75-85", "payer_code": "BC",
            "medical_specialty": "Surgery", "diag_1": "Appendectomy", "diag_2": "None", "diag_3": "None",
            "max_glu_serum": "None", "A1Cresult": "None", "metformin": "No", "insulin": "No",
            "change": "No", "diabetesMed": "No",
            "time_in_hospital": 5, "num_lab_procedures": 22, "num_procedures": 1, "num_medications": 6,
            "number_outpatient": 0, "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 2, "age": 5
        }
    },
    {
        "id": "P5", "name": "Maria Gonzalez",
        "details": {
            "race": "Hispanic", "gender": "Female", "weight": "65-75", "payer_code": "SP",
            "medical_specialty": "Obstetrics", "diag_1": "Pregnancy", "diag_2": "Anemia", "diag_3": "None",
            "max_glu_serum": "None", "A1Cresult": "None", "metformin": "No", "insulin": "No",
            "change": "No", "diabetesMed": "No",
            "time_in_hospital": 4, "num_lab_procedures": 18, "num_procedures": 0, "num_medications": 4,
            "number_outpatient": 1, "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 2, "age": 5
        }
    },

    # --- MID-LIFE (50-60) ---
    {
        "id": "P6", "name": "Michael Brown",
        "details": {
            "race": "Caucasian", "gender": "Male", "weight": "85-95", "payer_code": "MC",
            "medical_specialty": "Cardiology", "diag_1": "Hypertension", "diag_2": "Hyperlipidemia", "diag_3": "Obesity",
            "max_glu_serum": "None", "A1Cresult": "7", "metformin": "Yes", "insulin": "No",
            "change": "Ch", "diabetesMed": "Yes",
            "time_in_hospital": 8, "num_lab_procedures": 36, "num_procedures": 2, "num_medications": 12,
            "number_outpatient": 2, "number_emergency": 1, "number_inpatient": 1, "number_diagnoses": 6, "age": 6
        }
    },
    {
        "id": "P7", "name": "Angela White",
        "details": {
            "race": "Caucasian", "gender": "Female", "weight": "70-80", "payer_code": "MC",
            "medical_specialty": "Oncology", "diag_1": "Breast Cancer", "diag_2": "Anemia", "diag_3": "None",
            "max_glu_serum": "None", "A1Cresult": "None", "metformin": "No", "insulin": "No",
            "change": "No", "diabetesMed": "No",
            "time_in_hospital": 14, "num_lab_procedures": 50, "num_procedures": 3, "num_medications": 18,
            "number_outpatient": 0, "number_emergency": 1, "number_inpatient": 2, "number_diagnoses": 7, "age": 6
        }
    },

    # --- SENIOR (55-65) ---
    {
        "id": "P8", "name": "Ravi Patel",
        "details": {
            "race": "Asian", "gender": "Male", "weight": "70-80", "payer_code": "BC",
            "medical_specialty": "Nephrology", "diag_1": "CKD Stage 3", "diag_2": "Diabetes", "diag_3": "Hypertension",
            "max_glu_serum": "250", "A1Cresult": "8", "metformin": "Yes", "insulin": "Up",
            "change": "Ch", "diabetesMed": "Yes",
            "time_in_hospital": 10, "num_lab_procedures": 44, "num_procedures": 2, "num_medications": 15,
            "number_outpatient": 0, "number_emergency": 1, "number_inpatient": 1, "number_diagnoses": 8, "age": 6
        }
    },
    {
        "id": "P9", "name": "Helen Carter",
        "details": {
            "race": "Caucasian", "gender": "Female", "weight": "65-75", "payer_code": "MD",
            "medical_specialty": "GeneralPractice", "diag_1": "Arthritis", "diag_2": "Hypertension", "diag_3": "None",
            "max_glu_serum": "None", "A1Cresult": "None", "metformin": "No", "insulin": "No",
            "change": "No", "diabetesMed": "No",
            "time_in_hospital": 6, "num_lab_procedures": 28, "num_procedures": 1, "num_medications": 9,
            "number_outpatient": 2, "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 4, "age": 6
        }
    },

    # --- OLDER ADULT (65-75) ---
    {
        "id": "P10", "name": "Frank Johnson",
        "details": {
            "race": "AfricanAmerican", "gender": "Male", "weight": "80-90", "payer_code": "MC",
            "medical_specialty": "Cardiology", "diag_1": "CHF", "diag_2": "Diabetes", "diag_3": "CKD Stage 2",
            "max_glu_serum": "300", "A1Cresult": "9", "metformin": "Yes", "insulin": "Up",
            "change": "Ch", "diabetesMed": "Yes",
            "time_in_hospital": 13, "num_lab_procedures": 52, "num_procedures": 3, "num_medications": 19,
            "number_outpatient": 0, "number_emergency": 2, "number_inpatient": 2, "number_diagnoses": 9, "age": 7
        }
    },
    {
        "id": "P11", "name": "Linda Park",
        "details": {
            "race": "Asian", "gender": "Female", "weight": "55-65", "payer_code": "BC",
            "medical_specialty": "Neurology", "diag_1": "Stroke", "diag_2": "Hypertension", "diag_3": "Diabetes",
            "max_glu_serum": "None", "A1Cresult": "7", "metformin": "Yes", "insulin": "Steady",
            "change": "Ch", "diabetesMed": "Yes",
            "time_in_hospital": 9, "num_lab_procedures": 40, "num_procedures": 2, "num_medications": 13,
            "number_outpatient": 0, "number_emergency": 1, "number_inpatient": 1, "number_diagnoses": 7, "age": 7
        }
    },

    # --- ELDERLY (75-90) ---
    {
        "id": "P12", "name": "George Miller",
        "details": {
            "race": "Caucasian", "gender": "Male", "weight": "70-80", "payer_code": "MC",
            "medical_specialty": "Geriatrics", "diag_1": "Dementia", "diag_2": "Hypertension", "diag_3": "CKD",
            "max_glu_serum": "None", "A1Cresult": "None", "metformin": "No", "insulin": "No",
            "change": "No", "diabetesMed": "No",
            "time_in_hospital": 10, "num_lab_procedures": 38, "num_procedures": 2, "num_medications": 14,
            "number_outpatient": 1, "number_emergency": 1, "number_inpatient": 2, "number_diagnoses": 6, "age": 8
        }
    },
    {
        "id": "P13", "name": "Evelyn Scott",
        "details": {
            "race": "Caucasian", "gender": "Female", "weight": "60-70", "payer_code": "SP",
            "medical_specialty": "Oncology", "diag_1": "Colon Cancer", "diag_2": "Anemia", "diag_3": "Hypertension",
            "max_glu_serum": "None", "A1Cresult": "None", "metformin": "No", "insulin": "No",
            "change": "No", "diabetesMed": "No",
            "time_in_hospital": 16, "num_lab_procedures": 55, "num_procedures": 4, "num_medications": 20,
            "number_outpatient": 0, "number_emergency": 1, "number_inpatient": 3, "number_diagnoses": 9, "age": 8
        }
    },

    # --- VERY ELDERLY (>90) ---
    {
        "id": "P14", "name": "Arthur Wilson",
        "details": {
            "race": "Caucasian", "gender": "Male", "weight": "60-70", "payer_code": "MC",
            "medical_specialty": "Geriatrics", "diag_1": "Frailty", "diag_2": "Hypertension", "diag_3": "Diabetes",
            "max_glu_serum": "None", "A1Cresult": "8", "metformin": "Yes", "insulin": "Steady",
            "change": "Ch", "diabetesMed": "Yes",
            "time_in_hospital": 12, "num_lab_procedures": 46, "num_procedures": 2, "num_medications": 17,
            "number_outpatient": 0, "number_emergency": 1, "number_inpatient": 2, "number_diagnoses": 8, "age": 9
        }
    },
    {
        "id": "P15", "name": "Margaret Lee",
        "details": {
            "race": "Asian", "gender": "Female", "weight": "50-60", "payer_code": "SP",
            "medical_specialty": "Geriatrics", "diag_1": "Pneumonia", "diag_2": "Diabetes", "diag_3": "Hypertension",
            "max_glu_serum": "200", "A1Cresult": "9", "metformin": "Yes", "insulin": "Up",
            "change": "Ch", "diabetesMed": "Yes",
            "time_in_hospital": 14, "num_lab_procedures": 48, "num_procedures": 3, "num_medications": 18,
            "number_outpatient": 0, "number_emergency": 2, "number_inpatient": 3, "number_diagnoses": 9, "age": 9
        }
    }
]

# Insert demo patients
for p in profiles:
    db.add(Patient(
        id=p["id"],
        name=p["name"],
        details=p["details"],
        status="not_discharged",
        customer_id=cust.id
    ))

db.commit()
db.close()
print("✅ Database seeded with 15 demo patients (low, medium, high risk).")