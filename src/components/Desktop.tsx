import React, { useState, useEffect } from 'react';
import { Window } from './Window';
import { useWindows } from '../hooks/useWindows';
import { Dock } from './Dock';
import { MenuBar } from './MenuBar';
import { Finder } from '../apps/Finder';
import { SystemPreferences } from '../apps/SystemPreferences';
import { Calculator } from '../apps/Calculator';
import { Safari } from '../apps/Safari';
import { Notes } from '../apps/Notes';
import { Terminal } from '../apps/Terminal';
import { Mail } from '../apps/Mail';
import { Spotlight } from './Spotlight';
import { ControlCenter } from './ControlCenter';
import { NotificationCenter } from './NotificationCenter';
import { DesktopIcons } from './DesktopIcons';
import { settingsStore } from '../utils/SettingsStore';
import '../styles/global.css';

export const Desktop: React.FC = () => {
  const [spotlightVisible, setSpotlightVisible] = useState(false);
  const [controlCenterVisible, setControlCenterVisible] = useState(false);
  const [notificationCenterVisible, setNotificationCenterVisible] = useState(false);

  const {
    windows,
    createWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
  } = useWindows();

  // Initialize settings store on mount
  useEffect(() => {
    settingsStore.initialize();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === ' ') {
        e.preventDefault();
        setSpotlightVisible(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // App-specific default window sizes
  const appWindowSizes: { [key: string]: { width: number; height: number } } = {
    calculator: { width: 420, height: 700 },
    preferences: { width: 700, height: 550 },
    terminal: { width: 700, height: 450 },
    notes: { width: 600, height: 500 },
    finder: { width: 850, height: 550 },
    safari: { width: 1000, height: 700 },
    mail: { width: 900, height: 600 },
  };

  const handleDockItemClick = (appId: string) => {
    const existingWindow = windows.find(w => w.app === appId && !w.isMinimized);

    if (existingWindow) {
      focusWindow(existingWindow.id);
    } else {
      const minimizedWindow = windows.find(w => w.app === appId && w.isMinimized);
      if (minimizedWindow) {
        restoreWindow(minimizedWindow.id);
        focusWindow(minimizedWindow.id);
      } else {
        const sizes = appWindowSizes[appId] || { width: 800, height: 600 };
        // Center the window better on screen
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const x = Math.max(50, (screenWidth - sizes.width) / 2 + (Math.random() * 100 - 50));
        const y = Math.max(50, (screenHeight - sizes.height) / 2 + (Math.random() * 60 - 30));

        createWindow({
          title: `${appId} Window`,
          app: appId,
          x,
          y,
          width: sizes.width,
          height: sizes.height,
        });
      }
    }
  };

  const getOpenApps = () => {
    return windows.map(w => w.app);
  };

  return (
    <div className="mac-desktop">
      <MenuBar
        onControlCenterToggle={() => setControlCenterVisible(!controlCenterVisible)}
        onNotificationCenterToggle={() => setNotificationCenterVisible(!notificationCenterVisible)}
      />

      <DesktopIcons />

      {windows.map((window) => (
        <Window
          key={window.id}
          window={window}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onFocus={focusWindow}
          onMove={moveWindow}
          onResize={resizeWindow}
        >
          {window.app === 'finder' && <Finder />}
          {window.app === 'safari' && <Safari />}
          {window.app === 'notes' && <Notes />}
          {window.app === 'terminal' && <Terminal />}
          {window.app === 'mail' && <Mail />}
          {window.app === 'preferences' && <SystemPreferences />}
          {window.app === 'calculator' && <Calculator />}
          {window.app !== 'finder' && window.app !== 'safari' && window.app !== 'notes' && window.app !== 'terminal' && window.app !== 'mail' && window.app !== 'preferences' && window.app !== 'calculator' && (
            <div style={{ padding: '20px' }}>
              <h2>{window.title}</h2>
              <p>This is content for {window.app}</p>
              <p>Window ID: {window.id}</p>
              <p>Position: ({Math.round(window.x)}, {Math.round(window.y)})</p>
              <p>Size: {window.width} x {window.height}</p>
            </div>
          )}
        </Window>
      ))}

      <Dock
        onItemClick={handleDockItemClick}
        openApps={getOpenApps()}
        anyWindowMaximized={windows.some(w => w.isMaximized && !w.isMinimized)}
      />

      <Spotlight
        isVisible={spotlightVisible}
        onClose={() => setSpotlightVisible(false)}
        onLaunchApp={handleDockItemClick}
      />

      <ControlCenter
        isVisible={controlCenterVisible}
        onClose={() => setControlCenterVisible(false)}
      />

      <NotificationCenter
        isVisible={notificationCenterVisible}
        onClose={() => setNotificationCenterVisible(false)}
      />

      {/* Night Shift Overlay */}
      <div className="night-shift-overlay" />
    </div>
  );
};
