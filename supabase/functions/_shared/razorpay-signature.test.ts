import { describe, expect, it } from 'vitest';
import {
  buildPaymentSignaturePayload,
  hmacSha256Hex,
  paiseToRupees,
  timingSafeEqualHex,
  verifyHmacSha256,
} from './razorpay-signature';
describe('Razorpay signature helpers', () => {
  it('builds payment payload', () =>
    expect(buildPaymentSignaturePayload('order_1', 'pay_1')).toBe('order_1|pay_1'));
  it('creates stable HMAC', async () =>
    expect(await hmacSha256Hex('payload', 'secret')).toMatch(/^[a-f0-9]{64}$/));
  it('accepts valid signatures', async () => {
    const s = await hmacSha256Hex('payload', 'secret');
    await expect(verifyHmacSha256('payload', s, 'secret')).resolves.toBe(true);
  });
  it('rejects tampering', async () => {
    const s = await hmacSha256Hex('payload', 'secret');
    await expect(verifyHmacSha256('tampered', s, 'secret')).resolves.toBe(false);
  });
  it('rejects malformed input', async () =>
    await expect(verifyHmacSha256('payload', 'not-hex', 'secret')).resolves.toBe(false));
  it('compares safely', () => {
    expect(timingSafeEqualHex('aabb', 'aabb')).toBe(true);
    expect(timingSafeEqualHex('aabb', 'aabc')).toBe(false);
  });
  it('converts paise', () => expect(paiseToRupees(29900)).toBe(299));
  it('rejects invalid amounts', () => expect(() => paiseToRupees(0)).toThrow());
});
