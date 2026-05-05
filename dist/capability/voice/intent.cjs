"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VOICE_CALL_INTENTS = exports.VoiceCallIntentSchema = void 0;
const zod_1 = require("zod");
/**
 * Classified intent of an outbound voice call (VORIG-01 / M46).
 *
 * Exact 7-value enum per D-02 (CONTEXT.md). 'other' is the safety fallback
 * for unclassified calls — zero-risk escape hatch so the classifier is
 * never forced into a wrong positive.
 *
 * Order is part of the contract — tests assert declared order. If a future
 * milestone needs a new value, append to the tail and bump SemVer minor.
 *
 * Validation gate (46.1): the intent classifier MUST map calls to one of
 * these 7 values. If >50% of last-10 live calls resolve to 'other', the
 * enum is re-scoped BEFORE 46.1 ships (D-02 Q4 gate).
 *
 * @see .planning/phases/46.0-bridge-voice-origination/46.0-CONTEXT.md §D-02
 * @see .planning/REQUIREMENTS.md §VORIG-01
 */
exports.VoiceCallIntentSchema = zod_1.z.enum([
    'reminder',
    'information',
    'sales',
    'legal',
    'logistics',
    'social',
    'other',
]);
/** Ordered tuple of all intent values — use for iteration / exhaustiveness tests. */
exports.VOICE_CALL_INTENTS = exports.VoiceCallIntentSchema.options;
//# sourceMappingURL=intent.js.map