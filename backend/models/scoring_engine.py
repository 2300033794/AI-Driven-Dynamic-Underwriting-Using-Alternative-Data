"""
AI Scoring Engine for CredAI
Combines traditional + alternative data signals to compute a 0-100 risk score.
Uses a weighted ensemble approach with interpretable feature contributions.
"""

import math
from typing import Dict, Any, Tuple


# ─────────────────────────────────────────────────────────────────────────────
# Feature weight configuration
# Traditional: 40%, Alternative: 60%
# ─────────────────────────────────────────────────────────────────────────────
FEATURE_WEIGHTS = {
    # Traditional signals (40% total)
    "credit_score": 0.15,
    "income_adequacy": 0.10,
    "debt_to_income": 0.10,
    "employment_stability": 0.05,

    # Alternative signals (60% total)
    "bill_payment_consistency": 0.15,
    "digital_payment_frequency": 0.08,
    "linkedin_profile_strength": 0.10,
    "github_activity": 0.07,
    "education_quality": 0.10,
    "certifications": 0.05,
    "employment_type_bonus": 0.05,
}


# ─────────────────────────────────────────────────────────────────────────────
# Individual feature scorers (all return 0.0 – 1.0)
# ─────────────────────────────────────────────────────────────────────────────

def score_credit(credit_score: int) -> float:
    """CIBIL score 300–900 → 0–1"""
    if credit_score >= 800:
        return 1.0
    elif credit_score >= 750:
        return 0.85
    elif credit_score >= 700:
        return 0.70
    elif credit_score >= 650:
        return 0.55
    elif credit_score >= 600:
        return 0.40
    elif credit_score >= 550:
        return 0.25
    else:
        return 0.10


def score_income_adequacy(monthly_income: float, loan_amount: float) -> float:
    """Income vs loan amount — EMI affordability proxy"""
    if loan_amount <= 0:
        return 0.5
    emi_estimate = loan_amount / 60  # 5-year loan
    ratio = emi_estimate / max(monthly_income, 1)
    if ratio < 0.15:
        return 1.0
    elif ratio < 0.25:
        return 0.85
    elif ratio < 0.35:
        return 0.65
    elif ratio < 0.50:
        return 0.40
    else:
        return 0.15


def score_debt_to_income(emi_burden: float, monthly_income: float) -> float:
    """Existing EMI burden as % of income"""
    if monthly_income <= 0:
        return 0.0
    ratio = emi_burden / monthly_income
    if ratio < 0.10:
        return 1.0
    elif ratio < 0.20:
        return 0.85
    elif ratio < 0.30:
        return 0.65
    elif ratio < 0.40:
        return 0.45
    elif ratio < 0.50:
        return 0.25
    else:
        return 0.05


def score_employment_stability(employment_type: str, years_experience: float, employer: str) -> float:
    """Employment type + tenure"""
    base = {
        "Government Salaried": 1.0,
        "Salaried": 0.85,
        "Entrepreneur": 0.70,
        "Self-Employed": 0.60,
        "Freelancer": 0.55,
        "Fresher": 0.40,
        "Unemployed": 0.05,
    }.get(employment_type, 0.50)

    # Tenure bonus
    if years_experience >= 10:
        tenure_mult = 1.15
    elif years_experience >= 5:
        tenure_mult = 1.05
    elif years_experience >= 2:
        tenure_mult = 0.95
    else:
        tenure_mult = 0.85

    # Employer quality bonus (simplified — top companies)
    top_employers = ["infosys", "tcs", "wipro", "hdfc", "icici", "google", "microsoft",
                     "amazon", "flipkart", "zoho", "isb", "iit", "iim"]
    employer_lower = employer.lower()
    employer_bonus = 1.10 if any(e in employer_lower for e in top_employers) else 1.0

    return min(1.0, base * tenure_mult * employer_bonus)


def score_bill_payment(bill_payment_score: float) -> float:
    """Bill payment score 0–100 → 0–1"""
    return min(1.0, bill_payment_score / 100.0)


def score_digital_payment(upi_transactions: int, consistency: float) -> float:
    """Digital engagement: transaction frequency + consistency"""
    freq_score = min(1.0, upi_transactions / 80.0)  # 80 txn/month = max
    return (freq_score * 0.4 + consistency * 0.6)


def score_linkedin(linkedin_url: str, employment_type: str, years_experience: float) -> float:
    """LinkedIn profile — inferred from URL presence + professional context"""
    if not linkedin_url or linkedin_url.strip() == "":
        return 0.20
    # If URL present, infer score from experience and employment
    base = 0.55
    if years_experience >= 8:
        base += 0.25
    elif years_experience >= 4:
        base += 0.15
    elif years_experience >= 2:
        base += 0.08
    # Entrepreneur/founder gets bonus
    if employment_type in ["Entrepreneur", "Salaried"]:
        base += 0.10
    return min(1.0, base)


def score_github(github_url: str, employment_type: str, certifications: int) -> float:
    """GitHub activity — inferred from presence + tech context"""
    if not github_url or github_url.strip() == "":
        return 0.15
    base = 0.55
    # Tech certifications indicate active learner
    base += min(0.20, certifications * 0.05)
    return min(1.0, base)


def score_education(education_level: str, institute: str) -> float:
    """Education level + institution prestige"""
    level_scores = {
        "PhD": 1.0,
        "M.Tech": 0.90,
        "MBA": 0.90,
        "M.Sc": 0.85,
        "M.Ed": 0.80,
        "B.Tech": 0.75,
        "B.Sc Computer Science": 0.72,
        "B.Sc": 0.70,
        "B.Com": 0.65,
        "B.A": 0.60,
        "Diploma": 0.50,
        "12th Pass": 0.35,
        "10th Pass": 0.20,
    }
    base = level_scores.get(education_level, 0.50)

    # Premium institute bonus
    premium_institutes = ["iit", "iim", "bits", "nit", "isb", "aiims", "iisc"]
    inst_lower = institute.lower()
    if any(p in inst_lower for p in premium_institutes):
        base = min(1.0, base + 0.15)

    return base


def score_certifications(count: int) -> float:
    """Number of professional certifications"""
    return min(1.0, count * 0.20)  # max at 5 certs


def score_employment_type_bonus(employment_type: str) -> float:
    """Additional bonus for stable employment types"""
    return {
        "Government Salaried": 1.0,
        "Salaried": 0.80,
        "Entrepreneur": 0.65,
        "Self-Employed": 0.55,
        "Freelancer": 0.50,
        "Fresher": 0.45,
        "Unemployed": 0.0,
    }.get(employment_type, 0.50)


# ─────────────────────────────────────────────────────────────────────────────
# Main scoring function
# ─────────────────────────────────────────────────────────────────────────────

def compute_risk_score(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compute composite risk score and feature contributions.

    Returns:
        {
            "risk_score": float (0-100),
            "decision": str,
            "feature_scores": dict,
            "feature_contributions": dict,  # for SHAP-style visualization
            "score_breakdown": dict
        }
    """

    # Extract fields with safe defaults
    credit_score = int(data.get("credit_score", 600))
    monthly_income = float(data.get("monthly_income", 0))
    loan_amount = float(data.get("loan_amount", 100000))
    emi_burden = float(data.get("emi_burden", 0))
    employment_type = data.get("employment_type", "Salaried")
    employer = data.get("employer", "")
    years_experience = float(data.get("years_experience", 0))
    existing_loans = int(data.get("existing_loans", 0))
    education_level = data.get("education_level", "")
    education_institute = data.get("education_institute", "")
    linkedin_url = data.get("linkedin_url", "")
    github_url = data.get("github_url", "")
    bill_payment_score = float(data.get("bill_payment_score", 50))
    upi_transactions = int(data.get("upi_transactions_monthly", 0))
    digital_consistency = float(data.get("digital_payment_consistency", 0.5))
    certifications = int(data.get("certifications", 0))

    # Compute individual feature scores (0–1)
    feature_scores = {
        "credit_score": score_credit(credit_score),
        "income_adequacy": score_income_adequacy(monthly_income, loan_amount),
        "debt_to_income": score_debt_to_income(emi_burden, monthly_income),
        "employment_stability": score_employment_stability(employment_type, years_experience, employer),
        "bill_payment_consistency": score_bill_payment(bill_payment_score),
        "digital_payment_frequency": score_digital_payment(upi_transactions, digital_consistency),
        "linkedin_profile_strength": score_linkedin(linkedin_url, employment_type, years_experience),
        "github_activity": score_github(github_url, employment_type, certifications),
        "education_quality": score_education(education_level, education_institute),
        "certifications": score_certifications(certifications),
        "employment_type_bonus": score_employment_type_bonus(employment_type),
    }

    # Weighted composite score
    raw_score = sum(
        feature_scores[feat] * weight
        for feat, weight in FEATURE_WEIGHTS.items()
    )
    risk_score = round(raw_score * 100, 1)

    # Feature contributions for SHAP-style chart (contribution to final score)
    total_weight = sum(FEATURE_WEIGHTS.values())
    feature_contributions = {
        feat: round(feature_scores[feat] * weight * 100, 2)
        for feat, weight in FEATURE_WEIGHTS.items()
    }

    # Decision logic
    if risk_score >= 75:
        decision = "Approved"
        decision_tier = "approved"
    elif risk_score >= 50:
        decision = "Manual Review"
        decision_tier = "review"
    else:
        decision = "Rejected"
        decision_tier = "rejected"

    # Score category breakdown
    traditional_score = round(
        (feature_scores["credit_score"] * 0.15 +
         feature_scores["income_adequacy"] * 0.10 +
         feature_scores["debt_to_income"] * 0.10 +
         feature_scores["employment_stability"] * 0.05) / 0.40 * 100, 1
    )
    alternative_score = round(
        (feature_scores["bill_payment_consistency"] * 0.15 +
         feature_scores["digital_payment_frequency"] * 0.08 +
         feature_scores["linkedin_profile_strength"] * 0.10 +
         feature_scores["github_activity"] * 0.07 +
         feature_scores["education_quality"] * 0.10 +
         feature_scores["certifications"] * 0.05 +
         feature_scores["employment_type_bonus"] * 0.05) / 0.60 * 100, 1
    )

    return {
        "risk_score": risk_score,
        "decision": decision,
        "decision_tier": decision_tier,
        "feature_scores": feature_scores,
        "feature_contributions": feature_contributions,
        "score_breakdown": {
            "traditional": traditional_score,
            "alternative": alternative_score,
            "overall": risk_score
        }
    }


def get_decision_tier(risk_score: float) -> str:
    """Translate a numeric risk score into the standardized decision tier."""
    if risk_score >= 75:
        return "approved"
    if risk_score >= 50:
        return "review"
    return "rejected"


def generate_decision_reason(data: Dict, result: Dict, fraud_result: Dict) -> str:
    """Generate a human-readable explanation for the decision."""
    score = result["risk_score"]
    decision = result["decision"]
    contrib = result["feature_contributions"]
    fs = result["feature_scores"]

    if fraud_result["fraud_risk"] == "high":
        return (
            f"Application flagged for high fraud risk. "
            f"Detected: {', '.join(fraud_result.get('flags', ['suspicious activity']))}. "
            f"Loan application rejected pending investigation."
        )

    # Sort contributions by absolute value
    top_positive = sorted(
        [(k, v) for k, v in contrib.items() if v > 0],
        key=lambda x: x[1], reverse=True
    )[:3]
    top_negative = sorted(
        [(k, v) for k, v in contrib.items() if v < 0],
        key=lambda x: x[1]
    )[:2]

    reasons = []

    # Positive factors
    feat_names = {
        "credit_score": "strong credit score",
        "income_adequacy": "sufficient income relative to loan amount",
        "debt_to_income": "low existing debt burden",
        "employment_stability": "stable employment history",
        "bill_payment_consistency": "consistent bill payment behavior",
        "digital_payment_frequency": "active digital payment patterns",
        "linkedin_profile_strength": "strong professional LinkedIn profile",
        "github_activity": "active GitHub presence",
        "education_quality": "quality educational background",
        "certifications": "professional certifications",
        "employment_type_bonus": "reliable employment type",
    }

    if decision == "Approved":
        pos_list = ", ".join(feat_names.get(k, k) for k, v in top_positive)
        reasons.append(f"Approved based on: {pos_list}.")
        if top_negative:
            neg_list = " and ".join(feat_names.get(k, k) for k, v in top_negative)
            reasons.append(f"Minor concerns: {neg_list} were considered but outweighed by positive signals.")
    elif decision == "Manual Review":
        reasons.append(f"Score of {score}/100 falls in the manual review range (50–74).")
        pos_list = ", ".join(feat_names.get(k, k) for k, v in top_positive)
        neg_list = ", ".join(feat_names.get(k, k) for k, v in top_negative) if top_negative else "none"
        reasons.append(f"Positive signals: {pos_list}. Areas of concern: {neg_list}.")
        reasons.append("A loan officer will review this application within 2 business days.")
    else:
        reasons.append(f"Score of {score}/100 falls below the approval threshold.")
        if top_negative:
            neg_list = ", ".join(feat_names.get(k, k) for k, v in top_negative)
            reasons.append(f"Key risk factors: {neg_list}.")
        reasons.append("Applicant may reapply after improving credit score and reducing existing debt.")

    return " ".join(reasons)
