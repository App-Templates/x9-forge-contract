import { createHash } from 'node:crypto';
import { z } from 'zod';
import { AgentIdSchema } from '../agent/agent-identity.js';

export const ModelsModeSchema = z.enum(['v1', 'v2']);
export type ModelsMode = z.infer<typeof ModelsModeSchema>;

/**
 * Order of the effective-models copies of one agent. `presetId: null` = no preset yet (then `presetGeneration` is 0).
 * Two `presetGeneration` counters of different presets are never compared: see `compareModelsGeneration`.
 */
export const ModelsGenerationSchema = z.object({
  presetId: z.number().int().positive().nullable(),
  agentGeneration: z.number().int().nonnegative(),
  presetGeneration: z.number().int().nonnegative(),
}).strict().refine(({ presetId, presetGeneration }) => presetId !== null || presetGeneration === 0, {
  path: ['presetGeneration'],
  message: 'presetGeneration must be 0 while the agent has no preset',
});
export type ModelsGeneration = z.infer<typeof ModelsGenerationSchema>;

export type ModelsGenerationOrder = 'newer' | 'same' | 'older' | 'incomparable';

/**
 * How `next` (just received) relates to `current` (held). The receiver accepts only `newer`;
 * `same` = nothing to do, `older` = discard, `incomparable` = re-read from the vault.
 */
export function compareModelsGeneration(next: ModelsGeneration, current: ModelsGeneration): ModelsGenerationOrder {
  const agent = Math.sign(next.agentGeneration - current.agentGeneration);
  if (next.presetId !== current.presetId) {
    // Attaching another preset raises the agent counter, which alone decides.
    return agent > 0 ? 'newer' : agent < 0 ? 'older' : 'incomparable';
  }
  const preset = Math.sign(next.presetGeneration - current.presetGeneration);
  if (agent === 0 && preset === 0) return 'same';
  if (agent >= 0 && preset >= 0) return 'newer';
  if (agent <= 0 && preset <= 0) return 'older';
  return 'incomparable';
}

export const ModelsEtagIdentitySchema = z.object({
  managementAgentId: AgentIdSchema,
  runtimeAgentId: AgentIdSchema,
  vaultAgentId: z.number().int().positive(),
}).strict();
export type ModelsEtagIdentity = z.infer<typeof ModelsEtagIdentitySchema>;

export interface ModelsEtagInput {
  mode: ModelsMode;
  identity: ModelsEtagIdentity;
  generation: ModelsGeneration;
}

/** `m2-<mode>-<vaultAgentId>-<presetId>-<agentGeneration>-<presetGeneration>-<hash>` (no HTTP quotes); `presetId` null prints `null`. */
export function modelsEtag(input: ModelsEtagInput): string {
  const mode = ModelsModeSchema.parse(input.mode);
  const identity = ModelsEtagIdentitySchema.parse(input.identity);
  const generation = ModelsGenerationSchema.parse(input.generation);
  // Fixed key order: the hash does not depend on how the caller built the objects.
  const canonical = JSON.stringify({
    mode,
    managementAgentId: identity.managementAgentId,
    runtimeAgentId: identity.runtimeAgentId,
    vaultAgentId: identity.vaultAgentId,
    presetId: generation.presetId,
    agentGeneration: generation.agentGeneration,
    presetGeneration: generation.presetGeneration,
  });
  const hash = createHash('sha256').update(canonical).digest('hex').slice(0, 16);
  return `m2-${mode}-${identity.vaultAgentId}-${generation.presetId ?? 'null'}-${generation.agentGeneration}-${generation.presetGeneration}-${hash}`;
}

const ETAG_PATTERN = /^m2-(v1|v2)-(\d+)-(null|\d+)-(\d+)-(\d+)-([0-9a-f]{16})$/;

/** The fields readable from an ETag (the hash cannot be re-checked without the identity); `null` if it is not ours. */
export function parseModelsEtag(value: unknown): { mode: ModelsMode; vaultAgentId: number; generation: ModelsGeneration } | null {
  if (typeof value !== 'string') return null;
  const match = ETAG_PATTERN.exec(value);
  if (match === null) return null;
  const parsed = ModelsGenerationSchema.safeParse({
    presetId: match[3] === 'null' ? null : Number(match[3]),
    agentGeneration: Number(match[4]),
    presetGeneration: Number(match[5]),
  });
  const vaultAgentId = Number(match[2]);
  if (!parsed.success || !Number.isSafeInteger(vaultAgentId) || vaultAgentId < 1) return null;
  return { mode: match[1] as ModelsMode, vaultAgentId, generation: parsed.data };
}
