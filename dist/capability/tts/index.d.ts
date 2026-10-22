/**
 * Text-to-speech capability contracts — sub-path `@x9-forge/contracts/capability/tts`.
 *
 * Phase 50 (2026-09-12) — OpenAI lane for Telegram voice notes beside ElevenLabs.
 *
 * Consumers (agent-x9):
 *   - services/agent-core/src/env.ts                (TtsProviderSchema for TTS_PROVIDER)
 *   - services/agent-core/src/core/tool-router.ts   (TtsProvider type, defaults)
 *   - services/agent-core/src/index.ts              (per-agent vault override of TTS_PROVIDER)
 *
 * Provider selection is a CONFIG value that travels cross-repo (Forge vault →
 * X9 agent-core via AgentCredentials), so its enum lives here, not inline in a
 * consumer (R-14: no inline `z.enum` for shared states).
 *
 * R-13 minimality: only the enum + defaults the consumers read. No request /
 * response envelope — TTS is a builtin inside agent-core, not a capability
 * service with an HTTP surface.
 *
 * Portable .d.ts emit: named `z` import keeps emitted declarations as
 * `z.ZodEnum<...>` (scripts/check-portable-dts.mjs guardrail).
 */
import { z } from 'zod';
/**
 * Which text-to-speech engine renders an outbound voice note.
 *   - `elevenlabs` — ElevenLabs `/v1/text-to-speech/{voiceId}` (default; the
 *                    cloned voice lives here).
 *   - `openai`     — OpenAI `/v1/audio/speech` (`gpt-4o-mini-tts`, stock voices).
 */
export declare const TtsProviderSchema: z.ZodEnum<{
    openai: "openai";
    elevenlabs: "elevenlabs";
}>;
export type TtsProvider = z.infer<typeof TtsProviderSchema>;
/** Default when neither env nor vault set `TTS_PROVIDER` — zero behaviour change. */
export declare const DEFAULT_TTS_PROVIDER: TtsProvider;
/** OpenAI TTS defaults (developers.openai.com/api/docs/guides/text-to-speech, 2026-09). */
export declare const OPENAI_TTS_DEFAULT_MODEL = "gpt-4o-mini-tts";
export declare const OPENAI_TTS_DEFAULT_VOICE = "marin";
//# sourceMappingURL=index.d.ts.map