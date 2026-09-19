import { getErrorMessage } from '@/lib/errors';

/**
 * PracticeKoro Razorpay Integration Utility
 * Safe client-side checkout loader.
 * NOTE: Key secrets are NEVER stored or accessed in client-side code.
 */

interface RazorpayFailureResponse {
  error?: { code?: string; description?: string; reason?: string };
}
interface RazorpayInstance {
  on(event: 'payment.failed', handler: (response: RazorpayFailureResponse) => void): void;
  open(): void;
}
type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

/**
 * Dynamically loads the official Razorpay Checkout JavaScript SDK.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay SDK from checkout.razorpay.com');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Opens Razorpay checkout modal with given options.
 */
export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions
): Promise<{ error?: string }> {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || !window.Razorpay) {
    return {
      error: 'Razorpay SDK is unavailable. Please check your internet connection and try again.',
    };
  }

  try {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: RazorpayFailureResponse) {
      console.error('Razorpay Payment Failed:', response.error);
    });
    rzp.open();
    return {};
  } catch (err) {
    console.error('Error opening Razorpay modal:', err);
    return { error: getErrorMessage(err, 'Failed to open Razorpay modal') };
  }
}
