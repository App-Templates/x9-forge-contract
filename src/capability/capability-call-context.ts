import { z } from 'zod';
import { InternalMemoryExtractRequestSchema } from '../http/endpoints/internal-memory-extract.js';
import { CredentialKeySchema, CredentialVersionSchema } from '../vault/credential-link.js';
import { isPlatformInternalCredentialKey } from '../vault/platform-internal-credentials.js';
import { AgentConfigVersionSchema } from './ricerca/agent-config.js';
import { CapabilityAgentParametersSchema, CapabilityParameterKeySchema, CapabilityParameterValueSchema } from './parameters.js';
import type { ToolCallRequest } from './tool-call.js';

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

export const CapabilityCallIdentitySchema = InternalMemoryExtractRequestSchema.pick({
  tenantId: true,
  ownerId: true,
  agentId: true,
  userId: true,
}).strict();
export type CapabilityCallIdentity = z.infer<typeof CapabilityCallIdentitySchema>;

/** Agent-level scope of capability data (no person): e.g. one provider resource or one program per agent. */
export const CapabilityAgentScopeSchema = CapabilityCallIdentitySchema.omit({ userId: true }); // strict, inherited
export type CapabilityAgentScope = z.infer<typeof CapabilityAgentScopeSchema>;

/** Person-level scope: the end person's data is isolated by tenant/owner/agent/person. */
export const CapabilityPersonScopeSchema = CapabilityCallIdentitySchema.required({ userId: true }); // strict, inherited
export type CapabilityPersonScope = z.infer<typeof CapabilityPersonScopeSchema>;

/** Same tenant, owner and agent (and person when both carry one). */
export function sameCapabilityScope(a: CapabilityCallIdentity, b: CapabilityCallIdentity): boolean {
  return a.tenantId === b.tenantId && a.ownerId === b.ownerId && a.agentId === b.agentId && a.userId === b.userId;
}

const CapabilityNameSchema = CapabilityAgentParametersSchema.shape.capability;

function addKeyAlignmentIssues(left: Record<string, unknown>, right: Record<string, unknown>, ctx: z.RefinementCtx): void {
  const a = Object.keys(left).sort();
  const b = Object.keys(right).sort();
  if (a.length !== b.length || a.some((key, index) => key !== b[index])) {
    ctx.addIssue({ code: 'custom', path: ['credentialVersions'], message: 'Every credential has exactly one version and vice versa' });
  }
}

export const CapabilityCallContextSchema = z.object({
  identity: CapabilityCallIdentitySchema,
  capability: CapabilityNameSchema,
  /** Applied version of this capability's per-agent configuration; null when it has none. */
  configVersion: AgentConfigVersionSchema.nullable(),
  /** Resolved ordinary settings for this agent (never credentials). */
  settings: z.record(CapabilityParameterKeySchema, CapabilityParameterValueSchema).optional(),
  // Resolve canonical credential schemas after the public entrypoint cycle initializes.
  credentials: z.record(z.lazy(() => CredentialKeySchema), z.string().min(1)),
  credentialVersions: z.record(z.lazy(() => CredentialKeySchema), z.lazy(() => CredentialVersionSchema)),
}).strict().superRefine((context, ctx) => {
  addKeyAlignmentIssues(context.credentials, context.credentialVersions, ctx);
});
export type CapabilityCallContext = z.infer<typeof CapabilityCallContextSchema>;

export const CapabilityCallContextErrorCodeSchema = z.enum([
  'credential_missing',
  'source_unavailable',
  'capability_disabled',
  'capability_not_installed',
  /** tenant/owner/agent/person do not belong together: forged or stale identity. */
  'identity_mismatch',
]);
export type CapabilityCallContextErrorCode = z.infer<typeof CapabilityCallContextErrorCodeSchema>;

/** Forge validates `keys` against what this capability declares; it never returns undeclared keys. */
export const CapabilityCallContextRequestSchema = z.object({
  identity: CapabilityCallIdentitySchema,
  capability: CapabilityNameSchema,
  keys: z.array(z.lazy(() => CredentialKeySchema)).max(64)
    .refine((keys) => new Set(keys).size === keys.length, { message: 'keys must be unique' }),
}).strict();
export type CapabilityCallContextRequest = z.infer<typeof CapabilityCallContextRequestSchema>;

export const CapabilityCallContextErrorSchema = z.object({
  ok: z.literal(false),
  error: CapabilityCallContextErrorCodeSchema,
  /** credential_missing only: the absent keys (names, never values). */
  keys: z.array(z.lazy(() => CredentialKeySchema)).min(1).optional(),
}).superRefine((response, ctx) => {
  if ((response.error === 'credential_missing') !== (response.keys !== undefined)) {
    ctx.addIssue({ code: 'custom', path: ['keys'], message: 'keys are listed exactly for credential_missing' });
  }
});
export type CapabilityCallContextError = z.infer<typeof CapabilityCallContextErrorSchema>;

export const CapabilityCallContextResponseSchema = z.union([
  z.object({ ok: z.literal(true), context: CapabilityCallContextSchema }),
  CapabilityCallContextErrorSchema,
]);
export type CapabilityCallContextResponse = z.infer<typeof CapabilityCallContextResponseSchema>;

export type PickCapabilityCredentialsResult =
  | { ok: true; credentials: Record<string, string>; credentialVersions: Record<string, number> }
  | { ok: false; error: 'credential_missing'; keys: string[] };

/**
 * Select exactly the `required` keys from an agent's resolved credentials. Platform-internal keys are never picked
 * (a requirement on one counts as missing). Absent keys are reported, not replaced.
 */
export function pickCapabilityCredentials(
  available: Readonly<Record<string, { readonly value: string; readonly version: number }>>,
  required: readonly string[],
): PickCapabilityCredentialsResult {
  const credentials: Record<string, string> = {};
  const credentialVersions: Record<string, number> = {};
  const missing: string[] = [];
  for (const key of required) {
    const entry = Object.prototype.hasOwnProperty.call(available, key) ? available[key] : undefined;
    if (!entry || entry.value === '' || isPlatformInternalCredentialKey(key)) {
      missing.push(key);
      continue;
    }
    credentials[key] = entry.value;
    credentialVersions[key] = entry.version;
  }
  if (missing.length > 0) return { ok: false, error: 'credential_missing', keys: missing };
  return { ok: true, credentials, credentialVersions };
}

/** Fields of the 1.30 `ToolCallRequest` filled from a validated context (shape of the tool call unchanged). */
export function toToolCallScope(context: CapabilityCallContext): Pick<ToolCallRequest, 'agentId' | 'userId' | 'tenantId' | 'ownerId' | 'credentials'> {
  const { tenantId, ownerId, agentId, userId } = context.identity;
  return { agentId, ...(userId !== undefined ? { userId } : {}), tenantId, ownerId, credentials: { ...context.credentials } };
}
