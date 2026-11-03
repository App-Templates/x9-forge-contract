import { expect, it } from 'vitest';
import { nativeBrowserAdmissionContract, nativeAuthorityResolveContract, nativeAuthorityRecheckContract, nativeOpeningContract,
 nativeMintContract, nativeConversationBindContract, nativeExecutionAttachContract, nativePauseContract, nativeCallbackContract,
 nativePromptBundleContract, nativeApplyContract, nativeReadbackContract, nativeBrowserPolicyReadContract, nativeBrowserPolicyChangeContract,
 capElevenLabsNativeAuthorityPath, NativeBrowserPolicyChangeSchema } from '../../src/http/index.js';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';
it('separates authenticated browser routes, internal services and raw provider callbacks', () => {
 for (const c of [nativeBrowserAdmissionContract, nativeBrowserPolicyReadContract, nativeBrowserPolicyChangeContract]) expect(c.authType).toBe('forge_session');
 for (const c of [nativeAuthorityResolveContract, nativeAuthorityRecheckContract, nativeOpeningContract, nativeMintContract,
 nativeConversationBindContract, nativeExecutionAttachContract, nativePauseContract, nativePromptBundleContract, nativeApplyContract, nativeReadbackContract]) {
  expect(c.authType).toBe('secret'); expect(c.authHeader).toBe(INTERNAL_SECRET_HEADER); expect(c.method).toBe('POST'); expect(c.path).toMatch(/^\/internal\/capability\/agents\/:agentId\/elevenlabs\/native\//);
 }
 expect(nativeCallbackContract.authType).toBe('external_provider'); expect(nativeCallbackContract.rawBodyRequired).toBe(true); expect(nativeCallbackContract.signatureAlgorithm).toBe('hmac-sha256');
 expect(capElevenLabsNativeAuthorityPath('synthetic-agent', 'resolve')).toBe('/internal/capability/agents/synthetic-agent/elevenlabs/native/authority/resolve');
 expect(() => capElevenLabsNativeAuthorityPath('synthetic-agent', 'other' as never)).toThrow();
 const policy = { requestId: 'synthetic-policy', expectedVersion: 1, access: 'owner', paused: false };
 expect(NativeBrowserPolicyChangeSchema.safeParse(policy).success).toBe(true);
 expect(NativeBrowserPolicyChangeSchema.safeParse({ ...policy, scope: { agentId: 'chosen-by-browser' } }).success).toBe(false);
});
