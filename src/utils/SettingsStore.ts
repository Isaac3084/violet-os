// Global Settings Store for macOS Web OS
// Manages system-wide settings like brightness, night shift, etc.
// All settings are persisted to localStorage for FREE, privacy-friendly storage

type SettingsListener = () => void;

const STORAGE_KEY = 'macos-web-settings';

interface SystemSettings {
    brightness: number; // 0-100
    nightShiftEnabled: boolean;
    nightShiftIntensity: number; // 0-100
    volume: number; // 0-100
}

const defaultSettings: SystemSettings = {
    brightness: 100,
    nightShiftEnabled: false,
    nightShiftIntensity: 50,
    volume: 75,
};

class SettingsStoreClass {
    private settings: SystemSettings;
    private listeners: SettingsListener[] = [];

    constructor() {
        // Load settings from localStorage or use defaults
        this.settings = this.loadFromStorage();
    }

    private loadFromStorage(): SystemSettings {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults to handle any new settings
                return { ...defaultSettings, ...parsed };
            }
        } catch (e) {
            console.log('Could not load settings from storage');
        }
        return { ...defaultSettings };
    }

    private saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
        } catch (e) {
            console.log('Could not save settings to storage');
        }
    }

    subscribe(listener: SettingsListener): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(listener => listener());
        this.applyVisualSettings();
        this.saveToStorage(); // Persist on every change
    }

    // Apply visual effects to the document
    private applyVisualSettings() {
        const root = document.documentElement;

        // Apply brightness as an overlay filter
        const brightnessValue = this.settings.brightness / 100;
        root.style.setProperty('--system-brightness', `${brightnessValue}`);

        // Apply night shift as a warm overlay
        if (this.settings.nightShiftEnabled) {
            const intensity = this.settings.nightShiftIntensity / 100;
            // Stronger effect: 0.2 base + up to 0.6 more based on intensity
            root.style.setProperty('--night-shift-opacity', `${0.2 + (intensity * 0.6)}`);
        } else {
            root.style.setProperty('--night-shift-opacity', '0');
        }
    }

    // Getters
    getBrightness(): number {
        return this.settings.brightness;
    }

    isNightShiftEnabled(): boolean {
        return this.settings.nightShiftEnabled;
    }

    getNightShiftIntensity(): number {
        return this.settings.nightShiftIntensity;
    }

    getVolume(): number {
        return this.settings.volume;
    }

    getAllSettings(): SystemSettings {
        return { ...this.settings };
    }

    // Setters
    setBrightness(value: number) {
        this.settings.brightness = Math.max(10, Math.min(100, value)); // Min 10% to keep visible
        this.notify();
    }

    setNightShiftEnabled(enabled: boolean) {
        this.settings.nightShiftEnabled = enabled;
        this.notify();
    }

    setNightShiftIntensity(value: number) {
        this.settings.nightShiftIntensity = Math.max(0, Math.min(100, value));
        this.notify();
    }

    setVolume(value: number) {
        this.settings.volume = Math.max(0, Math.min(100, value));
        this.notify();
    }

    // Reset all settings to defaults
    resetToDefaults() {
        this.settings = { ...defaultSettings };
        this.notify();
    }

    // Initialize on app start
    initialize() {
        this.applyVisualSettings();
    }
}

export const settingsStore = new SettingsStoreClass();
