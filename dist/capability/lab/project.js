import { z } from 'zod';
import { ProjectConfigVersionSchema, ProjectIdSchema } from "../ricerca/project.js";
/**
 * cap-lab's part of a project (v1.28.0, Phase 54): the conventions of the project's wiki. The kinds of pages and of
 * links are chosen by the project (cooking: technique, ingredient, pairing…; Enterprise Adoption: process, tool…),
 * never fixed by this contract. Written by Forge with `PUT /internal/projects/:projectId/config`.
 */
export const KindSlugSchema = z.string().regex(/^[a-z][a-z0-9_]{0,39}$/);
export const LabProjectConfigSchema = z.object({
    projectId: ProjectIdSchema,
    version: ProjectConfigVersionSchema,
    /** The knowledge domain (slug), e.g. `cucina`. */
    domain: z.string().regex(/^[a-z][a-z0-9-]{1,39}$/),
    /** What a good page is in this domain: the wiki's own conventions file, read by the model that writes it. */
    conventions: z.string().trim().min(1).max(8000),
    pageKinds: z.array(KindSlugSchema).min(1).max(30),
    linkKinds: z.array(KindSlugSchema).min(1).max(30),
}).strict().refine(c => new Set(c.pageKinds).size === c.pageKinds.length && new Set(c.linkKinds).size === c.linkKinds.length, { message: 'kinds must be unique' });
//# sourceMappingURL=project.js.map