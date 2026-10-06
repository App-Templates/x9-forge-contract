"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityCallContextResponseSchema = exports.CapabilityCallContextErrorSchema = exports.CapabilityCallContextRequestSchema = exports.CapabilityCallContextErrorCodeSchema = exports.CapabilityCallContextSchema = exports.CapabilityPersonScopeSchema = exports.CapabilityAgentScopeSchema = exports.CapabilityCallIdentitySchema = void 0;
exports.sameCapabilityScope = sameCapabilityScope;
exports.pickCapabilityCredentials = pickCapabilityCredentials;
exports.toToolCallScope = toToolCallScope;
const zod_1 = require("zod");
const internal_memory_extract_js_1 = require("../http/endpoints/internal-memory-extract.cjs");
const credential_link_js_1 = require("../vault/credential-link.cjs");
const platform_internal_credentials_js_1 = require("../vault/platform-internal-credentials.cjs");
const agent_config_js_1 = require("./ricerca/agent-config.cjs");
const parameters_js_1 = require("./parameters.cjs");
/**
 * Per-call capability context (R3, v1.31.0) — what ONE capability receives for ONE call of ONE agent.
 *
 * - Identity comes from authentication and the validated agent context, never from model-chosen parameters.
 *   Tenant, owner and agent are required: there is no default tenant that could make two customers equivalent.
 * - Credentials are the MINIMUM this capability needs for this call, each with the version in force, never the
 *   agent's whole credential bag, never platform-internal keys. They must not reach prompts, logs, traces or browsers.
 * - Missing key, unavailable source, disabled / not installed capability and forged identity are distinct errors;
 *   a consumer never falls back to a process-global key.
 */
exports.CapabilityCallIdentitySchema = internal_memory_extract_js_1.InternalMemoryExtractRequestSchema.pick({
    tenantId: true,
    ownerId: true,
    agentId: true,
    userId: true,
}).strict();
/** Agent-level scope of capability data (no person): e.g. one provider resource or one program per agent. */
exports.CapabilityAgentScopeSchema = exports.CapabilityCallIdentitySchema.omit({ userId: true }); // strict, inherited
/** Person-level scope: the end person's data is isolated by tenant/owner/agent/person. */
exports.CapabilityPersonScopeSchema = exports.CapabilityCallIdentitySchema.required({ userId: true }); // strict, inherited
/** Same tenant, owner and agent (and person when both carry one). */
function sameCapabilityScope(a, b) {
    return a.tenantId === b.tenantId && a.ownerId === b.ownerId && a.agentId === b.agentId && a.userId === b.userId;
}
const CapabilityNameSchema = parameters_js_1.CapabilityAgentParametersSchema.shape.capability;
function addKeyAlignmentIssues(left, right, ctx) {
    const a = Object.keys(left).sort();
    const b = Object.keys(right).sort();
    if (a.length !== b.length || a.some((key, index) => key !== b[index])) {
        ctx.addIssue({ code: 'custom', path: ['credentialVersions'], message: 'Every credential has exactly one version and vice versa' });
    }
}
exports.CapabilityCallContextSchema = zod_1.z.object({
    identity: exports.CapabilityCallIdentitySchema,
    capability: CapabilityNameSchema,
    /** Applied version of this capability's per-agent configuration; null when it has none. */
    configVersion: agent_config_js_1.AgentConfigVersionSchema.nullable(),
    /** Resolved ordinary settings for this agent (never credentials). */
    settings: zod_1.z.record(parameters_js_1.CapabilityParameterKeySchema, parameters_js_1.CapabilityParameterValueSchema).optional(),
    credentials: zod_1.z.record(credential_link_js_1.CredentialKeySchema, zod_1.z.string().min(1)),
    credentialVersions: zod_1.z.record(credential_link_js_1.CredentialKeySchema, credential_link_js_1.CredentialVersionSchema),
}).strict().superRefine((context, ctx) => {
    addKeyAlignmentIssues(context.credentials, context.credentialVersions, ctx);
});
exports.CapabilityCallContextErrorCodeSchema = zod_1.z.enum([
    'credential_missing',
    'source_unavailable',
    'capability_disabled',
    'capability_not_installed',
    /** tenant/owner/agent/person do not belong together: forged or stale identity. */
    'identity_mismatch',
]);
/** Forge validates `keys` against what this capability declares; it never returns undeclared keys. */
exports.CapabilityCallContextRequestSchema = zod_1.z.object({
    identity: exports.CapabilityCallIdentitySchema,
    capability: CapabilityNameSchema,
    keys: zod_1.z.array(credential_link_js_1.CredentialKeySchema).max(64)
        .refine((keys) => new Set(keys).size === keys.length, { message: 'keys must be unique' }),
}).strict();
exports.CapabilityCallContextErrorSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: exports.CapabilityCallContextErrorCodeSchema,
    /** credential_missing only: the absent keys (names, never values). */
    keys: zod_1.z.array(credential_link_js_1.CredentialKeySchema).min(1).optional(),
}).superRefine((response, ctx) => {
    if ((response.error === 'credential_missing') !== (response.keys !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['keys'], message: 'keys are listed exactly for credential_missing' });
    }
});
exports.CapabilityCallContextResponseSchema = zod_1.z.union([
    zod_1.z.object({ ok: zod_1.z.literal(true), context: exports.CapabilityCallContextSchema }),
    exports.CapabilityCallContextErrorSchema,
]);
/**
 * Select exactly the `required` keys from an agent's resolved credentials. Platform-internal keys are never picked
 * (a requirement on one counts as missing). Absent keys are reported, not replaced.
 */
function pickCapabilityCredentials(available, required) {
    const credentials = {};
    const credentialVersions = {};
    const missing = [];
    for (const key of required) {
        const entry = Object.prototype.hasOwnProperty.call(available, key) ? available[key] : undefined;
        if (!entry || entry.value === '' || (0, platform_internal_credentials_js_1.isPlatformInternalCredentialKey)(key)) {
            missing.push(key);
            continue;
        }
        credentials[key] = entry.value;
        credentialVersions[key] = entry.version;
    }
    if (missing.length > 0)
        return { ok: false, error: 'credential_missing', keys: missing };
    return { ok: true, credentials, credentialVersions };
}
/** Fields of the 1.30 `ToolCallRequest` filled from a validated context (shape of the tool call unchanged). */
function toToolCallScope(context) {
    const { tenantId, ownerId, agentId, userId } = context.identity;
    return { agentId, ...(userId !== undefined ? { userId } : {}), tenantId, ownerId, credentials: { ...context.credentials } };
}
//# sourceMappingURL=capability-call-context.js.map