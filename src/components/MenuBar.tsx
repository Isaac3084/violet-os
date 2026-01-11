import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Volume2, Search, Apple, Database, Bell } from 'lucide-react';

interface MenuBarProps {
  onControlCenterToggle?: () => void;
  onNotificationCenterToggle?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onControlCenterToggle,
  onNotificationCenterToggle
}) => {
  const [currentTime, setCurrentTime] = useState({
    date: 'Mon Jan 1',
    time: '12:00 PM'
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime({
        date: now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = ['File', 'Edit', 'View', 'Go', 'Window', 'Help'];

  return (
    <div className="menubar">
      <style>{`
        .menubar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 32px; /* Standardize with global CSS */
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(25px) saturate(200%);
          -webkit-backdrop-filter: blur(25px) saturate(200%);
          display: flex;
          align-items: center;
          padding: 0 16px;
          justify-content: space-between;
          z-index: 9999;
          font-size: 13px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.9);
          box-shadow: 0 1px 0 rgba(0,0,0,0.05);
        }

        .menubar-left, .menubar-right {
          display: flex;
          align-items: center;
          gap: 16px;
          height: 100%;
        }

        .apple-logo {
          margin-right: 8px;
          cursor: pointer;
          opacity: 0.9;
        }
        
        .apple-logo:hover {
          opacity: 1;
        }

        .menu-item {
          padding: 2px 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .menu-item:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .menubar-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .menubar-icon:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        
        .control-center-toggle {
          margin-left: 8px;
        }
      `}</style>

      <div className="menubar-left">
        <div className="apple-logo"><Apple size={18} fill="currentColor" /></div>
        <div className="menu-item" style={{ fontWeight: 700 }}>Finder</div>
        {menuItems.map(item => (
          <div key={item} className="menu-item">{item}</div>
        ))}
      </div>

      <div className="menubar-right">
        <div className="menubar-icon"><Database size={16} strokeWidth={2} /></div>
        <div className="menubar-icon"><Wifi size={16} strokeWidth={2} /></div>
        <div className="menubar-icon"><Battery size={16} strokeWidth={2} /></div>
        <div className="menubar-icon"><Volume2 size={16} strokeWidth={2} /></div>
        <div className="menubar-icon" onClick={onControlCenterToggle}>
          <Search size={16} strokeWidth={2} />
        </div>

        <div style={{ margin: '0 8px', fontWeight: 500 }}>
          {currentTime.date} &nbsp; {currentTime.time}
        </div>

        <div className="menubar-icon" onClick={onNotificationCenterToggle}>
          <Bell size={16} fill="currentColor" />
        </div>
      </div>
    </div>
  );
};
