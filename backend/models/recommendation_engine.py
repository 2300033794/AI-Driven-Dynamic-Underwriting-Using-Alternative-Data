"""
AI Recommendation Engine
Generates actionable financial recommendations with estimated risk score point improvements.
"""

def generate_ai_recommendations(data: dict, risk_score: float) -> list:
    recommendations = []

    credit_score = float(data.get("credit_score", 650))
    monthly_income = float(data.get("monthly_income", 50000))
    emi_burden = float(data.get("emi_burden", 0))
    bill_score = float(data.get("bill_payment_score", 70))
    upi_count = float(data.get("upi_transactions_monthly", 25))
    has_linkedin = bool(data.get("linkedin_url"))
    has_github = bool(data.get("github_url"))
    certifications = int(data.get("certifications", 0))

    dti = emi_burden / max(monthly_income, 1)

    # Rule 1: High Debt-to-Income
    if dti > 0.40:
        recommendations.append({
            "id": "rec_reduce_dti",
            "action": "Reduce active credit card usage & EMI burden",
            "timeframe": "1 - 2 months",
            "expected_score_gain": 12,
            "status": "recommended",
            "category": "Debt Management",
            "detail": f"Your current EMI burden takes up {round(dti * 100)}% of income. Paying down 20% of debt will increase your score by up to 12 points."
        })

    # Rule 2: Bill Payment Discipline
    if bill_score < 80:
        recommendations.append({
            "id": "rec_maintain_emi",
            "action": "Maintain 100% on-time utility & mobile bill payments",
            "timeframe": "3 consecutive months",
            "expected_score_gain": 9,
            "status": "recommended",
            "category": "Discipline",
            "detail": "On-time bill payment history proves payment discipline and strengthens your alternative data score."
        })

    # Rule 3: Missing LinkedIn / Professional Verification
    if not has_linkedin:
        recommendations.append({
            "id": "rec_linkedin",
            "action": "Upload & link verified LinkedIn profile",
            "timeframe": "Immediate",
            "expected_score_gain": 8,
            "status": "recommended",
            "category": "Alternative Data",
            "detail": "Adding a professional LinkedIn profile verifies employment history and career stability."
        })

    # Rule 4: Technical Skills / GitHub
    if not has_github and data.get("employment_type") in ["Freelancer", "Fresher", "Salaried"]:
        recommendations.append({
            "id": "rec_github",
            "action": "Link active GitHub / Portfolio activity",
            "timeframe": "Immediate",
            "expected_score_gain": 6,
            "status": "recommended",
            "category": "Skill Equity",
            "detail": "Public code commits and repositories provide objective proof of technical skill equity."
        })

    # Rule 5: Low Certifications
    if certifications < 2:
        recommendations.append({
            "id": "rec_certifications",
            "action": "Add industry certifications (AWS, PMP, CFA, etc.)",
            "timeframe": "Within 60 days",
            "expected_score_gain": 5,
            "status": "recommended",
            "category": "Education",
            "detail": "Professional certifications increase long-term earning potential and job security."
        })

    # Default recommendation if score is high
    if len(recommendations) == 0 or risk_score >= 80:
        recommendations.insert(0, {
            "id": "rec_keep_it_up",
            "action": "Maintain current disciplined financial habits",
            "timeframe": "Ongoing",
            "expected_score_gain": 4,
            "status": "completed",
            "category": "Maintenance",
            "detail": "Your financial indicators are strong. Continue timely EMI payments to unlock premier interest rate tiers."
        })

    return recommendations
