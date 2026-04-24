import { z } from 'zod';

/**
 * STT provider enumeration — order defines fallback chain.
 * Primary = elevenlabs (Scribe v1 batch), fallback = openai (whisper-1).
 * See ADR-cap-stt D-03 / D-04.
 */
export const SttProviderEnum = z.enum(['elevenlabs', 'openai']);
export type SttProvider = z.infer<typeof SttProviderEnum>;

export const TranscribeRequestSchema = z.object({
  telegramFileUrl: z.string().url(),
  durationSec: z.number().int().positive().max(60),
  mimeType: z.string().default('audio/ogg'),
});
export type TranscribeRequest = z.infer<typeof TranscribeRequestSchema>;

export const TranscribeResponseSchema = z.object({
  text: z.string(),
  language: z.string(),
  durationSec: z.number().nonnegative(),
  provider: SttProviderEnum,
  confidence: z.number().min(0).max(1).optional(),
});
export type TranscribeResponse = z.infer<typeof TranscribeResponseSchema>;
