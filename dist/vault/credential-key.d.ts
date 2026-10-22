import { z } from 'zod';
/** Vault key name; platform-internal keys are never listed or acted upon for an agent. */
export declare const CredentialKeySchema: z.ZodString;
export type CredentialKey = z.infer<typeof CredentialKeySchema>;
//# sourceMappingURL=credential-key.d.ts.map