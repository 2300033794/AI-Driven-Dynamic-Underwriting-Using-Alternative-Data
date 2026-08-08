"""
Seed synthetic applicant data for demo purposes.
25 diverse profiles covering: students, freelancers, salaried, business owners.
"""

import json
import uuid
from datetime import datetime, timedelta
import random
from db.database import get_connection

SEED_PROFILES = [
    # --- HIGH SCORE / APPROVED ---
    {
        "name": "Aditya Sharma",
        "email": "aditya.sharma@gmail.com",
        "phone": "9876543210",
        "pan": "ABCPS1234A",
        "aadhaar": "1234-5678-9012",
        "dob": "1992-05-14",
        "gender": "Male",
        "city": "Bangalore",
        "loan_amount": 500000,
        "loan_purpose": "Home Renovation",
        "credit_score": 740,
        "monthly_income": 95000,
        "employment_type": "Salaried",
        "employer": "Infosys Ltd.",
        "years_experience": 6.5,
        "existing_loans": 1,
        "emi_burden": 12000,
        "education_level": "B.Tech",
        "education_institute": "IIT Bombay",
        "linkedin_url": "https://linkedin.com/in/adityasharma",
        "github_url": "https://github.com/adityasharma",
        "bill_payment_score": 95,
        "upi_transactions_monthly": 45,
        "digital_payment_consistency": 0.96,
        "certifications": 3,
        "risk_score": 88,
        "fraud_risk": "low",
        "fraud_score": 0.04,
        "status": "approved",
        "decision": "Approved",
        "decision_reason": "Strong credit history, stable employment at a top-tier company, consistent digital payment behavior, and excellent professional profile.",
        "feature_contributions": json.dumps({
            "credit_score": 18.5,
            "employment_stability": 16.2,
            "bill_payment_consistency": 14.8,
            "income_adequacy": 13.5,
            "linkedin_profile_strength": 11.0,
            "education_quality": 8.5,
            "github_activity": 6.5,
            "debt_to_income": -3.0,
            "certifications": 3.0
        })
    },
    {
        "name": "Priya Mehta",
        "email": "priya.mehta@outlook.com",
        "phone": "9845123456",
        "pan": "BCDPM5678B",
        "aadhaar": "2345-6789-0123",
        "dob": "1995-11-22",
        "gender": "Female",
        "city": "Mumbai",
        "loan_amount": 300000,
        "loan_purpose": "Education",
        "credit_score": 780,
        "monthly_income": 72000,
        "employment_type": "Salaried",
        "employer": "HDFC Bank",
        "years_experience": 4.0,
        "existing_loans": 0,
        "emi_burden": 0,
        "education_level": "MBA",
        "education_institute": "IIM Ahmedabad",
        "linkedin_url": "https://linkedin.com/in/priyamehta",
        "github_url": "",
        "bill_payment_score": 98,
        "upi_transactions_monthly": 60,
        "digital_payment_consistency": 0.99,
        "certifications": 2,
        "risk_score": 92,
        "fraud_risk": "low",
        "fraud_score": 0.02,
        "status": "approved",
        "decision": "Approved",
        "decision_reason": "Excellent credit score, premium education background, zero existing liabilities, and impeccable payment history.",
        "feature_contributions": json.dumps({
            "credit_score": 22.0,
            "bill_payment_consistency": 18.0,
            "income_adequacy": 15.0,
            "debt_to_income": 12.0,
            "education_quality": 10.0,
            "linkedin_profile_strength": 9.0,
            "employment_stability": 8.0,
            "certifications": 4.0
        })
    },
    # --- MEDIUM SCORE / MANUAL REVIEW but APPROVED via alternative data ---
    {
        "name": "Rahul Verma",
        "email": "rahul.verma@yahoo.com",
        "phone": "9712345678",
        "pan": "CDEPV2345C",
        "aadhaar": "3456-7890-1234",
        "dob": "1998-03-08",
        "gender": "Male",
        "city": "Hyderabad",
        "loan_amount": 200000,
        "loan_purpose": "Startup Capital",
        "credit_score": 620,
        "monthly_income": 55000,
        "employment_type": "Freelancer",
        "employer": "Self-Employed",
        "years_experience": 3.0,
        "existing_loans": 1,
        "emi_burden": 8000,
        "education_level": "B.Tech",
        "education_institute": "NIT Warangal",
        "linkedin_url": "https://linkedin.com/in/rahulverma-dev",
        "github_url": "https://github.com/rahulverma",
        "bill_payment_score": 88,
        "upi_transactions_monthly": 72,
        "digital_payment_consistency": 0.91,
        "certifications": 4,
        "risk_score": 74,
        "fraud_risk": "low",
        "fraud_score": 0.08,
        "status": "approved",
        "decision": "Approved",
        "decision_reason": "Despite an average credit score, strong GitHub activity (150+ contributions), multiple tech certifications, and consistent UPI payment patterns indicate financial responsibility.",
        "feature_contributions": json.dumps({
            "github_activity": 14.0,
            "bill_payment_consistency": 13.5,
            "digital_payment_frequency": 12.0,
            "certifications": 8.0,
            "education_quality": 7.5,
            "employment_stability": 6.0,
            "income_adequacy": 5.5,
            "credit_score": -4.5,
            "debt_to_income": -5.0
        })
    },
    {
        "name": "Sneha Krishnan",
        "email": "sneha.k@protonmail.com",
        "phone": "9632145870",
        "pan": "DEFSK3456D",
        "aadhaar": "4567-8901-2345",
        "dob": "1997-07-15",
        "gender": "Female",
        "city": "Chennai",
        "loan_amount": 150000,
        "loan_purpose": "Vehicle Purchase",
        "credit_score": 645,
        "monthly_income": 48000,
        "employment_type": "Salaried",
        "employer": "Zoho Corporation",
        "years_experience": 2.5,
        "existing_loans": 0,
        "emi_burden": 0,
        "education_level": "B.Sc Computer Science",
        "education_institute": "Anna University",
        "linkedin_url": "https://linkedin.com/in/snehakrishnan",
        "github_url": "https://github.com/snehak",
        "bill_payment_score": 85,
        "upi_transactions_monthly": 38,
        "digital_payment_consistency": 0.88,
        "certifications": 2,
        "risk_score": 70,
        "fraud_risk": "low",
        "fraud_score": 0.06,
        "status": "review",
        "decision": "Manual Review",
        "decision_reason": "Average credit score offset by zero existing loans, stable employment at Zoho, and good digital payment behavior. Manual review recommended for verification.",
        "feature_contributions": json.dumps({
            "debt_to_income": 10.0,
            "employment_stability": 9.5,
            "bill_payment_consistency": 9.0,
            "digital_payment_frequency": 8.0,
            "income_adequacy": 7.5,
            "credit_score": -3.0,
            "github_activity": 5.0,
            "certifications": 4.0
        })
    },
    # --- FRESH GRADUATE / NO CREDIT HISTORY ---
    {
        "name": "Ankit Patel",
        "email": "ankit.patel2024@gmail.com",
        "phone": "9523456781",
        "pan": "EFGAP4567E",
        "aadhaar": "5678-9012-3456",
        "dob": "2001-01-20",
        "gender": "Male",
        "city": "Ahmedabad",
        "loan_amount": 100000,
        "loan_purpose": "Education Gadgets",
        "credit_score": 580,
        "monthly_income": 28000,
        "employment_type": "Fresher",
        "employer": "TCS (Campus Hire)",
        "years_experience": 0.5,
        "existing_loans": 0,
        "emi_burden": 0,
        "education_level": "B.Tech",
        "education_institute": "BITS Pilani",
        "linkedin_url": "https://linkedin.com/in/ankitpatel-bits",
        "github_url": "https://github.com/ankitpatel2024",
        "bill_payment_score": 78,
        "upi_transactions_monthly": 25,
        "digital_payment_consistency": 0.82,
        "certifications": 3,
        "risk_score": 68,
        "fraud_risk": "low",
        "fraud_score": 0.07,
        "status": "review",
        "decision": "Manual Review",
        "decision_reason": "Fresh graduate with limited credit history but strong educational pedigree (BITS Pilani), active GitHub profile, and campus placement at TCS indicate strong future earning potential.",
        "feature_contributions": json.dumps({
            "education_quality": 15.0,
            "github_activity": 12.0,
            "certifications": 8.0,
            "linkedin_profile_strength": 7.0,
            "employment_stability": 5.0,
            "bill_payment_consistency": 6.0,
            "credit_score": -8.0,
            "income_adequacy": -3.0
        })
    },
    # --- FRAUD DETECTED ---
    {
        "name": "Vikram Mishra",
        "email": "v.mishra99@temp-mail.com",
        "phone": "9111222333",
        "pan": "FGHVM5678F",
        "aadhaar": "6789-0123-4567",
        "dob": "1990-06-10",
        "gender": "Male",
        "city": "Delhi",
        "loan_amount": 900000,
        "loan_purpose": "Business Expansion",
        "credit_score": 700,
        "monthly_income": 85000,
        "employment_type": "Self-Employed",
        "employer": "XYZ Enterprises",
        "years_experience": 8.0,
        "existing_loans": 3,
        "emi_burden": 45000,
        "education_level": "B.Com",
        "education_institute": "Delhi University",
        "linkedin_url": "",
        "github_url": "",
        "bill_payment_score": 45,
        "upi_transactions_monthly": 5,
        "digital_payment_consistency": 0.35,
        "certifications": 0,
        "risk_score": 28,
        "fraud_risk": "high",
        "fraud_score": 0.87,
        "status": "rejected",
        "decision": "Rejected — Fraud Risk",
        "decision_reason": "Multiple loan applications detected with same PAN but different phone numbers. Unusual transaction pattern. Temporary email domain flagged. EMI burden exceeds 50% of income.",
        "feature_contributions": json.dumps({
            "fraud_multiple_applications": -25.0,
            "debt_to_income": -18.0,
            "bill_payment_consistency": -15.0,
            "digital_payment_frequency": -12.0,
            "temp_email_flag": -10.0,
            "linkedin_profile_strength": -8.0,
            "credit_score": 5.0,
            "income_adequacy": 3.0
        })
    },
    # --- REJECTED (LOW SCORE) ---
    {
        "name": "Deepak Rao",
        "email": "deepak.rao@gmail.com",
        "phone": "9321654987",
        "pan": "GHIDR6789G",
        "aadhaar": "7890-1234-5678",
        "dob": "1985-09-30",
        "gender": "Male",
        "city": "Pune",
        "loan_amount": 700000,
        "loan_purpose": "Debt Consolidation",
        "credit_score": 520,
        "monthly_income": 35000,
        "employment_type": "Self-Employed",
        "employer": "Freelance",
        "years_experience": 2.0,
        "existing_loans": 4,
        "emi_burden": 28000,
        "education_level": "12th Pass",
        "education_institute": "State Board",
        "linkedin_url": "",
        "github_url": "",
        "bill_payment_score": 40,
        "upi_transactions_monthly": 8,
        "digital_payment_consistency": 0.42,
        "certifications": 0,
        "risk_score": 32,
        "fraud_risk": "medium",
        "fraud_score": 0.42,
        "status": "rejected",
        "decision": "Rejected",
        "decision_reason": "Low credit score, high debt-to-income ratio (80%), poor bill payment history, and insufficient alternative data signals to offset traditional risk indicators.",
        "feature_contributions": json.dumps({
            "credit_score": -20.0,
            "debt_to_income": -18.0,
            "bill_payment_consistency": -15.0,
            "income_adequacy": -12.0,
            "employment_stability": -8.0,
            "digital_payment_frequency": -5.0,
            "education_quality": -2.0
        })
    },
    # --- DYNAMIC SCORE DEMO ---
    {
        "name": "Kavya Nair",
        "email": "kavya.nair@gmail.com",
        "phone": "9456789012",
        "pan": "HIJKN7890H",
        "aadhaar": "8901-2345-6789",
        "dob": "1994-04-18",
        "gender": "Female",
        "city": "Kochi",
        "loan_amount": 400000,
        "loan_purpose": "Home Loan",
        "credit_score": 665,
        "monthly_income": 62000,
        "employment_type": "Salaried",
        "employer": "Wipro Technologies",
        "years_experience": 5.0,
        "existing_loans": 1,
        "emi_burden": 10000,
        "education_level": "M.Tech",
        "education_institute": "Cochin University",
        "linkedin_url": "https://linkedin.com/in/kavyanair-tech",
        "github_url": "https://github.com/kavyanair",
        "bill_payment_score": 82,
        "upi_transactions_monthly": 40,
        "digital_payment_consistency": 0.87,
        "certifications": 2,
        "risk_score": 76,
        "fraud_risk": "low",
        "fraud_score": 0.05,
        "status": "approved",
        "decision": "Approved",
        "decision_reason": "Stable employment, strong educational background, consistent payment behavior, and active professional profile demonstrate creditworthiness beyond credit score.",
        "feature_contributions": json.dumps({
            "employment_stability": 14.0,
            "education_quality": 12.0,
            "bill_payment_consistency": 11.5,
            "income_adequacy": 10.0,
            "linkedin_profile_strength": 9.0,
            "github_activity": 7.5,
            "credit_score": 4.0,
            "debt_to_income": -3.0,
            "certifications": 5.0
        })
    },
    # --- MORE PROFILES ---
    {
        "name": "Rohan Gupta",
        "email": "rohan.gupta@startupfounder.in",
        "phone": "9567890123",
        "pan": "IJKLG8901I",
        "aadhaar": "9012-3456-7890",
        "dob": "1991-12-05",
        "gender": "Male",
        "city": "Delhi",
        "loan_amount": 1000000,
        "loan_purpose": "Business Expansion",
        "credit_score": 630,
        "monthly_income": 120000,
        "employment_type": "Entrepreneur",
        "employer": "FinTech Startup (Founder)",
        "years_experience": 7.0,
        "existing_loans": 2,
        "emi_burden": 20000,
        "education_level": "MBA",
        "education_institute": "ISB Hyderabad",
        "linkedin_url": "https://linkedin.com/in/rohangupta-ceo",
        "github_url": "https://github.com/rohangupta",
        "bill_payment_score": 79,
        "upi_transactions_monthly": 85,
        "digital_payment_consistency": 0.84,
        "certifications": 5,
        "risk_score": 77,
        "fraud_risk": "low",
        "fraud_score": 0.09,
        "status": "approved",
        "decision": "Approved",
        "decision_reason": "High income, premium MBA background, extensive professional experience, and strong LinkedIn network compensate for moderate credit score.",
        "feature_contributions": json.dumps({
            "income_adequacy": 18.0,
            "education_quality": 13.0,
            "linkedin_profile_strength": 12.0,
            "employment_stability": 10.0,
            "digital_payment_frequency": 9.0,
            "certifications": 7.0,
            "bill_payment_consistency": 6.0,
            "credit_score": -3.0,
            "debt_to_income": -5.0
        })
    },
    {
        "name": "Meera Joshi",
        "email": "meera.joshi@teacher.edu.in",
        "phone": "9678901234",
        "pan": "JKLMJ9012J",
        "aadhaar": "0123-4567-8901",
        "dob": "1988-08-25",
        "gender": "Female",
        "city": "Jaipur",
        "loan_amount": 250000,
        "loan_purpose": "Medical Emergency",
        "credit_score": 710,
        "monthly_income": 45000,
        "employment_type": "Government Salaried",
        "employer": "Rajasthan Education Dept.",
        "years_experience": 10.0,
        "existing_loans": 1,
        "emi_burden": 6000,
        "education_level": "M.Ed",
        "education_institute": "University of Rajasthan",
        "linkedin_url": "https://linkedin.com/in/meerajoshi-edu",
        "github_url": "",
        "bill_payment_score": 93,
        "upi_transactions_monthly": 30,
        "digital_payment_consistency": 0.95,
        "certifications": 1,
        "risk_score": 85,
        "fraud_risk": "low",
        "fraud_score": 0.03,
        "status": "approved",
        "decision": "Approved",
        "decision_reason": "Government employment provides exceptional job security, combined with strong payment history and low debt burden.",
        "feature_contributions": json.dumps({
            "employment_stability": 20.0,
            "bill_payment_consistency": 16.0,
            "credit_score": 14.0,
            "debt_to_income": 12.0,
            "income_adequacy": 10.0,
            "education_quality": 8.0,
            "digital_payment_frequency": 5.0
        })
    },
]


def get_score_history_data(applicant_id: str, final_score: float, status: str):
    """Generate 6-month score history for demo purposes."""
    history = []
    base_score = max(40, final_score - 20)
    events = [
        ("Month 1", "Application submitted", 0),
        ("Month 2", "EMI paid on time", 5),
        ("Month 3", "Credit limit utilized optimally", 3),
        ("Month 4", "Additional certification completed", 4),
        ("Month 5", "Bill payments consistent", 3),
        ("Month 6", "Current score", 5),
    ]
    if status == "rejected":
        events = [
            ("Month 1", "Application submitted", 0),
            ("Month 2", "Missed EMI payment", -8),
            ("Month 3", "Multiple credit inquiries", -5),
            ("Month 4", "Utility payment delayed", -3),
            ("Month 5", "Loan default warning", -10),
            ("Month 6", "Current score", -5),
        ]

    score = base_score
    for month, event, delta in events:
        score = min(100, max(10, score + delta))
        history.append({
            "applicant_id": applicant_id,
            "month": month,
            "risk_score": round(score, 1),
            "event": event
        })
    return history


def seed_database():
    """Insert seed data into the database."""
    conn = get_connection()
    cur = conn.cursor()

    # Check if already seeded
    cur.execute("SELECT COUNT(*) FROM applications")
    count = cur.fetchone()[0]
    if count > 0:
        print(f"[CredAI] Database already has {count} applications. Skipping seed.")
        conn.close()
        return

    import uuid
    from datetime import datetime

    for profile in SEED_PROFILES:
        applicant_id = str(uuid.uuid4())
        profile["applicant_id"] = applicant_id

        cur.execute("""
            INSERT INTO applications (
                applicant_id, name, email, phone, pan, aadhaar, dob, gender, city,
                loan_amount, loan_purpose, credit_score, monthly_income, employment_type,
                employer, years_experience, existing_loans, emi_burden, education_level,
                education_institute, linkedin_url, github_url, bill_payment_score,
                upi_transactions_monthly, digital_payment_consistency, certifications,
                risk_score, fraud_risk, fraud_score, status, decision, decision_reason,
                feature_contributions, consent_given
            ) VALUES (
                :applicant_id, :name, :email, :phone, :pan, :aadhaar, :dob, :gender, :city,
                :loan_amount, :loan_purpose, :credit_score, :monthly_income, :employment_type,
                :employer, :years_experience, :existing_loans, :emi_burden, :education_level,
                :education_institute, :linkedin_url, :github_url, :bill_payment_score,
                :upi_transactions_monthly, :digital_payment_consistency, :certifications,
                :risk_score, :fraud_risk, :fraud_score, :status, :decision, :decision_reason,
                :feature_contributions, 1
            )
        """, profile)

        # Generate score history
        history = get_score_history_data(applicant_id, profile["risk_score"], profile["status"])
        for h in history:
            cur.execute("""
                INSERT INTO score_history (applicant_id, month, risk_score, event)
                VALUES (:applicant_id, :month, :risk_score, :event)
            """, h)

    conn.commit()
    conn.close()
    print(f"[CredAI] Seeded {len(SEED_PROFILES)} applicant profiles with score histories")


if __name__ == "__main__":
    from database import init_db
    init_db()
    seed_database()
