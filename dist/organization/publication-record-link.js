import { z } from 'zod';
import { PublicationRefSchema } from "./publication-ref.js";
/** Canonical provenance of a record derived from a publication. */
export const PublicationRecordLinkSchema = z.strictObject({
    tenantId: z.string().min(1),
    source: PublicationRefSchema,
    target: z.discriminatedUnion('kind', [
        z.strictObject({
            kind: z.literal('knowledge'),
            slug: PublicationRefSchema.shape.slug,
            version: PublicationRefSchema.shape.version,
            digest: PublicationRefSchema.shape.digest,
        }),
        z.strictObject({
            kind: z.literal('experience'),
            recordId: z.string().min(1),
            version: PublicationRefSchema.shape.version,
            digest: PublicationRefSchema.shape.digest,
        }),
    ]),
    derivationKey: z.string().min(1),
});
export const PublicationRecordLinkStateSchema = z.enum(['active', 'superseded', 'withdrawn']);
export const PublicationRecordLinkViewSchema = PublicationRecordLinkSchema.extend({
    state: PublicationRecordLinkStateSchema,
    updatedAt: z.iso.datetime(),
});
//# sourceMappingURL=publication-record-link.js.map