"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityCredentialRequirementsSchema = exports.CapabilityCredentialRequirementSchema = void 0;
const zod_1 = require("zod");
const agent_credentials_js_1 = require("../agent/agent-credentials.cjs");
const credential_link_js_1 = require("../vault/credential-link.cjs");
/** Fields a capability explicitly consumes from an admitted agent context, never their values. */
exports.CapabilityCredentialRequirementSchema = zod_1.z.object({
    // Delay the shared vault schema until the public entrypoint cycle has initialized.
    key: zod_1.z.lazy(() => credential_link_js_1.CredentialKeySchema).refine(key => !agent_credentials_js_1.AUTH_GATE_FIELDS.includes(key), { message: 'Internal authentication fields never authorize capability credential projection' }),
    required: zod_1.z.boolean(),
}).strict();
/** Absence of this declaration grants no new projection authority; an explicit empty list needs no fields. */
exports.CapabilityCredentialRequirementsSchema = zod_1.z.array(exports.CapabilityCredentialRequirementSchema).max(64)
    .refine(entries => new Set(entries.map(entry => entry.key)).size === entries.length, { message: 'Capability credential requirement keys must be unique' });
//# sourceMappingURL=capability-credential-requirements.js.map