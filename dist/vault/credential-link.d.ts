import { z } from 'zod';
/**
 * Keys linked to the Master Chief (R3, v1.31.0).
 *
 * Every key of an agent has a provenance: `linked` to the X9 Master Chief source (the default for new agents, a
 * reference, never a copy of the secret) or `unlinked` with the agent's own value at `owner` or `agent` tier.
 * Rotating the Master reaches all and only the linked agents; an unlinked value is untouched. `relink` makes ONE
 * agent's key follow the Master again without deleting an owner row other agents may use; `unlink` gives it its own
 * saved value. Rotation never carries a secret: it makes an already-saved version effective.
 *
 * These schemas carry metadata only — the strict entry schema rejects a `value` field.
 */
/** Vault key name; platform-internal keys are never listed or acted upon for an agent. */
export declare const CredentialKeySchema: z.ZodString;
export type CredentialKey = z.infer<typeof CredentialKeySchema>;
/** Saved version of one key's value; every save raises it. */
export declare const CredentialVersionSchema: z.ZodNumber;
export type CredentialVersion = z.infer<typeof CredentialVersionSchema>;
export declare const CredentialOwnTierSchema: z.ZodEnum<{
    owner: "owner";
    agent: "agent";
}>;
export type CredentialOwnTier = z.infer<typeof CredentialOwnTierSchema>;
export declare const CredentialLinkSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    link: z.ZodLiteral<"linked">;
    source: z.ZodLiteral<"master">;
}, z.core.$strict>, z.ZodObject<{
    link: z.ZodLiteral<"unlinked">;
    tier: z.ZodEnum<{
        owner: "owner";
        agent: "agent";
    }>;
}, z.core.$strict>], "link">;
export type CredentialLink = z.infer<typeof CredentialLinkSchema>;
export declare const AgentCredentialLinkEntrySchema: z.ZodObject<{
    key: z.ZodString;
    provenance: z.ZodDiscriminatedUnion<[z.ZodObject<{
        link: z.ZodLiteral<"linked">;
        source: z.ZodLiteral<"master">;
    }, z.core.$strict>, z.ZodObject<{
        link: z.ZodLiteral<"unlinked">;
        tier: z.ZodEnum<{
            owner: "owner";
            agent: "agent";
        }>;
    }, z.core.$strict>], "link">;
    present: z.ZodBoolean;
    version: z.ZodNullable<z.ZodNumber>;
    appliedVersion: z.ZodNullable<z.ZodNumber>;
    isSecret: z.ZodBoolean;
}, z.core.$strict>;
export type AgentCredentialLinkEntry = z.infer<typeof AgentCredentialLinkEntrySchema>;
export declare const AgentCredentialLinksSchema: z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    masterAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    entries: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        provenance: z.ZodDiscriminatedUnion<[z.ZodObject<{
            link: z.ZodLiteral<"linked">;
            source: z.ZodLiteral<"master">;
        }, z.core.$strict>, z.ZodObject<{
            link: z.ZodLiteral<"unlinked">;
            tier: z.ZodEnum<{
                owner: "owner";
                agent: "agent";
            }>;
        }, z.core.$strict>], "link">;
        present: z.ZodBoolean;
        version: z.ZodNullable<z.ZodNumber>;
        appliedVersion: z.ZodNullable<z.ZodNumber>;
        isSecret: z.ZodBoolean;
    }, z.core.$strict>>;
}, z.core.$strip>;
export type AgentCredentialLinks = z.infer<typeof AgentCredentialLinksSchema>;
export declare const CredentialActionSchema: z.ZodEnum<{
    rotate: "rotate";
    relink: "relink";
    unlink: "unlink";
}>;
export type CredentialAction = z.infer<typeof CredentialActionSchema>;
export declare const CredentialActionRequestSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"rotate">;
    requestId: z.ZodString;
    key: z.ZodString;
    scope: z.ZodEnum<{
        master: "master";
        own: "own";
    }>;
    agentId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "AgentId", "out">>;
    version: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"relink">;
    requestId: z.ZodString;
    key: z.ZodString;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"unlink">;
    requestId: z.ZodString;
    key: z.ZodString;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    tier: z.ZodEnum<{
        owner: "owner";
        agent: "agent";
    }>;
    version: z.ZodNumber;
}, z.core.$strict>], "action">;
export type CredentialActionRequest = z.infer<typeof CredentialActionRequestSchema>;
export declare const CredentialAgentResultSchema: z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    outcome: z.ZodEnum<{
        error: "error";
        ok: "ok";
        unmanageable: "unmanageable";
    }>;
    reason: z.ZodOptional<z.ZodObject<{
        code: z.ZodEnum<{
            unknown: "unknown";
            "not-loaded": "not-loaded";
            "load-failed": "load-failed";
            "validation-failed": "validation-failed";
            timeout: "timeout";
            "source-unavailable": "source-unavailable";
            "shared-runtime": "shared-runtime";
            "externally-owned": "externally-owned";
            "not-supported": "not-supported";
            "in-progress": "in-progress";
        }>;
        detail: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    appliedVersion: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
export type CredentialAgentResult = z.infer<typeof CredentialAgentResultSchema>;
/** Outcome over every agent the action reached (all linked agents for a Master rotation, else the one agent). */
export declare const CredentialActionResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    requestId: z.ZodString;
    action: z.ZodEnum<{
        rotate: "rotate";
        relink: "relink";
        unlink: "unlink";
    }>;
    key: z.ZodString;
    version: z.ZodNumber;
    replayed: z.ZodBoolean;
    outcome: z.ZodEnum<{
        error: "error";
        ok: "ok";
        partial: "partial";
        unmanageable: "unmanageable";
    }>;
    agents: z.ZodArray<z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        outcome: z.ZodEnum<{
            error: "error";
            ok: "ok";
            unmanageable: "unmanageable";
        }>;
        reason: z.ZodOptional<z.ZodObject<{
            code: z.ZodEnum<{
                unknown: "unknown";
                "not-loaded": "not-loaded";
                "load-failed": "load-failed";
                "validation-failed": "validation-failed";
                timeout: "timeout";
                "source-unavailable": "source-unavailable";
                "shared-runtime": "shared-runtime";
                "externally-owned": "externally-owned";
                "not-supported": "not-supported";
                "in-progress": "in-progress";
            }>;
            detail: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        appliedVersion: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>>;
    applied: z.ZodNumber;
    total: z.ZodNumber;
}, z.core.$strip>;
export type CredentialActionResult = z.infer<typeof CredentialActionResultSchema>;
export declare const CredentialActionErrorCodeSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    agent_not_found: "agent_not_found";
    key_not_found: "key_not_found";
    version_not_found: "version_not_found";
    idempotency_conflict: "idempotency_conflict";
    source_unavailable: "source_unavailable";
}>;
export type CredentialActionErrorCode = z.infer<typeof CredentialActionErrorCodeSchema>;
export declare const CredentialActionErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        invalid_request: "invalid_request";
        agent_not_found: "agent_not_found";
        key_not_found: "key_not_found";
        version_not_found: "version_not_found";
        idempotency_conflict: "idempotency_conflict";
        source_unavailable: "source_unavailable";
    }>;
}, z.core.$strip>;
export type CredentialActionErrorResponse = z.infer<typeof CredentialActionErrorResponseSchema>;
//# sourceMappingURL=credential-link.d.ts.map