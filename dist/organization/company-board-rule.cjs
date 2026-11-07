"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPANY_BOARD_ERROR_CODE_WORDS = exports.COMPANY_BOARD_DEFAULT_TIME_ZONE = exports.COMPANY_BOARD_DEFAULT_THRESHOLDS = void 0;
exports.deriveUnitState = deriveUnitState;
exports.COMPANY_BOARD_DEFAULT_THRESHOLDS = {
    lavoroMs: 4 * 60 * 60 * 1000,
    attesaMs: 24 * 60 * 60 * 1000,
    ripartenzaMs: 30 * 60 * 1000,
};
exports.COMPANY_BOARD_DEFAULT_TIME_ZONE = 'Europe/Rome';
/** Technical error codes in words; the code itself is never shown. */
exports.COMPANY_BOARD_ERROR_CODE_WORDS = {
    provider_quota: 'Il modello ha finito il credito',
    process_lost: 'Il processo si è interrotto',
};
const GENERIC_ERROR_WORDS = 'Errore tecnico (codice registrato)';
const FAILED_RUNS = new Set(['failed', 'error', 'timed_out']);
const LATE_STATES = new Set([
    'attesa_del_via', 'approvato_non_ripartito', 'aspetta_proprietario', 'aspetta_referente',
    'aspetta_director', 'aspetta_reparto', 'non_partito',
]);
const ms = (iso) => {
    if (iso === null || iso === undefined)
        return null;
    const value = Date.parse(iso);
    return Number.isNaN(value) ? null : value;
};
const isoOf = (iso) => {
    const value = ms(iso);
    return value === null ? null : new Date(value).toISOString();
};
const after = (iso, than) => {
    const value = ms(iso);
    return value !== null && value > than;
};
const latest = (items, at) => {
    let best = null;
    let bestMs = Number.NEGATIVE_INFINITY;
    for (const item of items) {
        const value = ms(at(item));
        if (value !== null && value >= bestMs) {
            best = item;
            bestMs = value;
        }
    }
    return best;
};
const isOpen = (blocker) => blocker.status !== 'done' && blocker.status !== 'cancelled';
const cut = (text, max) => (text.length <= max ? text : `${text.slice(0, max - 1)}…`);
function makeClock(timeZone, nowMs) {
    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
    const parts = (value) => {
        const map = {};
        for (const part of formatter.formatToParts(new Date(value)))
            map[part.type] = part.value;
        return {
            day: `${Number(map.day)}/${Number(map.month)}`,
            key: `${map.year}-${map.month}-${map.day}`,
            time: `${Number(map.hour) % 24}:${map.minute}`,
        };
    };
    const today = parts(nowMs).key;
    /** `alle 16:57` on the same day, `il 6/11 alle 16:57` otherwise. */
    const alle = (iso) => {
        const value = ms(iso);
        if (value === null)
            return '';
        const p = parts(value);
        return p.key === today ? `alle ${p.time}` : `il ${p.day} alle ${p.time}`;
    };
    /** `dalle 9:49` on the same day, `dal 3/11` otherwise. */
    const dal = (iso) => {
        const value = ms(iso);
        if (value === null)
            return '';
        const p = parts(value);
        return p.key === today ? `dalle ${p.time}` : `dal ${p.day}`;
    };
    const il = (iso) => {
        const value = ms(iso);
        return value === null ? '' : `il ${parts(value).day}`;
    };
    return { alle, dal, il };
}
function duration(valueMs) {
    const hours = valueMs / 3_600_000;
    if (hours >= 1 && Number.isInteger(hours))
        return hours === 1 ? '1 ora' : `${hours} ore`;
    const minutes = Math.max(1, Math.round(valueMs / 60_000));
    return minutes === 1 ? '1 minuto' : `${minutes} minuti`;
}
const errorWords = (code) => code !== null && code !== undefined && Object.hasOwn(exports.COMPANY_BOARD_ERROR_CODE_WORDS, code)
    ? exports.COMPANY_BOARD_ERROR_CODE_WORDS[code]
    : GENERIC_ERROR_WORDS;
/**
 * State of one unit, first matching rule wins (see 5701 for the order). `waitingFor` collects every
 * true wait, not only the one that decides the state.
 */
function deriveUnitState(input, now, soglie = exports.COMPANY_BOARD_DEFAULT_THRESHOLDS, timeZone = exports.COMPANY_BOARD_DEFAULT_TIME_ZONE) {
    const nowMs = now.getTime();
    const restartMs = soglie.ripartenzaMs ?? exports.COMPANY_BOARD_DEFAULT_THRESHOLDS.ripartenzaMs;
    const { alle, dal, il } = makeClock(timeZone, nowMs);
    const issues = input.issues.filter((issue) => issue.status !== 'cancelled');
    const mandate = latest(issues.filter((issue) => issue.isMandate), (issue) => issue.updatedAt);
    const ref = mandate ?? latest(issues, (issue) => issue.updatedAt) ?? issues[0] ?? null;
    const working = issues.filter((issue) => issue.status === 'in_progress');
    const workingSessions = input.sessions.filter((session) => session.state === 'in-lavorazione');
    const referentName = input.referent?.name ?? 'Il referente';
    const people = (person) => (person === null ? [] : [person]);
    const wait = (w) => ({
        who: w.who ?? [],
        buSlugs: w.buSlugs ?? [input.buSlug],
        partIndex: w.partIndex ?? null,
        action: w.action ?? null,
        unblockHint: w.unblockHint ?? null,
        openIn: w.openIn ?? null,
        kind: w.kind,
        what: cut(w.what, 500),
        since: isoOf(w.since),
    });
    /** New work after `at`: an issue created or started, a session, work in progress touched, a new decision. */
    const activityAfter = (at) => {
        const t = ms(at);
        if (t === null)
            return false;
        return issues.some((issue) => after(issue.createdAt, t) || after(issue.startedAt, t) || (issue.status === 'in_progress' && after(issue.updatedAt, t)))
            || input.sessions.some((session) => after(session.at, t))
            || input.decisions.some((decision) => after(decision.createdAt, t));
    };
    const finish = (state, stateLabel, why, since, waitingFor, alertAttempts = null) => {
        const sinceIso = isoOf(since);
        const sinceMs = ms(sinceIso);
        const late = LATE_STATES.has(state) && sinceMs !== null && nowMs - sinceMs > soglie.attesaMs;
        const whyText = cut(why, 200);
        let alert = null;
        if (alertAttempts !== null) {
            alert = { kind: 'errore', text: cut(whyText, 500), attempts: alertAttempts.slice(-20).map((a) => ({ at: isoOf(a.at), text: a.text })) };
        }
        else if (late) {
            const what = state === 'non_partito' ? 'In coda' : 'In attesa';
            alert = { kind: 'ritardo', text: `${what} da più di ${duration(soglie.attesaMs)}`, attempts: [] };
        }
        return { state, stateLabel: cut(stateLabel, 100), since: sinceIso, why: whyText, late, waitingFor, alert };
    };
    // 1. A necessary source did not answer.
    const missing = new Set(input.missingSources);
    const necessary = [['incarichi', 'gli incarichi'], ['decisioni', 'le decisioni']];
    const absent = necessary.filter(([source]) => missing.has(source)).map(([, words]) => words);
    if (absent.length === 0 && issues.length === 0 && missing.has('sessioni'))
        absent.push('le sessioni');
    if (absent.length > 0) {
        const list = absent.length === 1 ? absent[0] : `${absent.slice(0, -1).join(', ')} e ${absent.at(-1)}`;
        return finish('non_noto', 'Stato non noto', `${list.charAt(0).toUpperCase()}${list.slice(1)} del reparto non hanno risposto: lo stato non si può dire.`, null, []);
    }
    // Facts (all collected before the order decides which one names the state).
    const waits = [];
    const agent = input.agent;
    const runs = [...(agent?.runs ?? [])].filter((run) => ms(run.at) !== null).sort((a, b) => ms(a.at) - ms(b.at));
    const lastRun = runs.at(-1) ?? null;
    const failedRun = lastRun !== null && FAILED_RUNS.has(lastRun.status) ? lastRun : null;
    const agentError = agent?.status === 'error' || failedRun !== null;
    const agentFailure = failedRun ?? latest(runs.filter((run) => FAILED_RUNS.has(run.status)), (run) => run.at);
    const agentErrorWhy = errorWords(agentFailure?.errorCode);
    const sessions = [...input.sessions].filter((session) => ms(session.at) !== null).sort((a, b) => ms(a.at) - ms(b.at));
    const verdicts = sessions.filter((session) => ['scartato', 'chiuso', 'revisione'].includes(session.state));
    const rejected = [];
    for (let i = verdicts.length - 1; i >= 0 && verdicts[i].state === 'scartato'; i -= 1)
        rejected.unshift(verdicts[i]);
    const deliveryFails = rejected.length >= 2;
    const deliveryFailsWhy = deliveryFails
        ? `La consegna non passa i controlli: ${rejected.length} tentativi, l'ultimo ${alle(rejected.at(-1).at)}`
        : '';
    const openDecisions = input.decisions.filter((decision) => decision.decidedAt === null);
    let unreadReply = null;
    for (const decision of openDecisions) {
        if (decision.addressedTo !== 'referent')
            continue;
        const createdMs = ms(decision.createdAt);
        if (createdMs === null)
            continue;
        for (const issue of issues) {
            const reply = latest(issue.comments.filter((c) => c.fromReply && after(c.at, createdMs)), (c) => c.at);
            if (reply !== null && (unreadReply === null || ms(reply.at) > ms(unreadReply.at))) {
                unreadReply = { at: reply.at, issue: issue.identifier, decision };
            }
        }
    }
    const unreadReplyWhy = unreadReply === null
        ? ''
        : `${referentName} ha risposto ${il(unreadReply.at)}, la risposta non è stata letta`;
    if (agentError)
        waits.push(wait({ kind: 'guasto', what: agentErrorWhy, since: agentFailure?.at ?? null }));
    if (deliveryFails)
        waits.push(wait({ kind: 'guasto', what: deliveryFailsWhy, since: rejected.at(-1).at }));
    if (unreadReply !== null) {
        waits.push(wait({ kind: 'guasto', what: unreadReplyWhy, since: unreadReply.at, openIn: { issueIdentifier: unreadReply.issue } }));
    }
    // 3. Paused lead.
    const paused = agent?.status === 'paused';
    let pausedWhy = '';
    if (paused && agent !== null) {
        const when = alle(agent.pausedAt);
        const at = when === '' ? '' : ` ${when}`;
        if (agent.pauseReason === 'budget')
            pausedWhy = 'Ha raggiunto il tetto di spesa';
        else if (agent.pausedByOwner === true)
            pausedWhy = `L'hai fermato tu${at}. Non lavora, in nessun progetto, finché non lo riprendi.`;
        else if (agent.pauseReason === 'system')
            pausedWhy = `Fermato dal sistema${at}`;
        else
            pausedWhy = `Fermato a mano${at}`;
        waits.push(wait({
            kind: agent.pausedByOwner === true ? 'proprietario' : 'guasto',
            who: agent.pausedByOwner === true ? people(input.owner) : [],
            what: pausedWhy,
            since: agent.pausedAt,
        }));
    }
    // 4. Approval waiting for the go (Director's issue with the mark).
    const openBlockers = (ref?.status === 'blocked' ? ref.blockedBy : []).filter(isOpen);
    const waitingForGo = openBlockers.find((b) => b.assignee.kind === 'director' && b.approvalMark) ?? null;
    const refSince = ref?.blockedSince ?? ref?.updatedAt ?? null;
    const decisionDates = input.decisions.map((d) => d.decidedAt ?? d.createdAt);
    const decisionSince = latest(decisionDates, (d) => d);
    if (waitingForGo !== null) {
        waits.push(wait({
            kind: 'proprietario', who: people(input.owner), what: "Aspetta il tuo via dopo l'approvazione",
            since: ref?.blockedSince ?? decisionSince ?? ref?.updatedAt ?? null, action: 'dai_il_via',
            openIn: { issueIdentifier: waitingForGo.identifier },
        }));
    }
    // 5. Approved, nothing restarted, and parts still to do.
    const parts = [...input.parts].sort((a, b) => a.index - b.index);
    const nextPart = parts.find((part) => part.state === 'da_fare') ?? null;
    const hasPartsToDo = parts.length > 0 ? nextPart !== null : ref !== null && ref.status !== 'done';
    const nextBlockers = (nextPart?.blockedBy ?? []).filter(isOpen);
    const nextBehindOtherUnit = nextBlockers.find((b) => b.assignee.kind === 'reparto') ?? null;
    const approvedDecision = latest(input.decisions.filter((d) => d.decidedAt !== null && d.outcome === 'approved'), (d) => d.decidedAt);
    const approvedMs = ms(approvedDecision?.decidedAt);
    const approvedIdle = approvedDecision !== null && approvedMs !== null && nowMs - approvedMs > restartMs
        && !activityAfter(approvedDecision.decidedAt) && ref?.status !== 'done' && hasPartsToDo && !paused;
    const approvedNotRestarted = approvedIdle && nextBlockers.length === 0;
    const approvedWhy = approvedNotRestarted ? `Approvato ${alle(approvedDecision.decidedAt)}, non è ripartito` : '';
    if (approvedNotRestarted) {
        waits.push(wait({ kind: 'guasto', what: approvedWhy, since: approvedDecision.decidedAt, partIndex: nextPart?.index ?? null }));
    }
    // 6. Open decisions.
    let ownerDecision = null;
    let referentDecision = null;
    for (const decision of openDecisions) {
        if (decision.addressedTo === 'owner') {
            ownerDecision = latest([ownerDecision, decision].filter((d) => d !== null), (d) => d.createdAt);
            waits.push(wait({ kind: 'proprietario', who: people(input.owner), what: 'Aspetta una tua risposta', since: decision.createdAt, action: 'rispondi' }));
        }
        else if (decision === unreadReply?.decision) {
            referentDecision = referentDecision ?? decision;
        }
        else {
            referentDecision = latest([referentDecision, decision].filter((d) => d !== null), (d) => d.createdAt);
            if (input.referentPresent) {
                waits.push(wait({ kind: 'referente', who: people(input.referent), what: `Aspetta una risposta di ${input.referent?.name ?? 'il referente'}`, since: decision.createdAt }));
            }
            else {
                waits.push(wait({ kind: 'proprietario', who: people(input.owner), what: `Indica chi segue ${input.unitName}`, since: decision.createdAt }));
            }
        }
    }
    // 7. Waiting for the Director.
    const directorIssue = openBlockers.find((b) => b.assignee.kind === 'director' && !b.approvalMark) ?? null;
    const delivery = latest(sessions.filter((s) => s.state === 'revisione' || s.state === 'chiuso'), (s) => s.at);
    const referentDecisionOpen = openDecisions.some((d) => d.addressedTo === 'referent');
    const deliveryMs = ms(delivery?.at);
    const deliveryIdle = delivery !== null && deliveryMs !== null && nowMs - deliveryMs > restartMs
        && !activityAfter(delivery.at) && ref?.status !== 'done' && !referentDecisionOpen;
    const inReview = ref?.status === 'in_review';
    const waitsForDirector = inReview || directorIssue !== null || deliveryIdle;
    const directorSince = inReview || directorIssue !== null ? refSince : delivery?.at ?? null;
    if (waitsForDirector) {
        waits.push(wait({
            kind: 'director', what: 'Consegnato, aspetta il Director', since: directorSince,
            openIn: directorIssue !== null ? { issueIdentifier: directorIssue.identifier } : null,
        }));
    }
    // 8. Waiting for another unit.
    const unitBlockers = openBlockers.filter((b) => b.assignee.kind === 'reparto');
    const unitWait = (blocker, partIndex, since) => {
        const other = blocker.assignee.kind === 'reparto' ? blocker.assignee : null;
        waits.push(wait({
            kind: 'reparto', buSlugs: other === null ? [input.buSlug] : [input.buSlug, other.buSlug], partIndex, since,
            what: other?.name ? `Aspetta il reparto ${other.name}` : 'Aspetta un altro reparto',
            openIn: { issueIdentifier: blocker.identifier },
        }));
    };
    for (const blocker of unitBlockers)
        unitWait(blocker, null, refSince);
    if (nextBehindOtherUnit !== null && nextPart !== null)
        unitWait(nextBehindOtherUnit, nextPart.index, approvedDecision?.decidedAt);
    const otherUnit = (unitBlockers[0] ?? nextBehindOtherUnit)?.assignee;
    const otherUnitName = otherUnit?.kind === 'reparto' ? otherUnit.name ?? null : null;
    // Order of states.
    const attempts = rejected.map((s, i) => ({ at: s.at, text: `Tentativo ${i + 1}: la consegna è stata scartata ${alle(s.at)}` }));
    // 2. Error.
    if (agentError) {
        const failed = runs.filter((run) => FAILED_RUNS.has(run.status)).map((run) => ({ at: run.at, text: `${errorWords(run.errorCode)}, ${alle(run.at)}` }));
        return finish('errore', 'Errore', agentErrorWhy, agentFailure?.at ?? null, waits, failed);
    }
    if (deliveryFails)
        return finish('errore', 'Errore', deliveryFailsWhy, rejected.at(-1).at, waits, attempts);
    if (unreadReply !== null)
        return finish('errore', 'Errore', unreadReplyWhy, unreadReply.at, waits, []);
    // 3. Paused.
    if (paused && agent !== null)
        return finish('in_pausa', 'In pausa', pausedWhy, agent.pausedAt, waits);
    // 4. Waiting for the go.
    if (waitingForGo !== null) {
        return finish('attesa_del_via', 'In attesa del via', "Aspetta il tuo via dopo l'approvazione", ref?.blockedSince ?? decisionSince ?? ref?.updatedAt, waits);
    }
    // 5. Approved and not restarted; if the next part waits for another unit, rule 8 applies.
    if (approvedNotRestarted) {
        return finish('approvato_non_ripartito', 'Fermo dopo la tua approvazione', approvedWhy, approvedDecision.decidedAt, waits, []);
    }
    if (approvedIdle && nextBehindOtherUnit !== null) {
        return finish('aspetta_reparto', otherUnitName ? `Aspetta il reparto ${otherUnitName}` : 'Aspetta un altro reparto', `La parte «${nextPart.title}» aspetta un altro reparto`, approvedDecision.decidedAt, waits);
    }
    // 6. Open decision.
    if (ownerDecision !== null) {
        return finish('aspetta_proprietario', 'Aspetta te', `Aspetta una tua risposta ${dal(ownerDecision.createdAt)}`.trim(), ownerDecision.createdAt, waits);
    }
    if (referentDecision !== null) {
        if (!input.referentPresent) {
            return finish('aspetta_proprietario', 'Manca il referente', `Indica chi segue ${input.unitName}`, referentDecision.createdAt, waits);
        }
        const name = input.referent?.name;
        return finish('aspetta_referente', name ? `Aspetta ${name}` : 'Aspetta il referente', `Aspetta una risposta ${dal(referentDecision.createdAt)}`.trim(), referentDecision.createdAt, waits);
    }
    // 7. Director.
    if (waitsForDirector) {
        return finish('aspetta_director', 'Aspetta il Director', `Consegnato, aspetta il Director ${dal(directorSince)}`.trim(), directorSince, waits);
    }
    // 8. Another unit.
    if (ref?.status === 'blocked' && unitBlockers.length > 0) {
        const first = unitBlockers[0].assignee;
        const name = first.kind === 'reparto' ? first.name : null;
        return finish('aspetta_reparto', name ? `Aspetta il reparto ${name}` : 'Aspetta un altro reparto', `Aspetta il risultato di un altro reparto ${dal(refSince)}`.trim(), refSince, waits);
    }
    // 9. Never started.
    if (ref !== null && (ref.status === 'backlog' || ref.status === 'todo') && ref.startedAt === null
        && working.length === 0 && workingSessions.length === 0) {
        const since = ref.createdAt ?? ref.updatedAt;
        return finish('non_partito', 'Non ancora partito', `Non è ancora partito, in coda ${dal(since)}`.trim(), since, waits);
    }
    // 10. Work in progress.
    if (working.length > 0 || workingSessions.length > 0) {
        const stamps = [
            ...working.map((issue) => issue.updatedAt),
            ...workingSessions.map((session) => session.at),
            ...runs.filter((run) => run.status !== 'failed' && run.status !== 'error' && run.status !== 'timed_out').map((run) => run.at),
        ];
        const lastMove = latest(stamps, (s) => s);
        const lastMoveMs = ms(lastMove);
        const moving = agent?.status === 'running' || (lastMoveMs !== null && nowMs - lastMoveMs <= soglie.lavoroMs);
        if (moving) {
            const startedAt = latest(working.filter((issue) => issue.startedAt !== null), (issue) => issue.startedAt)?.startedAt ?? lastMove;
            return finish('al_lavoro', 'Al lavoro', 'Sta lavorando', startedAt, waits);
        }
        const quiet = lastMove === null ? 'senza movimento' : `senza movimento ${dal(lastMove)}`;
        return finish('fermo', 'Fermo', `Il lavoro è in corso ma è fermo: ${quiet}`, lastMove, waits);
    }
    // 11. Done, or never begun.
    if (ref !== null && ref.status === 'done')
        return finish('finito', 'Finito', `Finito ${il(ref.updatedAt)}`.trim(), ref.updatedAt, waits);
    if (issues.length === 0 && input.sessions.length === 0)
        return finish('non_iniziato', 'Non iniziato', 'Nessun incarico aperto', null, waits);
    if (ref !== null && ref.status === 'blocked') {
        return finish('fermo', 'Fermo', `È fermo e nessun incarico aperto lo sta sbloccando ${dal(refSince)}`.trim(), refSince, waits);
    }
    if (issues.length > 0 && issues.every((issue) => issue.status === 'done')) {
        return finish('finito', 'Finito', 'Tutti gli incarichi sono chiusi', latest(issues, (i) => i.updatedAt)?.updatedAt ?? null, waits);
    }
    return finish('non_noto', 'Stato non noto', 'Lo stato non si ricava dai dati del reparto', null, waits);
}
//# sourceMappingURL=company-board-rule.js.map