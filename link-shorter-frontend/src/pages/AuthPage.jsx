import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, API_URL } from '../api';

export default function AuthPage({ isLogin = true }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (isLogin) {
        const res = await api.login(email, password);
        localStorage.setItem('token', res.access_token);
        navigate('/dashboard');
      } else {
        const res = await api.register(email, password);
        setMessage(res.status || 'SUCCESS. CHECK EMAIL NODE FOR ACTIVATION.');
      }
    } catch (err) {
      setError(err.detail || 'AUTHENTICATION_FAILURE');
    }
  };

  const handleGoogleLogin = async () => {
    window.location.href = `${API_URL}/auth/google/url`;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="flat-panel" style={{ padding: '40px', width: '360px' }}>
        
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '30px', letterSpacing: '2px', textAlign: 'center' }}>
          {isLogin ? '//SECURE_LOGIN' : '//INITIALIZE_ACCOUNT'}
        </h2>
        
        {/* Системные уведомления строки */}
        {error && <p style={{ color: 'var(--accent-red)', fontSize: '13px', marginBottom: '16px', fontFamily: 'monospace' }}>&gt; {error}</p>}
        {message && <p style={{ color: 'var(--accent-lime)', fontSize: '13px', marginBottom: '16px', fontFamily: 'monospace' }}>&gt; {message}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="email" 
            placeholder="USER_EMAIL" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="flat-input" 
            required
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="password" 
              placeholder="CRYPT_PASSWORD" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="flat-input" 
              required
            />
            
            {/* Ссылка на восстановление пароля только в режиме логина */}
            {isLogin && (
              <div style={{ textAlign: 'right' }}>
                <Link 
                  to="/reset-password" 
                  style={{ 
                    color: 'var(--text-muted, #6b7280)', 
                    fontFamily: 'monospace', 
                    fontSize: '11px', 
                    textDecoration: 'none' 
                  }}
                >
                  [ FORGOT_PASSWORD? ]
                </Link>
              </div>
            )}
          </div>

          <button type="submit" className="btn-white" style={{ padding: '14px', marginTop: '8px' }}>
            {isLogin ? 'CONNECT' : 'REGISTER'}
          </button>

          {/* Визуальный разделитель */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--text-muted, #6b7280)', 
            fontFamily: 'monospace', 
            fontSize: '11px',
            margin: '4px 0'
          }}>
            [ OR ]
          </div>

          {/* Кнопка Google-авторизации */}
          <button 
            type="button" 
            onClick={handleGoogleLogin}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px', 
              padding: '14px', 
              background: 'transparent', 
              border: '1px solid #ffffff', 
              color: '#ffffff', 
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.94 1 12 1 7.24 1 3.2 3.74 1.24 7.74l3.84 2.98C6.02 7.42 8.78 5.04 12 5.04z"/>
              <path fill="#4285F4" d="M23.48 12.25c0-.82-.07-1.62-.2-2.38H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.38-4.87 3.38-8.52z"/>
              <path fill="#FBBC05" d="M5.08 14.74c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.24 7.18C.44 8.78 0 10.59 0 12.5s.44 3.72 1.24 5.32l3.84-3.08z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.22 0-5.98-2.38-6.96-5.68l-3.84 2.98C3.2 20.26 7.24 23 12 23z"/>
            </svg>
            SIGN IN WITH GOOGLE
          </button>
        </form>

        {/* Переключение режимов Вход / Регистрация */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', fontFamily: 'monospace' }}>
          {isLogin ? (
            <span style={{ color: 'var(--text-muted)' }}>
              NEW USER? <span onClick={() => navigate('/registration')} style={{ color: '#fff', cursor: 'pointer', textDecoration: 'underline' }}>CREATE_ID</span>
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>
              HAVE ID? <span onClick={() => navigate('/login')} style={{ color: '#fff', cursor: 'pointer', textDecoration: 'underline' }}>SIGN_IN</span>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}