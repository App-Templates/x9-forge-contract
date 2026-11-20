import { z } from 'zod';
/**
 * Refusal codes of the server-side round steps (engine, Meta collection, transcription).
 * `identity_mismatch` is shared by collection and transcription.
 * `too_many_attempts` is written by the engine itself and is not a step refusal.
 */
export declare const SOCIAL_SERVER_STEP_ERRORS: readonly ["step_failed", "step_timeout", "invalid_result", "meta_credentials_missing", "identity_mismatch", "meta_unauthorized", "meta_rate_limited", "meta_unavailable", "post_not_found", "not_a_video", "media_url_unavailable", "stt_media_refused", "stt_unavailable", "stt_invalid_response"];
export declare const SocialServerStepErrorSchema: z.ZodEnum<{
    identity_mismatch: "identity_mismatch";
    step_failed: "step_failed";
    step_timeout: "step_timeout";
    invalid_result: "invalid_result";
    meta_credentials_missing: "meta_credentials_missing";
    meta_unauthorized: "meta_unauthorized";
    meta_rate_limited: "meta_rate_limited";
    meta_unavailable: "meta_unavailable";
    post_not_found: "post_not_found";
    not_a_video: "not_a_video";
    media_url_unavailable: "media_url_unavailable";
    stt_media_refused: "stt_media_refused";
    stt_unavailable: "stt_unavailable";
    stt_invalid_response: "stt_invalid_response";
}>;
export type SocialServerStepError = z.infer<typeof SocialServerStepErrorSchema>;
/** True only for a string exactly equal to one of the codes; never throws. */
export declare function isSocialServerStepError(code: unknown): code is SocialServerStepError;
//# sourceMappingURL=server-step-errors.d.ts.map