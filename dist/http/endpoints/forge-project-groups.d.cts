import { z } from 'zod';
/**
 * B8 — read-only access to Forge «Progetto» groups for the external project view.
 * Direction: project view app -> Forge factory-svc
 * Auth: X-Internal-Token carrying a DEDICATED read-only service secret
 *       (never Forge's INTERNAL_SERVICE_TOKEN, never Forge user keys).
 * Writes stay in Forge (superadmin UI); this contract has no write route.
 *
 * Design: forge-v2 docs/design/VISTA-PROGETTO.md §0 (agents of a project view come
 * from the Forge group of type «Progetto»), HANDOFF-COSTRUZIONE §2 and PIANO-SVILUPPI B8.
 * Version: reserved 1.31.0 in ~/.claude/agent-coordination/BRIDGE-VERSIONI.md.
 */
/** Group types, one level only (HANDOFF §2). Moved here from forge-v2 @forge/types (30-01). */
export declare const GROUP_TYPES: readonly ["Azienda", "BU", "Progetto", "Cliente", "Altro"];
export declare const GroupTypeSchema: z.ZodEnum<{
    Azienda: "Azienda";
    BU: "BU";
    Progetto: "Progetto";
    Cliente: "Cliente";
    Altro: "Altro";
}>;
export type GroupType = z.infer<typeof GroupTypeSchema>;
/** The only type this contract exposes. */
export declare const PROJECT_GROUP_TYPE: "Progetto";
export declare const ProjectGroupSummarySchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    objective: z.ZodNullable<z.ZodString>;
    agentCount: z.ZodNumber;
}, z.core.$strict>;
export type ProjectGroupSummary = z.infer<typeof ProjectGroupSummarySchema>;
export declare const ListProjectGroupsResponseSchema: z.ZodObject<{
    groups: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        objective: z.ZodNullable<z.ZodString>;
        agentCount: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ListProjectGroupsResponse = z.infer<typeof ListProjectGroupsResponseSchema>;
export declare const ProjectGroupParamsSchema: z.ZodObject<{
    groupId: z.ZodCoercedNumber<unknown>;
}, z.core.$strict>;
export type ProjectGroupParams = z.infer<typeof ProjectGroupParamsSchema>;
export declare const ProjectGroupAgentSchema: z.ZodObject<{
    agentId: z.ZodString;
    displayName: z.ZodString;
    capabilities: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type ProjectGroupAgent = z.infer<typeof ProjectGroupAgentSchema>;
export declare const ProjectGroupDetailResponseSchema: z.ZodObject<{
    group: z.ZodObject<{
        name: z.ZodString;
        id: z.ZodNumber;
        objective: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    agents: z.ZodArray<z.ZodObject<{
        agentId: z.ZodString;
        displayName: z.ZodString;
        capabilities: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ProjectGroupDetailResponse = z.infer<typeof ProjectGroupDetailResponseSchema>;
export declare const PROJECT_GROUPS_PATH: "/api/internal/project-groups";
export declare const PROJECT_GROUP_PATH_TEMPLATE: "/api/internal/project-groups/:groupId";
export declare const projectGroupPath: (groupId: number) => string;
export declare const listProjectGroupsContract: {
    readonly method: "GET";
    readonly path: "/api/internal/project-groups";
    readonly authType: "token";
    readonly responseSchema: z.ZodObject<{
        groups: z.ZodArray<z.ZodObject<{
            id: z.ZodNumber;
            name: z.ZodString;
            objective: z.ZodNullable<z.ZodString>;
            agentCount: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
export declare const getProjectGroupContract: {
    readonly method: "GET";
    readonly path: "/api/internal/project-groups/:groupId";
    readonly authType: "token";
    readonly paramsSchema: z.ZodObject<{
        groupId: z.ZodCoercedNumber<unknown>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        group: z.ZodObject<{
            name: z.ZodString;
            id: z.ZodNumber;
            objective: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        agents: z.ZodArray<z.ZodObject<{
            agentId: z.ZodString;
            displayName: z.ZodString;
            capabilities: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
//# sourceMappingURL=forge-project-groups.d.ts.map