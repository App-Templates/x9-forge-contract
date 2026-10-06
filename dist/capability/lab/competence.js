import { z } from 'zod';
import { CapabilityAgentIdSchema } from "../ricerca/agent-config.js";
/**
 * The competence graph cap-lab compiles from the wiki (v1.28.0, Phase 54), and the gaps it hands back to research.
 * The level is derived from an append-only ledger, never stored (the Parallel contest engine, as in Enterprise
 * Adoption); the views below are what the control panel and the agent read.
 */
/** Same scale as the contest engine (`MAX_COMPETENCE_LEVEL`): 0 = unknown … 4 = mastery. */
export const COMPETENCE_MAX_LEVEL = 4;
export const CompetenceNodeIdSchema = z.string().min(1).max(120);
export const CompetenceNodeViewSchema = z.object({
    nodeId: CompetenceNodeIdSchema,
    label: z.string().trim().min(1).max(200),
    parentId: CompetenceNodeIdSchema.optional(),
    requires: z.array(CompetenceNodeIdSchema).max(30),
    level: z.number().int().min(0).max(COMPETENCE_MAX_LEVEL),
    /** The continuous score behind the level (≥ 0). */
    score: z.number().nonnegative().finite(),
}).strict();
export const CompetenceGapReasonSchema = z.enum(['non_so', 'fonte_unica', 'contraddizione', 'prerequisito_mancante']);
export const CompetenceGapSchema = z.object({
    agentId: CapabilityAgentIdSchema,
    /** The question research should answer next. */
    question: z.string().trim().min(1).max(2000),
    nodeId: CompetenceNodeIdSchema.optional(),
    reason: CompetenceGapReasonSchema,
}).strict();
//# sourceMappingURL=competence.js.map