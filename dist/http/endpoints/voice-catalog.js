import { INTERNAL_SECRET_HEADER } from "../../auth/index.js";
import { VoiceProviderCatalogSchema } from "../../capability/voice/agent-voice-settings.js";
/** Forge -> cap-voice: read the producer's versioned choices, authenticated with the existing platform secret.
 * This catalog is metadata only; it neither configures an agent nor creates a provider session.
 */
export const internalVoiceCatalogContract = {
    method: 'GET',
    path: '/internal/voice/catalog',
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    responseSchema: VoiceProviderCatalogSchema,
};
//# sourceMappingURL=voice-catalog.js.map