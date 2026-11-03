"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabGrowthHistoryOutputSchema = exports.LabGrowthHistoryInputSchema = exports.LabGrowthPointSchema = exports.LabScopeSchema = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const competence_js_1 = require("./competence.cjs");
/**
 * Growth history complements src/http/endpoints/internal-capability-agent.ts:102,
 * whose growth snapshot carries only agentId. Scores reuse the competence view
 * in src/capability/lab/competence.ts:15 (score at line 22).
 * Callers must verify scope against trusted identity before accessing storage;
 * the same agentId under another tenant or owner identifies a different notebook.
 */
exports.LabScopeSchema = zod_1.z.object({
    tenantId: capability_call_identity_js_1.CapabilityCallIdentitySchema.shape.tenantId.refine(value => value.trim().length > 0),
    ownerId: capability_call_identity_js_1.CapabilityCallIdentitySchema.shape.ownerId.refine(value => value.trim().length > 0),
    agentId: agent_config_js_1.CapabilityAgentIdSchema,
}).strict();
exports.LabGrowthPointSchema = zod_1.z.object({
    at: zod_1.z.iso.datetime({ offset: true }),
    method: zod_1.z.string().trim().min(1),
    methodVersion: zod_1.z.string().trim().min(1),
    numerator: zod_1.z.number().int().nonnegative(),
    denominator: zod_1.z.number().int().nonnegative(),
    score: competence_js_1.CompetenceNodeViewSchema.shape.score.nullable(),
}).strict();
const CursorSchema = zod_1.z.string().min(1);
exports.LabGrowthHistoryInputSchema = zod_1.z.object({
    scope: exports.LabScopeSchema,
    limit: zod_1.z.number().int().min(1).max(500).default(100),
    cursor: CursorSchema.optional(),
}).strict();
exports.LabGrowthHistoryOutputSchema = zod_1.z.object({
    snapshotVersion: zod_1.z.number().int().nonnegative(),
    scope: exports.LabScopeSchema,
    points: zod_1.z.array(exports.LabGrowthPointSchema).max(500),
    /** Null means there is no subsequent page. */
    nextCursor: CursorSchema.nullable(),
    /** Empty notebook and unavailable measurement are distinct results. */
    state: zod_1.z.enum(['empty', 'unavailable', 'ok']),
}).strict();
//# sourceMappingURL=growth.js.map