"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalVoiceCatalogContract = void 0;
const index_js_1 = require("../../auth/index.cjs");
const agent_voice_settings_js_1 = require("../../capability/voice/agent-voice-settings.cjs");
/** Forge -> cap-voice: read the producer's versioned choices, authenticated with the existing platform secret.
 * This catalog is metadata only; it neither configures an agent nor creates a provider session.
 */
exports.internalVoiceCatalogContract = {
    method: 'GET',
    path: '/internal/voice/catalog',
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    responseSchema: agent_voice_settings_js_1.VoiceProviderCatalogSchema,
};
//# sourceMappingURL=voice-catalog.js.map