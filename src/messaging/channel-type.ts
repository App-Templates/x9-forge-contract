import { z } from 'zod';

/**
 * Cross-repo channel enum for the messaging subpath.
 *
 * Authoritative source for the 4 channels X9/Forge currently address:
 *   - telegram (cap-telegram + agent-core grammy bot + Phase 11 telegram-router-svc multi-bot)
 *   - email    (cap-email + AgentMail provider)
 *   - voice    (cap-voice + ElevenLabs SIP, Forge voice-svc)
 *   - whatsapp (forward-looking — no live capability today, declared so consumers
 *               can mark it as primary with `fallback='telegram'` per the channel
 *               choice pattern; provider mapping TBD when cap-whatsapp ships)
 *
 * **Bridge owns this enum.** Parallel mirrors the same 4 values locally in
 * `packages/contracts/src/runtime/channel-choice.ts` (`ChannelEnumSchema`) by
 * design — Hard Rule 21 (memoria 21) forbids Parallel from importing the
 * bridge directly when the contract describes a Parallel-internal narrative
 * concept. The mirror is intentional; JSDoc cross-link both files when adding
 * or removing values here, and update Parallel in the same wave.
 *
 * Snake_case convention is reserved for transport payload field names; enum
 * VALUES stay short lowercase lexemes (matches `provider` literals in
 * `capability/voice/normalized-event.ts:45`).
 */
export const ChannelTypeSchema = z.enum(['telegram', 'email', 'voice', 'whatsapp']);
export type ChannelType = z.infer<typeof ChannelTypeSchema>;
