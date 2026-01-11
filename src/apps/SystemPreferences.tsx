import React, { useState, useEffect } from 'react';
import { Monitor, Volume2, HardDrive, Shield, Globe, Smartphone, Sun, Moon, Volume1, Bell, Trash2, Database, Lock, FileText, Cookie, Eye, EyeOff, Info, ExternalLink, Calendar, MessageSquare, Check } from 'lucide-react';
import { settingsStore } from '../utils/SettingsStore';

interface PreferenceCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

const preferenceCategories: PreferenceCategory[] = [
  {
    id: 'display',
    name: 'Display',
    icon: Monitor,
    description: 'Adjust brightness and color'
  },
  {
    id: 'sound',
    name: 'Sound',
    icon: Volume2,
    description: 'Change sound effects and volume'
  },
  {
    id: 'resources',
    name: 'Resource Manager',
    icon: HardDrive,
    description: 'Manage storage and clear cache'
  },
  {
    id: 'security',
    name: 'Security & Privacy',
    icon: Shield,
    description: 'Configure security and privacy settings'
  },
  {
    id: 'language',
    name: 'Language & Region',
    icon: Globe,
    description: 'Set language, region, and date formats'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: Smartphone,
    description: 'Manage app notifications and focus modes'
  },
];

export const SystemPreferences: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('display');
  const [brightness, setBrightness] = useState(settingsStore.getBrightness());
  const [nightShiftEnabled, setNightShiftEnabled] = useState(settingsStore.isNightShiftEnabled());
  const [nightShiftIntensity, setNightShiftIntensity] = useState(settingsStore.getNightShiftIntensity());
  const [outputVolume, setOutputVolume] = useState(settingsStore.getVolume());
  const [alertVolume, setAlertVolume] = useState(30);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);

  // Resource Manager state
  const [cacheSize, setCacheSize] = useState(24.5); // MB
  const [storageUsed, setStorageUsed] = useState(156.8); // MB
  const [isClearing, setIsClearing] = useState(false);

  // Security & Privacy state
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [cookiesEnabled, setCookiesEnabled] = useState(true);
  const [sessionDataEnabled, setSessionDataEnabled] = useState(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Language & Region state
  const [language, setLanguage] = useState('English (US)');
  const [region, setRegion] = useState('United States');

  const languages = [
    'English (US)', 'English (UK)', 'Spanish', 'French', 'German',
    'Italian', 'Portuguese', 'Portuguese (Brazil)', 'Russian',
    'Chinese (Simplified)', 'Chinese (Traditional)', 'Japanese',
    'Korean', 'Hindi', 'Arabic', 'Dutch', 'Swedish', 'Turkish',
    'Polish', 'Vietnamese', 'Thai'
  ];

  const regions = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
    'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo (Congo-Brazzaville)', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia (Czech Republic)',
    'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
    'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini (fmr. "Swaziland")', 'Ethiopia',
    'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Holy See', 'Honduras', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
    'Jamaica', 'Japan', 'Jordan',
    'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar (formerly Burma)',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
    'Oman',
    'Pakistan', 'Palau', 'Palestine State', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar',
    'Romania', 'Russia', 'Rwanda',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
    'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Venezuela', 'Vietnam',
    'Yemen',
    'Zambia', 'Zimbabwe'
  ];

  // Subscribe to settings changes
  useEffect(() => {
    return settingsStore.subscribe(() => {
      setBrightness(settingsStore.getBrightness());
      setNightShiftEnabled(settingsStore.isNightShiftEnabled());
      setNightShiftIntensity(settingsStore.getNightShiftIntensity());
      setOutputVolume(settingsStore.getVolume());
    });
  }, []);

  const handleBrightnessChange = (value: number) => {
    settingsStore.setBrightness(value);
  };

  const handleNightShiftToggle = (enabled: boolean) => {
    settingsStore.setNightShiftEnabled(enabled);
  };

  const handleNightShiftIntensityChange = (value: number) => {
    settingsStore.setNightShiftIntensity(value);
  };

  const handleOutputVolumeChange = (value: number) => {
    setOutputVolume(value);
    settingsStore.setVolume(value);
  };

  const handleAlertVolumeChange = (value: number) => {
    setAlertVolume(value);
  };

  // Play a notification sound using Web Audio API
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const volume = outputVolume / 100;

      // Create a pleasant two-tone notification sound
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        // Envelope for smooth sound
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + startTime + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + startTime + duration);

        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + duration);
      };

      // Play two tones for a pleasant "ding" effect
      playTone(880, 0, 0.15);      // A5
      playTone(1108.73, 0.08, 0.2); // C#6 - creates a pleasant major third

    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const handleSoundEffectsToggle = (enabled: boolean) => {
    setSoundEffectsEnabled(enabled);
    if (enabled) {
      playNotificationSound();
    }
  };

  // Resource Manager handlers
  const handleClearCache = async () => {
    setIsClearing(true);
    // Simulate clearing cache
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCacheSize(0);
    setIsClearing(false);
    playNotificationSound();
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    // Simulate clearing all data
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCacheSize(0);
    setStorageUsed(0);
    // Clear localStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.log('Storage clear not supported');
    }
    setIsClearing(false);
    playNotificationSound();
  };

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'display':
        return (
          <div className="preferences-content">
            <h3>Display</h3>

            {/* Brightness Control */}
            <div className="preference-group">
              <div className="preference-label-row">
                <Sun size={18} style={{ marginRight: 8, color: '#666' }} />
                <label>Brightness</label>
                <span className="preference-value">{brightness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={brightness}
                onChange={(e) => handleBrightnessChange(Number(e.target.value))}
                style={{ '--range-progress': `${((brightness - 10) / (100 - 10)) * 100}%` } as React.CSSProperties}
              />
            </div>

            {/* Night Shift Toggle */}
            <div className="preference-group">
              <div className="preference-toggle-row">
                <div className="preference-toggle-left">
                  <Moon size={18} style={{ marginRight: 8, color: '#666' }} />
                  <div>
                    <label>Night Shift</label>
                    <p className="preference-inline-description">
                      Shifts colors to warmer tones after dark
                    </p>
                  </div>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="nightshift"
                    checked={nightShiftEnabled}
                    onChange={(e) => handleNightShiftToggle(e.target.checked)}
                  />
                  <label htmlFor="nightshift"></label>
                </div>
              </div>
            </div>

            {/* Night Shift Intensity (only visible when enabled) */}
            {nightShiftEnabled && (
              <div className="preference-group">
                <div className="preference-label-row">
                  <label>Color Temperature</label>
                  <span className="preference-value">
                    {nightShiftIntensity < 33 ? 'Less Warm' : nightShiftIntensity < 66 ? 'Warm' : 'More Warm'}
                  </span>
                </div>
                <div className="temperature-slider">
                  <span>Less Warm</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={nightShiftIntensity}
                    onChange={(e) => handleNightShiftIntensityChange(Number(e.target.value))}
                    style={{ '--range-progress': `${nightShiftIntensity}%` } as React.CSSProperties}
                  />
                  <span>More Warm</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'sound':
        return (
          <div className="preferences-content">
            <h3>Sound</h3>

            {/* Output Volume */}
            <div className="preference-group">
              <div className="preference-label-row">
                <Volume2 size={18} style={{ marginRight: 8, color: '#666' }} />
                <label>Output Volume</label>
                <span className="preference-value">{outputVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={outputVolume}
                onChange={(e) => handleOutputVolumeChange(Number(e.target.value))}
                style={{ '--range-progress': `${outputVolume}%` } as React.CSSProperties}
              />
            </div>

            {/* Alert Volume */}
            <div className="preference-group">
              <div className="preference-label-row">
                <Bell size={18} style={{ marginRight: 8, color: '#666' }} />
                <label>Alert Volume</label>
                <span className="preference-value">{alertVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={alertVolume}
                onChange={(e) => handleAlertVolumeChange(Number(e.target.value))}
                style={{ '--range-progress': `${alertVolume}%` } as React.CSSProperties}
              />
            </div>

            {/* Sound Effects Toggle */}
            <div className="preference-group">
              <div className="preference-toggle-row">
                <div className="preference-toggle-left">
                  <Volume1 size={18} style={{ marginRight: 8, color: '#666' }} />
                  <label>Play sound effects</label>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="soundeffects"
                    checked={soundEffectsEnabled}
                    onChange={(e) => handleSoundEffectsToggle(e.target.checked)}
                  />
                  <label htmlFor="soundeffects"></label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'resources':
        return (
          <div className="preferences-content">
            <h3>Resource Manager</h3>

            {/* Storage Overview */}
            <div className="preference-group">
              <div className="preference-label-row">
                <Database size={18} style={{ marginRight: 8, color: '#666' }} />
                <label>Storage Overview</label>
              </div>
              <div className="storage-stats">
                <div className="storage-stat">
                  <span className="stat-label">Cache Size</span>
                  <span className="stat-value">{cacheSize.toFixed(1)} MB</span>
                </div>
                <div className="storage-stat">
                  <span className="stat-label">Local Storage</span>
                  <span className="stat-value">{storageUsed.toFixed(1)} MB</span>
                </div>
                <div className="storage-stat">
                  <span className="stat-label">Total Used</span>
                  <span className="stat-value">{(cacheSize + storageUsed).toFixed(1)} MB</span>
                </div>
              </div>
            </div>

            {/* Storage Bar */}
            <div className="preference-group">
              <div className="storage-bar-container">
                <div className="storage-bar">
                  <div
                    className="storage-bar-cache"
                    style={{ width: `${(cacheSize / 200) * 100}%` }}
                  />
                  <div
                    className="storage-bar-data"
                    style={{ width: `${(storageUsed / 200) * 100}%` }}
                  />
                </div>
                <div className="storage-legend">
                  <span><span className="legend-dot cache" /> Cache</span>
                  <span><span className="legend-dot data" /> Data</span>
                  <span><span className="legend-dot free" /> Free</span>
                </div>
              </div>
            </div>

            {/* Clear Actions */}
            <div className="preference-group">
              <div className="preference-label-row">
                <Trash2 size={18} style={{ marginRight: 8, color: '#666' }} />
                <label>Clear Data</label>
              </div>
              <div className="clear-buttons">
                <button
                  className="clear-btn"
                  onClick={handleClearCache}
                  disabled={isClearing || cacheSize === 0}
                >
                  {isClearing ? 'Clearing...' : 'Clear Cache'}
                </button>
                <button
                  className="clear-btn danger"
                  onClick={handleClearAllData}
                  disabled={isClearing}
                >
                  {isClearing ? 'Clearing...' : 'Clear All Data'}
                </button>
              </div>
              <p className="preference-description" style={{ marginLeft: 0, marginTop: 12 }}>
                Clearing cache will remove temporary files. Clearing all data will reset the application.
              </p>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="preferences-content security-panel">
            <h3>Security & Privacy</h3>

            {/* Trust Banner */}
            <div className="trust-banner">
              <div className="trust-banner-icon">
                <Shield size={32} />
              </div>
              <div className="trust-banner-content">
                <h4>Your Privacy is Our Priority</h4>
                <p>Zero data collection. Zero tracking. 100% local storage.</p>
              </div>
              <div className="trust-badges">
                <span className="trust-badge">🔒 Encrypted</span>
                <span className="trust-badge">🛡️ Secure</span>
                <span className="trust-badge">✓ Private</span>
              </div>
            </div>

            {/* Security Features Grid */}
            <div className="security-features-grid">
              <div className="security-feature-card">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                  <Lock size={20} />
                </div>
                <h5>Local-First</h5>
                <p>All data stored securely on your device</p>
              </div>
              <div className="security-feature-card">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
                  <EyeOff size={20} />
                </div>
                <h5>No Tracking</h5>
                <p>Zero analytics or user tracking</p>
              </div>
              <div className="security-feature-card">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
                  <Database size={20} />
                </div>
                <h5>No Servers</h5>
                <p>No backend servers or databases</p>
              </div>
              <div className="security-feature-card">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}>
                  <Shield size={20} />
                </div>
                <h5>Open Source</h5>
                <p>Transparent, auditable code</p>
              </div>
            </div>

            {/* Cookie & Session Controls */}
            <div className="security-section">
              <div className="section-header-new">
                <Cookie size={18} />
                <div>
                  <h4>Cookie & Session Management</h4>
                  <span>Control how your data is stored locally</span>
                </div>
              </div>

              <div className="control-cards">
                <div className="control-card">
                  <div className="control-info">
                    <span className="control-title">Essential Cookies</span>
                    <span className="control-desc">Required for core functionality</span>
                  </div>
                  <span className="control-required">Required</span>
                </div>

                <div className="control-card">
                  <div className="control-info">
                    <span className="control-title">Session Persistence</span>
                    <span className="control-desc">Remember settings between visits</span>
                  </div>
                  <div className="toggle-switch">
                    <input type="checkbox" id="session" checked={sessionDataEnabled} onChange={(e) => setSessionDataEnabled(e.target.checked)} />
                    <label htmlFor="session"></label>
                  </div>
                </div>

                <div className="control-card">
                  <div className="control-info">
                    <span className="control-title">Anonymous Usage Stats</span>
                    <span className="control-desc">Help improve with anonymous data</span>
                  </div>
                  <div className="toggle-switch">
                    <input type="checkbox" id="analytics" checked={analyticsEnabled} onChange={(e) => setAnalyticsEnabled(e.target.checked)} />
                    <label htmlFor="analytics"></label>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Data Rights */}
            <div className="security-section">
              <div className="section-header-new">
                <FileText size={18} />
                <div>
                  <h4>Your Data Rights</h4>
                  <span>You have full control over your data</span>
                </div>
              </div>

              <div className="rights-grid">
                <div className="right-item">
                  <span className="right-icon">📥</span>
                  <div><strong>Right to Access</strong><p>View all stored data</p></div>
                </div>
                <div className="right-item">
                  <span className="right-icon">✏️</span>
                  <div><strong>Right to Rectify</strong><p>Modify your data</p></div>
                </div>
                <div className="right-item">
                  <span className="right-icon">🗑️</span>
                  <div><strong>Right to Erasure</strong><p>Delete all data</p></div>
                </div>
                <div className="right-item">
                  <span className="right-icon">📦</span>
                  <div><strong>Right to Portability</strong><p>Data stays with you</p></div>
                </div>
              </div>
            </div>

            {/* Privacy Policy Accordion */}
            <div className="legal-accordion" onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)}>
              <div className="legal-accordion-header">
                <FileText size={18} style={{ color: '#007AFF' }} />
                <div><strong>Privacy Policy</strong><span>Comprehensive data handling guide</span></div>
              </div>
              <span className={`accordion-arrow ${showPrivacyPolicy ? 'open' : ''}`}>▼</span>
            </div>

            {showPrivacyPolicy && (
              <div className="legal-document">
                <div className="legal-header">
                  <h5>📋 Privacy Policy</h5>
                  <span className="legal-version">Version 1.0 • Effective: January 12, 2026</span>
                </div>

                <div className="legal-section"><h6>1. Introduction</h6>
                  <p>Welcome to macOS Web OS. We are committed to protecting your privacy. This Privacy Policy explains our data handling practices.</p>
                </div>

                <div className="legal-section"><h6>2. Information We Collect</h6>
                  <p><strong>We do not collect any personal information.</strong></p>
                  <ul>
                    <li>No personal data (names, emails, IP addresses)</li>
                    <li>No usage analytics or tracking</li>
                    <li>No third-party cookies</li>
                  </ul>
                </div>

                <div className="legal-section"><h6>3. Local Storage</h6>
                  <p>We use browser storage mechanisms:</p>
                  <ul>
                    <li><strong>localStorage:</strong> Persistent preferences and files</li>
                    <li><strong>sessionStorage:</strong> Temporary session data</li>
                  </ul>
                  <p>This data never leaves your device.</p>
                </div>

                <div className="legal-section"><h6>4. Third-Party Services</h6>
                  <p>No third-party analytics, advertising, or tracking services are used. Your data is never shared.</p>
                </div>

                <div className="legal-section"><h6>5. Data Security</h6>
                  <ul>
                    <li>Your data is protected by your browser's security</li>
                    <li>No data transmission = no interception risks</li>
                    <li>You maintain complete control</li>
                  </ul>
                </div>

                <div className="legal-section"><h6>6. Your Rights</h6>
                  <ul>
                    <li><strong>Access:</strong> View data through browser tools</li>
                    <li><strong>Modification:</strong> Edit data anytime</li>
                    <li><strong>Deletion:</strong> Clear via Resource Manager</li>
                  </ul>
                </div>

                <div className="legal-section"><h6>7. Children's Privacy</h6>
                  <p>No personal data is collected, making this safe for users of all ages.</p>
                </div>

                <div className="legal-section"><h6>8. Policy Updates</h6>
                  <p>Changes will be reflected with an updated effective date. Continued use constitutes acceptance.</p>
                </div>
              </div>
            )}

            {/* Terms of Service Accordion */}
            <div className="legal-accordion" onClick={() => setShowTerms(!showTerms)}>
              <div className="legal-accordion-header">
                <FileText size={18} style={{ color: '#007AFF' }} />
                <div><strong>Terms of Service</strong><span>Usage agreement and conditions</span></div>
              </div>
              <span className={`accordion-arrow ${showTerms ? 'open' : ''}`}>▼</span>
            </div>

            {showTerms && (
              <div className="legal-document">
                <div className="legal-header">
                  <h5>📄 Terms of Service</h5>
                  <span className="legal-version">Version 1.0 • Effective: January 12, 2026</span>
                </div>

                <div className="legal-section"><h6>1. Acceptance of Terms</h6>
                  <p>By using macOS Web OS, you agree to these Terms. If you disagree, please do not use the Application.</p>
                </div>

                <div className="legal-section"><h6>2. Description of Service</h6>
                  <p>A web-based operating system simulation for educational, demonstration, and personal use, running entirely in your browser.</p>
                </div>

                <div className="legal-section"><h6>3. License Grant</h6>
                  <ul>
                    <li>Access and use for personal, non-commercial purposes</li>
                    <li>Store data locally within your browser</li>
                    <li>Customize settings and preferences</li>
                  </ul>
                </div>

                <div className="legal-section"><h6>4. Prohibited Uses</h6>
                  <ul>
                    <li>Use for any illegal purpose</li>
                    <li>Attempt to reverse engineer for malicious purposes</li>
                    <li>Misrepresent as an official Apple product</li>
                  </ul>
                </div>

                <div className="legal-section"><h6>5. Intellectual Property</h6>
                  <p>This is an independent project, not affiliated with Apple Inc. macOS is a trademark of Apple Inc. Created for educational purposes only.</p>
                </div>

                <div className="legal-section"><h6>6. Disclaimer of Warranties</h6>
                  <p className="legal-caps">THE APPLICATION IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.</p>
                </div>

                <div className="legal-section"><h6>7. Limitation of Liability</h6>
                  <p className="legal-caps">WE SHALL NOT BE LIABLE FOR ANY DAMAGES ARISING FROM USE OF THE APPLICATION.</p>
                </div>

                <div className="legal-section"><h6>8. User Responsibility</h6>
                  <ul>
                    <li>Responsible for data you create or store</li>
                    <li>Maintaining backups of important data</li>
                    <li>Compliance with applicable laws</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Compliance Footer */}
            <div className="compliance-footer">
              <div className="compliance-badges">
                <div className="compliance-badge"><span>🌍</span><div><strong>GDPR Ready</strong><span>EU compliant</span></div></div>
                <div className="compliance-badge"><span>🔐</span><div><strong>Privacy First</strong><span>No collection</span></div></div>
                <div className="compliance-badge"><span>✅</span><div><strong>CCPA Aligned</strong><span>CA privacy ready</span></div></div>
              </div>
              <p className="compliance-note">
                <Info size={14} />
                Designed with privacy-by-default principles. All data remains on your device and under your control.
              </p>
            </div>
          </div>
        );

      case 'language':
        // Helper to get locale and currency based on region
        const getRegionFormat = (regionName: string) => {
          const regionMap: { [key: string]: { locale: string; currency: string } } = {
            'United States': { locale: 'en-US', currency: 'USD' },
            'United Kingdom': { locale: 'en-GB', currency: 'GBP' },
            'Canada': { locale: 'en-CA', currency: 'CAD' },
            'Australia': { locale: 'en-AU', currency: 'AUD' },
            'Japan': { locale: 'ja-JP', currency: 'JPY' },
            'China': { locale: 'zh-CN', currency: 'CNY' },
            'India': { locale: 'en-IN', currency: 'INR' },
            'Germany': { locale: 'de-DE', currency: 'EUR' },
            'France': { locale: 'fr-FR', currency: 'EUR' },
            'Italy': { locale: 'it-IT', currency: 'EUR' },
            'Spain': { locale: 'es-ES', currency: 'EUR' },
            'Brazil': { locale: 'pt-BR', currency: 'BRL' },
            'Russia': { locale: 'ru-RU', currency: 'RUB' },
            'South Korea': { locale: 'ko-KR', currency: 'KRW' },
            'Mexico': { locale: 'es-MX', currency: 'MXN' },
            'Netherlands': { locale: 'nl-NL', currency: 'EUR' },
            'Sweden': { locale: 'sv-SE', currency: 'SEK' },
            'Switzerland': { locale: 'de-CH', currency: 'CHF' },
            'Turkey': { locale: 'tr-TR', currency: 'TRY' },
            'Poland': { locale: 'pl-PL', currency: 'PLN' },
            'Saudi Arabia': { locale: 'ar-SA', currency: 'SAR' },
            'United Arab Emirates': { locale: 'ar-AE', currency: 'AED' },
            'Argentina': { locale: 'es-AR', currency: 'ARS' },
            'South Africa': { locale: 'en-ZA', currency: 'ZAR' },
            'Egypt': { locale: 'ar-EG', currency: 'EGP' },
            'Thailand': { locale: 'th-TH', currency: 'THB' },
            'Vietnam': { locale: 'vi-VN', currency: 'VND' },
            'Indonesia': { locale: 'id-ID', currency: 'IDR' },
            'Pakistan': { locale: 'en-PK', currency: 'PKR' },
            'Bangladesh': { locale: 'bn-BD', currency: 'BDT' },
            'Nigeria': { locale: 'en-NG', currency: 'NGN' },
            'New Zealand': { locale: 'en-NZ', currency: 'NZD' },
            'Ireland': { locale: 'en-IE', currency: 'EUR' },
            'Singapore': { locale: 'en-SG', currency: 'SGD' },
            'Portugal': { locale: 'pt-PT', currency: 'EUR' },
            'Greece': { locale: 'el-GR', currency: 'EUR' },
            'Norway': { locale: 'nb-NO', currency: 'NOK' },
            'Denmark': { locale: 'da-DK', currency: 'DKK' },
            'Finland': { locale: 'fi-FI', currency: 'EUR' },
            'Czechia (Czech Republic)': { locale: 'cs-CZ', currency: 'CZK' },
            'Hungary': { locale: 'hu-HU', currency: 'HUF' },
            'Israel': { locale: 'he-IL', currency: 'ILS' },
            'Malaysia': { locale: 'ms-MY', currency: 'MYR' },
            'Philippines': { locale: 'en-PH', currency: 'PHP' },
            'Ukraine': { locale: 'uk-UA', currency: 'UAH' },
            'Colombia': { locale: 'es-CO', currency: 'COP' },
            'Chile': { locale: 'es-CL', currency: 'CLP' },
            'Peru': { locale: 'es-PE', currency: 'PEN' }
          };

          const formatData = regionMap[regionName] || { locale: 'en-US', currency: 'USD' };

          try {
            const date = new Date();
            const dateFormatter = new Intl.DateTimeFormat(formatData.locale, {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric'
            });

            const timeFormatter = new Intl.DateTimeFormat(formatData.locale, {
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric'
            });

            const currencyFormatter = new Intl.NumberFormat(formatData.locale, {
              style: 'currency',
              currency: formatData.currency
            });

            return {
              date: dateFormatter.format(date),
              time: timeFormatter.format(date),
              currency: currencyFormatter.format(1234.56)
            };
          } catch (e) {
            return {
              date: '1/12/2026',
              time: '12:15:03 AM',
              currency: '$1,234.56'
            };
          }
        };

        const formats = getRegionFormat(region);

        return (
          <div className="preferences-content">
            <h3>Language & Region</h3>

            <div className="preference-group">
              <div className="preference-label-row">
                <MessageSquare size={18} style={{ marginRight: 8, color: '#666' }} />
                <label>Preferred Language</label>
              </div>
              <p className="preference-description" style={{ marginLeft: 26, marginBottom: 12 }}>
                Select the primary language for the operating system and applications.
              </p>
              <div className="custom-select-container">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="modern-select"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <div className="select-arrow">▼</div>
              </div>
            </div>

            <div className="preference-group">
              <div className="preference-label-row">
                <Globe size={18} style={{ marginRight: 8, color: '#666' }} />
                <label>Region</label>
              </div>
              <p className="preference-description" style={{ marginLeft: 26, marginBottom: 12 }}>
                Select your region to format dates, times, and currencies correctly.
              </p>
              <div className="custom-select-container">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="modern-select"
                >
                  {regions.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <div className="select-arrow">▼</div>
              </div>
            </div>

            <div className="preference-group">
              <div className="preference-label-row">
                <Calendar size={18} style={{ marginRight: 8, color: '#666' }} />
                <label>First Day of Week</label>
              </div>
              <div className="custom-select-container">
                <select className="modern-select" defaultValue="Sunday">
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                  <option value="Saturday">Saturday</option>
                </select>
                <div className="select-arrow">▼</div>
              </div>
            </div>

            <div className="preview-card">
              <div className="preview-header">Example Formats</div>
              <div className="preview-row">
                <span className="preview-label">Date</span>
                <span className="preview-value">{formats.date}</span>
              </div>
              <div className="preview-row">
                <span className="preview-label">Time</span>
                <span className="preview-value">{formats.time}</span>
              </div>
              <div className="preview-row">
                <span className="preview-label">Currency</span>
                <span className="preview-value">{formats.currency}</span>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="preferences-content">
            <h3>Notifications</h3>
            <div className="coming-soon-container">
              <div className="coming-soon-icon">
                <Bell size={48} />
              </div>
              <div className="coming-soon-title">Coming Soon</div>
              <div className="coming-soon-text">
                Advanced notification management and Focus modes are currently under development. Stay tuned for updates!
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="preferences-content">
            <h3>{preferenceCategories.find(c => c.id === selectedCategory)?.name}</h3>
            <p>Settings for {preferenceCategories.find(c => c.id === selectedCategory)?.description}</p>
          </div>
        );
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .preferences-container {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .preferences-header {
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .preferences-header h2 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }
        
        .preferences-content-wrapper {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        .preferences-sidebar {
          width: 250px;
          background: #f8f8f8;
          border-right: 1px solid #e0e0e0;
          padding: 20px 0;
          overflow-y: auto;
        }
        
        .preference-category {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .preference-category:hover {
          background: #e8e8e8;
        }
        
        .preference-category.active {
          background: #007AFF;
          color: white;
        }
        
        .preference-category-icon {
          margin-right: 12px;
          width: 24px;
          height: 24px;
        }
        
        .preference-category-text {
          flex: 1;
        }
        
        .preference-category-name {
          font-weight: 500;
          font-size: 14px;
        }
        
        .preference-category-description {
          font-size: 12px;
          opacity: 0.8;
          margin-top: 2px;
        }
        
        .preferences-main {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }
        
        .preferences-content h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: #333;
        }
        
        .preference-group {
          margin-bottom: 20px;
        }
        
        .preference-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }
        
        .preference-group input[type="range"] {
          width: 100%;
          max-width: 300px;
        }
        
        .preference-group select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          min-width: 200px;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 39px;
          height: 24px;
          flex-shrink: 0;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
          position: absolute;
        }
        
        .toggle-switch label {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #e9e9eb;
          transition: 0.3s ease;
          border-radius: 12px;
        }
        
        .toggle-switch label:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 2px;
          top: 50%;
          transform: translateY(-50%);
          background-color: white;
          transition: 0.3s ease;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        .toggle-switch input:checked + label {
          background-color: #34c759;
        }
        
        .toggle-switch input:checked + label:before {
          transform: translateY(-50%) translateX(20px);
        }

        /* New preference UI styles */
        .preference-label-row {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }

        .preference-label-row label {
          flex: 1;
          margin-bottom: 0;
        }

        .preference-value {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }

        .preference-status {
          font-size: 13px;
          color: #007AFF;
          font-weight: 500;
        }

        .preference-description {
          font-size: 12px;
          color: #666;
          line-height: 1.5;
          margin: 0 0 12px 26px;
        }

        .preference-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
        }

        .preference-toggle-left {
          display: flex;
          align-items: flex-start;
        }

        .preference-toggle-left label {
          font-weight: 500;
          color: #333;
          margin-bottom: 2px;
        }

        .preference-inline-description {
          font-size: 12px;
          color: #888;
          margin: 0;
          line-height: 1.4;
        }

        .temperature-slider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: 26px;
        }

        .temperature-slider span {
          font-size: 12px;
          color: #666;
          white-space: nowrap;
        }

        .temperature-slider input[type="range"] {
          flex: 1;
        }

        /* Enhanced range slider styling */
        .preference-group input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          max-width: 300px;
          height: 6px;
          border-radius: 5px;
          background: linear-gradient(to right, #007AFF 0%, #007AFF var(--range-progress, 75%), #e0e0e0 var(--range-progress, 75%), #e0e0e0 100%);
          outline: none;
          cursor: pointer;
        }

        .preference-group input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 1px solid #ccc;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
        }

        .preference-group input[type="range"]::-webkit-slider-thumb:hover {
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }

        /* Resource Manager Styles */
        .storage-stats {
          display: flex;
          gap: 24px;
          margin-bottom: 16px;
        }

        .storage-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #888;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .storage-bar-container {
          margin-bottom: 8px;
        }

        .storage-bar {
          height: 20px;
          background: #e8e8e8;
          border-radius: 10px;
          overflow: hidden;
          display: flex;
        }

        .storage-bar-cache {
          background: linear-gradient(135deg, #ff9500, #ff6b00);
          height: 100%;
          transition: width 0.5s ease;
        }

        .storage-bar-data {
          background: linear-gradient(135deg, #007AFF, #0055d4);
          height: 100%;
          transition: width 0.5s ease;
        }

        .storage-legend {
          display: flex;
          gap: 16px;
          margin-top: 8px;
          font-size: 12px;
          color: #666;
        }

        .legend-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 4px;
        }

        .legend-dot.cache {
          background: #ff9500;
        }

        .legend-dot.data {
          background: #007AFF;
        }

        .legend-dot.free {
          background: #e8e8e8;
        }

        .clear-buttons {
          display: flex;
          gap: 12px;
        }

        .clear-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          background: #007AFF;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-btn:hover:not(:disabled) {
          background: #0066dd;
          transform: translateY(-1px);
        }

        .clear-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .clear-btn.danger {
          background: #ff3b30;
        }

        .clear-btn.danger:hover:not(:disabled) {
          background: #e0342b;
        }

        /* Security & Privacy Styles */
        .security-panel {
          max-height: 100%;
          overflow-y: auto;
        }

        .security-card {
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          border: 1px solid #a5d6a7;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .security-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 15px;
          color: #2e7d32;
          margin-bottom: 8px;
        }

        .security-card-text {
          font-size: 13px;
          color: #33691e;
          line-height: 1.5;
          margin: 0;
        }

        .security-section {
          margin-bottom: 24px;
        }

        .security-section h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin: 0 0 12px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #e0e0e0;
        }

        .security-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: #f8f8f8;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .security-toggle-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: #f8f8f8;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .security-link-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: #f8f8f8;
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .security-link-item:hover {
          background: #f0f0f0;
        }

        .security-item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .security-item-title {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .security-item-desc {
          font-size: 12px;
          color: #888;
        }

        .security-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .security-badge.safe {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .security-badge.warning {
          background: #fff3e0;
          color: #e65100;
        }

        .legal-content {
          background: #fafafa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          margin: 8px 0 16px 0;
          font-size: 13px;
          line-height: 1.6;
        }

        .legal-content h5 {
          margin: 0 0 12px 0;
          font-size: 15px;
          color: #333;
        }

        .legal-content p {
          margin: 0 0 12px 0;
          color: #555;
        }

        .legal-content p:last-child {
          margin-bottom: 0;
        }

        .legal-content strong {
          color: #333;
        }

        .security-footer {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px;
          background: #f0f4f8;
          border-radius: 8px;
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }

        .security-footer svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: #007AFF;
        }

        /* NEW Professional Security Styles */
        .trust-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          color: white;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .trust-banner-icon {
          background: rgba(255,255,255,0.2);
          border-radius: 12px;
          padding: 12px;
          display: flex;
        }

        .trust-banner-content h4 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .trust-banner-content p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .trust-badges {
          display: flex;
          gap: 8px;
          margin-left: auto;
        }

        .trust-badge {
          background: rgba(255,255,255,0.2);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .security-features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .security-feature-card {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .security-feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }

        .feature-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          color: white;
        }

        .security-feature-card h5 {
          margin: 0 0 4px 0;
          font-size: 13px;
          font-weight: 600;
          color: #333;
        }

        .security-feature-card p {
          margin: 0;
          font-size: 11px;
          color: #888;
        }

        .section-header-new {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e8e8e8;
        }

        .section-header-new svg {
          color: #007AFF;
          margin-top: 2px;
        }

        .section-header-new h4 {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #333;
        }

        .section-header-new span {
          font-size: 12px;
          color: #888;
        }

        .control-cards {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .control-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: #f8f9fa;
          border-radius: 10px;
          border: 1px solid #e8e8e8;
        }

        .control-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .control-title {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .control-desc {
          font-size: 12px;
          color: #888;
        }

        .control-required {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .rights-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .right-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          background: #f8f9fa;
          border-radius: 10px;
          border: 1px solid #e8e8e8;
        }

        .right-icon {
          font-size: 24px;
        }

        .right-item strong {
          font-size: 13px;
          color: #333;
        }

        .right-item p {
          margin: 2px 0 0 0;
          font-size: 12px;
          color: #888;
        }

        .legal-accordion {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: #f8f9fa;
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .legal-accordion:hover {
          background: #f0f0f0;
        }

        .legal-accordion-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .legal-accordion-header div {
          display: flex;
          flex-direction: column;
        }

        .legal-accordion-header strong {
          font-size: 14px;
          color: #333;
        }

        .legal-accordion-header span {
          font-size: 12px;
          color: #888;
        }

        .accordion-arrow {
          color: #888;
          transition: transform 0.3s;
        }

        .accordion-arrow.open {
          transform: rotate(180deg);
        }

        .legal-document {
          background: #fafafa;
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .legal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e0e0e0;
        }

        .legal-header h5 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }

        .legal-version {
          font-size: 11px;
          color: #888;
          background: #f0f0f0;
          padding: 4px 10px;
          border-radius: 12px;
        }

        .legal-section {
          margin-bottom: 16px;
        }

        .legal-section h6 {
          margin: 0 0 8px 0;
          font-size: 13px;
          font-weight: 600;
          color: #333;
        }

        .legal-section p {
          margin: 0 0 8px 0;
          font-size: 13px;
          line-height: 1.6;
          color: #555;
        }

        .legal-section ul {
          margin: 8px 0;
          padding-left: 20px;
        }

        .legal-section li {
          font-size: 13px;
          line-height: 1.6;
          color: #555;
          margin-bottom: 4px;
        }

        .legal-caps {
          text-transform: uppercase;
          font-size: 11px !important;
          letter-spacing: 0.3px;
        }

        .compliance-footer {
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          border: 1px solid #a5d6a7;
          border-radius: 12px;
          padding: 16px;
          margin-top: 8px;
        }

        .compliance-badges {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .compliance-badge {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .compliance-badge span:first-child {
          font-size: 20px;
        }

        .compliance-badge strong {
          font-size: 12px;
          color: #2e7d32;
          display: block;
        }

        .compliance-badge > div > span {
          font-size: 11px;
          color: #558b2f;
        }

        .compliance-note {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          font-size: 12px;
          color: #33691e;
        }

        .compliance-note svg {
          color: #2e7d32;
          flex-shrink: 0;
        }

        /* Language & Region Styles */
        .custom-select-container {
          position: relative;
          max-width: 300px;
        }

        .modern-select {
          width: 100%;
          padding: 8px 32px 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          font-size: 13px;
          color: #333;
          appearance: none;
          cursor: pointer;
        }

        .modern-select:focus {
          outline: none;
          border-color: #007AFF;
          box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
        }

        .select-arrow {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 10px;
          color: #666;
          pointer-events: none;
        }

        .preview-card {
          background: #f5f5f7;
          border: 1px solid #d1d1d6;
          border-radius: 8px;
          padding: 16px;
          margin-top: 24px;
        }

        .preview-header {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .preview-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .preview-row:last-child {
          border-bottom: none;
        }

        .preview-label {
          font-size: 13px;
          color: #666;
        }

        .preview-value {
          font-size: 13px;
          color: #333;
          font-weight: 500;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .coming-soon-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 400px;
          text-align: center;
          color: #888;
        }

        .coming-soon-icon {
          margin-bottom: 16px;
          background: #f5f5f7;
          border-radius: 50%;
          padding: 24px;
          color: #999;
        }

        .coming-soon-title {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .coming-soon-text {
          font-size: 14px;
          max-width: 300px;
          line-height: 1.5;
        }
      `}</style>

      <div className="preferences-header">
        <h2>System Preferences</h2>
      </div>

      <div className="preferences-content-wrapper">
        <div className="preferences-sidebar">
          {preferenceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className={`preference-category ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <Icon className="preference-category-icon" size={20} />
                <div className="preference-category-text">
                  <div className="preference-category-name">{category.name}</div>
                  <div className="preference-category-description">{category.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="preferences-main">
          {renderCategoryContent()}
        </div>
      </div>
    </div>
  );
};
