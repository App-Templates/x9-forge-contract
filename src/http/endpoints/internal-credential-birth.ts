// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required for portable declaration emission.
import { z } from 'zod';
import { INTERNAL_TOKEN_HEADER, AuthInternalTokenSchema } from '../../auth/auth-headers.js';
import { CredentialBirthPreviewRequestSchema, CredentialBirthPreviewResponseSchema, CredentialBirthBindRequestSchema, CredentialBirthBindResponseSchema } from '../../vault/credential-birth.js';

/** Factory -> Vault. Descriptors install no handlers. Authenticate with the native internal token guard,
 * load reserved authority, lock agent then source, recheck the complete snapshot, and atomically persist
 * references + receipt + audit. A stale snapshot or conflicting request never falls back to another source.
 */
export const internalCredentialBirthPreviewContract = {
  method: 'POST' as const, path: '/internal/credentials/birth/preview' as const, authType: 'token' as const,
  authHeader: INTERNAL_TOKEN_HEADER, authSchema: AuthInternalTokenSchema,
  bodySchema: CredentialBirthPreviewRequestSchema, responseSchema: CredentialBirthPreviewResponseSchema,
} as const;
export const internalCredentialBirthBindContract = {
  method: 'POST' as const, path: '/internal/credentials/birth/bind' as const, authType: 'token' as const,
  authHeader: INTERNAL_TOKEN_HEADER, authSchema: AuthInternalTokenSchema,
  bodySchema: CredentialBirthBindRequestSchema, responseSchema: CredentialBirthBindResponseSchema,
} as const;
