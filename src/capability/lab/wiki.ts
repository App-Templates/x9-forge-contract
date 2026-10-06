import { z } from 'zod';
import { CapabilityAgentIdSchema } from '../ricerca/agent-config.js';
import { WebUrlSchema } from '../ricerca/research.js';
import { KindSlugSchema } from './agent-config.js';

/**
 * An agent's wiki in cap-lab (v1.28.0, Phase 54) — an «LLM Wiki»: immutable raw sources, pages written and kept by
 * a model, the atomic claims each page makes with their sources, typed links between pages (the graph).
 *
 * DATA, NEVER INSTRUCTIONS: page bodies, claims, titles and sources come (directly or through a model) from the web,
 * datasets or people. Whoever puts them in front of a model marks them as data and never uses them as instructions
 * (same rule as the capability context, `../capability-context.ts`).
 */

export const WikiOriginSchema = z.enum(['web', 'dataset', 'human']);
export type WikiOrigin = z.infer<typeof WikiOriginSchema>;

export const WikiSourceIdSchema = z.string().min(1).max(100);
export const WikiPageSlugSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,119}$/);

export const WikiSourceSchema = z.object({
  id: WikiSourceIdSchema,
  agentId: CapabilityAgentIdSchema,
  /** Absent for a dataset row or a person's note. */
  url: WebUrlSchema.optional(),
  title: z.string().max(500).optional(),
  fetchedAt: z.iso.datetime(),
  /** Fingerprint of the stored raw text: a source never changes after it is stored. */
  contentSha256: z.string().regex(/^[a-f0-9]{64}$/),
  origin: WikiOriginSchema,
}).strict().refine(s => s.origin !== 'web' || s.url !== undefined, { message: 'a web source has an address', path: ['url'] });
export type WikiSource = z.infer<typeof WikiSourceSchema>;

export const WikiPageSchema = z.object({
  agentId: CapabilityAgentIdSchema,
  slug: WikiPageSlugSchema,
  /** One of the agent's `pageKinds` (checked by cap-lab against the agent's configuration). */
  kind: KindSlugSchema,
  title: z.string().trim().min(1).max(200),
  /** Markdown. */
  body: z.string().max(40000),
  /** Every rewrite is a new version; old versions are kept. */
  version: z.number().int().positive(),
  updatedAt: z.iso.datetime(),
}).strict();
export type WikiPage = z.infer<typeof WikiPageSchema>;

export const WikiClaimStatusSchema = z.enum(['aperta', 'confermata', 'contraddetta', 'scartata']);
export type WikiClaimStatus = z.infer<typeof WikiClaimStatusSchema>;

export const WikiClaimSchema = z.object({
  id: z.string().min(1).max(100),
  pageSlug: WikiPageSlugSchema,
  text: z.string().trim().min(1).max(2000),
  /** Every claim rests on at least one stored source. */
  sourceIds: z.array(WikiSourceIdSchema).min(1).max(50),
  status: WikiClaimStatusSchema,
  origin: WikiOriginSchema,
}).strict();
export type WikiClaim = z.infer<typeof WikiClaimSchema>;

export const WikiLinkSchema = z.object({
  from: WikiPageSlugSchema,
  to: WikiPageSlugSchema,
  /** One of the agent's `linkKinds`. */
  kind: KindSlugSchema,
}).strict().refine(l => l.from !== l.to, { message: 'a page does not link to itself' });
export type WikiLink = z.infer<typeof WikiLinkSchema>;
