import React, { useState } from 'react';
import {
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  Mail,
  Phone,
  Shield,
  User,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ pageTitle }) => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const profileDetails = [
    { label: 'Full name', value: user?.full_name, icon: User },
    { label: 'Username', value: user?.username ? `@${user.username}` : null, icon: User },
    { label: 'Email', value: user?.email, icon: Mail },
    { label: 'Phone', value: user?.phone, icon: Phone },
    { label: 'Job title', value: user?.job_title, icon: Briefcase },
    { label: 'Organization', value: user?.organization, icon: Building2 },
    { label: 'Department', value: user?.department, icon: Building2 },
    { label: 'Access role', value: user?.role, icon: BadgeCheck },
    {
      label: 'Account created',
      value: user?.created_at ? new Date(user.created_at).toLocaleString() : null,
      icon: CalendarDays,
    },
    {
      label: 'Last login',
      value: user?.last_login ? new Date(user.last_login).toLocaleString() : 'No previous login',
      icon: CalendarDays,
    },
  ];

  return (
    <>
      <header className="topbar">
        <div className="topbar-title">
          <h2>{pageTitle}</h2>
        </div>

        <div className="topbar-actions">
        <div className="system-status-indicator">
          <span className="status-dot"></span>
          <span>ThreatLens AI: Guard Online</span>
        </div>

          <div className="user-profile-badge">
            <button
              type="button"
              className="profile-summary-button"
              onClick={() => setProfileOpen(true)}
              aria-label="View my profile details"
            >
              <span className="avatar">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
              <span className="user-meta">
                <span className="user-name">{user?.full_name || user?.username}</span>
                <span className="user-role-label">{user?.role}</span>
              </span>
            </button>
            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: '10px', padding: '6px 10px', fontSize: '0.75rem' }}
              title="Logout"
              aria-label="Log out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {profileOpen && (
        <div className="modal-overlay" onClick={() => setProfileOpen(false)}>
          <section
            className="modal-content profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                <User size={20} color="#087c91" />
                <span id="profile-modal-title">My registered details</span>
              </div>
              <button
                type="button"
                className="profile-modal-close"
                onClick={() => setProfileOpen(false)}
                aria-label="Close profile details"
              >
                <X size={18} />
              </button>
            </div>
            <div className="profile-modal-identity">
              <div className="profile-modal-avatar">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3>{user?.full_name || user?.username || 'User'}</h3>
                <p>{user?.role || 'Employee'}{user?.department ? ` · ${user.department}` : ''}</p>
              </div>
            </div>
            <div className="profile-details-grid">
              {profileDetails.map(({ label, value, icon: Icon }) => (
                <div className="profile-detail" key={label}>
                  <span className="profile-detail-icon"><Icon size={15} /></span>
                  <div>
                    <span className="profile-detail-label">{label}</span>
                    <span className="profile-detail-value">{value || 'Not provided'}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <span className="profile-readonly-note">
                These details are loaded from your registered account.
              </span>
              <button type="button" className="btn btn-primary" onClick={() => setProfileOpen(false)}>
                Done
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
};
