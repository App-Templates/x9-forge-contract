import { z } from 'zod';
import { AgentConfigVersionSchema, CapabilityAgentIdSchema } from '../ricerca/agent-config.js';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from '../capability-call-context.js';
import { PaperclipAgentBindingSchema } from './tools.js';

/** Ordinary desired settings. Parsing never grants native identity or authorizes a role. */
export const PaperclipAgentConfigSchema = z.strictObject({
  agentId: CapabilityAgentIdSchema,
  version: AgentConfigVersionSchema,
  unitId: PaperclipAgentBindingSchema.shape.unitId,
  roleRef: PaperclipAgentBindingSchema.shape.unitId,
});
export type PaperclipAgentConfig = z.infer<typeof PaperclipAgentConfigSchema>;

/** SHA256 of non-secret configuration/inventory, never a credential fingerprint. */
export const PaperclipConfigFingerprintSchema = z.string().regex(/^[a-f0-9]{64}$/);

/** Operator inventory provenance is evidence to verify, not authority conferred by parsing. */
export const PaperclipProvisioningProvenanceSchema = z.strictObject({
  source: z.literal('native_operator_inventory'),
  inventoryFingerprint: PaperclipConfigFingerprintSchema,
});
export const PaperclipAppliedAgentBindingSchema = PaperclipAgentBindingSchema.extend({
  callerRoleRef: PaperclipAgentConfigSchema.shape.roleRef,
  provisioningRevision: AgentConfigVersionSchema,
  provenance: PaperclipProvisioningProvenanceSchema,
});
export type PaperclipAppliedAgentBinding = z.infer<typeof PaperclipAppliedAgentBindingSchema>;

/** Internal trusted installation intent. The cap derives native IDs from its inventory. */
export const PaperclipAgentInstallRequestSchema = z.strictObject({
  scope: CapabilityAgentScopeSchema,
  version: AgentConfigVersionSchema,
  enabled: z.boolean(),
  registryFingerprint: PaperclipConfigFingerprintSchema,
});
export type PaperclipAgentInstallRequest = z.infer<typeof PaperclipAgentInstallRequestSchema>;

/** Actual installed metadata. It attests neither a native run nor provider/key readiness. */
export const PaperclipAgentReadbackSchema = PaperclipAppliedAgentBindingSchema.extend({
  appliedVersion: AgentConfigVersionSchema,
  registryFingerprint: PaperclipConfigFingerprintSchema,
  configFingerprint: PaperclipConfigFingerprintSchema,
});
export type PaperclipAgentReadback = z.infer<typeof PaperclipAgentReadbackSchema>;

/** Correspondence only: the consumer still authenticates, installs and observes current state. */
export function matchesPaperclipInstallation(rawRequest: unknown, rawReadback: unknown): boolean {
  const request = PaperclipAgentInstallRequestSchema.safeParse(rawRequest);
  const readback = PaperclipAgentReadbackSchema.safeParse(rawReadback);
  if (!request.success || !readback.success) return false;
  const wanted = request.data;
  const actual = readback.data;
  return sameCapabilityScope(wanted.scope, actual.scope)
    && wanted.version === actual.appliedVersion
    && wanted.enabled === actual.enabled
    && wanted.registryFingerprint === actual.registryFingerprint;
}

/** One Paperclip installation per agent. Other capabilities retain their legacy context fields. */
export const PaperclipCapabilityInstallationSchema = z.strictObject({
  capability: z.literal('paperclip'),
  installation: PaperclipAgentInstallRequestSchema,
});
export const PaperclipCapabilityAttestationSchema = z.strictObject({
  capability: z.literal('paperclip'),
  readback: PaperclipAgentReadbackSchema,
});
export type PaperclipCapabilityInstallation = z.infer<typeof PaperclipCapabilityInstallationSchema>;
export type PaperclipCapabilityAttestation = z.infer<typeof PaperclipCapabilityAttestationSchema>;
