"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicationRecordLinkViewSchema = exports.PublicationRecordLinkStateSchema = exports.PublicationRecordLinkSchema = void 0;
const zod_1 = require("zod");
const publication_ref_js_1 = require("./publication-ref.cjs");
/** Canonical provenance of a record derived from a publication. */
exports.PublicationRecordLinkSchema = zod_1.z.strictObject({
    tenantId: zod_1.z.string().min(1),
    source: publication_ref_js_1.PublicationRefSchema,
    target: zod_1.z.discriminatedUnion('kind', [
        zod_1.z.strictObject({
            kind: zod_1.z.literal('knowledge'),
            slug: publication_ref_js_1.PublicationRefSchema.shape.slug,
            version: publication_ref_js_1.PublicationRefSchema.shape.version,
            digest: publication_ref_js_1.PublicationRefSchema.shape.digest,
        }),
        zod_1.z.strictObject({
            kind: zod_1.z.literal('experience'),
            recordId: zod_1.z.string().min(1),
            version: publication_ref_js_1.PublicationRefSchema.shape.version,
            digest: publication_ref_js_1.PublicationRefSchema.shape.digest,
        }),
    ]),
    derivationKey: zod_1.z.string().min(1),
});
exports.PublicationRecordLinkStateSchema = zod_1.z.enum(['active', 'superseded', 'withdrawn']);
exports.PublicationRecordLinkViewSchema = exports.PublicationRecordLinkSchema.extend({
    state: exports.PublicationRecordLinkStateSchema,
    updatedAt: zod_1.z.iso.datetime(),
});
//# sourceMappingURL=publication-record-link.js.map