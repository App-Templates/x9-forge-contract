import { z } from 'zod';
import {
  PaperclipIncaricoSchema,
  PaperclipPrioritaSchema,
} from './wire-letture.js';
import { PaperclipDescrittoreSbloccoSchema } from './wire-scritture.js';

// Paperclip packages/shared/src/validators/issue.ts:643-670 (default status), :687-748 (fields),
// :767-777 (deduplication), :829-844 (children); server/src/services/issues.ts:223,236,9246-9251,9856-9878.
export const PAPERCLIP_CREAZIONE_STATI = ['backlog', 'todo', 'blocked'] as const;
export const PaperclipCreazioneStatoSchema = z.enum(PAPERCLIP_CREAZIONE_STATI);
export type PaperclipCreazioneStato = z.infer<typeof PaperclipCreazioneStatoSchema>;

/** Paperclip defaults to todo with an assignee and backlog without one when status is omitted. */
export function paperclipStatoCreazionePredefinito(haAssegnatario: boolean): 'todo' | 'backlog' {
  return haAssegnatario ? 'todo' : 'backlog';
}

export const PAPERCLIP_IDEMPOTENZA_CHIAVE_MAX = 255;
export const PAPERCLIP_IDEMPOTENZA_GIORNI = 7;
export const PAPERCLIP_DEDUP_TITOLO_ORE = 48;
export const PAPERCLIP_DEDUP_MOTIVI = ['idempotency_key', 'recent_open_title'] as const;
export const PaperclipDeduplicazioneMotivoSchema = z.enum(PAPERCLIP_DEDUP_MOTIVI);
export type PaperclipDeduplicazioneMotivo = z.infer<typeof PaperclipDeduplicazioneMotivoSchema>;

export const PAPERCLIP_FIGLI_MASSIMI_PER_PADRE = 25;
export const PAPERCLIP_CRITERI_MASSIMI = 20;
export const PAPERCLIP_CRITERIO_MAX = 500;
export const PAPERCLIP_BLOCCHI_CREAZIONE_MASSIMI = 20;
/** Bridge limits, absent in Paperclip: title matches PUT /title, description matches pcp_affida. */
export const PAPERCLIP_TITOLO_MAX = 240;
export const PAPERCLIP_DESCRIZIONE_MAX = 20000;
export const PAPERCLIP_CORRIERE_DESCRIZIONE_MIN = 40;

const Title = z.string().trim().min(1).max(PAPERCLIP_TITOLO_MAX);
const Description = z.string().trim().min(1).max(PAPERCLIP_DESCRIZIONE_MAX);
const BlockingIssueIds = z.array(z.guid()).min(1).max(PAPERCLIP_BLOCCHI_CREAZIONE_MASSIMI)
  .refine((values) => new Set(values).size === values.length, 'Blocking issue ids must be unique');

const CreationFields = {
  title: Title.optional(),
  description: Description.optional(),
  projectId: z.guid().optional(),
  goalId: z.guid().nullable().optional(),
  blockedByIssueIds: BlockingIssueIds.optional(),
  unblockDescriptor: PaperclipDescrittoreSbloccoSchema.optional(),
  status: PaperclipCreazioneStatoSchema.optional(),
  priority: PaperclipPrioritaSchema.optional(),
  // validators/issue.ts:713: the assignee is a GUID, never a role or department name.
  assigneeAgentId: z.guid().optional(),
  idempotencyKey: z.string().trim().min(1).max(PAPERCLIP_IDEMPOTENZA_CHIAVE_MAX).optional(),
  allowDuplicate: z.boolean().optional(),
};

type CreationFacts = {
  title?: string | undefined;
  description?: string | undefined;
  status?: PaperclipCreazioneStato | undefined;
  blockedByIssueIds?: string[] | undefined;
  unblockDescriptor?: unknown;
};

function validateCreation(value: CreationFacts, ctx: z.RefinementCtx): void {
  // validators/issue.ts:793-800: 422 "Provide a title or task description".
  if (value.title === undefined && value.description === undefined) {
    ctx.addIssue({ code: 'custom', path: ['title'], message: 'A title or description is required' });
  }
  // validators/issue.ts:750-765: unblock descriptors are allowed only with blocked.
  if (value.unblockDescriptor !== undefined && value.status !== 'blocked') {
    ctx.addIssue({
      code: 'custom',
      path: ['unblockDescriptor'],
      message: 'An unblock descriptor is allowed only with status blocked',
    });
  }
  // Paperclip accepts blocked without a path on creation; routes/issues.ts:13229-13290 applies only to PATCH.
  // The bridge requires a path, as it already does for dispositions (execution-semantics.md:73-83).
  if (value.status === 'blocked' && value.blockedByIssueIds === undefined && value.unblockDescriptor === undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['status'],
      message: 'Blocked requires blocking issues or an unblock descriptor',
    });
  }
}

/** POST /api/companies/:companyId/issues creates an issue with an assignee identified by id. */
export const PaperclipIncaricoCampiSchema = z.strictObject({
  ...CreationFields,
  parentId: z.guid().nullable().optional(),
});
export const PaperclipIncaricoCorpoSchema = PaperclipIncaricoCampiSchema.superRefine(validateCreation);
export type PaperclipIncaricoCorpo = z.infer<typeof PaperclipIncaricoCorpoSchema>;

/**
 * POST /api/issues/:id/children identifies the parent in the route, without parentId in the body.
 * Paperclip defaults blockParentUntilDone to false; callers waiting for the child must set true
 * explicitly (execution-semantics.md:247).
 */
export const PaperclipFiglioCreaCampiSchema = z.strictObject({
  ...CreationFields,
  acceptanceCriteria: z.array(z.string().trim().min(1).max(PAPERCLIP_CRITERIO_MAX)).max(PAPERCLIP_CRITERI_MASSIMI).optional(),
  blockParentUntilDone: z.boolean().optional(),
});
export const PaperclipFiglioCreaCorpoSchema = PaperclipFiglioCreaCampiSchema.superRefine(validateCreation);
export type PaperclipFiglioCreaCorpo = z.infer<typeof PaperclipFiglioCreaCorpoSchema>;

/** Paperclip rejects creation beyond 25 children per parent with 422 (services/issues.ts:9275-9279). */
export function paperclipFiglioAncoraAmmesso(figliEsistenti: number): boolean {
  return Number.isInteger(figliEsistenti) && figliEsistenti >= 0 && figliEsistenti < PAPERCLIP_FIGLI_MASSIMI_PER_PADRE;
}

/**
 * Lateral courier (execution-semantics.md:263-265): a new issue assigned to the destination agent by id.
 * Its description carries complete instructions because the recipient cannot see the sender's subtree.
 */
export const PaperclipCorriereCorpoSchema = z.strictObject({
  title: Title,
  description: z.string().trim().min(PAPERCLIP_CORRIERE_DESCRIZIONE_MIN).max(PAPERCLIP_DESCRIZIONE_MAX),
  assigneeAgentId: z.guid(),
  status: z.literal('todo').optional(),
  priority: PaperclipPrioritaSchema.optional(),
  projectId: z.guid().optional(),
  goalId: z.guid().nullable().optional(),
  idempotencyKey: CreationFields.idempotencyKey,
  allowDuplicate: CreationFields.allowDuplicate,
});
export type PaperclipCorriereCorpo = z.infer<typeof PaperclipCorriereCorpoSchema>;

// routes/issues.ts:11805-11817: 200 includes deduplicated and deduplicationReason; 201 omits them.
// The children route always responds with 201.
export const PaperclipCreazioneRispostaSchema = PaperclipIncaricoSchema.extend({
  deduplicated: z.literal(true).optional(),
  deduplicationReason: PaperclipDeduplicazioneMotivoSchema.optional(),
}).superRefine((value, ctx) => {
  if ((value.deduplicated === true) !== (value.deduplicationReason !== undefined)) {
    ctx.addIssue({
      code: 'custom',
      path: ['deduplicationReason'],
      message: 'deduplicated and deduplicationReason must be provided together',
    });
  }
});
export type PaperclipCreazioneRisposta = z.infer<typeof PaperclipCreazioneRispostaSchema>;

export type PaperclipEsitoCreazione =
  | { ok: true; nuovo: true; incarico: PaperclipCreazioneRisposta }
  | { ok: true; nuovo: false; motivo: PaperclipDeduplicazioneMotivo; incarico: PaperclipCreazioneRisposta }
  | { ok: false; motivo: 'stato_http_inatteso' | 'risposta_non_valida' | 'deduplica_incoerente' };

/** A 200 response identifies an existing issue, so the body alone cannot establish a new creation. */
export function paperclipEsitoCreazione(statoHttp: number, corpo: unknown): PaperclipEsitoCreazione {
  if (statoHttp !== 200 && statoHttp !== 201) return { ok: false, motivo: 'stato_http_inatteso' };
  const parsed = PaperclipCreazioneRispostaSchema.safeParse(corpo);
  if (!parsed.success) return { ok: false, motivo: 'risposta_non_valida' };
  const incarico = parsed.data;
  if (statoHttp === 201) {
    return incarico.deduplicated === true
      ? { ok: false, motivo: 'deduplica_incoerente' }
      : { ok: true, nuovo: true, incarico };
  }
  return incarico.deduplicationReason === undefined
    ? { ok: false, motivo: 'deduplica_incoerente' }
    : { ok: true, nuovo: false, motivo: incarico.deduplicationReason, incarico };
}
