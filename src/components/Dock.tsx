import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import {
  Folder,
  Globe,
  Mail,
  Calendar,
  Image,
  Music,
  FileText,
  Calculator,
  Terminal,
  Settings,
  Trash2
} from 'lucide-react';

interface DockItemProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onClick: (id: string) => void;
  mouseX: MotionValue;
}

interface DockProps {
  onItemClick: (appId: string) => void;
  openApps: string[];
  anyWindowMaximized: boolean;
}

const apps = [
  { id: 'finder', name: 'Finder', icon: <Folder size={24} color="#00C7FC" fill="#00C7FC" fillOpacity={0.2} /> },
  { id: 'safari', name: 'Safari', icon: <Globe size={24} color="#1CA1F2" /> },
  { id: 'mail', name: 'Mail', icon: <Mail size={24} color="#2196F3" /> },
  { id: 'calendar', name: 'Calendar', icon: <Calendar size={24} color="#E91E63" /> },
  { id: 'photos', name: 'Photos', icon: <Image size={24} color="#FF9800" /> },
  { id: 'music', name: 'Music', icon: <Music size={24} color="#F44336" /> },
  { id: 'notes', name: 'Notes', icon: <FileText size={24} color="#FFC107" /> },
  { id: 'calculator', name: 'Calculator', icon: <Calculator size={24} color="#4CAF50" /> },
  { id: 'terminal', name: 'Terminal', icon: <Terminal size={24} color="#607D8B" /> },
  { id: 'preferences', name: 'System Settings', icon: <Settings size={24} color="#9E9E9E" /> },
];

const DockItem = ({ id, name, icon, isOpen, onClick, mouseX }: DockItemProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [50, 80, 50]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      className="dock-item"
      onClick={() => onClick(id)}
    >
      <div className="dock-item-inner">
        {icon}
        {isOpen && <div className="dot" />}
      </div>
      <div className="tooltip">{name}</div>
    </motion.div>
  );
};

export const Dock: React.FC<DockProps> = ({ onItemClick, openApps, anyWindowMaximized }) => {
  const mouseX = useMotionValue(Infinity);
  const [isHoveringBottom, setIsHoveringBottom] = React.useState(false);

  // Logic: Hidden if anyMaximized AND !isHoveringBottom
  const isHidden = anyWindowMaximized && !isHoveringBottom;

  React.useEffect(() => {
    // We only need to track mouse leaving the bottom area to hide it again
    const handleMouseMove = (e: MouseEvent) => {
      // If dock is visible (isHoveringBottom true), keep it visible as long as mouse is in the bottom region (dock + gap)
      if (anyWindowMaximized && isHoveringBottom) {
        const keepOpenThreshold = window.innerHeight - 120; // Dock height + buffer
        if (e.clientY < keepOpenThreshold) {
          setIsHoveringBottom(false);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [anyWindowMaximized, isHoveringBottom]);

  return (
    <>
      <style>{`
        .dock-container {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          padding: 12px;
          gap: 12px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(25px) saturate(200%);
          -webkit-backdrop-filter: blur(25px) saturate(200%);
          border-radius: 20px;
          box-shadow: 
            0 10px 30px rgba(0,0,0,0.2), 
            0 0 0 1px rgba(255,255,255,0.2) inset;
          z-index: 1000;
          align-items: flex-end;
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), bottom 0.4s ease, opacity 0.3s ease;
        }

        /* When hidden, move it down out of view */
        .dock-container.hidden {
          transform: translateX(-50%) translateY(150%);
          opacity: 0;
          pointer-events: none;
        }

        /* The Thin Line Trigger */
        .dock-trigger-handle {
          position: fixed;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 4px; /* Thin horizontal line */
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          z-index: 999;
          transition: all 0.3s ease;
          cursor: pointer;
          opacity: 0; /* Hidden by default */
          pointer-events: none;
        }
        
        /* Only show handle when maximized and dock is hidden (or about to be shown) */
        .dock-trigger-handle.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .dock-trigger-handle:hover {
          background: rgba(0, 0, 0, 0.6);
          width: 140px;
          height: 6px;
        }

        /* Dark mode adjustment for the handle */
        @media (prefers-color-scheme: dark) {
          .dock-trigger-handle {
            background: rgba(255, 255, 255, 0.3);
          }
          .dock-trigger-handle:hover {
            background: rgba(255, 255, 255, 0.6);
          }
        }

        .dock-item {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
        }

        .dock-item-inner {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          transition: background 0.2s;
        }
        
        .dock-item:hover .dock-item-inner {
          background: rgba(255, 255, 255, 0.6);
        }

        .dot {
          position: absolute;
          bottom: -8px;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .tooltip {
          position: absolute;
          top: -40px;
          background: rgba(0,0,0,0.6);
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
          white-space: nowrap;
          backdrop-filter: blur(4px);
        }

        .dock-item:hover .tooltip {
          opacity: 1;
        }
        
        .dock-separator {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.3);
          margin: 0 4px;
          align-self: center;
        }

        @media (max-width: 768px) {
          .dock-container {
            padding: 8px;
            gap: 6px;
            bottom: 10px;
            max-width: 95vw;
            overflow-x: auto;
            justify-content: flex-start;
          }
          
          .dock-item {
            width: 40px !important;
            height: 40px !important;
            flex-shrink: 0;
          }
          
          .dock-separator {
            height: 24px;
          }
        }
      `}</style>

      {/* The visible handle to trigger dock when hidden */}
      <div
        className={`dock-trigger-handle ${anyWindowMaximized && !isHoveringBottom ? 'visible' : ''}`}
        onMouseEnter={() => setIsHoveringBottom(true)}
      />

      <motion.div
        className={`dock-container ${isHidden ? 'hidden' : ''}`}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {apps.map((app) => (
          <DockItem
            key={app.id}
            {...app}
            isOpen={openApps.includes(app.id)}
            onClick={onItemClick}
            mouseX={mouseX}
          />
        ))}

        <div className="dock-separator" />

        <DockItem
          id="trash"
          name="Trash"
          icon={<Trash2 size={24} color="#E0E0E0" />}
          isOpen={false}
          onClick={() => { }}
          mouseX={mouseX}
        />
      </motion.div>
    </>
  );
};
