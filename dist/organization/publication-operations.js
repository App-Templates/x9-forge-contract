import { z } from 'zod';
import { OrganizationRunContextSchema } from "./run-context.js";
import { PublicationRecipientSchema, PublicationRefSchema, PublicationSourceScopeSchema, } from "./publication-ref.js";
/** Publish a material. Tenant and owner come from the run context, never from the caller. */
export const PublishMaterialRequestSchema = z
    .strictObject({
    context: OrganizationRunContextSchema,
    sourceScope: PublicationSourceScopeSchema,
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    recipient: PublicationRecipientSchema,
    digest: z.string().regex(/^[0-9a-f]{64}$/),
    /** Opaque reference to the content; the content itself never travels here. */
    contentRef: z.string().min(1),
    explicit: z.boolean().optional(),
})
    .refine((req) => req.sourceScope !== 'private' || req.explicit === true, {
    message: 'Publishing from a private scope requires explicit: true',
    path: ['explicit'],
});
export const PUBLISH_MATERIAL_ERROR_CODES = ['not_authorized', 'invalid_recipient'];
export const PublishMaterialErrorCodeSchema = z.enum(PUBLISH_MATERIAL_ERROR_CODES);
export const PublishMaterialResponseSchema = z.discriminatedUnion('status', [
    z.strictObject({ status: z.literal('published'), ref: PublicationRefSchema }),
    z.strictObject({
        status: z.literal('error'),
        code: PublishMaterialErrorCodeSchema,
        message: z.string().min(1).optional(),
    }),
]);
export const ReadMaterialRequestSchema = z.strictObject({
    context: OrganizationRunContextSchema,
    ref: PublicationRefSchema,
});
const ReadMaterialRefusalBody = { message: z.string().min(1).optional() };
const ReadMaterialSuccessSchema = z.strictObject({
    status: z.literal('ok'),
    ref: PublicationRefSchema,
    digest: z.string().regex(/^[0-9a-f]{64}$/),
});
const ReadMaterialRevokedSchema = z.strictObject({ status: z.literal('revoked'), ...ReadMaterialRefusalBody });
const ReadMaterialNotAuthorizedSchema = z.strictObject({ status: z.literal('not_authorized'), ...ReadMaterialRefusalBody });
const ReadMaterialUnknownReferenceSchema = z.strictObject({ status: z.literal('unknown_reference'), ...ReadMaterialRefusalBody });
const ReadMaterialVersionSupersededSchema = z.strictObject({ status: z.literal('version_superseded'), ...ReadMaterialRefusalBody });
const ReadMaterialDigestMismatchSchema = z.strictObject({ status: z.literal('digest_mismatch'), ...ReadMaterialRefusalBody });
const ReadMaterialRefusalSchemas = [
    ReadMaterialRevokedSchema,
    ReadMaterialNotAuthorizedSchema,
    ReadMaterialUnknownReferenceSchema,
    ReadMaterialVersionSupersededSchema,
    ReadMaterialDigestMismatchSchema,
];
export const ReadMaterialResponseSchema = z.discriminatedUnion('status', [
    ReadMaterialSuccessSchema,
    ...ReadMaterialRefusalSchemas,
]);
export const ResolveMaterialRequestSchema = ReadMaterialRequestSchema;
const ResolveMaterialSuccessSchema = ReadMaterialSuccessSchema.extend({
    content: z.strictObject({
        mediaType: z.literal('text/plain'),
        text: z.string().max(65536),
    }),
    contentDigest: z.string().min(1),
});
export const ResolveMaterialResponseSchema = z.discriminatedUnion('status', [
    ResolveMaterialSuccessSchema,
    ...ReadMaterialRefusalSchemas,
]);
//# sourceMappingURL=publication-operations.js.map