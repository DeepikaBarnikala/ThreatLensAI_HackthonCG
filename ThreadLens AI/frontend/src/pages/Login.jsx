import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Shield,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const demoAccounts = [
  { roleKey: 'admin', username: 'admin', title: 'Sarah Chen', role: 'Admin / CISO' },
  { roleKey: 'secmanager', username: 'secmanager', title: 'Marcus Vance', role: 'Security Manager' },
  { roleKey: 'itadmin', username: 'itadmin', title: 'Alex Rivera', role: 'IT Administrator' },
  { roleKey: 'employee', username: 'employee', title: 'Emma Watson', role: 'Employee / Staff' },
];

export const Login = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(
    () => window.location.pathname === '/register' ? 'register' : 'login'
  );
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordInput = useRef(null);

  useEffect(() => {
    const handlePopState = () => {
      setMode(window.location.pathname === '/register' ? 'register' : 'login');
      setError('');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const changeMode = (nextMode) => {
    const nextPath = nextMode === 'register' ? '/register' : '/login';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setMode(nextMode);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (mode === 'register' && password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await register({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          job_title: jobTitle.trim() || null,
          organization: organization.trim() || null,
          username: username.trim(),
          password,
        });
      } else {
        await login(username.trim(), password);
      }
    } catch (requestError) {
      const detail = requestError.response?.data?.detail;
      const fallback = mode === 'register' ? 'Could not create your account.' : 'Invalid username or password.';
      setError(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((issue) => issue.msg).join('. ')
            : fallback
      );
    } finally {
      setLoading(false);
    }
  };

  const selectDemoAccount = (roleKey) => {
    const account = demoAccounts.find((demoAccount) => demoAccount.roleKey === roleKey);
    if (!account) return;
    setUsername(account.username);
    setPassword('');
    setError('');
    passwordInput.current?.focus();
  };

  const isRegister = mode === 'register';

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-intro" aria-label="ThreatLens AI overview">
          <div className="auth-brand">
            <span className="auth-brand-mark"><Shield size={25} strokeWidth={2.2} /></span>
            <span>
              <strong>ThreatLens AI</strong>
              <small>Security operations, made clear</small>
            </span>
          </div>

          <div className="auth-intro-copy">
            <span className="auth-eyebrow"><Sparkles size={14} /> AI-POWERED SECURITY OPERATIONS</span>
            <h1>See threats sooner.<br /><span>Respond with confidence.</span></h1>
            <p>
              A practical security command center for teams that need clear signals,
              faster incident response, and less noise.
            </p>
          </div>

          <div className="auth-feature-list">
            <div><CheckCircle2 size={18} /><span>Spot unusual sign-ins and suspicious activity</span></div>
            <div><CheckCircle2 size={18} /><span>Analyze phishing reports with AI assistance</span></div>
            <div><CheckCircle2 size={18} /><span>Keep incidents, devices, and policies together</span></div>
          </div>

          {!isRegister && (
            <div className="auth-demo">
              <div className="auth-demo-heading">
                <span>Explore the demo</span>
                <small>Choose a workspace role</small>
              </div>
              <div className="auth-demo-grid">
                {demoAccounts.map((account) => (
                  <button
                    className="auth-demo-card"
                    key={account.roleKey}
                    type="button"
                    disabled={loading}
                    onClick={() => selectDemoAccount(account.roleKey)}
                  >
                    <span>{account.role}</span>
                    <small>{account.title} · Select account</small>
                  </button>
                ))}
              </div>
              <p className="auth-demo-note">Demo password: <code>Admin@123</code></p>
            </div>
          )}

          <div className="auth-intro-footer">
            <span className="auth-online-dot" /> Built for focused, human-led security
          </div>
        </section>

        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-panel-topline">
            <span className="auth-secure-label"><Lock size={13} /> SECURE ACCESS</span>
            <span className="auth-step">{isRegister ? '01 / 01' : 'WELCOME BACK'}</span>
          </div>

          <div className="auth-heading">
            <h2 id="auth-title">{isRegister ? 'Create your account' : 'Sign in to your workspace'}</h2>
            <p>
              {isRegister
                ? 'Set up your ThreatLens account to get started.'
                : 'Enter your credentials to continue to ThreatLens AI.'}
            </p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="auth-field">
                <label htmlFor="full-name">Full name</label>
                <div className="auth-input-wrap">
                  <User size={17} aria-hidden="true" />
                  <input
                    id="full-name"
                    autoComplete="name"
                    type="text"
                    placeholder="Your name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    disabled={loading}
                    required
                    maxLength={255}
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div className="auth-field">
                <label htmlFor="email">Work email</label>
                <div className="auth-input-wrap">
                  <Mail size={17} aria-hidden="true" />
                  <input
                    id="email"
                    autoComplete="email"
                    type="email"
                    placeholder="you@organization.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div className="auth-field">
                <label htmlFor="phone">Phone number <span className="auth-optional-label">Optional</span></label>
                <div className="auth-input-wrap">
                  <Phone size={17} aria-hidden="true" />
                  <input
                    id="phone"
                    autoComplete="tel"
                    type="tel"
                    placeholder="+1 555 0100"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    disabled={loading}
                    maxLength={50}
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div className="auth-field">
                <label htmlFor="job-title">Job title <span className="auth-optional-label">Optional</span></label>
                <div className="auth-input-wrap">
                  <Briefcase size={17} aria-hidden="true" />
                  <input
                    id="job-title"
                    autoComplete="organization-title"
                    type="text"
                    placeholder="e.g. Security Analyst"
                    value={jobTitle}
                    onChange={(event) => setJobTitle(event.target.value)}
                    disabled={loading}
                    maxLength={150}
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div className="auth-field">
                <label htmlFor="organization">Organization <span className="auth-optional-label">Optional</span></label>
                <div className="auth-input-wrap">
                  <Building2 size={17} aria-hidden="true" />
                  <input
                    id="organization"
                    autoComplete="organization"
                    type="text"
                    placeholder="Your organization"
                    value={organization}
                    onChange={(event) => setOrganization(event.target.value)}
                    disabled={loading}
                    maxLength={200}
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="username">{isRegister ? 'Username' : 'Username or email'}</label>
              <div className="auth-input-wrap">
                {isRegister ? <User size={17} aria-hidden="true" /> : <Mail size={17} aria-hidden="true" />}
                <input
                  id="username"
                  autoComplete={isRegister ? 'username' : 'username'}
                  type="text"
                  placeholder={isRegister ? 'Choose a username' : 'you@organization.com'}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  disabled={loading}
                  required
                  minLength={isRegister ? 3 : undefined}
                  maxLength={100}
                  pattern={isRegister ? '[A-Za-z0-9._-]+' : undefined}
                />
              </div>
              {isRegister && <small className="auth-field-hint">3+ characters; letters, numbers, dots, _ or -</small>}
            </div>

            {isRegister && (
              <div className="auth-field">
                <label htmlFor="department">Account type</label>
                <div className="auth-input-wrap auth-input-readonly">
                  <Building2 size={17} aria-hidden="true" />
                  <input id="department" type="text" value="Employee · General" readOnly />
                  <span className="auth-readonly-tag">STANDARD</span>
                </div>
                <small className="auth-field-hint">An administrator can update access if needed.</small>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrap">
                <Lock size={17} aria-hidden="true" />
                <input
                  id="password"
                  ref={passwordInput}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  required
                  minLength={isRegister ? 8 : undefined}
                  maxLength={72}
                />
              </div>
              {isRegister && <small className="auth-field-hint">Use at least 8 characters.</small>}
            </div>

            {isRegister && (
              <div className="auth-field">
                <label htmlFor="confirm-password">Confirm password</label>
                <div className="auth-input-wrap">
                  <Lock size={17} aria-hidden="true" />
                  <input
                    id="confirm-password"
                    autoComplete="new-password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={loading}
                    required
                    minLength={8}
                    maxLength={72}
                  />
                </div>
              </div>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              <span>{loading ? (isRegister ? 'Creating account…' : 'Signing in…') : (isRegister ? 'Create account' : 'Sign in securely')}</span>
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="auth-switch">
            {isRegister ? 'Already have an account?' : 'New to ThreatLens AI?'}
            <button type="button" onClick={() => changeMode(isRegister ? 'login' : 'register')} disabled={loading}>
              {isRegister ? 'Sign in' : 'Create an account'}
            </button>
          </div>

          <div className="auth-privacy-note">
            <Shield size={15} />
            <span>Your account is stored securely in the organization database.</span>
          </div>
        </section>
      </div>
      <footer className="auth-page-footer">THREATLENS AI <span>·</span> SECURITY OPERATIONS PLATFORM</footer>
    </main>
  );
};
