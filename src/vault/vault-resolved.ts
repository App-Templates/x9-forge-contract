import { z } from 'zod';
import { INTERNAL_TOKEN_HEADER } from '../auth/index.js';
import { CredentialKeySchema } from './credential-key.js';
import { VaultCascadeTierSchema } from './vault-tier.js';

export const VaultResolvedEntrySchema = z.object({
  key: CredentialKeySchema,
  value: z.string(),
  tier: VaultCascadeTierSchema,
  secret: z.boolean(),
}).strict();
export type VaultResolvedEntry = z.infer<typeof VaultResolvedEntrySchema>;

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
