import { z } from 'zod';

/**
 * Device-signed requests (phase 59) — a registered computer (e.g. the owner's Mac running a Claude Code mod) calls a
 * capability's public device API without any shared secret: it signs each request with its own Ed25519 key; the
 * capability holds only the public key, registered by the owner in Forge and revocable there.
 *
 * Signed message (UTF-8): `x9-device-request-v1\n<METHOD>\n<path with query>\n<timestamp>\n<nonce>\n<sha256 hex of body>`
 * (empty body → SHA-256 of the empty string). The capability rejects a timestamp outside ±DEVICE_MAX_SKEW_SEC, a nonce
 * already seen inside that window, an unknown or revoked device id, and a bad signature.
 *
 * A stolen device key can only do what the device API allows (e.g. read status, ask for an approval the owner sees
 * and can refuse): device APIs never perform an effect without a signed approval.
 */

export const DEVICE_SIGNATURE_DOMAIN = 'x9-device-request-v1' as const;
export const DEVICE_MAX_SKEW_SEC = 60;

export const DEVICE_ID_HEADER = 'X-X9-Device' as const;
export const DEVICE_TIMESTAMP_HEADER = 'X-X9-Device-Timestamp' as const;
export const DEVICE_NONCE_HEADER = 'X-X9-Device-Nonce' as const;
export const DEVICE_SIGNATURE_HEADER = 'X-X9-Device-Signature' as const;

export const DeviceIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{2,63}$/);
export const DeviceTimestampSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
export const DeviceNonceSchema = z.string().regex(/^[A-Za-z0-9_-]{22}$/);
export const DeviceSignatureSchema = z.string().regex(/^[A-Za-z0-9_-]{86}$/);
const MethodSchema = z.enum(['GET', 'POST']);
const PathSchema = z.string().regex(/^\/[\x21-\x7e]{0,1023}$/);
const Sha256HexSchema = z.string().regex(/^[0-9a-f]{64}$/);

export const AuthDeviceSignatureSchema = z.object({
  [DEVICE_ID_HEADER]: DeviceIdSchema,
  [DEVICE_TIMESTAMP_HEADER]: DeviceTimestampSchema,
  [DEVICE_NONCE_HEADER]: DeviceNonceSchema,
  [DEVICE_SIGNATURE_HEADER]: DeviceSignatureSchema,
});
export type AuthDeviceSignature = z.infer<typeof AuthDeviceSignatureSchema>;

export const DeviceRequestPartsSchema = z
  .object({
    method: MethodSchema,
    path: PathSchema,
    timestamp: DeviceTimestampSchema,
    nonce: DeviceNonceSchema,
    bodySha256: Sha256HexSchema,
  })
  .strict();
export type DeviceRequestParts = z.infer<typeof DeviceRequestPartsSchema>;

/** The exact message a device signs and a capability verifies. Throws on malformed parts. */
export function canonicalDeviceRequest(parts: DeviceRequestParts): string {
  const p = DeviceRequestPartsSchema.parse(parts);
  return [DEVICE_SIGNATURE_DOMAIN, p.method, p.path, p.timestamp, p.nonce, p.bodySha256].join('\n');
}

/** Pure clock check of a device timestamp (signature and nonce store belong to the capability). */
export function deviceTimestampInWindow(timestamp: string, nowMs: number): boolean {
  if (!DeviceTimestampSchema.safeParse(timestamp).success) return false;
  const t = Date.parse(timestamp);
  return !Number.isNaN(t) && Math.abs(nowMs - t) <= DEVICE_MAX_SKEW_SEC * 1000;
}
