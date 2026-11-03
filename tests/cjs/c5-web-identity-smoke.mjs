// Web-only probes from canonical 8a00ec5; phone contracts remain unchanged.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const variants=[['esm',await import('../../dist/capability/index.js')],['cjs',require('../../dist/capability/index.cjs')]];
const at='2026-10-08T12:00:00.000Z',now=Date.parse(at);
const binding={scope:{tenantId:'tenant-smoke',ownerId:'owner-smoke',agentId:'runtime-smoke'},identity:{managementAgentId:'management-smoke',runtimeAgentId:'runtime-smoke',vaultAgentId:101}};
let checks=0;
for(const [format,web] of variants){
  const identity = { ...binding.scope, role: 'master', identity: binding.identity };
  const webRequest = { requestId: 'web-smoke-request', scope: binding.scope, linkId: 'web-smoke-link', phase: 'before' };
  const viewer = { kind: 'authenticated', userId: 'web-smoke-user', owner: { tenantId: binding.scope.tenantId, ownerId: binding.scope.ownerId } };
  const origin = 'https://forge.example.test';
  const webSnapshot = { ...webRequest, viewer, lifecycle: 'active', configuredOrigin: origin, authorityVersion: 3, observedAt: at, expiresAt: new Date(now + 60_000).toISOString(), agentIdentity: identity };
  const webResponse = { ok: true, request: webRequest, snapshot: webSnapshot };
  assert.equal(typeof web.isElevenLabsWebAuthorityUsable, 'function', `${format}: public web authority`); checks++;
  assert.equal(typeof web.ElevenLabsWebAuthorityResponseSchema.safeParse, 'function', `${format}: public web response`); checks++;
  assert.equal(web.ElevenLabsWebAuthorityResponseSchema.safeParse(webResponse).success, true, `${format}: resolved web response`); checks++;
  assert.equal(web.isElevenLabsWebAuthorityUsable(webRequest, webResponse, viewer, origin, 3, identity, new Date(now)), true, `${format}: usable canonical web identity`); checks++;
  assert.equal(web.isElevenLabsWebAuthorityUsable(webRequest, webResponse, viewer, origin, 3, identity, new Date(now + 60_000)), false, `${format}: expired web identity`); checks++;
  assert.equal(web.isElevenLabsWebAuthorityUsable(webRequest, webResponse, viewer, origin, 3, { ...identity, identity: { ...identity.identity, vaultAgentId: 102 } }, new Date(now)), false, `${format}: foreign web identity`); checks++;
  assert.equal(web.isElevenLabsWebAuthorityUsable(webRequest, { ok: false, request: webRequest, error: 'identity_unavailable', snapshot: { ...webSnapshot, agentIdentity: null } }, viewer, origin, 3, identity, new Date(now)), false, `${format}: legacy diagnostic denied`); checks++;
}
assert.equal(checks,14);
console.log(JSON.stringify({checks,total:14,variants:2,status:'passed'}));
