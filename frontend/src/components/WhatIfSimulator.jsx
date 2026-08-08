import { useState, useCallback } from 'react';
import { api } from '../api';
import RiskScoreGauge from './RiskScoreGauge';
import { Zap, TrendingUp } from 'lucide-react';

const DEFAULT_PARAMS = {
  credit_score: 650,
  monthly_income: 50000,
  loan_amount: 300000,
  emi_burden: 0,
  bill_payment_score: 65,
  upi_transactions_monthly: 25,
  digital_payment_consistency: 0.70,
  certifications: 1,
  years_experience: 3,
  has_linkedin: false,
  has_github: false,
};

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export default function WhatIfSimulator({ initialData = {} }) {
  const [params, setParams] = useState({ ...DEFAULT_PARAMS, ...initialData });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchScore = useCallback(
    debounce(async (p) => {
      setLoading(true);
      try {
        const payload = {
          ...p,
          linkedin_url: p.has_linkedin ? 'https://linkedin.com/in/user' : '',
          github_url: p.has_github ? 'https://github.com/user' : '',
          employment_type: 'Salaried',
          employer: 'Company',
          education_level: 'B.Tech',
          education_institute: 'University',
          name: 'Simulator',
          email: 'sim@example.com',
          phone: '9999999999',
          pan: 'SIMXX0000X',
          aadhaar: '0000-0000-0000',
          loan_purpose: 'Personal',
        };
        const data = await api.previewScore(payload);
        setResult(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 400),
    []
  );

  const update = (key, val) => {
    const next = { ...params, [key]: val };
    setParams(next);
    fetchScore(next);
  };

  const SliderField = ({ label, paramKey, min, max, step = 1, format = v => v }) => (
    <div style={{ marginBottom: 14 }}>
      <div className="flex justify-between" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-light)' }}>
          {format(params[paramKey])}
        </span>
      </div>
      <input
        type="range"
        className="form-range"
        id={`sim-${paramKey}`}
        min={min}
        max={max}
        step={step}
        value={params[paramKey]}
        onChange={e => update(paramKey, parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  );

  const ToggleField = ({ label, paramKey }) => (
    <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
        <input
          type="checkbox"
          id={`sim-toggle-${paramKey}`}
          checked={params[paramKey]}
          onChange={e => update(paramKey, e.target.checked)}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
          position: 'absolute',
          cursor: 'pointer',
          inset: 0,
          background: params[paramKey] ? 'var(--primary)' : 'var(--border)',
          borderRadius: 24,
          transition: 'all 0.3s',
        }}>
          <span style={{
            position: 'absolute',
            height: 18,
            width: 18,
            left: params[paramKey] ? 23 : 3,
            bottom: 3,
            background: 'white',
            borderRadius: '50%',
            transition: 'all 0.3s',
          }} />
        </span>
      </label>
    </div>
  );

  return (
    <div id="what-if-simulator">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Controls */}
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            Adjust Parameters
          </div>

          <SliderField label="Credit Score (CIBIL)" paramKey="credit_score" min={300} max={900} />
          <SliderField
            label="Monthly Income"
            paramKey="monthly_income"
            min={10000}
            max={300000}
            step={5000}
            format={v => `₹${(v/1000).toFixed(0)}K`}
          />
          <SliderField
            label="Loan Amount"
            paramKey="loan_amount"
            min={50000}
            max={2000000}
            step={50000}
            format={v => `₹${(v/100000).toFixed(1)}L`}
          />
          <SliderField
            label="Existing EMI Burden"
            paramKey="emi_burden"
            min={0}
            max={80000}
            step={2000}
            format={v => `₹${(v/1000).toFixed(0)}K`}
          />
          <SliderField
            label="Bill Payment Score"
            paramKey="bill_payment_score"
            min={0}
            max={100}
            format={v => `${v}/100`}
          />
          <SliderField
            label="UPI Transactions/Month"
            paramKey="upi_transactions_monthly"
            min={0}
            max={100}
          />
          <SliderField
            label="Certifications"
            paramKey="certifications"
            min={0}
            max={8}
          />
          <ToggleField label="Has LinkedIn Profile" paramKey="has_linkedin" />
          <ToggleField label="Has GitHub Profile" paramKey="has_github" />
        </div>

        {/* Result */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {loading && (
            <div style={{ position: 'absolute', top: 8, right: 8 }}>
              <div className="spinner" style={{ width: 18, height: 18 }} />
            </div>
          )}

          {result ? (
            <>
              <RiskScoreGauge score={result.risk_score} size={180} animated />
              <div style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                textAlign: 'center',
                ...(result.decision_tier === 'approved' ? {
                  background: 'rgba(16,185,129,0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16,185,129,0.3)',
                } : result.decision_tier === 'review' ? {
                  background: 'rgba(245,158,11,0.15)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245,158,11,0.3)',
                } : {
                  background: 'rgba(239,68,68,0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.3)',
                }),
              }}>
                {result.decision}
              </div>

              {/* Score breakdown */}
              <div style={{ width: '100%' }}>
                {[
                  { label: 'Traditional Data', val: result.score_breakdown?.traditional, color: '#6366f1' },
                  { label: 'Alternative Data', val: result.score_breakdown?.alternative, color: '#06b6d4' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ marginBottom: 10 }}>
                    <div className="flex justify-between" style={{ fontSize: '0.8rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                      <span style={{ color, fontWeight: 700 }}>{val}/100</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${val}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* What-if tips */}
              {result.what_if_insights?.length > 0 && (
                <div style={{ width: '100%' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />
                    Improvement Tips
                  </div>
                  {result.what_if_insights.slice(0, 2).map((tip, i) => (
                    <div key={i} style={{
                      padding: '8px 12px',
                      background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      color: '#34d399',
                      marginBottom: 6,
                    }}>
                      <span style={{ fontWeight: 700 }}>{tip.score_change}</span> pts — {tip.scenario}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              color: 'var(--text-muted)',
              padding: '40px 20px',
              textAlign: 'center',
            }}>
              <Zap size={36} color="var(--primary)" opacity={0.5} />
              <p style={{ fontSize: '0.9rem' }}>Adjust the sliders to see your predicted risk score in real-time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
