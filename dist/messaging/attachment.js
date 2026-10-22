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
export const IncomingMessageAttachmentSchema = z.object({
    /** MIME type as declared by the provider (`image/jpeg`, `audio/ogg`, etc.). */
    mime: z.string().min(1).max(200),
    /** File name suggested by the provider when available; otherwise null. */
    filename: z.string().min(1).max(500).nullable(),
    /** Size in bytes when declared by the provider; null when unknown. */
    size_bytes: z.number().int().nonnegative().nullable(),
    /** Provider-hosted URL (HTTPS expected; fetch is consumer responsibility). */
    url: z.string().url().nullable(),
    /** Inline base64 content for small payloads. Mutually exclusive with `url`. */
    inline_b64: z.string().min(1).nullable(),
});
//# sourceMappingURL=attachment.js.map