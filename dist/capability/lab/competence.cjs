"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetenceGapSchema = exports.CompetenceGapReasonSchema = exports.CompetenceNodeViewSchema = exports.CompetenceNodeIdSchema = exports.COMPETENCE_MAX_LEVEL = void 0;
const zod_1 = require("zod");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
/**
 * The competence graph cap-lab compiles from the wiki (v1.28.0, Phase 54), and the gaps it hands back to research.
 * The level is derived from an append-only ledger, never stored (the Parallel contest engine, as in Enterprise
 * Adoption); the views below are what the control panel and the agent read.
 */
/** Same scale as the contest engine (`MAX_COMPETENCE_LEVEL`): 0 = unknown … 4 = mastery. */
exports.COMPETENCE_MAX_LEVEL = 4;
exports.CompetenceNodeIdSchema = zod_1.z.string().min(1).max(120);
exports.CompetenceNodeViewSchema = zod_1.z.object({
    nodeId: exports.CompetenceNodeIdSchema,
    label: zod_1.z.string().trim().min(1).max(200),
    parentId: exports.CompetenceNodeIdSchema.optional(),
    requires: zod_1.z.array(exports.CompetenceNodeIdSchema).max(30),
    level: zod_1.z.number().int().min(0).max(exports.COMPETENCE_MAX_LEVEL),
    /** The continuous score behind the level (≥ 0). */
    score: zod_1.z.number().nonnegative().finite(),
}).strict();
exports.CompetenceGapReasonSchema = zod_1.z.enum(['non_so', 'fonte_unica', 'contraddizione', 'prerequisito_mancante']);
exports.CompetenceGapSchema = zod_1.z.object({
    agentId: agent_config_js_1.CapabilityAgentIdSchema,
    /** The question research should answer next. */
    question: zod_1.z.string().trim().min(1).max(2000),
    nodeId: exports.CompetenceNodeIdSchema.optional(),
    reason: exports.CompetenceGapReasonSchema,
}).strict();
//# sourceMappingURL=competence.js.map