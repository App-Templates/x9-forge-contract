// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required for portable declaration emission.
import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../../auth/index.js';
import { VoiceProviderCatalogSchema } from '../../capability/voice/agent-voice-settings.js';

/** Forge -> cap-voice: read the producer's versioned choices, authenticated with the existing platform secret.
 * This catalog is metadata only; it neither configures an agent nor creates a provider session.
 */
export const internalVoiceCatalogContract = {
  method: 'GET' as const,
  path: '/internal/voice/catalog' as const,
  authType: 'secret' as const,
  authHeader: INTERNAL_SECRET_HEADER,
  responseSchema: VoiceProviderCatalogSchema,
} as const;
