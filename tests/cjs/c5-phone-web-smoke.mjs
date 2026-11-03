import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const variants = [['esm', await import('../../dist/agent/index.js'), await import('../../dist/capability/index.js'), await import('../../dist/http/index.js')], ['cjs', require('../../dist/agent/index.cjs'), require('../../dist/capability/index.cjs'), require('../../dist/http/index.cjs')]];
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
for (const [format, api, web, http] of variants.filter(([format]) => !process.argv[2] || process.argv[2] === format)) {
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
  const entry = { ...binding, entryId: 'history-smoke-entry', kind: 'phone', conversationId: 'history-smoke-conversation', requestId: 'history-smoke-probe', direction: 'outbound', participantName: null, status: 'completed', startedAt: new Date(now - 60_000).toISOString(), endedAt: at, durationSeconds: 60, content: { audio: 'not-retained', transcript: 'unavailable' } };
  const history = { ...binding, status: 'available', kind: 'phone', observedAt: at, entries: [entry], total: 1, nextCursor: null, lastVerification: { requestId: entry.requestId, entryId: entry.entryId, completedAt: at, outcome: 'completed' } };
  assert.equal(typeof api.isAgentChannelHistoryCurrent, 'function', `${format}: public history`); checks++;
  assert.equal(typeof api.isAgentChannelHistoryVerificationCurrent, 'function', `${format}: public history verification`); checks++;
  assert.equal(api.AgentChannelHistoryResponseSchema.safeParse(history).success, true, `${format}: canonical history`); checks++;
  assert.equal(api.isAgentChannelHistoryCurrent(history, binding, 'phone', now), true, `${format}: scoped current history`); checks++;
  assert.equal(api.isAgentChannelHistoryVerificationCurrent(history, binding, 'phone', entry.requestId, now), true, `${format}: current explicit history verification`); checks++;
  assert.equal(api.isAgentChannelHistoryCurrent(history, { ...binding, scope: { ...binding.scope, ownerId: 'foreign-smoke' } }, 'phone', now), false, `${format}: foreign history denied`); checks++;
  assert.equal(typeof http.isAgentChannelHistoryWithinForgeAuthorization, 'function', `${format}: public history authorization`); checks++;
  assert.equal(http.isAgentChannelHistoryWithinForgeAuthorization(history, { role: 'owner', tenantId: binding.scope.tenantId, ownerId: binding.scope.ownerId }, binding.identity.managementAgentId), true, `${format}: owner history`); checks++;
  assert.equal(http.isAgentChannelHistoryWithinForgeAuthorization(history, { role: 'sa' }, binding.scope.agentId), false, `${format}: history management URL mismatch`); checks++;
  const webLink = { scope: binding.scope, linkId: webRequest.linkId, url: origin + '/parla/' + webRequest.linkId, createdAt: at };
  const webMapping = { scope: binding.scope, providerAgentId: 'synthetic-web-agent', origin: 'adopted', createdAt: at, appliedConfigVersion: 3 };
  const webAdmission = { policy: { scope: binding.scope, version: 3, access: 'owner', paused: false }, link: webLink, provider: { scope: binding.scope, mapping: webMapping, desiredState: 'active', observedAt: at, channel: { channelId: 'synthetic-web-channel', kind: 'web', state: 'loaded', loaded: true, readiness: 'ready' } }, lifecycle: 'active', invitation: null, invitationRevision: null };
  assert.equal(web.canAdmitElevenLabsWebViewer(webAdmission, binding.scope, viewer, origin, new Date(now)), true, `${format}: legacy enabled admission`); checks++;
  assert.equal(web.canAdmitElevenLabsWebViewer({ ...webAdmission, policy: { ...webAdmission.policy, enabled: true } }, binding.scope, viewer, origin, new Date(now)), true, `${format}: explicit enabled admission`); checks++;
  assert.equal(web.canAdmitElevenLabsWebViewer({ ...webAdmission, policy: { ...webAdmission.policy, enabled: false } }, binding.scope, viewer, origin, new Date(now)), false, `${format}: explicit off denied`); checks++;

  assert.equal(typeof web.projectElevenLabsWebBrowserSession, 'function', `${format}: public browser projection`); checks++;
  assert.equal(web.ElevenLabsWebBrowserRequestSchema.safeParse({ requestId: webRequest.requestId, linkId: webRequest.linkId, viewer }).success, false, `${format}: browser cannot supply authority`); checks++;
  const browserRequest = { requestId: webRequest.requestId, linkId: webRequest.linkId };
  const internalRequest = { ...browserRequest, scope: binding.scope, viewer };
  const internalResult = { ok: true, requestId: internalRequest.requestId, scope: internalRequest.scope, viewer: internalRequest.viewer, link: webLink, policyVersion: 3, mapping: webMapping, invitation: null, invitationRevision: null, issuedAt: at,
    expiresAt: new Date(now + 15 * 60_000).toISOString(), signedUrl: 'wss://api.elevenlabs.io/v1/convai/conversation?agent_id=synthetic-web-agent&conversation_signature=synthetic-only' };
  const afterRequest = { ...webRequest, phase: 'after' };
  const evidence = { browserRequest, internalRequest, internalResult, snapshot: webAdmission, viewer, configuredOrigin: origin,
    authorityResponse: { ok: true, request: afterRequest, snapshot: { ...webSnapshot, phase: 'after' } }, authorityVersion: 3, agentIdentity: identity, now: new Date(now) };
  assert.equal(web.ElevenLabsWebSessionResultSchema.safeParse(internalResult).success, true, `${format}: valid private browser evidence`); checks++;
  const browserLease = web.projectElevenLabsWebBrowserSession(evidence);
  const expectedLease = { ok: true, ...browserRequest, issuedAt: at, expiresAt: internalResult.expiresAt, signedUrl: internalResult.signedUrl };
  assert.deepEqual(browserLease, expectedLease, `${format}: exactly the admitted browser lease`); checks++;
  assert.equal(web.ElevenLabsWebBrowserSessionSchema.safeParse(browserLease).success, true, `${format}: canonical public browser lease`); checks++;
  for (const key of ['scope', 'mapping', 'viewer', 'invitation', 'agentIdentity', 'policyVersion', 'credentials']) {
    assert.equal(Object.hasOwn(browserLease, key), false, `${format}: no private browser ${key}`); checks++;
  }
  assert.equal(web.projectElevenLabsWebBrowserSession({ ...evidence, snapshot: { ...webAdmission, policy: { ...webAdmission.policy, paused: true } } }), null, `${format}: paused after mint denied`); checks++;
  assert.equal(web.projectElevenLabsWebBrowserSession({ ...evidence, agentIdentity: { ...identity, identity: { ...binding.identity, vaultAgentId: 102 } } }), null, `${format}: changed D identity after mint denied`); checks++;
  assert.equal(web.isElevenLabsWebSignedConnectionUrl(internalResult.signedUrl, 'foreign-smoke-agent'), false, `${format}: connection resource remains correlated`); checks++;

}
console.log(JSON.stringify({ checks, total: process.argv[2] ? 44 : 88, variants: process.argv[2] ? 1 : 2, status: 'passed' }));
