"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationResultSchema = exports.SimulationScriptSchema = exports.SimulationActionSchema = exports.SimulationWorldSchema = exports.SimulationInitialStateSchema = void 0;
exports.canonicalWorldHash = canonicalWorldHash;
const node_crypto_1 = require("node:crypto");
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const run_context_js_1 = require("./run-context.cjs");
const run_outcome_js_1 = require("./run-outcome.cjs");
const run_receipt_js_1 = require("./run-receipt.cjs");
const scenario_js_1 = require("./scenario.cjs");
const Sha256Schema = zod_1.z.string().regex(/^[a-f0-9]{64}$/);
/** Typed initial state of a simulated world (never opaque JSON). */
exports.SimulationInitialStateSchema = zod_1.z.strictObject({
    agents: zod_1.z
        .array(zod_1.z.strictObject({ agentId: zod_1.z.string().min(1), role: zod_1.z.string().min(1) }))
        .min(1),
    jobs: zod_1.z.array(zod_1.z.strictObject({
        jobId: zod_1.z.string().min(1),
        agentId: zod_1.z.string().min(1),
        intervalSeconds: zod_1.z.number().int().min(1),
        destination: zod_1.z.string().min(1),
    })),
    caps: zod_1.z.array(run_receipt_js_1.ConsumptionCapSchema).max(10),
});
/**
 * An isolated simulated world pinned to a fixed scenario. `organizationId` is
 * explicit and is NOT assumed equal to `tenantId`.
 */
exports.SimulationWorldSchema = zod_1.z
    .strictObject({
    worldId: zod_1.z.string().min(1),
    schemaVersion: zod_1.z.literal(1),
    scenarioRef: scenario_js_1.ScenarioVersionRefSchema,
    tenantId: zod_1.z.string().min(1),
    organizationId: zod_1.z.string().min(1),
    ownerId: agent_identity_js_1.OwnerIdSchema.optional(),
    clock: zod_1.z.strictObject({ startAt: zod_1.z.iso.datetime() }),
    initialState: exports.SimulationInitialStateSchema,
    allowedDestinations: zod_1.z.array(zod_1.z.string().min(1)),
})
    .superRefine((world, ctx) => {
    world.initialState.jobs.forEach((job, index) => {
        if (!world.allowedDestinations.includes(job.destination)) {
            ctx.addIssue({
                code: 'custom',
                path: ['initialState', 'jobs', index, 'destination'],
                message: 'destination is not in allowedDestinations',
            });
        }
    });
});
const actionBase = {
    seq: zod_1.z.number().int().min(0),
    effectId: zod_1.z.string().min(1),
};
/** One step of the world; `seq` is the semantic order, `effectId` the effect identity. */
exports.SimulationActionSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.strictObject({
        ...actionBase,
        type: zod_1.z.literal('turn'),
        agentId: zod_1.z.string().min(1),
        input: zod_1.z.string().min(1),
        destination: zod_1.z.string().min(1).optional(),
    }),
    zod_1.z.strictObject({
        ...actionBase,
        type: zod_1.z.literal('job_occurrence'),
        jobId: zod_1.z.string().min(1),
        occurrenceAt: zod_1.z.iso.datetime(),
    }),
    zod_1.z.strictObject({ ...actionBase, type: zod_1.z.literal('stop'), runId: run_context_js_1.RunIdSchema }),
    zod_1.z.strictObject({
        ...actionBase,
        type: zod_1.z.literal('advance_clock'),
        seconds: zod_1.z.number().int().min(1),
    }),
    zod_1.z.strictObject({
        ...actionBase,
        type: zod_1.z.literal('inject_fault'),
        fault: zod_1.z.enum(['response_lost', 'timeout', 'provider_unknown', 'worker_crashed']),
        target: zod_1.z.string().min(1),
    }),
]);
/** A world plus its ordered actions: unique `seq`, destinations inside the world list. */
exports.SimulationScriptSchema = zod_1.z
    .strictObject({
    world: exports.SimulationWorldSchema,
    actions: zod_1.z.array(exports.SimulationActionSchema),
})
    .superRefine((script, ctx) => {
    const seen = new Set();
    script.actions.forEach((action, index) => {
        if (seen.has(action.seq)) {
            ctx.addIssue({
                code: 'custom',
                path: ['actions', index, 'seq'],
                message: 'seq must be unique within a script',
            });
        }
        seen.add(action.seq);
        if (action.type === 'turn' &&
            action.destination !== undefined &&
            !script.world.allowedDestinations.includes(action.destination)) {
            ctx.addIssue({
                code: 'custom',
                path: ['actions', index, 'destination'],
                message: 'destination is not in allowedDestinations',
            });
        }
    });
});
/** Correlated result of a simulation: every outcome is tied to its run and attempt. */
exports.SimulationResultSchema = zod_1.z.strictObject({
    worldId: zod_1.z.string().min(1),
    scenarioRef: scenario_js_1.ScenarioVersionRefSchema,
    runs: zod_1.z.array(zod_1.z.strictObject({
        runId: run_context_js_1.RunIdSchema,
        attemptId: zod_1.z.string().min(1),
        outcome: run_outcome_js_1.RunOutcomeSchema,
    })),
    receipts: zod_1.z.array(run_receipt_js_1.RunReceiptSchema),
    coverage: zod_1.z.strictObject({
        numerator: zod_1.z.number().int().min(0),
        denominator: zod_1.z.number().int().min(0),
        limits: zod_1.z.array(zod_1.z.string().min(1)),
    }),
    canonicalHash: Sha256Schema,
});
function canonicalize(value) {
    if (Array.isArray(value))
        return value.map(canonicalize);
    if (value !== null && typeof value === 'object') {
        const sorted = {};
        for (const key of Object.keys(value).sort()) {
            sorted[key] = canonicalize(value[key]);
        }
        return sorted;
    }
    return value;
}
/** SHA-256 (lowercase hex) of the world with object keys sorted; array order is kept. */
function canonicalWorldHash(world) {
    return (0, node_crypto_1.createHash)('sha256').update(JSON.stringify(canonicalize(world))).digest('hex');
}
//# sourceMappingURL=simulation-world.js.map