import { z } from 'zod';
export declare const PaperclipAssignmentPermissionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    form: z.ZodLiteral<"none">;
}, z.core.$strict>, z.ZodObject<{
    form: z.ZodLiteral<"broad">;
}, z.core.$strict>, z.ZodObject<{
    form: z.ZodLiteral<"list">;
    agentIds: z.ZodArray<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    form: z.ZodLiteral<"branch">;
    rootAgentIds: z.ZodArray<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    form: z.ZodLiteral<"list_and_branch">;
    agentIds: z.ZodArray<z.ZodString>;
    rootAgentIds: z.ZodArray<z.ZodString>;
}, z.core.$strict>], "form">;
export type PaperclipAssignmentPermission = z.infer<typeof PaperclipAssignmentPermissionSchema>;
export declare const PaperclipAssignmentOrganizationSchema: z.ZodRecord<z.ZodString, z.ZodObject<{
    reportsTo: z.ZodNullable<z.ZodString>;
}, z.core.$strict>>;
export type PaperclipAssignmentOrganization = z.infer<typeof PaperclipAssignmentOrganizationSchema>;
export declare const PAPERCLIP_RECIPIENT_PROTECTIONS: readonly ["open", "protected", "blocked"];
export type PaperclipRecipientProtection = (typeof PAPERCLIP_RECIPIENT_PROTECTIONS)[number];
export declare const PaperclipAssignmentFactsSchema: z.ZodObject<{
    permission: z.ZodDiscriminatedUnion<[z.ZodObject<{
        form: z.ZodLiteral<"none">;
    }, z.core.$strict>, z.ZodObject<{
        form: z.ZodLiteral<"broad">;
    }, z.core.$strict>, z.ZodObject<{
        form: z.ZodLiteral<"list">;
        agentIds: z.ZodArray<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        form: z.ZodLiteral<"branch">;
        rootAgentIds: z.ZodArray<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        form: z.ZodLiteral<"list_and_branch">;
        agentIds: z.ZodArray<z.ZodString>;
        rootAgentIds: z.ZodArray<z.ZodString>;
    }, z.core.$strict>], "form">;
    assigner: z.ZodString;
    recipient: z.ZodString;
    organization: z.ZodRecord<z.ZodString, z.ZodObject<{
        reportsTo: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
    recipientProtection: z.ZodEnum<{
        blocked: "blocked";
        open: "open";
        protected: "protected";
    }>;
}, z.core.$strict>;
export type PaperclipAssignmentFacts = z.infer<typeof PaperclipAssignmentFactsSchema>;
export declare const PAPERCLIP_ASSIGNMENT_BASES: readonly ["recipient_open", "broad_permission", "listed", "in_branch", "listed_and_in_branch"];
export type PaperclipAssignmentBasis = (typeof PAPERCLIP_ASSIGNMENT_BASES)[number];
export declare const PAPERCLIP_ASSIGNMENT_PERMISSION_REFUSALS: readonly ["facts_malformed", "permission_malformed", "organization_malformed", "protection_malformed", "organization_cycle", "unknown_agent", "recipient_blocked", "no_permission", "recipient_not_in_list", "recipient_not_in_branch"];
export type PaperclipAssignmentPermissionRefusal = (typeof PAPERCLIP_ASSIGNMENT_PERMISSION_REFUSALS)[number];
export type PaperclipAssignmentPermissionDecision = {
    ok: true;
    basis: PaperclipAssignmentBasis;
} | {
    ok: false;
    refusal: PaperclipAssignmentPermissionRefusal;
};
/** Pure decision over validated facts; no settings, I/O or implicit identities. */
export declare function decideAssignmentByPermission(facts: unknown): PaperclipAssignmentPermissionDecision;
//# sourceMappingURL=assignment-permission.d.ts.map