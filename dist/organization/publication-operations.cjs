"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadMaterialResponseSchema = exports.ReadMaterialRequestSchema = exports.PublishMaterialResponseSchema = exports.PublishMaterialErrorCodeSchema = exports.PUBLISH_MATERIAL_ERROR_CODES = exports.PublishMaterialRequestSchema = void 0;
const zod_1 = require("zod");
const run_context_js_1 = require("./run-context.cjs");
const publication_ref_js_1 = require("./publication-ref.cjs");
/** Publish a material. Tenant and owner come from the run context, never from the caller. */
exports.PublishMaterialRequestSchema = zod_1.z
    .strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    sourceScope: publication_ref_js_1.PublicationSourceScopeSchema,
    slug: zod_1.z.string().min(1).regex(/^[a-z0-9-]+$/),
    recipient: publication_ref_js_1.PublicationRecipientSchema,
    digest: zod_1.z.string().regex(/^[0-9a-f]{64}$/),
    /** Opaque reference to the content; the content itself never travels here. */
    contentRef: zod_1.z.string().min(1),
    explicit: zod_1.z.boolean().optional(),
})
    .refine((req) => req.sourceScope !== 'private' || req.explicit === true, {
    message: 'Publishing from a private scope requires explicit: true',
    path: ['explicit'],
});
exports.PUBLISH_MATERIAL_ERROR_CODES = ['not_authorized', 'invalid_recipient'];
exports.PublishMaterialErrorCodeSchema = zod_1.z.enum(exports.PUBLISH_MATERIAL_ERROR_CODES);
exports.PublishMaterialResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('published'), ref: publication_ref_js_1.PublicationRefSchema }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('error'),
        code: exports.PublishMaterialErrorCodeSchema,
        message: zod_1.z.string().min(1).optional(),
    }),
]);
exports.ReadMaterialRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    ref: publication_ref_js_1.PublicationRefSchema,
});
const ReadMaterialRefusalBody = { message: zod_1.z.string().min(1).optional() };
exports.ReadMaterialResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({
        status: zod_1.z.literal('ok'),
        ref: publication_ref_js_1.PublicationRefSchema,
        digest: zod_1.z.string().regex(/^[0-9a-f]{64}$/),
    }),
    zod_1.z.strictObject({ status: zod_1.z.literal('revoked'), ...ReadMaterialRefusalBody }),
    zod_1.z.strictObject({ status: zod_1.z.literal('not_authorized'), ...ReadMaterialRefusalBody }),
    zod_1.z.strictObject({ status: zod_1.z.literal('unknown_reference'), ...ReadMaterialRefusalBody }),
    zod_1.z.strictObject({ status: zod_1.z.literal('version_superseded'), ...ReadMaterialRefusalBody }),
    zod_1.z.strictObject({ status: zod_1.z.literal('digest_mismatch'), ...ReadMaterialRefusalBody }),
]);
//# sourceMappingURL=publication-operations.js.map