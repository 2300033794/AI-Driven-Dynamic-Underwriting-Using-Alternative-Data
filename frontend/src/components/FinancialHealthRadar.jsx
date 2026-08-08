import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { HeartPulse, Award } from 'lucide-react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function FinancialHealthRadar({ healthData }) {
  if (!healthData) return null;

  const { overall_health_score, pillars, health_tier } = healthData;

  const data = {
    labels: [
      'Savings Score',
      'Income Stability',
      'Expense Discipline',
      'Debt Ratio Score',
      'Investment Score',
    ],
    datasets: [
      {
        label: 'Financial Health Pillars',
        data: [
          pillars?.savings_score || 70,
          pillars?.income_stability || 80,
          pillars?.expense_discipline || 75,
          pillars?.debt_ratio_score || 85,
          pillars?.investment_score || 60,
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        borderColor: '#6366f1',
        borderWidth: 2,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#06b6d4',
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(13,13,31,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed.r}/100`,
        },
      },
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255,255,255,0.1)' },
        grid: { color: 'rgba(255,255,255,0.08)' },
        pointLabels: {
          color: '#94a3b8',
          font: { size: 11, family: 'Inter, sans-serif' },
        },
        ticks: { display: false, stepSize: 20 },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-sm)',
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <HeartPulse size={20} color="var(--primary-light)" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: 'Outfit, sans-serif' }}>
              AI Financial Health Score
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              5-Pillar Holistics Radar Breakdown
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.6rem',
            fontWeight: 900,
            color: overall_health_score >= 80 ? '#10b981' : overall_health_score >= 65 ? '#06b6d4' : '#f59e0b'
          }}>
            {overall_health_score}/100
          </div>
          <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}>
            {health_tier}
          </span>
        </div>
      </div>

      <div style={{ height: 260, position: 'relative' }}>
        <Radar data={data} options={options} />
      </div>

      <div className="grid grid-cols-2" style={{ gap: 10, marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
        {[
          { label: 'Savings Score', val: pillars?.savings_score, color: '#6366f1' },
          { label: 'Income Stability', val: pillars?.income_stability, color: '#06b6d4' },
          { label: 'Expense Discipline', val: pillars?.expense_discipline, color: '#10b981' },
          { label: 'Debt Ratio Score', val: pillars?.debt_ratio_score, color: '#f59e0b' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{label}:</span>
            <span style={{ fontWeight: 700, color }}>{val}/100</span>
          </div>
        ))}
      </div>
    </div>
  );
}
