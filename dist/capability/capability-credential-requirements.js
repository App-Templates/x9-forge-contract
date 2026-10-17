import { z } from 'zod';
import { AUTH_GATE_FIELDS } from "../agent/agent-credentials.js";
import { CredentialKeySchema } from "../vault/credential-link.js";
/** Fields a capability explicitly consumes from an admitted agent context, never their values. */
export const CapabilityCredentialRequirementSchema = z.object({
    // Delay the shared vault schema until the public entrypoint cycle has initialized.
    key: z.lazy(() => CredentialKeySchema).refine(key => !AUTH_GATE_FIELDS.includes(key), { message: 'Internal authentication fields never authorize capability credential projection' }),
    required: z.boolean(),
}).strict();
/** Absence of this declaration grants no new projection authority; an explicit empty list needs no fields. */
export const CapabilityCredentialRequirementsSchema = z.array(CapabilityCredentialRequirementSchema).max(64)
    .refine(entries => new Set(entries.map(entry => entry.key)).size === entries.length, { message: 'Capability credential requirement keys must be unique' });
//# sourceMappingURL=capability-credential-requirements.js.map