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
export declare const DEVICE_SIGNATURE_DOMAIN: "x9-device-request-v1";
export declare const DEVICE_MAX_SKEW_SEC = 60;
export declare const DEVICE_ID_HEADER: "X-X9-Device";
export declare const DEVICE_TIMESTAMP_HEADER: "X-X9-Device-Timestamp";
export declare const DEVICE_NONCE_HEADER: "X-X9-Device-Nonce";
export declare const DEVICE_SIGNATURE_HEADER: "X-X9-Device-Signature";
export declare const DeviceIdSchema: z.ZodString;
export declare const DeviceTimestampSchema: z.ZodString;
export declare const DeviceNonceSchema: z.ZodString;
export declare const DeviceSignatureSchema: z.ZodString;
export declare const AuthDeviceSignatureSchema: z.ZodObject<{
    "X-X9-Device": z.ZodString;
    "X-X9-Device-Timestamp": z.ZodString;
    "X-X9-Device-Nonce": z.ZodString;
    "X-X9-Device-Signature": z.ZodString;
}, z.core.$strip>;
export type AuthDeviceSignature = z.infer<typeof AuthDeviceSignatureSchema>;
export declare const DeviceRequestPartsSchema: z.ZodObject<{
    method: z.ZodEnum<{
        POST: "POST";
        GET: "GET";
    }>;
    path: z.ZodString;
    timestamp: z.ZodString;
    nonce: z.ZodString;
    bodySha256: z.ZodString;
}, z.core.$strict>;
export type DeviceRequestParts = z.infer<typeof DeviceRequestPartsSchema>;
/** The exact message a device signs and a capability verifies. Throws on malformed parts. */
export declare function canonicalDeviceRequest(parts: DeviceRequestParts): string;
/** Pure clock check of a device timestamp (signature and nonce store belong to the capability). */
export declare function deviceTimestampInWindow(timestamp: string, nowMs: number): boolean;
//# sourceMappingURL=device-signature.d.ts.map