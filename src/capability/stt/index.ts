/**
 * STT capability contracts — sub-path `@x9-forge/contracts/capability/stt`.
 * Commercially independent from capability/voice/*. Zero schema sharing (D-02).
 * @see docs/adr/ADR-cap-stt.md (to be shipped in Plan 04)
 */
export {
  SttProviderEnum,
  TranscribeRequestSchema,
  TranscribeResponseSchema,
  type SttProvider,
  type TranscribeRequest,
  type TranscribeResponse,
} from './schema.js';

export {
  STT_TRANSCRIBE_PATH,
  STT_TRANSCRIBE_METHOD,
  CAP_STT_DEFAULT_PORT,
  CAP_STT_REGISTRY_ENTRY,
} from './endpoints.js';
