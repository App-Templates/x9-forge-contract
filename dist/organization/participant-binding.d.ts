import { z } from 'zod';
/** Roles an organization participant may be authorized to hold. */
export declare const ParticipantRoleSchema: z.ZodEnum<{
    lead: "lead";
    member: "member";
    reviewer: "reviewer";
    observer: "observer";
}>;
export type ParticipantRole = z.infer<typeof ParticipantRoleSchema>;
/** Complete agent identity: every namespace is required (no legacy absence). */
export declare const ParticipantAgentIdentitySchema: z.ZodObject<{
    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    vaultAgentId: z.ZodNumber;
}, z.core.$strict>;
export type ParticipantAgentIdentity = z.infer<typeof ParticipantAgentIdentitySchema>;
/**
 * Authoritative binding between a Forge/X9 agent and one external organization
 * participant. Persisted in the agent profile: carries no run or session field.
 */
export declare const ParticipantBindingSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    agentIdentity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    participantId: z.ZodString;
    /** Attested person (never model-provided); required by the apply operation. */
    personRef: z.ZodOptional<z.ZodString>;
    roles: z.ZodArray<z.ZodEnum<{
        lead: "lead";
        member: "member";
        reviewer: "reviewer";
        observer: "observer";
    }>>;
    recipients: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"organization">;
        id: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"group">;
        id: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"project">;
        id: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"department">;
        id: z.ZodString;
    }, z.core.$strict>], "kind">>;
    appliedVersion: z.ZodNumber;
    appliedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type ParticipantBinding = z.infer<typeof ParticipantBindingSchema>;
export declare const ParticipantBindingOutcomeSchema: z.ZodEnum<{
    ambiguous: "ambiguous";
    bound: "bound";
    unknown_participant: "unknown_participant";
    foreign_scope: "foreign_scope";
}>;
export type ParticipantBindingOutcome = z.infer<typeof ParticipantBindingOutcomeSchema>;
/** Result of resolving an external participant ID to a bound agent. */
export declare const ParticipantBindingResolutionSchema: z.ZodObject<{
    outcome: z.ZodEnum<{
        ambiguous: "ambiguous";
        bound: "bound";
        unknown_participant: "unknown_participant";
        foreign_scope: "foreign_scope";
    }>;
    participantId: z.ZodString;
    reason: z.ZodString;
}, z.core.$strict>;
export type ParticipantBindingResolution = z.infer<typeof ParticipantBindingResolutionSchema>;
/** Binding key: one binding per (organization, person, agent). Person is mandatory. */
export declare const ParticipantBindingKeySchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    agentIdentity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    organizationId: z.ZodString;
    personRef: z.ZodString;
}, z.core.$strict>;
export type ParticipantBindingKey = z.infer<typeof ParticipantBindingKeySchema>;
/** Receipt of an applied (or withdrawn) binding, issued by the owning service. */
export declare const ParticipantBindingReceiptSchema: z.ZodObject<{
    key: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        agentIdentity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        organizationId: z.ZodString;
        personRef: z.ZodString;
    }, z.core.$strict>;
    appliedVersion: z.ZodNumber;
    digest: z.ZodString;
    appliedAt: z.ZodISODateTime;
    withdrawnAt: z.ZodOptional<z.ZodISODateTime>;
}, z.core.$strict>;
export type ParticipantBindingReceipt = z.infer<typeof ParticipantBindingReceiptSchema>;
/** Selector to resolve the binding of a person for an agent in an organization. */
export declare const ParticipantBindingSelectorSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    agentIdentity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    organizationId: z.ZodString;
    personRef: z.ZodString;
}, z.core.$strict>;
export type ParticipantBindingSelector = z.infer<typeof ParticipantBindingSelectorSchema>;
//# sourceMappingURL=participant-binding.d.ts.map