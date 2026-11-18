import { z } from 'zod';
import { PaperclipDocumentoChiaveSchema } from './wire-documenti.js';
import { PaperclipStatoIncaricoSchema } from './wire-letture.js';

// Paperclip docs/guides/agent-developer/heartbeat-protocol.md:52,77-80.
export const PAPERCLIP_RUN_ID_HEADER = 'X-Paperclip-Run-Id' as const;

// Paperclip server/src/routes/issues.ts:11514-11518 (POST) e :7779 (GET); services/issues.ts:211-212.
export const PAPERCLIP_PREFISSO_API = '/api' as const;
export const PAPERCLIP_ELENCO_LIMITE_PREDEFINITO = 500;
export const PAPERCLIP_ELENCO_LIMITE_MASSIMO = 1000;
// Paperclip server/src/routes/issues.ts:357,15222-15228: oltre 500 il server taglia a 500.
export const PAPERCLIP_COMMENTI_LIMITE_MASSIMO = 500;

const PAPERCLIP_ELENCO_ORDINAMENTI = ['updated', 'id'] as const;
const PAPERCLIP_ELENCO_DIREZIONI = ['asc', 'desc'] as const;

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
export type PaperclipElencoIncarichiFiltri = z.infer<typeof PaperclipElencoIncarichiFiltriSchema>;

const CHIAVI_ELENCO = [
  'status', 'assigneeAgentId', 'participantAgentId', 'projectId', 'parentId', 'descendantOf',
  'createdFromIssueId', 'q', 'limit', 'offset', 'afterId', 'sortField', 'sortDir', 'attention',
] as const satisfies readonly (keyof PaperclipElencoIncarichiFiltri)[];

// Paperclip routes/issues.ts:15199-15237: `after` senza order=asc parte dal commento più nuovo (default desc).
export const PaperclipCommentiQuerySchema = z.strictObject({
  after: z.guid().optional(),
  order: z.enum(PAPERCLIP_ELENCO_DIREZIONI).optional(),
  limit: z.int().min(1).max(PAPERCLIP_COMMENTI_LIMITE_MASSIMO).optional(),
}).refine((valore) => valore.after === undefined || valore.order === 'asc', {
  path: ['order'],
  message: 'after richiede order=asc: il default di Paperclip è desc',
});
export type PaperclipCommentiQuery = z.infer<typeof PaperclipCommentiQuerySchema>;

/** I percorsi di Paperclip portano `/api`; un client con base URL già terminata in `/api` usa questo. */
export function paperclipPercorsoSenzaPrefisso(percorso: string): string {
  if (!percorso.startsWith(`${PAPERCLIP_PREFISSO_API}/`)) {
    throw new Error('Il percorso Paperclip deve cominciare con /api/');
  }
  return percorso.slice(PAPERCLIP_PREFISSO_API.length);
}

export const paperclipPercorsi = {
  agenteMe(): string {
    return '/api/agents/me';
  },

  // Paperclip server/dist/routes/issues.js:5728-5739.
  contesto(id: string, wakeCommentId?: string): string {
    const path = `/api/issues/${z.guid().parse(id)}/heartbeat-context`;
    return wakeCommentId === undefined
      ? path
      : `${path}?wakeCommentId=${z.guid().parse(wakeCommentId)}`;
  },

  commenti(id: string, query?: PaperclipCommentiQuery): string {
    const base = `/api/issues/${z.guid().parse(id)}/comments`;
    if (query === undefined) return base;
    const valida = PaperclipCommentiQuerySchema.parse(query);
    const parametri = new URLSearchParams();
    if (valida.after !== undefined) parametri.set('after', valida.after);
    if (valida.order !== undefined) parametri.set('order', valida.order);
    if (valida.limit !== undefined) parametri.set('limit', String(valida.limit));
    const testo = parametri.toString();
    return testo === '' ? base : `${base}?${testo}`;
  },

  // Paperclip routes/issues.ts:16826-16845 (404 se il commento non è di quell'incarico).
  commento(id: string, commentId: string): string {
    return `/api/issues/${z.guid().parse(id)}/comments/${z.guid().parse(commentId)}`;
  },

  checkout(id: string): string {
    return `/api/issues/${z.guid().parse(id)}/checkout`;
  },

  // Paperclip server/dist/routes/issues.js:8401.
  figli(id: string): string {
    return `/api/issues/${z.guid().parse(id)}/children`;
  },

  incarico(id: string): string {
    return `/api/issues/${z.guid().parse(id)}`;
  },

  // Paperclip server/dist/routes/issues.js:6900.
  piano(id: string): string {
    return `/api/issues/${z.guid().parse(id)}/documents/plan`;
  },

  // Paperclip server/dist/routes/issues.js:11271.
  interazioni(id: string): string {
    return `/api/issues/${z.guid().parse(id)}/interactions`;
  },

  // Paperclip routes/issues.ts:11514-11518 (creazione) e :7779 (elenco): stesso percorso, due metodi.
  incarichiAzienda(companyId: string): string {
    return `/api/companies/${z.guid().parse(companyId)}/issues`;
  },

  elencoIncarichi(companyId: string, filtri: PaperclipElencoIncarichiFiltri = {}): string {
    const valida = PaperclipElencoIncarichiFiltriSchema.parse(filtri);
    const parametri = new URLSearchParams();
    for (const chiave of CHIAVI_ELENCO) {
      const valore = valida[chiave];
      if (valore === undefined) continue;
      parametri.set(chiave, Array.isArray(valore) ? valore.join(',') : String(valore));
    }
    const base = `/api/companies/${z.guid().parse(companyId)}/issues`;
    const testo = parametri.toString();
    return testo === '' ? base : `${base}?${testo}`;
  },

  // Paperclip server/src/routes/agents.ts:4255 (GET /agents/:id): lo stato dell'agente destinatario, prima di assegnare.
  agente(agentId: string): string {
    return `/api/agents/${z.guid().parse(agentId)}`;
  },

  // Paperclip routes/issues.ts:15112-15149 (senza corpo; riporta in_progress a todo e toglie l'assegnatario).
  rilascio(id: string): string {
    return `/api/issues/${z.guid().parse(id)}/release`;
  },

  // Paperclip routes/issues.ts:12708-12725.
  titolo(id: string): string {
    return `/api/issues/${z.guid().parse(id)}/title`;
  },

  // Paperclip routes/issues.ts:12507-12533.
  monitorCheckNow(id: string): string {
    return `/api/issues/${z.guid().parse(id)}/monitor/check-now`;
  },

  // Paperclip routes/issues.ts:8846 (GET), :8861 (PUT), :8923 (DELETE).
  watchdog(id: string): string {
    return `/api/issues/${z.guid().parse(id)}/watchdog`;
  },

  // Paperclip routes/agents.ts:6969 (lettura) e :6986 (annullo: solo board, assertBoard).
  corsa(runId: string): string {
    return `/api/heartbeat-runs/${z.guid().parse(runId)}`;
  },

  annullaCorsa(runId: string): string {
    return `/api/heartbeat-runs/${z.guid().parse(runId)}/cancel`;
  },

  // 7406: Paperclip routes/issues.ts:9714-9758 (GET), :10222 (PUT).
  documento(issueId: string, key: string): string {
    return `/api/issues/${z.guid().parse(issueId)}/documents/${PaperclipDocumentoChiaveSchema.parse(key)}`;
  },

  // 7407: Paperclip server/src/routes/approvals.ts:222.
  approvazioni(companyId: string): string {
    return `/api/companies/${z.guid().parse(companyId)}/approvals`;
  },
};
