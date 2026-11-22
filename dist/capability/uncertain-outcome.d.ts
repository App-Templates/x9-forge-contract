import { z } from 'zod';
import { type ToolErrorDisposition } from "./tool-error-disposition.js";
export declare const UNCERTAIN_OUTCOME_ROLES: readonly ["chief", "director"];
export declare const UncertainOutcomeRoleSchema: z.ZodEnum<{
    director: "director";
    chief: "chief";
}>;
export type UncertainOutcomeRole = z.infer<typeof UncertainOutcomeRoleSchema>;
export declare const UncertainOutcomeToolSchema: z.ZodObject<{
    tool: z.ZodString;
    /** The read that tells whether the effect landed, per role. */
    checks: z.ZodObject<{
        chief: z.ZodString;
        director: z.ZodString;
    }, z.core.$strict>;
    /** What may already have happened, in one clause. */
    effect: z.ZodString;
    /** True if the same call repeated without changes does not duplicate the effect. */
    repeatSafe: z.ZodBoolean;
    /** What to do when the check finds nothing: required if and only if repeatSafe. */
    ifMissing: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type UncertainOutcomeTool = z.infer<typeof UncertainOutcomeToolSchema>;
export declare const UncertainOutcomeTableSchema: z.ZodArray<z.ZodObject<{
    tool: z.ZodString;
    /** The read that tells whether the effect landed, per role. */
    checks: z.ZodObject<{
        chief: z.ZodString;
        director: z.ZodString;
    }, z.core.$strict>;
    /** What may already have happened, in one clause. */
    effect: z.ZodString;
    /** True if the same call repeated without changes does not duplicate the effect. */
    repeatSafe: z.ZodBoolean;
    /** What to do when the check finds nothing: required if and only if repeatSafe. */
    ifMissing: z.ZodOptional<z.ZodString>;
}, z.core.$strict>>;
/** Tools whose answer can be lost while the effect lands. dev_session_open: cap-dev `findRepeated` makes a repeat safe. */
export declare const UNCERTAIN_OUTCOME_TOOLS: readonly UncertainOutcomeTool[];
/**
 * The reason the model reads (and the disposition, when repeating is safe) after a dispatch ceiling.
 * Without an entry only a generic read-first hint is given and there is no disposition. Without a role both checks are named.
 */
export declare function uncertainOutcome(tool: string, options: {
    waitedSeconds: number;
    role?: UncertainOutcomeRole;
    table?: readonly UncertainOutcomeTool[];
}): {
    reason: string;
    disposition: ToolErrorDisposition | undefined;
};
//# sourceMappingURL=uncertain-outcome.d.ts.map