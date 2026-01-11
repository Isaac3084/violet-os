import React, { useState, useEffect, useRef } from 'react';
import { Search, Folder, FileText, Image, Music, ArrowRight, AppWindow } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  category: string;
  action: () => void;
}

interface SpotlightProps {
  isVisible: boolean;
  onClose: () => void;
  onLaunchApp: (appId: string) => void;
}

export const Spotlight: React.FC<SpotlightProps> = ({ isVisible, onClose, onLaunchApp }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const apps = [
    { id: 'finder', name: 'Finder', icon: Folder },
    { id: 'safari', name: 'Safari', icon: Search },
    { id: 'notes', name: 'Notes', icon: FileText },
    { id: 'mail', name: 'Mail', icon: FileText },
    { id: 'terminal', name: 'Terminal', icon: AppWindow },
    { id: 'calculator', name: 'Calculator', icon: AppWindow },
    { id: 'preferences', name: 'System Preferences', icon: AppWindow },
  ];

  useEffect(() => {
    if (isVisible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // 1. Search Apps
    apps.forEach(app => {
      if (app.name.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: `app-${app.id}`,
          title: app.name,
          subtitle: 'Application',
          icon: app.icon,
          category: 'Applications',
          action: () => onLaunchApp(app.id)
        });
      }
    });

    setResults(searchResults);
    setSelectedIndex(0);

  }, [query, onLaunchApp]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="spotlight-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="spotlight-container"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <style>{`
              .spotlight-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                justify-content: center;
                padding-top: 20vh;
                background: rgba(0,0,0,0.1);
              }

              .spotlight-container {
                width: 600px;
                max-width: 90vw;
                background: rgba(255, 255, 255, 0.65);
                backdrop-filter: blur(40px) saturate(200%);
                -webkit-backdrop-filter: blur(40px) saturate(200%);
                border-radius: 16px;
                box-shadow: 
                  0 20px 60px rgba(0, 0, 0, 0.3),
                  0 0 0 1px rgba(255, 255, 255, 0.4) inset;
                overflow: hidden;
                display: flex;
                flex-direction: column;
              }

              .spotlight-search-area {
                display: flex;
                align-items: center;
                padding: 18px 24px;
                gap: 16px;
              }

              .spotlight-input {
                flex: 1;
                font-size: 24px;
                background: transparent;
                border: none;
                outline: none;
                color: #222;
                font-weight: 300;
              }
              
              .spotlight-input::placeholder {
                color: rgba(0,0,0,0.3);
              }
              
              .spotlight-results {
                 border-top: 1px solid rgba(0,0,0,0.05);
                 max-height: 400px;
                 overflow-y: auto;
                 padding: 8px;
              }
              
              .result-item {
                 display: flex;
                 align-items: center;
                 gap: 12px;
                 padding: 10px 16px;
                 border-radius: 8px;
                 cursor: pointer;
                 transition: background 0.1s;
              }
              
              .result-item:hover, .result-item.selected {
                 background: rgba(0, 122, 255, 0.1);
              }
              
              .result-item.selected {
                 background: #007AFF;
                 color: white;
              }
              
              .result-item.selected .result-subtitle {
                 color: rgba(255,255,255,0.8);
              }

              .result-item.selected .result-icon {
                 color: white;
                 opacity: 1;
              }

              .result-icon {
                 color: inherit;
                 opacity: 0.7;
              }
              
              .result-info {
                flex: 1;
              }
              
              .result-title {
                font-size: 14px;
                font-weight: 500;
              }
              
              .result-subtitle {
                font-size: 12px;
                color: rgba(0,0,0,0.5);
              }
            `}</style>

            <div className="spotlight-search-area">
              <Search size={28} color="#666" style={{ opacity: 0.5 }} />
              <input
                ref={inputRef}
                className="spotlight-input"
                placeholder="Spotlight Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>

            <div className="spotlight-results">
              {results.length > 0 ? (
                results.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className={`result-item ${idx === selectedIndex ? 'selected' : ''}`}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => { item.action(); onClose(); }}
                    >
                      <Icon size={20} className="result-icon" />
                      <div className="result-info">
                        <div className="result-title">{item.title}</div>
                        <div className="result-subtitle">{item.subtitle}</div>
                      </div>
                      {idx === selectedIndex && <ArrowRight size={16} style={{ opacity: 0.5 }} />}
                    </div>
                  );
                })
              ) : query.trim() ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                  No results found
                </div>
              ) : null}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
