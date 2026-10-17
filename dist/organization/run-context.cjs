"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationRunContextSchema = exports.OrganizationRunIssuerSchema = exports.RunIdSchema = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const agent_runtime_identity_js_1 = require("../agent/agent-runtime-identity.cjs");
/** Branded identifier of one run of an organization (agentic team). */
exports.RunIdSchema = zod_1.z.string().min(1).brand();
/** Who issued the run context. */
exports.OrganizationRunIssuerSchema = zod_1.z.enum(['x9', 'forge', 'paperclip']);
/**
 * Trusted context of one organization run. Carries identity and validity only:
 * no secrets, no private content, no free-form fields (strictObject).
 */
exports.OrganizationRunContextSchema = zod_1.z
    .strictObject({
    schemaVersion: zod_1.z.literal(1),
    runId: exports.RunIdSchema,
    organizationId: zod_1.z.string().min(1),
    ownerId: agent_identity_js_1.OwnerIdSchema,
    identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema,
    issuer: exports.OrganizationRunIssuerSchema,
    issuedAt: zod_1.z.iso.datetime(),
    expiresAt: zod_1.z.iso.datetime(),
})
    .refine((ctx) => Date.parse(ctx.expiresAt) > Date.parse(ctx.issuedAt), {
    message: 'expiresAt must be after issuedAt',
    path: ['expiresAt'],
});
//# sourceMappingURL=run-context.js.map