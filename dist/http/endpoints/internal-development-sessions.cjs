"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeDevelopmentSessionContract = exports.getDevelopmentSessionStateContract = exports.consentDevelopmentSessionContract = exports.startDevelopmentSessionPairingContract = exports.DevelopmentSessionRevocationSchema = exports.DevelopmentSessionStateQuerySchema = exports.DevelopmentSessionParamsSchema = exports.DevelopmentSessionPairingParamsSchema = void 0;
const zod_1 = require("zod");
const device_signature_js_1 = require("../../auth/device-signature.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const development_session_js_1 = require("../../capability/connect/development-session.cjs");
const development_session_pairing_js_1 = require("../../capability/connect/development-session-pairing.cjs");
const development_session_state_js_1 = require("../../capability/connect/development-session-state.cjs");
exports.DevelopmentSessionPairingParamsSchema = zod_1.z.object({
    pairingId: zod_1.z.string().min(1),
}).strict();
exports.DevelopmentSessionParamsSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1),
}).strict();
exports.DevelopmentSessionStateQuerySchema = zod_1.z.object({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
}).strict();
exports.DevelopmentSessionRevocationSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1),
    status: zod_1.z.literal('revoked'),
    revokedAt: zod_1.z.string().datetime(),
}).strict();
/**
 * Internal routes are called by the authenticated backend after owner verification,
 * never directly by the browser. A body/query scope does not authenticate its owner.
 * The service must bind path pairingId/sessionId to trusted records and the
 * authenticated tenant/owner/agent scope, validate the registered device and its
 * signature, and consume the challenge and nonce exactly once.
 * Cloud targets reuse a registered adapter; platform/provider secrets stay outside
 * this API. Device signatures and consent do not authorize productive work without A11.
 */
exports.startDevelopmentSessionPairingContract = {
    method: 'POST',
    path: '/internal/connect/development-sessions/pairings',
    authType: 'secret',
    bodySchema: development_session_js_1.DevelopmentSessionBindingSchema,
    responseSchema: development_session_pairing_js_1.DevelopmentSessionPairingChallengeSchema,
};
/** Device proof and consent require registry validation and single-use challenge/nonce consumption; A11 remains required for productive work. */
exports.consentDevelopmentSessionContract = {
    method: 'POST',
    path: '/connect/development-sessions/pairings/:pairingId/consent',
    authType: 'device_signature',
    headersSchema: device_signature_js_1.AuthDeviceSignatureSchema,
    paramsSchema: exports.DevelopmentSessionPairingParamsSchema,
    bodySchema: development_session_pairing_js_1.DevelopmentSessionConsentSchema,
    responseSchema: development_session_state_js_1.DevelopmentSessionLeaseSchema,
};
/** Authenticated backend only, after owner verification; correlate sessionId and authenticated scope with the registry, never trust the query as authority. */
exports.getDevelopmentSessionStateContract = {
    method: 'GET',
    path: '/internal/connect/development-sessions/:sessionId/state',
    authType: 'secret',
    paramsSchema: exports.DevelopmentSessionParamsSchema,
    querySchema: exports.DevelopmentSessionStateQuerySchema,
    responseSchema: development_session_state_js_1.DevelopmentSessionLeaseSchema,
};
/** Authenticated backend only, after owner verification; match sessionId and authenticated scope before revoking the trusted record. */
exports.revokeDevelopmentSessionContract = {
    method: 'POST',
    path: '/internal/connect/development-sessions/:sessionId/revoke',
    authType: 'secret',
    paramsSchema: exports.DevelopmentSessionParamsSchema,
    bodySchema: capability_call_context_js_1.CapabilityAgentScopeSchema,
    responseSchema: exports.DevelopmentSessionRevocationSchema,
};
//# sourceMappingURL=internal-development-sessions.js.map