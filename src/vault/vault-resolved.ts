import { z } from 'zod';
import { INTERNAL_TOKEN_HEADER } from '../auth/index.js';
import { CredentialKeySchema } from './credential-key.js';
import {
  CredentialSourceIdSchema,
  CredentialVersionRefSchema,
  CredentialVersionThresholdSchema,
  withinRevocationThreshold,
} from './credential-source.js';
import type { CredentialVersionRef } from './credential-source.js';
import { VaultCascadeTierSchema } from './vault-tier.js';

export const VaultResolvedEntrySchema = z.object({
  key: CredentialKeySchema,
  value: z.string(),
  tier: VaultCascadeTierSchema,
  secret: z.boolean(),
  source: CredentialSourceIdSchema.optional(),
  counter: z.number().int().positive().nullable().optional(),
  /** True when this version originated from an urgent revocation; open sessions close. */
  revoked: z.boolean().optional(),
  /** Versions from the same source at or below this threshold remain revoked after rotation. */
  revokedThrough: CredentialVersionThresholdSchema.optional(),
}).strict();
export type VaultResolvedEntry = z.infer<typeof VaultResolvedEntrySchema>;

/** Resolve a version without inventing a counter or trusting a source from another tier. */
export function resolvedEntryRef(entry: VaultResolvedEntry): CredentialVersionRef | null {
  if (entry.source === undefined || entry.counter === undefined || entry.counter === null) {
    return null;
  }
  const sourceMatchesTier = entry.tier === 'platform'
    ? entry.source === 'platform'
    : entry.source.startsWith(`${entry.tier}:`);
  if (!sourceMatchesTier) return null;

  const ref = CredentialVersionRefSchema.parse({
    source: entry.source,
    counter: entry.counter,
    revoked: entry.revoked ?? false,
  });
  if (withinRevocationThreshold(ref, entry.revokedThrough)) return { ...ref, revoked: true };
  return ref;
}

export const VaultResolvedResponseSchema = z.object({
  agentId: z.number().int().positive(),
  entries: z.array(VaultResolvedEntrySchema),
}).strict();
export type VaultResolvedResponse = z.infer<typeof VaultResolvedResponseSchema>;

export const internalVaultResolvedContract = {
  method: 'GET',
  path: '/api/internal/vault/agents/:agentId/resolved',
  authType: 'token',
  authHeader: INTERNAL_TOKEN_HEADER,
  responseSchema: VaultResolvedResponseSchema,
} as const;

export function vaultResolvedPath(vaultAgentId: number): string {
  const agentId = VaultResolvedResponseSchema.shape.agentId.parse(vaultAgentId);
  return internalVaultResolvedContract.path.replace(':agentId', String(agentId));
}

/**
 * The only provider keys the primary agent reads from Forge.
 * Infrastructure credentials remain in the stack environment (R-17).
 */
export const PRIMARY_FORGE_PROVIDER_KEYS = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GOOGLE_API_KEY',
  'ELEVENLABS_API_KEY',
] as const;
