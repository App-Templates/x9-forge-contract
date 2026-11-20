"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipAgenteConHeartbeatSchema = exports.PaperclipRuntimeHeartbeatLettoSchema = exports.PaperclipRuntimeHeartbeatSchema = exports.PAPERCLIP_HEARTBEAT_MAX_CONCURRENT_RUNS = exports.PaperclipWakeupSaltataSchema = exports.PAPERCLIP_SKIPPED_WAKEUP_REASONS = exports.PAPERCLIP_SELF_ONLY_TEXT = exports.PAPERCLIP_WAKE_REFUSALS = exports.paperclipPercorsiSveglie = exports.PaperclipHeartbeatInvokeCorpoSchema = exports.PaperclipWakeupCorpoSchema = exports.PAPERCLIP_WAKE_IDEMPOTENCY_KEY_MAX = exports.PAPERCLIP_WAKE_REASON_MAX = void 0;
exports.isPaperclipSelfOnlyRefusal = isPaperclipSelfOnlyRefusal;
exports.paperclipWakeupRequest = paperclipWakeupRequest;
exports.paperclipHeartbeatInvokeRequest = paperclipHeartbeatInvokeRequest;
exports.classifyPaperclipWakeAnswer = classifyPaperclipWakeAnswer;
exports.paperclipWakeIdempotencyKey = paperclipWakeIdempotencyKey;
const zod_1 = require("zod");
const corsa_js_1 = require("./corsa.cjs");
const turno_js_1 = require("./turno.cjs");
const wire_letture_js_1 = require("./wire-letture.cjs");
/**
 * Waking an agent by hand, and the heartbeat configuration of an agent. Source: Paperclip 2026.1005.0.
 *
 * THE RULE: an agent can wake only itself. `POST /api/agents/:id/wakeup` and `POST /api/agents/:id/heartbeat/invoke` answer
 * 403 «Agent can only invoke itself» when the caller is an agent and the target is another one (server/src/routes/agents.ts:5948-5952,
 * 6199-6206). No route lets an agent wake another agent. To make another agent act, assign it a task by id, write a comment on the
 * task it already holds (wakes only the assignee), or address a card to it (the wake is `interaction_pending`).
 */
/** Paperclip does not bound the reason (validators/agent.ts:234); the bridge does: a reason is a short code, not a sentence. */
exports.PAPERCLIP_WAKE_REASON_MAX = 200;
/** Paperclip does not bound the key of a wake (validators/agent.ts:238); every other key it takes is at most 255 (validators/issue.ts:767). */
exports.PAPERCLIP_WAKE_IDEMPOTENCY_KEY_MAX = 255;
/**
 * Body of `POST /api/agents/:id/wakeup` (validators/agent.ts:228-249). Not sent from here, on purpose: `failedRunId` (retry of an exact
 * failed run, board only: routes/agents.ts:5968-5980) and `debug` (instance admin only: 5956-5958). The server strips unknown fields;
 * the bridge refuses them.
 */
exports.PaperclipWakeupCorpoSchema = zod_1.z.strictObject({
    source: zod_1.z.enum(turno_js_1.PAPERCLIP_WAKE_SOURCES).optional(),
    triggerDetail: zod_1.z.enum(turno_js_1.PAPERCLIP_WAKE_TRIGGER_DETAILS).optional(),
    reason: zod_1.z.string().min(1).max(exports.PAPERCLIP_WAKE_REASON_MAX).optional(),
    payload: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    idempotencyKey: zod_1.z.string().min(1).max(exports.PAPERCLIP_WAKE_IDEMPOTENCY_KEY_MAX).optional(),
    forceFreshSession: zod_1.z.boolean().optional(),
});
/** `POST /api/agents/:id/heartbeat/invoke`: same body without `source`, which the route fixes to `on_demand` (routes/agents.ts:6184-6193). */
exports.PaperclipHeartbeatInvokeCorpoSchema = exports.PaperclipWakeupCorpoSchema.omit({ source: true });
exports.paperclipPercorsiSveglie = {
    wakeup(agentId) {
        return `/api/agents/${zod_1.z.guid().parse(agentId)}/wakeup`;
    },
    heartbeatInvoke(agentId) {
        return `/api/agents/${zod_1.z.guid().parse(agentId)}/heartbeat/invoke`;
    },
};
exports.PAPERCLIP_WAKE_REFUSALS = ['agent_can_only_invoke_itself'];
/** Exact text of the 403 (routes/agents.ts:5950). */
exports.PAPERCLIP_SELF_ONLY_TEXT = 'Agent can only invoke itself';
function isPaperclipSelfOnlyRefusal(httpStatus, text) {
    return httpStatus === 403 && (text ?? '').trim() === exports.PAPERCLIP_SELF_ONLY_TEXT;
}
/** The only way to build a wake call: the caller and the target must be the same agent. */
function paperclipWakeupRequest(input) {
    if (input.callerAgentId !== input.targetAgentId)
        return { ok: false, refusal: 'agent_can_only_invoke_itself' };
    return { ok: true, path: exports.paperclipPercorsiSveglie.wakeup(input.targetAgentId), body: exports.PaperclipWakeupCorpoSchema.parse(input.body) };
}
function paperclipHeartbeatInvokeRequest(input) {
    if (input.callerAgentId !== input.targetAgentId)
        return { ok: false, refusal: 'agent_can_only_invoke_itself' };
    return { ok: true, path: exports.paperclipPercorsiSveglie.heartbeatInvoke(input.targetAgentId), body: exports.PaperclipHeartbeatInvokeCorpoSchema.parse(input.body) };
}
/** The three reasons of a skipped answer (routes/agents.ts:2052-2124). */
exports.PAPERCLIP_SKIPPED_WAKEUP_REASONS = ['wakeup_skipped', 'execution_reconciliation_required', 'issue_execution_deferred'];
/** 202 without a run: the wake was not admitted (`SkippedWakeupResponse`, routes/agents.ts:6139-6142). */
exports.PaperclipWakeupSaltataSchema = zod_1.z.looseObject({
    status: zod_1.z.literal('skipped'),
    reason: zod_1.z.enum(exports.PAPERCLIP_SKIPPED_WAKEUP_REASONS),
    message: zod_1.z.string(),
    issueId: zod_1.z.string().nullable(),
    executionRunId: zod_1.z.guid().nullable(),
    executionAgentId: zod_1.z.guid().nullable(),
    executionAgentName: zod_1.z.string().nullable(),
});
/**
 * What an answer to a wake means. 409 (budget blocked, agent not invokable, broken chain of command: services/heartbeat.ts:27097-27128;
 * routes/agents.ts:5959-5964) is not a delivery error and is never retried; a 2xx with no run is `skipped`, not delivered.
 */
function classifyPaperclipWakeAnswer(httpStatus, body) {
    if (httpStatus === 403) {
        const text = typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string' ? body.error : '';
        return isPaperclipSelfOnlyRefusal(httpStatus, text) ? { kind: 'self_only_refused' } : { kind: 'unexpected' };
    }
    if (httpStatus === 409)
        return { kind: 'conflict' };
    if (httpStatus !== 200 && httpStatus !== 202)
        return { kind: 'unexpected' };
    const skipped = exports.PaperclipWakeupSaltataSchema.safeParse(body);
    if (skipped.success)
        return { kind: 'skipped', skipped: skipped.data };
    const run = corsa_js_1.PaperclipCorsaSchema.safeParse(body);
    return run.success ? { kind: 'run', run: run.data } : { kind: 'unexpected' };
}
/** Paperclip packages/shared/src/constants.ts:77 and services/heartbeat.ts:673-676, 3708-3717 (it clamps; the bridge refuses a value out of range). */
exports.PAPERCLIP_HEARTBEAT_MAX_CONCURRENT_RUNS = { default: 20, min: 1, max: 50 };
/**
 * `agent.runtimeConfig.heartbeat`, as the bridge writes it (services/heartbeat.ts:16666-16696). Only the canonical names: the server also
 * reads aliases (`dailyRunLimit`, `requireActionableTimerWork`, ...) and merges `wakeOnAssignment`, `wakeOnOnDemand`, `wakeOnAutomation`
 * into ONE `wakeOnDemand` that switches off every wake that is not the timer (services/heartbeat-policy.ts:4-15): write `wakeOnDemand` only.
 * Defaults when absent: `enabled` false, `intervalSec` 0, `wakeOnDemand` true, `maxConcurrentRuns` 20.
 */
exports.PaperclipRuntimeHeartbeatSchema = zod_1.z.strictObject({
    enabled: zod_1.z.boolean().optional(),
    intervalSec: zod_1.z.number().int().nonnegative().optional(),
    wakeOnDemand: zod_1.z.boolean().optional(),
    maxConcurrentRuns: zod_1.z.number().int().min(exports.PAPERCLIP_HEARTBEAT_MAX_CONCURRENT_RUNS.min).max(exports.PAPERCLIP_HEARTBEAT_MAX_CONCURRENT_RUNS.max).optional(),
    skipTimerWhenNoActionableWork: zod_1.z.boolean().optional(),
    maxDailyRuns: zod_1.z.number().int().nonnegative().nullable().optional(),
    maxDailyCostCents: zod_1.z.number().int().nonnegative().nullable().optional(),
});
/** The same, read from `GET /api/agents/me` and `GET /api/agents/:id`: tolerant, a hint that does not fit is dropped. */
exports.PaperclipRuntimeHeartbeatLettoSchema = zod_1.z.looseObject({
    enabled: zod_1.z.boolean().optional().catch(undefined),
    intervalSec: zod_1.z.number().optional().catch(undefined),
    wakeOnDemand: zod_1.z.boolean().optional().catch(undefined),
    maxConcurrentRuns: zod_1.z.number().optional().catch(undefined),
    skipTimerWhenNoActionableWork: zod_1.z.boolean().optional().catch(undefined),
    maxDailyRuns: zod_1.z.number().nullable().optional().catch(undefined),
    maxDailyCostCents: zod_1.z.number().nullable().optional().catch(undefined),
});
exports.PaperclipAgenteConHeartbeatSchema = wire_letture_js_1.PaperclipAgenteMeSchema.extend({
    runtimeConfig: zod_1.z.looseObject({ heartbeat: exports.PaperclipRuntimeHeartbeatLettoSchema.optional().catch(undefined) }).nullable().optional().catch(undefined),
});
/** The key of the wakes the bridge sends by hand: one function, so no consumer composes its own (the stack has four forms today). */
function paperclipWakeIdempotencyKey(prefix, ...parts) {
    const key = [zod_1.z.string().regex(/^[a-z0-9][a-z0-9_-]*$/).parse(prefix), ...parts.map(part => zod_1.z.string().min(1).parse(part))].join(':');
    if (key.length > exports.PAPERCLIP_WAKE_IDEMPOTENCY_KEY_MAX)
        throw new Error('Wake idempotency key longer than 255 characters');
    return key;
}
//# sourceMappingURL=wire-sveglie.js.map