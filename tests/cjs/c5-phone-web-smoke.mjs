import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const variants = [['esm', await import('../../dist/agent/index.js'), await import('../../dist/capability/index.js')], ['cjs', require('../../dist/agent/index.cjs'), require('../../dist/capability/index.cjs')]];
const at = '2026-10-08T12:00:00.000Z';
const now = Date.parse(at);
const binding = { scope: { tenantId: 'tenant-smoke', ownerId: 'owner-smoke', agentId: 'runtime-smoke' },
  identity: { managementAgentId: 'management-smoke', runtimeAgentId: 'runtime-smoke', vaultAgentId: 101 } };
const number = '+390212345678', recipient = '+390212345679';
const policy = { kind: 'phone', inbound: 'address-book', outboundEnabled: true };
const book = { ...binding, status: 'complete', version: 3, observedAt: at, emails: [], phones: [recipient] };
const configuration = { ...binding, kind: 'phone', desired: { version: 3, state: 'paused' }, applied: { version: 2, state: 'active' },
  access: { desiredPolicy: { ...policy, outboundEnabled: false }, appliedPolicy: policy },
  sharedNumber: { status: 'available', number, resourceId: 'line-smoke', version: 3, observedAt: at },
  routing: { ...binding, number, resourceId: 'line-smoke', routingIdentity: 'selector-smoke' },
  attestation: { ...binding, applied: { version: 2, state: 'active' }, channel: { channelId: 'phone-smoke', kind: 'voice', state: 'loaded', loaded: true, readiness: 'ready' }, observedAt: at, error: null }, error: null };
const snapshot = { configuration, observedAt: at, agentArchived: false, runtimeLoadState: 'loaded' };
const appliedVoice = { mode: 'voice', provider: 'openai_live', protocol: 'websocket', transports: ['phone'], voiceId: 'marin', model: 'synthetic-live' };
const voice = { agentId: binding.identity.managementAgentId, versions: { desired: 2, applied: 2, failed: null }, desired: appliedVoice, applied: appliedVoice };
const event = { callId: 'call-smoke', toNumber: number, fromNumber: recipient, routingIdentity: 'selector-smoke', receivedAt: at };
const request = { ...binding, requestId: 'request-smoke', callId: 'call-smoke', toNumber: recipient, requestedAt: at, expectedPhoneVersion: 2, expectedNumberVersion: 3, expectedRoutingIdentity: 'selector-smoke' };
const authority = { ...request, explicitlyRequested: true, observedAt: at, expiresAt: new Date(now + 60_000).toISOString() };
let checks = 0;
for (const [format, api, web] of variants.filter(([format]) => !process.argv[2] || process.argv[2] === format)) {
  for (const name of ['isPhoneNumberInAddressBook', 'isAgentPhoneInboundAdmitted', 'isAgentPhoneOutboundAdmitted']) {
    assert.equal(typeof api[name], 'function', `${format}: public ${name}`); checks++;
  }
  assert.equal(api.AgentChannelAddressBookSchema.safeParse(book).success, true, `${format}: canonical phone entries`); checks++;
  assert.equal(api.isPhoneNumberInAddressBook(recipient, book, binding, now), true, `${format}: exact contact`); checks++;
  assert.equal(api.isPhoneNumberInAddressBook(number, book, binding, now), false, `${format}: unknown contact`); checks++;
  assert.equal(api.isAgentPhoneInboundAdmitted(event, snapshot, book, binding, voice, now), true, `${format}: applied inbound`); checks++;
  assert.equal(api.isAgentPhoneInboundAdmitted({ ...event, fromNumber: number }, snapshot, book, binding, voice, now), false, `${format}: denied inbound`); checks++;
  assert.equal(api.isAgentPhoneOutboundAdmitted(request, snapshot, book, binding, voice, authority, now), true, `${format}: explicit outbound`); checks++;
  assert.equal(api.isAgentPhoneOutboundAdmitted(request, snapshot, book, binding, voice, { ...authority, explicitlyRequested: false }, now), false, `${format}: no explicit request`); checks++;
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
console.log(JSON.stringify({ checks, total: process.argv[2] ? 17 : 34, variants: process.argv[2] ? 1 : 2, status: 'passed' }));
