import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ArrowDown, ArrowUp, Zap, Clock } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function ScoreTimeline({ history = [] }) {
  if (!history.length) return (
    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
      No score history available yet.
    </div>
  );

  const labels = history.map(h => h.month);
  const scores = history.map(h => h.risk_score);
  const events = history.map(h => h.event);

  const getGradient = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(99,102,241,0.35)');
    gradient.addColorStop(1, 'rgba(99,102,241,0.02)');
    return gradient;
  };

  const data = {
    labels,
    datasets: [{
      label: 'Risk Score',
      data: scores,
      borderColor: '#6366f1',
      borderWidth: 2.5,
      backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx: canvasCtx, chartArea } = chart;
        if (!chartArea) return 'rgba(99,102,241,0.1)';
        return getGradient(canvasCtx);
      },
      fill: true,
      tension: 0.4,
      pointBackgroundColor: scores.map(s =>
        s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444'
      ),
      pointBorderColor: '#0d0d1f',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 9,
    }],
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
        padding: 12,
        callbacks: {
          label: (ctx) => `Risk Score: ${ctx.parsed.y}/100`,
          afterLabel: (ctx) => events[ctx.dataIndex] ? `📌 ${events[ctx.dataIndex]}` : '',
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
        ticks: { color: '#64748b', font: { size: 11 } },
        border: { display: false },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
        ticks: { color: '#64748b', font: { size: 11 }, stepSize: 25 },
        border: { display: false },
      },
    },
    interaction: { mode: 'index', intersect: false },
    animation: { duration: 900, easing: 'easeOutQuart' },
  };

  return (
    <div id="score-timeline-chart">
      {/* Line Chart */}
      <div style={{ height: 220, position: 'relative', marginBottom: 28 }}>
        <Line data={data} options={options} />
      </div>

      {/* Dynamic Behaviour Timeline Nodes */}
      <div style={{ marginTop: 24 }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--primary-light)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Zap size={14} /> Dynamic Behaviour Event progression
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          paddingBottom: 12,
          gap: 12,
        }}>
          {history.map((h, i) => {
            const prevScore = i > 0 ? history[i - 1].risk_score : h.risk_score;
            const diff = Math.round(h.risk_score - prevScore);
            const isPos = diff > 0;
            const isNeg = diff < 0;

            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {/* Node Box */}
                <div style={{
                  background: 'var(--glass)',
                  border: `1px solid ${isPos ? 'rgba(16,185,129,0.3)' : isNeg ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  minWidth: 160,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {h.month}
                    </span>
                    <span style={{
                      fontWeight: 900,
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '1.1rem',
                      color: h.risk_score >= 75 ? '#10b981' : h.risk_score >= 50 ? '#f59e0b' : '#ef4444',
                    }}>
                      Risk = {Math.round(h.risk_score)}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {h.event || 'Score update'}
                  </div>

                  {i > 0 && diff !== 0 && (
                    <div style={{
                      marginTop: 6,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isPos ? '#34d399' : '#f87171',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      {isPos ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {isPos ? `+${diff}` : diff} pts impact
                    </div>
                  )}
                </div>

                {/* Arrow Connector */}
                {i < history.length - 1 && (
                  <div style={{
                    margin: '0 8px',
                    color: 'var(--text-muted)',
                    fontSize: '1.2rem',
                    fontWeight: 700
                  }}>
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
