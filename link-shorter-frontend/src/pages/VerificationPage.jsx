import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function VerificationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  
  // Флаг-предохранитель против двойного вызова в StrictMode
  const isVerificationStarted = useRef(false);

  useEffect(() => {
    // Если запрос уже улетел — игнорируем повторный прогон эффекта
    if (isVerificationStarted.current) return;
    isVerificationStarted.current = true;

    const doVerify = async () => {
      try {
        const res = await api.verify(token);
        localStorage.setItem('token', res.access_token); // Auto login
        setStatus('success');
        setTimeout(() => navigate('/'), 2500);
      } catch (err) {
        setStatus('error');
        setErrorMsg(err.detail || 'Invalid or expired verification token.');
      }
    };
    
    doVerify();
  }, [token, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="delete-card-container" style={{ width: '450px' }}>
        
        {status === 'processing' && (
          <div>
            <h2 className="delete-title" style={{ color: 'var(--accent-cyan, #06b6d4)' }}>
              VERIFYING SYSTEM...
            </h2>
            <p className="delete-description">
              Establishing connection with the core network...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <h2 className="delete-title" style={{ color: '#22c55e' }}>
              ACCESS GRANTED
            </h2>
            <p className="delete-description" style={{ color: '#22c55e' }}>
              Account successfully verified. Initiating automatic system login...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <h2 className="delete-title">
              ACCESS DENIED
            </h2>
            <p className="delete-description" style={{ color: '#ef4444' }}>
              {errorMsg}
            </p>
            <button 
              onClick={() => navigate('/login')} 
              className="btn-white" 
              style={{ width: '100%', marginTop: '10px' }}
            >
              GO TO LOGIN
            </button>
          </div>
        )}

      </div>
    </div>
  );
}