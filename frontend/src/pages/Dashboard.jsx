import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import RiskScoreGauge from '../components/RiskScoreGauge';
import ExplainabilityChart from '../components/ExplainabilityChart';
import FraudBadge from '../components/FraudBadge';
import ScoreTimeline from '../components/ScoreTimeline';
import WhatIfSimulator from '../components/WhatIfSimulator';
import ComplianceModal from '../components/ComplianceModal';
import FinancialHealthRadar from '../components/FinancialHealthRadar';
import RecommendationCards from '../components/RecommendationCards';
import ChatbotWidget from '../components/ChatbotWidget';
import {
  Search, ChevronRight, TrendingUp, Info,
  CheckCircle2, AlertCircle, Clock, Loader2,
  Download, Share2, Scale, RefreshCw, FileText,
  Copy, Check, HeartPulse, Sparkles
} from 'lucide-react';

function DecisionBanner({ decision, tier, reason }) {
  const configs = {
    approved: { bg: 'var(--gradient-approved)', border: 'rgba(16,185,129,0.4)', icon: CheckCircle2, color: '#10b981', label: 'Loan Approved' },
    review: { bg: 'var(--gradient-review)', border: 'rgba(245,158,11,0.4)', icon: Clock, color: '#f59e0b', label: 'Under Manual Review' },
    rejected: { bg: 'var(--gradient-rejected)', border: 'rgba(239,68,68,0.4)', icon: AlertCircle, color: '#ef4444', label: 'Application Rejected' },
  };
  const cfg = configs[tier] || configs.review;
  const Icon = cfg.icon;

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 'var(--radius-xl)',
      padding: '22px 26px',
      display: 'flex',
      gap: 18,
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: 50, height: 50, borderRadius: '50%',
        background: `${cfg.color}25`, border: `1px solid ${cfg.color}50`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={26} color={cfg.color} />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: '1.15rem', color: cfg.color, fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>
          {cfg.label}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {reason || decision}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { id } = useParams();
  const [email, setEmail] = useState('');
  const [lookupMode, setLookupMode] = useState(!id);
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [emiLoading, setEmiLoading] = useState(false);
  const [emiSuccess, setEmiSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    if (id) {
      fetchApp(id);
    }
  }, [id]);

  const fetchApp = async (appId) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getApplication(appId);
      setAppData(data);
    } catch (e) {
      setError(e.message || 'Application not found');
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.lookupByEmail(email.trim());
      await fetchApp(data.applicant_id);
      setLookupMode(false);
    } catch (e) {
      setError('No application found for this email. Please check and try again.');
      setLoading(false);
    }
  };

  const handleEmiPayment = async (status) => {
    if (!appData) return;
    setEmiLoading(true);
    try {
      const res = await api.recordEmiPayment(appData.applicant_id, 10000, status);
      setEmiSuccess(`Score updated: ${res.previous_score} → ${res.new_score} (${res.event})`);
      await fetchApp(appData.applicant_id);
    } catch (e) {
      setError(e.message);
    } finally {
      setEmiLoading(false);
    }
  };

  const exportJSON = () => {
    if (!appData) return;
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CredAI_Report_${appData.applicant_id.substring(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (lookupMode && !id) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh' }}>
        <div style={{ width: '100%', maxWidth: 480, padding: '0 24px' }}>
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Search size={28} color="var(--primary-light)" />
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>
              Track Application Status
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9375rem' }}>
              Enter your registered email address to view your risk score, SHAP explanation, and loan status.
            </p>
            <div className="form-group">
              <input
                type="email"
                className="form-input"
                id="lookup-email"
                placeholder="registered@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
              />
            </div>
            {error && (
              <div className="alert alert-danger" style={{ marginTop: 14, textAlign: 'left' }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: 16 }}
              onClick={handleLookup}
              disabled={loading || !email.trim()}
              id="btn-lookup"
            >
              {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Search size={16} />}
              {loading ? 'Fetching Details...' : 'Find My Application'}
            </button>

            <div className="divider" />

            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Don't have an active application?{' '}
              <Link to="/apply" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}>
                Apply now →
              </Link>
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: 12 }}>
              1-Click Demo Profiles:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {[
                { email: 'aditya.sharma@gmail.com', label: 'Aditya (Approved 88/100)' },
                { email: 'v.mishra99@temp-mail.com', label: 'Vikram (Fraud Flagged)' },
                { email: 'kavya.nair@gmail.com', label: 'Kavya (Approved 76/100)' },
              ].map(({ email: e, label }) => (
                <button
                  key={e}
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setEmail(e); }}
                  id={`demo-${e.split('@')[0]}`}
                  style={{ fontSize: '0.8rem', border: '1px solid var(--border)' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Analyzing credit evaluation metrics...</p>
        </div>
      </div>
    );
  }

  if (error && !appData) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: 420, padding: 32 }}>
          <AlertCircle size={44} color="var(--accent-red)" style={{ margin: '0 auto 14px', display: 'block' }} />
          <h2 style={{ marginBottom: 8 }}>Application Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => setLookupMode(true)}>Try Another Search</button>
        </div>
      </div>
    );
  }

  if (!appData) return null;

  const tier = appData.status;
  const nlExp = (() => {
    try { return typeof appData.nl_explanation === 'object' ? appData.nl_explanation : {}; } catch { return {}; }
  })();
  const featContribs = appData.feature_contributions_detail || [];
  const fraudFlags = appData.fraud_alerts?.map(a => a.description) || [];

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '40px 24px 80px' }}>

        {/* Top Bar Controls */}
        <div className="flex items-center justify-between" style={{ marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 4 }}>
              {appData.name}'s Credit Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Application ID: {appData.applicant_id?.substring(0, 8)}... •
              Submitted {new Date(appData.created_at).toLocaleDateString('en-IN')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span className={`badge badge-${tier}`}>
              {tier === 'approved' ? '✓ Approved' : tier === 'review' ? '◎ Under Review' : '✗ Rejected'}
            </span>
            <span className={`badge badge-fraud-${appData.fraud_risk}`}>
              Fraud Risk: {appData.fraud_risk}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={exportJSON} title="Download Full JSON Assessment">
              <Download size={14} />
              Export Report
            </button>
            <button className="btn btn-ghost btn-sm" onClick={copyShareLink} title="Copy Dashboard URL">
              {copied ? <Check size={14} color="var(--accent-green)" /> : <Share2 size={14} />}
              {copied ? 'Copied Link' : 'Share'}
            </button>
          </div>
        </div>

        {/* Decision Banner */}
        <div style={{ marginBottom: 28 }}>
          <DecisionBanner
            decision={appData.decision}
            tier={tier}
            reason={appData.decision_reason}
          />
        </div>

        {/* EMI Update Notification Banner */}
        {emiSuccess && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <CheckCircle2 size={16} />
            {emiSuccess}
          </div>
        )}

        {/* Dashboard Tabs */}
        <div className="tabs" style={{ marginBottom: 28 }}>
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'health', label: '🩺 Financial Health & Recs' },
            { key: 'explain', label: '🔍 SHAP Explainability' },
            { key: 'timeline', label: '📈 Score Timeline' },
            { key: 'simulator', label: '⚡ What-If Simulator' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`tab ${activeTab === key ? 'active' : ''}`}
              id={`tab-${key}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab: Overview ──────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
              {/* Score Gauge Card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: 28 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI Credit Risk Score
                </div>
                <RiskScoreGauge score={appData.risk_score} size={220} animated />
                <FraudBadge fraudRisk={appData.fraud_risk} fraudScore={appData.fraud_score} flags={fraudFlags} />
              </div>

              {/* Score Breakdown & Application Data */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Score Breakdown Bar */}
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>Composite Weight Breakdown</div>
                  {[
                    { label: 'Traditional Data (Credit, Income, EMI Burden)', val: appData.risk_score * 0.4 + 10, max: 100, color: '#6366f1' },
                    { label: 'Alternative Data (UPI, LinkedIn, Education)', val: appData.risk_score * 0.6, max: 100, color: '#06b6d4' },
                    { label: 'Overall Risk Score', val: appData.risk_score, max: 100, color: appData.risk_score >= 75 ? '#10b981' : appData.risk_score >= 50 ? '#f59e0b' : '#ef4444' },
                  ].map(({ label, val, max, color }) => (
                    <div key={label} style={{ marginBottom: 14 }}>
                      <div className="flex justify-between" style={{ marginBottom: 4, fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                        <span style={{ fontWeight: 700, color }}>{Math.round(val)}/{max}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min(100, val)}%`, background: color }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Table */}
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>Application Parameters</div>
                  <div className="form-grid">
                    {[
                      ['Requested Loan', `₹${Number(appData.loan_amount).toLocaleString()}`],
                      ['Purpose', appData.loan_purpose],
                      ['Monthly Income', `₹${Number(appData.monthly_income).toLocaleString()}`],
                      ['CIBIL Score', appData.credit_score],
                      ['Employment', appData.employment_type],
                      ['City', appData.city],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
                        <div style={{ fontWeight: 600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Health & Recommendations Grid on Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
              <FinancialHealthRadar healthData={appData.financial_health} />
              <RecommendationCards recommendations={appData.recommendations} />
            </div>

            {/* Natural Language Explanation Box */}
            {nlExp.summary && (
              <div className="card" style={{ marginTop: 24, padding: 28 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 18 }}>
                  <Info size={20} color="var(--primary-light)" />
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>AI Decision Reasoning & Narrative</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  {[
                    { key: 'summary', label: 'Summary Executive' },
                    { key: 'positive_factors', label: '✅ Core Approval Drivers' },
                    { key: 'concerns', label: '⚠️ Risk Points & Flags' },
                    { key: 'fraud_assessment', label: '🔍 Multi-Layer Fraud Audit' },
                    { key: 'breakdown_narrative', label: '📊 Weight & Model Logic' },
                  ].filter(({ key }) => nlExp[key]).map(({ key, label }) => (
                    <div key={key} style={{
                      padding: '14px 16px',
                      background: 'var(--glass)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {nlExp[key]}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommended Next Steps */}
                {nlExp.next_steps?.length > 0 && (
                  <div style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <div style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.9rem', color: 'var(--primary-light)' }}>📋 Actionable Recommendations</div>
                    {nlExp.next_steps.map((stepItem, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                        <ChevronRight size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: 3 }} />
                        {stepItem}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Score Simulator Controls */}
            {tier === 'approved' && (
              <div className="card" style={{ marginTop: 24, padding: 24 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                  <RefreshCw size={18} color="var(--accent-green)" />
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>Simulate Monthly EMI Repayment (Dynamic Score Engine)</div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
                  Test how punctual EMI repayments or missed payments immediately update your credit risk score over time.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {[
                    { status: 'paid', label: '✓ Record Timely EMI Paid', cls: 'btn-primary' },
                    { status: 'late', label: '⏰ Record Late EMI Payment', cls: 'btn-secondary' },
                    { status: 'missed', label: '✗ Record Missed EMI Default', cls: 'btn-danger' },
                  ].map(({ status, label, cls }) => (
                    <button
                      key={status}
                      className={`btn ${cls} btn-sm`}
                      onClick={() => handleEmiPayment(status)}
                      disabled={emiLoading}
                      id={`emi-${status}`}
                    >
                      {emiLoading ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Financial Health & Recommendations ──────────────── */}
        {activeTab === 'health' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <FinancialHealthRadar healthData={appData.financial_health} />
            <RecommendationCards recommendations={appData.recommendations} />
          </div>
        )}

        {/* ── Tab: SHAP Explainability ────────────────────────────── */}
        {activeTab === 'explain' && (
          <div>
            <div className="card" style={{ padding: 28 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                <TrendingUp size={20} color="var(--primary-light)" />
                <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>SHAP Feature Contribution Analysis</div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
                Quantifying exact point contributions for every signal toward your final risk score of <strong style={{ color: 'var(--primary-light)' }}>{appData.risk_score}/100</strong>.
              </p>
              <ExplainabilityChart contributions={featContribs} />
            </div>

            {/* Individual Feature Cards */}
            {featContribs.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>Detailed Factor Breakdown & Guidance</div>
                <div className="grid grid-cols-2" style={{ gap: 16 }}>
                  {featContribs.slice(0, 6).map((feat) => (
                    <div key={feat.feature} className="card" style={{
                      padding: 20,
                      borderColor: feat.impact === 'positive' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)',
                    }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{feat.display_name}</div>
                        <div style={{
                          fontWeight: 800,
                          color: feat.impact === 'positive' ? 'var(--accent-green-light)' : 'var(--accent-red-light)',
                          fontSize: '0.925rem',
                        }}>
                          {feat.contribution > 0 ? '+' : ''}{feat.contribution?.toFixed(1)} pts
                        </div>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
                        {feat.description}
                      </div>
                      {feat.improvement_tip && feat.impact !== 'positive' && (
                        <div style={{
                          padding: '10px 12px',
                          background: 'rgba(99,102,241,0.06)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          color: 'var(--primary-light)',
                          border: '1px solid rgba(99,102,241,0.15)',
                        }}>
                          💡 {feat.improvement_tip}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Score Timeline ─────────────────────────────────── */}
        {activeTab === 'timeline' && (
          <div className="card" style={{ padding: 28 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <TrendingUp size={20} color="var(--primary-light)" />
              <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>Dynamic Behaviour Event Progression</div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
              Your risk score updates continuously based on EMI payments and financial conduct.
            </p>
            <ScoreTimeline history={appData.score_history || []} />
          </div>
        )}

        {/* ── Tab: What-If Simulator ──────────────────────────────── */}
        {activeTab === 'simulator' && (
          <div className="card" style={{ padding: 28 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <TrendingUp size={20} color="var(--primary-light)" />
              <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>Interactive Score Simulator</div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
              Drag the sliders below to simulate score changes before updating your profile.
            </p>
            <WhatIfSimulator initialData={{
              credit_score: appData.credit_score,
              monthly_income: appData.monthly_income,
              loan_amount: appData.loan_amount,
              emi_burden: appData.emi_burden,
              bill_payment_score: appData.bill_payment_score,
              upi_transactions_monthly: appData.upi_transactions_monthly,
              digital_payment_consistency: appData.digital_payment_consistency,
              certifications: appData.certifications,
              years_experience: appData.years_experience,
              has_linkedin: !!appData.linkedin_url,
              has_github: !!appData.github_url,
            }} />
          </div>
        )}
      </div>

      {/* Embedded Floating AI Chatbot Widget */}
      <ChatbotWidget applicantData={appData} />

      {/* Compliance Modal */}
      <ComplianceModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        policyType={modalType}
      />
    </div>
  );
}
