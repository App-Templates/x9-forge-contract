"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicationRefSchema = exports.PublicationRecipientSchema = exports.PublicationSourceScopeSchema = void 0;
const zod_1 = require("zod");
const run_context_js_1 = require("./run-context.cjs");
/** Scope the published content comes from. */
exports.PublicationSourceScopeSchema = zod_1.z.enum(['private', 'team', 'organization']);
/** Who receives the publication. `department` is reserved: accepted as a type only. */
exports.PublicationRecipientSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('organization'), id: zod_1.z.string().min(1) }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('group'), id: zod_1.z.string().min(1) }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('project'), id: zod_1.z.string().min(1) }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('department'), id: zod_1.z.string().min(1) }),
]);
/**
 * Reference to an explicit publication. A publication never widens visibility
 * by itself: a private source requires `explicit: true`. Carries no content.
 */
exports.PublicationRefSchema = zod_1.z
    .strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    sourceScope: exports.PublicationSourceScopeSchema,
    slug: zod_1.z.string().min(1).regex(/^[a-z0-9-]+$/),
    version: zod_1.z.number().int().min(1),
    digest: zod_1.z.string().regex(/^[0-9a-f]{64}$/),
    recipient: exports.PublicationRecipientSchema,
    explicit: zod_1.z.boolean().optional(),
})
    .refine((ref) => ref.sourceScope !== 'private' || ref.explicit === true, {
    message: 'Publishing from a private scope requires explicit: true',
    path: ['explicit'],
});
//# sourceMappingURL=publication-ref.js.map