"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferentReplyHandoverSchema = exports.DELIVERY_DECISION_DUPLICATE_CODES = exports.DecisionEmailReplySchema = exports.DECISION_REQUEST_HEADER = exports.DECISION_REQUEST_SUBJECT_LABEL = exports.DecisionOutcomeSchema = exports.REFERENT_WORDS_MAX = exports.DecisionRequestSchema = exports.DecisionSubjectSchema = exports.DeliveryDecisionSubjectSchema = exports.CompanyMapReferentChangeSchema = exports.ConfirmationSetDecisionSubjectSchema = exports.ActionPlanDecisionSubjectSchema = exports.DecisionSubjectKindSchema = exports.DECISION_SUBJECT_KINDS = exports.DecisionRequestOptionSchema = exports.DecisionOptionEffectSchema = exports.DECISION_OPTION_EFFECTS = exports.DecisionRequestIdSchema = exports.DecisionRequestChannelSchema = exports.DECISION_REQUEST_CHANNELS = exports.DELIVERY_DECISION_MAX_ASSET_VERSIONS = void 0;
exports.confirmationSetDigest = confirmationSetDigest;
exports.deliveryDecisionAssetVersions = deliveryDecisionAssetVersions;
exports.actionPlanPdfDeliveryProblems = actionPlanPdfDeliveryProblems;
exports.decisionOutcomeMatchesSubject = decisionOutcomeMatchesSubject;
exports.decisionRequestSubjectLabel = decisionRequestSubjectLabel;
exports.decisionRequestHeaderMatches = decisionRequestHeaderMatches;
exports.decisionOutcomeFromEmailReply = decisionOutcomeFromEmailReply;
exports.deliveryDecisionDuplicate = deliveryDecisionDuplicate;
exports.decisionOutcomeFromHandover = decisionOutcomeFromHandover;
const node_crypto_1 = require("node:crypto");
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const document_receipt_js_1 = require("../capability/document-receipt.cjs");
const asset_js_1 = require("./asset.cjs");
const participant_binding_js_1 = require("./participant-binding.cjs");
const company_map_js_1 = require("./company-map.cjs");
/** Bound the pieces covered by one referent reply to the delivery package limit. */
exports.DELIVERY_DECISION_MAX_ASSET_VERSIONS = 20;
/** Channels through which an agent asks the owner for a decision. */
exports.DECISION_REQUEST_CHANNELS = ['email', 'x9_conversation', 'forge_panel'];
exports.DecisionRequestChannelSchema = zod_1.z.enum(exports.DECISION_REQUEST_CHANNELS);
exports.DecisionRequestIdSchema = zod_1.z.string().regex(/^[A-Za-z0-9_-]{6,64}$/);
const OptionIdSchema = zod_1.z
    .string()
    .max(40)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
/** What choosing an option means; an option that does not approve is recorded as a rejection. */
exports.DECISION_OPTION_EFFECTS = ['approve', 'request_changes', 'reject'];
exports.DecisionOptionEffectSchema = zod_1.z.enum(exports.DECISION_OPTION_EFFECTS);
exports.DecisionRequestOptionSchema = zod_1.z.strictObject({
    optionId: OptionIdSchema,
    label: zod_1.z.string().min(1).max(200),
    detail: zod_1.z.string().min(1).max(2000).optional(),
    effect: exports.DecisionOptionEffectSchema.optional(),
}).refine((option) => option.effect === undefined || option.effect === 'approve' || option.label.length >= 3, {
    path: ['label'], message: 'An option that does not approve needs a label of at least 3 characters (it becomes the reason)',
});
/** What a decision is about: an exact plan version, confirmation set or immutable delivery. */
exports.DECISION_SUBJECT_KINDS = ['action_plan', 'vertical_plan', 'confirmation', 'delivery', 'confirmation_set'];
exports.DecisionSubjectKindSchema = zod_1.z.enum(exports.DECISION_SUBJECT_KINDS);
const PlanDecisionSubjectSchema = zod_1.z.strictObject({
    kind: exports.DecisionSubjectKindSchema.exclude(['action_plan', 'delivery', 'confirmation_set']),
    planId: exports.DecisionRequestIdSchema,
    planVersion: zod_1.z.number().int().min(1),
    digest: asset_js_1.AssetSha256Schema,
});
/** Optional only for historical reads; new email deliveries use the operational validator below. */
exports.ActionPlanDecisionSubjectSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('action_plan'),
    planId: exports.DecisionRequestIdSchema,
    planVersion: zod_1.z.number().int().min(1),
    digest: asset_js_1.AssetSha256Schema,
    documents: zod_1.z.tuple([
        zod_1.z.lazy(() => document_receipt_js_1.DocumentPdfReceiptSchema.refine((receipt) => receipt.role === 'action_plan', {
            message: 'First document must be the action plan',
        })),
        zod_1.z.lazy(() => document_receipt_js_1.DocumentPdfReceiptSchema.refine((receipt) => receipt.role === 'lab_dossier', {
            message: 'Second document must be the Lab dossier',
        })),
    ]).optional(),
});
// Defer map schemas because the map also uses decision request identifiers.
const ConfirmationSetEntrySchema = zod_1.z.lazy(() => company_map_js_1.CompanyMapConfirmTargetSchema.safeExtend({
    entryVersion: zod_1.z.number().int().min(1),
    entryDigest: asset_js_1.AssetSha256Schema,
}));
function confirmationSetEntryKey(entry) {
    return JSON.stringify([entry.level, entry.projectId ?? null, entry.buSlug ?? null, entry.kind, entry.entryRef]);
}
/** Hash fixed-order entry tuples sorted by their complete scope and identity key. */
function confirmationSetDigest(entries) {
    const ordered = entries.map((entry) => ({ key: confirmationSetEntryKey(entry), entry }))
        .sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
        .map(({ entry }) => [
        entry.level, entry.projectId ?? null, entry.buSlug ?? null, entry.kind, entry.entryRef,
        entry.entryVersion, entry.entryDigest,
    ]);
    return (0, node_crypto_1.createHash)('sha256').update(JSON.stringify(ordered)).digest('hex');
}
/** An immutable set keeps the plan columns used by existing decision stores. */
exports.ConfirmationSetDecisionSubjectSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('confirmation_set'),
    planId: exports.DecisionRequestIdSchema,
    planVersion: zod_1.z.literal(1),
    digest: asset_js_1.AssetSha256Schema,
    clientId: asset_js_1.AssetRefSchema.shape.companyId,
    entries: zod_1.z.array(ConfirmationSetEntrySchema).min(1).max(50),
}).superRefine((subject, ctx) => {
    if (new Set(subject.entries.map(confirmationSetEntryKey)).size !== subject.entries.length) {
        ctx.addIssue({ code: 'custom', path: ['entries'], message: 'Confirmation set entries must be unique' });
    }
    if (subject.digest !== confirmationSetDigest(subject.entries)) {
        ctx.addIssue({ code: 'custom', path: ['digest'], message: 'Confirmation set digest must match its entries' });
    }
    if (subject.planId !== 'mapset-' + subject.digest.slice(0, 40)) {
        ctx.addIssue({ code: 'custom', path: ['planId'], message: 'Confirmation set planId must match its digest' });
    }
});
/** A replacement proposed in the owner's confirmation reply, with the plan proposal fields. */
exports.CompanyMapReferentChangeSchema = zod_1.z.lazy(() => zod_1.z.strictObject({
    ...company_map_js_1.CompanyMapReferentFieldsSchema.omit({ kind: true }).shape,
    level: company_map_js_1.CompanyMapLevelSchema,
    buSlug: company_map_js_1.CompanyMapScopeFieldsSchema.shape.buSlug,
    replaces: company_map_js_1.CompanyMapReferentFieldsSchema.shape.personRef.optional(),
}).refine((change) => (change.level === 'business_unit') === (change.buSlug !== undefined), {
    message: 'buSlug is required at business_unit level and only allowed there', path: ['buSlug'],
}));
/** The consumer must resolve this saved asset to immutable content, never a moving branch or generic URL. */
exports.DeliveryDecisionSubjectSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('delivery'),
    organizationId: zod_1.z.string().min(1).max(64),
    projectId: asset_js_1.AssetRefSchema.shape.projectId,
    buSlug: asset_js_1.AssetRefSchema.shape.buSlug.unwrap(),
    deliveryRef: zod_1.z.strictObject({
        assetId: asset_js_1.AssetRefSchema.shape.assetId,
        sha256: asset_js_1.AssetSha256Schema,
    }),
    assetVersion: asset_js_1.AssetVersionRefSchema.optional(),
    assetVersions: zod_1.z.array(asset_js_1.AssetVersionRefSchema).min(2).max(exports.DELIVERY_DECISION_MAX_ASSET_VERSIONS).optional(),
}).superRefine((subject, ctx) => {
    // Keep one canonical representation so a reply cannot bind conflicting versions of a piece.
    if (subject.assetVersion !== undefined && subject.assetVersions !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['assetVersions'], message: 'assetVersion and assetVersions are mutually exclusive' });
    }
    if (subject.assetVersions !== undefined
        && new Set(subject.assetVersions.map((ref) => ref.key)).size !== subject.assetVersions.length) {
        ctx.addIssue({ code: 'custom', path: ['assetVersions'], message: 'Each piece may appear only once' });
    }
});
/** Normalize explicit versions without adding fields to legacy subjects bound only to a package. */
function deliveryDecisionAssetVersions(subject) {
    if (subject.assetVersions !== undefined)
        return subject.assetVersions;
    if (subject.assetVersion !== undefined) {
        return [subject.assetVersion];
    }
    return [];
}
function versionsKey(subject) {
    // Reply order carries no meaning; compare the complete immutable set without mutating the subject.
    return JSON.stringify(deliveryDecisionAssetVersions(subject)
        .map((ref) => [ref.key, ref.version])
        .sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}
exports.DecisionSubjectSchema = zod_1.z.discriminatedUnion('kind', [
    exports.ActionPlanDecisionSubjectSchema,
    PlanDecisionSubjectSchema,
    exports.DeliveryDecisionSubjectSchema,
    exports.ConfirmationSetDecisionSubjectSchema,
]);
const ReferentSchema = zod_1.z.strictObject({ kind: zod_1.z.literal('referent'), email: zod_1.z.email() });
/** Open question an agent puts to the owner or delivery referent, with the options to choose from. */
exports.DecisionRequestSchema = zod_1.z.strictObject({
    requestId: exports.DecisionRequestIdSchema,
    tenantId: zod_1.z.string().min(1),
    organizationId: zod_1.z.string().min(1).max(64),
    projectId: zod_1.z.string().min(1).max(64).optional(),
    subject: exports.DecisionSubjectSchema.optional(),
    question: zod_1.z.string().min(1).max(4000),
    options: zod_1.z
        .array(exports.DecisionRequestOptionSchema)
        .min(1)
        .max(10)
        .refine((options) => new Set(options.map((o) => o.optionId)).size === options.length, {
        message: 'optionId must be unique within a request',
    }),
    requestedBy: participant_binding_js_1.ParticipantAgentIdentitySchema,
    addressedTo: zod_1.z.union([zod_1.z.strictObject({ ownerId: agent_identity_js_1.OwnerIdSchema }), ReferentSchema]),
    channel: exports.DecisionRequestChannelSchema,
    createdAt: zod_1.z.iso.datetime({ offset: true }),
}).superRefine((request, ctx) => {
    const effects = request.options.map((option) => option.effect);
    if (effects.some((effect) => effect !== undefined)) {
        if (effects.some((effect) => effect === undefined)) {
            ctx.addIssue({ code: 'custom', path: ['options'], message: 'When one option declares an effect, all must' });
        }
        if (!effects.includes('approve')) {
            ctx.addIssue({ code: 'custom', path: ['options'], message: 'Options that declare effects need at least one approve' });
        }
        if (request.subject?.kind === 'confirmation_set') {
            ctx.addIssue({ code: 'custom', path: ['options'], message: 'A confirmation set does not declare option effects' });
        }
    }
    if (request.subject?.kind === 'delivery') {
        if (!('kind' in request.addressedTo)) {
            ctx.addIssue({ code: 'custom', path: ['addressedTo'], message: 'Delivery requires a referent' });
        }
        if (request.channel !== 'email') {
            ctx.addIssue({ code: 'custom', path: ['channel'], message: 'Delivery requires email' });
        }
        if (request.organizationId !== request.subject.organizationId) {
            ctx.addIssue({ code: 'custom', path: ['subject', 'organizationId'], message: 'Delivery organization must match the request' });
        }
        if (request.projectId !== request.subject.projectId) {
            ctx.addIssue({ code: 'custom', path: ['subject', 'projectId'], message: 'Delivery project must match the request' });
        }
    }
    else if (!('ownerId' in request.addressedTo)) {
        ctx.addIssue({ code: 'custom', path: ['addressedTo'], message: 'A plan or unbound request requires the owner' });
    }
});
/**
 * Complete pre-send checks. renderedDocuments must come from the authenticated rendering service after
 * reading back the bytes, never from a model/tool argument. Schema validation alone cannot attest provenance.
 * Historical parsing deliberately does not call this validator or add receipts to saved decisions.
 */
function actionPlanPdfDeliveryProblems(request, renderedDocuments = []) {
    if (request.subject?.kind !== 'action_plan')
        return [];
    const parsed = exports.DecisionRequestSchema.safeParse(request);
    if (!parsed.success)
        return ['invalid_pdf_decision'];
    const subject = parsed.data.subject;
    if (subject?.kind !== 'action_plan')
        return [];
    if (subject.documents === undefined)
        return ['missing_pdf_documents'];
    const [plan, dossier] = subject.documents;
    const problems = [];
    const distinctPdf = plan.asset.sha256 !== dossier.asset.sha256;
    if (!distinctPdf)
        problems.push('pdf_bytes_must_differ');
    if (plan.asset.assetId === dossier.asset.assetId)
        problems.push('pdf_assets_must_differ');
    for (const receipt of subject.documents) {
        if (receipt.tenantId !== request.tenantId || receipt.organizationId !== request.organizationId
            || receipt.projectId !== request.projectId || receipt.clientId !== plan.clientId) {
            problems.push('pdf_identity_mismatch');
        }
    }
    if (plan.source.kind !== 'action_plan' || plan.source.planId !== subject.planId
        || plan.source.version !== subject.planVersion || plan.source.digest !== subject.digest) {
        problems.push('pdf_plan_source_mismatch');
    }
    const a = plan.deliveryContext;
    const b = dossier.deliveryContext;
    if (a === undefined || b === undefined || a.planId !== b.planId || a.planVersion !== b.planVersion
        || a.planDigest !== b.planDigest || a.dossierSnapshotId !== b.dossierSnapshotId
        || a.dossierDigest !== b.dossierDigest) {
        problems.push('pdf_delivery_context_mismatch');
    }
    const attested = renderedDocuments.map((receipt) => document_receipt_js_1.DocumentPdfReceiptSchema.safeParse(receipt));
    for (const receipt of subject.documents) {
        if (!attested.some((result) => result.success && JSON.stringify(result.data) === JSON.stringify(receipt))) {
            problems.push('pdf_renderer_receipt_not_attested');
        }
    }
    return problems;
}
/** Same cap as the interpreted refusal reason: the referent's own words are trimmed to it by the consumer. */
exports.REFERENT_WORDS_MAX = 2000;
const outcomeBase = {
    requestId: exports.DecisionRequestIdSchema,
    decidedBy: zod_1.z.union([zod_1.z.strictObject({ kind: zod_1.z.literal('owner'), ownerId: agent_identity_js_1.OwnerIdSchema }), ReferentSchema]),
    decidedAt: zod_1.z.iso.datetime({ offset: true }),
    channel: exports.DecisionRequestChannelSchema,
    sourceRef: zod_1.z.string().min(1).max(512),
    subject: exports.DecisionSubjectSchema.optional(),
    // The referent's real words, kept next to `reason` (which stays the option label or the lead's text) so existing readers see the same outcome.
    referentWords: zod_1.z.string().min(1).max(exports.REFERENT_WORDS_MAX).optional(),
};
/** Recorded human answer to a decision request. */
exports.DecisionOutcomeSchema = zod_1.z.discriminatedUnion('outcome', [
    zod_1.z.strictObject({
        ...outcomeBase, outcome: zod_1.z.literal('approved'), optionId: OptionIdSchema,
        referentChanges: zod_1.z.array(exports.CompanyMapReferentChangeSchema).max(20).optional(),
        // The reservation of "approve, but...": it lives inside the referent's words.
        note: zod_1.z.string().min(3).max(exports.REFERENT_WORDS_MAX).optional(),
    }),
    zod_1.z.strictObject({ ...outcomeBase, outcome: zod_1.z.literal('rejected'), reason: zod_1.z.string().min(3).max(2000) }),
]).superRefine((outcome, ctx) => {
    if (outcome.outcome === 'approved') {
        if (outcome.subject?.kind === 'confirmation_set' && outcome.optionId !== 'confermo') {
            ctx.addIssue({ code: 'custom', path: ['optionId'], message: 'A confirmation set can only be approved with confermo' });
        }
        if (outcome.referentChanges !== undefined
            && (outcome.subject?.kind !== 'confirmation_set' || outcome.optionId !== 'confermo')) {
            ctx.addIssue({ code: 'custom', path: ['referentChanges'], message: 'Referent changes require a confirmed confirmation set' });
        }
    }
    // The answerer's words and note are valid for every subject; only a note without words is refused.
    if (outcome.outcome === 'approved') {
        if (outcome.note !== undefined && outcome.referentWords === undefined) {
            ctx.addIssue({ code: 'custom', path: ['note'], message: 'A note must sit inside the referent words' });
        }
    }
    if (outcome.subject?.kind === 'delivery') {
        if (outcome.decidedBy.kind !== 'referent') {
            ctx.addIssue({ code: 'custom', path: ['decidedBy'], message: 'Delivery requires a referent decision' });
        }
        if (outcome.channel !== 'email') {
            ctx.addIssue({ code: 'custom', path: ['channel'], message: 'Delivery requires email' });
        }
        if (outcome.sourceRef.trim().length === 0) {
            ctx.addIssue({ code: 'custom', path: ['sourceRef'], message: 'Delivery requires a nonblank message receipt' });
        }
    }
    else if (outcome.decidedBy.kind !== 'owner') {
        ctx.addIssue({ code: 'custom', path: ['decidedBy'], message: 'A plan or unbound outcome requires the owner' });
    }
});
/** True when the outcome decides the same exact subject (or neither names one). */
function decisionOutcomeMatchesSubject(request, outcome) {
    const a = request.subject;
    const b = outcome.subject;
    if (a === undefined && b === undefined)
        return true;
    if (a === undefined || b === undefined)
        return false;
    if (a.kind === 'delivery' || b.kind === 'delivery') {
        return a.kind === 'delivery' && b.kind === 'delivery'
            && a.organizationId === b.organizationId && a.projectId === b.projectId && a.buSlug === b.buSlug
            && a.deliveryRef.assetId === b.deliveryRef.assetId && a.deliveryRef.sha256 === b.deliveryRef.sha256
            && versionsKey(a) === versionsKey(b);
    }
    return a.kind === b.kind && a.planId === b.planId && a.planVersion === b.planVersion && a.digest === b.digest;
}
/** Word used in the email subject to tie a reply to its decision request: `[decisione <requestId>]`. */
exports.DECISION_REQUEST_SUBJECT_LABEL = 'decisione';
function decisionRequestSubjectLabel(requestId) {
    return `[${exports.DECISION_REQUEST_SUBJECT_LABEL} ${requestId}]`;
}
/** Header of the outgoing email that carries the `requestId`; the referent's reply is matched to the original message that carries it. */
exports.DECISION_REQUEST_HEADER = 'X-X9-Decision-Request';
/** True when the headers (name matched case-insensitively) carry exactly this `requestId` (value trimmed). */
function decisionRequestHeaderMatches(headers, requestId) {
    if (headers === undefined)
        return false;
    const wanted = exports.DECISION_REQUEST_HEADER.toLowerCase();
    for (const [name, value] of Object.entries(headers)) {
        if (name.toLowerCase() === wanted && value.trim() === requestId)
            return true;
    }
    return false;
}
/** Human email reply already interpreted by the lead (approve / refuse with reason / unclear). */
exports.DecisionEmailReplySchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({
        kind: zod_1.z.literal('approve'), requestId: exports.DecisionRequestIdSchema, optionId: OptionIdSchema.optional(),
        referentChanges: zod_1.z.array(exports.CompanyMapReferentChangeSchema).max(20).optional(),
        referentWords: outcomeBase.referentWords,
        note: zod_1.z.string().min(3).max(exports.REFERENT_WORDS_MAX).optional(),
    }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('refuse'), requestId: exports.DecisionRequestIdSchema, reason: zod_1.z.string().min(3).max(2000),
        referentWords: outcomeBase.referentWords,
    }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('unclear'),
        requestId: exports.DecisionRequestIdSchema,
        why: zod_1.z.enum(['missing_reason', 'no_decision', 'both']),
    }),
]);
/** Records an already interpreted reply; the consumer verifies the BU's authorized referent. */
function decisionOutcomeFromEmailReply(input) {
    const { request, reply, from, receivedAt, messageId } = input;
    if (reply.requestId !== request.requestId)
        return { ok: false, code: 'mismatch' };
    const delivery = request.subject?.kind === 'delivery';
    const confirmationSet = request.subject?.kind === 'confirmation_set';
    if (reply.kind === 'approve' && reply.referentChanges !== undefined && !confirmationSet) {
        return { ok: false, code: 'referent_changes_not_allowed' };
    }
    // Words and note are valid for every subject; a note must sit inside the words.
    if (reply.kind === 'approve' && reply.note !== undefined && reply.referentWords === undefined) {
        return { ok: false, code: 'note_without_words' };
    }
    if (delivery) {
        if (!('email' in from) || !('email' in request.addressedTo)
            || from.email.trim().toLowerCase() !== request.addressedTo.email.trim().toLowerCase()) {
            return { ok: false, code: 'not_addressee' };
        }
    }
    else if (!('ownerId' in from) || !('ownerId' in request.addressedTo)
        || from.ownerId !== request.addressedTo.ownerId) {
        return { ok: false, code: 'not_addressee' };
    }
    if (Date.parse(receivedAt) < Date.parse(request.createdAt))
        return { ok: false, code: 'before_request' };
    if (reply.kind === 'unclear')
        return { ok: false, code: 'unclear' };
    const base = {
        requestId: request.requestId,
        decidedBy: 'email' in request.addressedTo
            ? { kind: 'referent', email: request.addressedTo.email }
            : { kind: 'owner', ownerId: request.addressedTo.ownerId },
        decidedAt: receivedAt,
        channel: 'email',
        sourceRef: messageId,
        ...(delivery || confirmationSet ? { subject: request.subject } : {}),
    };
    // The words are one more field: `reason` keeps today's value for every consumer.
    const words = reply.referentWords !== undefined ? { referentWords: reply.referentWords } : {};
    if (reply.kind === 'refuse') {
        return { ok: true, outcome: exports.DecisionOutcomeSchema.parse({ ...base, ...words, outcome: 'rejected', reason: reply.reason }) };
    }
    let optionId = reply.optionId;
    if (optionId === undefined) {
        if (request.options.length !== 1)
            return { ok: false, code: 'option_required' };
        optionId = request.options[0].optionId;
    }
    const option = request.options.find((o) => o.optionId === optionId);
    if (option === undefined)
        return { ok: false, code: 'unknown_option' };
    if (confirmationSet && optionId !== 'confermo') {
        return { ok: true, outcome: exports.DecisionOutcomeSchema.parse({ ...base, ...words, outcome: 'rejected', reason: option.label }) };
    }
    if (option.effect === 'request_changes' || option.effect === 'reject') {
        return { ok: true, outcome: exports.DecisionOutcomeSchema.parse({ ...base, ...words, outcome: 'rejected', reason: option.label }) };
    }
    return { ok: true, outcome: exports.DecisionOutcomeSchema.parse({
            ...base, ...words, outcome: 'approved', optionId,
            ...(reply.note !== undefined ? { note: reply.note } : {}),
            ...(reply.referentChanges !== undefined ? { referentChanges: reply.referentChanges } : {}),
        }) };
}
/** Why a new delivery decision request is refused: the same piece already has one open or approved. */
exports.DELIVERY_DECISION_DUPLICATE_CODES = ['decision_already_pending', 'decision_already_approved'];
// Same ordering as `isLaterDecisionRequest` (asset-version imports this module, so it cannot be imported here).
function isOlderRequest(a, b) {
    const delta = Date.parse(a.createdAt) - Date.parse(b.createdAt);
    return delta !== 0 ? delta < 0 : a.requestId < b.requestId;
}
function sameDeliveryPiece(a, b) {
    const mine = deliveryDecisionAssetVersions(a);
    const theirs = deliveryDecisionAssetVersions(b);
    if (mine.length > 0 && theirs.length > 0) {
        // Any shared version is already covered, including a single piece of a pending whole redo.
        return mine.some((ref) => theirs.some((other) => ref.key === other.key && ref.version === other.version));
    }
    return a.deliveryRef.assetId === b.deliveryRef.assetId && a.deliveryRef.sha256 === b.deliveryRef.sha256;
}
function deliveryDecisionState(request, outcome) {
    if (outcome === null || outcome.requestId !== request.requestId)
        return 'pending';
    if (outcome.outcome === 'rejected')
        return 'rejected';
    if (outcome.decidedBy.kind !== 'referent' || !decisionOutcomeMatchesSubject(request, outcome))
        return 'pending';
    return 'approved';
}
/**
 * Names the oldest existing request that makes `candidate` a duplicate, or null. A rejected request
 * does not block a new one; plans and confirmation sets never pass through here.
 * Missing, unrelated or unsound outcomes stay pending, matching the twin rule in `assetVersionDecisionState`.
 */
function deliveryDecisionDuplicate(candidate, existing) {
    const wanted = candidate.subject;
    if (wanted?.kind !== 'delivery')
        return null;
    let found;
    for (const { request, outcome } of existing) {
        const subject = request.subject;
        if (subject?.kind !== 'delivery' || request.requestId === candidate.requestId)
            continue;
        if (request.tenantId !== candidate.tenantId || request.organizationId !== candidate.organizationId
            || request.projectId !== candidate.projectId || subject.buSlug !== wanted.buSlug)
            continue;
        if (!sameDeliveryPiece(wanted, subject))
            continue;
        const state = deliveryDecisionState(request, outcome);
        if (state === 'rejected')
            continue;
        const code = state === 'pending' ? 'decision_already_pending' : 'decision_already_approved';
        if (found === undefined || isOlderRequest(request, found.request))
            found = { request, code };
    }
    return found === undefined ? null : { code: found.code, requestId: found.request.requestId };
}
/** The referent's reply as handed to the unit: carries the text and a message the service can re-read from `receivedBy`. */
exports.ReferentReplyHandoverSchema = zod_1.z.strictObject({
    tenantId: zod_1.z.string().min(1),
    organizationId: zod_1.z.string().min(1).max(64),
    projectId: zod_1.z.string().min(1).max(64),
    toBuSlug: asset_js_1.AssetRefSchema.shape.buSlug.unwrap(),
    receivedBy: participant_binding_js_1.ParticipantAgentIdentitySchema,
    referent: ReferentSchema,
    messageId: zod_1.z.string().min(1).max(998),
    receivedAt: zod_1.z.iso.datetime({ offset: true }),
    text: zod_1.z.string().min(1).max(4000),
    requestId: exports.DecisionRequestIdSchema.optional(),
});
/** First scope or request difference between a handover and its request, in a fixed order; undefined when they agree. */
function handoverRejection(request, handover) {
    const subject = request.subject;
    if (handover.requestId === undefined)
        return 'handover_request_missing';
    if (handover.requestId !== request.requestId)
        return 'mismatch';
    if (handover.tenantId !== request.tenantId)
        return 'handover_tenant_mismatch';
    if (handover.organizationId !== request.organizationId)
        return 'handover_organization_mismatch';
    if (handover.projectId !== request.projectId)
        return 'handover_project_mismatch';
    if (subject?.kind !== 'delivery')
        return 'handover_subject_not_delivery';
    if (handover.toBuSlug !== subject.buSlug)
        return 'handover_bu_mismatch';
    return undefined;
}
/** Records an interpreted reply from a handover; scope and request must match, the rest is `decisionOutcomeFromEmailReply`. */
function decisionOutcomeFromHandover(input) {
    const { request, reply, handover } = input;
    const handoverCode = handoverRejection(request, handover);
    if (handoverCode !== undefined)
        return { ok: false, code: handoverCode };
    return decisionOutcomeFromEmailReply({
        request, reply, from: { email: handover.referent.email },
        receivedAt: handover.receivedAt, messageId: handover.messageId,
    });
}
//# sourceMappingURL=decision-request.js.map