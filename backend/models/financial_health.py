"""
Financial Health Model
Calculates multi-dimensional financial health metrics:
- Overall Financial Health Score (0-100)
- Savings Score (0-100)
- Income Stability (0-100)
- Expense Discipline (0-100)
- Debt Ratio Score (0-100)
- Investment Score (0-100)
"""

def calculate_financial_health(data: dict) -> dict:
    monthly_income = float(data.get("monthly_income", 50000))
    credit_score = float(data.get("credit_score", 650))
    emi_burden = float(data.get("emi_burden", 0))
    bill_payment_score = float(data.get("bill_payment_score", 70))
    upi_transactions = float(data.get("upi_transactions_monthly", 25))
    consistency = float(data.get("digital_payment_consistency", 0.75))
    certifications = float(data.get("certifications", 1))
    experience = float(data.get("years_experience", 2))

    # 1. Income Stability (0-100)
    stability_base = min(100, (experience * 10) + (40 if data.get("employment_type") in ["Salaried", "Government Salaried"] else 25))
    income_stability = round(min(100, max(20, stability_base + (10 if data.get("employer") else 0))))

    # 2. Debt Ratio Score (0-100) - Higher is better (lower debt ratio)
    dti_ratio = emi_burden / max(monthly_income, 1)
    if dti_ratio <= 0.15:
        debt_ratio_score = 95
    elif dti_ratio <= 0.30:
        debt_ratio_score = 82
    elif dti_ratio <= 0.45:
        debt_ratio_score = 65
    elif dti_ratio <= 0.60:
        debt_ratio_score = 45
    else:
        debt_ratio_score = 25

    # 3. Expense Discipline (0-100)
    expense_discipline = round(min(100, max(15, (bill_payment_score * 0.5) + (consistency * 40) + min(10, upi_transactions * 0.2))))

    # 4. Savings Score (0-100)
    disposable_income = max(0, monthly_income - emi_burden)
    savings_ratio = disposable_income / max(monthly_income, 1)
    savings_score = round(min(100, max(20, (savings_ratio * 90) + (10 if credit_score > 700 else 0))))

    # 5. Investment Score (0-100)
    investment_score = round(min(100, max(10, (certifications * 12) + (savings_score * 0.4) + (20 if credit_score > 720 else 5))))

    # Overall Financial Health Composite
    overall_health = round(
        (income_stability * 0.25) +
        (debt_ratio_score * 0.25) +
        (expense_discipline * 0.20) +
        (savings_score * 0.18) +
        (investment_score * 0.12)
    )

    return {
        "overall_health_score": overall_health,
        "pillars": {
            "savings_score": savings_score,
            "income_stability": income_stability,
            "expense_discipline": expense_discipline,
            "debt_ratio_score": debt_ratio_score,
            "investment_score": investment_score,
        },
        "health_tier": "Excellent" if overall_health >= 80 else "Good" if overall_health >= 65 else "Average" if overall_health >= 50 else "Needs Attention"
    }
