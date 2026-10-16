import { z } from 'zod';
import { OrganizationRunContextSchema } from './run-context.js';
import {
  PublicationRecipientSchema,
  PublicationRefSchema,
  PublicationSourceScopeSchema,
} from './publication-ref.js';

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
export type PublishMaterialRequest = z.infer<typeof PublishMaterialRequestSchema>;

export const PUBLISH_MATERIAL_ERROR_CODES = ['not_authorized', 'invalid_recipient'] as const;
export const PublishMaterialErrorCodeSchema = z.enum(PUBLISH_MATERIAL_ERROR_CODES);
export type PublishMaterialErrorCode = z.infer<typeof PublishMaterialErrorCodeSchema>;

export const PublishMaterialResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('published'), ref: PublicationRefSchema }),
  z.strictObject({
    status: z.literal('error'),
    code: PublishMaterialErrorCodeSchema,
    message: z.string().min(1).optional(),
  }),
]);
export type PublishMaterialResponse = z.infer<typeof PublishMaterialResponseSchema>;

/**
 * Correlates a published receipt with its validated request, not authorization.
 * Version is assigned by the service; contentRef persistence is not attested here.
 * Adoption in X9 services/memory/src/organization/publication-service.ts is pending
 * (consumer task 250), before advancing the requested material's publication.
 */
export function isPublishMaterialResponseForRequest(raw: unknown, expected: unknown): boolean {
  const response = PublishMaterialResponseSchema.safeParse(raw);
  const request = PublishMaterialRequestSchema.safeParse(expected);
  if (!response.success || !request.success || response.data.status !== 'published') return false;

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

export const ReadMaterialRequestSchema = z.strictObject({
  context: OrganizationRunContextSchema,
  ref: PublicationRefSchema,
});
export type ReadMaterialRequest = z.infer<typeof ReadMaterialRequestSchema>;

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
] as const;

export const ReadMaterialResponseSchema = z.discriminatedUnion('status', [
  ReadMaterialSuccessSchema,
  ...ReadMaterialRefusalSchemas,
]);
export type ReadMaterialResponse = z.infer<typeof ReadMaterialResponseSchema>;

export const ResolveMaterialRequestSchema = ReadMaterialRequestSchema;
export type ResolveMaterialRequest = z.infer<typeof ResolveMaterialRequestSchema>;

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
export type ResolveMaterialResponse = z.infer<typeof ResolveMaterialResponseSchema>;

/**
 * Correlates resolved text with the requested publication reference.
 * Consumers must adopt this helper before showing text in memory_resolve_published;
 * that integration is pending. Access and cryptographic checks remain in the service.
 * The reader's run context may differ from the published material's context.
 */
export function isResolveMaterialResponseForRequest(raw: unknown, expected: unknown): boolean {
  const response = ResolveMaterialResponseSchema.safeParse(raw);
  const request = ResolveMaterialRequestSchema.safeParse(expected);
  if (!response.success || !request.success || response.data.status !== 'ok') return false;

  // Both references are parsed by the same schema, giving stable property order.
  return JSON.stringify(response.data.ref) === JSON.stringify(request.data.ref)
    && response.data.digest === request.data.ref.digest;
}
