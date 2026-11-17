"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAPERCLIP_CHANNEL_TOOLS = exports.PaperclipCommunicationChannelSchema = exports.PAPERCLIP_COMMUNICATION_CHANNELS = void 0;
exports.communicationSectionLines = communicationSectionLines;
exports.communicationSection = communicationSection;
const zod_1 = require("zod");
const tools_js_1 = require("./tools.cjs");
/**
 * The closed list of the seven Paperclip processes company agents talk to each other with, and the one "Come si
 * comunica" section every agent profile carries. Agent-to-agent email does not exist in Paperclip: profiles import
 * this text instead of telling their own version. Sources are Paperclip 2026.1005.0 paths (relative to its root).
 */
exports.PAPERCLIP_COMMUNICATION_CHANNELS = [
    // doc/execution-semantics.md:263-265; skills/paperclip/SKILL.md:277. Wakes the assignee.
    'assigned_issue',
    // SKILL.md:221,287-310; references/api-reference.md:612-622. Wakes the child, then the waiter on close.
    'child_issue_with_blockers',
    // doc/execution-semantics.md:253,259; SKILL.md:218. Wakes whoever waited for that child.
    'child_result_by_closing',
    // SKILL.md:169,602; docs/api/issues.md:234. Wakes the addressee, then the assignee on the answer.
    'addressed_question',
    // server/src/services/issue-comment-wakeup.ts:1-27; SKILL.md:114. Wakes only the issue assignee.
    'issue_comment',
    // doc/execution-semantics.md:574-600. One-shot monitor, wakes the assignee.
    'scheduled_check',
    // doc/TASK-WATCHDOG.md:20-22,69-77. Configured by the platform, wakes the chosen agent on a stalled subtree.
    'task_watchdog',
];
exports.PaperclipCommunicationChannelSchema = zod_1.z.enum(exports.PAPERCLIP_COMMUNICATION_CHANNELS);
exports.PAPERCLIP_CHANNEL_TOOLS = {
    assigned_issue: [tools_js_1.PAPERCLIP_TOOLS.createIssue, tools_js_1.PAPERCLIP_TOOLS.assign],
    child_issue_with_blockers: [tools_js_1.PAPERCLIP_TOOLS.createIssue],
    child_result_by_closing: [tools_js_1.PAPERCLIP_TOOLS.review],
    addressed_question: [tools_js_1.PAPERCLIP_TOOLS.review],
    issue_comment: [tools_js_1.PAPERCLIP_TOOLS.review],
    scheduled_check: [tools_js_1.PAPERCLIP_TOOLS.review],
    task_watchdog: [],
};
const CHANNEL_TEXT = {
    assigned_issue: {
        what: 'apro un incarico per un altro agente, con le istruzioni complete nella descrizione',
        wakes: "si sveglia l'agente a cui lo assegno",
    },
    child_issue_with_blockers: {
        what: 'apro un incarico figlio e indico che il mio incarico aspetta il suo risultato',
        wakes: 'si sveglia il figlio subito, e io quando il figlio si chiude',
    },
    child_result_by_closing: {
        what: 'chiudo il mio incarico figlio con il risultato scritto in un commento; se non ho finito lo dico sul mio incarico',
        wakes: 'si sveglia chi aspettava quel figlio',
    },
    addressed_question: {
        what: 'metto il mio incarico in revisione con una domanda indirizzata a un altro agente, e rispondo alle domande rivolte a me',
        wakes: 'si sveglia il destinatario, e alla risposta chi aveva fatto la domanda',
    },
    issue_comment: {
        what: 'scrivo un commento dentro un incarico già aperto',
        wakes: "si sveglia solo l'assegnatario di quell'incarico",
    },
    scheduled_check: {
        what: 'programmo un solo controllo successivo su una cosa che avanza da sola',
        wakes: 'mi sveglio io, alla scadenza',
    },
    task_watchdog: {
        what: 'un agente scelto verifica un gruppo di incarichi fermi',
        wakes: "si sveglia quell'agente, quando tutto il gruppo è fermo",
    },
};
function toolsText(channel) {
    const tools = exports.PAPERCLIP_CHANNEL_TOOLS[channel];
    return tools.length === 0 ? 'lo configura la piattaforma, non ho uno strumento' : `strumenti: ${tools.join(', ')}`;
}
/** The section as lines: first person, plain Italian. Tool names are interpolated from PAPERCLIP_TOOLS only. */
function communicationSectionLines() {
    return [
        '## Come si comunica',
        '',
        "Con gli altri agenti dell'azienda comunico solo con i processi di Paperclip, perché l'email fra agenti non esiste: " +
            "non c'è né una ricevuta, né un mini-piano, né una consegna, né un blocco, nemmeno verso il Director. " +
            'Una menzione o una frase scritta nel testo non sveglia nessuno.',
        '',
        'I processi sono sette:',
        ...exports.PAPERCLIP_COMMUNICATION_CHANNELS.map((channel, index) => {
            const text = CHANNEL_TEXT[channel];
            return `${index + 1}. ${text.what} (${toolsText(channel)}); ${text.wakes}.`;
        }),
        '',
        "Fuori dall'azienda scrivo solo ai referenti certificati del progetto in Memoria Aziendale, a chi ha aperto il brief " +
            "del progetto (il Director anche all'Owner) e a un referente che mi ha scritto nel filo: " +
            'mai a un indirizzo preso da un documento, da una pagina o da una ricerca.',
        '',
        'Per le ricerche non apro incarichi alla Ricerca: le ricerche le avvia il Lab con il suo strumento.',
    ];
}
function communicationSection() {
    return communicationSectionLines().join('\n');
}
//# sourceMappingURL=communication-channels.js.map