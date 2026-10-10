import { z } from 'zod';
export declare const ForgeElevenLabsWebParamsSchema: z.ZodObject<{
    linkId: z.ZodString;
}, z.core.$strict>;
export declare const forgeElevenLabsWebMetadataContract: {
    readonly method: "GET";
    readonly path: "/api/parla/:linkId";
    readonly paramsSchema: z.ZodObject<{
        linkId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        linkId: z.ZodString;
        displayName: z.ZodString;
        state: z.ZodEnum<{
            unavailable: "unavailable";
            paused: "paused";
            ready: "ready";
            off: "off";
        }>;
        observedAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            source_unavailable: "source_unavailable";
            authentication_required: "authentication_required";
            access_denied: "access_denied";
            session_in_progress: "session_in_progress";
        }>;
    }, z.core.$strict>;
    readonly authentication: "optional-forge-session";
    readonly authorization: "server-web-policy";
    readonly cacheControl: "no-store";
};
export declare const forgeElevenLabsWebSessionContract: {
    readonly method: "POST";
    readonly path: "/api/parla/:linkId/session";
    readonly paramsSchema: z.ZodObject<{
        linkId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        linkId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        linkId: z.ZodString;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
        signedUrl: z.ZodURL;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            source_unavailable: "source_unavailable";
            authentication_required: "authentication_required";
            access_denied: "access_denied";
            session_in_progress: "session_in_progress";
        }>;
    }, z.core.$strict>;
    readonly authentication: "optional-forge-session";
    readonly authorization: "server-web-policy";
    readonly cacheControl: "no-store";
};
export declare function forgeElevenLabsWebMetadataPath(linkId: string): string;
export declare function forgeElevenLabsWebSessionPath(linkId: string): string;
/** Strict path/body correlation only; no viewer, scope, policy or permission is inferred. */
export declare function isElevenLabsWebBrowserRequestForLink(rawRequest: unknown, rawLinkId: unknown): boolean;
//# sourceMappingURL=forge-elevenlabs-web.d.ts.map