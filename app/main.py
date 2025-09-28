from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime
import uuid
from sqlalchemy.exc import IntegrityError
from app.diagnosis_normalizer import normalize_diagnosis, normalize_all_diagnoses, denormalize_all_diagnoses

from fastapi.middleware.cors import CORSMiddleware

from app.db import SessionLocal, Customer, Patient, Prediction, Nudge
from app.ml import run_ml_model
from app.nudges import generate_nudges
from app.explain import explain_with_openai
from app.utils import demo_rescale, demo_adjust, band_from_score

app = FastAPI(title="Readmission Backend", version="1.0.0")

# Allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],  # allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Pydantic Schemas
# -----------------------------
class MultiFieldUpdate(BaseModel):
    updates: dict


class PredictRequest(BaseModel):
    input: dict

class CustomerRequest(BaseModel):
    id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)

class StatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(discharged|not_discharged)$")

class ChatbotRequest(BaseModel):
    patient_id: str
    hypothetical_change: str

# -----------------------------
# Helpers
# -----------------------------
DRUG_FIELDS = {
    "metformin", "repaglinide", "nateglinide", "chlorpropamide", "glimepiride",
    "acetohexamide", "glipizide", "glyburide", "tolbutamide", "pioglitazone",
    "rosiglitazone", "acarbose", "miglitol", "troglitazone", "tolazamide",
    "examide", "citoglipton", "insulin", "glyburide_metformin",
    "glipizide_metformin", "glimepiride_pioglitazone", "metformin_rosiglitazone",
    "metformin_pioglitazone"
}

def normalize_drugs(details: dict) -> dict:
    """Normalize drug fields: Steady/Up/Down -> Yes, No stays No"""
    out = {}
    for k, v in details.items():
        if k in DRUG_FIELDS:
            if v is None:
                out[k] = "No"
            elif str(v).lower() == "no":
                out[k] = "No"
            else:
                out[k] = "Yes"
        else:
            out[k] = v
    return out

def _get_customer_or_404(db, customer_id: str) -> Customer:
    c = db.query(Customer).filter(Customer.id == customer_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    return c

def _get_patient_or_404(db, customer_id: str, patient_id: str) -> Patient:
    p = (
        db.query(Patient)
        .filter(Patient.id == patient_id, Patient.customer_id == customer_id)
        .first()
    )
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    return p

# -----------------------------
# Routes
# -----------------------------
@app.get("/health")
@app.get("/health/")
def health():
    return {"status": "ok"}

# --- Customers ---
@app.post("/customers", status_code=201)
def create_customer(customer: CustomerRequest):
    db = SessionLocal()
    try:
        exists = db.query(Customer).filter(Customer.id == customer.id).first()
        if exists:
            raise HTTPException(status_code=409, detail="Customer already exists")
        cust = Customer(id=customer.id, name=customer.name)
        db.add(cust)
        db.commit()
        return {"id": cust.id, "name": cust.name}
    finally:
        db.close()

@app.get("/customers")
def list_customers():
    db = SessionLocal()
    try:
        rows = db.query(Customer).all()
        return [{"id": r.id, "name": r.name} for r in rows]
    finally:
        db.close()

# --- Patients ---
# --- Patients List ---
@app.get("/customers/{customer_id}/patients")
def list_patients(customer_id: str):
    db = SessionLocal()
    try:
        _get_customer_or_404(db, customer_id)
        patients = (
            db.query(Patient)
            .filter(Patient.customer_id == customer_id)
            .all()
        )
        return [
            {
                "id": p.id,
                "name": p.name,
                "status": p.status,
                # ✅ denormalize diagnoses before sending
                "details": denormalize_all_diagnoses(p.details)
            }
            for p in patients
        ]
    finally:
        db.close()


from sqlalchemy.exc import IntegrityError

@app.post("/customers/{customer_id}/patients", status_code=201)
def add_patient(customer_id: str, request: dict):
    db = SessionLocal()
    try:
        _get_customer_or_404(db, customer_id)

        if "id" not in request or "name" not in request:
            raise HTTPException(status_code=400, detail="id and name are required")

        patient_id = request["id"]
        patient_name = request["name"]

        # Put everything else in details
        details = {k: v for k, v in request.items() if k not in {"id", "name"}}
        details = normalize_drugs(details)
        details = normalize_all_diagnoses(details)

        patient = Patient(
            id=patient_id,
            name=patient_name,
            details=details,
            customer_id=customer_id
        )
        db.add(patient)
        db.commit()

        return {
            "id": patient.id,
            "name": patient.name,
            "customer_id": patient.customer_id,
            "details": patient.details
        }

    except IntegrityError:
        db.rollback()
        # ✅ Handle duplicate patient ID gracefully
        raise HTTPException(
            status_code=409,
            detail=f"Patient with id '{request['id']}' already exists for customer {customer_id}"
        )
    finally:
        db.close()

@app.patch("/customers/{customer_id}/patients/{patient_id}/fields")
def update_patient_fields(customer_id: str, patient_id: str, update: MultiFieldUpdate):
    db = SessionLocal()
    try:
        # Ensure patient exists
        patient = _get_patient_or_404(db, customer_id, patient_id)

        # Load current details (could be None if empty)
        details = dict(patient.details or {})

        # Validate all requested fields exist
        missing = [f for f in update.updates.keys() if f not in details]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Fields {missing} do not exist for patient {patient_id}"
            )

        # ✅ Apply updates
        for field, value in update.updates.items():
            details[field] = value

        # Normalize drugs / diagnoses if needed
        details = normalize_drugs(details)
        details = normalize_all_diagnoses(details)

        # Save back
        patient.details = details
        db.commit()

        return {
            "id": patient.id,
            "name": patient.name,
            "updated_fields": update.updates,
            "details": details
        }
    finally:
        db.close()



@app.get("/customers/{customer_id}/patients/{patient_id}")
def get_patient(customer_id: str, patient_id: str):
    db = SessionLocal()
    try:
        patient = _get_patient_or_404(db, customer_id, patient_id)
        latest_pred = (
            db.query(Prediction)
            .filter_by(patient_id=patient.id)
            .order_by(Prediction.timestamp.desc())
            .first()
        )
        return {
            "id": patient.id,
            "name": patient.name,
            # ✅ denormalize before returning
            "details": denormalize_all_diagnoses(patient.details),
            "status": patient.status,
            "latest_band": latest_pred.band if latest_pred else None
        }
    finally:
        db.close()


@app.patch("/customers/{customer_id}/patients/{patient_id}/status")
def update_status(customer_id: str, patient_id: str, request: StatusUpdate):
    db = SessionLocal()
    try:
        patient = _get_patient_or_404(db, customer_id, patient_id)
        patient.status = request.status
        db.commit()
        return {"patient_id": patient.id, "status": patient.status}
    finally:
        db.close()

# --- Predictions ---
@app.post("/customers/{customer_id}/patients/{patient_id}/predict", status_code=201)
def predict(customer_id: str, patient_id: str, request: PredictRequest):
    db = SessionLocal()
    try:
        # ✅ Validate customer + patient
        _get_customer_or_404(db, customer_id)
        patient = _get_patient_or_404(db, customer_id, patient_id)

        # ✅ Merge new input into existing details
        new_input = dict(request.input or {})
        if not new_input:
            raise HTTPException(status_code=400, detail="Input payload is empty")

        merged_details = dict(patient.details or {})
        new_input = normalize_drugs(new_input)
        new_input = normalize_all_diagnoses(new_input)
        merged_details.update(new_input)

        # ✅ Save merged profile
        patient.details = merged_details
        db.commit()

        # ✅ Run ML
        ml_result = run_ml_model(merged_details)
        raw_score = ml_result.get("risk_score", 0.1)
        top_features = ml_result.get("top_features", {})

        # Hackathon demo tweak
        risk_score = demo_adjust(raw_score)
        band = band_from_score(risk_score)

        ml_result["risk_score"] = risk_score
        ml_result["band"] = band

        # ✅ Explanation
        try:
            explanation = explain_with_openai(merged_details, risk_score, top_features)
        except Exception:
            explanation = (
                f"The model assigned a {band} readmission risk "
                f"(score {risk_score:.2f}). Key factors include {list(top_features)[:3]}."
            )

        # ✅ Save prediction
        pred = Prediction(
            id=str(uuid.uuid4()),
            patient_id=patient.id,
            risk_score=risk_score,
            band=band,
            top_features=top_features,
            explanation=explanation,
            timestamp=datetime.utcnow()
        )
        db.add(pred)
        db.commit()

        # ✅ Dynamic nudges
        nudges = generate_nudges(merged_details, ml_result) or []

        for n in nudges:
            if isinstance(n, dict):
                db.add(Nudge(
                    prediction_id=pred.id,
                    suggestion=n.get("body") or n.get("title", ""),
                    category=",".join(n.get("tags", [])) if isinstance(n.get("tags"), list) else n.get("id", "general")
                ))
            else:
                # fallback if nudges are plain strings
                db.add(Nudge(
                    prediction_id=pred.id,
                    suggestion=str(n),
                    category="general"
                ))
        db.commit()

        # ✅ Response
        return {
            "patient_id": patient_id,
            "prediction": {
                "id": pred.id,
                "risk_score": pred.risk_score,
                "band": pred.band,
                "top_features": pred.top_features,
                "explanation": pred.explanation,
                "timestamp": pred.timestamp
            },
            "nudges": nudges,
            "merged_details": merged_details
        }

    finally:
        db.close()


@app.get("/customers/{customer_id}/patients/{patient_id}/predictions")
def get_predictions(customer_id: str, patient_id: str):
    db = SessionLocal()
    try:
        _get_patient_or_404(db, customer_id, patient_id)
        preds = (
            db.query(Prediction)
            .filter_by(patient_id=patient_id)
            .order_by(Prediction.timestamp.desc())
            .all()
        )
        return [
            {
                "id": p.id,
                "risk_score": p.risk_score,
                "band": p.band,
                "timestamp": p.timestamp,
                "explanation": p.explanation
            }
            for p in preds
        ]
    finally:
        db.close()

#@app.get("/customers/{customer_id}/patients/{patient_id}/nudges")
#def get_nudges(customer_id: str, patient_id: str):
 #   db = SessionLocal()
  #  try:
   #     _get_patient_or_404(db, customer_id, patient_id)
    #    preds = (
     #       db.query(Prediction)
      #      .filter_by(patient_id=patient_id)
       #     .order_by(Prediction.timestamp.desc())
        #    .all()
  #      )
   #     out = []
    ##       for n in p.nudges:
      #          out.append({
       #             "prediction_id": p.id,
        #            "suggestion": n.suggestion,
          #          "category": n.category,
         #           "timestamp": n.timestamp
           #     })
       # return out
    #finally:
     #   db.close()

# --- Analytics ---
@app.get("/analytics/customers/{customer_id}")
def customer_analytics(customer_id: str):
    db = SessionLocal()
    try:
        _get_customer_or_404(db, customer_id)
        preds = (
            db.query(Prediction)
            .join(Patient, Patient.id == Prediction.patient_id)
            .filter(Patient.customer_id == customer_id)
            .all()
        )
        if not preds:
            return {"msg": "no predictions yet"}

        avg_score = sum(p.risk_score for p in preds) / len(preds)
        bands = {"low": 0, "medium": 0, "high": 0}
        unique_patients = len({p.patient_id for p in preds})
        for p in preds:
            bands[p.band] += 1

        return {
            "avg_risk": avg_score,
            "band_distribution": bands,
            "unique_patients": unique_patients,
            "total_predictions": len(preds)
        }
    finally:
        db.close()

@app.get("/analytics/patients/{customer_id}/{patient_id}")
def patient_analytics(customer_id: str, patient_id: str):
    db = SessionLocal()
    try:
        _get_patient_or_404(db, customer_id, patient_id)
        preds = (
            db.query(Prediction)
            .filter_by(patient_id=patient_id)
            .order_by(Prediction.timestamp.asc())
            .all()
        )
        return [
            {"timestamp": p.timestamp, "risk_score": p.risk_score, "band": p.band}
            for p in preds
        ]
    finally:
        db.close()

# --- Chatbot ---
@app.post("/chatbot/query")
def chatbot_query(req: ChatbotRequest):
    db = SessionLocal()
    try:
        p = db.query(Patient).filter(Patient.id == req.patient_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Patient not found")
        return {
            "patient_id": req.patient_id,
            "response": f"Hypothetical: `{req.hypothetical_change}` may reduce risk. (Demo)"
        }
    finally:
        db.close()

