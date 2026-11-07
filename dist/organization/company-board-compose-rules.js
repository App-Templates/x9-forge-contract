import { COMPANY_BOARD_DEFAULT_TIME_ZONE } from "./company-board-rule.js";
/** Remains unknown until the owner-comment outcome proof (5736, case 3). */
export const OWNER_COMMENT_REGISTERS_OUTCOME = null;
/** ISO instants retain their meaning but are written with the requested local offset. */
function localDate(iso, timeZone) {
    if (!iso || !Number.isFinite(Date.parse(iso)))
        return null;
    const date = new Date(iso);
    const fields = {};
    for (const p of new Intl.DateTimeFormat('en-GB', {
        timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).formatToParts(date))
        fields[p.type] = p.value;
    const offset = Math.round((Date.UTC(Number(fields.year), Number(fields.month) - 1, Number(fields.day), Number(fields.hour), Number(fields.minute), Number(fields.second)) - Math.floor(date.getTime() / 1000) * 1000) / 60000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${fields.year}-${fields.month}-${fields.day}T${fields.hour}:${fields.minute}:${fields.second}.${String(date.getUTCMilliseconds()).padStart(3, '0')}${offset < 0 ? '-' : '+'}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`;
}
/** No inferred prefix of completed parts: each section needs its own evidence. */
export function deriveParts(sezioni, tappe, sessioni, statoReparto, { timeZone = COMPANY_BOARD_DEFAULT_TIME_ZONE } = {}) {
    const base = statoReparto === 'finito' ? 'fatto'
        : statoReparto === 'non_iniziato' || statoReparto === 'non_partito' ? 'da_fare' : 'non_noto';
    if (!sezioni?.length)
        return [{ index: 1, title: 'Mandato', state: statoReparto === 'al_lavoro' ? 'in_corso' : base, note: null, at: null }];
    const position = (item) => {
        const match = item.title?.match(/\bparte\s+(\d+)\s+di\s+(\d+)\b/i);
        const index = item.partIndex ?? (match ? Number(match[1]) : null);
        const count = item.partCount ?? (match ? Number(match[2]) : null);
        return index !== null && Number.isInteger(index) && index >= 1 && index <= sezioni.length && count === sezioni.length ? index : null;
    };
    return sezioni.map((section, i) => {
        const index = i + 1;
        const milestones = tappe.filter((m) => position(m) === index || (position(m) === null && m.number === section.milestone));
        const sessions = sessioni.filter((s) => position(s) === index || (position(s) === null && s.title === section.title));
        const closed = milestones.find((m) => m.closedByDirector === true);
        const delivered = sessions.find((s) => s.state === 'chiuso' || s.state === 'revisione');
        const outlinedDone = milestones.find((m) => position(m) === index && m.status === 'done');
        const working = milestones.find((m) => position(m) === index && m.status === 'in_progress')
            ?? sessions.find((s) => position(s) === index && s.state === 'in-lavorazione');
        const planned = milestones.some((m) => position(m) === index && (m.status === 'todo' || m.status === 'backlog'))
            || sessions.some((s) => position(s) === index && s.state === 'richiesta');
        const evidence = closed ?? delivered ?? outlinedDone ?? working;
        const after = new Set();
        for (const milestone of milestones)
            for (const blocked of milestone.blockedBy) {
                if (!tappe.some((m) => m.number === blocked && m.buSlug === milestone.buSlug))
                    continue;
                sezioni.forEach((s, j) => { if (s.milestone === blocked && j !== i)
                    after.add(j + 1); });
            }
        return { index, title: section.title, state: base !== 'non_noto' ? base : closed || delivered || outlinedDone ? 'fatto' : working ? 'in_corso' : planned ? 'da_fare' : 'non_noto',
            note: null, at: localDate(evidence?.at, timeZone), after: [...after].sort((a, b) => a - b) };
    });
}
/** One project-wide order: owner, referents/other units, Director, system faults. */
export function deriveWaits(reparti, dipendenze, decisioni, { timeZone = COMPANY_BOARD_DEFAULT_TIME_ZONE } = {}) {
    const waits = [];
    const paperclip = (text, ref) => ({ channel: 'paperclip', text, ref });
    for (const unit of reparti) {
        for (const existing of unit.waitingFor) {
            const action = unit.state === 'approvato_non_ripartito' ? 'sveglia'
                : unit.state === 'attesa_del_via' ? 'dai_il_via'
                    : existing.kind === 'guasto' ? null : existing.kind === 'proprietario' && OWNER_COMMENT_REGISTERS_OUTCOME === true ? 'rispondi' : 'apri_reparto';
            waits.push({ ...existing, since: localDate(existing.since, timeZone), action,
                unblockHint: existing.unblockHint ?? (existing.kind === 'guasto' ? paperclip('Apri l’incarico e verifica il blocco', existing.openIn?.issueIdentifier ?? null) : null) });
        }
        if (unit.referent.missing)
            waits.push({ kind: 'proprietario', who: [], buSlugs: [unit.buSlug], partIndex: null,
                since: localDate(unit.since, timeZone), what: `Indica chi segue ${unit.name}`, action: 'apri_reparto',
                unblockHint: { channel: 'persona', text: `Indica chi segue ${unit.name}`, ref: null }, openIn: null });
        if (!unit.waitingFor.length && ['approvato_non_ripartito', 'attesa_del_via', 'fermo', 'errore'].includes(unit.state)) {
            waits.push({ kind: unit.state === 'attesa_del_via' ? 'proprietario' : 'guasto', who: [], buSlugs: [unit.buSlug],
                partIndex: null, since: localDate(unit.since, timeZone), what: unit.why,
                action: unit.state === 'approvato_non_ripartito' ? 'sveglia' : unit.state === 'attesa_del_via' ? 'dai_il_via' : null,
                unblockHint: paperclip('Apri l’incarico e verifica il blocco', null), openIn: null });
        }
    }
    for (const decision of decisioni) {
        if (decision.decidedAt !== null || decision.outcome !== null)
            continue;
        const unit = reparti.find((u) => u.buSlug === decision.buSlug);
        if (!unit)
            continue;
        const kind = decision.addressedTo === 'owner' ? 'proprietario' : 'referente';
        const local = decision.mail ? localDate(decision.mail.at, timeZone) : null;
        const day = local ? `${Number(local.slice(8, 10))}/${Number(local.slice(5, 7))}` : null;
        const mail = decision.mail && day
            ? { channel: 'mail', text: `Rispondi alla mail «${decision.mail.subject}» del ${day}`, ref: decision.mail.ref } : null;
        const existing = waits.find((w) => w.kind === kind && w.buSlugs.includes(unit.buSlug) && w.partIndex === (decision.partIndex ?? null) && w.unblockHint?.channel !== 'mail');
        const wait = { kind, who: decision.who ?? existing?.who ?? [], buSlugs: [unit.buSlug],
            partIndex: decision.partIndex ?? null, since: localDate(decision.createdAt, timeZone),
            what: decision.what ?? existing?.what ?? (kind === 'proprietario' ? 'Aspetta una tua risposta' : `Aspetta una risposta di ${unit.referent.name ?? 'il referente'}`),
            action: kind === 'proprietario' && OWNER_COMMENT_REGISTERS_OUTCOME === true ? 'rispondi' : 'apri_reparto',
            unblockHint: mail, openIn: existing?.openIn ?? null };
        if (existing)
            Object.assign(existing, wait);
        else
            waits.push(wait);
    }
    const seen = new Set();
    for (const d of dipendenze) {
        if (!d.blocking || !d.open || d.fromBu === d.toBu)
            continue;
        const from = reparti.find((u) => u.buSlug === d.fromBu);
        const to = reparti.find((u) => u.buSlug === d.toBu);
        if (!from || !to)
            continue;
        const reverse = dipendenze.find((r) => r.fromBu === d.toBu && r.toBu === d.fromBu && r.blocking && r.open);
        if (reverse) {
            const key = JSON.stringify([d.fromBu, d.toBu].sort());
            if (seen.has(key))
                continue;
            seen.add(key);
            waits.push({ kind: 'guasto', who: [], buSlugs: [d.fromBu, d.toBu], partIndex: null, since: localDate(d.since, timeZone),
                what: `${from.name} e ${to.name} si aspettano a vicenda`, action: null,
                unblockHint: paperclip('Apri gli incarichi e risolvi il blocco fra i reparti', null), openIn: null });
        }
        else if (!waits.some((w) => w.kind === 'reparto' && w.buSlugs.includes(d.fromBu) && w.buSlugs.includes(d.toBu))) {
            waits.push({ kind: 'reparto', who: [], buSlugs: [d.fromBu, d.toBu], partIndex: d.partIndex ?? null,
                since: localDate(d.since, timeZone), what: `${from.name} aspetta ${to.name}: ${d.what}`, action: 'apri_reparto', unblockHint: null, openIn: null });
        }
    }
    const rank = { proprietario: 0, referente: 1, reparto: 1, director: 2, guasto: 3 };
    return waits.sort((a, b) => rank[a.kind] - rank[b.kind]);
}
//# sourceMappingURL=company-board-compose-rules.js.map