import { z } from 'zod';
import { AgentManagementRequestIdSchema } from './agent-management.js';
import { AgentRuntimeIdentitySchema } from './agent-runtime-identity.js';
import { ReloadAgentParamsSchema } from '../http/endpoints/internal-agents-reload.js';

const deletionId = ReloadAgentParamsSchema.shape.agentId.max(128);
const deletionIdentity = AgentRuntimeIdentitySchema.strict().superRefine((identity, ctx) => {
  for (const key of ['managementAgentId', 'runtimeAgentId'] as const) {
    if (!deletionId.safeParse(identity[key]).success) {
      ctx.addIssue({ code: 'custom', path: [key], message: 'Invalid deletion identity' });
    }
  }
});

/** The name is exact, never trimmed. Forge compares it to its authoritative saved name. */
export const AgentDeletionCommandSchema = z.object({
  requestId: AgentManagementRequestIdSchema,
  identity: deletionIdentity,
  confirmedName: z.string().min(1).max(200).refine(name => name.trim().length > 0 && !/[\u0000-\u001f\u007f]/.test(name)),
}).strict();
export type AgentDeletionCommand = z.infer<typeof AgentDeletionCommandSchema>;

/** Every report includes exactly these scopes; none denotes a shared process or owner resource. */
export const AgentDeletionStepSchema = z.enum([
  'tombstone', 'admission', 'channels', 'runtime', 'caches', 'context', 'workspace', 'private-state',
]);
export type AgentDeletionStep = z.infer<typeof AgentDeletionStepSchema>;
export const AGENT_DELETION_STEPS = AgentDeletionStepSchema.options;

/** Machine codes only: no provider messages, file paths, tokens or free text diagnostics. */
export const AgentDeletionFailureCodeSchema = z.enum([
  'timeout', 'source-unavailable', 'scope-unavailable', 'shared-resource', 'drain-failed',
  'channel-close-failed', 'storage-failed', 'cleanup-failed',
]);
export type AgentDeletionFailureCode = z.infer<typeof AgentDeletionFailureCodeSchema>;

export const AgentDeletionPieceSchema = z.discriminatedUnion('outcome', [
  z.object({ step: AgentDeletionStepSchema, outcome: z.literal('completed') }).strict(),
  z.object({ step: AgentDeletionStepSchema, outcome: z.literal('absent') }).strict(),
  z.object({ step: AgentDeletionStepSchema, outcome: z.literal('failed'), reason: AgentDeletionFailureCodeSchema }).strict(),
  z.object({ step: AgentDeletionStepSchema, outcome: z.literal('blocked'), reason: z.literal('dependency-failed') }).strict(),
]).superRefine((piece, ctx) => {
  if (piece.step === 'tombstone' && piece.outcome !== 'completed' && piece.outcome !== 'failed') {
    ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'Tombstone must be persisted or explicitly failed' });
  }
});
export type AgentDeletionPiece = z.infer<typeof AgentDeletionPieceSchema>;
const isFinished = (piece: AgentDeletionPiece | undefined): boolean => piece?.outcome === 'completed' || piece?.outcome === 'absent';

/**
 * Durable single-agent removal, separate from lifecycle stop and Forge archival.
 *
 * Producers persist the tombstone before effects, share the lifecycle/apply mutex, drain admission,
 * and retain per-piece progress across crashes. The tombstone prevents resurrection by load/start/
 * reload/apply after process restart. It is NEVER deleted by private-state cleanup.
 * Same requestId and exact command resumes unfinished pieces only; different intention conflicts.
 * 200 partial is an honest processed report, not an HTTP-level success for all resources.
 */
export const AgentDeletionResultSchema = z.object({
  ok: z.literal(true),
  agentId: deletionId,
  identity: deletionIdentity,
  requestId: AgentManagementRequestIdSchema,
  replayed: z.boolean(),
  outcome: z.enum(['complete', 'partial']),
  tombstoned: z.boolean(),
  results: z.array(AgentDeletionPieceSchema).length(8),
  completedAt: z.string().datetime(),
}).strict().superRefine((result, ctx) => {
  if (result.agentId !== result.identity.managementAgentId) {
    ctx.addIssue({ code: 'custom', path: ['agentId'], message: 'Deletion addresses the management identity only' });
  }
  const pieces = new Map<AgentDeletionStep, AgentDeletionPiece>();
  for (const [index, piece] of result.results.entries()) {
    if (pieces.has(piece.step)) ctx.addIssue({ code: 'custom', path: ['results', index], message: 'Duplicate deletion piece' });
    pieces.set(piece.step, piece);
  }
  for (const step of AGENT_DELETION_STEPS) {
    if (!pieces.has(step)) ctx.addIssue({ code: 'custom', path: ['results'], message: 'Missing deletion piece' });
  }
  const complete = result.results.every(isFinished);
  if ((result.outcome === 'complete') !== complete) {
    ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'Overall deletion outcome must match every piece' });
  }
  const tombstone = pieces.get('tombstone');
  if (result.tombstoned !== (tombstone?.outcome === 'completed')) {
    ctx.addIssue({ code: 'custom', path: ['tombstoned'], message: 'Durability flag must match the tombstone piece' });
  }
  const blockedWithoutFailure = result.results.some(piece => piece.outcome === 'blocked') && !result.results.some(piece => piece.outcome === 'failed');
  if (blockedWithoutFailure) ctx.addIssue({ code: 'custom', path: ['results'], message: 'Blocked pieces require a failed dependency' });
  for (const piece of result.results) {
    if (piece.step === 'tombstone') continue;
    const tombstoneFailed = tombstone?.outcome !== 'completed';
    const admissionFailed = piece.step !== 'admission' && !isFinished(pieces.get('admission'));
    const runtimeOrChannelFailed = ['caches', 'context', 'workspace', 'private-state'].includes(piece.step) &&
      (!isFinished(pieces.get('runtime')) || !isFinished(pieces.get('channels')));
    if ((tombstoneFailed || admissionFailed || runtimeOrChannelFailed) && piece.outcome !== 'blocked') {
      ctx.addIssue({ code: 'custom', path: ['results'], message: 'Effects require completed isolation dependencies' });
    }
  }
});
export type AgentDeletionResult = z.infer<typeof AgentDeletionResultSchema>;

/** Consumers must correlate a validated report before advancing their durable deletion job. */
export function isAgentDeletionResultCurrent(agentId: string, command: unknown, result: unknown): boolean {
  const addressed = deletionId.safeParse(agentId);
  const request = AgentDeletionCommandSchema.safeParse(command);
  const response = AgentDeletionResultSchema.safeParse(result);
  if (!addressed.success || !request.success || !response.success) return false;
  const expected = request.data.identity;
  const actual = response.data.identity;
  return addressed.data === expected.managementAgentId && response.data.agentId === addressed.data &&
    response.data.requestId === request.data.requestId &&
    actual.runtimeAgentId === expected.runtimeAgentId && actual.vaultAgentId === expected.vaultAgentId;
}
