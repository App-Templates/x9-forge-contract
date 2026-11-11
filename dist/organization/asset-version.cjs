"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASSET_VERSION_DUPLICATE = exports.ASSET_VERSION_TRANSITIONS = exports.AssetVersionStateSchema = exports.ASSET_VERSION_STATES = exports.AssetVersionLeadReviewSchema = exports.AssetVersionRecordSchema = exports.AssetVersionProvenanceSchema = exports.AssetVersionFileSchema = void 0;
exports.assetVersionTransitionAllowed = assetVersionTransitionAllowed;
exports.isLaterDecisionRequest = isLaterDecisionRequest;
exports.assetVersionDecisionState = assetVersionDecisionState;
exports.deriveAssetVersionStates = deriveAssetVersionStates;
exports.latestApprovedAssetVersion = latestApprovedAssetVersion;
const zod_1 = require("zod");
const asset_js_1 = require("./asset.cjs");
const decision_request_js_1 = require("./decision-request.cjs");
const participant_binding_js_1 = require("./participant-binding.cjs");
/** Immutable file identity, shared with existing asset references. */
exports.AssetVersionFileSchema = zod_1.z.strictObject({
    assetId: asset_js_1.AssetRefSchema.shape.assetId,
    sha256: asset_js_1.AssetRefSchema.shape.sha256,
});
exports.AssetVersionProvenanceSchema = zod_1.z.strictObject({
    createdBy: participant_binding_js_1.ParticipantAgentIdentitySchema,
    paperclipIssueId: zod_1.z.uuid().optional(),
    sessionId: zod_1.z.string().regex(/^R[1-9][0-9]*$/).optional(),
    repo: asset_js_1.AssetOriginSchema.options[2].shape.repo,
    branch: zod_1.z.string().min(1).optional(),
    commit: asset_js_1.AssetOriginSchema.options[2].shape.commit,
    inputs: zod_1.z.array(asset_js_1.AssetVersionRefSchema).max(20).optional(),
}).superRefine((provenance, ctx) => {
    if ((provenance.repo === undefined) !== (provenance.commit === undefined)) {
        ctx.addIssue({ code: 'custom', path: ['repo'], message: 'repo and commit must be provided together' });
    }
    if (provenance.branch !== undefined && provenance.sessionId === undefined) {
        ctx.addIssue({ code: 'custom', path: ['branch'], message: 'branch requires a sessionId' });
    }
});
exports.AssetVersionRecordSchema = zod_1.z.strictObject({
    tenantId: asset_js_1.AssetRefSchema.shape.tenantId,
    organizationId: decision_request_js_1.DecisionRequestSchema.shape.organizationId,
    projectId: asset_js_1.AssetRefSchema.shape.projectId,
    buSlug: asset_js_1.AssetRefSchema.shape.buSlug.unwrap(),
    key: asset_js_1.AssetKeySchema,
    version: asset_js_1.AssetVersionRefSchema.shape.version,
    files: zod_1.z.array(exports.AssetVersionFileSchema).min(1).max(20).refine((files) => new Set(files.map((file) => file.assetId)).size === files.length, { message: 'File assetIds must be unique within a version' }),
    deliveryPackage: exports.AssetVersionFileSchema.optional(),
    provenance: exports.AssetVersionProvenanceSchema,
    recordedAt: asset_js_1.AssetRefSchema.shape.createdAt,
});
exports.AssetVersionLeadReviewSchema = zod_1.z.strictObject({
    buSlug: exports.AssetVersionRecordSchema.shape.buSlug,
    key: asset_js_1.AssetKeySchema,
    version: asset_js_1.AssetVersionRefSchema.shape.version,
    verdict: zod_1.z.enum(['ok', 'redo']),
    reason: zod_1.z.string().min(3).max(2000).optional(),
    reviewedBy: participant_binding_js_1.ParticipantAgentIdentitySchema,
    reviewedAt: asset_js_1.AssetRefSchema.shape.createdAt,
}).refine((review) => review.verdict !== 'redo' || review.reason !== undefined, {
    path: ['reason'], message: 'A redo review requires a reason',
});
exports.ASSET_VERSION_STATES = [
    'delivered', 'rejected_by_lead', 'awaiting_decision', 'changes_requested', 'approved', 'superseded',
];
exports.AssetVersionStateSchema = zod_1.z.enum(exports.ASSET_VERSION_STATES);
exports.ASSET_VERSION_TRANSITIONS = {
    delivered: ['rejected_by_lead', 'awaiting_decision'],
    rejected_by_lead: [],
    awaiting_decision: ['approved', 'changes_requested'],
    changes_requested: [],
    approved: ['superseded'],
    superseded: [],
};
function assetVersionTransitionAllowed(from, to) {
    return exports.ASSET_VERSION_TRANSITIONS[from].includes(to);
}
/** Latest request wins by creation instant, then by the greater requestId. */
function isLaterDecisionRequest(a, b) {
    const delta = Date.parse(a.createdAt) - Date.parse(b.createdAt);
    return delta !== 0 ? delta > 0 : a.requestId > b.requestId;
}
/** An unrelated answer is pending, an unsound approval has no decision state. */
function assetVersionDecisionState(request, outcome) {
    if (outcome === null || outcome.requestId !== request.requestId)
        return 'awaiting_decision';
    if (outcome.outcome === 'rejected')
        return 'changes_requested';
    if (outcome.decidedBy.kind !== 'referent' || !(0, decision_request_js_1.decisionOutcomeMatchesSubject)(request, outcome))
        return null;
    return 'approved';
}
exports.ASSET_VERSION_DUPLICATE = 'asset_version_duplicate';
/** Derive a snapshot from recorded facts, without changing those facts or reading the clock. */
function deriveAssetVersionStates(input) {
    const entries = input.versions.map((record) => ({
        record,
        result: { buSlug: record.buSlug, key: record.key, version: record.version, state: 'delivered' },
    }));
    const groups = new Map();
    const seen = new Set();
    for (const entry of entries) {
        const record = entry.record;
        const scope = [record.tenantId, record.organizationId, record.projectId, record.buSlug, record.key];
        const identity = JSON.stringify([...scope, record.version]);
        if (seen.has(identity))
            throw new Error(`${exports.ASSET_VERSION_DUPLICATE}: ${identity}`);
        seen.add(identity);
        const groupKey = JSON.stringify(scope);
        const group = groups.get(groupKey) ?? [];
        group.push(entry);
        groups.set(groupKey, group);
    }
    for (const group of groups.values()) {
        const scope = group[0].record;
        const latestDecisions = new Map();
        for (const decision of input.decisions) {
            const { request } = decision;
            const { subject } = request;
            if (subject?.kind !== 'delivery'
                || request.tenantId !== scope.tenantId || request.organizationId !== scope.organizationId
                || request.projectId !== scope.projectId || subject.organizationId !== scope.organizationId
                || subject.projectId !== scope.projectId || subject.buSlug !== scope.buSlug)
                continue;
            let target;
            for (const { record } of group) {
                // A decision bound to an asset version belongs to that version only.
                if (subject.assetVersion !== undefined
                    && (subject.assetVersion.key !== record.key || subject.assetVersion.version !== record.version))
                    continue;
                if (Date.parse(record.recordedAt) > Date.parse(request.createdAt))
                    continue;
                if (target !== undefined && record.version <= target.version)
                    continue;
                const files = record.deliveryPackage === undefined ? record.files : [...record.files, record.deliveryPackage];
                if (files.some((file) => file.assetId === subject.deliveryRef.assetId && file.sha256 === subject.deliveryRef.sha256)) {
                    target = record;
                }
            }
            if (target === undefined)
                continue;
            const previous = latestDecisions.get(target.version);
            if (previous === undefined || isLaterDecisionRequest(request, previous.request)) {
                latestDecisions.set(target.version, decision);
            }
        }
        for (const { record, result } of group) {
            const decision = latestDecisions.get(record.version);
            if (decision !== undefined) {
                result.state = assetVersionDecisionState(decision.request, decision.outcome) ?? 'awaiting_decision';
                result.requestId = decision.request.requestId;
                if (result.state !== 'awaiting_decision' && decision.outcome !== null) {
                    result.decidedAt = decision.outcome.decidedAt;
                }
                continue;
            }
            // Reviews have no tenant fields and must be supplied from the caller's scoped history.
            let latestReview;
            for (const review of input.leadReviews) {
                if (review.buSlug !== record.buSlug || review.key !== record.key || review.version !== record.version)
                    continue;
                if (latestReview === undefined || Date.parse(review.reviewedAt) > Date.parse(latestReview.reviewedAt)
                    || (Date.parse(review.reviewedAt) === Date.parse(latestReview.reviewedAt) && review.verdict === 'redo')) {
                    latestReview = review;
                }
            }
            if (latestReview?.verdict === 'redo')
                result.state = 'rejected_by_lead';
        }
        const latestApproved = latestApprovedAssetVersion(group.map((entry) => entry.result), scope);
        if (latestApproved === null)
            continue;
        for (const { result } of group) {
            if (result.state === 'approved' && result.version < latestApproved.version)
                result.state = 'superseded';
        }
    }
    return entries.map((entry) => entry.result);
}
function latestApprovedAssetVersion(states, scope) {
    let latest = null;
    for (const state of states) {
        if (state.buSlug !== scope.buSlug || state.key !== scope.key || state.state !== 'approved')
            continue;
        if (latest === null || state.version > latest.version)
            latest = state;
    }
    return latest;
}
//# sourceMappingURL=asset-version.js.map