import { z } from 'zod';
/**
 * cap-lab's configuration for ONE agent (v1.28.0, Phase 54): the conventions of that agent's wiki. cap-lab can be
 * attached to every agent, each filled with its own data. The kinds of pages and of links are chosen per agent
 * (cooking: technique, ingredient, pairing…; Enterprise Adoption: process, tool…), never fixed by this contract.
 * Written by Forge with `PUT /internal/capability/agents/:agentId/config`.
 */
export declare const KindSlugSchema: z.ZodString;
export declare const LabBudgetSchema: z.ZodObject<{
    dailyUsd: z.ZodNumber;
    perIngestMaxUsd: z.ZodNumber;
    timezone: z.ZodString;
}, z.core.$strict>;
export type LabBudget = z.infer<typeof LabBudgetSchema>;
export declare const LabModelsSchema: z.ZodObject<{
    digest: z.ZodString;
    read: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type LabModels = z.infer<typeof LabModelsSchema>;
export declare const LabAgentConfigSchema: z.ZodObject<{
    agentId: z.ZodString;
    version: z.ZodNumber;
    models: z.ZodObject<{
        digest: z.ZodString;
        read: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    budget: z.ZodObject<{
        dailyUsd: z.ZodNumber;
        perIngestMaxUsd: z.ZodNumber;
        timezone: z.ZodString;
    }, z.core.$strict>;
    domain: z.ZodString;
    conventions: z.ZodString;
    pageKinds: z.ZodArray<z.ZodString>;
    linkKinds: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type LabAgentConfig = z.infer<typeof LabAgentConfigSchema>;
//# sourceMappingURL=agent-config.d.ts.map