import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function PasswordResetConfirmPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.resetPasswordConfirm(token, password);
      setIsSuccess(true);
    } catch (err) {
      setError(err.detail || 'TOKEN_INVALID_OR_EXPIRED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page-container">
      <div className="reset-panel">
        <h2 className="reset-title">//NEW_CREDENTIALS</h2>
        
        {isSuccess ? (
          <div>
            <p className="reset-description" style={{ color: '#22c55e' }}>
              &gt; PASSWORD_STRUCTURE_UPDATED.
            </p>
            <button onClick={() => navigate('/login')} className="btn-reset-white">
              AUTHENTICATE
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p className="reset-description">
              Establish new very hard password for entry.
            </p>

            {error && <p style={{ color: 'var(--accent-red)', fontSize: '13px', fontFamily: 'monospace' }}>&gt; {error}</p>}
            
            <input 
              type="password" 
              placeholder="NEW_CRYPT_PASSWORD" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="reset-input" 
              required
              disabled={loading}
            />
            
            <button type="submit" className="btn-reset-white" disabled={loading}>
              {loading ? 'WRITING_DATA...' : 'CONFIRM_RESET'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}