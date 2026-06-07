import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function PasswordResetRequestPage() {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.resetPasswordRequest(email);
      setIsSuccess(true);
    } catch (err) {
      setError(err.detail || 'FAILED_TO_PROCESS_REQUEST');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page-container">
      <div className="reset-panel">
        <h2 className="reset-title">//RESET_PASSWORD</h2>
        
        {isSuccess ? (
          <div>
            <p className="reset-description" style={{ color: '#22c55e' }}>
              &gt; RECOVERY_LINK_DISPATCHED_SUCCESSFULLY.
            </p>
            <button onClick={() => navigate('/login')} className="btn-reset-white">
              RETURN TO LOGIN
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p className="reset-description">
              Provide account email node to generate secure access state reset link.
            </p>

            {error && <p style={{ color: 'var(--accent-red)', fontSize: '13px', fontFamily: 'monospace' }}>&gt; {error}</p>}
            
            <input 
              type="email" 
              placeholder="USER_EMAIL" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="reset-input" 
              required
              disabled={loading}
            />
            
            <button type="submit" className="btn-reset-white" disabled={loading}>
              {loading ? 'GENERATING...' : 'GENERATE_LINK'}
            </button>

            <div style={{ textAlign: 'left' }}>
              <Link to="/login" className="reset-back-link">
                [ BACK_TO_LOGIN ]
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}