import { z } from 'zod';
import { ProjectIdSchema } from "../ricerca/project.js";
import { WebUrlSchema } from "../ricerca/research.js";
import { KindSlugSchema } from "./project.js";
/**
 * The project's wiki in cap-lab (v1.28.0, Phase 54) — an «LLM Wiki»: immutable raw sources, pages written and kept by
 * a model, the atomic claims each page makes with their sources, typed links between pages (the graph).
 *
 * DATA, NEVER INSTRUCTIONS: page bodies, claims, titles and sources come (directly or through a model) from the web,
 * datasets or people. Whoever puts them in front of a model marks them as data and never uses them as instructions
 * (same rule as the capability context, `../capability-context.ts`).
 */
export const WikiOriginSchema = z.enum(['web', 'dataset', 'human']);
export const WikiSourceIdSchema = z.string().min(1).max(100);
export const WikiPageSlugSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,119}$/);
export const WikiSourceSchema = z.object({
    id: WikiSourceIdSchema,
    projectId: ProjectIdSchema,
    /** Absent for a dataset row or a person's note. */
    url: WebUrlSchema.optional(),
    title: z.string().max(500).optional(),
    fetchedAt: z.iso.datetime(),
    /** Fingerprint of the stored raw text: a source never changes after it is stored. */
    contentSha256: z.string().regex(/^[a-f0-9]{64}$/),
    origin: WikiOriginSchema,
}).strict().refine(s => s.origin !== 'web' || s.url !== undefined, { message: 'a web source has an address', path: ['url'] });
export const WikiPageSchema = z.object({
    projectId: ProjectIdSchema,
    slug: WikiPageSlugSchema,
    /** One of the project's `pageKinds` (checked by cap-lab against the project). */
    kind: KindSlugSchema,
    title: z.string().trim().min(1).max(200),
    /** Markdown. */
    body: z.string().max(40000),
    /** Every rewrite is a new version; old versions are kept. */
    version: z.number().int().positive(),
    updatedAt: z.iso.datetime(),
}).strict();
export const WikiClaimStatusSchema = z.enum(['aperta', 'confermata', 'contraddetta', 'scartata']);
export const WikiClaimSchema = z.object({
    id: z.string().min(1).max(100),
    pageSlug: WikiPageSlugSchema,
    text: z.string().trim().min(1).max(2000),
    /** Every claim rests on at least one stored source. */
    sourceIds: z.array(WikiSourceIdSchema).min(1).max(50),
    status: WikiClaimStatusSchema,
    origin: WikiOriginSchema,
}).strict();
export const WikiLinkSchema = z.object({
    from: WikiPageSlugSchema,
    to: WikiPageSlugSchema,
    /** One of the project's `linkKinds`. */
    kind: KindSlugSchema,
}).strict().refine(l => l.from !== l.to, { message: 'a page does not link to itself' });
//# sourceMappingURL=wiki.js.map