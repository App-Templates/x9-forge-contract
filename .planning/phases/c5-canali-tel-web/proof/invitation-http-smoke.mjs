import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const variants=[['esm',await import('../../../../dist/http/index.js')],['cjs',require('../../../../dist/http/index.cjs')]];
const now = Date.parse('2026-10-08T12:00:00.000Z'), at = new Date(now).toISOString();
const scope = { tenantId: 'invitation-tenant', ownerId: 'invitation-owner', agentId: 'invitation-runtime' };
const identity = { managementAgentId: 'invitation-management', runtimeAgentId: scope.agentId, vaultAgentId: 101 };
const owner = { role: 'owner', ownerId: scope.ownerId, tenantId: scope.tenantId }, agentId = identity.managementAgentId;
const entry = { invitationId: 'invitation-record', revision: 4, email: 'invitee@example.test', status: 'active', createdAt: at, expiresAt: new Date(now + 3_600_000).toISOString(), revokedAt: null };
// Canonical C3 record fields are constructed explicitly, without browser metadata or authority.
function source() { return { scope, identity, status: 'available', version: 4, observedAt: at, entries: [
  { status: 'registered', email: entry.email, invitation: { invitationId: entry.invitationId, revision: 4,
    createdAt: at, expiresAt: entry.expiresAt, revokedAt: null, scope, recipientUserId: 'invitation-clerk-user' } },
] }; }
const draft = { requestId: 'invitation-write-request', email: entry.email, expectedVersion: 3 };
const remove = { requestId: draft.requestId, invitationId: entry.invitationId, expectedVersion: 3 };
const receipt = { ok: true, requestId: draft.requestId, replayed: false, version: 4, invitation: entry };
const revoked = { ...receipt, invitation: { ...entry, status: 'revoked', revokedAt: at } };

let checks=0;
for (const [format,api] of variants.filter(([format])=>!process.argv[2] || process.argv[2]===format)) {
 for (const name of ['isElevenLabsWebInvitationWithinForgeAuthorization','projectForgeElevenLabsWebInvitations','isForgeElevenLabsWebInvitationResultForDraft']) { assert.equal(typeof api[name],'function',format+': public '+name);checks++; }
 assert.equal(api.forgeElevenLabsWebInvitationsContract.authentication,'forge-session');checks++;
 assert.equal(api.forgeElevenLabsWebInviteContract.authorization,'sa-or-agent-owner');checks++;
 assert.equal(api.forgeElevenLabsWebRevokeContract.method,'POST');checks++;
 assert.equal(api.isElevenLabsWebInvitationWithinForgeAuthorization(source(),owner,agentId),true);checks++;
 assert.equal(api.isElevenLabsWebInvitationWithinForgeAuthorization(source(),{...owner,tenantId:'other-tenant'},agentId),false);checks++;
 assert.deepEqual(api.projectForgeElevenLabsWebInvitations(source(),owner,agentId,now),{status:'available',version:4,observedAt:at,entries:[entry]});checks++;
 assert.equal(api.projectForgeElevenLabsWebInvitations(source(),owner,agentId,now+60_000),null);checks++;
 assert.equal(api.isForgeElevenLabsWebInvitationResultForDraft('invite',draft,receipt),true);checks++;
 assert.equal(api.isForgeElevenLabsWebInvitationResultForDraft('invite',draft,{...receipt,invitation:{...entry,email:'other@example.test'}}),false);checks++;
 assert.equal(api.isForgeElevenLabsWebInvitationResultForDraft('revoke',remove,revoked),true);checks++;
 assert.equal(api.isForgeElevenLabsWebInvitationResultForDraft('other',remove,revoked),false);checks++;
 assert.equal(api.ForgeElevenLabsWebInvitationListResponseSchema.safeParse({status:'unavailable',entries:[]}).success,false);checks++;
 assert.equal(api.forgeElevenLabsWebInvitationsPath(agentId),'/api/agents/invitation-management/channels/web/invitations');checks++;
}
console.log(JSON.stringify({checks,total:process.argv[2]?16:32,status:'passed'}));
