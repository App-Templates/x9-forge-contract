"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryBusinessUnitStateContract = exports.InternalMemoryBusinessUnitStateResponseSchema = exports.InternalMemoryBusinessUnitStateRequestSchema = exports.INTERNAL_MEMORY_BUSINESS_UNIT_STATE_PATH = void 0;
const zod_1 = require("zod");
const asset_js_1 = require("../../organization/asset.cjs");
const asset_version_js_1 = require("../../organization/asset-version.cjs");
const business_unit_state_js_1 = require("../../organization/business-unit-state.cjs");
const decision_request_js_1 = require("../../organization/decision-request.cjs");
const run_context_js_1 = require("../../organization/run-context.cjs");
exports.INTERNAL_MEMORY_BUSINESS_UNIT_STATE_PATH = '/internal/memory/business-unit-state';
/** Memory resolves the caller's role, projects and departments from the verified run identity. */
exports.InternalMemoryBusinessUnitStateRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
});
/**
 * These are the facts consumed by deriveBusinessUnitStateSummary. A lead review carries no scope,
 * so the consumer pairs it with the department scope it was read in. The derivation ignores every
 * fact outside that scope. If the complete facts exceed a limit, Memory refuses with state_too_large
 * instead of truncating them before derivation, which could change the resulting state.
 */
exports.InternalMemoryBusinessUnitStateResponseSchema = zod_1.z.discriminatedUnion('outcome', [
    zod_1.z.strictObject({
        outcome: zod_1.z.literal('listed'),
        role: zod_1.z.enum(['capo-bu', 'director', 'other']),
        departments: zod_1.z.array(zod_1.z.strictObject({
            scope: business_unit_state_js_1.BusinessUnitStateScopeSchema,
            versions: zod_1.z.array(asset_version_js_1.AssetVersionRecordSchema).max(1000),
            decisions: zod_1.z.array(zod_1.z.strictObject({
                request: decision_request_js_1.DecisionRequestSchema,
                outcome: decision_request_js_1.DecisionOutcomeSchema.nullable(),
            })).max(1000),
            leadReviews: zod_1.z.array(asset_version_js_1.AssetVersionLeadReviewSchema).max(1000),
            assets: zod_1.z.array(asset_js_1.AssetRefSchema).max(200),
        })).max(20),
    }).refine((response) => response.role !== 'other' || response.departments.length === 0, {
        message: 'A caller with no covered role cannot read department facts',
        path: ['departments'],
    }),
    zod_1.z.strictObject({ outcome: zod_1.z.literal('refused'), code: zod_1.z.literal('state_too_large') }),
]);
exports.internalMemoryBusinessUnitStateContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_BUSINESS_UNIT_STATE_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryBusinessUnitStateRequestSchema,
    responseSchema: exports.InternalMemoryBusinessUnitStateResponseSchema,
};
//# sourceMappingURL=internal-memory-business-unit-state.js.map