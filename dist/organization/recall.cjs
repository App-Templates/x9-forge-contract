"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationRecallReferenceSchema = exports.OrganizationRecallContextSchema = void 0;
const zod_1 = require("zod");
const run_context_js_1 = require("./run-context.cjs");
const publication_ref_js_1 = require("./publication-ref.cjs");
/** Organizational context a recall request is made on behalf of. */
exports.OrganizationRecallContextSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    recipient: publication_ref_js_1.PublicationRecipientSchema,
});
/** Authorized reference returned by recall. Carries no content. */
exports.OrganizationRecallReferenceSchema = zod_1.z.strictObject({
    ref: publication_ref_js_1.PublicationRefSchema,
    authorizedAt: zod_1.z.iso.datetime(),
    bindingVersion: zod_1.z.number().int().positive(),
});
//# sourceMappingURL=recall.js.map