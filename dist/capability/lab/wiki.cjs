"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WikiLinkSchema = exports.WikiClaimSchema = exports.WikiClaimStatusSchema = exports.WikiPageSchema = exports.WikiSourceSchema = exports.WikiPageSlugSchema = exports.WikiSourceIdSchema = exports.WikiOriginSchema = void 0;
const zod_1 = require("zod");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const research_js_1 = require("../ricerca/research.cjs");
const agent_config_js_2 = require("./agent-config.cjs");
/**
 * An agent's wiki in cap-lab (v1.28.0, Phase 54) — an «LLM Wiki»: immutable raw sources, pages written and kept by
 * a model, the atomic claims each page makes with their sources, typed links between pages (the graph).
 *
 * DATA, NEVER INSTRUCTIONS: page bodies, claims, titles and sources come (directly or through a model) from the web,
 * datasets or people. Whoever puts them in front of a model marks them as data and never uses them as instructions
 * (same rule as the capability context, `../capability-context.ts`).
 */
exports.WikiOriginSchema = zod_1.z.enum(['web', 'dataset', 'human']);
exports.WikiSourceIdSchema = zod_1.z.string().min(1).max(100);
exports.WikiPageSlugSchema = zod_1.z.string().regex(/^[a-z0-9][a-z0-9-]{0,119}$/);
exports.WikiSourceSchema = zod_1.z.object({
    id: exports.WikiSourceIdSchema,
    agentId: agent_config_js_1.CapabilityAgentIdSchema,
    /** Absent for a dataset row or a person's note. */
    url: research_js_1.WebUrlSchema.optional(),
    title: zod_1.z.string().max(500).optional(),
    fetchedAt: zod_1.z.iso.datetime(),
    /** Fingerprint of the stored raw text: a source never changes after it is stored. */
    contentSha256: zod_1.z.string().regex(/^[a-f0-9]{64}$/),
    origin: exports.WikiOriginSchema,
}).strict().refine(s => s.origin !== 'web' || s.url !== undefined, { message: 'a web source has an address', path: ['url'] });
exports.WikiPageSchema = zod_1.z.object({
    agentId: agent_config_js_1.CapabilityAgentIdSchema,
    slug: exports.WikiPageSlugSchema,
    /** One of the agent's `pageKinds` (checked by cap-lab against the agent's configuration). */
    kind: agent_config_js_2.KindSlugSchema,
    title: zod_1.z.string().trim().min(1).max(200),
    /** Markdown. */
    body: zod_1.z.string().max(40000),
    /** Every rewrite is a new version; old versions are kept. */
    version: zod_1.z.number().int().positive(),
    updatedAt: zod_1.z.iso.datetime(),
}).strict();
exports.WikiClaimStatusSchema = zod_1.z.enum(['aperta', 'confermata', 'contraddetta', 'scartata']);
exports.WikiClaimSchema = zod_1.z.object({
    id: zod_1.z.string().min(1).max(100),
    pageSlug: exports.WikiPageSlugSchema,
    text: zod_1.z.string().trim().min(1).max(2000),
    /** Every claim rests on at least one stored source. */
    sourceIds: zod_1.z.array(exports.WikiSourceIdSchema).min(1).max(50),
    status: exports.WikiClaimStatusSchema,
    origin: exports.WikiOriginSchema,
}).strict();
exports.WikiLinkSchema = zod_1.z.object({
    from: exports.WikiPageSlugSchema,
    to: exports.WikiPageSlugSchema,
    /** One of the agent's `linkKinds`. */
    kind: agent_config_js_2.KindSlugSchema,
}).strict().refine(l => l.from !== l.to, { message: 'a page does not link to itself' });
//# sourceMappingURL=wiki.js.map