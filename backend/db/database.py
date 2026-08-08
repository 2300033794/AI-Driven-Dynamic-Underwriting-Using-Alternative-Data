import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "credai.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    # Applications table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            applicant_id TEXT UNIQUE NOT NULL,
            name TEXT,
            email TEXT,
            phone TEXT,
            pan TEXT,
            aadhaar TEXT,
            dob TEXT,
            gender TEXT,
            city TEXT,
            loan_amount REAL,
            loan_purpose TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending',
            -- Traditional data
            credit_score INTEGER,
            monthly_income REAL,
            employment_type TEXT,
            employer TEXT,
            years_experience REAL,
            existing_loans INTEGER,
            emi_burden REAL,
            -- Alternative data
            education_level TEXT,
            education_institute TEXT,
            linkedin_url TEXT,
            github_url TEXT,
            bill_payment_score REAL,
            upi_transactions_monthly INTEGER,
            digital_payment_consistency REAL,
            certifications INTEGER,
            -- Scores
            risk_score REAL,
            fraud_risk TEXT,
            fraud_score REAL,
            decision TEXT,
            decision_reason TEXT,
            feature_contributions TEXT,
            -- Meta
            consent_given INTEGER DEFAULT 1,
            data_sharing_consent TEXT
        )
    """)

    # Score history table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS score_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            applicant_id TEXT NOT NULL,
            month TEXT,
            risk_score REAL,
            event TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # EMI payments table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS emi_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            applicant_id TEXT NOT NULL,
            payment_date TEXT,
            amount REAL,
            status TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Fraud alerts table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS fraud_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            applicant_id TEXT NOT NULL,
            alert_type TEXT,
            description TEXT,
            severity TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()
    print("[CredAI] Database initialized")
