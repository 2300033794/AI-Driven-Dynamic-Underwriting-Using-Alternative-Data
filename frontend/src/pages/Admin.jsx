import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ComplianceModal from '../components/ComplianceModal';
import {
  BarChart2, Users, AlertTriangle, CheckCircle2, Clock,
  XCircle, ExternalLink, Filter, RefreshCw, Loader2,
  ShieldOff, TrendingUp, Download, Scale, Eye
} from 'lucide-react';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function StatusDonut({ data }) {
  const chartData = {
    labels: ['Approved', 'Rejected', 'Review'],
    datasets: [{
      data: [data.approved || 0, data.rejected || 0, data.review || 0],
      backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(239,68,68,0.8)', 'rgba(245,158,11,0.8)'],
      borderColor: ['#10b981', '#ef4444', '#f59e0b'],
      borderWidth: 2,
      hoverOffset: 4,
    }],
  };
  return (
    <div style={{ width: 180, height: 180 }}>
      <Doughnut data={chartData} options={{
        plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(13,13,31,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 } },
        cutout: '68%',
        animation: { duration: 800 },
      }} />
    </div>
  );
}

function EmploymentChart({ data }) {
  const chartData = {
    labels: data.map(d => d.employment_type),
    datasets: [{
      label: 'Applications',
      data: data.map(d => d.count),
      backgroundColor: 'rgba(99,102,241,0.7)',
      borderColor: '#6366f1',
      borderWidth: 1.5,
      borderRadius: 6,
    }, {
      label: 'Avg Risk Score',
      data: data.map(d => Math.round(d.avg_score)),
      backgroundColor: 'rgba(6,182,212,0.5)',
      borderColor: '#06b6d4',
      borderWidth: 1.5,
      borderRadius: 6,
    }],
  };
  return (
    <div style={{ height: 200 }}>
      <Bar data={chartData} options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
          tooltip: { backgroundColor: 'rgba(13,13,31,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 },
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 10 } }, border: { display: false } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 10 } }, border: { display: false } },
        },
        animation: { duration: 800 },
      }} />
    </div>
  );
}

export default function Admin() {
  const [analytics, setAnalytics] = useState(null);
  const [apps, setApps] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', fraud_risk: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [updatingId, setUpdatingId] = useState(null);
  const [modalType, setModalType] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [analyticsData, appsData] = await Promise.all([
        api.getAnalytics(),
        api.getAdminApplications(filter),
      ]);
      setAnalytics(analyticsData);
      setApps(appsData.applications);
      setTotal(appsData.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.updateStatus(id, status);
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    if (!apps.length) return;
    const headers = ['Applicant ID', 'Name', 'Email', 'Phone', 'City', 'Loan Amount', 'Purpose', 'CIBIL', 'AI Score', 'Fraud Risk', 'Status'];
    const rows = apps.map(a => [
      a.applicant_id,
      `"${a.name}"`,
      a.email,
      a.phone,
      a.city,
      a.loan_amount,
      `"${a.loan_purpose}"`,
      a.credit_score,
      a.risk_score,
      a.fraud_risk,
      a.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CredAI_Applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ScoreBadge = ({ score }) => (
    <span style={{
      fontWeight: 700,
      fontSize: '0.875rem',
      color: score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444',
    }}>
      {score?.toFixed(0)}/100
    </span>
  );

  const fraudColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '40px 24px 80px' }}>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 4 }}>
              Admin Control Center
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              AI Underwriting & Risk Management • {total} total applications
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={exportCSV} title="Export CSV Data">
              <Download size={14} />
              Export CSV
            </button>

            <button className="btn btn-ghost btn-sm" onClick={() => setModalType('rbi')}>
              <Scale size={14} color="var(--primary-light)" />
              RBI Compliance
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={load}
              disabled={loading}
              id="btn-refresh"
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs" style={{ marginBottom: 28 }}>
          {[
            { key: 'dashboard', label: '📊 Risk Analytics' },
            { key: 'applications', label: '📋 Application Registry' },
            { key: 'fraud', label: '🚨 Fraud Audit Alerts' },
          ].map(({ key, label }) => (
            <button key={key} className={`tab ${activeTab === key ? 'active' : ''}`} id={`admin-tab-${key}`} onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Analytics Tab ──────────────────────────────────────── */}
        {activeTab === 'dashboard' && analytics && (
          <div>
            {/* Summary Stat Cards */}
            <div className="grid grid-cols-4" style={{ gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Applications', value: analytics.summary.total_applications, icon: Users, color: '#6366f1' },
                { label: 'Approval Rate', value: `${analytics.summary.approval_rate}%`, icon: CheckCircle2, color: '#10b981' },
                { label: 'Avg Risk Score', value: `${analytics.summary.avg_risk_score}/100`, icon: TrendingUp, color: '#06b6d4' },
                { label: 'Fraud Rate', value: `${analytics.summary.fraud_rate}%`, icon: ShieldOff, color: '#ef4444' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="stat-card" id={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={color} />
                    </div>
                    <span className="stat-label">{label}</span>
                  </div>
                  <div className="stat-value text-gradient">{value}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2" style={{ gap: 20, marginBottom: 20 }}>
              {/* Status Donut */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>Decision Portfolio Distribution</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <StatusDonut data={analytics.status_distribution} />
                  <div style={{ flex: 1 }}>
                    {[
                      { label: 'Approved', key: 'approved', color: '#10b981' },
                      { label: 'Rejected', key: 'rejected', color: '#ef4444' },
                      { label: 'Under Review', key: 'review', color: '#f59e0b' },
                    ].map(({ label, key, color }) => {
                      const count = analytics.status_distribution[key] || 0;
                      const pct = Math.round((count / (analytics.summary.total_applications || 1)) * 100);
                      return (
                        <div key={key} style={{ marginBottom: 12 }}>
                          <div className="flex justify-between" style={{ marginBottom: 4, fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                              {label}
                            </span>
                            <span style={{ fontWeight: 700, color }}>{count} ({pct}%)</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Fraud Distribution */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>Fraud Severity Breakdown</div>
                {['high', 'medium', 'low'].map(risk => {
                  const count = analytics.fraud_distribution[risk] || 0;
                  const pct = Math.round((count / (analytics.summary.total_applications || 1)) * 100);
                  const color = fraudColors[risk];
                  return (
                    <div key={risk} style={{ marginBottom: 14 }}>
                      <div className="flex justify-between" style={{ marginBottom: 4, fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={`badge badge-fraud-${risk}`}>{risk.toUpperCase()} RISK</span>
                        </div>
                        <span style={{ fontWeight: 700, color }}>{count} ({pct}%)</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}

                <div className="divider" />
                <div style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Risk Score Buckets</div>
                {Object.entries(analytics.score_buckets || {}).map(([bucket, count]) => (
                  <div key={bucket} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{bucket}</span>
                    <span style={{ fontWeight: 600 }}>{count} applicants</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Employment Breakdown */}
            {analytics.employment_breakdown?.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>Applications & Average Score by Employment Type</div>
                <EmploymentChart data={analytics.employment_breakdown} />
              </div>
            )}
          </div>
        )}

        {/* ── Applications Tab ───────────────────────────────────── */}
        {activeTab === 'applications' && (
          <div>
            {/* Filter controls */}
            <div className="flex items-center gap-3" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
              <Filter size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Quick Filters:</span>
              {[
                { key: 'status', options: [{ val: '', label: 'All Statuses' }, { val: 'approved', label: 'Approved' }, { val: 'rejected', label: 'Rejected' }, { val: 'review', label: 'Under Review' }] },
                { key: 'fraud_risk', options: [{ val: '', label: 'All Fraud Risk Levels' }, { val: 'high', label: 'High Risk' }, { val: 'medium', label: 'Medium Risk' }, { val: 'low', label: 'Clean / Low Risk' }] },
              ].map(({ key, options }) => (
                <select
                  key={key}
                  id={`filter-${key}`}
                  className="form-select"
                  style={{ width: 'auto', padding: '6px 14px', fontSize: '0.875rem' }}
                  value={filter[key]}
                  onChange={e => setFilter(f => ({ ...f, [key]: e.target.value }))}
                >
                  {options.map(({ val, label }) => <option key={val} value={val}>{label}</option>)}
                </select>
              ))}

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setFilter({ status: '', fraud_risk: '' })}
                style={{ fontSize: '0.8rem' }}
              >
                Reset Filters
              </button>

              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                Displaying {apps.length} of {total} records
              </span>
            </div>

            {/* Applications Table */}
            <div className="table-wrap">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 8px', display: 'block' }} />
                  Fetching applicant records...
                </div>
              ) : (
                <table className="table" id="applications-table">
                  <thead>
                    <tr>
                      <th>Applicant Profile</th>
                      <th>Loan Request</th>
                      <th>CIBIL</th>
                      <th>AI Risk Score</th>
                      <th>Fraud Flag</th>
                      <th>Decision</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map(app => (
                      <tr key={app.applicant_id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{app.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.employment_type} • {app.city}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>₹{Number(app.loan_amount).toLocaleString()}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.loan_purpose}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{app.credit_score}</td>
                        <td><ScoreBadge score={app.risk_score} /></td>
                        <td>
                          <span className={`badge badge-fraud-${app.fraud_risk}`} style={{ fontSize: '0.7rem' }}>
                            {app.fraud_risk}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${app.status}`} style={{ fontSize: '0.7rem' }}>
                            {app.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                            <Link
                              to={`/dashboard/${app.applicant_id}`}
                              className="btn btn-ghost btn-sm"
                              id={`view-${app.applicant_id.substring(0, 8)}`}
                              style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                            >
                              <Eye size={12} />
                              View
                            </Link>
                            {app.status !== 'approved' && (
                              <button
                                className="btn btn-sm"
                                onClick={() => handleStatusUpdate(app.applicant_id, 'approved')}
                                disabled={updatingId === app.applicant_id}
                                id={`approve-${app.applicant_id.substring(0, 8)}`}
                                style={{ fontSize: '0.8rem', padding: '4px 10px', background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
                              >
                                {updatingId === app.applicant_id ? <Loader2 size={10} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle2 size={10} />}
                                Approve
                              </button>
                            )}
                            {app.status !== 'rejected' && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleStatusUpdate(app.applicant_id, 'rejected')}
                                disabled={updatingId === app.applicant_id}
                                id={`reject-${app.applicant_id.substring(0, 8)}`}
                                style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                              >
                                <XCircle size={10} />
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {apps.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                          No applications matched the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── Fraud Alerts Tab ────────────────────────────────────── */}
        {activeTab === 'fraud' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { risk: 'high', label: 'High Risk Flagged', count: analytics?.fraud_distribution?.high || 0, color: '#ef4444', icon: ShieldOff },
                { risk: 'medium', label: 'Medium Anomaly', count: analytics?.fraud_distribution?.medium || 0, color: '#f59e0b', icon: AlertTriangle },
                { risk: 'low', label: 'Clean / Passed Audit', count: analytics?.fraud_distribution?.low || 0, color: '#10b981', icon: CheckCircle2 },
              ].map(({ risk, label, count, color, icon: Icon }) => (
                <div key={risk} className="stat-card" id={`fraud-stat-${risk}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Icon size={16} color={color} />
                    <span className="stat-label">{label}</span>
                  </div>
                  <div className="stat-value" style={{ color }}>{count}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>🚨 Fraud Anomaly Audit Register</div>
              {apps.filter(a => a.fraud_risk !== 'low').length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--accent-green-light)', padding: '40px', fontSize: '0.9375rem' }}>
                  <CheckCircle2 size={36} style={{ margin: '0 auto 10px', display: 'block' }} />
                  No active fraud alerts detected across current view.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {apps.filter(a => a.fraud_risk !== 'low').map(app => (
                    <div key={app.applicant_id} style={{
                      padding: '18px',
                      background: app.fraud_risk === 'high' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
                      border: `1px solid ${app.fraud_risk === 'high' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.2)'}`,
                      borderRadius: 'var(--radius-md)',
                    }}>
                      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{app.name}</div>
                          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            PAN: {app.pan} • Loan Request: ₹{Number(app.loan_amount).toLocaleString()} • City: {app.city}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span className={`badge badge-fraud-${app.fraud_risk}`}>{app.fraud_risk} risk</span>
                          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                            Fraud Probability: {Math.round((app.fraud_score || 0) * 100)}%
                          </span>
                          <Link
                            to={`/dashboard/${app.applicant_id}`}
                            className="btn btn-sm btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                          >
                            <ExternalLink size={12} />
                            Investigate Case
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Compliance Modal */}
      <ComplianceModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        policyType={modalType}
      />
    </div>
  );
}
