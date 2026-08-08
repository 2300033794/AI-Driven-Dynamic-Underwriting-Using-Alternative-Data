import { X, ShieldCheck, FileText, Lock, Scale, CheckCircle } from 'lucide-react';

export default function ComplianceModal({ isOpen, onClose, policyType }) {
  if (!isOpen) return null;

  const contentMap = {
    dpdp: {
      title: 'Digital Personal Data Protection (DPDP) Act 2023 Compliance',
      icon: Lock,
      color: '#6366f1',
      badge: 'Statutory Compliance • India',
      sections: [
        {
          heading: '1. Explicit Consent & Purpose Limitation',
          body: 'CredAI collects and processes personal, financial, and alternative data strictly after receiving explicit, affirmative consent from the applicant. Data is utilized exclusively for loan risk underwriting and fraud detection.',
        },
        {
          heading: '2. Customer Data Rights & Withdrawal',
          body: 'Applicants retain full rights to request data access, correction, or complete erasure of their records from our active databases by contacting privacy@credai.in or through their dashboard settings.',
        },
        {
          heading: '3. Data Security & Storage Localisation',
          body: 'All customer data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Primary data storage servers are localized within Indian data centers in full compliance with MeitY and DPDP guidelines.',
        },
        {
          heading: '4. Third-Party Data Integrity',
          body: 'Alternative data signals (such as LinkedIn profile status, GitHub metrics, or UPI transaction patterns) are fetched strictly via user-authorized OAuth APIs or direct applicant disclosures.',
        },
      ],
    },
    rbi: {
      title: 'RBI Digital Lending Guidelines Compliance',
      icon: Scale,
      color: '#06b6d4',
      badge: 'Regulatory Alignment • Reserve Bank of India',
      sections: [
        {
          heading: '1. Direct Disbursement & Repayment',
          body: 'All loan disbursements and EMI repayments pass directly between the borrower’s verified bank account and the Regulated Entity (RE / Bank / NBFC) without routing through any un-monitored third-party pool accounts.',
        },
        {
          heading: '2. Key Fact Statement (KFS)',
          body: 'Every approved applicant receives an automated Key Fact Statement detailing the exact Annual Percentage Rate (APR), processing fees, EMI schedule, and total cost of credit prior to loan agreement signing.',
        },
        {
          heading: '3. Digital Credit Assessment Transparency',
          body: 'Algorithms and ML underwriting models adhere to strict non-discrimination parameters and provide auditable logs for all credit decisioning.',
        },
        {
          heading: '4. Grievance Redressal Mechanism',
          body: 'Applicants have access to a designated Nodal Grievance Officer and standard escalation paths to the RBI Banking Ombudsman for unresolved queries.',
        },
      ],
    },
    explainability: {
      title: 'Explainable AI (XAI) & Algorithmic Governance Framework',
      icon: FileText,
      color: '#10b981',
      badge: 'Model Governance & Transparency',
      sections: [
        {
          heading: '1. SHAP & Feature Contribution Breakdown',
          body: 'CredAI uses TreeSHAP (Shapley Additive exPlanations) to calculate exact point contributions for every input feature, ensuring 100% transparent decision boundaries for both applicants and risk managers.',
        },
        {
          heading: '2. Natural Language Reason Generation',
          body: 'Automated decision engines translate complex mathematical vector importances into plain-language summaries highlighting top approval drivers and actionable improvement recommendations.',
        },
        {
          heading: '3. No Black-Box Machine Learning',
          body: 'We ban opaque un-interpretable deep neural nets in favor of constrained ensemble gradient boosting models with strictly audited monotonicity constraints.',
        },
      ],
    },
    fairness: {
      title: 'Fair Lending & Anti-Discrimination Policy',
      icon: ShieldCheck,
      color: '#8b5cf6',
      badge: 'Ethical AI Standard',
      sections: [
        {
          heading: '1. Protected Attributes Exclusion',
          body: 'CredAI strictly excludes gender, religion, caste, marital status, sexual orientation, political views, and geographical origin from all credit scoring models.',
        },
        {
          heading: '2. Continuous Bias Auditing',
          body: 'Our risk engine undergoes automated monthly parity testing across demographic groups to ensure equal opportunity lending standards (Disparate Impact Ratio > 0.90).',
        },
        {
          heading: '3. Alternative Data Inclusion',
          body: 'By scoring skills, career trajectory, and payment discipline alongside credit history, CredAI actively reduces systemic credit denial for thin-file borrowers.',
        },
      ],
    },
  };

  const activePolicy = contentMap[policyType] || contentMap.dpdp;
  const Icon = activePolicy.icon;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: 'rgba(6, 6, 16, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      animation: 'fadeIn 0.2s ease forwards',
    }}
    onClick={onClose}
    >
      <div
        className="card-glass"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '85vh',
          overflowY: 'auto',
          position: 'relative',
          padding: 32,
          border: `1px solid ${activePolicy.color}40`,
          boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${activePolicy.color}20`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'var(--glass)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--glass)'; }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-md)',
            background: `${activePolicy.color}15`,
            border: `1px solid ${activePolicy.color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={26} color={activePolicy.color} />
          </div>
          <div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: activePolicy.color,
            }}>
              {activePolicy.badge}
            </span>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: 2,
            }}>
              {activePolicy.title}
            </h2>
          </div>
        </div>

        <div className="divider" style={{ margin: '16px 0 24px' }} />

        {/* Policy Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {activePolicy.sections.map((sec, i) => (
            <div key={i} style={{
              background: 'var(--glass)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 18,
            }}>
              <div style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <CheckCircle size={15} color={activePolicy.color} />
                {sec.heading}
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}>
                {sec.body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div style={{
          marginTop: 28,
          padding: 14,
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          <span>Last Updated: August 2026 • CredAI Legal Governance</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={onClose}
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
