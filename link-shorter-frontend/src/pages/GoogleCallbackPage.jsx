import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('INITIALIZING_HANDSHAKE...');
  
  // Реф поможет сохранить состояние между двойными рендерами StrictMode
  const hasFired = useRef(false);

  useEffect(() => {
    // Если запрос уже улетел — игнорируем повторный вызов
    if (hasFired.current) return;

    const code = searchParams.get('code');
    if (!code) {
      setStatus('ERROR: OAUTH_CODE_NOT_FOUND');
      return;
    }

    const authenticateGoogleUser = async () => {
      try {
        hasFired.current = true; // Выставляем флаг прямо перед fetch
        setStatus('VERIFYING_CREDENTIALS...');
        
        const res = await api.loginWithGoogle(code); 
        localStorage.setItem('token', res.access_token);
        setStatus('ACCESS_GRANTED. REDIRECTING...');
        
        setTimeout(() => navigate('/dashboard'), 1000);
      } catch (err) {
        console.error(err);
        setStatus(`AUTHENTICATION_FAILED: ${err.detail || 'UNKNOWN_ERROR'}`);
      }
    };

    authenticateGoogleUser();
  }, [searchParams, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000' }}>
      <div className="flat-panel" style={{ padding: '30px', fontFamily: 'monospace', color: '#fff' }}>
        <p>&gt; {status}</p>
      </div>
    </div>
  );
}