"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceRequestPartsSchema = exports.AuthDeviceSignatureSchema = exports.DeviceSignatureSchema = exports.DeviceNonceSchema = exports.DeviceTimestampSchema = exports.DeviceIdSchema = exports.DEVICE_SIGNATURE_HEADER = exports.DEVICE_NONCE_HEADER = exports.DEVICE_TIMESTAMP_HEADER = exports.DEVICE_ID_HEADER = exports.DEVICE_MAX_SKEW_SEC = exports.DEVICE_SIGNATURE_DOMAIN = void 0;
exports.canonicalDeviceRequest = canonicalDeviceRequest;
exports.deviceTimestampInWindow = deviceTimestampInWindow;
const zod_1 = require("zod");
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
exports.DEVICE_SIGNATURE_DOMAIN = 'x9-device-request-v1';
exports.DEVICE_MAX_SKEW_SEC = 60;
exports.DEVICE_ID_HEADER = 'X-X9-Device';
exports.DEVICE_TIMESTAMP_HEADER = 'X-X9-Device-Timestamp';
exports.DEVICE_NONCE_HEADER = 'X-X9-Device-Nonce';
exports.DEVICE_SIGNATURE_HEADER = 'X-X9-Device-Signature';
exports.DeviceIdSchema = zod_1.z.string().regex(/^[a-z0-9][a-z0-9-]{2,63}$/);
exports.DeviceTimestampSchema = zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
exports.DeviceNonceSchema = zod_1.z.string().regex(/^[A-Za-z0-9_-]{22}$/);
exports.DeviceSignatureSchema = zod_1.z.string().regex(/^[A-Za-z0-9_-]{86}$/);
const MethodSchema = zod_1.z.enum(['GET', 'POST']);
const PathSchema = zod_1.z.string().regex(/^\/[\x21-\x7e]{0,1023}$/);
const Sha256HexSchema = zod_1.z.string().regex(/^[0-9a-f]{64}$/);
exports.AuthDeviceSignatureSchema = zod_1.z.object({
    [exports.DEVICE_ID_HEADER]: exports.DeviceIdSchema,
    [exports.DEVICE_TIMESTAMP_HEADER]: exports.DeviceTimestampSchema,
    [exports.DEVICE_NONCE_HEADER]: exports.DeviceNonceSchema,
    [exports.DEVICE_SIGNATURE_HEADER]: exports.DeviceSignatureSchema,
});
exports.DeviceRequestPartsSchema = zod_1.z
    .object({
    method: MethodSchema,
    path: PathSchema,
    timestamp: exports.DeviceTimestampSchema,
    nonce: exports.DeviceNonceSchema,
    bodySha256: Sha256HexSchema,
})
    .strict();
/** The exact message a device signs and a capability verifies. Throws on malformed parts. */
function canonicalDeviceRequest(parts) {
    const p = exports.DeviceRequestPartsSchema.parse(parts);
    return [exports.DEVICE_SIGNATURE_DOMAIN, p.method, p.path, p.timestamp, p.nonce, p.bodySha256].join('\n');
}
/** Pure clock check of a device timestamp (signature and nonce store belong to the capability). */
function deviceTimestampInWindow(timestamp, nowMs) {
    if (!exports.DeviceTimestampSchema.safeParse(timestamp).success)
        return false;
    const t = Date.parse(timestamp);
    return !Number.isNaN(t) && Math.abs(nowMs - t) <= exports.DEVICE_MAX_SKEW_SEC * 1000;
}
//# sourceMappingURL=device-signature.js.map