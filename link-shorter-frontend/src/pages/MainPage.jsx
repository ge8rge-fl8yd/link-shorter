import React, { useEffect, useState, useRef } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

export default function MainPage() {
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [error, setError] = useState(''); 
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Состояния для пагинации и бесконечного скролла
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const LIMIT = 6; // Грузим по 8 элементов
  
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  // Функция первичной или полной принудительной загрузки (например, при нажатии UPDATE)
  const loadLinks = async (isRefresh = false) => {
    if (isRefresh) {
      setIsUpdating(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const currentOffset = isRefresh ? 0 : offset;
      
      // Передаем аргументы в функцию (Шаг 2)
      const data = await api.getUserLinks(LIMIT, currentOffset); 
      
      // Защита: если бэк ничего не вернул, значит ссылки кончились
      if (!data || data.length === 0) {
        setHasMore(false);
        if (isRefresh) setLinks([]);
        return;
      }

      if (isRefresh) {
        setLinks(data);
        setOffset(LIMIT);
        setHasMore(data.length === LIMIT);
      } else {
      setLinks((prev) => {
        const existingSlugs = new Set(prev.map(link => link.slug));
        const uniqueNewData = data.filter(link => !existingSlugs.has(link.slug));
        
        return [...prev, ...uniqueNewData];
      });
      setOffset((prev) => prev + data.length);

      if (data.length < LIMIT) {
        setHasMore(false);
      }
    }
    } catch {
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setIsUpdating(false);
      setIsLoadingMore(false);
    }
  };
  // Вызов при монтировании
  useEffect(() => {
    loadLinks(true);
  }, []);

  // Обработчик скролла контейнера
  const handleScroll = () => {
    if (!scrollContainerRef.current || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    // Если прокрутили до низа (с запасом в 5 пикселей), запрашиваем новую порцию
    if (scrollHeight - scrollTop <= clientHeight + 5) {
      loadLinks(false);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newLink) return;
    setError('');
    try {
      await api.addLink(newLink);
      setNewLink('');
      loadLinks(true); // Перезагружаем кэш с первой страницы
    } catch (err) {
      setError(err.detail || 'EXECUTION_ERROR: FAILED TO ADD LINK');
    }
  };

  const handleDelete = async (slug) => {
    setError('');
    try {
      await api.deleteLink(slug);
      loadLinks(true); // Перезагружаем кэш, чтобы не поплыли офсеты
    } catch (err) {
      setError(err.detail || 'EXECUTION_ERROR: FAILED TO DELETE LINK');
    }
  };

  const copyToClipboard = (slug) => {
    const frontendShortUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(frontendShortUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1500);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '60px auto', padding: '0 20px' }}>
      
      {/* Стили для кастомной анимации колесика (Spinner) */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .cyber-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #121214;
          border-top: 2px solid var(--accent-lime, #a3e635);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, letterSpacing: '1px' }}>
          CORE//<span style={{ color: 'var(--accent-lime)' }}>LINK_SHORTER</span>
        </h1>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => navigate('/logout')} 
            className="btn-white"
            style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 'bold' }}
          >
            LOGOUT
          </button>
          <button 
            onClick={() => navigate('/delete-account')} 
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--accent-red)', 
              color: 'var(--accent-red)', 
              padding: '8px 16px', 
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 'bold'
            }}
          >
            DELETE ACCOUNT
          </button>
        </div>
      </header>

      <form onSubmit={handleAddLink} className="flat-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <input 
            type="url" 
            placeholder="ENTER TARGET LONG URL..." 
            value={newLink} 
            onChange={(e) => setNewLink(e.target.value)}
            className="flat-input" 
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-white" style={{ padding: '0 24px' }}>ADD</button>
        </div>
        
        {error && (
          <p style={{ color: 'var(--accent-red, #ef4444)', fontSize: '13px', margin: '4px 0 0 0', fontFamily: 'monospace' }}>
            &gt; {error}
          </p>
        )}
      </form>

      <div className="flat-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, letterSpacing: '1px' }}>
            ACTIVE_LINKS_LIST
          </h2>
          <button
            onClick={() => loadLinks(true)}
            disabled={isUpdating}
            className="btn-white"
            style={{ 
              padding: '4px 12px', 
              fontSize: '11px', 
              fontWeight: 'bold',
              background: isUpdating ? 'var(--text-muted)' : '#ffffff' 
            }}
          >
            {isUpdating ? 'REFRESHING...' : 'UPDATE'}
          </button>
        </div>

        {links.length === 0 && !isLoadingMore ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No records found in current sector.</p>
        ) : (
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="links-scroll-container" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              maxHeight: '450px', // Немного уменьшил, чтобы скролл появлялся раньше при 8 элементах
              overflowY: 'auto',
              paddingRight: '6px'
            }}
          >
            {links.map((link) => (
              <div key={link.slug} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderBottom: '1px solid #121214' }}>
                <div style={{ overflow: 'hidden', marginRight: '16px' }}>
                  <div style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '16px' }}>{link.slug}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '4px' }}>
                    {link.link}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  <div className="clicks-badge">
                    Clicks: {link.clicks}
                  </div>

                  <button 
                    onClick={() => copyToClipboard(link.slug)} 
                    className="btn-white" 
                    style={{ padding: '6px 14px', fontSize: '12px', background: copiedSlug === link.slug ? 'var(--accent-lime)' : '#ffffff' }}
                  >
                    {copiedSlug === link.slug ? 'COPIED' : 'COPY'}
                  </button>
                  
                  <button 
                    className="btn-delete-link-outline"
                    onClick={() => handleDelete(link.slug)} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}

            {/* Блок лоадера (колесико), который показывается во время подгрузки снизу */}
            {isLoadingMore && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px 0' }}>
                <div className="cyber-spinner"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}