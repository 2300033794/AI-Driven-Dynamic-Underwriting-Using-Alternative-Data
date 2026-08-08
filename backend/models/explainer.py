"""
Explainability Engine for CredAI
Provides SHAP-style feature importance and natural language explanations.
"""

from typing import Dict, Any, List
from models.scoring_engine import compute_risk_score


FEATURE_DISPLAY_NAMES = {
    "credit_score": "Credit Score (CIBIL)",
    "income_adequacy": "Income vs Loan Amount",
    "debt_to_income": "Debt-to-Income Ratio",
    "employment_stability": "Employment Stability",
    "bill_payment_consistency": "Bill Payment Consistency",
    "digital_payment_frequency": "Digital Payment Activity",
    "linkedin_profile_strength": "LinkedIn Profile Strength",
    "github_activity": "GitHub Activity",
    "education_quality": "Education Quality",
    "certifications": "Professional Certifications",
    "employment_type_bonus": "Employment Type",
}

FEATURE_DESCRIPTIONS = {
    "credit_score": "Your CIBIL credit score reflecting past credit behavior.",
    "income_adequacy": "Whether your income is sufficient to service the loan EMI.",
    "debt_to_income": "Proportion of your income already committed to existing loan repayments.",
    "employment_stability": "Stability of your current employment — type, tenure, and employer reputation.",
    "bill_payment_consistency": "How consistently you pay utility bills, mobile bills, and other recurring payments.",
    "digital_payment_frequency": "How actively and consistently you use digital payment methods (UPI, etc.).",
    "linkedin_profile_strength": "Strength of your professional LinkedIn profile — connections, endorsements, and activity.",
    "github_activity": "Your GitHub contribution activity, indicating technical skill and engagement.",
    "education_quality": "Your educational qualification and the prestige of your institution.",
    "certifications": "Number of professional certifications demonstrating continuous skill development.",
    "employment_type_bonus": "Risk adjustment based on your employment type (government, salaried, freelance, etc.).",
}

FEATURE_IMPROVEMENT_TIPS = {
    "credit_score": "Pay all EMIs and credit card dues on time. Avoid multiple credit inquiries. Reduce credit utilization below 30%.",
    "income_adequacy": "Consider requesting a smaller loan amount or provide proof of additional income sources.",
    "debt_to_income": "Close or prepay existing loans before applying for a new one.",
    "employment_stability": "Maintain current employment for at least 2 more years. Consider getting a government or stable corporate job.",
    "bill_payment_consistency": "Set up auto-pay for all utility bills and mobile recharges. Ensure no missed payments.",
    "digital_payment_frequency": "Use UPI for daily transactions consistently. This builds a positive digital payment footprint.",
    "linkedin_profile_strength": "Complete your LinkedIn profile, get endorsements from colleagues, and post professional updates.",
    "github_activity": "Make regular contributions to GitHub projects. Even personal projects count.",
    "education_quality": "Complete professional courses from recognized platforms (Coursera, edX, etc.).",
    "certifications": "Obtain relevant professional certifications (AWS, PMP, CFA, etc.) to demonstrate expertise.",
    "employment_type_bonus": "Moving to a stable salaried position significantly improves this factor.",
}


def compute_shap_contributions(feature_contributions: Dict[str, float], risk_score: float) -> List[Dict]:
    """
    Compute SHAP-style feature contributions for visualization.
    Returns sorted list from most positive to most negative impact.
    """
    # Baseline score (average loan outcome)
    baseline = 50.0
    deviation = risk_score - baseline

    contributions = []
    for feat, contrib in feature_contributions.items():
        # Normalize contribution relative to total score deviation
        normalized_impact = contrib - (sum(feature_contributions.values()) / len(feature_contributions))

        contributions.append({
            "feature": feat,
            "display_name": FEATURE_DISPLAY_NAMES.get(feat, feat),
            "description": FEATURE_DESCRIPTIONS.get(feat, ""),
            "contribution": round(contrib, 2),
            "impact": "positive" if contrib >= 0 else "negative",
            "improvement_tip": FEATURE_IMPROVEMENT_TIPS.get(feat, ""),
        })

    # Sort by absolute contribution (largest first)
    contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
    return contributions


def generate_nl_explanation(
    data: Dict[str, Any],
    score_result: Dict[str, Any],
    fraud_result: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate a structured natural language explanation of the lending decision.
    Rule-based approach (works without external API key).
    """
    score = score_result["risk_score"]
    decision = score_result["decision"]
    contrib = score_result["feature_contributions"]
    breakdown = score_result["score_breakdown"]
    fraud_risk = fraud_result["fraud_risk"]
    fraud_flags = fraud_result.get("flags", [])

    # Top positive and negative factors
    sorted_contribs = sorted(contrib.items(), key=lambda x: x[1], reverse=True)
    top_3_positive = [k for k, v in sorted_contribs if v > 5][:3]
    bottom_2_negative = [k for k, v in sorted_contribs if v < 3][-2:]

    # Main explanation
    name = data.get("name", "The applicant")

    sections = {}

    # Summary
    if decision == "Approved":
        sections["summary"] = (
            f"{name}'s loan application has been **approved** with a risk score of **{score}/100**. "
            f"This score reflects strong financial responsibility and a solid professional profile."
        )
    elif decision == "Manual Review":
        sections["summary"] = (
            f"{name}'s loan application is under **manual review** with a risk score of **{score}/100**. "
            f"The application shows mixed signals — positive alternative data partially offsets traditional credit concerns."
        )
    else:
        sections["summary"] = (
            f"{name}'s loan application has been **rejected** with a risk score of **{score}/100**. "
            f"The risk indicators currently outweigh the positive signals."
        )

    # Positive factors
    pos_display = [FEATURE_DISPLAY_NAMES.get(f, f) for f in top_3_positive]
    if pos_display:
        sections["positive_factors"] = (
            f"Key strengths: {', '.join(pos_display)}."
        )
    else:
        sections["positive_factors"] = "Limited positive signals detected across both traditional and alternative data."

    # Areas of concern
    neg_display = [FEATURE_DISPLAY_NAMES.get(f, f) for f in bottom_2_negative]
    if neg_display:
        sections["concerns"] = f"Areas of concern: {', '.join(neg_display)}."
    else:
        sections["concerns"] = "No significant risk factors were identified."

    # Score breakdown narrative
    sections["breakdown_narrative"] = (
        f"Traditional data signals (credit score, income, debt) contributed a sub-score of "
        f"**{breakdown['traditional']}/100**, while alternative data signals (payment behavior, "
        f"professional presence, education) contributed **{breakdown['alternative']}/100**."
    )

    # Fraud assessment
    if fraud_risk == "high":
        sections["fraud_assessment"] = (
            f"⚠️ **High fraud risk detected.** {len(fraud_flags)} suspicious indicator(s) found: "
            f"{'; '.join(fraud_flags[:3])}. This application requires immediate investigation."
        )
    elif fraud_risk == "medium":
        sections["fraud_assessment"] = (
            f"⚡ **Medium fraud risk.** {len(fraud_flags)} anomaly(ies) flagged for review. "
            f"Enhanced due diligence is recommended."
        )
    else:
        sections["fraud_assessment"] = "✅ **No fraud indicators detected.** Identity and financial data appear consistent."

    # Next steps
    if decision == "Approved":
        sections["next_steps"] = [
            "Loan offer letter will be sent within 24 hours.",
            "Complete eSign of loan agreement digitally.",
            "Funds disbursed to your account within 2-3 business days.",
        ]
    elif decision == "Manual Review":
        sections["next_steps"] = [
            "A loan officer will review your application within 2 business days.",
            "You may be contacted for additional documentation.",
            "Improve your alternative data scores to increase approval chances.",
        ]
    else:
        improvement_tips = [
            FEATURE_IMPROVEMENT_TIPS.get(f, "") for f in bottom_2_negative if f in FEATURE_IMPROVEMENT_TIPS
        ]
        sections["next_steps"] = [
            "Work on the flagged risk areas before reapplying.",
            *improvement_tips[:2],
            "You may reapply after 6 months with improved financials.",
        ]

    # What-if insights
    sections["what_if"] = generate_what_if_insights(data, score_result)

    return sections


def generate_what_if_insights(data: Dict, score_result: Dict) -> List[Dict]:
    """Generate 'what if' scenario insights showing how score would change."""
    insights = []
    score = score_result["risk_score"]
    fs = score_result["feature_scores"]

    # What if credit score improved?
    cs = int(data.get("credit_score", 600))
    if cs < 750:
        improved_data = {**data, "credit_score": min(800, cs + 80)}
        improved = compute_risk_score(improved_data)
        delta = round(improved["risk_score"] - score, 1)
        if delta > 0:
            insights.append({
                "scenario": f"Increase credit score by 80 points (to {min(800, cs+80)})",
                "score_change": f"+{delta}",
                "new_score": improved["risk_score"],
                "feasibility": "6–12 months of consistent payments"
            })

    # What if existing EMI was reduced?
    emi = float(data.get("emi_burden", 0))
    if emi > 0:
        improved_data = {**data, "emi_burden": max(0, emi * 0.5)}
        improved = compute_risk_score(improved_data)
        delta = round(improved["risk_score"] - score, 1)
        if delta > 0:
            insights.append({
                "scenario": "Close half of existing loans",
                "score_change": f"+{delta}",
                "new_score": improved["risk_score"],
                "feasibility": "Prepay one existing loan"
            })

    # What if LinkedIn was added?
    if not data.get("linkedin_url"):
        improved_data = {**data, "linkedin_url": "https://linkedin.com/in/applicant"}
        improved = compute_risk_score(improved_data)
        delta = round(improved["risk_score"] - score, 1)
        if delta > 0:
            insights.append({
                "scenario": "Add LinkedIn profile",
                "score_change": f"+{delta}",
                "new_score": improved["risk_score"],
                "feasibility": "Immediate — create/link your profile"
            })

    # What if bill payment improved?
    bp = float(data.get("bill_payment_score", 50))
    if bp < 90:
        improved_data = {**data, "bill_payment_score": 90, "digital_payment_consistency": 0.92}
        improved = compute_risk_score(improved_data)
        delta = round(improved["risk_score"] - score, 1)
        if delta > 0:
            insights.append({
                "scenario": "Improve bill payment consistency to 90%",
                "score_change": f"+{delta}",
                "new_score": improved["risk_score"],
                "feasibility": "3–6 months of on-time payments"
            })

    return insights[:4]  # Return top 4 insights
