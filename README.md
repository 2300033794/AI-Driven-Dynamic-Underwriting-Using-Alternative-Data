# CredAI — AI-Driven Dynamic Underwriting System

> **AI-powered loan approval using alternative data. Smarter, fairer, explainable.**

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** and **Node.js 18+** installed
- Windows PowerShell

---

### 1. Backend Setup

```powershell
cd backend
pip install -r requirements.txt
python main.py
```
Backend runs at **http://localhost:8000**
API docs at **http://localhost:8000/docs**

---

### 2. Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```
Frontend runs at **http://localhost:5173**

---

## 📁 Project Structure

```
CredAI/
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── requirements.txt
│   ├── db/
│   │   ├── database.py         # SQLite setup
│   │   └── seed_data.py        # 10 synthetic profiles
│   ├── models/
│   │   ├── scoring_engine.py   # AI risk scoring
│   │   ├── fraud_detector.py   # Fraud detection
│   │   └── explainer.py        # SHAP + NL explanations
│   └── routes/
│       ├── applications.py     # CRUD + EMI payments
│       ├── admin.py            # Admin + analytics
│       └── scoring.py          # What-if preview
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Landing.jsx     # Marketing homepage
        │   ├── Apply.jsx       # 6-step loan form
        │   ├── Dashboard.jsx   # Applicant dashboard
        │   └── Admin.jsx       # Admin panel
        └── components/
            ├── RiskScoreGauge.jsx
            ├── ExplainabilityChart.jsx
            ├── FraudBadge.jsx
            ├── ScoreTimeline.jsx
            └── WhatIfSimulator.jsx
```

---

## 🎯 Demo Scenarios

| Email | Scenario |
|-------|---------|
| `aditya.sharma@gmail.com` | High score (88/100), approved |
| `priya.mehta@outlook.com` | Excellent score (92/100), approved |
| `rahul.verma@yahoo.com` | Freelancer, alt-data boosts score |
| `v.mishra99@temp-mail.com` | **Fraud detected** — high risk |
| `kavya.nair@gmail.com` | Dynamic score demo |
| `deepak.rao@gmail.com` | Rejected — poor financials |

---

## 🤖 AI Scoring Model

**Traditional Data (40% weight):**
- CIBIL Credit Score
- Income vs Loan Adequacy
- Debt-to-Income Ratio
- Employment Stability

**Alternative Data (60% weight):**
- Bill Payment Consistency
- Digital (UPI) Payment Frequency
- LinkedIn Profile Strength
- GitHub Activity
- Education Quality & Institution
- Professional Certifications
- Employment Type Bonus

---

## 🚨 Fraud Detection Layers

1. Duplicate identity check (same PAN/Aadhaar, different phones)
2. Temporary/disposable email detection
3. Financial anomaly detection (EMI > 60% income)
4. Behavioral inconsistency checks
5. Loan purpose risk assessment

---

## 📊 Architecture

```
React Frontend (5173)
       ↕ REST API
FastAPI Backend (8000)
       ↕
  AI Scoring Engine (Python)
  Fraud Detector
  SHAP Explainer
       ↕
  SQLite Database
```

---

## 🔒 Privacy & Compliance

- **DPDP Act 2023** compliant data handling
- Explicit consent required before processing
- Only consent-provided data is used
- Explainable AI — no black boxes
- No discrimination on protected characteristics

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications/` | Submit loan application |
| GET | `/api/applications/{id}` | Get application details |
| GET | `/api/applications/lookup/by-email/{email}` | Lookup by email |
| POST | `/api/applications/{id}/emi-payment` | Record EMI payment |
| POST | `/api/score/preview` | What-if score preview |
| GET | `/api/admin/applications` | List all applications |
| GET | `/api/admin/analytics` | Dashboard analytics |
| PATCH | `/api/admin/applications/{id}/status` | Update status |
| GET | `/api/admin/fraud-alerts` | Get fraud alerts |
