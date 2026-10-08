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
//# sourceMappingURL=web-browser.d.ts.map