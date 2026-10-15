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

export const ReadMaterialRequestSchema = z.strictObject({
  context: OrganizationRunContextSchema,
  ref: PublicationRefSchema,
});
export type ReadMaterialRequest = z.infer<typeof ReadMaterialRequestSchema>;

const ReadMaterialRefusalBody = { message: z.string().min(1).optional() };

export const ReadMaterialResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({
    status: z.literal('ok'),
    ref: PublicationRefSchema,
    digest: z.string().regex(/^[0-9a-f]{64}$/),
  }),
  z.strictObject({ status: z.literal('revoked'), ...ReadMaterialRefusalBody }),
  z.strictObject({ status: z.literal('not_authorized'), ...ReadMaterialRefusalBody }),
  z.strictObject({ status: z.literal('unknown_reference'), ...ReadMaterialRefusalBody }),
  z.strictObject({ status: z.literal('version_superseded'), ...ReadMaterialRefusalBody }),
  z.strictObject({ status: z.literal('digest_mismatch'), ...ReadMaterialRefusalBody }),
]);
export type ReadMaterialResponse = z.infer<typeof ReadMaterialResponseSchema>;
