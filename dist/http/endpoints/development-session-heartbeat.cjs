"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heartbeatDevelopmentSessionContract = exports.DevelopmentSessionHeartbeatSchema = void 0;
const zod_1 = require("zod");
const device_signature_js_1 = require("../../auth/device-signature.cjs");
const development_session_js_1 = require("../../capability/connect/development-session.cjs");
const development_session_state_js_1 = require("../../capability/connect/development-session-state.cjs");
const internal_development_sessions_js_1 = require("./internal-development-sessions.cjs");
exports.DevelopmentSessionHeartbeatSchema = zod_1.z.object({
    binding: development_session_js_1.DevelopmentSessionBindingSchema,
    leaseId: development_session_state_js_1.DevelopmentSessionLeaseSchema.shape.leaseId,
    consentRef: development_session_state_js_1.DevelopmentSessionLeaseSchema.shape.consentRef,
    availableEngines: development_session_state_js_1.DevelopmentSessionLeaseSchema.shape.availableEngines,
}).strict().refine((heartbeat) => heartbeat.availableEngines.every((engine) => heartbeat.binding.engines.includes(engine)), { message: 'Available engines must be authorized by the binding', path: ['availableEngines'] });
/**
 * The service must verify the signature and nonce and a device registered for this
 * binding, including for cloud adapters. Header parsing only validates format.
 * Correlate path sessionId, binding, leaseId and consentRef with trusted registry
 * records; reject revoked sessions and never reactivate an expired lease with a
 * heartbeat (a new pairing is required). The service chooses all new timestamps
 * and expiry. This grants no A11 authorization and does not renew productive work.
 */
exports.heartbeatDevelopmentSessionContract = {
    method: 'POST',
    path: '/connect/development-sessions/:sessionId/heartbeat',
    authType: 'device_signature',
    headersSchema: device_signature_js_1.AuthDeviceSignatureSchema,
    paramsSchema: internal_development_sessions_js_1.DevelopmentSessionParamsSchema,
    bodySchema: exports.DevelopmentSessionHeartbeatSchema,
    responseSchema: development_session_state_js_1.DevelopmentSessionLeaseSchema,
};
//# sourceMappingURL=development-session-heartbeat.js.map