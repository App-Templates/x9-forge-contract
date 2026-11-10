"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectDeliveryReconciliationSchema = exports.ProjectDeliverySentSchema = exports.ProjectDeliveryMissingSchema = exports.ProjectDeliveryWaitSchema = exports.ProjectDeliveryPieceSchema = exports.ProjectDeliveryInputSchema = exports.ProjectDeliverySentKindSchema = exports.PROJECT_DELIVERY_SENT_KINDS = exports.ProjectDeliveryPieceStateSchema = exports.PROJECT_DELIVERY_PIECE_STATES = exports.ProjectDeliveryOutcomeSchema = exports.PROJECT_DELIVERY_OUTCOMES = exports.PROJECT_DELIVERY_TOOL = void 0;
exports.projectDeliveryDigest = projectDeliveryDigest;
exports.reconcileProjectDelivery = reconcileProjectDelivery;
const node_crypto_1 = require("node:crypto");
const zod_1 = require("zod");
const asset_js_1 = require("./asset.cjs");
const decision_request_js_1 = require("./decision-request.cjs");
/** Tool through which the Director reconciles the approved deliveries of a project and sends them to the client. */
exports.PROJECT_DELIVERY_TOOL = 'email_deliver_project';
/** `complete`: every unit of the plan has an approved piece; `partial`: some do; `empty`: none does. */
exports.PROJECT_DELIVERY_OUTCOMES = ['complete', 'partial', 'empty'];
exports.ProjectDeliveryOutcomeSchema = zod_1.z.enum(exports.PROJECT_DELIVERY_OUTCOMES);
exports.PROJECT_DELIVERY_PIECE_STATES = ['approved', 'pending', 'rejected', 'missing'];
exports.ProjectDeliveryPieceStateSchema = zod_1.z.enum(exports.PROJECT_DELIVERY_PIECE_STATES);
exports.PROJECT_DELIVERY_SENT_KINDS = ['final', 'partial'];
exports.ProjectDeliverySentKindSchema = zod_1.z.enum(exports.PROJECT_DELIVERY_SENT_KINDS);
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
}).superRefine((piece, ctx) => {
    if (piece.state === 'approved') {
        for (const key of ['requestId', 'deliveryRef', 'decidedAt']) {
            if (piece[key] === undefined) {
                ctx.addIssue({ code: 'custom', path: [key], message: 'An approved piece carries ' + key });
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
/** Fingerprint of the delivery state: plan identity plus each piece, sorted by unit so decision order never matters. */
function projectDeliveryDigest(plan, pieces) {
    const ordered = [...pieces]
        .sort((a, b) => (a.buSlug < b.buSlug ? -1 : a.buSlug > b.buSlug ? 1 : 0))
        .map((piece) => [
        piece.buSlug, piece.state, piece.requestId ?? null, piece.deliveryRef?.assetId ?? null, piece.deliveryRef?.sha256 ?? null,
    ]);
    return (0, node_crypto_1.createHash)('sha256').update(JSON.stringify([plan.planId, plan.version, plan.digest, ordered])).digest('hex');
}
/** Latest request wins: by creation instant, then by the greater requestId. */
function isLater(a, b) {
    const delta = Date.parse(a.createdAt) - Date.parse(b.createdAt);
    return delta !== 0 ? delta > 0 : a.requestId > b.requestId;
}
function pieceOf(plan, buSlug, since, decisions, assets) {
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
    return sound
        ? { buSlug, state: 'approved', requestId: request.requestId, deliveryRef, decidedAt: outcome.decidedAt }
        : { buSlug, state: 'missing' };
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
 */
function reconcileProjectDelivery(input) {
    const { plan, decisions, assets } = input;
    const since = Date.parse(IsoInstantSchema.parse(input.planApprovedAt));
    const pieces = plan.businessUnits.map((unit) => pieceOf(plan, unit.buSlug, since, decisions, assets));
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