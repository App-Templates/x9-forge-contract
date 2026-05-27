import { z } from 'zod';
/**
 * Inbound message attachment (email file, telegram photo/voice/document,
 * whatsapp media). Reusable subschema referenced by
 * `IncomingMessageEnvelopeSchema.attachments`.
 *
 * Two delivery modes supported:
 *   - `url`        — provider hosts the file (most common: telegram getFile URL,
 *                    agentmail attachment cdn link)
 *   - `inline_b64` — base64-encoded inline content (rare; small files only)
 *
 * Exactly ONE of `url` / `inline_b64` MUST be present — enforced at consumer
 * boundary (router-svc / cap-email parser), not at schema level, so consumers
 * can choose lenient vs strict parsing per their needs.
 *
 * Snake_case matches the rest of the messaging transport surface.
 */
export declare const IncomingMessageAttachmentSchema: z.ZodObject<{
    mime: z.ZodString;
    filename: z.ZodNullable<z.ZodString>;
    size_bytes: z.ZodNullable<z.ZodNumber>;
    url: z.ZodNullable<z.ZodString>;
    inline_b64: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type IncomingMessageAttachment = z.infer<typeof IncomingMessageAttachmentSchema>;
//# sourceMappingURL=attachment.d.ts.map