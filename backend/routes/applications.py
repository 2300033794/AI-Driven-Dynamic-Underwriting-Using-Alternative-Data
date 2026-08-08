"""
Application routes — CRUD for loan applications
"""

import uuid
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from db.database import get_connection
from models.scoring_engine import compute_risk_score, generate_decision_reason
from models.fraud_detector import detect_fraud
from models.explainer import compute_shap_contributions, generate_nl_explanation
from models.financial_health import calculate_financial_health
from models.recommendation_engine import generate_ai_recommendations

router = APIRouter(prefix="/api/applications", tags=["applications"])


class ApplicationCreate(BaseModel):
    # Personal
    name: str
    email: str
    phone: str
    pan: str
    aadhaar: str
    dob: str
    gender: str
    city: str
    loan_amount: float
    loan_purpose: str
    # Traditional
    credit_score: int = Field(default=650, ge=300, le=900)
    monthly_income: float
    employment_type: str
    employer: str = ""
    years_experience: float = 0
    existing_loans: int = 0
    emi_burden: float = 0
    # Alternative
    education_level: str = ""
    education_institute: str = ""
    linkedin_url: str = ""
    github_url: str = ""
    bill_payment_score: float = Field(default=60, ge=0, le=100)
    upi_transactions_monthly: int = 0
    digital_payment_consistency: float = Field(default=0.5, ge=0, le=1)
    certifications: int = 0
    # Consent
    consent_given: bool = True
    data_sharing_consent: str = "basic"


@router.post("/")
def create_application(app: ApplicationCreate):
    """Submit a new loan application and get an instant risk score."""
    if not app.consent_given:
        raise HTTPException(status_code=400, detail="Consent is required to process the application.")

    applicant_id = str(uuid.uuid4())
    data = app.model_dump()

    # Run fraud detection first
    fraud_result = detect_fraud(data)

    # Compute risk score
    score_result = compute_risk_score(data)

    # If high fraud risk, override decision
    if fraud_result["fraud_risk"] == "high":
        score_result["decision"] = "Rejected — Fraud Risk"
        score_result["decision_tier"] = "rejected"
        score_result["risk_score"] = max(score_result["risk_score"] - 40, 10)

    # Generate explanations
    decision_reason = generate_decision_reason(data, score_result, fraud_result)
    shap_contributions = compute_shap_contributions(score_result["feature_contributions"], score_result["risk_score"])
    nl_explanation = generate_nl_explanation(data, score_result, fraud_result)

    status = score_result["decision_tier"]

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO applications (
            applicant_id, name, email, phone, pan, aadhaar,
            dob, gender, city, loan_amount, loan_purpose,
            credit_score, monthly_income, employment_type,
            employer, years_experience, existing_loans, emi_burden,
            education_level, education_institute, linkedin_url, github_url,
            bill_payment_score, upi_transactions_monthly, digital_payment_consistency,
            certifications, risk_score, fraud_risk, fraud_score, status, decision, decision_reason,
            feature_contributions, consent_given, data_sharing_consent
        ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?
        )
    """, (
        applicant_id, app.name, app.email, app.phone, app.pan, app.aadhaar,
        app.dob, app.gender, app.city, app.loan_amount, app.loan_purpose,
        app.credit_score, app.monthly_income, app.employment_type,
        app.employer, app.years_experience, app.existing_loans, app.emi_burden,
        app.education_level, app.education_institute, app.linkedin_url, app.github_url,
        app.bill_payment_score, app.upi_transactions_monthly, app.digital_payment_consistency,
        app.certifications, score_result["risk_score"], fraud_result["fraud_risk"],
        fraud_result["fraud_score"], status, score_result["decision"], decision_reason,
        json.dumps(score_result["feature_contributions"]), 1, app.data_sharing_consent
    ))

    # Seed initial score history
    cur.execute("""
        INSERT INTO score_history (applicant_id, month, risk_score, event)
        VALUES (?, ?, ?, ?)
    """, (applicant_id, "Month 1", score_result["risk_score"], "Application submitted"))

    # Log fraud alerts if any
    if fraud_result["flags"]:
        for flag in fraud_result["flags"][:5]:
            cur.execute("""
                INSERT INTO fraud_alerts (applicant_id, alert_type, description, severity)
                VALUES (?, ?, ?, ?)
            """, (applicant_id, "automated_check", flag, fraud_result["fraud_risk"]))

    conn.commit()
    conn.close()

    # Calculate health & recommendations
    financial_health = calculate_financial_health(data)
    recommendations = generate_ai_recommendations(data, score_result["risk_score"])

    return {
        "applicant_id": applicant_id,
        "risk_score": score_result["risk_score"],
        "decision": score_result["decision"],
        "decision_tier": score_result["decision_tier"],
        "decision_reason": decision_reason,
        "fraud_risk": fraud_result["fraud_risk"],
        "fraud_score": fraud_result["fraud_score"],
        "fraud_flags": fraud_result["flags"],
        "feature_contributions": shap_contributions,
        "score_breakdown": score_result["score_breakdown"],
        "nl_explanation": nl_explanation,
        "financial_health": financial_health,
        "recommendations": recommendations,
        "status": status,
    }


@router.get("/{applicant_id}")
def get_application(applicant_id: str):
    """Get full application details."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM applications WHERE applicant_id = ?", (applicant_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found")

    app_data = dict(row)

    # Get score history
    cur.execute(
        "SELECT month, risk_score, event, created_at FROM score_history WHERE applicant_id = ? ORDER BY id",
        (applicant_id,)
    )
    score_history = [dict(r) for r in cur.fetchall()]

    # Get fraud alerts
    cur.execute(
        "SELECT alert_type, description, severity, created_at FROM fraud_alerts WHERE applicant_id = ? ORDER BY id",
        (applicant_id,)
    )
    fraud_alerts = [dict(r) for r in cur.fetchall()]

    conn.close()

    # Parse feature contributions
    try:
        fc = json.loads(app_data.get("feature_contributions", "{}"))
    except:
        fc = {}

    shap = compute_shap_contributions(fc, app_data.get("risk_score", 50))
    financial_health = calculate_financial_health(app_data)
    recommendations = generate_ai_recommendations(app_data, app_data.get("risk_score", 50))

    return {
        **app_data,
        "score_history": score_history,
        "fraud_alerts": fraud_alerts,
        "feature_contributions_detail": shap,
        "financial_health": financial_health,
        "recommendations": recommendations,
    }


@router.get("/lookup/by-email/{email}")
def get_application_by_email(email: str):
    """Lookup application by email address."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT applicant_id, name, status, risk_score, decision, created_at FROM applications WHERE email = ? ORDER BY created_at DESC LIMIT 1",
        (email,)
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="No application found for this email")
    return dict(row)


@router.post("/{applicant_id}/emi-payment")
def record_emi_payment(applicant_id: str, amount: float, status: str = "paid"):
    """Record an EMI payment and update dynamic risk score."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT risk_score, emi_burden FROM applications WHERE applicant_id = ?", (applicant_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found")

    old_score = row["risk_score"]

    if status == "paid":
        score_change = +3.5
        event = "EMI paid on time (+3.5 pts)"
    elif status == "late":
        score_change = -5.0
        event = "EMI payment late (-5.0 pts)"
    else:  # missed
        score_change = -12.0
        event = "EMI payment missed (-12.0 pts)"

    new_score = min(100.0, max(0.0, old_score + score_change))

    # Update applications
    cur.execute("UPDATE applications SET risk_score = ? WHERE applicant_id = ?", (new_score, applicant_id))

    # Count months
    cur.execute("SELECT COUNT(*) FROM score_history WHERE applicant_id = ?", (applicant_id,))
    month_num = cur.fetchone()[0] + 1

    cur.execute("""
        INSERT INTO score_history (applicant_id, month, risk_score, event)
        VALUES (?, ?, ?, ?)
    """, (applicant_id, f"Month {month_num}", new_score, event))

    cur.execute("""
        INSERT INTO emi_payments (applicant_id, amount, status)
        VALUES (?, ?, ?)
    """, (applicant_id, amount, status))

    conn.commit()
    conn.close()

    return {
        "applicant_id": applicant_id,
        "previous_score": old_score,
        "new_score": new_score,
        "score_change": score_change,
        "event": event,
    }
