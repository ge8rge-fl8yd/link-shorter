import React, { useState } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import OtpInput from '../components/OtpInput';

export default function DeleteAccountPage() {
  const [step, setStep] = useState(1); // 1 - request code, 2 - enter OTP
  const [token, setToken] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); // Состояние успешного удаления
  const navigate = useNavigate();

  const handleRequestDelete = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.deleteAccountRequest();
      setToken(res.access_token); // Save token for step 2
      setStep(2);
    } catch (err) {
      setError(err.detail || 'Failed to request account deletion.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      await api.deleteAccountConfirm(token, otp);
      localStorage.removeItem('token'); // Clear session
      setIsSuccess(true); // Включаем экран успеха
    } catch (err) {
      setError(err.detail || 'Invalid security code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="delete-card-container">
        <h2 className="delete-title">DELETE ACCOUNT</h2>
        
        {error && (
          <p className="delete-description" style={{ color: '#ef4444', marginBottom: '16px', fontFamily: 'monospace' }}>
            &gt; {error}
          </p>
        )}

        {isSuccess ? (
          <div>
            <p className="delete-description" style={{ color: '#22c55e', fontFamily: 'monospace', marginBottom: '24px' }}>
              &gt; ACCOUNT_DELETED_SUCCESSFULLY. ALL DATA SECTORS PURGED.
            </p>
            <button 
              onClick={() => navigate('/login')} 
              className="btn-white"
              style={{ width: '100%', padding: '14px' }}
            >
              RETURN TO LOGIN
            </button>
          </div>
        ) : step === 1 ? (
          <div>
            <p className="delete-description">
              This action is irreversible. A secret one-time security code 
              will be sent to your email to confirm this destructive operation.
            </p>
            <button 
              onClick={handleRequestDelete} 
              disabled={loading} 
              className="btn-red-brutal"
            >
              {loading ? 'GENERATING CODE...' : 'CONFIRM REQUEST'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirmDelete}>
            <p className="delete-description">
              Enter the 6-digit security code sent to your email.
            </p>
            
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
              <OtpInput length={6} value={otp} onChange={setOtp} />
            </div>
            
            <button 
              type="submit" 
              disabled={otp.length !== 6 || loading} 
              className="btn-red-brutal"
            >
              {loading ? 'DELETING...' : 'PERMANENTLY DELETE'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}