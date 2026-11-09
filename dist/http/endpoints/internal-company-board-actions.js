import { z } from 'zod';
import { AgentIdSchema, OwnerIdSchema } from "../../agent/agent-identity.js";
import { CompanyBoardHistoryEntrySchema, CompanyBoardUnitActionsSchema } from "../../organization/company-board.js";
/**
 * Owner actions on the company board (1.116.0): wake a department with a comment, give the go,
 * stop and resume the lead. All POST, internal secret only: the caller has already recognised the owner.
 */
export const INTERNAL_COMPANY_BOARD_ACTION_PATH = '/internal/company-board/action';
export const INTERNAL_PAPERCLIP_OWNER_ACTION_PATH = '/internal/paperclip/owner-action';
const TenantIdSchema = z.string().min(1);
const OrganizationIdSchema = z.string().min(1).max(64);
const ProjectIdSchema = z.string().min(1).max(100);
const BuSlugSchema = z.string().min(1).max(30).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const IsoSchema = z.iso.datetime({ offset: true });
/** The kinds are the keys of the unit actions of the board: one list, never redeclared. */
export const OwnerActionKindSchema = CompanyBoardUnitActionsSchema.keyof();
export const OWNER_ACTION_TEXT_MAX = 4000;
const OwnerActionTextSchema = z.string().min(1).max(OWNER_ACTION_TEXT_MAX);
function textRule(a, ctx) {
    if (a.kind === 'sveglia' && a.text === undefined) {
        ctx.addIssue({ code: 'custom', path: ['text'], message: 'text is required for sveglia' });
    }
    if (a.kind !== 'sveglia' && a.text !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['text'], message: 'text is only allowed for sveglia' });
    }
}
export const OwnerActionRequestSchema = z.strictObject({
    tenantId: TenantIdSchema,
    ownerId: OwnerIdSchema,
    directorAgentId: AgentIdSchema,
    projectId: ProjectIdSchema,
    buSlug: BuSlugSchema,
    kind: OwnerActionKindSchema,
    text: OwnerActionTextSchema.optional(),
    /** Makes the action repeatable: the same request twice gives the same answer. */
    clientRequestId: z.uuid(),
}).superRefine(textRule);
export const OWNER_ACTION_ERRORS = [
    'identity_uncertain', 'not_owner', 'not_director', 'actions_off', 'not_available',
    'owner_person_missing', 'paperclip_refused', 'source_unavailable', 'too_many',
];
export const OwnerActionErrorCodeSchema = z.enum(OWNER_ACTION_ERRORS);
export const OwnerActionErrorSchema = z.strictObject({
    ok: z.literal(false),
    error: OwnerActionErrorCodeSchema,
    /** Why, from the bridge (e.g. the reason of `deriveUnitActions`). */
    reason: z.string().nullable(),
});
/** History types already in the board: the shape of the board does not change. */
export const OWNER_ACTION_HISTORY_KINDS = {
    sveglia: 'messaggio',
    via: 'approvazione',
    ferma: 'passo',
    riprendi: 'passo',
};
export const OwnerActionResultSchema = z.strictObject({
    ok: z.literal(true),
    kind: OwnerActionKindSchema,
    at: IsoSchema,
    confirmation: z.string().min(1).max(500),
    historyEntry: CompanyBoardHistoryEntrySchema,
}).superRefine((r, ctx) => {
    if (r.historyEntry.kind !== OWNER_ACTION_HISTORY_KINDS[r.kind]) {
        ctx.addIssue({ code: 'custom', path: ['historyEntry', 'kind'], message: `history kind for ${r.kind} must be ${OWNER_ACTION_HISTORY_KINDS[r.kind]}` });
    }
    if (!r.historyEntry.mine) {
        ctx.addIssue({ code: 'custom', path: ['historyEntry', 'mine'], message: 'owner actions are always mine' });
    }
});
export const OWNER_ACTION_FAILED_TEXT = 'Non è partito: il reparto non risponde. Riprova.';
const WAKE_PREVIEW_MAX = 80;
const OWNER_TIME_ZONE = 'Europe/Rome';
/** Sentence of the board without the time: the line of "Cosa è successo" (tavola `esegui`). */
export function ownerActionHistoryText(kind, text) {
    switch (kind) {
        case 'sveglia': {
            const comment = text ?? '';
            const preview = comment.length > WAKE_PREVIEW_MAX ? `${comment.slice(0, WAKE_PREVIEW_MAX)}…` : comment;
            return `Hai svegliato il reparto: «${preview}».`;
        }
        case 'via':
            return 'Hai dato il via al reparto.';
        case 'ferma':
            return 'Hai fermato il capo del reparto. Non lavora, in nessun progetto, finché non lo riprendi.';
        case 'riprendi':
            return 'Hai ripreso il capo del reparto.';
    }
}
/** Confirmation sentences of the board (tavola §3.10); time in Rome. */
export function ownerActionConfirmation(kind, at, text) {
    const time = new Intl.DateTimeFormat('it-IT', {
        timeZone: OWNER_TIME_ZONE, hour: 'numeric', minute: '2-digit', hourCycle: 'h23',
    }).format(new Date(at));
    return `Fatto alle ${time}. ${ownerActionHistoryText(kind, text)}`;
}
export const internalCompanyBoardActionContract = {
    method: 'POST',
    path: INTERNAL_COMPANY_BOARD_ACTION_PATH,
    authType: 'secret',
    bodySchema: OwnerActionRequestSchema,
    responseSchema: z.union([OwnerActionResultSchema, OwnerActionErrorSchema]),
};
export const InternalPaperclipOwnerActionRequestSchema = z.strictObject({
    tenantId: TenantIdSchema,
    organizationId: OrganizationIdSchema,
    ownerId: OwnerIdSchema,
    projectId: ProjectIdSchema,
    buSlug: BuSlugSchema,
    kind: OwnerActionKindSchema,
    text: OwnerActionTextSchema.optional(),
    clientRequestId: z.uuid(),
}).superRefine(textRule);
export const InternalPaperclipOwnerActionOkSchema = z.strictObject({
    ok: z.literal(true),
    at: IsoSchema,
    issueIdentifier: z.string().min(1).nullable(),
    runQueued: z.boolean().nullable(),
    leadProjectCount: z.number().int().min(0).nullable(),
});
export const internalPaperclipOwnerActionContract = {
    method: 'POST',
    path: INTERNAL_PAPERCLIP_OWNER_ACTION_PATH,
    authType: 'secret',
    bodySchema: InternalPaperclipOwnerActionRequestSchema,
    responseSchema: z.union([InternalPaperclipOwnerActionOkSchema, OwnerActionErrorSchema]),
};
//# sourceMappingURL=internal-company-board-actions.js.map