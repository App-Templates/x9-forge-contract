import { z } from 'zod';
import { OrganizationRunContextSchema } from './run-context.js';
import { PublicationRecipientSchema, PublicationRefSchema } from './publication-ref.js';

/** Organizational context a recall request is made on behalf of. */
export const OrganizationRecallContextSchema = z.strictObject({
  context: OrganizationRunContextSchema,
  recipient: PublicationRecipientSchema,
});
export type OrganizationRecallContext = z.infer<typeof OrganizationRecallContextSchema>;

/** Authorized reference returned by recall. Carries no content. */
export const OrganizationRecallReferenceSchema = z.strictObject({
  ref: PublicationRefSchema,
  authorizedAt: z.iso.datetime(),
  bindingVersion: z.number().int().positive(),
});
export type OrganizationRecallReference = z.infer<typeof OrganizationRecallReferenceSchema>;
