import { z } from 'zod';
import { type PaperclipCorsa } from "./corsa.js";
/**
 * Waking an agent by hand, and the heartbeat configuration of an agent. Source: Paperclip 2026.1005.0.
 *
 * THE RULE: an agent can wake only itself. `POST /api/agents/:id/wakeup` and `POST /api/agents/:id/heartbeat/invoke` answer
 * 403 «Agent can only invoke itself» when the caller is an agent and the target is another one (server/src/routes/agents.ts:5948-5952,
 * 6199-6206). No route lets an agent wake another agent. To make another agent act, assign it a task by id, write a comment on the
 * task it already holds (wakes only the assignee), or address a card to it (the wake is `interaction_pending`).
 */
/** Paperclip does not bound the reason (validators/agent.ts:234); the bridge does: a reason is a short code, not a sentence. */
export declare const PAPERCLIP_WAKE_REASON_MAX = 200;
/** Paperclip does not bound the key of a wake (validators/agent.ts:238); every other key it takes is at most 255 (validators/issue.ts:767). */
export declare const PAPERCLIP_WAKE_IDEMPOTENCY_KEY_MAX = 255;
/**
 * Body of `POST /api/agents/:id/wakeup` (validators/agent.ts:228-249). Not sent from here, on purpose: `failedRunId` (retry of an exact
 * failed run, board only: routes/agents.ts:5968-5980) and `debug` (instance admin only: 5956-5958). The server strips unknown fields;
 * the bridge refuses them.
 */
export declare const PaperclipWakeupCorpoSchema: z.ZodObject<{
    source: z.ZodOptional<z.ZodEnum<{
        timer: "timer";
        assignment: "assignment";
        on_demand: "on_demand";
        automation: "automation";
    }>>;
    triggerDetail: z.ZodOptional<z.ZodEnum<{
        system: "system";
        callback: "callback";
        manual: "manual";
        ping: "ping";
    }>>;
    reason: z.ZodOptional<z.ZodString>;
    payload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    forceFreshSession: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
/** `POST /api/agents/:id/heartbeat/invoke`: same body without `source`, which the route fixes to `on_demand` (routes/agents.ts:6184-6193). */
export declare const PaperclipHeartbeatInvokeCorpoSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    payload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    triggerDetail: z.ZodOptional<z.ZodEnum<{
        system: "system";
        callback: "callback";
        manual: "manual";
        ping: "ping";
    }>>;
    forceFreshSession: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export type PaperclipWakeupCorpo = z.infer<typeof PaperclipWakeupCorpoSchema>;
export type PaperclipHeartbeatInvokeCorpo = z.infer<typeof PaperclipHeartbeatInvokeCorpoSchema>;
export declare const paperclipPercorsiSveglie: {
    wakeup(agentId: string): string;
    heartbeatInvoke(agentId: string): string;
};
export declare const PAPERCLIP_WAKE_REFUSALS: readonly ["agent_can_only_invoke_itself"];
export type PaperclipWakeRefusal = (typeof PAPERCLIP_WAKE_REFUSALS)[number];
/** Exact text of the 403 (routes/agents.ts:5950). */
export declare const PAPERCLIP_SELF_ONLY_TEXT = "Agent can only invoke itself";
export declare function isPaperclipSelfOnlyRefusal(httpStatus: number, text: string | null | undefined): boolean;
export type PaperclipWakeRequest<Body> = {
    ok: true;
    path: string;
    body: Body;
} | {
    ok: false;
    refusal: PaperclipWakeRefusal;
};
/** The only way to build a wake call: the caller and the target must be the same agent. */
export declare function paperclipWakeupRequest(input: {
    callerAgentId: string;
    targetAgentId: string;
    body: PaperclipWakeupCorpo;
}): PaperclipWakeRequest<PaperclipWakeupCorpo>;
export declare function paperclipHeartbeatInvokeRequest(input: {
    callerAgentId: string;
    targetAgentId: string;
    body: PaperclipHeartbeatInvokeCorpo;
}): PaperclipWakeRequest<PaperclipHeartbeatInvokeCorpo>;
/** The three reasons of a skipped answer (routes/agents.ts:2052-2124). */
export declare const PAPERCLIP_SKIPPED_WAKEUP_REASONS: readonly ["wakeup_skipped", "execution_reconciliation_required", "issue_execution_deferred"];
/** 202 without a run: the wake was not admitted (`SkippedWakeupResponse`, routes/agents.ts:6139-6142). */
export declare const PaperclipWakeupSaltataSchema: z.ZodObject<{
    status: z.ZodLiteral<"skipped">;
    reason: z.ZodEnum<{
        wakeup_skipped: "wakeup_skipped";
        execution_reconciliation_required: "execution_reconciliation_required";
        issue_execution_deferred: "issue_execution_deferred";
    }>;
    message: z.ZodString;
    issueId: z.ZodNullable<z.ZodString>;
    executionRunId: z.ZodNullable<z.ZodGUID>;
    executionAgentId: z.ZodNullable<z.ZodGUID>;
    executionAgentName: z.ZodNullable<z.ZodString>;
}, z.core.$loose>;
export type PaperclipWakeupSaltata = z.infer<typeof PaperclipWakeupSaltataSchema>;
export type PaperclipWakeAnswer = {
    kind: 'run';
    run: PaperclipCorsa;
} | {
    kind: 'skipped';
    skipped: PaperclipWakeupSaltata;
} | {
    kind: 'self_only_refused';
} | {
    kind: 'conflict';
} | {
    kind: 'unexpected';
};
/**
 * What an answer to a wake means. 409 (budget blocked, agent not invokable, broken chain of command: services/heartbeat.ts:27097-27128;
 * routes/agents.ts:5959-5964) is not a delivery error and is never retried; a 2xx with no run is `skipped`, not delivered.
 */
export declare function classifyPaperclipWakeAnswer(httpStatus: number, body: unknown): PaperclipWakeAnswer;
/** Paperclip packages/shared/src/constants.ts:77 and services/heartbeat.ts:673-676, 3708-3717 (it clamps; the bridge refuses a value out of range). */
export declare const PAPERCLIP_HEARTBEAT_MAX_CONCURRENT_RUNS: {
    readonly default: 20;
    readonly min: 1;
    readonly max: 50;
};
/**
 * `agent.runtimeConfig.heartbeat`, as the bridge writes it (services/heartbeat.ts:16666-16696). Only the canonical names: the server also
 * reads aliases (`dailyRunLimit`, `requireActionableTimerWork`, ...) and merges `wakeOnAssignment`, `wakeOnOnDemand`, `wakeOnAutomation`
 * into ONE `wakeOnDemand` that switches off every wake that is not the timer (services/heartbeat-policy.ts:4-15): write `wakeOnDemand` only.
 * Defaults when absent: `enabled` false, `intervalSec` 0, `wakeOnDemand` true, `maxConcurrentRuns` 20.
 */
export declare const PaperclipRuntimeHeartbeatSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    intervalSec: z.ZodOptional<z.ZodNumber>;
    wakeOnDemand: z.ZodOptional<z.ZodBoolean>;
    maxConcurrentRuns: z.ZodOptional<z.ZodNumber>;
    skipTimerWhenNoActionableWork: z.ZodOptional<z.ZodBoolean>;
    maxDailyRuns: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    maxDailyCostCents: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strict>;
export type PaperclipRuntimeHeartbeat = z.infer<typeof PaperclipRuntimeHeartbeatSchema>;
/** The same, read from `GET /api/agents/me` and `GET /api/agents/:id`: tolerant, a hint that does not fit is dropped. */
export declare const PaperclipRuntimeHeartbeatLettoSchema: z.ZodObject<{
    enabled: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
    intervalSec: z.ZodCatch<z.ZodOptional<z.ZodNumber>>;
    wakeOnDemand: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
    maxConcurrentRuns: z.ZodCatch<z.ZodOptional<z.ZodNumber>>;
    skipTimerWhenNoActionableWork: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
    maxDailyRuns: z.ZodCatch<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    maxDailyCostCents: z.ZodCatch<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
}, z.core.$loose>;
export declare const PaperclipAgenteConHeartbeatSchema: z.ZodObject<{
    id: z.ZodGUID;
    companyId: z.ZodGUID;
    runtimeConfig: z.ZodCatch<z.ZodOptional<z.ZodNullable<z.ZodObject<{
        heartbeat: z.ZodCatch<z.ZodOptional<z.ZodObject<{
            enabled: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
            intervalSec: z.ZodCatch<z.ZodOptional<z.ZodNumber>>;
            wakeOnDemand: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
            maxConcurrentRuns: z.ZodCatch<z.ZodOptional<z.ZodNumber>>;
            skipTimerWhenNoActionableWork: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
            maxDailyRuns: z.ZodCatch<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            maxDailyCostCents: z.ZodCatch<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>>>>;
}, z.core.$loose>;
export type PaperclipAgenteConHeartbeat = z.infer<typeof PaperclipAgenteConHeartbeatSchema>;
/** The key of the wakes the bridge sends by hand: one function, so no consumer composes its own (the stack has four forms today). */
export declare function paperclipWakeIdempotencyKey(prefix: string, ...parts: readonly string[]): string;
//# sourceMappingURL=wire-sveglie.d.ts.map