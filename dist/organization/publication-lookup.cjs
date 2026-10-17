"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListPublicationsResponseSchema = exports.ListPublicationsRequestSchema = exports.LIST_PUBLICATIONS_MAX_LIMIT = exports.WithdrawPublicationResponseSchema = exports.WithdrawPublicationRequestSchema = void 0;
const zod_1 = require("zod");
const run_context_js_1 = require("./run-context.cjs");
const publication_ref_js_1 = require("./publication-ref.cjs");
/** Withdraw a publication. Tenant and owner come from the run context, never from the caller. */
exports.WithdrawPublicationRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    ref: publication_ref_js_1.PublicationRefSchema,
});
const WithdrawRefusalBody = { message: zod_1.z.string().min(1).optional() };
/** Idempotent: a second withdrawal returns the same receipt. */
exports.WithdrawPublicationResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({
        status: zod_1.z.literal('withdrawn'),
        ref: publication_ref_js_1.PublicationRefSchema,
        withdrawnAt: zod_1.z.string().datetime({ offset: true }),
    }),
    zod_1.z.strictObject({ status: zod_1.z.literal('not_authorized'), ...WithdrawRefusalBody }),
    zod_1.z.strictObject({ status: zod_1.z.literal('unknown_reference'), ...WithdrawRefusalBody }),
]);
exports.LIST_PUBLICATIONS_MAX_LIMIT = 100;
exports.ListPublicationsRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    recipient: publication_ref_js_1.PublicationRecipientSchema,
    cursor: zod_1.z.string().min(1).optional(),
    limit: zod_1.z.number().int().min(1).max(exports.LIST_PUBLICATIONS_MAX_LIMIT).optional(),
});
exports.ListPublicationsResponseSchema = zod_1.z.strictObject({
    items: zod_1.z.array(publication_ref_js_1.PublicationRefSchema).max(exports.LIST_PUBLICATIONS_MAX_LIMIT),
    nextCursor: zod_1.z.string().min(1).nullable(),
});
//# sourceMappingURL=publication-lookup.js.map