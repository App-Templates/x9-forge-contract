"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalPaperclipOwnerActionContract = exports.InternalPaperclipOwnerActionOkSchema = exports.InternalPaperclipOwnerActionRequestSchema = exports.internalCompanyBoardActionContract = exports.OWNER_ACTION_FAILED_TEXT = exports.OwnerActionResultSchema = exports.OWNER_ACTION_HISTORY_KINDS = exports.OwnerActionErrorSchema = exports.OwnerActionErrorCodeSchema = exports.OWNER_ACTION_ERRORS = exports.OwnerActionRequestSchema = exports.OWNER_ACTION_TEXT_MAX = exports.OwnerActionKindSchema = exports.INTERNAL_PAPERCLIP_OWNER_ACTION_PATH = exports.INTERNAL_COMPANY_BOARD_ACTION_PATH = void 0;
exports.ownerActionHistoryText = ownerActionHistoryText;
exports.ownerActionConfirmation = ownerActionConfirmation;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../../agent/agent-identity.cjs");
const company_board_js_1 = require("../../organization/company-board.cjs");
/**
 * Owner actions on the company board (1.116.0): wake a department with a comment, give the go,
 * stop and resume the lead. All POST, internal secret only: the caller has already recognised the owner.
 */
exports.INTERNAL_COMPANY_BOARD_ACTION_PATH = '/internal/company-board/action';
exports.INTERNAL_PAPERCLIP_OWNER_ACTION_PATH = '/internal/paperclip/owner-action';
const TenantIdSchema = zod_1.z.string().min(1);
const OrganizationIdSchema = zod_1.z.string().min(1).max(64);
const ProjectIdSchema = zod_1.z.string().min(1).max(100);
const BuSlugSchema = zod_1.z.string().min(1).max(30).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const IsoSchema = zod_1.z.iso.datetime({ offset: true });
/** The kinds are the keys of the unit actions of the board: one list, never redeclared. */
exports.OwnerActionKindSchema = company_board_js_1.CompanyBoardUnitActionsSchema.keyof();
exports.OWNER_ACTION_TEXT_MAX = 4000;
const OwnerActionTextSchema = zod_1.z.string().min(1).max(exports.OWNER_ACTION_TEXT_MAX);
function textRule(a, ctx) {
    if (a.kind === 'sveglia' && a.text === undefined) {
        ctx.addIssue({ code: 'custom', path: ['text'], message: 'text is required for sveglia' });
    }
    if (a.kind !== 'sveglia' && a.text !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['text'], message: 'text is only allowed for sveglia' });
    }
}
exports.OwnerActionRequestSchema = zod_1.z.strictObject({
    tenantId: TenantIdSchema,
    ownerId: agent_identity_js_1.OwnerIdSchema,
    directorAgentId: agent_identity_js_1.AgentIdSchema,
    projectId: ProjectIdSchema,
    buSlug: BuSlugSchema,
    kind: exports.OwnerActionKindSchema,
    text: OwnerActionTextSchema.optional(),
    /** Makes the action repeatable: the same request twice gives the same answer. */
    clientRequestId: zod_1.z.uuid(),
}).superRefine(textRule);
exports.OWNER_ACTION_ERRORS = [
    'identity_uncertain', 'not_owner', 'not_director', 'actions_off', 'not_available',
    'owner_person_missing', 'paperclip_refused', 'source_unavailable', 'too_many',
];
exports.OwnerActionErrorCodeSchema = zod_1.z.enum(exports.OWNER_ACTION_ERRORS);
exports.OwnerActionErrorSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(false),
    error: exports.OwnerActionErrorCodeSchema,
    /** Why, from the bridge (e.g. the reason of `deriveUnitActions`). */
    reason: zod_1.z.string().nullable(),
});
/** History types already in the board: the shape of the board does not change. */
exports.OWNER_ACTION_HISTORY_KINDS = {
    sveglia: 'messaggio',
    via: 'approvazione',
    ferma: 'passo',
    riprendi: 'passo',
};
exports.OwnerActionResultSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(true),
    kind: exports.OwnerActionKindSchema,
    at: IsoSchema,
    confirmation: zod_1.z.string().min(1).max(500),
    historyEntry: company_board_js_1.CompanyBoardHistoryEntrySchema,
}).superRefine((r, ctx) => {
    if (r.historyEntry.kind !== exports.OWNER_ACTION_HISTORY_KINDS[r.kind]) {
        ctx.addIssue({ code: 'custom', path: ['historyEntry', 'kind'], message: `history kind for ${r.kind} must be ${exports.OWNER_ACTION_HISTORY_KINDS[r.kind]}` });
    }
    if (!r.historyEntry.mine) {
        ctx.addIssue({ code: 'custom', path: ['historyEntry', 'mine'], message: 'owner actions are always mine' });
    }
});
exports.OWNER_ACTION_FAILED_TEXT = 'Non è partito: il reparto non risponde. Riprova.';
const WAKE_PREVIEW_MAX = 80;
const OWNER_TIME_ZONE = 'Europe/Rome';
/** Sentence of the board without the time: the line of "Cosa è successo" (tavola `esegui`). */
function ownerActionHistoryText(kind, text) {
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
function ownerActionConfirmation(kind, at, text) {
    const time = new Intl.DateTimeFormat('it-IT', {
        timeZone: OWNER_TIME_ZONE, hour: 'numeric', minute: '2-digit', hourCycle: 'h23',
    }).format(new Date(at));
    return `Fatto alle ${time}. ${ownerActionHistoryText(kind, text)}`;
}
exports.internalCompanyBoardActionContract = {
    method: 'POST',
    path: exports.INTERNAL_COMPANY_BOARD_ACTION_PATH,
    authType: 'secret',
    bodySchema: exports.OwnerActionRequestSchema,
    responseSchema: zod_1.z.union([exports.OwnerActionResultSchema, exports.OwnerActionErrorSchema]),
};
exports.InternalPaperclipOwnerActionRequestSchema = zod_1.z.strictObject({
    tenantId: TenantIdSchema,
    organizationId: OrganizationIdSchema,
    ownerId: agent_identity_js_1.OwnerIdSchema,
    projectId: ProjectIdSchema,
    buSlug: BuSlugSchema,
    kind: exports.OwnerActionKindSchema,
    text: OwnerActionTextSchema.optional(),
    clientRequestId: zod_1.z.uuid(),
}).superRefine(textRule);
exports.InternalPaperclipOwnerActionOkSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(true),
    at: IsoSchema,
    issueIdentifier: zod_1.z.string().min(1).nullable(),
    runQueued: zod_1.z.boolean().nullable(),
    leadProjectCount: zod_1.z.number().int().min(0).nullable(),
});
exports.internalPaperclipOwnerActionContract = {
    method: 'POST',
    path: exports.INTERNAL_PAPERCLIP_OWNER_ACTION_PATH,
    authType: 'secret',
    bodySchema: exports.InternalPaperclipOwnerActionRequestSchema,
    responseSchema: zod_1.z.union([exports.InternalPaperclipOwnerActionOkSchema, exports.OwnerActionErrorSchema]),
};
//# sourceMappingURL=internal-company-board-actions.js.map