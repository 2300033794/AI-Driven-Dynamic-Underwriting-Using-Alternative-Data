"""
AI Loan Advisor Chatbot Engine
Processes applicant queries ("Why rejected?", "How to improve?", "Which loan suits me?")
"""
import re

def process_advisor_chat(message: str, applicant_data: dict = None) -> dict:
    msg = message.lower().strip()

    name = applicant_data.get("name", "Applicant") if applicant_data else "Applicant"
    score = float(applicant_data.get("risk_score", 68)) if applicant_data else 68.0
    status = applicant_data.get("status", "review") if applicant_data else "review"
    cibil = float(applicant_data.get("credit_score", 650)) if applicant_data else 650
    income = float(applicant_data.get("monthly_income", 50000)) if applicant_data else 50000
    emi = float(applicant_data.get("emi_burden", 0)) if applicant_data else 0
    loan_amt = float(applicant_data.get("loan_amount", 300000)) if applicant_data else 300000
    purpose = applicant_data.get("loan_purpose", "Personal") if applicant_data else "Personal"

    # Quick Suggestion Chips for the UI
    suggestions = [
        "Why was my application flagged or rejected?",
        "How can I improve my score quickly?",
        "Which loan amount or product suits my profile best?",
        "Can I apply for another loan right now?"
    ]

    # Intent 1: Why rejected / flagged?
    if any(k in msg for k in ["why", "reject", "flag", "declin", "deni", "reason"]):
        if status == "approved":
            reply = f"Great news, {name}! Your application is **Approved** with an AI Risk Score of **{score}/100**. You were approved because of your solid repayment discipline, stable employment, and strong alternative data signals."
        elif status == "rejected":
            reasons = []
            if emi / max(income, 1) > 0.45:
                reasons.append("Your existing EMI burden consumes over 45% of your monthly income.")
            if cibil < 600:
                reasons.append("Your traditional CIBIL credit score is below our minimum risk threshold of 600.")
            if not applicant_data.get("linkedin_url") and not applicant_data.get("github_url"):
                reasons.append("No alternative data profiles (LinkedIn/GitHub) were provided to verify professional stability.")
            
            reasons_str = "\n".join([f"• {r}" for r in (reasons or ["High overall financial risk indicators relative to requested loan amount."])])
            reply = f"Hello {name}, your application was flagged due to the following risk factors:\n\n{reasons_str}\n\n💡 **Tip:** Reducing active debt or adding professional certifications can boost your score into approval range."
        else:
            reply = f"Hello {name}, your application is currently **Under Review** (Score: **{score}/100**). Our risk team is cross-verifying your income documents and alternative data signals. To speed up approval, try linking your LinkedIn profile or uploading bank statements."

    # Intent 2: How can I improve / score boost?
    elif any(k in msg for k in ["improve", "boost", "increase", "better", "raise", "tips"]):
        reply = (
            f"Here are the top actions to boost your score by **+10 to +18 points**:\n\n"
            f"1. 💳 **Reduce Debt Utilization:** Lower your monthly EMI burden (currently ₹{emi:,.0f}) below 30% of income.\n"
            f"2. 📱 **Consistent UPI & Bill Payments:** Maintain 100% on-time utility bill payments for 3 consecutive months.\n"
            f"3. 🌐 **Alternative Verification:** Link your active LinkedIn or GitHub profiles (+8 to +12 pts).\n"
            f"4. 🎓 **Professional Skills:** Upload proof of industry certifications or degrees."
        )

    # Intent 3: Which loan is suitable?
    elif any(k in msg for k in ["suitable", "product", "which loan", "eligibl", "recommend", "how much"]):
        max_safe_emi = income * 0.40
        max_safe_loan = max(50000, (max_safe_emi - emi) * 36)
        
        reply = (
            f"Based on your monthly income of **₹{income:,.0f}** and current risk score of **{score}/100**:\n\n"
            f"• **Recommended Max Loan:** **₹{max_safe_loan:,.0f}**\n"
            f"• **Recommended EMI Cap:** **₹{max_safe_emi:,.0f}/month**\n"
            f"• **Best Loan Types:** Personal Loan, Education Loan, or Home Renovation Loan with a 36-48 month tenure for minimal interest burden."
        )

    # Intent 4: Can I get another loan?
    elif any(k in msg for k in ["another", "second", "multiple", "reapply", "again"]):
        if score >= 75:
            reply = f"Yes, {name}! With your strong AI Risk Score of **{score}/100**, you are eligible for pre-approved top-up loans up to **₹{(income * 6):,.0f}** without additional documentation."
        else:
            reply = f"We recommend waiting 60 days before applying for another loan. During this period, pay down active EMIs and maintain consistent bill payments to increase your approval odds to >90%."

    # Default Conversational Response
    else:
        reply = (
            f"Hello {name}! I am your **CredAI Smart Loan Advisor** 🤖.\n\n"
            f"Your current AI Risk Score is **{score}/100** ({status.upper()}).\n"
            f"I can help you understand why an application was decisioned, how to improve your score, or calculate your maximum safe loan limit. What would you like to know?"
        )

    return {
        "reply": reply,
        "suggestions": suggestions,
        "applicant_name": name,
        "current_score": score
    }
