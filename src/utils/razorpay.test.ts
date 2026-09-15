import { describe, it, expect, afterEach, vi } from 'vitest';
import { loadRazorpayScript, openRazorpayCheckout } from './razorpay';

describe('loadRazorpayScript', () => {
  const originalRazorpay = window.Razorpay;

  afterEach(() => {
    document.querySelectorAll('script[src*="razorpay"]').forEach((s) => s.remove());
    if (originalRazorpay === undefined) {
      delete (window as { Razorpay?: unknown }).Razorpay;
    } else {
      window.Razorpay = originalRazorpay;
    }
    vi.restoreAllMocks();
  });

  it('resolves false outside a browser context', async () => {
    vi.stubGlobal('window', undefined as unknown as Window & typeof globalThis);
    const result = await loadRazorpayScript();
    expect(result).toBe(false);
    vi.unstubAllGlobals();
  });

  it('resolves true immediately when the SDK is already loaded', async () => {
    (window as { Razorpay?: unknown }).Razorpay = function MockRazorpay() {};
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const result = await loadRazorpayScript();
    expect(result).toBe(true);
    expect(appendSpy).not.toHaveBeenCalled();
  });

  it('injects the official checkout script once and resolves true on load', async () => {
    let onloadHandler: (() => void) | null = null;
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      const script = node as HTMLScriptElement;
      setTimeout(() => {
        onloadHandler = script.onload as () => void;
        onloadHandler?.();
      }, 0);
      return node;
    });

    const pending = loadRazorpayScript();
    const result = await pending;
    expect(result).toBe(true);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    const injected = appendSpy.mock.calls[0][0] as HTMLScriptElement;
    expect(injected.src).toBe('https://checkout.razorpay.com/v1/checkout.js');
    expect(injected.async).toBe(true);
  });

  it('resolves false when the script fails to load', async () => {
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      const script = node as HTMLScriptElement;
      setTimeout(() => script.onerror?.(new Event('error')), 0);
      return node;
    });
    const result = await loadRazorpayScript();
    expect(result).toBe(false);
  });
});

describe('openRazorpayCheckout', () => {
  afterEach(() => {
    delete (window as { Razorpay?: unknown }).Razorpay;
    vi.restoreAllMocks();
  });

  it('returns a friendly error when the SDK cannot be loaded', async () => {
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      const script = node as HTMLScriptElement;
      setTimeout(() => script.onerror?.(new Event('error')), 0);
      return node;
    });
    const result = await openRazorpayCheckout({} as never);
    expect(result.error).toMatch(/unavailable/i);
  });

  it('opens checkout and registers the payment.failed handler', async () => {
    const registered: string[] = [];
    const openSpy = vi.fn();
    (window as unknown as { Razorpay: unknown }).Razorpay = class {
      on(event: string) {
        registered.push(event);
      }
      open() {
        openSpy();
      }
    };

    const result = await openRazorpayCheckout({ key: 'rzp_test_x', amount: 29900 } as never);
    expect(result.error).toBeUndefined();
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(registered).toContain('payment.failed');
  });

  it('surfaces constructor errors as { error } instead of throwing', async () => {
    (window as unknown as { Razorpay: unknown }).Razorpay = class {
      constructor() {
        throw new Error('boom');
      }
    };
    const result = await openRazorpayCheckout({ key: 'rzp_test_x' } as never);
    expect(result.error).toBe('boom');
  });
});
