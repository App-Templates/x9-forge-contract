import { z } from 'zod';
import { PaperclipCorsaSchema, type PaperclipCorsa } from './corsa.js';
import { PAPERCLIP_WAKE_SOURCES, PAPERCLIP_WAKE_TRIGGER_DETAILS } from './turno.js';
import { PaperclipAgenteMeSchema } from './wire-letture.js';

/**
 * Waking an agent by hand, and the heartbeat configuration of an agent. Source: Paperclip 2026.1005.0.
 *
 * THE RULE: an agent can wake only itself. `POST /api/agents/:id/wakeup` and `POST /api/agents/:id/heartbeat/invoke` answer
 * 403 «Agent can only invoke itself» when the caller is an agent and the target is another one (server/src/routes/agents.ts:5948-5952,
 * 6199-6206). No route lets an agent wake another agent. To make another agent act, assign it a task by id, write a comment on the
 * task it already holds (wakes only the assignee), or address a card to it (the wake is `interaction_pending`).
 */

/** Paperclip does not bound the reason (validators/agent.ts:234); the bridge does: a reason is a short code, not a sentence. */
export const PAPERCLIP_WAKE_REASON_MAX = 200;
/** Paperclip does not bound the key of a wake (validators/agent.ts:238); every other key it takes is at most 255 (validators/issue.ts:767). */
export const PAPERCLIP_WAKE_IDEMPOTENCY_KEY_MAX = 255;

/**
 * Body of `POST /api/agents/:id/wakeup` (validators/agent.ts:228-249). Not sent from here, on purpose: `failedRunId` (retry of an exact
 * failed run, board only: routes/agents.ts:5968-5980) and `debug` (instance admin only: 5956-5958). The server strips unknown fields;
 * the bridge refuses them.
 */
export const PaperclipWakeupCorpoSchema = z.strictObject({
  source: z.enum(PAPERCLIP_WAKE_SOURCES).optional(),
  triggerDetail: z.enum(PAPERCLIP_WAKE_TRIGGER_DETAILS).optional(),
  reason: z.string().min(1).max(PAPERCLIP_WAKE_REASON_MAX).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
  idempotencyKey: z.string().min(1).max(PAPERCLIP_WAKE_IDEMPOTENCY_KEY_MAX).optional(),
  forceFreshSession: z.boolean().optional(),
});
/** `POST /api/agents/:id/heartbeat/invoke`: same body without `source`, which the route fixes to `on_demand` (routes/agents.ts:6184-6193). */
export const PaperclipHeartbeatInvokeCorpoSchema = PaperclipWakeupCorpoSchema.omit({ source: true });
export type PaperclipWakeupCorpo = z.infer<typeof PaperclipWakeupCorpoSchema>;
export type PaperclipHeartbeatInvokeCorpo = z.infer<typeof PaperclipHeartbeatInvokeCorpoSchema>;

export const paperclipPercorsiSveglie = {
  wakeup(agentId: string): string {
    return `/api/agents/${z.guid().parse(agentId)}/wakeup`;
  },
  heartbeatInvoke(agentId: string): string {
    return `/api/agents/${z.guid().parse(agentId)}/heartbeat/invoke`;
  },
};

export const PAPERCLIP_WAKE_REFUSALS = ['agent_can_only_invoke_itself'] as const;
export type PaperclipWakeRefusal = (typeof PAPERCLIP_WAKE_REFUSALS)[number];
/** Exact text of the 403 (routes/agents.ts:5950). */
export const PAPERCLIP_SELF_ONLY_TEXT = 'Agent can only invoke itself';
export function isPaperclipSelfOnlyRefusal(httpStatus: number, text: string | null | undefined): boolean {
  return httpStatus === 403 && (text ?? '').trim() === PAPERCLIP_SELF_ONLY_TEXT;
}

export type PaperclipWakeRequest<Body> = { ok: true; path: string; body: Body } | { ok: false; refusal: PaperclipWakeRefusal };

/** The only way to build a wake call: the caller and the target must be the same agent. */
export function paperclipWakeupRequest(input: { callerAgentId: string; targetAgentId: string; body: PaperclipWakeupCorpo }): PaperclipWakeRequest<PaperclipWakeupCorpo> {
  if (input.callerAgentId !== input.targetAgentId) return { ok: false, refusal: 'agent_can_only_invoke_itself' };
  return { ok: true, path: paperclipPercorsiSveglie.wakeup(input.targetAgentId), body: PaperclipWakeupCorpoSchema.parse(input.body) };
}
export function paperclipHeartbeatInvokeRequest(
  input: { callerAgentId: string; targetAgentId: string; body: PaperclipHeartbeatInvokeCorpo },
): PaperclipWakeRequest<PaperclipHeartbeatInvokeCorpo> {
  if (input.callerAgentId !== input.targetAgentId) return { ok: false, refusal: 'agent_can_only_invoke_itself' };
  return { ok: true, path: paperclipPercorsiSveglie.heartbeatInvoke(input.targetAgentId), body: PaperclipHeartbeatInvokeCorpoSchema.parse(input.body) };
}

/** The three reasons of a skipped answer (routes/agents.ts:2052-2124). */
export const PAPERCLIP_SKIPPED_WAKEUP_REASONS = ['wakeup_skipped', 'execution_reconciliation_required', 'issue_execution_deferred'] as const;
/** 202 without a run: the wake was not admitted (`SkippedWakeupResponse`, routes/agents.ts:6139-6142). */
export const PaperclipWakeupSaltataSchema = z.looseObject({
  status: z.literal('skipped'),
  reason: z.enum(PAPERCLIP_SKIPPED_WAKEUP_REASONS),
  message: z.string(),
  issueId: z.string().nullable(),
  executionRunId: z.guid().nullable(),
  executionAgentId: z.guid().nullable(),
  executionAgentName: z.string().nullable(),
});
export type PaperclipWakeupSaltata = z.infer<typeof PaperclipWakeupSaltataSchema>;

export type PaperclipWakeAnswer =
  | { kind: 'run'; run: PaperclipCorsa }
  | { kind: 'skipped'; skipped: PaperclipWakeupSaltata }
  | { kind: 'self_only_refused' }
  | { kind: 'conflict' }
  | { kind: 'unexpected' };

/**
 * What an answer to a wake means. 409 (budget blocked, agent not invokable, broken chain of command: services/heartbeat.ts:27097-27128;
 * routes/agents.ts:5959-5964) is not a delivery error and is never retried; a 2xx with no run is `skipped`, not delivered.
 */
export function classifyPaperclipWakeAnswer(httpStatus: number, body: unknown): PaperclipWakeAnswer {
  if (httpStatus === 403) {
    const text = typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string' ? body.error : '';
    return isPaperclipSelfOnlyRefusal(httpStatus, text) ? { kind: 'self_only_refused' } : { kind: 'unexpected' };
  }
  if (httpStatus === 409) return { kind: 'conflict' };
  if (httpStatus !== 200 && httpStatus !== 202) return { kind: 'unexpected' };
  const skipped = PaperclipWakeupSaltataSchema.safeParse(body);
  if (skipped.success) return { kind: 'skipped', skipped: skipped.data };
  const run = PaperclipCorsaSchema.safeParse(body);
  return run.success ? { kind: 'run', run: run.data } : { kind: 'unexpected' };
}

/** Paperclip packages/shared/src/constants.ts:77 and services/heartbeat.ts:673-676, 3708-3717 (it clamps; the bridge refuses a value out of range). */
export const PAPERCLIP_HEARTBEAT_MAX_CONCURRENT_RUNS = { default: 20, min: 1, max: 50 } as const;

/**
 * `agent.runtimeConfig.heartbeat`, as the bridge writes it (services/heartbeat.ts:16666-16696). Only the canonical names: the server also
 * reads aliases (`dailyRunLimit`, `requireActionableTimerWork`, ...) and merges `wakeOnAssignment`, `wakeOnOnDemand`, `wakeOnAutomation`
 * into ONE `wakeOnDemand` that switches off every wake that is not the timer (services/heartbeat-policy.ts:4-15): write `wakeOnDemand` only.
 * Defaults when absent: `enabled` false, `intervalSec` 0, `wakeOnDemand` true, `maxConcurrentRuns` 20.
 */
export const PaperclipRuntimeHeartbeatSchema = z.strictObject({
  enabled: z.boolean().optional(),
  intervalSec: z.number().int().nonnegative().optional(),
  wakeOnDemand: z.boolean().optional(),
  maxConcurrentRuns: z.number().int().min(PAPERCLIP_HEARTBEAT_MAX_CONCURRENT_RUNS.min).max(PAPERCLIP_HEARTBEAT_MAX_CONCURRENT_RUNS.max).optional(),
  skipTimerWhenNoActionableWork: z.boolean().optional(),
  maxDailyRuns: z.number().int().nonnegative().nullable().optional(),
  maxDailyCostCents: z.number().int().nonnegative().nullable().optional(),
});
export type PaperclipRuntimeHeartbeat = z.infer<typeof PaperclipRuntimeHeartbeatSchema>;
/** The same, read from `GET /api/agents/me` and `GET /api/agents/:id`: tolerant, a hint that does not fit is dropped. */
export const PaperclipRuntimeHeartbeatLettoSchema = z.looseObject({
  enabled: z.boolean().optional().catch(undefined),
  intervalSec: z.number().optional().catch(undefined),
  wakeOnDemand: z.boolean().optional().catch(undefined),
  maxConcurrentRuns: z.number().optional().catch(undefined),
  skipTimerWhenNoActionableWork: z.boolean().optional().catch(undefined),
  maxDailyRuns: z.number().nullable().optional().catch(undefined),
  maxDailyCostCents: z.number().nullable().optional().catch(undefined),
});
export const PaperclipAgenteConHeartbeatSchema = PaperclipAgenteMeSchema.extend({
  runtimeConfig: z.looseObject({ heartbeat: PaperclipRuntimeHeartbeatLettoSchema.optional().catch(undefined) }).nullable().optional().catch(undefined),
});
export type PaperclipAgenteConHeartbeat = z.infer<typeof PaperclipAgenteConHeartbeatSchema>;

/** The key of the wakes the bridge sends by hand: one function, so no consumer composes its own (the stack has four forms today). */
export function paperclipWakeIdempotencyKey(prefix: string, ...parts: readonly string[]): string {
  const key = [z.string().regex(/^[a-z0-9][a-z0-9_-]*$/).parse(prefix), ...parts.map(part => z.string().min(1).parse(part))].join(':');
  if (key.length > PAPERCLIP_WAKE_IDEMPOTENCY_KEY_MAX) throw new Error('Wake idempotency key longer than 255 characters');
  return key;
}
