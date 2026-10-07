import { z } from 'zod';
/** Forge -> cap-voice: read the producer's versioned choices, authenticated with the existing platform secret.
 * This catalog is metadata only; it neither configures an agent nor creates a provider session.
 */
export declare const internalVoiceCatalogContract: {
    readonly method: "GET";
    readonly path: "/internal/voice/catalog";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly responseSchema: z.ZodObject<{
        version: z.ZodString;
        providers: z.ZodArray<z.ZodObject<{
            provider: z.ZodString;
            label: z.ZodString;
            protocols: z.ZodArray<z.ZodEnum<{
                websocket: "websocket";
                webrtc: "webrtc";
                sip: "sip";
            }>>;
            transports: z.ZodArray<z.ZodEnum<{
                web: "web";
                phone: "phone";
            }>>;
            models: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
            }, z.core.$strip>>;
            voices: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"menu">;
                options: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    label: z.ZodString;
                }, z.core.$strip>>;
            }, z.core.$strip>, z.ZodObject<{
                kind: z.ZodLiteral<"id">;
                pattern: z.ZodString;
            }, z.core.$strip>], "kind">;
        }, z.core.$strip>>;
    }, z.core.$strip>;
};
//# sourceMappingURL=voice-catalog.d.ts.map