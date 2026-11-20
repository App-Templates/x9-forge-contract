import { z } from 'zod';

/**
 * Refusal codes of the server-side round steps (engine, Meta collection, transcription).
 * `identity_mismatch` is shared by collection and transcription.
 * `too_many_attempts` is written by the engine itself and is not a step refusal.
 */
export const SOCIAL_SERVER_STEP_ERRORS = [
  // engine
  'step_failed',
  'step_timeout',
  'invalid_result',
  // collection from Meta
  'meta_credentials_missing',
  'identity_mismatch',
  'meta_unauthorized',
  'meta_rate_limited',
  'meta_unavailable',
  // transcription
  'post_not_found',
  'not_a_video',
  'media_url_unavailable',
  'stt_media_refused',
  'stt_unavailable',
  'stt_invalid_response',
] as const;

export const SocialServerStepErrorSchema = z.enum(SOCIAL_SERVER_STEP_ERRORS);

export type SocialServerStepError = z.infer<typeof SocialServerStepErrorSchema>;

/** True only for a string exactly equal to one of the codes; never throws. */
export function isSocialServerStepError(code: unknown): code is SocialServerStepError {
  return typeof code === 'string' && (SOCIAL_SERVER_STEP_ERRORS as readonly string[]).includes(code);
}
