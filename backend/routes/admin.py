"""
Admin routes — dashboard analytics, application management, fraud alerts
"""

from fastapi import APIRouter, HTTPException
from db.database import get_connection
import json

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/applications")
def list_all_applications(
    status: str = None,
    fraud_risk: str = None,
    limit: int = 50,
    offset: int = 0
):
    """List all applications with optional filters."""
    conn = get_connection()
    cur = conn.cursor()

    query = """
        SELECT applicant_id, name, email, city, loan_amount, loan_purpose,
               credit_score, monthly_income, employment_type, risk_score,
               fraud_risk, fraud_score, status, decision, created_at
        FROM applications
        WHERE 1=1
    """
    params = []

    if status:
        query += " AND status = ?"
        params.append(status)
    if fraud_risk:
        query += " AND fraud_risk = ?"
        params.append(fraud_risk)

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cur.execute(query, params)
    apps = [dict(r) for r in cur.fetchall()]

    # Total count
    count_query = "SELECT COUNT(*) as total FROM applications WHERE 1=1"
    count_params = []
    if status:
        count_query += " AND status = ?"
        count_params.append(status)
    if fraud_risk:
        count_query += " AND fraud_risk = ?"
        count_params.append(fraud_risk)
    cur.execute(count_query, count_params)
    total = cur.fetchone()["total"]

    conn.close()

    return {"applications": apps, "total": total, "limit": limit, "offset": offset}


@router.get("/analytics")
def get_analytics():
    """Dashboard analytics for admin."""
    conn = get_connection()
    cur = conn.cursor()

    # Status distribution
    cur.execute("""
        SELECT status, COUNT(*) as count FROM applications GROUP BY status
    """)
    status_dist = {row["status"]: row["count"] for row in cur.fetchall()}

    # Fraud risk distribution
    cur.execute("""
        SELECT fraud_risk, COUNT(*) as count FROM applications GROUP BY fraud_risk
    """)
    fraud_dist = {row["fraud_risk"]: row["count"] for row in cur.fetchall()}

    # Average scores
    cur.execute("""
        SELECT
            AVG(risk_score) as avg_risk_score,
            AVG(credit_score) as avg_credit_score,
            AVG(monthly_income) as avg_income,
            AVG(loan_amount) as avg_loan_amount,
            COUNT(*) as total_applications
        FROM applications
    """)
    averages = dict(cur.fetchone())

    # Score distribution buckets
    cur.execute("""
        SELECT
            CASE
                WHEN risk_score >= 75 THEN 'High (75-100)'
                WHEN risk_score >= 50 THEN 'Medium (50-74)'
                ELSE 'Low (0-49)'
            END as bucket,
            COUNT(*) as count
        FROM applications
        GROUP BY bucket
    """)
    score_buckets = {row["bucket"]: row["count"] for row in cur.fetchall()}

    # Employment type breakdown
    cur.execute("""
        SELECT employment_type, COUNT(*) as count, AVG(risk_score) as avg_score
        FROM applications
        GROUP BY employment_type
        ORDER BY count DESC
    """)
    employment_breakdown = [dict(r) for r in cur.fetchall()]

    # Recent fraud alerts
    cur.execute("""
        SELECT fa.*, a.name, a.email
        FROM fraud_alerts fa
        JOIN applications a ON fa.applicant_id = a.applicant_id
        ORDER BY fa.created_at DESC
        LIMIT 10
    """)
    recent_fraud_alerts = [dict(r) for r in cur.fetchall()]

    # Approval rate
    total = averages["total_applications"] or 1
    approval_rate = round((status_dist.get("approved", 0) / total) * 100, 1)
    rejection_rate = round((status_dist.get("rejected", 0) / total) * 100, 1)
    review_rate = round((status_dist.get("review", 0) / total) * 100, 1)
    fraud_rate = round((fraud_dist.get("high", 0) / total) * 100, 1)

    conn.close()

    return {
        "summary": {
            "total_applications": total,
            "approval_rate": approval_rate,
            "rejection_rate": rejection_rate,
            "review_rate": review_rate,
            "fraud_rate": fraud_rate,
            "avg_risk_score": round(averages["avg_risk_score"] or 0, 1),
            "avg_credit_score": round(averages["avg_credit_score"] or 0, 0),
            "avg_loan_amount": round(averages["avg_loan_amount"] or 0, 0),
        },
        "status_distribution": status_dist,
        "fraud_distribution": fraud_dist,
        "score_buckets": score_buckets,
        "employment_breakdown": employment_breakdown,
        "recent_fraud_alerts": recent_fraud_alerts,
    }


@router.patch("/applications/{applicant_id}/status")
def update_application_status(applicant_id: str, status: str, notes: str = ""):
    """Admin override — approve, reject, or flag an application."""
    valid_statuses = ["approved", "rejected", "review", "flagged"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {valid_statuses}")

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT applicant_id FROM applications WHERE applicant_id = ?", (applicant_id,))
    if not cur.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found")

    decision_map = {
        "approved": "Approved (Admin Override)",
        "rejected": "Rejected (Admin Override)",
        "review": "Under Review",
        "flagged": "Flagged for Investigation",
    }

    cur.execute("""
        UPDATE applications
        SET status = ?, decision = ?
        WHERE applicant_id = ?
    """, (status, decision_map[status], applicant_id))
    conn.commit()
    conn.close()

    return {"message": f"Application {applicant_id} status updated to '{status}'", "notes": notes}


@router.get("/fraud-alerts")
def get_fraud_alerts(severity: str = None):
    """Get all fraud alerts, optionally filtered by severity."""
    conn = get_connection()
    cur = conn.cursor()

    query = """
        SELECT fa.*, a.name, a.email, a.phone, a.pan, a.loan_amount
        FROM fraud_alerts fa
        JOIN applications a ON fa.applicant_id = a.applicant_id
        WHERE 1=1
    """
    params = []
    if severity:
        query += " AND fa.severity = ?"
        params.append(severity)
    query += " ORDER BY fa.created_at DESC"

    cur.execute(query, params)
    alerts = [dict(r) for r in cur.fetchall()]
    conn.close()

    return {"alerts": alerts, "total": len(alerts)}
