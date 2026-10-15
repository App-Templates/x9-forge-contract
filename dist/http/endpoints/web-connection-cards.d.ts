import { z } from 'zod';
export declare const WEB_CONNECTION_CARDS_PATH: "/api/web/connection-cards";
export declare const WebConnectionCardsQuerySchema: z.ZodObject<{
    session_id: z.ZodString;
}, z.core.$strict>;
export type WebConnectionCardsQuery = z.infer<typeof WebConnectionCardsQuerySchema>;
export declare const WebConnectionCardsResponseSchema: z.ZodObject<{
    cards: z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"connection_card">;
        card: z.ZodObject<{
            cardId: z.ZodString;
            provider: z.ZodEnum<{
                google: "google";
            }>;
            permissions: z.ZodArray<z.ZodEnum<{
                calendar_events: "calendar_events";
                contacts_read: "contacts_read";
                mail_send: "mail_send";
            }>>;
            url: z.ZodString;
            expiresAt: z.ZodNumber;
            state: z.ZodEnum<{
                connected: "connected";
                revoked: "revoked";
                pending: "pending";
                denied: "denied";
                expired: "expired";
            }>;
            reason: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type WebConnectionCardsResponse = z.infer<typeof WebConnectionCardsResponseSchema>;
export declare const WebConnectionCardsNotFoundSchema: z.ZodObject<{
    error: z.ZodLiteral<"not_found">;
}, z.core.$strict>;
export type WebConnectionCardsNotFound = z.infer<typeof WebConnectionCardsNotFoundSchema>;
export declare const webConnectionCardsContract: {
    readonly method: "GET";
    readonly path: "/api/web/connection-cards";
    readonly querySchema: z.ZodObject<{
        session_id: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        cards: z.ZodArray<z.ZodObject<{
            type: z.ZodLiteral<"connection_card">;
            card: z.ZodObject<{
                cardId: z.ZodString;
                provider: z.ZodEnum<{
                    google: "google";
                }>;
                permissions: z.ZodArray<z.ZodEnum<{
                    calendar_events: "calendar_events";
                    contacts_read: "contacts_read";
                    mail_send: "mail_send";
                }>>;
                url: z.ZodString;
                expiresAt: z.ZodNumber;
                state: z.ZodEnum<{
                    connected: "connected";
                    revoked: "revoked";
                    pending: "pending";
                    denied: "denied";
                    expired: "expired";
                }>;
                reason: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly notFoundSchema: z.ZodObject<{
        error: z.ZodLiteral<"not_found">;
    }, z.core.$strict>;
};
//# sourceMappingURL=web-connection-cards.d.ts.map