"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyMemoryEntryRefSchema = exports.CompanyMemoryScopeSchema = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const run_context_js_1 = require("./run-context.cjs");
/** Private memory belongs to one agent and is never company memory. */
exports.CompanyMemoryScopeSchema = zod_1.z.enum(['private', 'team', 'organization']);
/** A memory reference; organization-wide entries require a publication reference. */
exports.CompanyMemoryEntryRefSchema = zod_1.z
    .strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    scope: exports.CompanyMemoryScopeSchema,
    entryId: zod_1.z.string().min(1),
    ownerAgentId: agent_identity_js_1.AgentIdSchema,
    publishedFrom: zod_1.z.strictObject({ publicationSlug: zod_1.z.string().min(1) }).optional(),
})
    .refine((entry) => entry.scope !== 'organization' || entry.publishedFrom !== undefined, {
    message: 'Organization memory requires a publication slug',
    path: ['publishedFrom', 'publicationSlug'],
})
    .refine((entry) => entry.scope !== 'private' || entry.publishedFrom === undefined, {
    message: 'Private memory cannot have a publication reference',
    path: ['publishedFrom'],
});
//# sourceMappingURL=company-memory.js.map