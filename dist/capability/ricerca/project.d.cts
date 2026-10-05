import { z } from 'zod';
/**
 * The project — the unit a research budget belongs to (v1.28.0, Phase 54).
 *
 * A project is a goal of work that uses shared capabilities with its own parameters: the «food» project (an agent
 * that studies cooking on its own with a daily budget), the Enterprise Adoption analyses, and so on. Forge is the
 * source of the configuration (the control panel where it is edited); every capability keeps ITS part, keyed by
 * `projectId`, and Forge writes it with `PUT /internal/projects/:projectId/config` (see
 * `../../http/endpoints/internal-project-config.ts`).
 *
 * This file is cap-ricerca's part: the budget it enforces, the models it calls, how it researches. No field has a
 * default chosen here: the budget, the models and the source rule are product decisions, written by the project.
 */
/** A project id: lowercase slug, stable, used in paths. */
export declare const ProjectIdSchema: z.ZodString;
export type ProjectId = z.infer<typeof ProjectIdSchema>;
/** Every change to a project's part raises its version; a capability refuses an older or equal one. */
export declare const ProjectConfigVersionSchema: z.ZodNumber;
/** IANA time zone of the project's day (the daily budget restarts at its midnight). */
export declare const ProjectTimeZoneSchema: z.ZodString;
export declare const ResearchBudgetSchema: z.ZodObject<{
    dailyUsd: z.ZodNumber;
    perResearchMaxUsd: z.ZodNumber;
    timezone: z.ZodString;
}, z.core.$strip>;
export type ResearchBudget = z.infer<typeof ResearchBudgetSchema>;
export declare const ResearchModelsSchema: z.ZodObject<{
    research: z.ZodString;
    digest: z.ZodOptional<z.ZodString>;
    read: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ResearchModels = z.infer<typeof ResearchModelsSchema>;
export declare const ResearchEffortSchema: z.ZodEnum<{
    low: "low";
    medium: "medium";
    high: "high";
}>;
export declare const ResearchParamsSchema: z.ZodObject<{
    maxToolCalls: z.ZodNumber;
    searchContextSize: z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
    }>;
    reasoningEffort: z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
    }>;
}, z.core.$strip>;
export type ResearchParams = z.infer<typeof ResearchParamsSchema>;
/**
 * Which addresses may be cited as sources:
 * - `opened_only`: only pages the research actually opened;
 * - `opened_or_search_result`: also the sources of search results (what Enterprise Adoption does up to v1.27).
 */
export declare const SourceRuleSchema: z.ZodEnum<{
    opened_only: "opened_only";
    opened_or_search_result: "opened_or_search_result";
}>;
export type SourceRule = z.infer<typeof SourceRuleSchema>;
export declare const ResearchProjectConfigSchema: z.ZodObject<{
    projectId: z.ZodString;
    version: z.ZodNumber;
    name: z.ZodString;
    objective: z.ZodString;
    budget: z.ZodObject<{
        dailyUsd: z.ZodNumber;
        perResearchMaxUsd: z.ZodNumber;
        timezone: z.ZodString;
    }, z.core.$strip>;
    models: z.ZodObject<{
        research: z.ZodString;
        digest: z.ZodOptional<z.ZodString>;
        read: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    research: z.ZodObject<{
        maxToolCalls: z.ZodNumber;
        searchContextSize: z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
        }>;
        reasoningEffort: z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
        }>;
    }, z.core.$strip>;
    sourceRule: z.ZodEnum<{
        opened_only: "opened_only";
        opened_or_search_result: "opened_or_search_result";
    }>;
    agents: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type ResearchProjectConfig = z.infer<typeof ResearchProjectConfigSchema>;
//# sourceMappingURL=project.d.ts.map