import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../../auth/auth-headers.js';
import { CapabilityAgentScopeSchema } from '../capability-call-identity.js';
import { sameCapabilityScope } from '../capability-call-context.js';
import { CapabilityAgentIdSchema } from '../ricerca/agent-config.js';
import { AgentDaySchema } from '../ricerca/spend.js';
import {
  SocialJobInputSchema,
  SocialJobResultSchema,
  socialJobResultMatches,
  type SocialJobInput,
  type SocialJobResult,
  type SocialJobResultMatch,
} from './job-io.js';
import { SocialVerticalIdSchema } from './post.js';
import { SocialRoundSchema, type SocialJob, type SocialRound } from './queue.js';

/** Decode generic channel data only for the exact social queue job and trusted scope. */
export function readSocialGenericJob(
  generic: { capability: string; kind: string; scope: unknown; input: unknown },
  queueJob: SocialJob,
): { ok: true; input: SocialJobInput } | {
  ok: false;
  error: 'not_social_job' | 'foreign_scope' | 'kind_mismatch' | 'invalid_input' | 'input_mismatch';
} {
  if (generic.capability !== 'social-listening') return { ok: false, error: 'not_social_job' };
  const scope = CapabilityAgentScopeSchema.safeParse(generic.scope);
  if (!scope.success || !sameCapabilityScope(scope.data, queueJob.identity)) {
    return { ok: false, error: 'foreign_scope' };
  }
  if (generic.kind !== queueJob.kind) return { ok: false, error: 'kind_mismatch' };
  const parsed = SocialJobInputSchema.safeParse(generic.input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };
  const input = parsed.data;
  if (input.kind !== queueJob.kind) return { ok: false, error: 'kind_mismatch' };
  if (
    ('postId' in input && input.postId !== queueJob.postId)
    || ('topicId' in input && input.topicId !== queueJob.topicId)
    || ('verticalId' in input && input.verticalId !== queueJob.verticalId)
  ) {
    return { ok: false, error: 'input_mismatch' };
  }
  return { ok: true, input };
}

/** The service attaches identity from the queue job; identity never comes from the executor. */
export function readSocialGenericOutput(
  queueJob: SocialJob,
  output: unknown,
): { ok: true; result: SocialJobResult } | { ok: false; error: 'invalid_result' }
  | Extract<SocialJobResultMatch, { ok: false }> {
  const parsed = SocialJobResultSchema.safeParse(output);
  if (!parsed.success) return { ok: false, error: 'invalid_result' };
  const match = socialJobResultMatches(queueJob, parsed.data);
  if (!match.ok) return match;
  return { ok: true, result: parsed.data };
}

/** Build the read-only round path for a validated agent id. */
export function socialRoundPath(agentId: string): string {
  return `/internal/capability/agents/${CapabilityAgentIdSchema.parse(agentId)}/social-listening/round`;
}

export const SocialRoundQuerySchema = z.strictObject({
  scope: CapabilityAgentScopeSchema,
  verticalId: SocialVerticalIdSchema,
  day: AgentDaySchema,
});
export type SocialRoundQuery = z.infer<typeof SocialRoundQuerySchema>;

export const SocialRoundReadResponseSchema = z.strictObject({ round: SocialRoundSchema.nullable() });

/** Accept a complete round response only within the requested scope, vertical and day. */
export function selectSocialRound(
  raw: unknown,
  query: SocialRoundQuery,
): { ok: true; round: SocialRound | null }
  | { ok: false; error: 'invalid_response' | 'foreign_scope' | 'round_mismatch' } {
  const request = SocialRoundQuerySchema.safeParse(query);
  const response = SocialRoundReadResponseSchema.safeParse(raw);
  if (!request.success || !response.success) return { ok: false, error: 'invalid_response' };
  const { round } = response.data;
  if (round === null) return { ok: true, round: null };
  if (!sameCapabilityScope(round.identity, request.data.scope)) return { ok: false, error: 'foreign_scope' };
  if (round.verticalId !== request.data.verticalId || round.day !== request.data.day) {
    return { ok: false, error: 'round_mismatch' };
  }
  return { ok: true, round };
}

/**
 * The internal secret travels in the {@link INTERNAL_SECRET_HEADER} header.
 * The service must compare path agentId with scope.agentId and authorize that scope.
 * Reading an absent round returns null and never creates or enqueues work.
 */
export const socialRoundReadContract = {
  method: 'GET' as const,
  path: '/internal/capability/agents/:agentId/social-listening/round' as const,
  authType: 'secret' as const,
  paramsSchema: z.strictObject({ agentId: CapabilityAgentIdSchema }),
  querySchema: SocialRoundQuerySchema,
  responseSchema: SocialRoundReadResponseSchema,
} as const;
