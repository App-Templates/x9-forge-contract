"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectDeliveryRecordSchema = exports.ProjectDeliveryToolOutputSchema = exports.ProjectDeliveryReconciliationSchema = exports.ProjectDeliverySentSchema = exports.ProjectDeliveryMissingSchema = exports.ProjectDeliveryWaitSchema = exports.ProjectDeliveryPieceSchema = exports.ProjectDeliveryInputSchema = exports.PROJECT_DELIVERY_DUPLICATE_UNIT = exports.ProjectDeliveryRecordStageSchema = exports.PROJECT_DELIVERY_RECORD_STAGES = exports.PROJECT_DELIVERY_MAX_ATTEMPTS = exports.PROJECT_DELIVERY_ASSET_TYPE = exports.ProjectDeliverySentKindSchema = exports.PROJECT_DELIVERY_SENT_KINDS = exports.ProjectDeliveryPieceStateSchema = exports.PROJECT_DELIVERY_PIECE_STATES = exports.ProjectDeliveryOutcomeSchema = exports.PROJECT_DELIVERY_OUTCOMES = exports.PROJECT_DELIVERY_TOOL = void 0;
exports.projectDeliveryRecordName = projectDeliveryRecordName;
exports.projectDeliveryRecordAssetId = projectDeliveryRecordAssetId;
exports.projectDeliveryDigest = projectDeliveryDigest;
exports.projectDeliveryUnitDigest = projectDeliveryUnitDigest;
exports.reconcileProjectDelivery = reconcileProjectDelivery;
const node_crypto_1 = require("node:crypto");
const zod_1 = require("zod");
const action_plan_js_1 = require("./action-plan.cjs");
const asset_js_1 = require("./asset.cjs");
const decision_request_js_1 = require("./decision-request.cjs");
/** Tool through which the Director reconciles the approved deliveries of a project and sends them to the client. */
exports.PROJECT_DELIVERY_TOOL = 'email_deliver_project';
/** `complete`: every unit of the plan has an approved piece; `partial`: some do; `empty`: none does. */
exports.PROJECT_DELIVERY_OUTCOMES = ['complete', 'partial', 'empty'];
exports.ProjectDeliveryOutcomeSchema = zod_1.z.enum(exports.PROJECT_DELIVERY_OUTCOMES);
exports.PROJECT_DELIVERY_PIECE_STATES = ['approved', 'pending', 'rejected', 'missing', 'needs_reapproval'];
exports.ProjectDeliveryPieceStateSchema = zod_1.z.enum(exports.PROJECT_DELIVERY_PIECE_STATES);
exports.PROJECT_DELIVERY_SENT_KINDS = ['final', 'partial'];
exports.ProjectDeliverySentKindSchema = zod_1.z.enum(exports.PROJECT_DELIVERY_SENT_KINDS);
/** Asset type under which the delivery of a project is recorded in Memory. */
exports.PROJECT_DELIVERY_ASSET_TYPE = 'consegna-progetto';
/** How many times a send of the same delivery state may be claimed (each attempt has its own `sending` record). */
exports.PROJECT_DELIVERY_MAX_ATTEMPTS = 3;
/** `sending`: claimed before mailing; `sent`: mailed; `released`: the claimed send did not leave, the next attempt may retry. */
exports.PROJECT_DELIVERY_RECORD_STAGES = ['sending', 'sent', 'released'];
exports.ProjectDeliveryRecordStageSchema = zod_1.z.enum(exports.PROJECT_DELIVERY_RECORD_STAGES);
/** Refusal code of a plan that lists the same business unit more than once. */
exports.PROJECT_DELIVERY_DUPLICATE_UNIT = 'project_delivery_duplicate_unit';
const BuSlugSchema = asset_js_1.AssetRefSchema.shape.buSlug.unwrap();
const IsoInstantSchema = zod_1.z.iso.datetime({ offset: true });
exports.ProjectDeliveryInputSchema = zod_1.z.strictObject({
    projectId: asset_js_1.AssetRefSchema.shape.projectId,
    partial: zod_1.z.boolean().optional()
        .describe('true per mandare al committente solo i pezzi già approvati, dichiarando cosa manca'),
});
const PlanRefSchema = zod_1.z.strictObject({
    planId: decision_request_js_1.DecisionRequestIdSchema,
    version: zod_1.z.number().int().min(1),
    digest: asset_js_1.AssetSha256Schema,
});
exports.ProjectDeliveryPieceSchema = zod_1.z.strictObject({
    buSlug: BuSlugSchema,
    state: exports.ProjectDeliveryPieceStateSchema,
    requestId: decision_request_js_1.DecisionRequestIdSchema.optional().describe('la richiesta di consegna che decide lo stato'),
    deliveryRef: zod_1.z.strictObject({
        assetId: asset_js_1.AssetRefSchema.shape.assetId,
        sha256: asset_js_1.AssetSha256Schema,
    }).optional().describe('il file consegnato dal reparto, con la sua impronta'),
    decidedAt: IsoInstantSchema.optional().describe('quando il referente ha deciso'),
    approvedUnderVersion: zod_1.z.number().int().min(1).optional()
        .describe('la versione del piano sotto cui il pezzo è stato fatto e approvato'),
}).superRefine((piece, ctx) => {
    if (piece.state !== 'needs_reapproval' && piece.approvedUnderVersion !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['approvedUnderVersion'], message: 'Only a piece needing reapproval carries approvedUnderVersion' });
    }
    if (piece.state === 'needs_reapproval' && piece.approvedUnderVersion === undefined) {
        ctx.addIssue({ code: 'custom', path: ['approvedUnderVersion'], message: 'A piece needing reapproval carries approvedUnderVersion' });
    }
    if (piece.state === 'approved' || piece.state === 'needs_reapproval') {
        for (const key of ['requestId', 'deliveryRef', 'decidedAt']) {
            if (piece[key] === undefined) {
                ctx.addIssue({ code: 'custom', path: [key], message: 'A ' + piece.state + ' piece carries ' + key });
            }
        }
    }
    else if (piece.state === 'missing') {
        for (const key of ['requestId', 'deliveryRef', 'decidedAt']) {
            if (piece[key] !== undefined) {
                ctx.addIssue({ code: 'custom', path: [key], message: 'A missing piece carries no ' + key });
            }
        }
    }
    else {
        if (piece.requestId === undefined) {
            ctx.addIssue({ code: 'custom', path: ['requestId'], message: 'A ' + piece.state + ' piece names its request' });
        }
        if (piece.state === 'pending' && piece.decidedAt !== undefined) {
            ctx.addIssue({ code: 'custom', path: ['decidedAt'], message: 'A pending piece has no decision yet' });
        }
    }
});
/** Who a missing piece waits on, and what it needs from them. */
exports.ProjectDeliveryWaitSchema = zod_1.z.strictObject({
    buSlug: BuSlugSchema,
    what: zod_1.z.string().min(1).max(2000),
});
exports.ProjectDeliveryMissingSchema = zod_1.z.strictObject({
    buSlug: BuSlugSchema,
    state: exports.ProjectDeliveryPieceStateSchema.exclude(['approved']),
    waitsOn: zod_1.z.array(exports.ProjectDeliveryWaitSchema).max(20),
});
exports.ProjectDeliverySentSchema = zod_1.z.strictObject({
    messageId: zod_1.z.string().min(1).max(512),
    sentAt: IsoInstantSchema,
    kind: exports.ProjectDeliverySentKindSchema,
});
const reconciliationBase = {
    plan: PlanRefSchema,
    digest: asset_js_1.AssetSha256Schema,
    pieces: zod_1.z.array(exports.ProjectDeliveryPieceSchema).min(1).max(20).refine((pieces) => new Set(pieces.map((piece) => piece.buSlug)).size === pieces.length, { message: 'Piece business units must be unique' }),
    sent: exports.ProjectDeliverySentSchema.optional(),
};
/** What the Director sees about a project delivery: the pieces, what is missing and from whom, the fingerprint of that state, and (once mailed) the send. */
exports.ProjectDeliveryReconciliationSchema = zod_1.z.discriminatedUnion('outcome', [
    zod_1.z.strictObject({
        outcome: zod_1.z.literal('complete'), ...reconciliationBase,
        missing: zod_1.z.array(exports.ProjectDeliveryMissingSchema).max(0),
    }),
    zod_1.z.strictObject({
        outcome: zod_1.z.literal('partial'), ...reconciliationBase,
        missing: zod_1.z.array(exports.ProjectDeliveryMissingSchema).min(1).max(19),
    }),
    zod_1.z.strictObject({
        outcome: zod_1.z.literal('empty'), ...reconciliationBase,
        missing: zod_1.z.array(exports.ProjectDeliveryMissingSchema).min(1).max(20),
    }),
]).superRefine((value, ctx) => {
    const approved = value.pieces.filter((piece) => piece.state === 'approved').length;
    const expected = approved === value.pieces.length ? 'complete' : approved === 0 ? 'empty' : 'partial';
    if (value.outcome !== expected) {
        ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'Outcome ' + value.outcome + ' does not match the pieces (' + expected + ')' });
    }
    const notApproved = new Map(value.pieces.filter((piece) => piece.state !== 'approved').map((piece) => [piece.buSlug, piece.state]));
    const listed = value.missing.map((entry) => entry.buSlug);
    if (new Set(listed).size !== listed.length
        || listed.length !== notApproved.size
        || value.missing.some((entry) => notApproved.get(entry.buSlug) !== entry.state)) {
        ctx.addIssue({ code: 'custom', path: ['missing'], message: 'Missing must be exactly the pieces that are not approved' });
    }
    if (value.sent !== undefined && value.sent.kind !== (value.outcome === 'complete' ? 'final' : value.outcome === 'partial' ? 'partial' : undefined)) {
        ctx.addIssue({ code: 'custom', path: ['sent', 'kind'], message: 'A final send needs a complete outcome and a partial send a partial one' });
    }
    if (value.digest !== projectDeliveryDigest(value.plan, value.pieces)) {
        ctx.addIssue({ code: 'custom', path: ['digest'], message: 'Digest must match the plan and the pieces' });
    }
});
/** Output of the project delivery tool: exactly the reconciliation. */
exports.ProjectDeliveryToolOutputSchema = zod_1.z.strictObject({
    reconciliation: exports.ProjectDeliveryReconciliationSchema,
});
const recordBase = {
    kind: exports.ProjectDeliverySentKindSchema,
    digest: asset_js_1.AssetSha256Schema.describe('impronta dell\'esito della consegna a cui la registrazione si riferisce'),
    attempt: zod_1.z.number().int().min(1).max(exports.PROJECT_DELIVERY_MAX_ATTEMPTS).describe('il tentativo di invio, da 1'),
};
/** Registration of a send, in stages: claimed (`sending`), mailed (`sent`) or given back (`released`). */
exports.ProjectDeliveryRecordSchema = zod_1.z.discriminatedUnion('stage', [
    zod_1.z.strictObject({
        stage: zod_1.z.literal('sending'), ...recordBase,
        reconciliation: exports.ProjectDeliveryReconciliationSchema,
        claimedBy: zod_1.z.string().min(1).max(200).describe('il callId di chi sta spedendo'),
        claimedAt: IsoInstantSchema,
    }),
    zod_1.z.strictObject({
        stage: zod_1.z.literal('sent'), ...recordBase,
        reconciliation: exports.ProjectDeliveryReconciliationSchema,
    }),
    zod_1.z.strictObject({
        stage: zod_1.z.literal('released'), ...recordBase,
        reason: zod_1.z.string().min(1).max(500).describe('perché l\'invio di questo tentativo non è partito'),
        releasedAt: IsoInstantSchema,
    }),
]).superRefine((record, ctx) => {
    if (record.stage === 'released')
        return;
    const { reconciliation } = record;
    if (record.digest !== reconciliation.digest) {
        ctx.addIssue({ code: 'custom', path: ['digest'], message: 'Digest must equal the digest of the reconciliation' });
    }
    if (record.kind !== (reconciliation.outcome === 'complete' ? 'final' : reconciliation.outcome === 'partial' ? 'partial' : undefined)) {
        ctx.addIssue({ code: 'custom', path: ['kind'], message: 'A final record needs a complete outcome and a partial one a partial outcome' });
    }
    if (record.stage === 'sending' && reconciliation.sent !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['reconciliation', 'sent'], message: 'A sending record carries no send yet' });
    }
    if (record.stage === 'sent' && (reconciliation.sent === undefined || reconciliation.sent.kind !== record.kind)) {
        ctx.addIssue({ code: 'custom', path: ['reconciliation', 'sent'], message: 'A sent record carries the send of its kind' });
    }
});
/** Asset name of a record: one `sent` per delivery state, one record per stage and attempt otherwise. */
function projectDeliveryRecordName(input) {
    const head = exports.PROJECT_DELIVERY_ASSET_TYPE + '-' + input.kind + '-' + input.digest.slice(0, 16);
    return input.stage === 'sent' ? head + '-sent.json' : head + '-' + input.stage + '-' + input.attempt + '.json';
}
/** Deterministic asset id of a record, so a retry or a concurrent call finds the same asset. */
function projectDeliveryRecordAssetId(input) {
    const hash = (0, node_crypto_1.createHash)('sha256')
        .update(JSON.stringify([input.tenantId, input.organizationId, input.projectId, input.name]))
        .digest('hex');
    return 'a_' + hash.slice(0, 40);
}
/** Fingerprint of the delivery state: plan identity plus each piece, sorted by unit so decision order never matters. */
function projectDeliveryDigest(plan, pieces) {
    const ordered = [...pieces]
        .sort((a, b) => (a.buSlug < b.buSlug ? -1 : a.buSlug > b.buSlug ? 1 : 0))
        .map((piece) => [
        piece.buSlug, piece.state, piece.requestId ?? null, piece.deliveryRef?.assetId ?? null, piece.deliveryRef?.sha256 ?? null,
    ]);
    return (0, node_crypto_1.createHash)('sha256').update(JSON.stringify([plan.planId, plan.version, plan.digest, ordered])).digest('hex');
}
/** Fingerprint of a unit's work, independent of its start conditions and referent. */
function projectDeliveryUnitDigest(plan, buSlug) {
    const businessUnit = plan.businessUnits.find((candidate) => candidate.buSlug === buSlug);
    const { start: _start, referent: _referent, ...unit } = { ...businessUnit };
    const objective = plan.objectiveTree.businessUnits.find((candidate) => candidate.buSlug === buSlug) ?? null;
    const work = (plan.workBreakdown ?? [])
        .filter((item) => item.owners.some((owner) => owner.buSlug === buSlug))
        .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    const milestones = plan.milestones.filter((milestone) => milestone.buSlug === buSlug)
        .map(({ delivery, closeCriterion }) => ({ delivery, closeCriterion }))
        .sort((a, b) => a.delivery < b.delivery ? -1 : a.delivery > b.delivery ? 1 : 0);
    return (0, node_crypto_1.createHash)('sha256').update((0, action_plan_js_1.canonicalJson)({ unit, objective, work, milestones })).digest('hex');
}
/** Latest request wins: by creation instant, then by the greater requestId. */
function isLater(a, b) {
    const delta = Date.parse(a.createdAt) - Date.parse(b.createdAt);
    return delta !== 0 ? delta > 0 : a.requestId > b.requestId;
}
function pieceOf(plan, buSlug, since, decisions, assets, approvals, planVersions) {
    let latest;
    for (const decision of decisions) {
        const { subject } = decision.request;
        if (subject?.kind !== 'delivery' || subject.buSlug !== buSlug)
            continue;
        if (decision.request.tenantId !== plan.tenantId
            || subject.organizationId !== plan.organizationId || subject.projectId !== plan.projectId)
            continue;
        if (Date.parse(decision.request.createdAt) < since)
            continue;
        if (latest === undefined || isLater(decision.request, latest.request))
            latest = { ...decision, subject };
    }
    if (latest === undefined)
        return { buSlug, state: 'missing' };
    const { request } = latest;
    const { deliveryRef } = latest.subject;
    // An outcome that answers another request is ignored: it never counts as a decision.
    const outcome = latest.outcome?.requestId === request.requestId ? latest.outcome : null;
    if (outcome === null)
        return { buSlug, state: 'pending', requestId: request.requestId, deliveryRef };
    if (outcome.outcome === 'rejected') {
        return { buSlug, state: 'rejected', requestId: request.requestId, deliveryRef, decidedAt: outcome.decidedAt };
    }
    const stored = assets.find((asset) => asset.assetId === deliveryRef.assetId);
    const sound = outcome.decidedBy.kind === 'referent'
        && (0, decision_request_js_1.decisionOutcomeMatchesSubject)(request, outcome)
        && stored !== undefined && stored.sha256 === deliveryRef.sha256 && stored.buSlug === buSlug
        && stored.projectId === plan.projectId;
    if (!sound)
        return { buSlug, state: 'missing' };
    const approved = { buSlug, state: 'approved', requestId: request.requestId, deliveryRef, decidedAt: outcome.decidedAt };
    // Without the current version's approval, the caller has not provided the history: preserve legacy behavior.
    if (!approvals.has(plan.version))
        return approved;
    let approvedUnderVersion;
    for (const [version, approvedAt] of approvals) {
        if (approvedAt <= Date.parse(request.createdAt) && (approvedUnderVersion === undefined || version > approvedUnderVersion)) {
            approvedUnderVersion = version;
        }
    }
    if (approvedUnderVersion === undefined)
        return { buSlug, state: 'missing' };
    if (approvedUnderVersion === plan.version)
        return approved;
    const previous = planVersions.find((entry) => entry.plan.planId === plan.planId
        && entry.plan.version === approvedUnderVersion && entry.plan.tenantId === plan.tenantId
        && entry.plan.organizationId === plan.organizationId && entry.plan.projectId === plan.projectId);
    if (previous !== undefined && projectDeliveryUnitDigest(previous.plan, buSlug) === projectDeliveryUnitDigest(plan, buSlug)) {
        return approved;
    }
    return { ...approved, state: 'needs_reapproval', approvedUnderVersion };
}
function waitsOn(plan, buSlug, open) {
    const found = [];
    const add = (waitBu, what) => {
        if (waitBu === buSlug || !open.has(waitBu))
            return;
        if (!found.some((wait) => wait.buSlug === waitBu && wait.what === what))
            found.push({ buSlug: waitBu, what });
    };
    for (const exchange of plan.exchanges) {
        if (exchange.toBu === buSlug)
            add(exchange.fromBu, exchange.what);
    }
    const unit = plan.businessUnits.find((candidate) => candidate.buSlug === buSlug);
    for (const section of unit?.sections ?? []) {
        for (const need of section.needsFrom ?? [])
            add(need.buSlug, need.what);
    }
    for (const milestone of plan.milestones) {
        if (milestone.buSlug !== buSlug)
            continue;
        for (const blocker of milestone.blockedBy) {
            const blocking = plan.milestones.find((candidate) => candidate.number === blocker);
            if (blocking !== undefined)
                add(blocking.buSlug, blocking.delivery);
        }
    }
    // The schema lists at most twenty; the earliest reasons (exchanges, sections, milestones) are kept.
    return found.slice(0, 20);
}
/**
 * Reconciles the approved deliveries of a project with its approved plan: one piece per business unit
 * of the plan, in plan order, and for each unit that is not approved who it waits on.
 *
 * `planApprovedAt` is chosen by the caller (X9) and must be the FIRST approval of the same `planId`, not
 * the approval of the current version. In production the design was approved on 06/11 under v3 and v4
 * was approved on 09/11: with "after the approval of the current version" the design piece would vanish.
 * An older approval counts only if that unit's work is unchanged in the current plan. For example, v4
 * changing the design mandate requires reapproval of its v3 piece and prevents a complete delivery.
 */
function reconcileProjectDelivery(input) {
    const { plan, decisions, assets } = input;
    const seenUnits = new Set();
    for (const { buSlug } of plan.businessUnits) {
        if (seenUnits.has(buSlug)) {
            throw new Error(`${exports.PROJECT_DELIVERY_DUPLICATE_UNIT}: il piano ${plan.planId} versione ${plan.version} elenca più volte il reparto ${buSlug}`);
        }
        seenUnits.add(buSlug);
    }
    const since = Date.parse(IsoInstantSchema.parse(input.planApprovedAt));
    const approvals = new Map();
    for (const { request, outcome } of decisions) {
        const { subject } = request;
        if (subject?.kind !== 'action_plan' || subject.planId !== plan.planId
            || request.tenantId !== plan.tenantId || request.organizationId !== plan.organizationId
            || (request.projectId !== undefined && request.projectId !== plan.projectId)
            || outcome?.outcome !== 'approved' || outcome.requestId !== request.requestId)
            continue;
        const decidedAt = Date.parse(outcome.decidedAt);
        approvals.set(subject.planVersion, Math.min(approvals.get(subject.planVersion) ?? Infinity, decidedAt));
    }
    const pieces = plan.businessUnits.map((unit) => pieceOf(plan, unit.buSlug, since, decisions, assets, approvals, input.planVersions ?? []));
    const open = new Set(pieces.filter((piece) => piece.state !== 'approved').map((piece) => piece.buSlug));
    const missing = pieces
        .filter((piece) => open.has(piece.buSlug))
        .map((piece) => ({
        buSlug: piece.buSlug,
        state: piece.state,
        waitsOn: waitsOn(plan, piece.buSlug, open),
    }));
    const planRef = { planId: plan.planId, version: plan.version, digest: plan.digest };
    const base = { plan: planRef, digest: projectDeliveryDigest(planRef, pieces), pieces };
    if (missing.length === 0)
        return { outcome: 'complete', ...base, missing: [] };
    return { outcome: missing.length === pieces.length ? 'empty' : 'partial', ...base, missing };
}
//# sourceMappingURL=project-delivery.js.map