import type { CapabilityRegistryEntry } from '../capability-registry-entry.js';

/** HTTP path constant for the STT transcribe tool call. */
export const STT_TRANSCRIBE_PATH = '/call/transcribe' as const;
export const STT_TRANSCRIBE_METHOD = 'POST' as const;

/** Default port reserved for cap-stt (next free after cap-rag 3215). D-09. */
export const CAP_STT_DEFAULT_PORT = 3216 as const;

/**
 * Canonical CapabilityRegistryEntry for cap-stt.
 * `requires: []` declares commercial independence from cap-voice (D-02).
 */
export const CAP_STT_REGISTRY_ENTRY: CapabilityRegistryEntry = {
  name: 'stt',
  enabled: true,
  host: 'cap-stt',
  port: CAP_STT_DEFAULT_PORT,
  version: '0.0.1',
  requires: [],
  tools: [
    {
      name: 'transcribe',
      description:
        'Transcribe an audio file fetched from a signed URL. Used internally by agent-core voice handler — NOT exposed in LLM tools[].',
      inputSchema: {
        type: 'object',
        properties: {
          telegramFileUrl: {
            type: 'string',
            description: 'HTTPS Telegram signed URL to the OGG audio file',
          },
          durationSec: {
            type: 'number',
            description: 'Audio duration in seconds (max 60)',
          },
          mimeType: {
            type: 'string',
            description: 'MIME type hint (default audio/ogg)',
          },
        },
        required: ['telegramFileUrl', 'durationSec'],
      },
    },
  ],
};
