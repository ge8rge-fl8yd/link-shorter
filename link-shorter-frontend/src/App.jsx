import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';
import VerificationPage from './pages/VerificationPage';
import PasswordResetRequestPage from './pages/PasswordResetRequestPage'; // Добавили импорт
import PasswordResetConfirmPage from './pages/PasswordResetConfirmPage';
import DeleteAccountPage from './pages/DeleteAccountPage';
import RedirectPage from './pages/RedirectPage';
import LogoutPage from './pages/LogoutPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
        <Route path="/delete-account" element={<ProtectedRoute><DeleteAccountPage /></ProtectedRoute>} />

        {/* Auth */}
        <Route path="/login" element={<AuthPage isLogin={true} />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/registration" element={<AuthPage isLogin={false} />} />
        <Route path="/reset-password" element={<PasswordResetRequestPage />} /> {/* Наш новый роут запроса */}

        {/* Интерцепторы писем */}
        <Route path="/v/:token" element={<VerificationPage />} />
        <Route path="/r/:token" element={<PasswordResetConfirmPage />} />

        {/* Роут перехвата коротких ссылок вида localhost:5173/:slug */}
        <Route path="/:slug" element={<RedirectPage />} />
        <Route path="/auth/google" element={<GoogleCallbackPage />} />
        {/* Фоллбек автоматического перехода на дашборд */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}