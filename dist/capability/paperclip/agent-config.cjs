"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipCapabilityAttestationSchema = exports.PaperclipCapabilityInstallationSchema = exports.PaperclipAgentReadbackSchema = exports.PaperclipAgentInstallRequestSchema = exports.PaperclipAppliedAgentBindingSchema = exports.PaperclipProvisioningProvenanceSchema = exports.PaperclipConfigFingerprintSchema = exports.PaperclipAgentConfigSchema = void 0;
exports.matchesPaperclipInstallation = matchesPaperclipInstallation;
const zod_1 = require("zod");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const tools_js_1 = require("./tools.cjs");
/** Ordinary desired settings. Parsing never grants native identity or authorizes a role. */
exports.PaperclipAgentConfigSchema = zod_1.z.strictObject({
    agentId: agent_config_js_1.CapabilityAgentIdSchema,
    version: agent_config_js_1.AgentConfigVersionSchema,
    unitId: tools_js_1.PaperclipAgentBindingSchema.shape.unitId,
    roleRef: tools_js_1.PaperclipAgentBindingSchema.shape.unitId,
});
/** SHA256 of non-secret configuration/inventory, never a credential fingerprint. */
exports.PaperclipConfigFingerprintSchema = zod_1.z.string().regex(/^[a-f0-9]{64}$/);
/** Operator inventory provenance is evidence to verify, not authority conferred by parsing. */
exports.PaperclipProvisioningProvenanceSchema = zod_1.z.strictObject({
    source: zod_1.z.literal('native_operator_inventory'),
    inventoryFingerprint: exports.PaperclipConfigFingerprintSchema,
});
exports.PaperclipAppliedAgentBindingSchema = tools_js_1.PaperclipAgentBindingSchema.extend({
    callerRoleRef: exports.PaperclipAgentConfigSchema.shape.roleRef,
    provisioningRevision: agent_config_js_1.AgentConfigVersionSchema,
    provenance: exports.PaperclipProvisioningProvenanceSchema,
});
/** Internal trusted installation intent. The cap derives native IDs from its inventory. */
exports.PaperclipAgentInstallRequestSchema = zod_1.z.strictObject({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    version: agent_config_js_1.AgentConfigVersionSchema,
    enabled: zod_1.z.boolean(),
    registryFingerprint: exports.PaperclipConfigFingerprintSchema,
});
/** Actual installed metadata. It attests neither a native run nor provider/key readiness. */
exports.PaperclipAgentReadbackSchema = exports.PaperclipAppliedAgentBindingSchema.extend({
    appliedVersion: agent_config_js_1.AgentConfigVersionSchema,
    registryFingerprint: exports.PaperclipConfigFingerprintSchema,
    configFingerprint: exports.PaperclipConfigFingerprintSchema,
});
/** Correspondence only: the consumer still authenticates, installs and observes current state. */
function matchesPaperclipInstallation(rawRequest, rawReadback) {
    const request = exports.PaperclipAgentInstallRequestSchema.safeParse(rawRequest);
    const readback = exports.PaperclipAgentReadbackSchema.safeParse(rawReadback);
    if (!request.success || !readback.success)
        return false;
    const wanted = request.data;
    const actual = readback.data;
    return (0, capability_call_context_js_1.sameCapabilityScope)(wanted.scope, actual.scope)
        && wanted.version === actual.appliedVersion
        && wanted.enabled === actual.enabled
        && wanted.registryFingerprint === actual.registryFingerprint;
}
/** One Paperclip installation per agent. Other capabilities retain their legacy context fields. */
exports.PaperclipCapabilityInstallationSchema = zod_1.z.strictObject({
    capability: zod_1.z.literal('paperclip'),
    installation: exports.PaperclipAgentInstallRequestSchema,
});
exports.PaperclipCapabilityAttestationSchema = zod_1.z.strictObject({
    capability: zod_1.z.literal('paperclip'),
    readback: exports.PaperclipAgentReadbackSchema,
});
//# sourceMappingURL=agent-config.js.map