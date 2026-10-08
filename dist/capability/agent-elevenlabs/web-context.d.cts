import { z } from 'zod';
export declare const ElevenLabsWebAdmissionPhaseSchema: z.ZodEnum<{
    before: "before";
    after: "after";
}>;
export type ElevenLabsWebAdmissionPhase = z.infer<typeof ElevenLabsWebAdmissionPhaseSchema>;
/** X9 sends correlation only; Forge reloads the authenticated attempt from its own server state. */
export declare const ElevenLabsWebAuthorityRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    linkId: z.ZodString;
    phase: z.ZodEnum<{
        before: "before";
        after: "after";
    }>;
}, z.core.$strict>;
export type ElevenLabsWebAuthorityRequest = z.infer<typeof ElevenLabsWebAuthorityRequestSchema>;
/** Forge-only evidence. Parsing this snapshot never grants admission or authenticates a viewer. */
export declare const ElevenLabsWebAuthoritySnapshotSchema: z.ZodObject<{
    requestId: z.ZodString;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    linkId: z.ZodString;
    phase: z.ZodEnum<{
        before: "before";
        after: "after";
    }>;
    viewer: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"anonymous">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"authenticated">;
        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        owner: z.ZodNullable<z.ZodObject<{
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>], "kind">;
    lifecycle: z.ZodEnum<{
        unavailable: "unavailable";
        active: "active";
        archived: "archived";
        removed: "removed";
    }>;
    configuredOrigin: z.ZodURL;
    authorityVersion: z.ZodNumber;
    observedAt: z.ZodISODateTime;
    expiresAt: z.ZodISODateTime;
    agentIdentity: z.ZodNull;
}, z.core.$strict>;
export type ElevenLabsWebAuthoritySnapshot = z.infer<typeof ElevenLabsWebAuthoritySnapshotSchema>;
/** Correlation/freshness only. Reload on both sides of every await; this is not an admission decision. */
export declare function isElevenLabsWebAuthorityCurrent(rawRequest: unknown, rawSnapshot: unknown, expectedViewer: unknown, configuredOrigin: unknown, expectedVersion: unknown, now: Date): boolean;
/** No successful issuance is representable until the canonical agent identity is integrated. */
export declare const ElevenLabsWebAuthorityResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    request: z.ZodObject<{
        requestId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        linkId: z.ZodString;
        phase: z.ZodEnum<{
            before: "before";
            after: "after";
        }>;
    }, z.core.$strict>;
    error: z.ZodEnum<{
        source_unavailable: "source_unavailable";
        identity_mismatch: "identity_mismatch";
        identity_unavailable: "identity_unavailable";
        admission_expired: "admission_expired";
        viewer_unavailable: "viewer_unavailable";
    }>;
    snapshot: z.ZodOptional<z.ZodObject<{
        requestId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        linkId: z.ZodString;
        phase: z.ZodEnum<{
            before: "before";
            after: "after";
        }>;
        viewer: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"anonymous">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"authenticated">;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            owner: z.ZodNullable<z.ZodObject<{
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>], "kind">;
        lifecycle: z.ZodEnum<{
            unavailable: "unavailable";
            active: "active";
            archived: "archived";
            removed: "removed";
        }>;
        configuredOrigin: z.ZodURL;
        authorityVersion: z.ZodNumber;
        observedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
        agentIdentity: z.ZodNull;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ElevenLabsWebAuthorityResponse = z.infer<typeof ElevenLabsWebAuthorityResponseSchema>;
//# sourceMappingURL=web-context.d.ts.map