import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function RedirectPage() {
  const { slug } = useParams();

  useEffect(() => {
    if (slug) {
      // Перенаправляем на бэкенд, который рулит редиректом и считает клики
      window.location.href = `http://localhost:8000/links/${slug}`;
    }
  }, [slug]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ color: 'var(--accent-lime)', fontSize: '14px', letterSpacing: '2px' }}>
        CONNECTING TO DESTINATION NODE...
      </div>
    </div>
  );
}