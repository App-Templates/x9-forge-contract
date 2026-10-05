"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabProjectConfigSchema = exports.KindSlugSchema = void 0;
const zod_1 = require("zod");
const project_js_1 = require("../ricerca/project.cjs");
/**
 * cap-lab's part of a project (v1.28.0, Phase 54): the conventions of the project's wiki. The kinds of pages and of
 * links are chosen by the project (cooking: technique, ingredient, pairing…; Enterprise Adoption: process, tool…),
 * never fixed by this contract. Written by Forge with `PUT /internal/projects/:projectId/config`.
 */
exports.KindSlugSchema = zod_1.z.string().regex(/^[a-z][a-z0-9_]{0,39}$/);
exports.LabProjectConfigSchema = zod_1.z.object({
    projectId: project_js_1.ProjectIdSchema,
    version: project_js_1.ProjectConfigVersionSchema,
    /** The knowledge domain (slug), e.g. `cucina`. */
    domain: zod_1.z.string().regex(/^[a-z][a-z0-9-]{1,39}$/),
    /** What a good page is in this domain: the wiki's own conventions file, read by the model that writes it. */
    conventions: zod_1.z.string().trim().min(1).max(8000),
    pageKinds: zod_1.z.array(exports.KindSlugSchema).min(1).max(30),
    linkKinds: zod_1.z.array(exports.KindSlugSchema).min(1).max(30),
}).strict().refine(c => new Set(c.pageKinds).size === c.pageKinds.length && new Set(c.linkKinds).size === c.linkKinds.length, { message: 'kinds must be unique' });
//# sourceMappingURL=project.js.map