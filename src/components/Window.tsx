import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Window as WindowType } from '../types';
import { X, Minus, Square } from 'lucide-react';

interface WindowProps {
  window: WindowType;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({
  window: windowState,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onResize,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        let newX = windowState.x + deltaX;
        let newY = windowState.y + deltaY;

        // Boundary constraints
        // X: Allow moving mostly off screen but keep 50px visible
        // Y: Don't allow going above menu bar (32px), allow going down but keep titlebar visible
        const minX = -(windowState.width - 50);
        const maxX = window.innerWidth - 50;
        const minY = 32; // Menu bar height
        const maxY = window.innerHeight - 50;

        newX = Math.min(Math.max(newX, minX), maxX);
        newY = Math.min(Math.max(newY, minY), maxY);

        onMove(windowState.id, newX, newY);
        setDragStart({ x: e.clientX, y: e.clientY });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, windowState.id, windowState.x, windowState.y, windowState.width, onMove]);

  useEffect(() => {
    if (isResizing) {
      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        // Enforce minimum size
        const newWidth = Math.max(300, resizeStart.width + deltaX);
        const newHeight = Math.max(200, resizeStart.height + deltaY);
        onResize(windowState.id, newWidth, newHeight);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, resizeStart, windowState.id, onResize]);

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if (!windowState.isMaximized) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      onFocus(windowState.id);
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!windowState.isMaximized) {
      setIsResizing(true);
      setResizeStart({
        width: windowState.width,
        height: windowState.height,
        x: e.clientX,
        y: e.clientY,
      });
      e.stopPropagation();
      onFocus(windowState.id);
    }
  };

  return (
    <AnimatePresence>
      {!windowState.isMinimized && (
        <motion.div
          ref={windowRef}
          className={`window ${windowState.isMaximized ? 'maximized' : ''} ${isDragging ? 'dragging' : ''}`}
          style={{
            left: windowState.x,
            top: windowState.y,
            width: windowState.width,
            height: windowState.height,
            zIndex: windowState.zIndex,
          }}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          onClick={() => onFocus(windowState.id)}
        >
          <div className="window-titlebar" onMouseDown={handleTitleBarMouseDown}>
            <div className="window-controls">
              <div
                className="window-control close"
                onClick={(e) => { e.stopPropagation(); onClose(windowState.id); }}
              >
                <X size={8} strokeWidth={4} />
              </div>
              <div
                className="window-control minimize"
                onClick={(e) => { e.stopPropagation(); onMinimize(windowState.id); }}
              >
                <Minus size={8} strokeWidth={4} />
              </div>
              <div
                className="window-control maximize"
                onClick={(e) => { e.stopPropagation(); onMaximize(windowState.id); }}
              >
                <div style={{ transform: 'rotate(45deg)' }}>
                  {windowState.isMaximized ? <Minus size={8} strokeWidth={4} /> : <Square size={6} fill="currentColor" strokeWidth={0} />}
                </div>
              </div>
            </div>
            <div className="window-title">{windowState.title}</div>
          </div>
          <div className="window-content">
            {children}
          </div>
          {!windowState.isMaximized && (
            <div
              className="resize-handle"
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '15px',
                height: '15px',
                cursor: 'nwse-resize',
                zIndex: 10
              }}
              onMouseDown={handleResizeMouseDown}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
