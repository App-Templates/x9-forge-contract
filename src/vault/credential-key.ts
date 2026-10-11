import { z } from 'zod';
import { isPlatformInternalCredentialKey } from './platform-internal-credentials.js';

/** Vault key name; platform-internal keys are never listed or acted upon for an agent. */
export const CredentialKeySchema = z.string().max(128).regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/)
  .refine((key) => !isPlatformInternalCredentialKey(key), { message: 'Platform-internal credential keys are never exposed per agent' });
export type CredentialKey = z.infer<typeof CredentialKeySchema>;

