"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNCERTAIN_OUTCOME_TOOLS = exports.UncertainOutcomeTableSchema = exports.UncertainOutcomeToolSchema = exports.UncertainOutcomeRoleSchema = exports.UNCERTAIN_OUTCOME_ROLES = void 0;
exports.uncertainOutcome = uncertainOutcome;
const zod_1 = require("zod");
// -- Uncertain outcome of a tool ------------------------------------------------------------------
// When the dispatch ceiling fires, the effect of a tool may already have happened (GOO-380: cap-dev kept
// opening the session after the router gave up at 120 s). The shape is shared by every service, so the table
// of tools, the read that tells whether the effect landed (one per role) and the sentence with the move live
// here, not in the router (R-14).
exports.UNCERTAIN_OUTCOME_ROLES = ['chief', 'director'];
exports.UncertainOutcomeRoleSchema = zod_1.z.enum(exports.UNCERTAIN_OUTCOME_ROLES);
const ToolNameSchema = zod_1.z.string().min(1).max(64).regex(/^[a-z][a-z0-9_]*$/);
exports.UncertainOutcomeToolSchema = zod_1.z.strictObject({
    tool: ToolNameSchema,
    /** The read that tells whether the effect landed, per role. */
    checks: zod_1.z.strictObject({ chief: ToolNameSchema, director: ToolNameSchema }),
    /** What may already have happened, in one clause. */
    effect: zod_1.z.string().min(1).max(120),
    /** True if the same call repeated without changes does not duplicate the effect. */
    repeatSafe: zod_1.z.boolean(),
    /** What to do when the check finds nothing: required if and only if repeatSafe. */
    ifMissing: zod_1.z.string().min(1).max(160).optional(),
}).superRefine((entry, ctx) => {
    if (entry.repeatSafe !== (entry.ifMissing !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['ifMissing'], message: 'ifMissing is required if and only if repeatSafe' });
    }
    for (const role of exports.UNCERTAIN_OUTCOME_ROLES) {
        if (entry.checks[role] === entry.tool) {
            ctx.addIssue({ code: 'custom', path: ['checks', role], message: 'A tool cannot be its own check' });
        }
    }
});
exports.UncertainOutcomeTableSchema = zod_1.z.array(exports.UncertainOutcomeToolSchema).superRefine((table, ctx) => {
    if (new Set(table.map((entry) => entry.tool)).size !== table.length) {
        ctx.addIssue({ code: 'custom', message: 'Each tool may appear only once' });
    }
});
/** Tools whose answer can be lost while the effect lands. dev_session_open: cap-dev `findRepeated` makes a repeat safe. */
exports.UNCERTAIN_OUTCOME_TOOLS = exports.UncertainOutcomeTableSchema.parse([
    {
        tool: 'dev_session_open',
        checks: { chief: 'dev_session_status', director: 'dev_project_sessions' },
        effect: 'l\'incarico può essere nato lo stesso',
        repeatSafe: true,
        ifMissing: 'ripeti la stessa richiesta senza cambiarla: con gli stessi contenuti non ne nasce un secondo',
    },
]);
/**
 * The reason the model reads (and the disposition, when repeating is safe) after a dispatch ceiling.
 * Without an entry only a generic read-first hint is given and there is no disposition. Without a role both checks are named.
 */
function uncertainOutcome(tool, options) {
    const waited = zod_1.z.number().int().min(1).max(3600).parse(options.waitedSeconds);
    const entry = (options.table ?? exports.UNCERTAIN_OUTCOME_TOOLS).find((candidate) => candidate.tool === tool);
    const head = `esito_incerto: ${tool} non ha risposto entro ${waited} s e il suo effetto può essere già avvenuto`;
    if (entry === undefined) {
        return { reason: `${head}: prima di ripetere controlla con una lettura se è avvenuto`, disposition: undefined };
    }
    const both = entry.checks.chief === entry.checks.director
        ? entry.checks.chief
        : `${entry.checks.chief} (il Director con ${entry.checks.director})`;
    const check = options.role === undefined ? both : entry.checks[options.role];
    if (!entry.repeatSafe) {
        return {
            reason: `${head}: ${entry.effect}: controlla con ${check} e non ripetere la richiesta prima di averlo verificato`,
            disposition: { nature: 'technical_failure', retry: 'never', nextMove: 'stop' },
        };
    }
    return {
        reason: `${head}: ${entry.effect}: controlla con ${check} e, se non c'è, ${entry.ifMissing}`,
        disposition: { nature: 'technical_failure', retry: 'after_delay', retryAfterSeconds: 60, nextMove: 'retry_same' },
    };
}
//# sourceMappingURL=uncertain-outcome.js.map