"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolErrorDispositionSchema = exports.ToolErrorNextMoveSchema = exports.ToolErrorRetrySchema = exports.ToolErrorNatureSchema = exports.TOOL_ERROR_NEXT_MOVES = exports.TOOL_ERROR_RETRIES = exports.TOOL_ERROR_NATURES = void 0;
exports.renderToolErrorDisposition = renderToolErrorDisposition;
exports.toolErrorDispositionOf = toolErrorDispositionOf;
const zod_1 = require("zod");
// -- Fixed disposition of a tool error ---------------------------------------
// Words are not a contract: the tool says what happened, whether the same call may be
// repeated and what to do next; the runtime renders one fixed sentence per value.
exports.TOOL_ERROR_NATURES = ['technical_failure', 'permission_refused', 'limit_reached', 'cancelled', 'missing_data', 'invalid_request'];
exports.TOOL_ERROR_RETRIES = ['never', 'next_turn', 'after_delay'];
exports.TOOL_ERROR_NEXT_MOVES = ['retry_same', 'fix_input', 'ask_director', 'ask_referent', 'ask_owner', 'wait_event', 'stop'];
exports.ToolErrorNatureSchema = zod_1.z.enum(exports.TOOL_ERROR_NATURES);
exports.ToolErrorRetrySchema = zod_1.z.enum(exports.TOOL_ERROR_RETRIES);
exports.ToolErrorNextMoveSchema = zod_1.z.enum(exports.TOOL_ERROR_NEXT_MOVES);
exports.ToolErrorDispositionSchema = zod_1.z.strictObject({
    nature: exports.ToolErrorNatureSchema,
    retry: exports.ToolErrorRetrySchema,
    retryAfterSeconds: zod_1.z.number().int().min(1).max(604800).optional(),
    nextMove: exports.ToolErrorNextMoveSchema,
}).superRefine((disposition, ctx) => {
    if ((disposition.retry === 'after_delay') !== (disposition.retryAfterSeconds !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['retryAfterSeconds'], message: 'retryAfterSeconds is required if and only if retry is after_delay' });
    }
    if ((disposition.retry === 'never') !== (disposition.nextMove !== 'retry_same')) {
        ctx.addIssue({ code: 'custom', path: ['retry'], message: 'retry is never if and only if the next move is not retry_same' });
    }
    if (disposition.nature === 'permission_refused' && disposition.retry !== 'never') {
        ctx.addIssue({ code: 'custom', path: ['retry'], message: 'A refused permission is never retried' });
    }
});
const TOOL_ERROR_NATURE_SENTENCES = {
    technical_failure: 'Guasto tecnico: non è un annullamento né un rifiuto.',
    permission_refused: 'Rifiuto di permesso: qui questo strumento non ti è consentito.',
    limit_reached: 'Limite raggiunto.',
    cancelled: 'Annullato da chi ne ha l\'autorità: non è un guasto.',
    missing_data: 'Manca un dato necessario.',
    invalid_request: 'Richiesta non valida così com\'è scritta.',
};
const TOOL_ERROR_NEXT_MOVE_SENTENCES = {
    retry_same: 'Ripetila senza cambiare nulla.',
    fix_input: 'Correggi i dati e richiama.',
    ask_director: 'Passa la questione al Director.',
    ask_referent: 'Chiedi al referente.',
    ask_owner: 'Chiedi al proprietario.',
    wait_event: 'Aspetta l\'evento che sblocca: sarai svegliato.',
    stop: 'Fermati qui e lascia scritto l\'esito.',
};
const TOOL_ERROR_RETRY_SENTENCES = {
    never: () => 'Non ripetere la stessa chiamata.',
    next_turn: () => 'Puoi ripetere la stessa chiamata al prossimo turno.',
    after_delay: (seconds) => `Puoi ripetere la stessa chiamata fra ${seconds} secondi.`,
};
/** One fixed line (nature, repeatability, next move) for a valid disposition; throws on an invalid one. */
function renderToolErrorDisposition(disposition) {
    const valid = exports.ToolErrorDispositionSchema.parse(disposition);
    return [
        TOOL_ERROR_NATURE_SENTENCES[valid.nature],
        TOOL_ERROR_RETRY_SENTENCES[valid.retry](valid.retryAfterSeconds),
        TOOL_ERROR_NEXT_MOVE_SENTENCES[valid.nextMove],
    ].join(' ');
}
function toolErrorDispositionOf(body) {
    try {
        if (typeof body !== 'object' || body === null
            || !('status' in body) || body.status !== 'error'
            || !('disposition' in body))
            return undefined;
        const parsed = exports.ToolErrorDispositionSchema.safeParse(body.disposition);
        return parsed.success ? parsed.data : undefined;
    }
    catch {
        // Untrusted objects may throw when their properties are read.
        return undefined;
    }
}
//# sourceMappingURL=tool-error-disposition.js.map