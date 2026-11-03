"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentVoiceLocaleSchema = exports.AgentVoiceModelSchema = exports.AgentVoiceIdSchema = void 0;
const zod_1 = require("zod");
/** Provider voice id: a menu value for GPT voices, the voice id for ElevenLabs. */
exports.AgentVoiceIdSchema = zod_1.z.string().min(1).max(128);
exports.AgentVoiceModelSchema = zod_1.z.string().min(1).max(128);
/** BCP-47 language tag, e.g. it or it-IT. */
exports.AgentVoiceLocaleSchema = zod_1.z.string().regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/);
//# sourceMappingURL=agent-voice-values.js.map