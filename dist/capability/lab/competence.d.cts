import { z } from 'zod';
/**
 * The competence graph cap-lab compiles from the wiki (v1.28.0, Phase 54), and the gaps it hands back to research.
 * The level is derived from an append-only ledger, never stored (the Parallel contest engine, as in Enterprise
 * Adoption); the views below are what the control panel and the agent read.
 */
/** Same scale as the contest engine (`MAX_COMPETENCE_LEVEL`): 0 = unknown … 4 = mastery. */
export declare const COMPETENCE_MAX_LEVEL = 4;
export declare const CompetenceNodeIdSchema: z.ZodString;
export declare const CompetenceNodeViewSchema: z.ZodObject<{
    nodeId: z.ZodString;
    label: z.ZodString;
    parentId: z.ZodOptional<z.ZodString>;
    requires: z.ZodArray<z.ZodString>;
    level: z.ZodNumber;
    score: z.ZodNumber;
}, z.core.$strict>;
export type CompetenceNodeView = z.infer<typeof CompetenceNodeViewSchema>;
export declare const CompetenceGapReasonSchema: z.ZodEnum<{
    non_so: "non_so";
    fonte_unica: "fonte_unica";
    contraddizione: "contraddizione";
    prerequisito_mancante: "prerequisito_mancante";
}>;
export type CompetenceGapReason = z.infer<typeof CompetenceGapReasonSchema>;
export declare const CompetenceGapSchema: z.ZodObject<{
    agentId: z.ZodString;
    question: z.ZodString;
    nodeId: z.ZodOptional<z.ZodString>;
    reason: z.ZodEnum<{
        non_so: "non_so";
        fonte_unica: "fonte_unica";
        contraddizione: "contraddizione";
        prerequisito_mancante: "prerequisito_mancante";
    }>;
}, z.core.$strict>;
export type CompetenceGap = z.infer<typeof CompetenceGapSchema>;
//# sourceMappingURL=competence.d.ts.map