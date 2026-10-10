import { z } from 'zod';
/** Correlation only. Forge reloads viewer, owner, scope and admission evidence from its own server session. */
export declare const ElevenLabsWebBrowserRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
    linkId: z.ZodString;
}, z.core.$strict>;
export type ElevenLabsWebBrowserRequest = z.infer<typeof ElevenLabsWebBrowserRequestSchema>;
/** Only the admitted browser receives this short transport lease; never persist, log or include it in history. */
export declare const ElevenLabsWebBrowserSessionSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    requestId: z.ZodString;
    linkId: z.ZodString;
    issuedAt: z.ZodISODateTime;
    expiresAt: z.ZodISODateTime;
    signedUrl: z.ZodURL;
}, z.core.$strict>;
export type ElevenLabsWebBrowserSession = z.infer<typeof ElevenLabsWebBrowserSessionSchema>;
/** Not a wire request: all fields except browserRequest are freshly loaded server evidence. */
export interface ElevenLabsWebBrowserSessionEvidence {
    browserRequest: unknown;
    internalRequest: unknown;
    internalResult: unknown;
    snapshot: unknown;
    viewer: unknown;
    configuredOrigin: unknown;
    authorityResponse: unknown;
    authorityVersion: unknown;
    agentIdentity: unknown;
    now: Date;
}
export declare function projectElevenLabsWebBrowserSession(evidence: ElevenLabsWebBrowserSessionEvidence): ElevenLabsWebBrowserSession | null;
/** Public pre-Start data for an already authorized viewer. Never contains a provider artifact or private identity. */
export declare const ElevenLabsWebBrowserMetadataSchema: z.ZodObject<{
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
export type ElevenLabsWebBrowserMetadata = z.infer<typeof ElevenLabsWebBrowserMetadataSchema>;
/** Fixed public failures: no provider details, scope, membership or diagnostics. */
export declare const ElevenLabsWebBrowserErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        invalid_request: "invalid_request";
        source_unavailable: "source_unavailable";
        authentication_required: "authentication_required";
        access_denied: "access_denied";
        session_in_progress: "session_in_progress";
    }>;
}, z.core.$strict>;
export type ElevenLabsWebBrowserErrorResponse = z.infer<typeof ElevenLabsWebBrowserErrorResponseSchema>;
/** Server-only freshly resolved evidence. Calling this pure projection never authenticates a caller or starts an attempt. */
export interface ElevenLabsWebBrowserMetadataEvidence {
    linkId: unknown;
    expectedScope: unknown;
    snapshot: unknown;
    viewer: unknown;
    configuredOrigin: unknown;
    displayName: unknown;
    observedAt: unknown;
    now: Date;
}
export declare function projectElevenLabsWebBrowserMetadata(evidence: ElevenLabsWebBrowserMetadataEvidence): ElevenLabsWebBrowserMetadata | null;
/** Metadata is a short-lived display observation, never permission to mint a transport lease. */
export declare function isElevenLabsWebBrowserMetadataCurrent(rawMetadata: unknown, expectedLinkId: unknown, now: Date): boolean;
//# sourceMappingURL=web-browser.d.ts.map