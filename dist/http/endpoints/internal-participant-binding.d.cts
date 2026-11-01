import { z } from 'zod';
export declare const INTERNAL_PARTICIPANT_BINDING_APPLY_PATH: "/internal/participant-binding/apply";
export declare const INTERNAL_PARTICIPANT_BINDING_READ_PATH: "/internal/participant-binding/read";
export declare const INTERNAL_PARTICIPANT_BINDING_LIST_PATH: "/internal/participant-binding/list";
export declare const INTERNAL_PARTICIPANT_BINDING_WITHDRAW_PATH: "/internal/participant-binding/withdraw";
export declare const INTERNAL_PARTICIPANT_BINDING_RESOLVE_PATH: "/internal/participant-binding/resolve";
/** Outcome codes of the binding resolution plus the operation-specific ones. */
export declare const ParticipantBindingErrorCodeSchema: z.ZodEnum<{
    bound: "bound";
    unknown_participant: "unknown_participant";
    ambiguous: "ambiguous";
    foreign_scope: "foreign_scope";
    version_conflict: "version_conflict";
    person_required: "person_required";
}>;
export type ParticipantBindingErrorCode = z.infer<typeof ParticipantBindingErrorCodeSchema>;
export declare const InternalParticipantBindingApplyRequestSchema: z.ZodObject<{
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
    binding: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        agentIdentity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        participantId: z.ZodString;
        personRef: z.ZodOptional<z.ZodString>;
        roles: z.ZodArray<z.ZodEnum<{
            lead: "lead";
            member: "member";
            reviewer: "reviewer";
            observer: "observer";
        }>>;
        agentRole: z.ZodOptional<z.ZodEnum<{
            ricerca: "ricerca";
            lab: "lab";
            director: "director";
            "capo-bu": "capo-bu";
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
    expectedVersion: z.ZodNumber;
}, z.core.$strict>;
export type InternalParticipantBindingApplyRequest = z.infer<typeof InternalParticipantBindingApplyRequestSchema>;
export declare const InternalParticipantBindingApplyResponseSchema: z.ZodUnion<readonly [z.ZodObject<{
    ok: z.ZodLiteral<true>;
    receipt: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        bound: "bound";
        unknown_participant: "unknown_participant";
        ambiguous: "ambiguous";
        foreign_scope: "foreign_scope";
        version_conflict: "version_conflict";
        person_required: "person_required";
    }>;
    reason: z.ZodString;
}, z.core.$strict>]>;
export type InternalParticipantBindingApplyResponse = z.infer<typeof InternalParticipantBindingApplyResponseSchema>;
export declare const InternalParticipantBindingReadRequestSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type InternalParticipantBindingReadRequest = z.infer<typeof InternalParticipantBindingReadRequestSchema>;
export declare const InternalParticipantBindingReadResponseSchema: z.ZodUnion<readonly [z.ZodObject<{
    binding: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        agentIdentity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        participantId: z.ZodString;
        personRef: z.ZodOptional<z.ZodString>;
        roles: z.ZodArray<z.ZodEnum<{
            lead: "lead";
            member: "member";
            reviewer: "reviewer";
            observer: "observer";
        }>>;
        agentRole: z.ZodOptional<z.ZodEnum<{
            ricerca: "ricerca";
            lab: "lab";
            director: "director";
            "capo-bu": "capo-bu";
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
    receipt: z.ZodObject<{
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
    ok: z.ZodLiteral<true>;
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodLiteral<"not_found">;
    reason: z.ZodString;
}, z.core.$strict>]>;
export type InternalParticipantBindingReadResponse = z.infer<typeof InternalParticipantBindingReadResponseSchema>;
export declare const InternalParticipantBindingListRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    agentIdentity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    organizationId: z.ZodString;
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodNumber;
}, z.core.$strict>;
export type InternalParticipantBindingListRequest = z.infer<typeof InternalParticipantBindingListRequestSchema>;
export declare const InternalParticipantBindingListResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        binding: z.ZodObject<{
            tenantId: z.ZodString;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            agentIdentity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            participantId: z.ZodString;
            personRef: z.ZodOptional<z.ZodString>;
            roles: z.ZodArray<z.ZodEnum<{
                lead: "lead";
                member: "member";
                reviewer: "reviewer";
                observer: "observer";
            }>>;
            agentRole: z.ZodOptional<z.ZodEnum<{
                ricerca: "ricerca";
                lab: "lab";
                director: "director";
                "capo-bu": "capo-bu";
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
        receipt: z.ZodObject<{
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
    }, z.core.$strict>>;
    nextCursor: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type InternalParticipantBindingListResponse = z.infer<typeof InternalParticipantBindingListResponseSchema>;
export declare const InternalParticipantBindingWithdrawRequestSchema: z.ZodObject<{
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
    expectedVersion: z.ZodNumber;
    reason: z.ZodString;
}, z.core.$strict>;
export type InternalParticipantBindingWithdrawRequest = z.infer<typeof InternalParticipantBindingWithdrawRequestSchema>;
export declare const InternalParticipantBindingWithdrawResponseSchema: z.ZodUnion<readonly [z.ZodObject<{
    ok: z.ZodLiteral<true>;
    receipt: z.ZodObject<{
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
        withdrawnAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        bound: "bound";
        unknown_participant: "unknown_participant";
        ambiguous: "ambiguous";
        foreign_scope: "foreign_scope";
        version_conflict: "version_conflict";
        person_required: "person_required";
    }>;
    reason: z.ZodString;
}, z.core.$strict>]>;
export type InternalParticipantBindingWithdrawResponse = z.infer<typeof InternalParticipantBindingWithdrawResponseSchema>;
export declare const InternalParticipantBindingResolveRequestSchema: z.ZodObject<{
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
export type InternalParticipantBindingResolveRequest = z.infer<typeof InternalParticipantBindingResolveRequestSchema>;
export declare const InternalParticipantBindingResolveResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    binding: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        agentIdentity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        participantId: z.ZodString;
        personRef: z.ZodOptional<z.ZodString>;
        roles: z.ZodArray<z.ZodEnum<{
            lead: "lead";
            member: "member";
            reviewer: "reviewer";
            observer: "observer";
        }>>;
        agentRole: z.ZodOptional<z.ZodEnum<{
            ricerca: "ricerca";
            lab: "lab";
            director: "director";
            "capo-bu": "capo-bu";
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
    receipt: z.ZodObject<{
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
    outcome: z.ZodLiteral<"bound">;
}, z.core.$strict>, z.ZodObject<{
    outcome: z.ZodLiteral<"not_found">;
    reason: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    outcome: z.ZodLiteral<"ambiguous">;
    reason: z.ZodString;
}, z.core.$strict>], "outcome">;
export type InternalParticipantBindingResolveResponse = z.infer<typeof InternalParticipantBindingResolveResponseSchema>;
export declare const internalParticipantBindingApplyContract: {
    readonly path: "/internal/participant-binding/apply";
    readonly bodySchema: z.ZodObject<{
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
        binding: z.ZodObject<{
            tenantId: z.ZodString;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            agentIdentity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            participantId: z.ZodString;
            personRef: z.ZodOptional<z.ZodString>;
            roles: z.ZodArray<z.ZodEnum<{
                lead: "lead";
                member: "member";
                reviewer: "reviewer";
                observer: "observer";
            }>>;
            agentRole: z.ZodOptional<z.ZodEnum<{
                ricerca: "ricerca";
                lab: "lab";
                director: "director";
                "capo-bu": "capo-bu";
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
        expectedVersion: z.ZodNumber;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodUnion<readonly [z.ZodObject<{
        ok: z.ZodLiteral<true>;
        receipt: z.ZodObject<{
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
    }, z.core.$strict>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            bound: "bound";
            unknown_participant: "unknown_participant";
            ambiguous: "ambiguous";
            foreign_scope: "foreign_scope";
            version_conflict: "version_conflict";
            person_required: "person_required";
        }>;
        reason: z.ZodString;
    }, z.core.$strict>]>;
    readonly method: "POST";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
};
export declare const internalParticipantBindingReadContract: {
    readonly path: "/internal/participant-binding/read";
    readonly bodySchema: z.ZodObject<{
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
    }, z.core.$strict>;
    readonly responseSchema: z.ZodUnion<readonly [z.ZodObject<{
        binding: z.ZodObject<{
            tenantId: z.ZodString;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            agentIdentity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            participantId: z.ZodString;
            personRef: z.ZodOptional<z.ZodString>;
            roles: z.ZodArray<z.ZodEnum<{
                lead: "lead";
                member: "member";
                reviewer: "reviewer";
                observer: "observer";
            }>>;
            agentRole: z.ZodOptional<z.ZodEnum<{
                ricerca: "ricerca";
                lab: "lab";
                director: "director";
                "capo-bu": "capo-bu";
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
        receipt: z.ZodObject<{
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
        ok: z.ZodLiteral<true>;
    }, z.core.$strict>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodLiteral<"not_found">;
        reason: z.ZodString;
    }, z.core.$strict>]>;
    readonly method: "POST";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
};
export declare const internalParticipantBindingListContract: {
    readonly path: "/internal/participant-binding/list";
    readonly bodySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        agentIdentity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        organizationId: z.ZodString;
        cursor: z.ZodOptional<z.ZodString>;
        limit: z.ZodNumber;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        items: z.ZodArray<z.ZodObject<{
            binding: z.ZodObject<{
                tenantId: z.ZodString;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                agentIdentity: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                participantId: z.ZodString;
                personRef: z.ZodOptional<z.ZodString>;
                roles: z.ZodArray<z.ZodEnum<{
                    lead: "lead";
                    member: "member";
                    reviewer: "reviewer";
                    observer: "observer";
                }>>;
                agentRole: z.ZodOptional<z.ZodEnum<{
                    ricerca: "ricerca";
                    lab: "lab";
                    director: "director";
                    "capo-bu": "capo-bu";
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
            receipt: z.ZodObject<{
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
        }, z.core.$strict>>;
        nextCursor: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
};
export declare const internalParticipantBindingWithdrawContract: {
    readonly path: "/internal/participant-binding/withdraw";
    readonly bodySchema: z.ZodObject<{
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
        expectedVersion: z.ZodNumber;
        reason: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodUnion<readonly [z.ZodObject<{
        ok: z.ZodLiteral<true>;
        receipt: z.ZodObject<{
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
            withdrawnAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            bound: "bound";
            unknown_participant: "unknown_participant";
            ambiguous: "ambiguous";
            foreign_scope: "foreign_scope";
            version_conflict: "version_conflict";
            person_required: "person_required";
        }>;
        reason: z.ZodString;
    }, z.core.$strict>]>;
    readonly method: "POST";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
};
export declare const internalParticipantBindingResolveContract: {
    readonly path: "/internal/participant-binding/resolve";
    readonly bodySchema: z.ZodObject<{
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
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        binding: z.ZodObject<{
            tenantId: z.ZodString;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            agentIdentity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            participantId: z.ZodString;
            personRef: z.ZodOptional<z.ZodString>;
            roles: z.ZodArray<z.ZodEnum<{
                lead: "lead";
                member: "member";
                reviewer: "reviewer";
                observer: "observer";
            }>>;
            agentRole: z.ZodOptional<z.ZodEnum<{
                ricerca: "ricerca";
                lab: "lab";
                director: "director";
                "capo-bu": "capo-bu";
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
        receipt: z.ZodObject<{
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
        outcome: z.ZodLiteral<"bound">;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"not_found">;
        reason: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"ambiguous">;
        reason: z.ZodString;
    }, z.core.$strict>], "outcome">;
    readonly method: "POST";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
};
//# sourceMappingURL=internal-participant-binding.d.ts.map