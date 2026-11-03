import { z } from 'zod';
import { AgentIdSchema } from "../agent/agent-identity.js";
import { OrganizationRunContextSchema } from "./run-context.js";
/** Private memory belongs to one agent and is never company memory. */
export const CompanyMemoryScopeSchema = z.enum(['private', 'team', 'organization']);
/** A memory reference; organization-wide entries require a publication reference. */
export const CompanyMemoryEntryRefSchema = z
    .strictObject({
    context: OrganizationRunContextSchema,
    scope: CompanyMemoryScopeSchema,
    entryId: z.string().min(1),
    ownerAgentId: AgentIdSchema,
    publishedFrom: z.strictObject({ publicationSlug: z.string().min(1) }).optional(),
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