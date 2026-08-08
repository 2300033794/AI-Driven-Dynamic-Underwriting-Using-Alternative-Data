import { useState, useEffect } from 'react';
import { api } from '../api';
import { Sliders, TrendingUp, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoanEligibilitySimulator() {
  const [loanAmount, setLoanAmount] = useState(800000);
  const [income, setIncome] = useState(65000);
  const [creditScore, setCreditScore] = useState(680);
  const [emiBurden, setEmiBurden] = useState(8000);

  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation();
    }, 300);
    return () => clearTimeout(timer);
  }, [loanAmount, income, creditScore, emiBurden]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.simulateEligibility({
        loan_amount: loanAmount,
        monthly_income: income,
        credit_score: creditScore,
        emi_burden: emiBurden,
        employment_type: 'Salaried',
        bill_payment_score: 75,
        upi_transactions_monthly: 35,
        digital_payment_consistency: 0.85,
        certifications: 2,
        linkedin_url: 'https://linkedin.com/in/applicant',
      });
      setSimulation(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const chance = activeScenario ? activeScenario.new_chance : (simulation?.approval_chance || 84);

  return (
    <div className="card" style={{ padding: 28, background: 'var(--gradient-card)' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md)',
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sliders size={22} color="var(--primary-light)" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              AI Loan Eligibility Simulator
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Simulate approval probabilities before making a formal application
            </p>
          </div>
        </div>

        <span className="badge badge-approved" style={{ fontSize: '0.75rem' }}>
          <Sparkles size={12} /> Instant Evaluation
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Input Controls */}
        <div>
          <div style={{ marginBottom: 18 }}>
            <div className="flex justify-between" style={{ marginBottom: 6, fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Target Loan Amount</span>
              <span style={{ fontWeight: 800, color: 'var(--primary-light)', fontSize: '1.05rem' }}>
                ₹{Number(loanAmount).toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              className="form-range"
              min={50000}
              max={2000000}
              step={50000}
              value={loanAmount}
              onChange={e => setLoanAmount(Number(e.target.value))}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <div className="flex justify-between" style={{ marginBottom: 6, fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Monthly Net Income</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                ₹{Number(income).toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              className="form-range"
              min={15000}
              max={300000}
              step={5000}
              value={income}
              onChange={e => setIncome(Number(e.target.value))}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <div className="flex justify-between" style={{ marginBottom: 6, fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Credit Score (CIBIL)</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {creditScore}
              </span>
            </div>
            <input
              type="range"
              className="form-range"
              min={300}
              max={900}
              step={10}
              value={creditScore}
              onChange={e => setCreditScore(Number(e.target.value))}
            />
          </div>

          <div>
            <div className="flex justify-between" style={{ marginBottom: 6, fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Existing EMI Outflows</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                ₹{Number(emiBurden).toLocaleString()}/mo
              </span>
            </div>
            <input
              type="range"
              className="form-range"
              min={0}
              max={80000}
              step={2000}
              value={emiBurden}
              onChange={e => setEmiBurden(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Live Approval Gauge & Scenario Suggestions */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between'
        }}>
          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Risk Score
                </div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                  {simulation?.current_risk_score || 72}/100
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Approval Chance
                </div>
                <div style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  color: chance >= 80 ? '#10b981' : chance >= 60 ? '#f59e0b' : '#ef4444',
                }}>
                  {chance}%
                </div>
              </div>
            </div>

            <div className="progress-bar" style={{ height: 10, marginBottom: 20 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${chance}%`,
                  background: chance >= 80 ? 'linear-gradient(90deg, #10b981, #34d399)' : chance >= 60 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)'
                }}
              />
            </div>

            {/* Suggestions Header */}
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={16} color="var(--primary-light)" />
              Targeted Action Scenarios:
            </div>

            {/* Scenarios List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {simulation?.scenarios?.map((s) => {
                const isSelected = activeScenario?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveScenario(isSelected ? null : s)}
                    style={{
                      padding: '10px 12px',
                      background: isSelected ? 'rgba(16,185,129,0.12)' : 'var(--glass)',
                      border: `1px solid ${isSelected ? 'rgba(16,185,129,0.4)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {s.action}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {s.description}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#34d399' }}>
                        {s.new_chance}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {activeScenario && (
            <div style={{
              marginTop: 14,
              padding: 10,
              background: 'rgba(16,185,129,0.1)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Selected scenario impact active:</span>
              <strong>Approval Chance becomes {activeScenario.new_chance}%</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
