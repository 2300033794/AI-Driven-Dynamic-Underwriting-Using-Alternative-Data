import { AlertTriangle, ShieldOff, ShieldCheck } from 'lucide-react';

export default function FraudBadge({ fraudRisk = 'low', fraudScore = 0, flags = [], compact = false }) {
  const configs = {
    high: {
      icon: ShieldOff,
      label: 'High Fraud Risk',
      className: 'badge-fraud-high',
      alertClass: 'alert-danger',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.25)',
    },
    medium: {
      icon: AlertTriangle,
      label: 'Medium Fraud Risk',
      className: 'badge-fraud-medium',
      alertClass: 'alert-warning',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.25)',
    },
    low: {
      icon: ShieldCheck,
      label: 'No Fraud Detected',
      className: 'badge-fraud-low',
      alertClass: 'alert-success',
      color: '#10b981',
      bg: 'rgba(16,185,129,0.05)',
      border: 'rgba(16,185,129,0.2)',
    },
  };

  const cfg = configs[fraudRisk] || configs.low;
  const Icon = cfg.icon;

  if (compact) {
    return (
      <span className={`badge ${cfg.className}`} id="fraud-badge-compact">
        <Icon size={11} />
        {cfg.label}
      </span>
    );
  }

  return (
    <div
      id="fraud-badge-full"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
      }}
    >
      <div className="flex items-center gap-3" style={{ marginBottom: flags.length ? 12 : 0 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: `${cfg.color}20`,
          border: `1px solid ${cfg.color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={20} color={cfg.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: cfg.color, fontSize: '0.9375rem' }}>{cfg.label}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Fraud probability: {Math.round(fraudScore * 100)}%
          </div>
        </div>
        <div style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.5rem',
          fontWeight: 800,
          color: cfg.color,
        }}>
          {Math.round(fraudScore * 100)}%
        </div>
      </div>

      {flags.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Detected Signals ({flags.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {flags.map((flag, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}>
                <span style={{ color: cfg.color, flexShrink: 0, marginTop: 2 }}>⚠</span>
                {flag}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
