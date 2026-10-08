// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required for portable declaration generation.
import { z } from 'zod';
import { INTERNAL_TOKEN_HEADER, AuthInternalTokenSchema } from '../../auth/auth-headers.js';
import { ElevenLabsWebAuthorityRequestSchema, ElevenLabsWebAuthorityResponseSchema } from '../../capability/agent-elevenlabs/web-context.js';

/** X9 -> Forge. Authenticate the service, then load the server-owned admission attempt; never trust body authority. */
export const ELEVENLABS_WEB_AUTHORITY_PATH = '/resolve/elevenlabs-web-admission' as const;
export const elevenLabsWebAuthorityContract = {
  method: 'POST' as const,
  path: ELEVENLABS_WEB_AUTHORITY_PATH,
  authType: 'token' as const,
  authHeader: INTERNAL_TOKEN_HEADER,
  authSchema: AuthInternalTokenSchema,
  bodySchema: ElevenLabsWebAuthorityRequestSchema,
  responseSchema: ElevenLabsWebAuthorityResponseSchema,
} as const;
