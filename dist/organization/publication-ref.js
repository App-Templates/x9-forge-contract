import { z } from 'zod';
import { OrganizationRunContextSchema } from "./run-context.js";
/** Scope the published content comes from. */
export const PublicationSourceScopeSchema = z.enum(['private', 'team', 'organization']);
/** Who receives the publication. `department` is reserved: accepted as a type only. */
export const PublicationRecipientSchema = z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('organization'), id: z.string().min(1) }),
    z.strictObject({ kind: z.literal('group'), id: z.string().min(1) }),
    z.strictObject({ kind: z.literal('project'), id: z.string().min(1) }),
    z.strictObject({ kind: z.literal('department'), id: z.string().min(1) }),
]);
/**
 * Reference to an explicit publication. A publication never widens visibility
 * by itself: a private source requires `explicit: true`. Carries no content.
 */
export const PublicationRefSchema = z
    .strictObject({
    context: OrganizationRunContextSchema,
    sourceScope: PublicationSourceScopeSchema,
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    version: z.number().int().min(1),
    digest: z.string().regex(/^[0-9a-f]{64}$/),
    recipient: PublicationRecipientSchema,
    explicit: z.boolean().optional(),
})
    .refine((ref) => ref.sourceScope !== 'private' || ref.explicit === true, {
    message: 'Publishing from a private scope requires explicit: true',
    path: ['explicit'],
});
//# sourceMappingURL=publication-ref.js.map