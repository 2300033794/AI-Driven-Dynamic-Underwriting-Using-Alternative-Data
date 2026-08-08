import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import {
  User, CreditCard, Briefcase, Link2, FileText, CheckCircle2,
  ArrowLeft, ArrowRight, Loader2, AlertCircle, Sparkles, X,
  ShieldCheck, UploadCloud, Info
} from 'lucide-react';
import ComplianceModal from '../components/ComplianceModal';

const STEPS = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Loan Details', icon: CreditCard },
  { id: 3, label: 'Employment', icon: Briefcase },
  { id: 4, label: 'Alternative Data', icon: Link2 },
  { id: 5, label: 'Documents', icon: FileText },
  { id: 6, label: 'Review & Submit', icon: CheckCircle2 },
];

const DEFAULT_FORM = {
  name: '', email: '', phone: '', pan: '', aadhaar: '', dob: '', gender: '', city: '',
  loan_amount: '', loan_purpose: '',
  credit_score: 650, monthly_income: '', existing_loans: 0, emi_burden: 0,
  employment_type: 'Salaried', employer: '', years_experience: 0,
  education_level: '', education_institute: '',
  linkedin_url: '', github_url: '', bill_payment_score: 70,
  upi_transactions_monthly: 20, digital_payment_consistency: 0.75, certifications: 0,
  consent_given: false, data_sharing_consent: 'basic',
};

const DEMO_PRESETS = {
  salaried: {
    name: 'Aditya Sharma', email: 'aditya.sharma@gmail.com', phone: '9876543210',
    pan: 'ABCDE1234F', aadhaar: '1234-5678-9012', dob: '1995-05-15', gender: 'Male', city: 'Bangalore',
    loan_amount: 500000, loan_purpose: 'Personal', monthly_income: 120000, credit_score: 750,
    existing_loans: 1, emi_burden: 15000, employment_type: 'Salaried', employer: 'Google India',
    years_experience: 6, education_level: 'B.Tech', education_institute: 'IIT Bombay',
    linkedin_url: 'https://linkedin.com/in/adityasharma', github_url: 'https://github.com/adityasharma',
    bill_payment_score: 92, upi_transactions_monthly: 65, digital_payment_consistency: 0.95, certifications: 3,
    consent_given: true,
  },
  freelancer: {
    name: 'Rahul Verma', email: 'rahul.verma@yahoo.com', phone: '9812345678',
    pan: 'RVXYZ9876P', aadhaar: '9876-5432-1098', dob: '1998-08-20', gender: 'Male', city: 'Pune',
    loan_amount: 300000, loan_purpose: 'Home Renovation', monthly_income: 75000, credit_score: 620,
    existing_loans: 0, emi_burden: 0, employment_type: 'Freelancer', employer: 'Self-Employed (Full Stack)',
    years_experience: 3.5, education_level: 'B.Sc Computer Science', education_institute: 'Pune University',
    linkedin_url: 'https://linkedin.com/in/rahulverma-dev', github_url: 'https://github.com/rahulverma-dev',
    bill_payment_score: 85, upi_transactions_monthly: 45, digital_payment_consistency: 0.88, certifications: 4,
    consent_given: true,
  },
  student: {
    name: 'Ankit Patel', email: 'ankit.patel@bits.ac.in', phone: '9765432109',
    pan: 'APLMN5432K', aadhaar: '4321-8765-2109', dob: '2002-11-10', gender: 'Male', city: 'Hyderabad',
    loan_amount: 150000, loan_purpose: 'Education', monthly_income: 35000, credit_score: 580,
    existing_loans: 0, emi_burden: 0, employment_type: 'Fresher', employer: 'TCS (Campus Offer)',
    years_experience: 0, education_level: 'B.Tech', education_institute: 'BITS Pilani',
    linkedin_url: 'https://linkedin.com/in/ankitpatel-bits', github_url: 'https://github.com/ankitpatel-bits',
    bill_payment_score: 75, upi_transactions_monthly: 30, digital_payment_consistency: 0.80, certifications: 1,
    consent_given: true,
  },
  fraud_risk: {
    name: 'Vikram Mishra', email: 'v.mishra99@temp-mail.com', phone: '9900011122',
    pan: 'VMISH9999X', aadhaar: '1111-2222-3333', dob: '1990-01-01', gender: 'Male', city: 'Delhi',
    loan_amount: 1500000, loan_purpose: 'Personal', monthly_income: 40000, credit_score: 700,
    existing_loans: 4, emi_burden: 32000, employment_type: 'Self-Employed', employer: 'Business',
    years_experience: 2, education_level: '12th Pass', education_institute: 'School',
    linkedin_url: '', github_url: '',
    bill_payment_score: 40, upi_transactions_monthly: 5, digital_payment_consistency: 0.30, certifications: 0,
    consent_given: true,
  },
};

const LOAN_PURPOSES = ['Home Purchase', 'Vehicle Purchase', 'Education', 'Medical Emergency', 'Home Renovation', 'Startup Capital', 'Business Expansion', 'Debt Consolidation', 'Personal', 'Other'];
const EMPLOYMENT_TYPES = ['Salaried', 'Government Salaried', 'Freelancer', 'Self-Employed', 'Entrepreneur', 'Fresher', 'Unemployed'];
const EDUCATION_LEVELS = ['10th Pass', '12th Pass', 'Diploma', 'B.A', 'B.Com', 'B.Sc', 'B.Sc Computer Science', 'B.Tech', 'M.Ed', 'M.Sc', 'M.Tech', 'MBA', 'PhD'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Kochi', 'Lucknow', 'Surat', 'Other'];

export default function Apply() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalType, setModalType] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({
    aadhaar: null, pan: null, bank: null, income: null
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setNum = (key, val) => setForm(f => ({ ...f, [key]: parseFloat(val) || 0 }));
  const setInt = (key, val) => setForm(f => ({ ...f, [key]: parseInt(val) || 0 }));

  const applyPreset = (presetKey) => {
    if (DEMO_PRESETS[presetKey]) {
      setForm(DEMO_PRESETS[presetKey]);
      setUploadedFiles({
        aadhaar: { name: 'Aadhaar_Card_Verified.pdf', size: '1.2 MB' },
        pan: { name: 'PAN_Card_Front.jpg', size: '850 KB' },
        bank: { name: 'Bank_Statement_3M.pdf', size: '2.4 MB' },
        income: presetKey === 'salaried' ? { name: 'Salary_Slip_Jul2026.pdf', size: '940 KB' } : null
      });
      setError('');
    }
  };

  const handleFileUpload = (key, file) => {
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [key]: { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB` }
      }));
    }
  };

  const removeFile = (key) => {
    setUploadedFiles(prev => ({ ...prev, [key]: null }));
  };

  const F = ({ label, id, required, hint, children }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}{required && <span className="required">*</span>}
      </label>
      {children}
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  );

  const Input = (props) => <input {...props} className="form-input" />;
  const Select = ({ id, value, onChange, children }) => (
    <select id={id} className="form-select" value={value} onChange={onChange}>{children}</select>
  );

  const handleSubmit = async () => {
    if (!form.consent_given) {
      setError('You must provide explicit consent under DPDP Act to submit your application.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        loan_amount: parseFloat(form.loan_amount),
        monthly_income: parseFloat(form.monthly_income),
      };
      const result = await api.submitApplication(payload);
      navigate(`/dashboard/${result.applicant_id}`);
    } catch (e) {
      setError(e.message || 'Something went wrong while submitting. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) return form.name && form.email && form.phone && form.pan && form.gender && form.city;
    if (step === 2) return form.loan_amount && form.loan_purpose && form.monthly_income;
    if (step === 3) return form.employment_type;
    if (step === 6) return form.consent_given;
    return true;
  };

  const StepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: 6 }}>Personal Information</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Your basic personal details as stated in government IDs.</p>
            <div className="form-grid">
              <F label="Full Name" id="name" required>
                <Input id="name" type="text" placeholder="As per Aadhaar / PAN" value={form.name} onChange={e => set('name', e.target.value)} />
              </F>
              <F label="Email Address" id="email" required>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </F>
              <F label="Mobile Number" id="phone" required>
                <Input id="phone" type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </F>
              <F label="PAN Number" id="pan" required hint="Format: ABCDE1234F">
                <Input id="pan" type="text" placeholder="ABCDE1234F" value={form.pan} onChange={e => set('pan', e.target.value.toUpperCase())} maxLength={10} />
              </F>
              <F label="Aadhaar Number" id="aadhaar" required>
                <Input id="aadhaar" placeholder="XXXX-XXXX-XXXX" value={form.aadhaar} onChange={e => set('aadhaar', e.target.value)} maxLength={14} />
              </F>
              <F label="Date of Birth" id="dob" required>
                <Input id="dob" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
              </F>
              <F label="Gender" id="gender" required>
                <Select id="gender" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </Select>
              </F>
              <F label="City" id="city" required>
                <Select id="city" value={form.city} onChange={e => set('city', e.target.value)}>
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </Select>
              </F>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: 6 }}>Loan & Credit Details</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>State your credit requirement and monthly financial inflows.</p>
            <div className="form-grid">
              <F label="Loan Amount (₹)" id="loan_amount" required>
                <Input id="loan_amount" type="number" placeholder="e.g., 500000" value={form.loan_amount} onChange={e => set('loan_amount', e.target.value)} />
              </F>
              <F label="Loan Purpose" id="loan_purpose" required>
                <Select id="loan_purpose" value={form.loan_purpose} onChange={e => set('loan_purpose', e.target.value)}>
                  <option value="">Select loan purpose</option>
                  {LOAN_PURPOSES.map(p => <option key={p}>{p}</option>)}
                </Select>
              </F>
              <F label="Monthly Income (₹)" id="monthly_income" required>
                <Input id="monthly_income" type="number" placeholder="e.g., 80000" value={form.monthly_income} onChange={e => set('monthly_income', e.target.value)} />
              </F>
              <F label="CIBIL / Credit Score" id="credit_score" hint="If unknown, 650 is average baseline">
                <div>
                  <div className="flex justify-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {form.credit_score < 600 ? '⚠️ Poor' : form.credit_score < 700 ? '◯ Average' : form.credit_score < 750 ? '✓ Good' : '★ Excellent'}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{form.credit_score}</span>
                  </div>
                  <input type="range" className="form-range" id="credit_score" min={300} max={900} value={form.credit_score} onChange={e => setInt('credit_score', e.target.value)} />
                </div>
              </F>
              <F label="Number of Active Loans" id="existing_loans">
                <Input id="existing_loans" type="number" min={0} max={10} value={form.existing_loans} onChange={e => setInt('existing_loans', e.target.value)} />
              </F>
              <F label="Total Monthly EMI Burden (₹)" id="emi_burden" hint="Total monthly outflows for active EMIs">
                <Input id="emi_burden" type="number" min={0} value={form.emi_burden} onChange={e => setNum('emi_burden', e.target.value)} />
              </F>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: 6 }}>Employment & Education</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Your professional stability and educational qualifications.</p>
            <div className="form-grid">
              <F label="Employment Type" id="employment_type" required>
                <Select id="employment_type" value={form.employment_type} onChange={e => set('employment_type', e.target.value)}>
                  {EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </Select>
              </F>
              <F label="Employer / Company Name" id="employer">
                <Input id="employer" placeholder="e.g., Google India, Self-Employed" value={form.employer} onChange={e => set('employer', e.target.value)} />
              </F>
              <F label="Years of Experience" id="years_experience">
                <div>
                  <div className="flex justify-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Work experience</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{form.years_experience} yrs</span>
                  </div>
                  <input type="range" className="form-range" id="years_experience" min={0} max={30} step={0.5} value={form.years_experience} onChange={e => setNum('years_experience', e.target.value)} />
                </div>
              </F>
              <F label="Highest Education Level" id="education_level">
                <Select id="education_level" value={form.education_level} onChange={e => set('education_level', e.target.value)}>
                  <option value="">Select qualification</option>
                  {EDUCATION_LEVELS.map(l => <option key={l}>{l}</option>)}
                </Select>
              </F>
              <F label="College / University" id="education_institute" hint="Institutes like IIT/BITS/NIT boost your score">
                <Input id="education_institute" placeholder="e.g., IIT Bombay, BITS Pilani" value={form.education_institute} onChange={e => set('education_institute', e.target.value)} />
              </F>
              <F label="Professional Certifications" id="certifications" hint="AWS, CFA, PMP, Docker etc.">
                <div>
                  <div className="flex justify-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Number of certs</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{form.certifications}</span>
                  </div>
                  <input type="range" className="form-range" id="certifications" min={0} max={10} value={form.certifications} onChange={e => setInt('certifications', e.target.value)} />
                </div>
              </F>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: 6 }}>Alternative Data Signals</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
              Alternative data signals carry 60% weight in CredAI’s scoring engine.
            </p>
            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              <Info size={16} />
              <span>All alternative data processing strictly complies with India’s DPDP Act 2023.</span>
            </div>
            <div className="form-grid">
              <F label="LinkedIn Profile URL" id="linkedin_url" hint="+8 to +12 pts score boost for active profile">
                <Input id="linkedin_url" type="url" placeholder="https://linkedin.com/in/username" value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} />
              </F>
              <F label="GitHub Profile URL" id="github_url" hint="+5 to +10 pts score boost for technical activity">
                <Input id="github_url" type="url" placeholder="https://github.com/username" value={form.github_url} onChange={e => set('github_url', e.target.value)} />
              </F>
            </div>
            <div className="form-grid" style={{ marginTop: 16 }}>
              <F label="Bill Payment Discipline Score" id="bill_payment_score" hint="80+ = Excellent, 60-80 = Good">
                <div>
                  <div className="flex justify-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {form.bill_payment_score >= 90 ? 'Excellent' : form.bill_payment_score >= 75 ? 'Good' : form.bill_payment_score >= 60 ? 'Average' : 'Poor'}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{form.bill_payment_score}/100</span>
                  </div>
                  <input type="range" className="form-range" id="bill_payment_score" min={0} max={100} value={form.bill_payment_score} onChange={e => setNum('bill_payment_score', e.target.value)} />
                </div>
              </F>
              <F label="Monthly UPI Digital Transactions" id="upi_transactions" hint="Higher digital frequency indicates liquidity">
                <div>
                  <div className="flex justify-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly volume</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{form.upi_transactions_monthly} transactions</span>
                  </div>
                  <input type="range" className="form-range" id="upi_transactions" min={0} max={120} value={form.upi_transactions_monthly} onChange={e => setInt('upi_transactions_monthly', e.target.value)} />
                </div>
              </F>
              <F label="Payment Consistency" id="consistency" hint="Frequency of on-time payments">
                <div>
                  <div className="flex justify-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {form.digital_payment_consistency >= 0.9 ? 'Highly Consistent' : form.digital_payment_consistency >= 0.7 ? 'Consistent' : 'Irregular'}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{Math.round(form.digital_payment_consistency * 100)}%</span>
                  </div>
                  <input type="range" className="form-range" id="consistency" min={0} max={1} step={0.01} value={form.digital_payment_consistency} onChange={e => setNum('digital_payment_consistency', e.target.value)} />
                </div>
              </F>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: 6 }}>Document Upload & Verification</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Upload required proof documents (PDF, JPG, PNG up to 5MB).</p>

            {[
              { key: 'aadhaar', label: 'Aadhaar Card (Front & Back)', required: true, hint: 'Government Identity Proof' },
              { key: 'pan', label: 'PAN Card', required: true, hint: 'Taxpayer Identification Number' },
              { key: 'bank', label: 'Last 3 Months Bank Statement', required: true, hint: 'PDF export from Net Banking' },
              { key: 'income', label: 'Latest Salary Slip / ITR Statement', required: false, hint: 'Optional income verification' },
            ].map(({ key, label, required, hint }) => {
              const fileObj = uploadedFiles[key];
              return (
                <div key={key} className="form-group" style={{ marginBottom: 18 }}>
                  <label className="form-label">
                    {label}{required && <span className="required">*</span>}
                  </label>
                  {fileObj ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px', background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CheckCircle2 size={20} color="var(--accent-green)" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{fileObj.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fileObj.size} • Uploaded & Encrypted</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeFile(key)}
                        style={{ padding: 4, color: 'var(--text-muted)' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        border: '2px dashed var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '24px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'var(--bg-input)',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--bg-input-focus)'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-input)'; }}
                    >
                      <input
                        type="file"
                        id={`file-${key}`}
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        onChange={e => handleFileUpload(key, e.target.files[0])}
                      />
                      <label htmlFor={`file-${key}`} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <UploadCloud size={28} color="var(--primary-light)" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Click to select file or drag and drop
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );

      case 6:
        return (
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: 6 }}>Review & Submit Application</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Review all parameters prior to AI risk score calculation.</p>

            {[
              {
                title: 'Personal Info',
                items: [
                  ['Name', form.name], ['Email', form.email], ['Phone', form.phone],
                  ['PAN', form.pan], ['Gender', form.gender], ['City', form.city],
                ],
              },
              {
                title: 'Loan Request',
                items: [
                  ['Loan Amount', `₹${Number(form.loan_amount || 0).toLocaleString()}`],
                  ['Purpose', form.loan_purpose],
                  ['Monthly Income', `₹${Number(form.monthly_income || 0).toLocaleString()}`],
                  ['CIBIL Score', form.credit_score],
                  ['Active Loans', form.existing_loans],
                  ['EMI Burden', `₹${form.emi_burden}`],
                ],
              },
              {
                title: 'Professional Details',
                items: [
                  ['Employment', form.employment_type], ['Employer', form.employer || '—'],
                  ['Experience', `${form.years_experience} yrs`], ['Education', form.education_level || '—'],
                  ['Institute', form.education_institute || '—'], ['Certifications', form.certifications],
                ],
              },
              {
                title: 'Alternative Signals',
                items: [
                  ['LinkedIn', form.linkedin_url ? '✓ Attached' : '— Not provided'],
                  ['GitHub', form.github_url ? '✓ Attached' : '— Not provided'],
                  ['Bill Discipline', `${form.bill_payment_score}/100`],
                  ['UPI Transactions', `${form.upi_transactions_monthly}/mo`],
                  ['Payment Consistency', `${Math.round(form.digital_payment_consistency * 100)}%`],
                ],
              },
            ].map(({ title, items }) => (
              <div key={title} className="card" style={{ marginBottom: 16, padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--primary-light)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
                <div className="form-grid">
                  {items.map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>{v || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Consent & Policies */}
            <div className="card" style={{ border: form.consent_given ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border)', padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} color="var(--accent-green-light)" />
                DPDP Statutory Consent & Data Protection
              </div>
              <label htmlFor="consent_given" style={{ display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'flex-start', marginBottom: 14 }}>
                <input
                  type="checkbox"
                  id="consent_given"
                  checked={form.consent_given}
                  onChange={e => set('consent_given', e.target.checked)}
                  style={{ marginTop: 3, accentColor: 'var(--primary)', width: 18, height: 18, flexShrink: 0 }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  I explicitly consent to CredAI processing my personal, financial, and alternative data for loan decisioning and fraud assessment in full compliance with DPDP Act 2023.
                  <span className="required">*</span>
                </span>
              </label>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={() => setModalType('dpdp')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>
                  Read DPDP Privacy Policy
                </button>
                <button type="button" onClick={() => setModalType('rbi')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>
                  Read RBI Lending Norms
                </button>
                <button type="button" onClick={() => setModalType('explainability')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>
                  Explainability Standard
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ marginTop: 16 }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container-sm" style={{ padding: '40px 24px 80px' }}>

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: 8 }}>
            Loan Application
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Instant AI credit decision with 100% transparent SHAP explanations.
          </p>
        </div>

        {/* Quick Demo Pre-fill Presets Bar */}
        <div className="card" style={{ marginBottom: 28, padding: 18, background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-light)' }}>
            <Sparkles size={16} />
            1-Click Demo Profiles (Pre-fill Form)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('salaried')}>
              👨‍💻 Tech Salaried (Approved)
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('freelancer')}>
              💻 Freelancer (Alt-Data Boost)
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('student')}>
              🎓 BITS Graduate (Review)
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => applyPreset('fraud_risk')}>
              🚨 Fraud Risk Case
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, overflowX: 'auto', paddingBottom: 6 }}>
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = s.id < step;
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  minWidth: 56,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: isDone ? 'var(--accent-green)' : isActive ? 'var(--primary)' : 'var(--glass)',
                    border: `2px solid ${isDone ? 'var(--accent-green)' : isActive ? 'var(--primary)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive ? 'var(--shadow-primary)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {isDone
                      ? <CheckCircle2 size={18} color="white" />
                      : <Icon size={16} color={isActive ? 'white' : 'var(--text-muted)'} />
                    }
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: isActive ? 'var(--primary-light)' : 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 400 }}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 2,
                    background: s.id < step ? 'var(--accent-green)' : 'var(--border)',
                    margin: '0 4px', marginBottom: 18,
                    transition: 'background 0.2s',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="card" style={{ marginBottom: 24, padding: 32 }}>
          <StepContent />
        </div>

        {/* Nav Controls */}
        <div className="flex justify-between" style={{ gap: 12 }}>
          <button
            className="btn btn-secondary"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1 || loading}
            id="btn-prev"
          >
            <ArrowLeft size={16} />
            Previous Step
          </button>

          {step < 6 ? (
            <button
              className="btn btn-primary"
              onClick={() => setStep(s => s + 1)}
              disabled={!isStepValid()}
              id="btn-next"
            >
              Continue to Step {step + 1}
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={loading || !form.consent_given}
              id="btn-submit"
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
                  Calculating AI Risk Score...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Submit & Get Instant Decision
                </>
              )}
            </button>
          )}
        </div>
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
