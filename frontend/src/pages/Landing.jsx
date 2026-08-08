import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Brain, Zap, TrendingUp, Eye, AlertTriangle,
  Star, Users, ArrowRight, CheckCircle2, Link2, GitBranch,
  CreditCard, Smartphone, GraduationCap, Building2, HelpCircle,
  ChevronDown, ChevronUp, Lock, Scale, FileText, ExternalLink,
  Sliders, Activity, Award, UserCheck, Check, Crosshair
} from 'lucide-react';
import ComplianceModal from '../components/ComplianceModal';
import LoanEligibilitySimulator from '../components/LoanEligibilitySimulator';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Scoring',
    desc: 'XGBoost model trained on 50+ signals combines traditional and alternative data for accurate risk prediction.',
    color: '#6366f1',
  },
  {
    icon: Eye,
    title: 'Full Explainability',
    desc: 'Every decision comes with SHAP feature importance and natural language reasoning. No black boxes.',
    color: '#06b6d4',
  },
  {
    icon: AlertTriangle,
    title: 'Fraud Detection',
    desc: 'Multi-layer fraud analysis: identity checks, behavioral anomalies, and financial red flags.',
    color: '#f59e0b',
  },
  {
    icon: TrendingUp,
    title: 'Dynamic Risk Score',
    desc: 'Scores update monthly based on EMI payments, spending behavior, and life events.',
    color: '#10b981',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy First',
    desc: 'DPDP-compliant data handling. Only consent-provided data is processed.',
    color: '#8b5cf6',
  },
  {
    icon: Zap,
    title: 'Instant Decisions',
    desc: 'Get a risk score and loan decision in under 3 seconds, 24/7.',
    color: '#ec4899',
  },
];

const ALT_DATA_ITEMS = [
  { icon: Link2, label: 'LinkedIn Profile', desc: 'Professional presence & career stability' },
  { icon: GitBranch, label: 'GitHub Activity', desc: 'Technical skills & active contributions' },
  { icon: Smartphone, label: 'UPI Transactions', desc: 'Digital payment habits & frequency' },
  { icon: CreditCard, label: 'Bill Payments', desc: 'Utility & mobile payment consistency' },
  { icon: GraduationCap, label: 'Education Quality', desc: 'Degree level & institution prestige' },
  { icon: Building2, label: 'Employment Type', desc: 'Job stability & employer reputation' },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Apply in 3 Minutes',
    desc: 'Fill in your basic personal and financial information along with optional alternative signals like LinkedIn, GitHub, or UPI activity.',
    icon: Sliders,
    badge: 'Simple Form',
  },
  {
    step: '02',
    title: 'Multi-Layer AI Evaluation',
    desc: 'Our ensemble model cross-evaluates traditional financial metrics with skills, digital payment habits, and multi-layer fraud detection rules.',
    icon: Activity,
    badge: 'Real-time Execution',
  },
  {
    step: '03',
    title: 'Transparent SHAP Explanation',
    desc: 'Get an instant decision accompanied by exact feature contribution bar charts and plain-English reasons explaining the outcome.',
    icon: FileText,
    badge: '100% Explainable',
  },
  {
    step: '04',
    title: 'Dynamic Score Evolution',
    desc: 'Your risk score is re-evaluated monthly based on timely EMI payments and financial behavior, helping you qualify for lower rates over time.',
    icon: TrendingUp,
    badge: 'Continuous Credit',
  },
];

const DEMO_CASES = [
  {
    name: 'Ankit Patel',
    role: 'Fresh Graduate, TCS',
    credit: 580,
    score: 68,
    decision: 'Manual Review',
    tier: 'review',
    reason: 'Strong BITS Pilani education and active GitHub profile compensate for limited credit history.',
    avatar: '🎓',
  },
  {
    name: 'Rahul Verma',
    role: 'Freelancer, 3 yrs exp.',
    credit: 620,
    score: 74,
    decision: 'Approved',
    tier: 'approved',
    reason: '150+ GitHub contributions, 4 certifications, consistent UPI patterns signal strong financial discipline.',
    avatar: '💻',
  },
  {
    name: 'Kavya Nair',
    role: 'Software Eng., Wipro',
    credit: 665,
    score: 76,
    decision: 'Approved',
    tier: 'approved',
    reason: 'Stable employment, M.Tech from Cochin University, and consistent payment history drive approval.',
    avatar: '🏢',
  },
  {
    name: 'Vikram Mishra',
    role: 'Business Owner',
    credit: 700,
    score: 28,
    decision: '🚨 Fraud Risk',
    tier: 'rejected',
    reason: 'Multiple PANs detected across applications. Temporary email flagged. EMI burden 80% of income.',
    avatar: '⚠️',
  },
];

const FAQS = [
  {
    q: 'How does CredAI evaluate applicants without a high credit score?',
    a: 'CredAI evaluates alternative data points including utility bill payment consistency, UPI digital payment frequency, LinkedIn professional presence, GitHub technical contributions, education level, and professional certifications. These signals carry a 60% weight in our composite risk model.',
  },
  {
    q: 'Is my personal and financial data safe under Indian privacy laws?',
    a: 'Yes. CredAI is 100% compliant with India’s Digital Personal Data Protection (DPDP) Act 2023. We only process data you explicitly consent to share, encrypt all data in transit (TLS 1.3) and at rest (AES-256), and store all records strictly within Indian servers.',
  },
  {
    q: 'Will applying through CredAI affect my official CIBIL credit score?',
    a: 'No. Initial application and score previews perform a soft credit check that does NOT impact your official CIBIL or Experian credit score.',
  },
  {
    q: 'How does the Explainable AI (SHAP) feature work?',
    a: 'CredAI uses TreeSHAP (Shapley Additive exPlanations) to calculate exact point contributions for every signal. Unlike black-box AI, CredAI shows you precisely which factors boosted your score and which factors pulled it down, alongside tailored tips for score improvement.',
  },
  {
    q: 'What happens if the system flags a potential fraud alert?',
    a: 'Applications flagged with medium or high fraud risk are automatically routed to our risk compliance team in the Admin Panel for manual verification before any decision is finalized.',
  },
];

const STATS = [
  { value: '94%', label: 'Accuracy on Alt. Data Signals' },
  { value: '3s', label: 'Average Decision Time' },
  { value: '60%', label: 'Weight on Alternative Data' },
  { value: '8+', label: 'Fraud Detection Layers' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [modalType, setModalType] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="page-wrapper">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 0 60px',
      }}>
        {/* Background Glowing Blobs */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '-10%',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '-10%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />

        <div className="container">
          <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 'var(--radius-full)', padding: '6px 16px',
              fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-light)',
              marginBottom: 28, animation: 'fadeUp 0.5s ease forwards',
            }}>
              <Brain size={15} />
              AI-Powered Dynamic Underwriting Engine
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2.6rem, 5vw, 4.2rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: 24,
              animation: 'fadeUp 0.6s ease 0.1s both',
            }}>
              Smarter Loans for{' '}
              <span className="text-gradient">Every Indian</span>
            </h1>

            {/* Subheadline */}
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--text-secondary)',
              maxWidth: 660,
              margin: '0 auto 40px',
              lineHeight: 1.7,
              animation: 'fadeUp 0.6s ease 0.2s both',
            }}>
              CredAI goes beyond rigid credit scores. We harness{' '}
              <strong style={{ color: 'var(--text-primary)' }}>alternative data</strong>
              {' '}— your professional profile, GitHub activity, UPI discipline, and education — to give
              students, freelancers, and small business owners a{' '}
              <strong style={{ color: 'var(--text-primary)' }}>fair, explainable shot at credit</strong>.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
              animation: 'fadeUp 0.6s ease 0.3s both',
            }}>
              <Link to="/apply" className="btn btn-primary btn-lg" id="hero-apply-cta">
                <ShieldCheck size={20} />
                Apply for a Loan Now
              </Link>
              <Link to="/admin" className="btn btn-secondary btn-lg" id="hero-admin-cta">
                <Eye size={20} />
                Explore Admin Control Center
              </Link>
            </div>

            {/* Governance trust buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 20,
              marginTop: 48,
              flexWrap: 'wrap',
              animation: 'fadeUp 0.6s ease 0.4s both',
            }}>
              <button
                type="button"
                onClick={() => setModalType('dpdp')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}
              >
                <CheckCircle2 size={14} color="var(--accent-green)" />
                DPDP Act 2023 Compliant
              </button>

              <button
                type="button"
                onClick={() => setModalType('rbi')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}
              >
                <Scale size={14} color="var(--secondary-light)" />
                RBI Lending Guidelines
              </button>

              <button
                type="button"
                onClick={() => setModalType('explainability')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}
              >
                <Brain size={14} color="var(--primary-light)" />
                Explainable AI (SHAP)
              </button>

              <button
                type="button"
                onClick={() => setModalType('fairness')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}
              >
                <UserCheck size={14} color="var(--accent-green-light)" />
                Zero Discrimination
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <section style={{
        background: 'var(--glass)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '40px 0',
      }}>
        <div className="container">
          <div className="grid grid-cols-4" style={{ gap: '24px', textAlign: 'center' }}>
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                  fontWeight: 900,
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {value}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pre-Application Simulator Section ────────────────── */}
      <section id="simulator" className="section">
        <div className="container">
          <LoanEligibilitySimulator />
        </div>
      </section>

      {/* ── The Problem Section ────────────────────────────────── */}
      <section className="section" style={{ background: 'rgba(99,102,241,0.02)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-full)', padding: '4px 14px', fontSize: '0.8125rem', fontWeight: 600, color: '#f87171', marginBottom: 16 }}>
              The Credit Gap Problem
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: 16 }}>
              Traditional Credit Scoring{' '}
              <span style={{ color: '#f87171' }}>Fails Millions</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
              Over 400 Million Indians lack an established credit history. High-potential graduates, skilled freelancers, and growing small merchants are routinely rejected by traditional banks due to static legacy formulas. CredAI replaces rigid denial with intelligent, fair evaluation.
            </p>
          </div>

          <div className="grid grid-cols-3" style={{ gap: 20 }}>
            {[
              { emoji: '🎓', title: 'Fresh Graduates', desc: 'No prior loans or credit cards. Legacy banks reject them despite top-tier placements at leading tech firms.' },
              { emoji: '💻', title: 'Freelancers & Techies', desc: 'No monthly salary slip. Traditional algorithms view variable income as risk, ignoring digital skill equity.' },
              { emoji: '🏪', title: 'Small Merchants', desc: 'Seasonal cash flow. Legacy systems miss digital UPI payment volume and customer repeat frequency.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="card" style={{ textAlign: 'center', padding: 28 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 14 }}>{emoji}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ───────────────────────────────── */}
      <section id="how-it-works" className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--radius-full)', padding: '4px 14px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-light)', marginBottom: 16 }}>
              Seamless Process
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: 16 }}>
              How <span className="text-gradient">CredAI Works</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', maxWidth: 600, margin: '0 auto' }}>
              Four simple steps from application submission to instant explainable loan approval.
            </p>
          </div>

          <div className="grid grid-cols-4" style={{ gap: 20 }}>
            {HOW_IT_WORKS_STEPS.map(({ step, title, desc, icon: Icon, badge }) => (
              <div key={step} className="card" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16
                }}>
                  <div style={{
                    fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-light)', fontFamily: 'Outfit, sans-serif'
                  }}>
                    {step}
                  </div>
                  <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}>{badge}</span>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={22} color="var(--primary-light)" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/apply" className="btn btn-primary" id="how-apply-cta">
              Experience the Process Now →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Alternative Data Sources Section ────────────────────── */}
      <section id="alt-data" className="section" style={{ background: 'rgba(6,182,212,0.02)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 'var(--radius-full)', padding: '4px 14px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: 16 }}>
              Alternative Data Signals
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: 16 }}>
              Evaluating the <span className="text-gradient">Complete Applicant</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', maxWidth: 620, margin: '0 auto' }}>
              60% of our risk scoring weight relies on holistic alternative data indicators to accurately assess financial responsibility.
            </p>
          </div>

          <div className="grid grid-cols-3" style={{ gap: 18 }}>
            {ALT_DATA_ITEMS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 22 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={20} color="var(--primary-light)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid Section ───────────────────────────────── */}
      <section id="features" className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: 12 }}>
              Enterprise-Grade AI Architecture
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
              Designed to power modern financial institutions with speed, safety, and transparency.
            </p>
          </div>
          <div className="grid grid-cols-3" style={{ gap: 20 }}>
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card" style={{ position: 'relative', overflow: 'hidden', padding: 26 }}>
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: 100, height: 100,
                  background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                  borderRadius: '0 var(--radius-xl) 0 0',
                }} />
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  background: `${color}18`, border: `1px solid ${color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo Scenarios Section ──────────────────────────────── */}
      <section id="demo" className="section" style={{ background: 'rgba(99,102,241,0.02)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: 12 }}>
              Real Underwriting Scenarios
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
              See how our AI balances alternative data signals with fraud verification.
            </p>
          </div>
          <div className="grid grid-cols-2" style={{ gap: 20 }}>
            {DEMO_CASES.map(({ name, role, credit, score, decision, tier, reason, avatar }) => (
              <div key={name} className="card" style={{
                background: tier === 'approved' ? 'var(--gradient-approved)' :
                  tier === 'review' ? 'var(--gradient-review)' : 'var(--gradient-rejected)',
                padding: 24,
              }}>
                <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: '2rem' }}>{avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{role}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span className={`badge badge-${tier === 'rejected' ? 'rejected' : tier}`}>
                      {decision}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 24, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>CIBIL Score</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{credit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>AI Risk Score</div>
                    <div style={{
                      fontSize: '1.1rem', fontWeight: 700,
                      color: score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444',
                    }}>
                      {score}/100
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}>
                  {reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────── */}
      <section id="faq" className="section">
        <div className="container" style={{ maxWidth: 840 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--radius-full)', padding: '4px 14px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-light)', marginBottom: 16 }}>
              Got Questions?
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: 16 }}>
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
              Everything you need to know about alternative data credit assessment and privacy compliance.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FAQS.map((faq, idx) => (
              <div key={idx} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <HelpCircle size={18} color="var(--primary-light)" />
                    {faq.q}
                  </span>
                  {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaq === idx && (
                  <div style={{
                    padding: '0 24px 22px 54px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.7,
                    borderTop: '1px solid var(--border)',
                    paddingTop: 16,
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call To Action Section ────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{
            textAlign: 'center',
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-2xl)',
            padding: '64px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)',
            }} />
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: 16, position: 'relative' }}>
              Ready for a Smarter, Fairer Loan Decision?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', maxWidth: 540, margin: '0 auto 32px', position: 'relative' }}>
              Apply in less than 3 minutes. Receive an instant AI credit risk decision backed by transparent SHAP explainability.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', position: 'relative', flexWrap: 'wrap' }}>
              <Link to="/apply" className="btn btn-primary btn-lg" id="footer-cta">
                Start Your Application
                <ArrowRight size={18} />
              </Link>
              <Link to="/admin" className="btn btn-secondary btn-lg" id="footer-admin-cta">
                View Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Professional Multi-Column Footer ────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        padding: '60px 0 32px',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
      }}>
        <div className="container">
          <div className="grid grid-cols-4" style={{ gap: 40, marginBottom: 48 }}>
            {/* Col 1: Brand */}
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.5rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 12 }}>
                CredAI
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
                AI-driven dynamic credit underwriting engine harnessing alternative data for fair lending across India.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setModalType('dpdp')} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                  DPDP Act 2023
                </button>
                <button type="button" onClick={() => setModalType('rbi')} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                  RBI Guidelines
                </button>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>
                Platform Navigation
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</Link></li>
                <li><Link to="/apply" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Loan Application</Link></li>
                <li><Link to="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Applicant Dashboard</Link></li>
                <li><Link to="/admin" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Admin Control Center</Link></li>
                <li><a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>FastAPI Swagger Docs ↗</a></li>
              </ul>
            </div>

            {/* Col 3: Governance & Policies */}
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>
                Governance & Policies
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><button type="button" onClick={() => setModalType('dpdp')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, textAlign: 'left' }}>DPDP Act Privacy Policy</button></li>
                <li><button type="button" onClick={() => setModalType('rbi')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, textAlign: 'left' }}>RBI Digital Lending Norms</button></li>
                <li><button type="button" onClick={() => setModalType('explainability')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, textAlign: 'left' }}>SHAP Explainability Standard</button></li>
                <li><button type="button" onClick={() => setModalType('fairness')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, textAlign: 'left' }}>Fair Lending & Anti-Bias</button></li>
              </ul>
            </div>

            {/* Col 4: Contact & System Health */}
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>
                System Information
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-green-light)' }}>
                  <span className="glow-dot glow-dot-green" />
                  API Backend: Operational (Port 8000)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-green-light)' }}>
                  <span className="glow-dot glow-dot-green" />
                  Model Engine: XGBoost + SHAP
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: 8 }}>
                  Support: <a href="mailto:support@credai.in" style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>support@credai.in</a>
                </div>
              </div>
            </div>
          </div>

          <div className="divider" style={{ margin: '0 0 24px' }} />

          <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div>
              © 2026 CredAI Financial Technologies Ltd. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <button type="button" onClick={() => setModalType('dpdp')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Privacy Policy</button>
              <button type="button" onClick={() => setModalType('rbi')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Terms of Service</button>
              <button type="button" onClick={() => setModalType('explainability')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Model Governance</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI Advisor Widget */}
      <ChatbotWidget />

      {/* Compliance Modal */}
      <ComplianceModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        policyType={modalType}
      />
    </div>
  );
}
