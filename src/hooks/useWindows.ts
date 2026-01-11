import { useState, useCallback } from 'react';
import { Window } from '../types';

export const useWindows = () => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);

  const createWindow = useCallback((windowData: Omit<Window, 'id' | 'zIndex' | 'isMinimized' | 'isMaximized'>) => {
    const newWindow: Window = {
      ...windowData,
      id: `window-${Date.now()}`,
      zIndex: nextZIndex,
      isMinimized: false,
      isMaximized: false,
    };
    
    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
    
    return newWindow.id;
  }, [nextZIndex]);

  const closeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
  }, []);

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: true } : w
    ));
  }, []);

  const maximizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const restoreWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: false } : w
    ));
  }, []);

  const focusWindow = useCallback((windowId: string) => {
    setWindows(prev => {
      const maxZIndex = Math.max(...prev.map(w => w.zIndex));
      return prev.map(w => 
        w.id === windowId ? { ...w, zIndex: maxZIndex + 1 } : w
      );
    });
    setNextZIndex(prev => prev + 1);
  }, []);

  const moveWindow = useCallback((windowId: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, x, y } : w
    ));
  }, []);

  const resizeWindow = useCallback((windowId: string, width: number, height: number) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, width, height } : w
    ));
  }, []);

  return {
    windows,
    createWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
  };
};
