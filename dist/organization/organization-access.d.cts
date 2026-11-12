import { z } from 'zod';
import { type ParticipantAgentIdentity, type ParticipantBinding, type ParticipantBindingReceipt } from "./participant-binding.cjs";
/**
 * One access rule for the organization, shared by every service (R-14), in two levels as in Paperclip:
 * - level 1 `read`: every active member of the organization reads (Paperclip `allow_company_agent`);
 * - level 2 `manage`: only the Director manages (Paperclip: CEO over other agents' work).
 *
 * The organization is always the one of the resource being read, taken by the caller from the resource itself,
 * never declared by the agent or the model. The actor's three ids come from the verified run context. The
 * function is pure: no clock, no I/O, no agent names.
 */
export declare const ORGANIZATION_ACCESS_NEEDS: readonly ["read", "manage"];
export declare const OrganizationAccessNeedSchema: z.ZodEnum<{
    read: "read";
    manage: "manage";
}>;
export type OrganizationAccessNeed = z.infer<typeof OrganizationAccessNeedSchema>;
export declare const ORGANIZATION_ACCESS_REFUSALS: readonly ["foreign_tenant", "foreign_owner", "foreign_organization", "not_member", "role_unknown", "role_ambiguous", "director_only"];
export declare const OrganizationAccessRefusalSchema: z.ZodEnum<{
    foreign_tenant: "foreign_tenant";
    foreign_owner: "foreign_owner";
    foreign_organization: "foreign_organization";
    not_member: "not_member";
    role_unknown: "role_unknown";
    role_ambiguous: "role_ambiguous";
    director_only: "director_only";
}>;
export type OrganizationAccessRefusal = z.infer<typeof OrganizationAccessRefusalSchema>;
export declare const OrganizationAccessDecisionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    allowed: z.ZodLiteral<true>;
    level: z.ZodEnum<{
        read: "read";
        manage: "manage";
    }>;
    grant: z.ZodEnum<{
        allow_organization_member: "allow_organization_member";
        allow_organization_director: "allow_organization_director";
    }>;
    role: z.ZodNullable<z.ZodEnum<{
        ricerca: "ricerca";
        lab: "lab";
        director: "director";
        "capo-bu": "capo-bu";
    }>>;
}, z.core.$strict>, z.ZodObject<{
    allowed: z.ZodLiteral<false>;
    refusal: z.ZodEnum<{
        foreign_tenant: "foreign_tenant";
        foreign_owner: "foreign_owner";
        foreign_organization: "foreign_organization";
        not_member: "not_member";
        role_unknown: "role_unknown";
        role_ambiguous: "role_ambiguous";
        director_only: "director_only";
    }>;
    reason: z.ZodString;
}, z.core.$strict>], "allowed">;
export type OrganizationAccessDecision = z.infer<typeof OrganizationAccessDecisionSchema>;
export interface OrganizationAccessInput {
    actor: {
        tenantId: string;
        ownerId: string;
        agentIdentity: ParticipantAgentIdentity;
    };
    resource: {
        tenantId: string;
        ownerId: string;
        organizationId: string;
    };
    need: OrganizationAccessNeed;
    /** Items of the participant binding list: `{ binding, receipt }`. */
    bindings: ReadonlyArray<{
        binding: ParticipantBinding;
        receipt: ParticipantBindingReceipt;
    }>;
}
/** Decides whether the actor may read or manage the organization of the resource. */
export declare function organizationAccess(input: OrganizationAccessInput): OrganizationAccessDecision;
//# sourceMappingURL=organization-access.d.ts.map