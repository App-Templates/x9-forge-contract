"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capabilityCallContextContract = exports.CAPABILITY_CALL_CONTEXT_PATH = void 0;
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
/**
 * POST /resolve/capability-context — per-call context of one capability for one agent (R3, v1.31.0).
 * Direction: X9 (agent-core tool-router / capability-sdk) -> Forge vault-svc. Auth: X-Internal-Token
 * (`INTERNAL_TOKEN_HEADER`), like `GET /resolve/:agentId/:key`.
 *
 * 200 `{ ok: true, context }`; errors use the same body with `ok: false` and a distinct code:
 * 404 credential_missing (with `keys`), 503 source_unavailable, 403 capability_disabled / capability_not_installed /
 * identity_mismatch. Consumers MUST NOT fall back to process env on any error.
 */
exports.CAPABILITY_CALL_CONTEXT_PATH = '/resolve/capability-context';
exports.capabilityCallContextContract = {
    method: 'POST',
    path: exports.CAPABILITY_CALL_CONTEXT_PATH,
    authType: 'token',
    bodySchema: capability_call_context_js_1.CapabilityCallContextRequestSchema,
    responseSchema: capability_call_context_js_1.CapabilityCallContextResponseSchema,
};
//# sourceMappingURL=capability-call-context.js.map