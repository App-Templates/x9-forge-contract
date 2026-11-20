import { z } from 'zod';
import { type ParticipantBinding, type ParticipantBindingReceipt } from "./participant-binding.js";
/**
 * One rule for "who is the Director of this project", shared by every service (R-14). With one Director per
 * project, several Directors live in the same organization: the Director of a project is the agent that holds
 * a live binding with role `director` on that project (recipient `{ kind: 'project', id }`), and, for a Paperclip
 * project, is also its lead. The function is pure: no clock, no I/O, no agent names.
 */
export declare const PROJECT_DIRECTOR_REFUSALS: readonly ["project_without_director", "project_director_ambiguous", "lead_not_director", "lead_not_bound"];
export declare const ProjectDirectorRefusalSchema: z.ZodEnum<{
    project_without_director: "project_without_director";
    project_director_ambiguous: "project_director_ambiguous";
    lead_not_director: "lead_not_director";
    lead_not_bound: "lead_not_bound";
}>;
export type ProjectDirectorRefusal = z.infer<typeof ProjectDirectorRefusalSchema>;
export declare const PROJECT_DIRECTOR_SOURCES: readonly ["paperclip_project", "memory_project"];
export declare const ProjectDirectorSourceSchema: z.ZodEnum<{
    paperclip_project: "paperclip_project";
    memory_project: "memory_project";
}>;
export type ProjectDirectorSource = z.infer<typeof ProjectDirectorSourceSchema>;
export declare const ProjectDirectorDecisionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    resolved: z.ZodLiteral<true>;
    source: z.ZodEnum<{
        paperclip_project: "paperclip_project";
        memory_project: "memory_project";
    }>;
    agentIdentity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    participantId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    resolved: z.ZodLiteral<false>;
    source: z.ZodEnum<{
        paperclip_project: "paperclip_project";
        memory_project: "memory_project";
    }>;
    refusal: z.ZodEnum<{
        project_without_director: "project_without_director";
        project_director_ambiguous: "project_director_ambiguous";
        lead_not_director: "lead_not_director";
        lead_not_bound: "lead_not_bound";
    }>;
    reason: z.ZodString;
}, z.core.$strict>], "resolved">;
export type ProjectDirectorDecision = z.infer<typeof ProjectDirectorDecisionSchema>;
export interface ProjectDirectorInput {
    tenantId: string;
    ownerId: string;
    organizationId: string;
    /**
     * `projectId` is the name of the Paperclip project. `leadAgentId` is compared with `binding.participantId`
     * (in production the `participantId` of the Director is its Paperclip id). The caller passes only projects
     * that are not archived.
     */
    project: {
        source: 'paperclip_project';
        projectId: string;
        leadAgentId: string | null;
    } | {
        source: 'memory_project';
        projectId: string;
    };
    /** Items of the participant binding list: `{ binding, receipt }`. */
    bindings: ReadonlyArray<{
        binding: ParticipantBinding;
        receipt: ParticipantBindingReceipt;
    }>;
}
/** Decides which agent is the Director of the project. */
export declare function projectDirector(input: ProjectDirectorInput): ProjectDirectorDecision;
//# sourceMappingURL=project-director.d.ts.map