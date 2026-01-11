export interface Window {
  id: string;
  title: string;
  app: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export interface App {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<any>;
  defaultWidth: number;
  defaultHeight: number;
}

export interface DockItem {
  id: string;
  name: string;
  icon: string;
  isOpen: boolean;
  appId?: string;
}

export interface MenuItem {
  label: string;
  action?: () => void;
  submenu?: MenuItem[];
  shortcut?: string;
  separator?: boolean;
}

export interface SystemTime {
  hours: string;
  minutes: string;
  period: 'AM' | 'PM';
}
