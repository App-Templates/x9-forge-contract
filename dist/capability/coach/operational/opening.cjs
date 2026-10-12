"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachOpeningResultSchema = exports.CoachOpeningRequestSchema = exports.CoachReservationSchema = exports.CoachOperationalBudgetStateSchema = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../../capability-call-context.cjs");
const agent_config_js_1 = require("../../ricerca/agent-config.cjs");
const rolling_budget_js_1 = require("../rolling-budget.cjs");
const program_version_js_1 = require("../program-version.cjs");
const execution_js_1 = require("../execution.cjs");
const shared_js_1 = require("../shared.cjs");
const common_js_1 = require("./common.cjs");
exports.CoachOperationalBudgetStateSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.object({ status: zod_1.z.literal('known'), budget: rolling_budget_js_1.CoachRollingBudgetSchema, quota: rolling_budget_js_1.CoachSessionQuotaSchema }).strict()
        .refine(x => (0, capability_call_context_js_1.sameCapabilityScope)(x.budget.scope, x.quota.scope) && Date.parse(x.budget.asOf) === Date.parse(x.quota.budgetAsOf) && (0, rolling_budget_js_1.coachRollingRemainingSeconds)(x.budget) === x.quota.remainingSeconds, 'Budget and quota are one scoped observation'),
    zod_1.z.object({ status: zod_1.z.literal('unknown'), reason: zod_1.z.enum(['usage_pending', 'source_unavailable', 'authority_unavailable']) }).strict(),
]);
exports.CoachReservationSchema = zod_1.z.object({
    reservationId: shared_js_1.RefId, openingId: shared_js_1.RefId, scope: capability_call_context_js_1.CapabilityPersonScopeSchema, version: agent_config_js_1.AgentConfigVersionSchema,
    status: zod_1.z.enum(['held', 'consumed', 'released', 'uncertain']), limitSeconds: zod_1.z.number().int().nonnegative(),
    createdAt: shared_js_1.Instant, updatedAt: shared_js_1.Instant, expiresAt: shared_js_1.Instant.nullable(),
}).strict().refine(x => (x.status !== 'held' || x.limitSeconds > 0) && Date.parse(x.updatedAt) >= Date.parse(x.createdAt)
    && (x.expiresAt === null || Date.parse(x.expiresAt) > Date.parse(x.createdAt)), 'Ordered nonempty reservation');
exports.CoachOpeningRequestSchema = zod_1.z.object({
    requestId: shared_js_1.RefId, scope: capability_call_context_js_1.CapabilityPersonScopeSchema, program: program_version_js_1.CoachProgramVersionRefSchema, appliedConfigVersion: agent_config_js_1.AgentConfigVersionSchema,
}).strict().refine(x => (0, capability_call_context_js_1.sameCapabilityScope)((0, shared_js_1.agentScope)(x.scope), x.program.scope), 'Program belongs to opening agent');
exports.CoachOpeningResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true), replayed: zod_1.z.boolean(), opening: execution_js_1.CoachSessionOpeningRefSchema, revision: common_js_1.RevisionNumber,
    budget: exports.CoachOperationalBudgetStateSchema, reservation: exports.CoachReservationSchema,
}).strict().refine(x => x.budget.status === 'known' && x.reservation.status === 'held'
    && (0, capability_call_context_js_1.sameCapabilityScope)(x.opening.scope, x.budget.budget.scope) && (0, capability_call_context_js_1.sameCapabilityScope)(x.opening.scope, x.reservation.scope)
    && x.opening.openingId === x.reservation.openingId && x.reservation.limitSeconds <= x.budget.quota.limitSeconds, 'Admission needs known scoped reserved quota');
//# sourceMappingURL=opening.js.map