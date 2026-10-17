"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveMaterialResponseSchema = exports.ResolveMaterialRequestSchema = exports.ReadMaterialResponseSchema = exports.ReadMaterialRequestSchema = exports.PublishMaterialResponseSchema = exports.PublishMaterialErrorCodeSchema = exports.PUBLISH_MATERIAL_ERROR_CODES = exports.PublishMaterialRequestSchema = void 0;
exports.isPublishMaterialResponseForRequest = isPublishMaterialResponseForRequest;
exports.isResolveMaterialResponseForRequest = isResolveMaterialResponseForRequest;
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
/**
 * Correlates a published receipt with its validated request, not authorization.
 * Version is assigned by the service; contentRef persistence is not attested here.
 * Adoption in X9 services/memory/src/organization/publication-service.ts is pending
 * (consumer task 250), before advancing the requested material's publication.
 */
function isPublishMaterialResponseForRequest(raw, expected) {
    const response = exports.PublishMaterialResponseSchema.safeParse(raw);
    const request = exports.PublishMaterialRequestSchema.safeParse(expected);
    if (!response.success || !request.success || response.data.status !== 'published')
        return false;
    const { ref } = response.data;
    const material = request.data;
    return JSON.stringify(ref.context) === JSON.stringify(material.context)
        && ref.sourceScope === material.sourceScope
        && ref.slug === material.slug
        && ref.recipient.kind === material.recipient.kind
        && ref.recipient.id === material.recipient.id
        && ref.digest === material.digest
        && ref.explicit === material.explicit;
}
exports.ReadMaterialRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    ref: publication_ref_js_1.PublicationRefSchema,
});
const ReadMaterialRefusalBody = { message: zod_1.z.string().min(1).optional() };
const ReadMaterialSuccessSchema = zod_1.z.strictObject({
    status: zod_1.z.literal('ok'),
    ref: publication_ref_js_1.PublicationRefSchema,
    digest: zod_1.z.string().regex(/^[0-9a-f]{64}$/),
});
const ReadMaterialRevokedSchema = zod_1.z.strictObject({ status: zod_1.z.literal('revoked'), ...ReadMaterialRefusalBody });
const ReadMaterialNotAuthorizedSchema = zod_1.z.strictObject({ status: zod_1.z.literal('not_authorized'), ...ReadMaterialRefusalBody });
const ReadMaterialUnknownReferenceSchema = zod_1.z.strictObject({ status: zod_1.z.literal('unknown_reference'), ...ReadMaterialRefusalBody });
const ReadMaterialVersionSupersededSchema = zod_1.z.strictObject({ status: zod_1.z.literal('version_superseded'), ...ReadMaterialRefusalBody });
const ReadMaterialDigestMismatchSchema = zod_1.z.strictObject({ status: zod_1.z.literal('digest_mismatch'), ...ReadMaterialRefusalBody });
const ReadMaterialRefusalSchemas = [
    ReadMaterialRevokedSchema,
    ReadMaterialNotAuthorizedSchema,
    ReadMaterialUnknownReferenceSchema,
    ReadMaterialVersionSupersededSchema,
    ReadMaterialDigestMismatchSchema,
];
exports.ReadMaterialResponseSchema = zod_1.z.discriminatedUnion('status', [
    ReadMaterialSuccessSchema,
    ...ReadMaterialRefusalSchemas,
]);
exports.ResolveMaterialRequestSchema = exports.ReadMaterialRequestSchema;
const ResolveMaterialSuccessSchema = ReadMaterialSuccessSchema.extend({
    content: zod_1.z.strictObject({
        mediaType: zod_1.z.literal('text/plain'),
        text: zod_1.z.string().max(65536),
    }),
    contentDigest: zod_1.z.string().min(1),
});
exports.ResolveMaterialResponseSchema = zod_1.z.discriminatedUnion('status', [
    ResolveMaterialSuccessSchema,
    ...ReadMaterialRefusalSchemas,
]);
/**
 * Correlates resolved text with the requested publication reference.
 * Consumers must adopt this helper before showing text in memory_resolve_published;
 * that integration is pending. Access and cryptographic checks remain in the service.
 * The reader's run context may differ from the published material's context.
 */
function isResolveMaterialResponseForRequest(raw, expected) {
    const response = exports.ResolveMaterialResponseSchema.safeParse(raw);
    const request = exports.ResolveMaterialRequestSchema.safeParse(expected);
    if (!response.success || !request.success || response.data.status !== 'ok')
        return false;
    // Both references are parsed by the same schema, giving stable property order.
    return JSON.stringify(response.data.ref) === JSON.stringify(request.data.ref)
        && response.data.digest === request.data.ref.digest;
}
//# sourceMappingURL=publication-operations.js.map