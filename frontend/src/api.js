const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8001';

export const api = {
  async submitApplication(data) {
    const res = await fetch(`${API_BASE}/api/applications/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Submission failed');
    }
    return res.json();
  },

  async getApplication(id) {
    const res = await fetch(`${API_BASE}/api/applications/${id}`);
    if (!res.ok) throw new Error('Application not found');
    return res.json();
  },

  async lookupByEmail(email) {
    const res = await fetch(`${API_BASE}/api/applications/lookup/by-email/${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error('No application found');
    return res.json();
  },

  async previewScore(data) {
    const res = await fetch(`${API_BASE}/api/score/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Score preview failed');
    return res.json();
  },

  async getFinancialHealth(data) {
    const res = await fetch(`${API_BASE}/api/score/financial-health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Financial health calculation failed');
    return res.json();
  },

  async simulateEligibility(data) {
    const res = await fetch(`${API_BASE}/api/score/simulate-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Eligibility simulation failed');
    return res.json();
  },

  async sendAdvisorChat(message, applicantData = null) {
    const res = await fetch(`${API_BASE}/api/advisor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, applicant_data: applicantData }),
    });
    if (!res.ok) throw new Error('Advisor response failed');
    return res.json();
  },

  async getAdminApplications(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/api/admin/applications?${qs}`);
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  },

  async getAnalytics() {
    const res = await fetch(`${API_BASE}/api/admin/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async updateStatus(id, status) {
    const res = await fetch(`${API_BASE}/api/admin/applications/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Status update failed');
    return res.json();
  },

  async recordEmiPayment(id, amount, status) {
    const res = await fetch(
      `${API_BASE}/api/applications/${id}/emi-payment?amount=${amount}&status=${status}`,
      { method: 'POST' }
    );
    if (!res.ok) throw new Error('EMI payment failed');
    return res.json();
  },

  async getFraudAlerts(severity) {
    const url = severity
      ? `${API_BASE}/api/admin/fraud-alerts?severity=${severity}`
      : `${API_BASE}/api/admin/fraud-alerts`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch fraud alerts');
    return res.json();
  },
};
