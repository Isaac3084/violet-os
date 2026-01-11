export interface SystemSettings {
  volume: number;
  brightness: number;
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  darkMode: boolean;
  notificationsEnabled: boolean;
  autoHideDock: boolean;
  batteryLevel: number;
  charging: boolean;
}

export interface Notification {
  id: string;
  app: string;
  title: string;
  subtitle?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  actions?: Array<{
    id: string;
    title: string;
    action: () => void;
  }>;
}

class SystemManager {
  private settings: SystemSettings;
  private notifications: Notification[] = [];
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.settings = {
      volume: 75,
      brightness: 80,
      wifiEnabled: true,
      bluetoothEnabled: true,
      darkMode: false,
      notificationsEnabled: true,
      autoHideDock: false,
      batteryLevel: 85,
      charging: false
    };

    // Start system monitoring
    this.startSystemMonitoring();
  }

  private startSystemMonitoring() {
    // Simulate battery drain
    setInterval(() => {
      if (!this.settings.charging && this.settings.batteryLevel > 0) {
        this.settings.batteryLevel = Math.max(0, this.settings.batteryLevel - 0.1);
        this.emit('batteryChanged', this.settings.batteryLevel);
      }
    }, 30000); // Every 30 seconds

    // Simulate charging when plugged in
    setInterval(() => {
      if (this.settings.charging && this.settings.batteryLevel < 100) {
        this.settings.batteryLevel = Math.min(100, this.settings.batteryLevel + 2);
        this.emit('batteryChanged', this.settings.batteryLevel);
      }
    }, 5000); // Every 5 seconds

    // Generate random notifications
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every minute
        this.generateRandomNotification();
      }
    }, 60000); // Every minute
  }

  private generateRandomNotification() {
    const apps = ['Mail', 'Messages', 'Calendar', 'Reminders', 'System'];
    const messages = [
      { title: 'New message', subtitle: 'You have a new message' },
      { title: 'Meeting reminder', subtitle: 'Meeting starts in 15 minutes' },
      { title: 'Download complete', subtitle: 'Your download has finished' },
      { title: 'System update', subtitle: 'macOS 26.1 is available' },
      { title: 'Storage almost full', subtitle: 'Only 2GB of space remaining' }
    ];

    const app = apps[Math.floor(Math.random() * apps.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];

    this.addNotification({
      app,
      title: message.title,
      subtitle: message.subtitle,
      content: `${message.title}: ${message.subtitle}`,
      timestamp: new Date(),
      isRead: false
    });
  }

  // Settings management
  public getSettings(): SystemSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<SystemSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.emit('settingsChanged', this.settings);
  }

  public setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(100, volume));
    this.emit('volumeChanged', this.settings.volume);
  }

  public setBrightness(brightness: number): void {
    this.settings.brightness = Math.max(0, Math.min(100, brightness));
    this.emit('brightnessChanged', this.settings.brightness);
  }

  public toggleWifi(): void {
    this.settings.wifiEnabled = !this.settings.wifiEnabled;
    this.emit('wifiChanged', this.settings.wifiEnabled);
    
    if (this.settings.wifiEnabled) {
      this.addNotification({
        app: 'System',
        title: 'Wi-Fi Connected',
        content: 'Connected to Home Network',
        timestamp: new Date(),
        isRead: false
      });
    }
  }

  public toggleBluetooth(): void {
    this.settings.bluetoothEnabled = !this.settings.bluetoothEnabled;
    this.emit('bluetoothChanged', this.settings.bluetoothEnabled);
  }

  public toggleDarkMode(): void {
    this.settings.darkMode = !this.settings.darkMode;
    this.emit('darkModeChanged', this.settings.darkMode);
    
    this.addNotification({
      app: 'System',
      title: this.settings.darkMode ? 'Dark Mode Enabled' : 'Light Mode Enabled',
      content: `Appearance changed to ${this.settings.darkMode ? 'Dark' : 'Light'} Mode`,
      timestamp: new Date(),
      isRead: false
    });
  }

  public setCharging(charging: boolean): void {
    this.settings.charging = charging;
    this.emit('chargingChanged', this.settings.charging);
  }

  // Notification management
  public addNotification(notification: Omit<Notification, 'id'>): void {
    const fullNotification: Notification = {
      ...notification,
      id: Date.now().toString()
    };

    this.notifications.unshift(fullNotification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.emit('notificationAdded', fullNotification);
  }

  public getNotifications(): Notification[] {
    return [...this.notifications];
  }

  public markNotificationAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      this.emit('notificationRead', id);
    }
  }

  public markAllNotificationsAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.emit('allNotificationsRead');
  }

  public clearNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.emit('notificationCleared', id);
  }

  public clearAllNotifications(): void {
    this.notifications = [];
    this.emit('allNotificationsCleared');
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  // Event system
  public on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off(event: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // System utilities
  public openApp(appId: string): void {
    this.emit('appOpened', appId);
    this.addNotification({
      app: 'System',
      title: `${appId} opened`,
      content: `Application ${appId} has been launched`,
      timestamp: new Date(),
      isRead: false
    });
  }

  public closeApp(appId: string): void {
    this.emit('appClosed', appId);
  }

  public getSystemInfo(): any {
    return {
      osVersion: 'macOS 26.0.0',
      build: '23A344',
      model: 'MacBook Pro',
      processor: 'Apple M3 Pro',
      memory: '16 GB',
      storage: '512 GB SSD',
      graphics: 'Apple M3 Pro GPU',
      serialNumber: 'XXXXXXXXXXXX',
      uuid: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
    };
  }

  public getNetworkInfo(): any {
    return {
      wifi: {
        enabled: this.settings.wifiEnabled,
        connected: this.settings.wifiEnabled,
        network: 'Home Network',
        signalStrength: 85,
        ipAddress: '192.168.1.100',
        subnet: '255.255.255.0',
        router: '192.168.1.1'
      },
      ethernet: {
        enabled: false,
        connected: false
      },
      bluetooth: {
        enabled: this.settings.bluetoothEnabled,
        devices: [
          { name: 'AirPods Pro', connected: true, battery: 85 },
          { name: 'Magic Mouse', connected: true, battery: 60 },
          { name: 'iPhone 15', connected: false, battery: 42 }
        ]
      }
    };
  }

  public getStorageInfo(): any {
    return {
      total: 512000000000, // 512 GB in bytes
      used: 256000000000,  // 256 GB used
      available: 256000000000, // 256 GB available
      breakdown: {
        system: 50000000000,    // 50 GB
        applications: 80000000000, // 80 GB
        documents: 30000000000,   // 30 GB
        photos: 60000000000,     // 60 GB
        music: 20000000000,      // 20 GB
        other: 16000000000       // 16 GB
      }
    };
  }

  public getProcessInfo(): any[] {
    return [
      { name: 'Safari', pid: 1234, cpu: 15.2, memory: 256, status: 'Running' },
      { name: 'Finder', pid: 567, cpu: 8.5, memory: 128, status: 'Running' },
      { name: 'Mail', pid: 890, cpu: 12.1, memory: 192, status: 'Running' },
      { name: 'Notes', pid: 123, cpu: 3.2, memory: 64, status: 'Running' },
      { name: 'Terminal', pid: 456, cpu: 1.8, memory: 32, status: 'Running' },
      { name: 'Calculator', pid: 789, cpu: 0.5, memory: 16, status: 'Running' }
    ];
  }
}

// Singleton instance
export const systemManager = new SystemManager();
