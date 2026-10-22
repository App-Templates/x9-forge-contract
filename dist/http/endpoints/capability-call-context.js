import { CapabilityCallContextRequestSchema, CapabilityCallContextResponseSchema, } from "../../capability/capability-call-context.js";
/**
 * POST /resolve/capability-context — per-call context of one capability for one agent (R3, v1.31.0).
 * Direction: X9 (agent-core tool-router / capability-sdk) -> Forge vault-svc. Auth: X-Internal-Token
 * (`INTERNAL_TOKEN_HEADER`), like `GET /resolve/:agentId/:key`.
 *
 * 200 `{ ok: true, context }`; errors use the same body with `ok: false` and a distinct code:
 * 404 credential_missing (with `keys`), 503 source_unavailable, 403 capability_disabled / capability_not_installed /
 * identity_mismatch. Consumers MUST NOT fall back to process env on any error.
 */
export const CAPABILITY_CALL_CONTEXT_PATH = '/resolve/capability-context';
export const capabilityCallContextContract = {
    method: 'POST',
    path: CAPABILITY_CALL_CONTEXT_PATH,
    authType: 'token',
    bodySchema: CapabilityCallContextRequestSchema,
    responseSchema: CapabilityCallContextResponseSchema,
};
//# sourceMappingURL=capability-call-context.js.map