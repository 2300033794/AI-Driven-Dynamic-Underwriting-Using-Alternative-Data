"""
Fraud Detection Engine for CredAI
Multi-layer fraud detection combining rule-based checks and anomaly signals.
"""

import re
from typing import Dict, Any, List
from db.database import get_connection

# Known temp/disposable email domains
TEMP_EMAIL_DOMAINS = [
    "temp-mail.com", "mailinator.com", "guerrillamail.com", "10minutemail.com",
    "throwaway.email", "yopmail.com", "trashmail.com", "fakeinbox.com",
    "dispostable.com", "sharklasers.com", "guerrillamailblock.com"
]

# Suspicious patterns
SUSPICIOUS_LOAN_PURPOSES = ["crypto", "gambling", "speculation", "betting"]


def check_duplicate_identity(pan: str, aadhaar: str, phone: str, email: str, exclude_id: str = None) -> Dict:
    """Check for duplicate applications with same PAN/Aadhaar but different phones."""
    conn = get_connection()
    cur = conn.cursor()
    flags = []
    severity = "low"

    # Check same PAN, different phone
    query = "SELECT applicant_id, phone, email FROM applications WHERE pan = ?"
    if exclude_id:
        query += f" AND applicant_id != '{exclude_id}'"
    cur.execute(query, (pan,))
    pan_matches = cur.fetchall()

    if pan_matches:
        for match in pan_matches:
            if match["phone"] != phone:
                flags.append(f"Same PAN detected with different phone number ({match['phone'][-4:]}****)")
                severity = "high"
            if match["email"] != email:
                flags.append(f"Same PAN detected with different email address")
                severity = "high"

    # Check same Aadhaar, different identity
    cur.execute("SELECT applicant_id, pan FROM applications WHERE aadhaar = ?", (aadhaar,))
    aadhaar_matches = cur.fetchall()
    for match in aadhaar_matches:
        if match["pan"] != pan:
            flags.append("Aadhaar linked to multiple PAN numbers — identity conflict")
            severity = "high"

    # Check same phone, multiple PANs
    cur.execute("SELECT COUNT(DISTINCT pan) as cnt FROM applications WHERE phone = ?", (phone,))
    phone_pan_count = cur.fetchone()["cnt"]
    if phone_pan_count > 1:
        flags.append(f"Phone number linked to {phone_pan_count} different PAN numbers")
        severity = "high"

    conn.close()
    return {"flags": flags, "severity": severity}


def check_email_fraud(email: str) -> Dict:
    """Detect suspicious email addresses."""
    flags = []
    severity = "low"

    domain = email.split("@")[-1].lower() if "@" in email else ""

    if domain in TEMP_EMAIL_DOMAINS:
        flags.append(f"Temporary/disposable email domain detected ({domain})")
        severity = "high"

    # Check for random-looking local parts
    local = email.split("@")[0] if "@" in email else email
    if re.match(r'^[a-z0-9]{15,}$', local.lower()):
        flags.append("Suspicious email pattern — possible bot-generated address")
        severity = "medium" if severity == "low" else severity

    return {"flags": flags, "severity": severity}


def check_financial_anomalies(data: Dict[str, Any]) -> Dict:
    """Detect financial red flags."""
    flags = []
    severity = "low"

    monthly_income = float(data.get("monthly_income", 0))
    emi_burden = float(data.get("emi_burden", 0))
    loan_amount = float(data.get("loan_amount", 0))
    existing_loans = int(data.get("existing_loans", 0))
    bill_payment_score = float(data.get("bill_payment_score", 50))
    upi_transactions = int(data.get("upi_transactions_monthly", 0))
    digital_consistency = float(data.get("digital_payment_consistency", 0.5))
    credit_score = int(data.get("credit_score", 600))
    loan_purpose = data.get("loan_purpose", "").lower()

    # EMI burden > 60% of income
    if monthly_income > 0 and emi_burden / monthly_income > 0.60:
        flags.append(f"EMI burden ({int(emi_burden/monthly_income*100)}%) exceeds 60% of income — debt trap risk")
        severity = "high"

    # Too many existing loans
    if existing_loans >= 4:
        flags.append(f"High number of existing loans ({existing_loans}) — possible debt stacking")
        severity = "medium" if severity == "low" else severity

    # Loan amount >> 12x annual income
    annual_income = monthly_income * 12
    if annual_income > 0 and loan_amount > annual_income * 12:
        flags.append("Loan amount exceeds 12x annual income — unusually high request")
        severity = "medium" if severity == "low" else severity

    # Low digital activity + high loan request
    if upi_transactions < 5 and loan_amount > 500000:
        flags.append("Very low digital transaction activity relative to loan size")
        severity = "medium" if severity == "low" else severity

    # Very low bill payment consistency
    if digital_consistency < 0.30:
        flags.append("Extremely low digital payment consistency score")
        severity = "medium" if severity == "low" else severity

    # Suspicious loan purpose
    if any(sp in loan_purpose for sp in SUSPICIOUS_LOAN_PURPOSES):
        flags.append(f"Suspicious loan purpose flagged: '{data.get('loan_purpose')}'")
        severity = "high"

    # Inconsistency: high income but very low credit score
    if monthly_income > 80000 and credit_score < 550:
        flags.append("Inconsistency: high income claim but very low credit score")
        severity = "medium" if severity == "low" else severity

    return {"flags": flags, "severity": severity}


def check_behavioral_anomalies(data: Dict[str, Any]) -> Dict:
    """Detect behavioral red flags."""
    flags = []
    severity = "low"

    employment_type = data.get("employment_type", "")
    years_experience = float(data.get("years_experience", 0))
    linkedin_url = data.get("linkedin_url", "")
    github_url = data.get("github_url", "")
    monthly_income = float(data.get("monthly_income", 0))

    # Fresher claiming 10+ years experience
    if employment_type == "Fresher" and years_experience > 2:
        flags.append("Inconsistency: 'Fresher' employment type with high years of experience")
        severity = "medium"

    # Tech professional with no digital presence
    tech_types = ["salaried", "freelancer", "entrepreneur"]
    if employment_type.lower() in tech_types and not linkedin_url and not github_url:
        flags.append("Tech-sector professional with no LinkedIn or GitHub presence — data gap")

    # Very high income claim with no online presence
    if monthly_income > 150000 and not linkedin_url:
        flags.append("Very high income claimed with no verifiable professional profile")
        severity = "medium" if severity == "low" else severity

    return {"flags": flags, "severity": severity}


def compute_fraud_score(all_flags: List[str], severity: str) -> float:
    """Convert flags and severity to a 0–1 fraud probability score."""
    base_scores = {"low": 0.05, "medium": 0.40, "high": 0.80}
    base = base_scores.get(severity, 0.05)
    # Each additional flag adds a small increment
    flag_increment = min(0.15, len(all_flags) * 0.03)
    return min(0.99, base + flag_increment)


def detect_fraud(data: Dict[str, Any], exclude_id: str = None) -> Dict[str, Any]:
    """
    Full fraud detection pipeline.
    Returns fraud risk assessment with flags and score.
    """
    all_flags = []
    max_severity = "low"

    severity_rank = {"low": 0, "medium": 1, "high": 2}

    # Run all checks
    checks = [
        check_duplicate_identity(
            pan=data.get("pan", ""),
            aadhaar=data.get("aadhaar", ""),
            phone=data.get("phone", ""),
            email=data.get("email", ""),
            exclude_id=exclude_id
        ),
        check_email_fraud(data.get("email", "")),
        check_financial_anomalies(data),
        check_behavioral_anomalies(data),
    ]

    for check in checks:
        all_flags.extend(check["flags"])
        if severity_rank.get(check["severity"], 0) > severity_rank.get(max_severity, 0):
            max_severity = check["severity"]

    fraud_score = compute_fraud_score(all_flags, max_severity)

    # Final risk label
    if max_severity == "high" or fraud_score >= 0.70:
        fraud_risk = "high"
    elif max_severity == "medium" or fraud_score >= 0.35:
        fraud_risk = "medium"
    else:
        fraud_risk = "low"

    return {
        "fraud_risk": fraud_risk,
        "fraud_score": round(fraud_score, 3),
        "flags": all_flags,
        "flag_count": len(all_flags),
        "details": {
            "identity_check": check_duplicate_identity(
                data.get("pan", ""), data.get("aadhaar", ""),
                data.get("phone", ""), data.get("email", ""), exclude_id
            ),
            "email_check": check_email_fraud(data.get("email", "")),
            "financial_check": check_financial_anomalies(data),
            "behavioral_check": check_behavioral_anomalies(data),
        }
    }
