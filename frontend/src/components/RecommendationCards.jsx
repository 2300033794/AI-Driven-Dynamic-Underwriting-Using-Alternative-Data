import { CheckCircle2, TrendingUp, Sparkles, Clock, AlertCircle } from 'lucide-react';

export default function RecommendationCards({ recommendations = [] }) {
  if (!recommendations.length) return null;

  return (
    <div className="card" style={{ padding: 26 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-sm)',
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={20} color="var(--accent-green-light)" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: 'Outfit, sans-serif' }}>
              AI Recommendation Engine
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Prioritized Action Plan for Risk Score Gain
            </div>
          </div>
        </div>

        <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
          Personalized Actions
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            style={{
              padding: '14px 18px',
              background: 'var(--glass)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 14,
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(16,185,129,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 2
              }}>
                <CheckCircle2 size={16} color="var(--accent-green)" />
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                  {rec.action}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>
                  {rec.detail}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> Timeframe: {rec.timeframe}
                  </span>
                  <span>• Category: {rec.category}</span>
                </div>
              </div>
            </div>

            <div style={{
              flexShrink: 0,
              padding: '6px 12px',
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 'var(--radius-full)',
              color: '#34d399',
              fontWeight: 800,
              fontSize: '0.8125rem',
              whiteSpace: 'nowrap',
            }}>
              +{rec.expected_score_gain} points
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
