"""
Loan Eligibility Simulator Engine
Simulates pre-application loan approval probabilities and scenario suggestions.
"""
from models.scoring_engine import compute_risk_score, get_decision_tier

def simulate_loan_approval(data: dict) -> dict:
    loan_amount = float(data.get("loan_amount", 500000))
    monthly_income = float(data.get("monthly_income", 50000))
    credit_score = float(data.get("credit_score", 650))
    emi_burden = float(data.get("emi_burden", 0))

    # Base score evaluation
    score_result = compute_risk_score(data)
    base_score = score_result["risk_score"]

    # Debt-to-Income impact on approval probability
    max_supported_loan = (monthly_income - emi_burden) * 36
    loan_to_income_ratio = loan_amount / max(monthly_income * 12, 1)

    # Calculate Approval Probability % (0 - 99%)
    prob_base = (base_score * 0.7) + min(30, max(0, (1 - (loan_to_income_ratio / 4)) * 30))
    if credit_score < 550:
        prob_base -= 20
    if emi_burden / max(monthly_income, 1) > 0.5:
        prob_base -= 15

    approval_chance = round(min(98, max(5, prob_base)))

    # Scenario 1: Increase income by 10%
    inc_data = {**data, "monthly_income": monthly_income * 1.10}
    inc_score = compute_risk_score(inc_data)["risk_score"]
    inc_prob = round(min(98, max(5, approval_chance + (inc_score - base_score) * 1.4 + 5)))

    # Scenario 2: Reduce EMI burden / debt utilization by 30%
    red_debt_data = {**data, "emi_burden": emi_burden * 0.70}
    red_debt_score = compute_risk_score(red_debt_data)["risk_score"]
    red_debt_prob = round(min(98, max(5, approval_chance + (red_debt_score - base_score) * 1.3 + 6)))

    # Scenario 3: Maintain punctual EMI payments for 3 months
    punc_data = {
        **data,
        "bill_payment_score": min(100, float(data.get("bill_payment_score", 70)) + 15),
        "digital_payment_consistency": min(1.0, float(data.get("digital_payment_consistency", 0.75)) + 0.15)
    }
    punc_score = compute_risk_score(punc_data)["risk_score"]
    punc_prob = round(min(98, max(5, approval_chance + (punc_score - base_score) * 1.5 + 7)))

    # Scenario 4: Add professional certification / alternative signals
    cert_data = {**data, "certifications": int(data.get("certifications", 0)) + 2, "linkedin_url": "https://linkedin.com/in/verified"}
    cert_score = compute_risk_score(cert_data)["risk_score"]
    cert_prob = round(min(98, max(5, approval_chance + (cert_score - base_score) * 1.2 + 4)))

    scenarios = [
        {
            "id": "increase_salary",
            "action": "Increase monthly income by 10%",
            "impact": f"+{inc_prob - approval_chance} Chance",
            "new_chance": inc_prob,
            "description": "Increases debt service capacity and lowers debt-to-income ratio."
        },
        {
            "id": "reduce_debt",
            "action": "Reduce active EMI burden by 30%",
            "impact": f"+{red_debt_prob - approval_chance} Chance",
            "new_chance": red_debt_prob,
            "description": "Frees up monthly cash flow and improves debt ratio score."
        },
        {
            "id": "maintain_emi",
            "action": "Maintain on-time bill payments for 3 months",
            "impact": f"+{punc_prob - approval_chance} Chance",
            "new_chance": punc_prob,
            "description": "Demonstrates consistent financial discipline and payment stability."
        },
        {
            "id": "add_credentials",
            "action": "Attach verified LinkedIn profile & certifications",
            "impact": f"+{cert_prob - approval_chance} Chance",
            "new_chance": cert_prob,
            "description": "Boosts alternative data signals and employment stability index."
        }
    ]

    return {
        "loan_amount": loan_amount,
        "current_risk_score": round(base_score),
        "approval_chance": approval_chance,
        "decision_tier": get_decision_tier(base_score),
        "max_recommended_loan": round(max_supported_loan),
        "scenarios": scenarios
    }
