import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Menu, X, ExternalLink, Sparkles, Scale } from 'lucide-react';
import ComplianceModal from './ComplianceModal';

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const scrollToSection = (id) => {
    setMobileOpen(false);
    if (pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo" id="nav-logo">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} color="var(--primary-light)" />
              CredAI
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="navbar-links">
            <li>
              <Link
                to="/"
                id="nav-home"
                className={`navbar-link ${pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="navbar-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                How It Works
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className="navbar-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Features
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => scrollToSection('faq')}
                className="navbar-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                FAQ
              </button>
            </li>
            <li>
              <Link
                to="/apply"
                id="nav-apply"
                className={`navbar-link ${pathname === '/apply' ? 'active' : ''}`}
              >
                Apply
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                id="nav-dashboard"
                className={`navbar-link ${pathname.startsWith('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                id="nav-admin"
                className={`navbar-link ${pathname === '/admin' ? 'active' : ''}`}
              >
                Admin
              </Link>
            </li>
            <li>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="navbar-link"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                API Docs
                <ExternalLink size={12} />
              </a>
            </li>
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setModalType('dpdp')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
            >
              <Scale size={14} color="var(--primary-light)" />
              Governance
            </button>

            <Link to="/apply" className="btn btn-primary btn-sm" id="nav-cta">
              <ShieldCheck size={16} />
              Apply Now
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ padding: 6, display: 'none' }}
              className="mobile-menu-btn"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div
            style={{
              background: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border)',
              padding: '16px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <Link to="/" onClick={() => setMobileOpen(false)} className="navbar-link">Home</Link>
            <button type="button" onClick={() => scrollToSection('how-it-works')} className="navbar-link" style={{ textAlign: 'left', background: 'none', border: 'none' }}>How It Works</button>
            <button type="button" onClick={() => scrollToSection('features')} className="navbar-link" style={{ textAlign: 'left', background: 'none', border: 'none' }}>Features</button>
            <button type="button" onClick={() => scrollToSection('faq')} className="navbar-link" style={{ textAlign: 'left', background: 'none', border: 'none' }}>FAQ</button>
            <Link to="/apply" onClick={() => setMobileOpen(false)} className="navbar-link">Apply</Link>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="navbar-link">My Dashboard</Link>
            <Link to="/admin" onClick={() => setMobileOpen(false)} className="navbar-link">Admin Portal</Link>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="navbar-link">API Documentation ↗</a>
          </div>
        )}
      </nav>

      {/* Policy Modal */}
      <ComplianceModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        policyType={modalType}
      />
    </>
  );
}
