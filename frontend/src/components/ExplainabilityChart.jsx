import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function getContribColor(val) {
  if (val >= 8) return 'rgba(16, 185, 129, 0.8)';
  if (val >= 4) return 'rgba(99, 102, 241, 0.75)';
  if (val >= 0) return 'rgba(6, 182, 212, 0.7)';
  return 'rgba(239, 68, 68, 0.75)';
}

export default function ExplainabilityChart({ contributions = [] }) {
  if (!contributions.length) return null;

  // Take top 8 by absolute value
  const top = [...contributions]
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, 8);

  const labels = top.map(c => c.display_name || c.feature);
  const values = top.map(c => c.contribution);
  const colors = values.map(v => getContribColor(v));
  const borderColors = colors.map(c => c.replace('0.8', '1').replace('0.75', '1').replace('0.7', '1'));

  const data = {
    labels,
    datasets: [{
      label: 'Score Contribution',
      data: values,
      backgroundColor: colors,
      borderColor: borderColors,
      borderWidth: 1.5,
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const options = {
    indexAxis: 'y',
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
          label: (ctx) => {
            const val = ctx.parsed.x;
            const item = top[ctx.dataIndex];
            return [
              `Contribution: ${val > 0 ? '+' : ''}${val.toFixed(2)} pts`,
              `Impact: ${item.impact || (val >= 0 ? 'Positive' : 'Negative')}`,
            ];
          },
          afterLabel: (ctx) => {
            const item = top[ctx.dataIndex];
            if (item.description) {
              return `\n${item.description.substring(0, 60)}...`;
            }
            return '';
          },
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
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 11, weight: '500' },
          callback: (val, idx) => {
            const label = labels[idx];
            return label.length > 22 ? label.substring(0, 22) + '…' : label;
          },
        },
        border: { display: false },
      },
    },
    animation: { duration: 800, easing: 'easeOutQuart' },
  };

  return (
    <div id="explainability-chart" style={{ height: Math.max(280, top.length * 42) }}>
      <Bar data={data} options={options} />
    </div>
  );
}
