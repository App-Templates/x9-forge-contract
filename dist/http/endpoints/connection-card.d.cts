import { z } from 'zod';
/**
 * "Scheda di collegamento": typed artifact carried in a tool result, in the
 * turn response and in web events. It never carries a token, permit or secret.
 */
export declare const ConnectionCardStateSchema: z.ZodEnum<{
    connected: "connected";
    revoked: "revoked";
    pending: "pending";
    denied: "denied";
    expired: "expired";
}>;
export type ConnectionCardState = z.infer<typeof ConnectionCardStateSchema>;
export declare const ConnectionCardSchema: z.ZodObject<{
    cardId: z.ZodString;
    provider: z.ZodEnum<{
        google: "google";
    }>;
    permissions: z.ZodArray<z.ZodEnum<{
        calendar_events: "calendar_events";
        contacts_read: "contacts_read";
        mail_send: "mail_send";
        mail_draft: "mail_draft";
        mail_read: "mail_read";
        drive_read: "drive_read";
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
export type ConnectionCard = z.infer<typeof ConnectionCardSchema>;
export declare const CONNECTION_CARD_ENVELOPE_TYPE: "connection_card";
export declare const ConnectionCardEnvelopeSchema: z.ZodObject<{
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
            mail_draft: "mail_draft";
            mail_read: "mail_read";
            drive_read: "drive_read";
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
}, z.core.$strict>;
export type ConnectionCardEnvelope = z.infer<typeof ConnectionCardEnvelopeSchema>;
/** Returns the envelope when `value` is a valid connection card, otherwise null. */
export declare function parseConnectionCardEnvelope(value: unknown): ConnectionCardEnvelope | null;
//# sourceMappingURL=connection-card.d.ts.map