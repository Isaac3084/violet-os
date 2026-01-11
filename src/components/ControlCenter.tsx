import React, { useState } from 'react';
import {
  Wifi,
  Volume2,
  Moon,
  Sun,
  Bluetooth,
  Music,
  Share2,
  Cast,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ControlCenterProps {
  isVisible: boolean;
  onClose: () => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({ isVisible, onClose }) => {
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [airdropEnabled, setAirdropEnabled] = useState(false);
  const [volume, setVolume] = useState(75);
  const [brightness, setBrightness] = useState(80);
  const [focusMode, setFocusMode] = useState(false);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            className="control-center-overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="control-center-container"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <style>{`
              .control-center-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 9998;
                background: transparent;
              }

              .control-center-container {
                position: fixed;
                top: 36px;
                right: 12px;
                width: 340px;
                background: rgba(230, 230, 230, 0.65);
                backdrop-filter: blur(40px) saturate(200%);
                -webkit-backdrop-filter: blur(40px) saturate(200%);
                border-radius: 18px;
                box-shadow: 
                  0 0 0 1px rgba(255, 255, 255, 0.2) inset,
                  0 20px 40px rgba(0, 0, 0, 0.2);
                padding: 12px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                color: #000;
              }

              @media (max-width: 480px) {
                .control-center-container {
                  width: calc(100vw - 24px);
                  right: 12px;
                  left: 12px;
                }
              }

              .cc-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
              }

              .cc-card {
                background: rgba(255, 255, 255, 0.5);
                border-radius: 14px;
                padding: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                transition: transform 0.1s;
              }
              
              .cc-card:active {
                transform: scale(0.98);
              }

              .cc-connectivity {
                grid-column: 1 / span 1;
                display: flex;
                flex-direction: column;
                gap: 8px;
              }

              .cc-toggle-row {
                display: flex;
                align-items: center;
                gap: 10px;
              }

              .cc-toggle-icon {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.05);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                cursor: pointer;
              }

              .cc-toggle-icon.active {
                background: #007AFF;
                color: white;
                box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
              }

              .cc-toggle-label {
                font-size: 13px;
                font-weight: 500;
                flex: 1;
              }
              
              .cc-toggle-status {
                font-size: 11px;
                color: rgba(0,0,0,0.5);
              }

              .cc-media {
                grid-column: 2 / span 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
              }
              
              .media-icon {
                font-size: 32px;
                margin-bottom: 4px;
                color: rgba(0,0,0,0.2);
              }
              
              .media-title {
                font-size: 13px;
                font-weight: 600;
                opacity: 0.6;
              }

              .media-controls {
                 display: flex;
                 gap: 12px;
                 margin-top: 8px;
                 opacity: 0.4;
              }

              .cc-sliders {
                display: flex;
                flex-direction: column;
                gap: 12px;
              }

              .cc-slider-container {
                background: rgba(255, 255, 255, 0.5);
                border-radius: 14px;
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 8px;
              }
              
              .cc-slider-header {
                 font-size: 12px;
                 font-weight: 600;
                 color: rgba(0,0,0,0.5);
                 text-transform: uppercase;
                 letter-spacing: 0.5px;
              }

              .cc-slider-track {
                height: 24px;
                background: rgba(0,0,0,0.05);
                border-radius: 12px;
                position: relative;
                overflow: hidden;
                cursor: pointer;
              }
              
              .cc-slider-fill {
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                background: white;
                box-shadow: 2px 0 8px rgba(0,0,0,0.05);
              }
              
              .cc-slider-icon {
                position: absolute;
                left: 8px;
                top: 50%;
                transform: translateY(-50%);
                z-index: 2;
                color: #666;
                pointer-events: none;
              }

              .slider-input {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                cursor: pointer;
              }
              
              .focus-mode {
                 background: rgba(255,255,255,0.5);
                 border-radius: 14px;
                 padding: 12px 16px;
                 display: flex;
                 align-items: center;
                 gap: 12px;
                 cursor: pointer;
              }
              
              .focus-icon {
                 display: flex;
                 align-items: center;
                 justify-content: center;
                 width: 28px;
                 height: 28px;
                 background: rgba(0,0,0,0.1);
                 border-radius: 50%;
                 color: inherit;
              }
              
              .focus-mode.active .focus-icon {
                 background: #5856D6;
                 color: white;
              }
            `}</style>

            <div className="cc-grid">
              <div className="cc-card cc-connectivity">
                <div className="cc-toggle-row">
                  <div
                    className={`cc-toggle-icon ${wifiEnabled ? 'active' : ''}`}
                    onClick={() => setWifiEnabled(!wifiEnabled)}
                  >
                    <Wifi size={16} />
                  </div>
                  <div className="cc-info">
                    <div className="cc-toggle-label">Wi-Fi</div>
                    <div className="cc-toggle-status">{wifiEnabled ? 'Home Network' : 'Off'}</div>
                  </div>
                </div>

                <div className="cc-toggle-row">
                  <div
                    className={`cc-toggle-icon ${bluetoothEnabled ? 'active' : ''}`}
                    onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
                  >
                    <Bluetooth size={16} />
                  </div>
                  <div className="cc-info">
                    <div className="cc-toggle-label">Bluetooth</div>
                    <div className="cc-toggle-status">{bluetoothEnabled ? 'On' : 'Off'}</div>
                  </div>
                </div>

                <div className="cc-toggle-row">
                  <div
                    className={`cc-toggle-icon ${airdropEnabled ? 'active' : ''}`}
                    onClick={() => setAirdropEnabled(!airdropEnabled)}
                  >
                    <Share2 size={16} />
                  </div>
                  <div className="cc-info">
                    <div className="cc-toggle-label">AirDrop</div>
                    <div className="cc-toggle-status">{airdropEnabled ? 'Contacts' : 'Off'}</div>
                  </div>
                </div>
              </div>

              <div className="cc-card cc-media">
                <div style={{ opacity: 0.8, marginBottom: 8 }}>
                  <Music size={32} />
                </div>
                <div className="media-title">Not Playing</div>
                <div className="media-controls">
                  <Cast size={16} />
                  <Maximize2 size={16} />
                </div>
              </div>
            </div>

            <div
              className={`focus-mode ${focusMode ? 'active' : ''}`}
              onClick={() => setFocusMode(!focusMode)}
            >
              <div className="focus-icon"><Moon size={16} /></div>
              <div style={{ flex: 1, fontWeight: 500 }}>Focus</div>
              <div style={{ fontSize: 13, opacity: 0.5 }}>{focusMode ? 'On' : 'Off'}</div>
            </div>

            <div className="cc-card cc-sliders">
              <div className="cc-slider-header">Display</div>
              <div className="cc-slider-track">
                <div className="cc-slider-fill" style={{ width: `${brightness}%` }} />
                <Sun size={14} className="cc-slider-icon" />
                <input
                  type="range"
                  className="slider-input"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                />
              </div>

              <div className="cc-slider-header" style={{ marginTop: 8 }}>Sound</div>
              <div className="cc-slider-track">
                <div className="cc-slider-fill" style={{ width: `${volume}%` }} />
                <Volume2 size={14} className="cc-slider-icon" />
                <input
                  type="range"
                  className="slider-input"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                />
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
