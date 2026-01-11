export interface SecurityReport {
    isSecure: boolean;
    protocol: 'HTTPS' | 'HTTP' | 'LOCAL';
    certificate?: {
        issuer: string;
        validFrom: string;
        validTo: string;
        strength: string;
    };
    threats: string[];
    latency: number;
}

const TRUSTED_ISSUERS = [
    "DigiCert High Assurance EV Root CA",
    "Let's Encrypt Authority X3",
    "Google Internet Authority G3",
    "Apple Public EV Server RSA CA",
    "Cloudflare Inc ECC CA-3"
];

export class SecurityEngine {
    private static browserAgent = navigator.userAgent;

    /**
     * Simulates a handshake and certificate exchange with the target host.
     * Leverages the host browser's capabilities where possible (conceptually).
     */
    static async analyzeUrl(url: string): Promise<SecurityReport> {
        const startTime = performance.now();

        // Simulate network handshake latency
        const processingTime = Math.random() * 500 + 200;
        await new Promise(resolve => setTimeout(resolve, processingTime));

        let protocol: 'HTTPS' | 'HTTP' | 'LOCAL' = 'LOCAL';
        if (url.startsWith('https://')) protocol = 'HTTPS';
        else if (url.startsWith('http://')) protocol = 'HTTP';

        const domain = this.extractDomain(url);
        const isLocal = domain === 'localhost' || domain === 'about:blank' || !domain;

        if (isLocal) {
            return {
                isSecure: true,
                protocol: 'LOCAL',
                threats: [],
                latency: 0
            };
        }

        // Security Logic
        const threats: string[] = [];
        const isSecure = protocol === 'HTTPS';

        if (!isSecure) {
            threats.push('Unencrypted Transport Layer');
        }

        // Simulate looking up certificate from the "Browser Environment"
        // In a real scenario, we can't access this via JS, so we simulate a valid check.
        const certificate = isSecure ? {
            issuer: TRUSTED_ISSUERS[Math.floor(Math.random() * TRUSTED_ISSUERS.length)],
            validFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toLocaleDateString(), // 30 days ago
            validTo: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toLocaleDateString(), // 90 days future
            strength: 'SHA-256 / RSA-2048'
        } : undefined;

        return {
            isSecure,
            protocol,
            certificate,
            threats,
            latency: Math.round(performance.now() - startTime)
        };
    }

    static getEnvironmentInfo() {
        // Detect host browser to "inherit" security context
        let browser = "Unknown Browser";
        if (this.browserAgent.includes("Chrome")) browser = "Google Chrome";
        if (this.browserAgent.includes("Firefox")) browser = "Mozilla Firefox";
        if (this.browserAgent.includes("Safari") && !this.browserAgent.includes("Chrome")) browser = "Apple Safari";
        if (this.browserAgent.includes("Edg")) browser = "Microsoft Edge";

        return {
            hostBrowser: browser,
            engine: navigator.vendor || "Gecko",
            platform: navigator.platform
        };
    }

    private static extractDomain(url: string): string {
        try {
            return new URL(url).hostname;
        } catch {
            return '';
        }
    }
}
