import { z } from 'zod';
/** Persist once on the server; stable across retries and Web-only pauses. Never a provider share link. */
export declare const ElevenLabsWebLinkSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    linkId: z.ZodString;
    url: z.ZodURL;
    createdAt: z.ZodISODateTime;
}, z.core.$strict>;
export type ElevenLabsWebLink = z.infer<typeof ElevenLabsWebLinkSchema>;
/** Server-derived authenticated person and owner membership; never accepted as browser authorization. */
export declare const ElevenLabsWebViewerSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"anonymous">;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"authenticated">;
    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    owner: z.ZodNullable<z.ZodObject<{
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>], "kind">;
export type ElevenLabsWebViewer = z.infer<typeof ElevenLabsWebViewerSchema>;
/** Internal evidence only. Public pages must not receive mappings, policy scope or invitations. */
export declare const ElevenLabsWebAdmissionSnapshotSchema: z.ZodObject<{
    policy: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        version: z.ZodNumber;
        access: z.ZodEnum<{
            owner: "owner";
            invited: "invited";
            public: "public";
        }>;
        paused: z.ZodBoolean;
        enabled: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>;
    link: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        linkId: z.ZodString;
        url: z.ZodURL;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>;
    provider: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        mapping: z.ZodNullable<z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            providerAgentId: z.ZodString;
            origin: z.ZodEnum<{
                provisioned: "provisioned";
                adopted: "adopted";
            }>;
            createdAt: z.ZodISODateTime;
            appliedConfigVersion: z.ZodNumber;
        }, z.core.$strip>>;
        desiredState: z.ZodEnum<{
            active: "active";
            paused: "paused";
        }>;
        channel: z.ZodObject<{
            channelId: z.ZodString;
            kind: z.ZodUnion<[z.ZodEnum<{
                email: "email";
                voice: "voice";
                telegram: "telegram";
                whatsapp: "whatsapp";
            }>, z.ZodLiteral<"web">]>;
            state: z.ZodEnum<{
                error: "error";
                unknown: "unknown";
                loaded: "loaded";
                stopped: "stopped";
                paused: "paused";
            }>;
            loaded: z.ZodNullable<z.ZodBoolean>;
            readiness: z.ZodEnum<{
                unknown: "unknown";
                ready: "ready";
                "not-ready": "not-ready";
            }>;
            botUsername: z.ZodOptional<z.ZodString>;
            allowFromCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        observedAt: z.ZodNullable<z.ZodISODateTime>;
    }, z.core.$strip>;
    lifecycle: z.ZodEnum<{
        unavailable: "unavailable";
        active: "active";
        removed: "removed";
        archived: "archived";
    }>;
    invitation: z.ZodNullable<z.ZodObject<{
        invitationId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        revision: z.ZodNumber;
        recipientUserId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        createdAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
        revokedAt: z.ZodNullable<z.ZodISODateTime>;
    }, z.core.$strict>>;
    invitationRevision: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type ElevenLabsWebAdmissionSnapshot = z.infer<typeof ElevenLabsWebAdmissionSnapshotSchema>;
/** Validate a server-returned URL against the actual configured Forge origin, never window.location guesses. */
export declare function isElevenLabsWebLinkCurrent(rawLink: unknown, expectedScope: unknown, configuredOrigin: unknown): boolean;
/**
 * Validate freshly loaded server evidence before AND after every awaited operation.
 * This helper does not authenticate an HTTP caller, install a route or mint a provider session.
 */
export declare function canAdmitElevenLabsWebViewer(rawSnapshot: unknown, expectedScope: unknown, rawViewer: unknown, configuredOrigin: unknown, now: Date): boolean;
/** Secret-auth S2S only: Forge installs viewer from its session, X9 re-resolves scope and all evidence. */
export declare const ElevenLabsWebSessionRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    linkId: z.ZodString;
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
}, z.core.$strict>;
export type ElevenLabsWebSessionRequest = z.infer<typeof ElevenLabsWebSessionRequestSchema>;
/** Internal mint readback. Only the signed transport artifact/window belongs in the public facade. */
export declare const ElevenLabsWebSessionResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    requestId: z.ZodString;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    link: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        linkId: z.ZodString;
        url: z.ZodURL;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>;
    policyVersion: z.ZodNumber;
    mapping: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        providerAgentId: z.ZodString;
        origin: z.ZodEnum<{
            provisioned: "provisioned";
            adopted: "adopted";
        }>;
        createdAt: z.ZodISODateTime;
        appliedConfigVersion: z.ZodNumber;
    }, z.core.$strip>;
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
    invitation: z.ZodNullable<z.ZodObject<{
        invitationId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        revision: z.ZodNumber;
        recipientUserId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        createdAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
        revokedAt: z.ZodNullable<z.ZodISODateTime>;
    }, z.core.$strict>>;
    invitationRevision: z.ZodNullable<z.ZodNumber>;
    issuedAt: z.ZodISODateTime;
    expiresAt: z.ZodISODateTime;
    signedUrl: z.ZodURL;
}, z.core.$strict>;
export type ElevenLabsWebSessionResult = z.infer<typeof ElevenLabsWebSessionResultSchema>;
/** Reuses C3 transport validation. A valid URL is a bearer format, never evidence of admission or resource privacy. */
export declare function isElevenLabsWebSignedConnectionUrl(rawUrl: unknown, expectedProviderAgentId: unknown): boolean;
/**
 * Recheck completion against NEW server evidence/viewer. Pause/revoke blocks new issuance; an already
 * delivered provider bearer URL or established conversation cannot be revoked by this validation helper.
 */
export declare function isElevenLabsWebSessionCurrent(rawRequest: unknown, rawResult: unknown, currentSnapshot: unknown, currentViewer: unknown, configuredOrigin: unknown, now: Date): boolean;
//# sourceMappingURL=web-session.d.ts.map