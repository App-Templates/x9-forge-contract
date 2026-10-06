import { z } from 'zod';
import { AgentConfigVersionSchema, CapabilityAgentIdSchema } from "../ricerca/agent-config.js";
/**
 * cap-lab's configuration for ONE agent (v1.28.0, Phase 54): the conventions of that agent's wiki. cap-lab can be
 * attached to every agent, each filled with its own data. The kinds of pages and of links are chosen per agent
 * (cooking: technique, ingredient, pairing…; Enterprise Adoption: process, tool…), never fixed by this contract.
 * Written by Forge with `PUT /internal/capability/agents/:agentId/config`.
 */
export const KindSlugSchema = z.string().regex(/^[a-z][a-z0-9_]{0,39}$/);
export const LabAgentConfigSchema = z.object({
    agentId: CapabilityAgentIdSchema,
    version: AgentConfigVersionSchema,
    /** The knowledge domain (slug), e.g. `cucina`. */
    domain: z.string().regex(/^[a-z][a-z0-9-]{1,39}$/),
    /** What a good page is in this domain: the wiki's own conventions file, read by the model that writes it. */
    conventions: z.string().trim().min(1).max(8000),
    pageKinds: z.array(KindSlugSchema).min(1).max(30),
    linkKinds: z.array(KindSlugSchema).min(1).max(30),
}).strict().refine(c => new Set(c.pageKinds).size === c.pageKinds.length && new Set(c.linkKinds).size === c.linkKinds.length, { message: 'kinds must be unique' });
//# sourceMappingURL=agent-config.js.map