import { internalVoiceCatalogContract } from '@x9-forge/contracts/http';
import type { AuthForEndpoint } from '@x9-forge/contracts/http';
import { INTERNAL_SECRET_HEADER } from '@x9-forge/contracts/auth';
import type { VoiceProviderCatalog } from '@x9-forge/contracts/voice';
const method: 'GET' = internalVoiceCatalogContract.method;
const auth: AuthForEndpoint<typeof internalVoiceCatalogContract.authType> = { [INTERNAL_SECRET_HEADER]: 'synthetic-internal-value' };
const catalog: VoiceProviderCatalog = internalVoiceCatalogContract.responseSchema.parse({version:'synthetic',providers:[]});
// @ts-expect-error Read-only catalog has no request body.
void internalVoiceCatalogContract.bodySchema;
void method; void auth; void catalog.version;
