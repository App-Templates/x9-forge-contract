"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveDirector = deriveDirector;
exports.deriveSummary = deriveSummary;
const company_board_rule_js_1 = require("./company-board-rule.cjs");
/** One clock for both calendar comparisons and visible text, including midnight and DST. */
function clock(timeZone) {
    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit',
        minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZoneName: 'longOffset',
    });
    return (value) => {
        const date = new Date(value);
        if (!Number.isFinite(date.getTime()))
            throw new RangeError('Invalid company board date');
        const fields = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
        const day = `${fields.year}-${fields.month}-${fields.day}`;
        const time = `${fields.hour}:${fields.minute}`;
        const offset = fields.timeZoneName?.replace('GMT', '') || '+00:00';
        return { day, time, date: `${Number(fields.day)}/${Number(fields.month)}/${fields.year}`,
            iso: `${day}T${time}:${fields.second}.${String(date.getUTCMilliseconds()).padStart(3, '0')}${offset}` };
    };
}
const compact = (text, max) => text.length <= max ? text : `${text.slice(0, max - 1)}…`;
const calendarDate = (date) => {
    const [year, month, day] = date.split('-');
    return `${Number(day)}/${Number(month)}/${year}`;
};
/** Null/empty milestones mean no plan; waits are the result of deriveWaits, never recomputed here. */
function deriveDirector(agente, incarichi, tappe, attese, ora, { timeZone = company_board_rule_js_1.COMPANY_BOARD_DEFAULT_TIME_ZONE } = {}) {
    const local = clock(timeZone);
    const today = local(ora).day;
    const milestones = (tappe ?? []).map((m) => ({ ...m,
        state: m.state === 'aperta' || m.state === 'scaduta'
            ? m.dueDate !== null && m.dueDate < today ? 'scaduta' : 'aperta' : m.state,
    })).sort((a, b) => a.number - b.number);
    const next = milestones.find((m) => m.state !== 'fatta');
    const last = milestones.at(-1);
    const milestoneLine = next
        ? { text: `Tappa ${next.number} di ${milestones.length} · prossima: ${compact(next.closeCriterion, 210)}${next.dueDate === null ? '' : next.dueDate === today ? ' entro oggi' : ` entro il ${calendarDate(next.dueDate)}`}`, overdue: next.state === 'scaduta' }
        : last ? { text: `Tappa ${last.number} di ${milestones.length} · tutte fatte`, overdue: false } : null;
    const open = incarichi.filter((i) => i.status !== 'done' && i.status !== 'cancelled');
    const working = open.find((i) => i.status === 'in_progress');
    let state = agente === null ? 'non_noto'
        : agente.status === 'paused' ? 'in_pausa' : agente.status === 'error' ? 'errore'
            : working || agente.status === 'running' ? 'al_lavoro' : 'non_partito';
    let doing = working?.title ?? null;
    if (!milestones.length)
        doing = open.length ? 'Sta scrivendo il piano' : "Il piano non c'è ancora";
    else if (next?.state === 'scaduta' && next.dueDate !== null)
        doing = `Tappa ${next.number} in ritardo dal ${calendarDate(next.dueDate)}`;
    const directorWaits = attese.filter((w) => w.kind === 'director');
    if (directorWaits.length) {
        const names = [...new Set(directorWaits.flatMap((w) => w.buSlugs))].map((slug) => slug.split('-').map((word) => word.charAt(0).toLocaleUpperCase('it-IT') + word.slice(1)).join(' '));
        const reading = `Ha da leggere ${directorWaits.length} ${directorWaits.length === 1 ? 'consegna' : 'consegne'}${names.length ? `: ${names.join(', ')}` : ''}`;
        doing = doing ? `${doing}; ${reading}` : reading;
        if (state === 'non_partito')
            state = 'aspetta_director';
    }
    const wake = agente?.wokenAt === null || agente?.wokenAt === undefined ? -Infinity : Date.parse(agente.wokenAt);
    const pending = (agente?.events ?? []).filter((e) => (e.kind === 'approvazione' || e.kind === 'materiale')
        && Date.parse(e.at) > wake && Date.parse(e.at) <= ora.getTime()).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
    const stale = pending.find((event) => {
        const after = Date.parse(event.at);
        const lastAssignment = Math.max(after, ...incarichi.filter((i) => i.status !== 'cancelled')
            .flatMap((i) => [i.createdAt, i.startedAt]).filter((at) => at !== null && at !== undefined)
            .map((at) => Date.parse(at)).filter((at) => Number.isFinite(at) && at <= ora.getTime()));
        return ora.getTime() - lastAssignment >= company_board_rule_js_1.COMPANY_BOARD_DEFAULT_THRESHOLDS.ripartenzaMs;
    });
    if (stale && state !== 'in_pausa' && state !== 'errore') {
        const at = local(stale.at);
        state = 'fermo';
        doing = `Non ha preso in carico ${stale.kind === 'approvazione' ? "l'approvazione" : 'la consegna'} delle ${at.time}${at.day === today ? '' : ` del ${at.date}`}`;
    }
    return { state, doing: doing === null ? null : compact(doing, 300),
        wokenAt: agente?.wokenAt ? local(agente.wokenAt).iso : null, wokenWhy: agente?.wokenWhy ?? null,
        milestones, milestoneLine };
}
/** At most two sentences: movement and worst blocker, then the person who can act. */
function deriveSummary(reparti, attese, { timeZone = company_board_rule_js_1.COMPANY_BOARD_DEFAULT_TIME_ZONE } = {}) {
    const local = clock(timeZone);
    const active = reparti.filter((u) => u.state === 'al_lavoro');
    const movement = active.length === reparti.length && reparti.length > 0 ? 'I reparti lavorano'
        : active.length === 1 ? `Si muove un solo reparto, ${active[0].name}`
            : active.length ? `Si muovono ${active.length} reparti su ${reparti.length}: ${active.map((u) => u.name).join(', ')}` : 'Nessun reparto si muove';
    const candidates = [
        ...reparti.filter((u) => u.state === 'errore' || u.alert?.kind === 'errore' || u.late || u.alert?.kind === 'ritardo' || u.state === 'fermo')
            .map((u) => ({ rank: u.state === 'errore' || u.alert?.kind === 'errore' ? 0 : u.late || u.alert?.kind === 'ritardo' ? 1 : 2,
            text: `${u.name}: ${u.alert?.text ?? u.why}`, since: u.since })),
        ...attese.map((w) => ({ rank: w.kind === 'guasto' ? 0 : 3, text: w.what, since: w.since })),
    ].sort((a, b) => a.rank - b.rank || (a.since === null ? Infinity : Date.parse(a.since)) - (b.since === null ? Infinity : Date.parse(b.since)));
    const blocker = candidates[0];
    const action = attese.find((w) => w.kind === 'proprietario') ?? attese.find((w) => w.who.length > 0)
        ?? attese.find((w) => w.kind === 'director' || w.kind === 'referente' || w.kind === 'reparto');
    // Source texts may contain full stops; keep the board's two-sentence structure.
    const phrase = (text) => text.replace(/[.!?]+/g, ',').replace(/[,\s]+$/u, '');
    const since = blocker?.since ? local(blocker.since) : null;
    const first = blocker ? `${compact(movement, 90)}; ${compact(phrase(blocker.text), 110)}${since ? ` dal ${since.date} alle ${since.time}` : ''}` : movement;
    const actor = action?.kind === 'proprietario' ? 'Tocca a te' : action?.who.length ? `Tocca a ${action.who.map((p) => p.name).join(', ')}`
        : action?.kind === 'director' ? 'Tocca al Director' : action?.kind === 'referente' ? 'Tocca al referente' : 'Tocca al reparto';
    const second = action ? `${actor}: ${phrase(action.what)}` : 'nessuno aspetta te';
    return action ? `${compact(first, 260)}. ${compact(second, 137)}.` : `${compact(first, 379)}; ${second}.`;
}
//# sourceMappingURL=company-board-director-summary.js.map