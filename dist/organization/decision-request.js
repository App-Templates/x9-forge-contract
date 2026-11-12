import { createHash } from 'node:crypto';
import { z } from 'zod';
import { OwnerIdSchema } from "../agent/agent-identity.js";
import { AssetRefSchema, AssetSha256Schema, AssetVersionRefSchema } from "./asset.js";
import { ParticipantAgentIdentitySchema } from "./participant-binding.js";
import { CompanyMapConfirmTargetSchema, CompanyMapLevelSchema, CompanyMapReferentFieldsSchema, CompanyMapScopeFieldsSchema, } from "./company-map.js";
/** Channels through which an agent asks the owner for a decision. */
export const DECISION_REQUEST_CHANNELS = ['email', 'x9_conversation', 'forge_panel'];
export const DecisionRequestChannelSchema = z.enum(DECISION_REQUEST_CHANNELS);
export const DecisionRequestIdSchema = z.string().regex(/^[A-Za-z0-9_-]{6,64}$/);
const OptionIdSchema = z
    .string()
    .max(40)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
/** What choosing an option means; an option that does not approve is recorded as a rejection. */
export const DECISION_OPTION_EFFECTS = ['approve', 'request_changes', 'reject'];
export const DecisionOptionEffectSchema = z.enum(DECISION_OPTION_EFFECTS);
export const DecisionRequestOptionSchema = z.strictObject({
    optionId: OptionIdSchema,
    label: z.string().min(1).max(200),
    detail: z.string().min(1).max(2000).optional(),
    effect: DecisionOptionEffectSchema.optional(),
}).refine((option) => option.effect === undefined || option.effect === 'approve' || option.label.length >= 3, {
    path: ['label'], message: 'An option that does not approve needs a label of at least 3 characters (it becomes the reason)',
});
/** What a decision is about: an exact plan version, confirmation set or immutable delivery. */
export const DECISION_SUBJECT_KINDS = ['action_plan', 'vertical_plan', 'confirmation', 'delivery', 'confirmation_set'];
export const DecisionSubjectKindSchema = z.enum(DECISION_SUBJECT_KINDS);
const PlanDecisionSubjectSchema = z.strictObject({
    kind: DecisionSubjectKindSchema.exclude(['delivery', 'confirmation_set']),
    planId: DecisionRequestIdSchema,
    planVersion: z.number().int().min(1),
    digest: AssetSha256Schema,
});
// Defer map schemas because the map also uses decision request identifiers.
const ConfirmationSetEntrySchema = z.lazy(() => CompanyMapConfirmTargetSchema.safeExtend({
    entryVersion: z.number().int().min(1),
    entryDigest: AssetSha256Schema,
}));
function confirmationSetEntryKey(entry) {
    return JSON.stringify([entry.level, entry.projectId ?? null, entry.buSlug ?? null, entry.kind, entry.entryRef]);
}
/** Hash fixed-order entry tuples sorted by their complete scope and identity key. */
export function confirmationSetDigest(entries) {
    const ordered = entries.map((entry) => ({ key: confirmationSetEntryKey(entry), entry }))
        .sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
        .map(({ entry }) => [
        entry.level, entry.projectId ?? null, entry.buSlug ?? null, entry.kind, entry.entryRef,
        entry.entryVersion, entry.entryDigest,
    ]);
    return createHash('sha256').update(JSON.stringify(ordered)).digest('hex');
}
/** An immutable set keeps the plan columns used by existing decision stores. */
export const ConfirmationSetDecisionSubjectSchema = z.strictObject({
    kind: z.literal('confirmation_set'),
    planId: DecisionRequestIdSchema,
    planVersion: z.literal(1),
    digest: AssetSha256Schema,
    clientId: AssetRefSchema.shape.companyId,
    entries: z.array(ConfirmationSetEntrySchema).min(1).max(50),
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
export const CompanyMapReferentChangeSchema = z.lazy(() => z.strictObject({
    ...CompanyMapReferentFieldsSchema.omit({ kind: true }).shape,
    level: CompanyMapLevelSchema,
    buSlug: CompanyMapScopeFieldsSchema.shape.buSlug,
    replaces: CompanyMapReferentFieldsSchema.shape.personRef.optional(),
}).refine((change) => (change.level === 'business_unit') === (change.buSlug !== undefined), {
    message: 'buSlug is required at business_unit level and only allowed there', path: ['buSlug'],
}));
/** The consumer must resolve this saved asset to immutable content, never a moving branch or generic URL. */
export const DeliveryDecisionSubjectSchema = z.strictObject({
    kind: z.literal('delivery'),
    organizationId: z.string().min(1).max(64),
    projectId: AssetRefSchema.shape.projectId,
    buSlug: AssetRefSchema.shape.buSlug.unwrap(),
    deliveryRef: z.strictObject({
        assetId: AssetRefSchema.shape.assetId,
        sha256: AssetSha256Schema,
    }),
    assetVersion: AssetVersionRefSchema.optional(),
});
export const DecisionSubjectSchema = z.discriminatedUnion('kind', [
    PlanDecisionSubjectSchema,
    DeliveryDecisionSubjectSchema,
    ConfirmationSetDecisionSubjectSchema,
]);
const ReferentSchema = z.strictObject({ kind: z.literal('referent'), email: z.email() });
/** Open question an agent puts to the owner or delivery referent, with the options to choose from. */
export const DecisionRequestSchema = z.strictObject({
    requestId: DecisionRequestIdSchema,
    tenantId: z.string().min(1),
    organizationId: z.string().min(1).max(64),
    projectId: z.string().min(1).max(64).optional(),
    subject: DecisionSubjectSchema.optional(),
    question: z.string().min(1).max(4000),
    options: z
        .array(DecisionRequestOptionSchema)
        .min(1)
        .max(10)
        .refine((options) => new Set(options.map((o) => o.optionId)).size === options.length, {
        message: 'optionId must be unique within a request',
    }),
    requestedBy: ParticipantAgentIdentitySchema,
    addressedTo: z.union([z.strictObject({ ownerId: OwnerIdSchema }), ReferentSchema]),
    channel: DecisionRequestChannelSchema,
    createdAt: z.iso.datetime({ offset: true }),
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
const outcomeBase = {
    requestId: DecisionRequestIdSchema,
    decidedBy: z.union([z.strictObject({ kind: z.literal('owner'), ownerId: OwnerIdSchema }), ReferentSchema]),
    decidedAt: z.iso.datetime({ offset: true }),
    channel: DecisionRequestChannelSchema,
    sourceRef: z.string().min(1).max(512),
    subject: DecisionSubjectSchema.optional(),
};
/** Recorded human answer to a decision request. */
export const DecisionOutcomeSchema = z.discriminatedUnion('outcome', [
    z.strictObject({
        ...outcomeBase, outcome: z.literal('approved'), optionId: OptionIdSchema,
        referentChanges: z.array(CompanyMapReferentChangeSchema).max(20).optional(),
    }),
    z.strictObject({ ...outcomeBase, outcome: z.literal('rejected'), reason: z.string().min(3).max(2000) }),
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
export function decisionOutcomeMatchesSubject(request, outcome) {
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
            && a.assetVersion?.key === b.assetVersion?.key && a.assetVersion?.version === b.assetVersion?.version;
    }
    return a.kind === b.kind && a.planId === b.planId && a.planVersion === b.planVersion && a.digest === b.digest;
}
/** Word used in the email subject to tie a reply to its decision request: `[decisione <requestId>]`. */
export const DECISION_REQUEST_SUBJECT_LABEL = 'decisione';
export function decisionRequestSubjectLabel(requestId) {
    return `[${DECISION_REQUEST_SUBJECT_LABEL} ${requestId}]`;
}
/** Header of the outgoing email that carries the `requestId`; the referent's reply is matched to the original message that carries it. */
export const DECISION_REQUEST_HEADER = 'X-X9-Decision-Request';
/** True when the headers (name matched case-insensitively) carry exactly this `requestId` (value trimmed). */
export function decisionRequestHeaderMatches(headers, requestId) {
    if (headers === undefined)
        return false;
    const wanted = DECISION_REQUEST_HEADER.toLowerCase();
    for (const [name, value] of Object.entries(headers)) {
        if (name.toLowerCase() === wanted && value.trim() === requestId)
            return true;
    }
    return false;
}
/** Human email reply already interpreted by the lead (approve / refuse with reason / unclear). */
export const DecisionEmailReplySchema = z.discriminatedUnion('kind', [
    z.strictObject({
        kind: z.literal('approve'), requestId: DecisionRequestIdSchema, optionId: OptionIdSchema.optional(),
        referentChanges: z.array(CompanyMapReferentChangeSchema).max(20).optional(),
    }),
    z.strictObject({ kind: z.literal('refuse'), requestId: DecisionRequestIdSchema, reason: z.string().min(3).max(2000) }),
    z.strictObject({
        kind: z.literal('unclear'),
        requestId: DecisionRequestIdSchema,
        why: z.enum(['missing_reason', 'no_decision', 'both']),
    }),
]);
/** Records an already interpreted reply; the consumer verifies the BU's authorized referent. */
export function decisionOutcomeFromEmailReply(input) {
    const { request, reply, from, receivedAt, messageId } = input;
    if (reply.requestId !== request.requestId)
        return { ok: false, code: 'mismatch' };
    const delivery = request.subject?.kind === 'delivery';
    const confirmationSet = request.subject?.kind === 'confirmation_set';
    if (reply.kind === 'approve' && reply.referentChanges !== undefined && !confirmationSet) {
        return { ok: false, code: 'mismatch' };
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
    if (reply.kind === 'refuse') {
        return { ok: true, outcome: DecisionOutcomeSchema.parse({ ...base, outcome: 'rejected', reason: reply.reason }) };
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
        return { ok: true, outcome: DecisionOutcomeSchema.parse({ ...base, outcome: 'rejected', reason: option.label }) };
    }
    if (option.effect === 'request_changes' || option.effect === 'reject') {
        return { ok: true, outcome: DecisionOutcomeSchema.parse({ ...base, outcome: 'rejected', reason: option.label }) };
    }
    return { ok: true, outcome: DecisionOutcomeSchema.parse({
            ...base, outcome: 'approved', optionId,
            ...(reply.referentChanges !== undefined ? { referentChanges: reply.referentChanges } : {}),
        }) };
}
/** Why a new delivery decision request is refused: the same piece already has one open or approved. */
export const DELIVERY_DECISION_DUPLICATE_CODES = ['decision_already_pending', 'decision_already_approved'];
// Same ordering as `isLaterDecisionRequest` (asset-version imports this module, so it cannot be imported here).
function isOlderRequest(a, b) {
    const delta = Date.parse(a.createdAt) - Date.parse(b.createdAt);
    return delta !== 0 ? delta < 0 : a.requestId < b.requestId;
}
function sameDeliveryPiece(a, b) {
    if (a.assetVersion !== undefined && b.assetVersion !== undefined) {
        return a.assetVersion.key === b.assetVersion.key && a.assetVersion.version === b.assetVersion.version;
    }
    return a.deliveryRef.assetId === b.deliveryRef.assetId && a.deliveryRef.sha256 === b.deliveryRef.sha256;
}
/**
 * Names the oldest existing request that makes `candidate` a duplicate, or null. A rejected request
 * does not block a new one; plans and confirmation sets never pass through here.
 */
export function deliveryDecisionDuplicate(candidate, existing) {
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
        if (outcome !== null && outcome.requestId !== request.requestId)
            continue;
        if (outcome?.outcome === 'rejected')
            continue;
        const code = outcome === null ? 'decision_already_pending' : 'decision_already_approved';
        if (found === undefined || isOlderRequest(request, found.request))
            found = { request, code };
    }
    return found === undefined ? null : { code: found.code, requestId: found.request.requestId };
}
/** The referent's reply as handed to the unit: carries the text and a message the service can re-read from `receivedBy`. */
export const ReferentReplyHandoverSchema = z.strictObject({
    tenantId: z.string().min(1),
    organizationId: z.string().min(1).max(64),
    projectId: z.string().min(1).max(64),
    toBuSlug: AssetRefSchema.shape.buSlug.unwrap(),
    receivedBy: ParticipantAgentIdentitySchema,
    referent: ReferentSchema,
    messageId: z.string().min(1).max(998),
    receivedAt: z.iso.datetime({ offset: true }),
    text: z.string().min(1).max(4000),
    requestId: DecisionRequestIdSchema.optional(),
});
/** Records an interpreted reply from a handover; scope and request must match, the rest is `decisionOutcomeFromEmailReply`. */
export function decisionOutcomeFromHandover(input) {
    const { request, reply, handover } = input;
    const subject = request.subject;
    if (handover.requestId === undefined || handover.requestId !== request.requestId
        || handover.tenantId !== request.tenantId || handover.organizationId !== request.organizationId
        || handover.projectId !== request.projectId
        || subject?.kind !== 'delivery' || handover.toBuSlug !== subject.buSlug) {
        return { ok: false, code: 'mismatch' };
    }
    return decisionOutcomeFromEmailReply({
        request, reply, from: { email: handover.referent.email },
        receivedAt: handover.receivedAt, messageId: handover.messageId,
    });
}
//# sourceMappingURL=decision-request.js.map