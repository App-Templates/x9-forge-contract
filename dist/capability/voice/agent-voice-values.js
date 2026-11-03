import { z } from 'zod';
/** Provider voice id: a menu value for GPT voices, the voice id for ElevenLabs. */
export const AgentVoiceIdSchema = z.string().min(1).max(128);
export const AgentVoiceModelSchema = z.string().min(1).max(128);
/** BCP-47 language tag, e.g. it or it-IT. */
export const AgentVoiceLocaleSchema = z.string().regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/);
//# sourceMappingURL=agent-voice-values.js.map