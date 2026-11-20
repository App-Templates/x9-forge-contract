"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paperclipPercorsi = exports.PaperclipCommentiQuerySchema = exports.PaperclipElencoIncarichiFiltriSchema = exports.PAPERCLIP_COMMENTI_LIMITE_MASSIMO = exports.PAPERCLIP_ELENCO_LIMITE_MASSIMO = exports.PAPERCLIP_ELENCO_LIMITE_PREDEFINITO = exports.PAPERCLIP_PREFISSO_API = exports.PAPERCLIP_RUN_ID_HEADER = void 0;
exports.paperclipPercorsoSenzaPrefisso = paperclipPercorsoSenzaPrefisso;
const zod_1 = require("zod");
const wire_documenti_js_1 = require("./wire-documenti.cjs");
const wire_letture_js_1 = require("./wire-letture.cjs");
// Paperclip docs/guides/agent-developer/heartbeat-protocol.md:52,77-80.
exports.PAPERCLIP_RUN_ID_HEADER = 'X-Paperclip-Run-Id';
// Paperclip server/src/routes/issues.ts:11514-11518 (POST) e :7779 (GET); services/issues.ts:211-212.
exports.PAPERCLIP_PREFISSO_API = '/api';
exports.PAPERCLIP_ELENCO_LIMITE_PREDEFINITO = 500;
exports.PAPERCLIP_ELENCO_LIMITE_MASSIMO = 1000;
// Paperclip server/src/routes/issues.ts:357,15222-15228: oltre 500 il server taglia a 500.
exports.PAPERCLIP_COMMENTI_LIMITE_MASSIMO = 500;
const PAPERCLIP_ELENCO_ORDINAMENTI = ['updated', 'id'];
const PAPERCLIP_ELENCO_DIREZIONI = ['asc', 'desc'];
// Paperclip routes/issues.ts:7933-7953 (assigneeAgentId: UUID oppure `null`, altrimenti 422), :7965-8010.
// Il nome o il reparto non sono ammessi come filtro: si risolve prima l'id.
exports.PaperclipElencoIncarichiFiltriSchema = zod_1.z.strictObject({
    status: zod_1.z.array(wire_letture_js_1.PaperclipStatoIncaricoSchema).min(1)
        .refine((valori) => new Set(valori).size === valori.length, 'Gli stati devono essere unici').optional(),
    assigneeAgentId: zod_1.z.union([zod_1.z.guid(), zod_1.z.literal('null')]).optional(),
    participantAgentId: zod_1.z.guid().optional(),
    projectId: zod_1.z.guid().optional(),
    parentId: zod_1.z.guid().optional(),
    descendantOf: zod_1.z.guid().optional(),
    createdFromIssueId: zod_1.z.guid().optional(),
    q: zod_1.z.string().trim().min(1).max(200).optional(),
    limit: zod_1.z.int().min(1).max(exports.PAPERCLIP_ELENCO_LIMITE_MASSIMO).optional(),
    offset: zod_1.z.int().min(0).optional(),
    afterId: zod_1.z.guid().optional(),
    sortField: zod_1.z.enum(PAPERCLIP_ELENCO_ORDINAMENTI).optional(),
    sortDir: zod_1.z.enum(PAPERCLIP_ELENCO_DIREZIONI).optional(),
    attention: zod_1.z.literal('blocked').optional(),
});
const CHIAVI_ELENCO = [
    'status', 'assigneeAgentId', 'participantAgentId', 'projectId', 'parentId', 'descendantOf',
    'createdFromIssueId', 'q', 'limit', 'offset', 'afterId', 'sortField', 'sortDir', 'attention',
];
// Paperclip routes/issues.ts:15199-15237: `after` senza order=asc parte dal commento più nuovo (default desc).
exports.PaperclipCommentiQuerySchema = zod_1.z.strictObject({
    after: zod_1.z.guid().optional(),
    order: zod_1.z.enum(PAPERCLIP_ELENCO_DIREZIONI).optional(),
    limit: zod_1.z.int().min(1).max(exports.PAPERCLIP_COMMENTI_LIMITE_MASSIMO).optional(),
}).refine((valore) => valore.after === undefined || valore.order === 'asc', {
    path: ['order'],
    message: 'after richiede order=asc: il default di Paperclip è desc',
});
/** I percorsi di Paperclip portano `/api`; un client con base URL già terminata in `/api` usa questo. */
function paperclipPercorsoSenzaPrefisso(percorso) {
    if (!percorso.startsWith(`${exports.PAPERCLIP_PREFISSO_API}/`)) {
        throw new Error('Il percorso Paperclip deve cominciare con /api/');
    }
    return percorso.slice(exports.PAPERCLIP_PREFISSO_API.length);
}
exports.paperclipPercorsi = {
    agenteMe() {
        return '/api/agents/me';
    },
    // Paperclip server/dist/routes/issues.js:5728-5739.
    contesto(id, wakeCommentId) {
        const path = `/api/issues/${zod_1.z.guid().parse(id)}/heartbeat-context`;
        return wakeCommentId === undefined
            ? path
            : `${path}?wakeCommentId=${zod_1.z.guid().parse(wakeCommentId)}`;
    },
    commenti(id, query) {
        const base = `/api/issues/${zod_1.z.guid().parse(id)}/comments`;
        if (query === undefined)
            return base;
        const valida = exports.PaperclipCommentiQuerySchema.parse(query);
        const parametri = new URLSearchParams();
        if (valida.after !== undefined)
            parametri.set('after', valida.after);
        if (valida.order !== undefined)
            parametri.set('order', valida.order);
        if (valida.limit !== undefined)
            parametri.set('limit', String(valida.limit));
        const testo = parametri.toString();
        return testo === '' ? base : `${base}?${testo}`;
    },
    // Paperclip routes/issues.ts:16826-16845 (404 se il commento non è di quell'incarico).
    commento(id, commentId) {
        return `/api/issues/${zod_1.z.guid().parse(id)}/comments/${zod_1.z.guid().parse(commentId)}`;
    },
    checkout(id) {
        return `/api/issues/${zod_1.z.guid().parse(id)}/checkout`;
    },
    // Paperclip server/dist/routes/issues.js:8401.
    figli(id) {
        return `/api/issues/${zod_1.z.guid().parse(id)}/children`;
    },
    incarico(id) {
        return `/api/issues/${zod_1.z.guid().parse(id)}`;
    },
    // Paperclip server/dist/routes/issues.js:6900.
    piano(id) {
        return `/api/issues/${zod_1.z.guid().parse(id)}/documents/plan`;
    },
    // Paperclip server/dist/routes/issues.js:11271.
    interazioni(id) {
        return `/api/issues/${zod_1.z.guid().parse(id)}/interactions`;
    },
    // Paperclip routes/issues.ts:11514-11518 (creazione) e :7779 (elenco): stesso percorso, due metodi.
    incarichiAzienda(companyId) {
        return `/api/companies/${zod_1.z.guid().parse(companyId)}/issues`;
    },
    elencoIncarichi(companyId, filtri = {}) {
        const valida = exports.PaperclipElencoIncarichiFiltriSchema.parse(filtri);
        const parametri = new URLSearchParams();
        for (const chiave of CHIAVI_ELENCO) {
            const valore = valida[chiave];
            if (valore === undefined)
                continue;
            parametri.set(chiave, Array.isArray(valore) ? valore.join(',') : String(valore));
        }
        const base = `/api/companies/${zod_1.z.guid().parse(companyId)}/issues`;
        const testo = parametri.toString();
        return testo === '' ? base : `${base}?${testo}`;
    },
    // Paperclip server/src/routes/agents.ts:4255 (GET /agents/:id): lo stato dell'agente destinatario, prima di assegnare.
    agente(agentId) {
        return `/api/agents/${zod_1.z.guid().parse(agentId)}`;
    },
    // Paperclip routes/issues.ts:15112-15149 (senza corpo; riporta in_progress a todo e toglie l'assegnatario).
    rilascio(id) {
        return `/api/issues/${zod_1.z.guid().parse(id)}/release`;
    },
    // Paperclip routes/issues.ts:12708-12725.
    titolo(id) {
        return `/api/issues/${zod_1.z.guid().parse(id)}/title`;
    },
    // Paperclip routes/issues.ts:12507-12533.
    monitorCheckNow(id) {
        return `/api/issues/${zod_1.z.guid().parse(id)}/monitor/check-now`;
    },
    // Paperclip routes/issues.ts:8846 (GET), :8861 (PUT), :8923 (DELETE).
    watchdog(id) {
        return `/api/issues/${zod_1.z.guid().parse(id)}/watchdog`;
    },
    // Paperclip routes/agents.ts:6969 (lettura) e :6986 (annullo: solo board, assertBoard).
    corsa(runId) {
        return `/api/heartbeat-runs/${zod_1.z.guid().parse(runId)}`;
    },
    annullaCorsa(runId) {
        return `/api/heartbeat-runs/${zod_1.z.guid().parse(runId)}/cancel`;
    },
    // 7406: Paperclip routes/issues.ts:9714-9758 (GET), :10222 (PUT).
    documento(issueId, key) {
        return `/api/issues/${zod_1.z.guid().parse(issueId)}/documents/${wire_documenti_js_1.PaperclipDocumentoChiaveSchema.parse(key)}`;
    },
    // 7407: Paperclip server/src/routes/approvals.ts:222.
    approvazioni(companyId) {
        return `/api/companies/${zod_1.z.guid().parse(companyId)}/approvals`;
    },
    // 7416: Paperclip routes/issues.ts:18359-18461 (POST/GET), :18536-18622 (content), :18628 (DELETE).
    allegati(companyId, issueId) {
        return `/api/companies/${zod_1.z.guid().parse(companyId)}/issues/${zod_1.z.guid().parse(issueId)}/attachments`;
    },
    allegatiIncarico(issueId) {
        return `/api/issues/${zod_1.z.guid().parse(issueId)}/attachments`;
    },
    allegatoContenuto(attachmentId, scarica = false) {
        const path = `/api/attachments/${zod_1.z.guid().parse(attachmentId)}/content`;
        return scarica ? `${path}?download=1` : path;
    },
    // DELETE only: Paperclip has no GET /api/attachments/:id.
    allegato(attachmentId) {
        return `/api/attachments/${zod_1.z.guid().parse(attachmentId)}`;
    },
    // 7418. Paperclip routes/issues.ts:9578 e :10627 (GET/POST), :11052 e :11149 (PATCH/DELETE).
    prodottiLavoro(issueId) {
        return `/api/issues/${zod_1.z.guid().parse(issueId)}/work-products`;
    },
    prodottoLavoro(workProductId) {
        return `/api/work-products/${zod_1.z.guid().parse(workProductId)}`;
    },
};
//# sourceMappingURL=percorsi.js.map