import { z } from 'zod';
import { PaperclipDocumentoChiaveSchema } from "./wire-documenti.js";
import { PaperclipStatoIncaricoSchema } from "./wire-letture.js";
// Paperclip docs/guides/agent-developer/heartbeat-protocol.md:52,77-80.
export const PAPERCLIP_RUN_ID_HEADER = 'X-Paperclip-Run-Id';
// Paperclip server/src/routes/issues.ts:11514-11518 (POST) e :7779 (GET); services/issues.ts:211-212.
export const PAPERCLIP_PREFISSO_API = '/api';
export const PAPERCLIP_ELENCO_LIMITE_PREDEFINITO = 500;
export const PAPERCLIP_ELENCO_LIMITE_MASSIMO = 1000;
// Paperclip server/src/routes/issues.ts:357,15222-15228: oltre 500 il server taglia a 500.
export const PAPERCLIP_COMMENTI_LIMITE_MASSIMO = 500;
const PAPERCLIP_ELENCO_ORDINAMENTI = ['updated', 'id'];
const PAPERCLIP_ELENCO_DIREZIONI = ['asc', 'desc'];
// Paperclip routes/issues.ts:7933-7953 (assigneeAgentId: UUID oppure `null`, altrimenti 422), :7965-8010.
// Il nome o il reparto non sono ammessi come filtro: si risolve prima l'id.
export const PaperclipElencoIncarichiFiltriSchema = z.strictObject({
    status: z.array(PaperclipStatoIncaricoSchema).min(1)
        .refine((valori) => new Set(valori).size === valori.length, 'Gli stati devono essere unici').optional(),
    assigneeAgentId: z.union([z.guid(), z.literal('null')]).optional(),
    participantAgentId: z.guid().optional(),
    projectId: z.guid().optional(),
    parentId: z.guid().optional(),
    descendantOf: z.guid().optional(),
    createdFromIssueId: z.guid().optional(),
    q: z.string().trim().min(1).max(200).optional(),
    limit: z.int().min(1).max(PAPERCLIP_ELENCO_LIMITE_MASSIMO).optional(),
    offset: z.int().min(0).optional(),
    afterId: z.guid().optional(),
    sortField: z.enum(PAPERCLIP_ELENCO_ORDINAMENTI).optional(),
    sortDir: z.enum(PAPERCLIP_ELENCO_DIREZIONI).optional(),
    attention: z.literal('blocked').optional(),
});
const CHIAVI_ELENCO = [
    'status', 'assigneeAgentId', 'participantAgentId', 'projectId', 'parentId', 'descendantOf',
    'createdFromIssueId', 'q', 'limit', 'offset', 'afterId', 'sortField', 'sortDir', 'attention',
];
// Paperclip routes/issues.ts:15199-15237: `after` senza order=asc parte dal commento più nuovo (default desc).
export const PaperclipCommentiQuerySchema = z.strictObject({
    after: z.guid().optional(),
    order: z.enum(PAPERCLIP_ELENCO_DIREZIONI).optional(),
    limit: z.int().min(1).max(PAPERCLIP_COMMENTI_LIMITE_MASSIMO).optional(),
}).refine((valore) => valore.after === undefined || valore.order === 'asc', {
    path: ['order'],
    message: 'after richiede order=asc: il default di Paperclip è desc',
});
/** I percorsi di Paperclip portano `/api`; un client con base URL già terminata in `/api` usa questo. */
export function paperclipPercorsoSenzaPrefisso(percorso) {
    if (!percorso.startsWith(`${PAPERCLIP_PREFISSO_API}/`)) {
        throw new Error('Il percorso Paperclip deve cominciare con /api/');
    }
    return percorso.slice(PAPERCLIP_PREFISSO_API.length);
}
export const paperclipPercorsi = {
    agenteMe() {
        return '/api/agents/me';
    },
    // Paperclip server/dist/routes/issues.js:5728-5739.
    contesto(id, wakeCommentId) {
        const path = `/api/issues/${z.guid().parse(id)}/heartbeat-context`;
        return wakeCommentId === undefined
            ? path
            : `${path}?wakeCommentId=${z.guid().parse(wakeCommentId)}`;
    },
    commenti(id, query) {
        const base = `/api/issues/${z.guid().parse(id)}/comments`;
        if (query === undefined)
            return base;
        const valida = PaperclipCommentiQuerySchema.parse(query);
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
        return `/api/issues/${z.guid().parse(id)}/comments/${z.guid().parse(commentId)}`;
    },
    checkout(id) {
        return `/api/issues/${z.guid().parse(id)}/checkout`;
    },
    // Paperclip server/dist/routes/issues.js:8401.
    figli(id) {
        return `/api/issues/${z.guid().parse(id)}/children`;
    },
    incarico(id) {
        return `/api/issues/${z.guid().parse(id)}`;
    },
    // Paperclip server/dist/routes/issues.js:6900.
    piano(id) {
        return `/api/issues/${z.guid().parse(id)}/documents/plan`;
    },
    // Paperclip server/dist/routes/issues.js:11271.
    interazioni(id) {
        return `/api/issues/${z.guid().parse(id)}/interactions`;
    },
    // Paperclip routes/issues.ts:11514-11518 (creazione) e :7779 (elenco): stesso percorso, due metodi.
    incarichiAzienda(companyId) {
        return `/api/companies/${z.guid().parse(companyId)}/issues`;
    },
    elencoIncarichi(companyId, filtri = {}) {
        const valida = PaperclipElencoIncarichiFiltriSchema.parse(filtri);
        const parametri = new URLSearchParams();
        for (const chiave of CHIAVI_ELENCO) {
            const valore = valida[chiave];
            if (valore === undefined)
                continue;
            parametri.set(chiave, Array.isArray(valore) ? valore.join(',') : String(valore));
        }
        const base = `/api/companies/${z.guid().parse(companyId)}/issues`;
        const testo = parametri.toString();
        return testo === '' ? base : `${base}?${testo}`;
    },
    // Paperclip server/src/routes/agents.ts:4255 (GET /agents/:id): lo stato dell'agente destinatario, prima di assegnare.
    agente(agentId) {
        return `/api/agents/${z.guid().parse(agentId)}`;
    },
    // Paperclip routes/issues.ts:15112-15149 (senza corpo; riporta in_progress a todo e toglie l'assegnatario).
    rilascio(id) {
        return `/api/issues/${z.guid().parse(id)}/release`;
    },
    // Paperclip routes/issues.ts:12708-12725.
    titolo(id) {
        return `/api/issues/${z.guid().parse(id)}/title`;
    },
    // Paperclip routes/issues.ts:12507-12533.
    monitorCheckNow(id) {
        return `/api/issues/${z.guid().parse(id)}/monitor/check-now`;
    },
    // Paperclip routes/issues.ts:8846 (GET), :8861 (PUT), :8923 (DELETE).
    watchdog(id) {
        return `/api/issues/${z.guid().parse(id)}/watchdog`;
    },
    // Paperclip routes/agents.ts:6969 (lettura) e :6986 (annullo: solo board, assertBoard).
    corsa(runId) {
        return `/api/heartbeat-runs/${z.guid().parse(runId)}`;
    },
    annullaCorsa(runId) {
        return `/api/heartbeat-runs/${z.guid().parse(runId)}/cancel`;
    },
    // 7406: Paperclip routes/issues.ts:9714-9758 (GET), :10222 (PUT).
    documento(issueId, key) {
        return `/api/issues/${z.guid().parse(issueId)}/documents/${PaperclipDocumentoChiaveSchema.parse(key)}`;
    },
    // 7407: Paperclip server/src/routes/approvals.ts:222.
    approvazioni(companyId) {
        return `/api/companies/${z.guid().parse(companyId)}/approvals`;
    },
};
//# sourceMappingURL=percorsi.js.map