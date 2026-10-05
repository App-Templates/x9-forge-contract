import { z } from 'zod';
/**
 * cap-lab's part of a project (v1.28.0, Phase 54): the conventions of the project's wiki. The kinds of pages and of
 * links are chosen by the project (cooking: technique, ingredient, pairing…; Enterprise Adoption: process, tool…),
 * never fixed by this contract. Written by Forge with `PUT /internal/projects/:projectId/config`.
 */
export declare const KindSlugSchema: z.ZodString;
export declare const LabProjectConfigSchema: z.ZodObject<{
    projectId: z.ZodString;
    version: z.ZodNumber;
    domain: z.ZodString;
    conventions: z.ZodString;
    pageKinds: z.ZodArray<z.ZodString>;
    linkKinds: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type LabProjectConfig = z.infer<typeof LabProjectConfigSchema>;
//# sourceMappingURL=project.d.ts.map