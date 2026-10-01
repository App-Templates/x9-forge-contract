"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLATFORM_INTERNAL_CREDENTIAL_KEYS = void 0;
exports.isPlatformInternalCredentialKey = isPlatformInternalCredentialKey;
exports.stripPlatformInternalCredentials = stripPlatformInternalCredentials;
/**
 * Platform-internal credentials — vault keys that live at the `platform` tier
 * but are NOT inherited by tenants.
 *
 * The `platform` tier mixes two things:
 *   - inheritable defaults every agent may use (e.g. `OPENAI_API_KEY`);
 *   - credentials only a platform service uses on its own behalf (e.g. the
 *     Telegram *user* session Forge factory-svc uses to talk to @BotFather).
 *
 * Keys listed here are resolved only by the service that owns them (Forge
 * factory-svc reads the platform row directly). They MUST NOT be projected
 * into an agent's `credentials` (context.json, vault `/resolve`, agent `.env`).
 *
 * Why: SEC 2026-10-01 — Forge copied every platform-tier row into every
 * tenant's `context.json`, so the BotFather userbot session reached all
 * agents of all owners. No X9 code reads it from a tenant context.
 *
 * Leaf module (no imports) so `src/agent` can depend on it without a cycle.
 */
exports.PLATFORM_INTERNAL_CREDENTIAL_KEYS = ['TELEGRAM_SESSION_STRING'];
function isPlatformInternalCredentialKey(key) {
    return exports.PLATFORM_INTERNAL_CREDENTIAL_KEYS.includes(key);
}
/** Copy of `credentials` without platform-internal keys (input untouched). */
function stripPlatformInternalCredentials(credentials) {
    const out = {};
    for (const [key, value] of Object.entries(credentials)) {
        if (!isPlatformInternalCredentialKey(key))
            out[key] = value;
    }
    return out;
}
//# sourceMappingURL=platform-internal-credentials.js.map