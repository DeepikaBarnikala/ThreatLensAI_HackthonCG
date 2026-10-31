import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { LoginMonitoring } from './pages/LoginMonitoring';
import { Alerts } from './pages/Alerts';
import { PhishingDetection } from './pages/PhishingDetection';
import { Incidents } from './pages/Incidents';
import { AIAssistant } from './pages/AIAssistant';
import { Devices } from './pages/Devices';
import { Policies } from './pages/Policies';
import { Reports } from './pages/Reports';
import { UserManagement } from './pages/UserManagement';

export const MainApp = () => {
  const { user, isAuthenticated, loading, hasRole } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const pageRoles = {
    dashboard: ['Employee', 'IT Administrator', 'Security Manager', 'Admin'],
    logs: ['IT Administrator', 'Security Manager', 'Admin'],
    alerts: ['IT Administrator', 'Security Manager', 'Admin'],
    phishing: ['Employee', 'IT Administrator', 'Security Manager', 'Admin'],
    incidents: ['IT Administrator', 'Security Manager', 'Admin'],
    'ai-assistant': ['Employee', 'IT Administrator', 'Security Manager', 'Admin'],
    devices: ['Employee', 'IT Administrator', 'Security Manager', 'Admin'],
    policies: ['IT Administrator', 'Security Manager', 'Admin'],
    reports: ['Security Manager', 'Admin'],
    users: ['Admin']
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a1024',
        color: '#94a3b8'
      }}>
        Loading ThreatLens AI Platform...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const canAccessPage = (page) => hasRole(pageRoles[page] || []);
  const activePage = canAccessPage(currentPage) ? currentPage : 'dashboard';
  const navigateToPage = (page) => {
    if (canAccessPage(page)) {
      setCurrentPage(page);
    }
  };

  const pageTitles = {
    dashboard: 'Security Operations Dashboard',
    logs: 'Login Activity & Anomaly Monitoring',
    alerts: 'Security Alert Management & AI Triage',
    phishing: 'AI Phishing Email Detection',
    incidents: 'Incident Response & NIST Guidance',
    'ai-assistant': 'AI Security Copilot & Advisory',
    devices: 'Authorized Device & Endpoint Registry',
    policies: 'Security Policy Management',
    reports: 'Executive Management Security Reports',
    users: 'Organizational User Management'
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateToPage} />;
      case 'logs':
        return <LoginMonitoring />;
      case 'alerts':
        return <Alerts onNavigate={navigateToPage} />;
      case 'phishing':
        return <PhishingDetection />;
      case 'incidents':
        return <Incidents />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'devices':
        return <Devices />;
      case 'policies':
        return <Policies />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentPage={activePage} onNavigate={navigateToPage} />
      <div className="main-layout">
        <Navbar pageTitle={pageTitles[activePage] || 'ThreatLens AI'} />
        {renderPage()}
      </div>
    </div>
  );
};

export default function App() {
  return <MainApp />;
}
