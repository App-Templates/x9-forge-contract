"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OWNER_ACTION_NOT_OWNER_REASON = exports.PAUSE_STOPS_LAPTOP_SESSION = void 0;
exports.deriveUnitActions = deriveUnitActions;
/** Set only after the laptop-session proof (5734, point 3). */
exports.PAUSE_STOPS_LAPTOP_SESSION = null;
exports.OWNER_ACTION_NOT_OWNER_REASON = "Le azioni le fa il proprietario dell'azienda";
/** Pure availability rules; pause wording remains owned by deriveUnitState.
 * `ora` is supplied with the other board derivations; availability has no time threshold.
 * The optional proof value allows all three laptop outcomes to be exercised before 5734.
 */
function deriveUnitActions(reparto, persona, _ora, { pauseStopsLaptopSession = exports.PAUSE_STOPS_LAPTOP_SESSION } = {}) {
    const paused = reparto.agent?.status === 'paused' || reparto.state === 'in_pausa';
    const budget = reparto.agent?.pauseReason === 'budget';
    const manual = paused && !budget && reparto.agent?.pauseReason !== 'system'
        && (reparto.agent?.pauseReason === 'manual' || reparto.agent?.pausedByOwner === true);
    const open = reparto.issues.some((issue) => issue.status !== 'done' && issue.status !== 'cancelled');
    const pausedReason = 'Il reparto è in pausa: riprendilo prima';
    const action = (reason) => ({
        available: reason === null, reason,
    });
    const identityReason = persona === 'mancante' ? 'La tua persona in Paperclip non è ancora collegata'
        : persona === 'non_nota' ? 'Non so se la tua persona in Paperclip è collegata' : null;
    const actions = {
        sveglia: action(identityReason ?? (paused ? pausedReason : !open ? 'Il reparto non ha un incarico aperto' : null)),
        via: action(identityReason ?? (reparto.state === 'attesa_del_via' ? null : 'Il reparto non aspetta il via')),
        ferma: action(identityReason ?? (paused ? pausedReason : null)),
        riprendi: action(identityReason ?? (paused && budget ? 'È fermo per il tetto di spesa: non si riprende da qui'
            : manual ? null : paused ? 'Il capo non è in pausa a mano' : 'Il reparto non è in pausa')),
    };
    const session = "C'è una sessione in corso sul tuo portatile";
    const pauseWarning = reparto.computerSession?.state !== 'adesso' ? null
        : pauseStopsLaptopSession === true ? `${session}: fermare il capo la interrompe`
            : pauseStopsLaptopSession === false ? `${session}: continua anche se fermi il capo; chiudila dal portatile`
                : session;
    return { actions, pauseWarning };
}
//# sourceMappingURL=company-board-unit-actions.js.map