import { z } from 'zod';
/** X9 -> Forge. Authenticate the service, then load the server-owned admission attempt; never trust body authority. */
export declare const ELEVENLABS_WEB_AUTHORITY_PATH: "/resolve/elevenlabs-web-admission";
export declare const elevenLabsWebAuthorityContract: {
    readonly method: "POST";
    readonly path: "/resolve/elevenlabs-web-admission";
    readonly authType: "token";
    readonly authHeader: "X-Internal-Token";
    readonly authSchema: z.ZodObject<{
        'X-Internal-Token': z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
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
    readonly responseSchema: z.ZodObject<{
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
};
//# sourceMappingURL=capability-elevenlabs-web-context.d.ts.map