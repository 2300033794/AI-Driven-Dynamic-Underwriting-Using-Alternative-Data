"""
Scoring route — real-time what-if scoring, financial health, and loan eligibility simulation
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from models.scoring_engine import compute_risk_score
from models.fraud_detector import detect_fraud
from models.explainer import compute_shap_contributions, generate_nl_explanation, generate_what_if_insights
from models.financial_health import calculate_financial_health
from models.loan_simulator import simulate_loan_approval
from models.recommendation_engine import generate_ai_recommendations

router = APIRouter(prefix="/api/score", tags=["scoring"])


class ScoreRequest(BaseModel):
    name: str = "Applicant"
    credit_score: int = Field(default=650, ge=300, le=900)
    monthly_income: float = 50000
    loan_amount: float = 300000
    emi_burden: float = 0
    employment_type: str = "Salaried"
    employer: str = ""
    years_experience: float = 2
    existing_loans: int = 0
    education_level: str = ""
    education_institute: str = ""
    linkedin_url: str = ""
    github_url: str = ""
    bill_payment_score: float = Field(default=60, ge=0, le=100)
    upi_transactions_monthly: int = 20
    digital_payment_consistency: float = Field(default=0.7, ge=0, le=1)
    certifications: int = 0
    email: str = "test@example.com"
    phone: str = "9999999999"
    pan: str = "XXXXX0000X"
    aadhaar: str = "0000-0000-0000"
    loan_purpose: str = "Personal"


@router.post("/preview")
def preview_score(req: ScoreRequest):
    """
    Live score preview — returns risk score without saving.
    Used by the What-If simulator.
    """
    data = req.model_dump()
    score_result = compute_risk_score(data)
    fraud_result = detect_fraud(data)
    shap = compute_shap_contributions(
        score_result["feature_contributions"],
        score_result["risk_score"]
    )
    what_if = generate_what_if_insights(data, score_result)

    return {
        "risk_score": score_result["risk_score"],
        "decision": score_result["decision"],
        "decision_tier": score_result["decision_tier"],
        "score_breakdown": score_result["score_breakdown"],
        "feature_contributions": shap,
        "fraud_risk": fraud_result["fraud_risk"],
        "what_if_insights": what_if,
    }


@router.post("/financial-health")
def financial_health_preview(req: ScoreRequest):
    """
    Computes 5-pillar Financial Health metrics (Savings, Stability, Discipline, Debt Ratio, Investment).
    """
    data = req.model_dump()
    health_result = calculate_financial_health(data)
    score_result = compute_risk_score(data)
    recs = generate_ai_recommendations(data, score_result["risk_score"])
    
    return {
        **health_result,
        "recommendations": recs
    }


@router.post("/simulate-eligibility")
def simulate_eligibility(req: ScoreRequest):
    """
    Simulates pre-application loan approval probability and scenario improvements.
    """
    data = req.model_dump()
    sim_result = simulate_loan_approval(data)
    health_result = calculate_financial_health(data)
    
    return {
        **sim_result,
        "financial_health_score": health_result["overall_health_score"]
    }
