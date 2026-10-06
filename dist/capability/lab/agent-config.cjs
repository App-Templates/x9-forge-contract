"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabAgentConfigSchema = exports.KindSlugSchema = void 0;
const zod_1 = require("zod");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
/**
 * cap-lab's configuration for ONE agent (v1.28.0, Phase 54): the conventions of that agent's wiki. cap-lab can be
 * attached to every agent, each filled with its own data. The kinds of pages and of links are chosen per agent
 * (cooking: technique, ingredient, pairing…; Enterprise Adoption: process, tool…), never fixed by this contract.
 * Written by Forge with `PUT /internal/capability/agents/:agentId/config`.
 */
exports.KindSlugSchema = zod_1.z.string().regex(/^[a-z][a-z0-9_]{0,39}$/);
exports.LabAgentConfigSchema = zod_1.z.object({
    agentId: agent_config_js_1.CapabilityAgentIdSchema,
    version: agent_config_js_1.AgentConfigVersionSchema,
    /** The knowledge domain (slug), e.g. `cucina`. */
    domain: zod_1.z.string().regex(/^[a-z][a-z0-9-]{1,39}$/),
    /** What a good page is in this domain: the wiki's own conventions file, read by the model that writes it. */
    conventions: zod_1.z.string().trim().min(1).max(8000),
    pageKinds: zod_1.z.array(exports.KindSlugSchema).min(1).max(30),
    linkKinds: zod_1.z.array(exports.KindSlugSchema).min(1).max(30),
}).strict().refine(c => new Set(c.pageKinds).size === c.pageKinds.length && new Set(c.linkKinds).size === c.linkKinds.length, { message: 'kinds must be unique' });
//# sourceMappingURL=agent-config.js.map