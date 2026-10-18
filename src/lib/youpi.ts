/**
 * YouPI-PG Client Integration Helper
 * 
 * Manages loading the YouPI sovereign payment gateway client script (youpi.js)
 * and triggering the dynamic QR modal / mobile drawer with real-time verification.
 */

declare global {
  interface Window {
    YouPI?: {
      openCheckout: (options: YoupiCheckoutOptions) => void;
      closeCheckout?: () => void;
    };
  }
}

export interface YoupiCheckoutOptions {
  key: string;
  orderId: string;
  amount: number;
  currency?: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  notes?: Record<string, any>;
  onSuccess?: (response: YoupiSuccessPayload) => void;
  onFailure?: (error: any) => void;
  onCancel?: () => void;
}

export interface YoupiSuccessPayload {
  orderId: string;
  transactionId: string;
  utr?: string;
  amount: number;
  currency: string;
  signature?: string;
}

const DEFAULT_YOUPI_URL = (import.meta.env.VITE_YOUPI_URL || '').replace(/\/+$/, '');
const DEFAULT_YOUPI_KEY = import.meta.env.VITE_YOUPI_PUBLIC_KEY || '';

/**
 * Checks whether YouPI Gateway environment variables or settings are available.
 */
export function isYoupiConfigured(overrideUrl?: string, overrideKey?: string): boolean {
  const url = overrideUrl || DEFAULT_YOUPI_URL;
  const key = overrideKey || DEFAULT_YOUPI_KEY;
  return Boolean(url && key);
}

/**
 * Returns the effective YouPI gateway URL and Merchant Key.
 */
export function getYoupiConfig(overrideUrl?: string, overrideKey?: string) {
  return {
    apiUrl: (overrideUrl || DEFAULT_YOUPI_URL || '').replace(/\/+$/, ''),
    merchantKey: overrideKey || DEFAULT_YOUPI_KEY || '',
  };
}

let scriptLoadingPromise: Promise<boolean> | null = null;

/**
 * Dynamically loads the youpi.js script from the self-hosted gateway instance.
 */
export function loadYoupiScript(gatewayUrl?: string): Promise<boolean> {
  const url = (gatewayUrl || DEFAULT_YOUPI_URL).replace(/\/+$/, '');
  if (!url) return Promise.resolve(false);

  if (window.YouPI) {
    return Promise.resolve(true);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve) => {
    const existing = document.querySelector(`script[src^="${url}/youpi.js"]`);
    if (existing) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `${url}/youpi.js`;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load YouPI gateway script from:', url);
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

/**
 * Programmatically triggers the YouPI checkout modal or bottom drawer.
 */
export async function launchYoupiPayment(params: {
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  gatewayUrl?: string;
  merchantKey?: string;
}): Promise<YoupiSuccessPayload> {
  const config = getYoupiConfig(params.gatewayUrl, params.merchantKey);

  if (!config.apiUrl || !config.merchantKey) {
    throw new Error('YouPI Payment Gateway is not configured. Missing gateway URL or public key.');
  }

  const loaded = await loadYoupiScript(config.apiUrl);
  if (!loaded || !window.YouPI) {
    throw new Error('Could not initialize YouPI Payment Gateway script. Please check server connectivity.');
  }

  return new Promise((resolve, reject) => {
    let resolved = false;

    // Listen for custom window event emitted by youpi.js
    const handleSuccessEvent = (event: any) => {
      if (event.detail && (event.detail.orderId === params.orderId || !event.detail.orderId)) {
        cleanup();
        resolved = true;
        resolve({
          orderId: params.orderId,
          transactionId: event.detail.transactionId || event.detail.utr || `YOUPI-${Date.now()}`,
          utr: event.detail.utr || event.detail.transactionId,
          amount: params.amount,
          currency: 'INR',
          signature: event.detail.signature,
        });
      }
    };

    const handleFailureEvent = (event: any) => {
      cleanup();
      resolved = true;
      reject(new Error(event?.detail?.message || 'Payment failed or expired'));
    };

    const handleCancelEvent = () => {
      cleanup();
      resolved = true;
      reject(new Error('PAYMENT_CANCELLED'));
    };

    window.addEventListener('youpi:payment:success', handleSuccessEvent);
    window.addEventListener('youpi:payment:failed', handleFailureEvent);
    window.addEventListener('youpi:payment:cancelled', handleCancelEvent);
    window.addEventListener('youpi:payment:expired', handleFailureEvent);

    const cleanup = () => {
      window.removeEventListener('youpi:payment:success', handleSuccessEvent);
      window.removeEventListener('youpi:payment:failed', handleFailureEvent);
      window.removeEventListener('youpi:payment:cancelled', handleCancelEvent);
      window.removeEventListener('youpi:payment:expired', handleFailureEvent);
    };

    try {
      window.YouPI.openCheckout({
        key: config.merchantKey,
        orderId: params.orderId,
        amount: params.amount,
        currency: 'INR',
        customer: {
          name: params.customerName,
          phone: params.customerPhone,
          email: params.customerEmail,
        },
        onSuccess: (data) => {
          if (!resolved) {
            cleanup();
            resolved = true;
            resolve(data);
          }
        },
        onFailure: (err) => {
          if (!resolved) {
            cleanup();
            resolved = true;
            reject(err);
          }
        },
        onCancel: () => {
          if (!resolved) {
            cleanup();
            resolved = true;
            reject(new Error('PAYMENT_CANCELLED'));
          }
        },
      });
    } catch (err) {
      cleanup();
      reject(err);
    }
  });
}
