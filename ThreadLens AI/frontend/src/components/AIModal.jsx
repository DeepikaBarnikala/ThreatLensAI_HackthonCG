import React from 'react';
import { X, Sparkles, Shield, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const AIModal = ({ isOpen, onClose, title, data, type = 'alert' }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles size={20} color="#0284c7" />
            <span>ThreatLens AI Copilot Explanation</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {type === 'alert' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="ai-insight-card ai-insight-happened">
                <h4>
                  What Happened?
                </h4>
                <p>
                  {data.what_happened}
                </p>
              </div>

              <div className="ai-insight-card ai-insight-suspicious">
                <h4>
                  Why Is It Suspicious?
                </h4>
                <p>
                  {data.why_suspicious}
                </p>
              </div>

              <div className="ai-insight-card ai-insight-impact">
                <h4>
                  Possible Organizational Impact
                </h4>
                <p>
                  {data.possible_impact}
                </p>
              </div>

              <div>
                <h4 className="ai-recommendation-title">
                  <Shield size={16} color="#2563eb" />
                  Recommended Administrator Actions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.recommended_steps?.map((step, idx) => (
                    <div key={idx} className="ai-recommendation-step">
                      <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {data.source && (
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', textAlign: 'right' }}>
                  Engine: {data.source}
                </div>
              )}
            </div>
          )}

          {type === 'phishing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="ai-insight-card ai-insight-analysis">
                <h4>
                  Security Analysis
                </h4>
                <p>
                  {data.analysis}
                </p>
              </div>

              <div>
                <h4 className="ai-recommendation-title">
                  Detected Threat Indicators
                </h4>
                <ul className="ai-indicator-list">
                  {data.threat_indicators?.map((ind, i) => (
                    <li key={i}>{ind}</li>
                  ))}
                </ul>
              </div>

              <div className="ai-insight-card ai-insight-guidance">
                <h4>
                  Guidance for Staff / Employee
                </h4>
                <p>
                  {data.user_guidance}
                </p>
              </div>

              <div className="ai-insight-card ai-insight-admin-action">
                <h4>
                  Recommended IT Admin Action
                </h4>
                <p>
                  {data.admin_action}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
