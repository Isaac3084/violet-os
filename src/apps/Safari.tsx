import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Home,
  Share2,
  Bookmark,
  Download,
  Settings,
  Plus,
  Lock,
  Globe,
  Search,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Unlock
} from 'lucide-react';
import { SecurityEngine, SecurityReport } from '../utils/SecurityEngine';
import { motion, AnimatePresence } from 'framer-motion';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon: string;
  security?: SecurityReport;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon: string;
}

export const Safari: React.FC = () => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: '1',
      title: 'Start Page',
      url: 'about:blank',
      favicon: '🧭'
    }
  ]);

  const [activeTabId, setActiveTabId] = useState('1');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const bookmarks: Bookmark[] = [
    { id: '1', title: 'Start Page', url: 'about:blank', favicon: '🧭' },
    { id: '2', title: 'Wikipedia', url: 'https://www.wikipedia.org', favicon: '📚' },
    { id: '3', title: 'Bing', url: 'https://www.bing.com', favicon: '🔍' },
    { id: '4', title: 'YouTube', url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1', favicon: '▶️' },
    { id: '5', title: 'OpenStreetMap', url: 'https://www.openstreetmap.org', favicon: '🗺️' },
    { id: '6', title: 'Example.com', url: 'https://www.example.com', favicon: '📄' },
  ];

  const envInfo = SecurityEngine.getEnvironmentInfo();

  useEffect(() => {
    if (activeTab) {
      if (activeTab.url === 'about:blank') {
        setUrlInput('');
      } else {
        setUrlInput(activeTab.url);
      }
      checkIfBlocked(activeTab.url);
    }
  }, [activeTabId, tabs]);

  // Mock Data for YouTube
  const youtubeVideos = [
    { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio - beats to relax/study to', channel: 'Lofi Girl', views: '66K watching', time: 'LIVE' },
    { id: '5qap5aO4i9A', title: 'lofi hip hop radio - beats to sleep/chill to', channel: 'Lofi Girl', views: '24K watching', time: 'LIVE' },
    { id: 'hHKuU2YgGjE', title: 'Calm Jazz Music - Relaxing Cafe Music', channel: 'Cafe Music BGM', views: '1.2M views', time: '2 days ago' },
    { id: 't4gwmqqYvIQ', title: 'Relaxing Piano Music', channel: 'Soothing Relaxation', views: '4.5M views', time: '1 month ago' },
    { id: '7nos6lNMmic', title: 'The Best of Classical Music', channel: 'HALIDONMUSIC', views: '32M views', time: '1 year ago' },
    { id: 'K4DyBUG242c', title: 'Cartoon - On & On (feat. Daniel Levi) [NCS Release]', channel: 'NoCopyrightSounds', views: '480M views', time: '7 years ago' },
    { id: 'kPa7bsKwL-c', title: 'Winter Jazz - Relaxing Jazz Music', channel: 'Coffee Shop', views: '890K views', time: '3 weeks ago' },
    { id: 'lTRiuFIWV54', title: '1 A.M Study Session 📚 [lofi hip hop/chill beats]', channel: 'Lofi Girl', views: '14M views', time: '2 years ago' }
  ];

  const YouTubeMock: React.FC<{ onNavigate: (url: string) => void }> = ({ onNavigate }) => (
    <div style={{ width: '100%', height: '100%', background: '#0f0f0f', color: 'white', overflowY: 'auto', padding: '20px' }}>
      {/* YT Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', position: 'sticky', top: 0, background: '#0f0f0f', zIndex: 10, paddingBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 20 }}>
          <div style={{ width: 28, height: 20, background: 'red', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: '6px solid white' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>YouTube</span>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <input placeholder="Search" style={{ background: '#121212', border: '1px solid #303030', borderRadius: '40px', padding: '8px 16px', color: 'white', width: '40%', outline: 'none' }} />
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#555', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>U</div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Recommended</h2>

      {/* Video Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {youtubeVideos.map(video => (
          <div
            key={video.id}
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate(`https://www.youtube.com/watch?v=${video.id}`)}
          >
            <div style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', marginBottom: '10px', position: 'relative' }}>
              <img
                src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                alt={video.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.8)', padding: '2px 4px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
                {video.time === 'LIVE' ? 'LIVE' : '4:20'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#333', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.title}</div>
                <div style={{ fontSize: 12, color: '#aaa' }}>{video.channel}</div>
                <div style={{ fontSize: 12, color: '#aaa' }}>{video.views} • {video.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const checkIfBlocked = (currentUrl: string) => {
    if (currentUrl === 'about:blank') {
      setUseFallback(false);
      return;
    }

    // Whitelist YouTube entire domain (since we handle homepage manually and embeds are safe)
    if (currentUrl.includes('youtube.com') || currentUrl.includes('youtu.be')) {
      setUseFallback(false);
      return;
    }

    const blockedDomains = [
      'google.com', 'apple.com', 'facebook.com', 'twitter.com', 'instagram.com',
      'reddit.com', 'linkedin.com', 'github.com', 'stackoverflow.com',
      'microsoft.com', 'netflix.com'
    ];
    try {
      const hostname = new URL(currentUrl).hostname;
      const isBlocked = blockedDomains.some(domain => hostname.includes(domain));
      setUseFallback(isBlocked);
    } catch {
      setUseFallback(false);
    }
  };

  const formatForEmbed = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        if (urlObj.pathname === '/watch') {
          const videoId = urlObj.searchParams.get('v');
          if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
          }
        }
        if (hostname.includes('youtu.be')) {
          return `https://www.youtube.com/embed${urlObj.pathname}`;
        }
      }
      return url;
    } catch {
      return url;
    }
  };

  const processUrl = (input: string) => {
    let finalUrl = input.trim();
    const hasSpace = finalUrl.includes(' ');
    const hasDot = finalUrl.includes('.');
    const isProtocol = finalUrl.startsWith('http://') || finalUrl.startsWith('https://');
    const isLocalhost = finalUrl.startsWith('localhost') || finalUrl.includes('127.0.0.1');

    if (!isProtocol && (hasSpace || !hasDot) && !isLocalhost && finalUrl !== 'about:blank') {
      finalUrl = `https://www.bing.com/search?q=${encodeURIComponent(finalUrl)}`;
    } else if (!isProtocol && finalUrl !== 'about:blank') {
      finalUrl = `https://${finalUrl}`;
    }

    return formatForEmbed(finalUrl);
  };

  const navigateTo = async (input: string) => {
    const newUrl = processUrl(input);
    setShowSecurityInfo(false);
    setIsLoading(true);
    setLoadingStep('Resolving Host...');

    // Step 1: Analyze URL Security
    const report = await SecurityEngine.analyzeUrl(newUrl);
    setLoadingStep('Verifying Certificates...');
    await new Promise(r => setTimeout(r, 400));

    setLoadingStep('Establishing Secure Connection...');
    await new Promise(r => setTimeout(r, 400));

    setTabs(prev => prev.map(tab =>
      tab.id === activeTabId
        ? {
          ...tab,
          url: newUrl,
          title: newUrl === 'about:blank' ? 'Start Page' : new URL(newUrl).hostname.replace('www.', ''),
          favicon: newUrl === 'about:blank' ? '🧭' : '🌍',
          security: report
        }
        : tab
    ));

    if (newUrl !== 'about:blank') {
      setHistory(prev => [newUrl, ...prev.slice(0, 49)]);
    }

    setIsLoading(false);
    setLoadingStep('');
  };

  const onUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigateTo(urlInput);
    }
  };

  const addNewTab = () => {
    const newTab: BrowserTab = {
      id: Date.now().toString(),
      title: 'Start Page',
      url: 'about:blank',
      favicon: '🧭'
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      navigateTo('about:blank');
      return;
    }
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const isYouTubeHome = (url: string) => {
    try {
      const u = new URL(url);
      return (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) && (u.pathname === '/' || u.pathname === '');
    } catch { return false; }
  };

  return (
    <div className="safari-container">
      <style>{`
        .safari-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #f5f5f7;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .safari-toolbar {
          background: rgba(245, 245, 247, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid #d1d1d6;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
          z-index: 20;
        }

        .safari-tab-bar {
          display: flex;
          align-items: center;
          gap: 4px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .safari-tab {
          min-width: 140px;
          max-width: 240px;
          height: 28px;
          background: #e3e3e5;
          border-radius: 6px;
          display: flex;
          align-items: center;
          padding: 0 8px;
          gap: 8px;
          font-size: 11px;
          color: #333;
          cursor: default;
          position: relative;
          transition: background 0.2s;
          flex: 1;
        }

        .safari-tab.active {
          background: #ffffff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        .safari-tab:hover:not(.active) {
          background: #ebebeb;
        }

        .safari-tab-icon {
          font-size: 12px;
        }

        .safari-tab-title {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .safari-tab-close {
          opacity: 0;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          font-size: 12px;
          cursor: pointer;
        }

        .safari-tab:hover .safari-tab-close {
          opacity: 1;
        }

        .safari-tab-close:hover {
          background: #d1d1d6;
        }

        .safari-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 8px;
        }

        .safari-nav-btn {
          background: none;
          border: none;
          color: #333;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .safari-nav-btn:hover {
          background: rgba(0,0,0,0.05);
        }
        
        .safari-nav-btn:disabled {
          opacity: 0.3;
          cursor: default;
        }

        .safari-address-bar {
           flex: 1;
           height: 34px;
           background: #e3e3e5;
           border-radius: 8px;
           display: flex;
           align-items: center;
           padding: 0 4px 0 12px;
           gap: 8px;
           transition: background 0.2s, box-shadow 0.2s;
           position: relative;
        }
        
        .safari-address-bar:focus-within {
           background: #fff;
           box-shadow: 0 0 0 3px rgba(0,122,255,0.3);
           border: 1px solid #007aff;
        }

        .safari-address-input {
           flex: 1;
           background: transparent;
           border: none;
           outline: none;
           font-size: 13px;
        }
        
        .security-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .security-badge:hover {
          background: rgba(0,0,0,0.05);
        }
        
        .security-badge.secure { color: #34C759; }
        .security-badge.insecure { color: #FF3B30; }

        .security-popup {
          position: absolute;
          top: 40px;
          left: 0;
          width: 300px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          padding: 16px;
          z-index: 100;
          border: 1px solid rgba(0,0,0,0.1);
        }
        
        .security-popup h3 {
          margin: 0 0 12px 0;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .security-detail {
          margin-bottom: 8px;
          font-size: 13px;
          color: #666;
        }
        
        .security-detail strong {
          color: #333;
          font-weight: 500;
        }
        
        .verified-by {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(0,0,0,0.1);
          font-size: 11px;
          color: #8e8e93;
        }

        .safari-content-area {
           flex: 1;
           position: relative;
           background: white;
           overflow: hidden;
        }

        .safari-iframe {
           width: 100%;
           height: 100%;
           border: none;
        }

        .safari-start-page {
           position: absolute;
           top: 0; left: 0; right: 0; bottom: 0;
           background: #fbfbfd;
           display: flex;
           flex-direction: column;
           align-items: center;
           padding-top: 10vh;
        }
        
        .safari-hero-title {
           font-size: 42px;
           font-weight: 700;
           color: #1d1d1f;
           margin-bottom: 40px;
           display: flex;
           align-items: center;
           gap: 12px;
        }

        .safari-favorites-grid {
           display: grid;
           grid-template-columns: repeat(4, 1fr);
           gap: 32px;
           max-width: 600px;
           width: 90%;
        }

        .safari-favorite-item {
           display: flex;
           flex-direction: column;
           align-items: center;
           gap: 12px;
           cursor: pointer;
           transition: transform 0.2s;
        }
        
        .safari-favorite-item:hover {
           transform: scale(1.05);
        }

        .safari-fav-icon-box {
           width: 64px;
           height: 64px;
           background: white;
           border-radius: 14px;
           box-shadow: 0 4px 12px rgba(0,0,0,0.08);
           display: flex;
           align-items: center;
           justify-content: center;
           font-size: 32px;
        }

        .safari-fav-title {
           font-size: 12px;
           color: #1d1d1f;
           font-weight: 500;
        }

        .safari-blocked-page {
           position: absolute;
           top: 0; left: 0; right: 0; bottom: 0;
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;
           background: #f2f2f7;
           color: #333;
           text-align: center;
           padding: 20px;
        }
        
        .loading-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(5px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }
        
        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(0,122,255,0.2);
          border-top: 3px solid #007aff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 12px;
        }
        
        .loading-text {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Toolbar */}
      <div className="safari-toolbar">
        <div className="safari-tab-bar">
          {tabs.map(tab => (
            <div key={tab.id} className={`safari-tab ${tab.id === activeTabId ? 'active' : ''}`} onClick={() => setActiveTabId(tab.id)}>
              <span className="safari-tab-icon">{tab.favicon}</span>
              <span className="safari-tab-title">{tab.title}</span>
              <button className="safari-tab-close" onClick={(e) => closeTab(tab.id, e)}>×</button>
            </div>
          ))}
          <button className="safari-nav-btn" onClick={addNewTab}><Plus size={16} /></button>
        </div>

        <div className="safari-controls">
          <button className="safari-nav-btn"><ArrowLeft size={18} /></button>
          <button className="safari-nav-btn"><ArrowRight size={18} /></button>

          <div className="safari-address-bar">
            <div
              className={`security-badge ${activeTab?.security?.isSecure ? 'secure' : 'insecure'}`}
              onClick={() => setShowSecurityInfo(!showSecurityInfo)}
            >
              {activeTab?.security?.isSecure ? <Lock size={12} fill="currentColor" /> : <Unlock size={12} />}
            </div>

            <AnimatePresence>
              {showSecurityInfo && activeTab?.security && (
                <motion.div
                  className="security-popup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <h3>
                    {activeTab.security.isSecure ? (
                      <ShieldCheck size={18} color="#34C759" />
                    ) : (
                      <ShieldAlert size={18} color="#FF3B30" />
                    )}
                    {activeTab.security.isSecure ? 'Connection is Secure' : 'Not Secure'}
                  </h3>
                  <div className="security-detail">
                    <strong>Protocol:</strong> {activeTab.security.protocol} (Encrypted)
                  </div>
                  {activeTab.security.certificate && (
                    <>
                      <div className="security-detail">
                        <strong>Certificate:</strong> Valid
                      </div>
                      <div className="security-detail">
                        <strong>Issuer:</strong> {activeTab.security.certificate.issuer}
                      </div>
                      <div className="security-detail">
                        <strong>Encryption:</strong> {activeTab.security.certificate.strength}
                      </div>
                    </>
                  )}
                  <div className="verified-by">
                    Verified by <strong>{envInfo.hostBrowser} Security Engine</strong> ({envInfo.platform})
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <input
              className="safari-address-input"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={onUrlKeyDown}
              placeholder="Search or enter website name"
            />
            <RefreshCw size={14} onClick={() => navigateTo(urlInput)} style={{ cursor: 'pointer', opacity: 0.6 }} />
          </div>

          <button className="safari-nav-btn" onClick={() => setShowBookmarks(!showBookmarks)}>
            <Bookmark size={16} fill={showBookmarks ? '#333' : 'none'} />
          </button>
          <button className="safari-nav-btn"><Share2 size={16} /></button>
          <button className="safari-nav-btn"><Plus size={16} /></button>
        </div>
      </div>

      {/* Content */}
      <div className="safari-content-area">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
            <div className="loading-text">{loadingStep}</div>
          </div>
        )}

        {(activeTab?.url === 'about:blank' || activeTab?.url === '') ? (
          <div className="safari-start-page">
            <div className="safari-hero-title">
              <span>Safari</span>
            </div>
            <div className="safari-favorites-grid">
              {bookmarks.map(bm => (
                <div key={bm.id} className="safari-favorite-item" onClick={() => navigateTo(bm.url)}>
                  <div className="safari-fav-icon-box">{bm.favicon}</div>
                  <span className="safari-fav-title">{bm.title}</span>
                </div>
              ))}
            </div>
          </div>
        ) : isYouTubeHome(activeTab?.url || '') ? (
          <YouTubeMock onNavigate={navigateTo} />
        ) : useFallback ? (
          <div className="safari-blocked-page">
            <ShieldAlert size={64} color="#8e8e93" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>Website Security Not Supported</h2>
            <p style={{ color: '#8e8e93', maxWidth: 400, marginBottom: 20 }}>
              Currently, <strong>{activeTab?.title}</strong> prevents being displayed inside this simulator for security reasons (X-Frame-Options).
            </p>
            <button onClick={() => window.open(activeTab?.url, '_blank')} style={{ padding: '10px 20px', background: '#007aff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              Open in Secure Container <ExternalLink size={14} />
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className="safari-iframe"
            src={activeTab?.url}
            title="browser"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            style={{ opacity: isLoading ? 0.5 : 1 }}
          />
        )}
      </div>
    </div>
  );
};
