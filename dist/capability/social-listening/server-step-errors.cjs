"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialServerStepErrorSchema = exports.SOCIAL_SERVER_STEP_ERRORS = void 0;
exports.isSocialServerStepError = isSocialServerStepError;
const zod_1 = require("zod");
/**
 * Refusal codes of the server-side round steps (engine, Meta collection, transcription).
 * `identity_mismatch` is shared by collection and transcription.
 * `too_many_attempts` is written by the engine itself and is not a step refusal.
 */
exports.SOCIAL_SERVER_STEP_ERRORS = [
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
];
exports.SocialServerStepErrorSchema = zod_1.z.enum(exports.SOCIAL_SERVER_STEP_ERRORS);
/** True only for a string exactly equal to one of the codes; never throws. */
function isSocialServerStepError(code) {
    return typeof code === 'string' && exports.SOCIAL_SERVER_STEP_ERRORS.includes(code);
}
//# sourceMappingURL=server-step-errors.js.map