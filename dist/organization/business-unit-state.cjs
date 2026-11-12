"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessUnitStateSummarySchema = exports.BusinessUnitStateScopeSchema = void 0;
exports.deriveBusinessUnitStateSummary = deriveBusinessUnitStateSummary;
const zod_1 = require("zod");
const session_outcome_js_1 = require("../capability/dev/session-outcome.cjs");
const tool_error_disposition_js_1 = require("../capability/tool-error-disposition.cjs");
const asset_js_1 = require("./asset.cjs");
const asset_version_js_1 = require("./asset-version.cjs");
const decision_request_js_1 = require("./decision-request.cjs");
/** The department whose state is summarised; every fact outside it is ignored. */
exports.BusinessUnitStateScopeSchema = zod_1.z.strictObject({
    tenantId: asset_version_js_1.AssetVersionRecordSchema.shape.tenantId,
    organizationId: asset_version_js_1.AssetVersionRecordSchema.shape.organizationId,
    projectId: asset_version_js_1.AssetVersionRecordSchema.shape.projectId,
    buSlug: asset_version_js_1.AssetVersionRecordSchema.shape.buSlug,
});
exports.BusinessUnitStateSummarySchema = zod_1.z.strictObject({
    scope: exports.BusinessUnitStateScopeSchema,
    deliverables: zod_1.z.array(zod_1.z.strictObject({
        key: asset_version_js_1.AssetVersionRecordSchema.shape.key,
        versions: zod_1.z.number().int().min(1),
        latest: zod_1.z.strictObject({
            version: asset_version_js_1.AssetVersionRecordSchema.shape.version,
            state: asset_version_js_1.AssetVersionStateSchema,
            requestId: decision_request_js_1.DecisionRequestSchema.shape.requestId.optional(),
            decidedAt: zod_1.z.iso.datetime({ offset: true }).optional(),
        }),
        latestApprovedVersion: asset_version_js_1.AssetVersionRecordSchema.shape.version.nullable(),
    })),
    openDecisions: zod_1.z.array(zod_1.z.strictObject({
        requestId: decision_request_js_1.DecisionRequestSchema.shape.requestId,
        createdAt: decision_request_js_1.DecisionRequestSchema.shape.createdAt,
        deliveryRef: zod_1.z.strictObject({ assetId: asset_js_1.AssetRefSchema.shape.assetId, sha256: asset_js_1.AssetRefSchema.shape.sha256 }),
        assetVersion: zod_1.z.strictObject({
            key: asset_version_js_1.AssetVersionRecordSchema.shape.key,
            version: asset_version_js_1.AssetVersionRecordSchema.shape.version,
        }).optional(),
    })),
    receivedMaterials: zod_1.z.array(zod_1.z.strictObject({
        assetId: asset_js_1.AssetRefSchema.shape.assetId,
        sha256: asset_js_1.AssetRefSchema.shape.sha256,
        name: asset_js_1.AssetRefSchema.shape.name,
        createdAt: asset_js_1.AssetRefSchema.shape.createdAt,
    })),
    sessions: zod_1.z.array(zod_1.z.strictObject({
        sessionId: session_outcome_js_1.DevSessionOutcomeSchema.shape.sessionId,
        attempt: session_outcome_js_1.DevSessionOutcomeSchema.shape.attempt,
        state: session_outcome_js_1.DevSessionOutcomeSchema.shape.state,
        reasonCode: session_outcome_js_1.DevSessionOutcomeSchema.shape.reason.shape.code,
        nature: tool_error_disposition_js_1.ToolErrorNatureSchema.optional(),
        nextMove: tool_error_disposition_js_1.ToolErrorNextMoveSchema.optional(),
        executorVersion: session_outcome_js_1.DevSessionOutcomeSchema.shape.executorVersion,
        createdAt: session_outcome_js_1.DevSessionOutcomeSchema.shape.createdAt,
    })),
});
const sameScope = (a, b) => a.tenantId === b.tenantId
    && a.organizationId === b.organizationId && a.projectId === b.projectId && a.buSlug === b.buSlug;
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const byInstant = (a, b) => Date.parse(a) - Date.parse(b);
/**
 * One department's state, read from recorded facts only: no clock, no second state rule. Version states come
 * from `deriveAssetVersionStates`. Every fact outside the requested scope is ignored; facts whose record
 * carries no scope (lead reviews, session outcomes) arrive paired with the scope they were recorded in.
 */
function deriveBusinessUnitStateSummary(input) {
    const { scope } = input;
    const versions = input.versions.filter((record) => sameScope(record, scope));
    const decisions = input.decisions.filter(({ request }) => request.tenantId === scope.tenantId
        && request.organizationId === scope.organizationId && request.projectId === scope.projectId
        && request.subject?.kind === 'delivery' && request.subject.buSlug === scope.buSlug);
    const leadReviews = input.leadReviews
        .filter((entry) => sameScope(entry.scope, scope) && entry.review.buSlug === scope.buSlug)
        .map((entry) => entry.review);
    const states = (0, asset_version_js_1.deriveAssetVersionStates)({ versions, decisions, leadReviews });
    const keys = new Map();
    for (const state of states)
        keys.set(state.key, [...(keys.get(state.key) ?? []), state]);
    const deliverables = [...keys.entries()].sort(([a], [b]) => byText(a, b)).map(([key, group]) => {
        const latest = group.reduce((best, state) => (state.version > best.version ? state : best));
        const approved = (0, asset_version_js_1.latestApprovedAssetVersion)(group, { buSlug: scope.buSlug, key });
        return {
            key,
            versions: group.length,
            latest: {
                version: latest.version,
                state: latest.state,
                ...(latest.requestId === undefined ? {} : { requestId: latest.requestId }),
                ...(latest.decidedAt === undefined ? {} : { decidedAt: latest.decidedAt }),
            },
            latestApprovedVersion: approved?.version ?? null,
        };
    });
    const openDecisions = decisions.flatMap(({ request, outcome }) => {
        const { subject } = request;
        if (subject?.kind !== 'delivery' || (0, asset_version_js_1.assetVersionDecisionState)(request, outcome) !== 'awaiting_decision')
            return [];
        return [{
                requestId: request.requestId,
                createdAt: request.createdAt,
                deliveryRef: { assetId: subject.deliveryRef.assetId, sha256: subject.deliveryRef.sha256 },
                ...(subject.assetVersion === undefined ? {} : { assetVersion: subject.assetVersion }),
            }];
    }).sort((a, b) => byInstant(a.createdAt, b.createdAt) || byText(a.requestId, b.requestId));
    const seenAssets = new Set();
    const receivedMaterials = input.assets.filter((asset) => {
        if (asset.tenantId !== scope.tenantId || asset.projectId !== scope.projectId || asset.buSlug !== scope.buSlug
            || asset.origin.kind === 'session' || seenAssets.has(asset.assetId))
            return false;
        seenAssets.add(asset.assetId);
        return true;
    }).map(({ assetId, sha256, name, createdAt }) => ({ assetId, sha256, name, createdAt }))
        .sort((a, b) => byInstant(a.createdAt, b.createdAt) || byText(a.assetId, b.assetId));
    const lastBySession = new Map();
    for (const { scope: outcomeScope, outcome } of input.sessionOutcomes) {
        if (!sameScope(outcomeScope, scope))
            continue;
        const previous = lastBySession.get(outcome.sessionId);
        if (previous === undefined || outcome.attempt > previous.attempt
            || (outcome.attempt === previous.attempt && byInstant(outcome.createdAt, previous.createdAt) > 0)) {
            lastBySession.set(outcome.sessionId, outcome);
        }
    }
    const sessions = [...lastBySession.values()].map((outcome) => ({
        sessionId: outcome.sessionId,
        attempt: outcome.attempt,
        state: outcome.state,
        reasonCode: outcome.reason.code,
        ...(outcome.disposition === undefined
            ? {}
            : { nature: outcome.disposition.nature, nextMove: outcome.disposition.nextMove }),
        executorVersion: outcome.executorVersion,
        createdAt: outcome.createdAt,
    })).sort((a, b) => Number(a.sessionId.slice(1)) - Number(b.sessionId.slice(1)));
    return exports.BusinessUnitStateSummarySchema.parse({ scope, deliverables, openDecisions, receivedMaterials, sessions });
}
//# sourceMappingURL=business-unit-state.js.map