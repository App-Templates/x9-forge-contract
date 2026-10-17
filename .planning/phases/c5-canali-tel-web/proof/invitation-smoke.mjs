import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const variants=[['esm',await import('../../../../dist/capability/index.js')],['cjs',require('../../../../dist/capability/index.cjs')]];
const now = Date.parse('2026-10-08T12:00:00.000Z'), at = new Date(now).toISOString();
const binding = { scope: { tenantId: 'invitation-tenant', ownerId: 'invitation-owner', agentId: 'invitation-runtime' }, identity: { managementAgentId: 'invitation-management', runtimeAgentId: 'invitation-runtime', vaultAgentId: 101 } };
const metadata = { invitationId: 'invitation-record', scope: binding.scope, revision: 3, createdAt: at, expiresAt: new Date(now + 3_600_000).toISOString(), revokedAt: null };
const registered = { status: 'registered', email: 'invitee@example.test', invitation: { ...metadata, recipientUserId: 'invitation-clerk-user' } };
const pending = { status: 'pending-registration', email: 'pending@example.test', invitation: null, pending: { ...metadata, invitationId: 'invitation-pending' } };
const lookup = { status: 'registered', email: registered.email, recipientUserId: registered.invitation.recipientUserId, observedAt: at };
const list = { ...binding, status: 'available', version: 3, observedAt: at, entries: [registered, pending] };
const draft = { requestId: 'invitation-request', email: registered.email, expectedVersion: 3 };

let checks=0;
for (const [format, api] of variants.filter(([format])=>!process.argv[2] || process.argv[2]===format)) {
  for (const name of ['projectElevenLabsWebInvitationList','isElevenLabsWebInvitationListCurrent','isElevenLabsWebInvitationRecipientCurrent']) { assert.equal(typeof api[name],'function',format+': public '+name); checks++; }
  assert.equal(api.ElevenLabsWebRecipientLookupSchema.safeParse(lookup).success,true,format+': canonical current lookup');checks++;
  assert.equal(api.ElevenLabsWebInviteDraftSchema.safeParse({...draft,recipientUserId:lookup.recipientUserId}).success,false,format+': no body principal');checks++;
  assert.equal(api.isElevenLabsWebInvitationListCurrent(list,binding,now),true,format+': scoped current source');checks++;
  const {scope:_scope,...publicMetadata}=metadata;void _scope;
  const projected=api.projectElevenLabsWebInvitationList(list,binding,now);
  assert.deepEqual(projected,[{...publicMetadata,email:registered.email,status:'active'},{...publicMetadata,invitationId:pending.pending.invitationId,email:pending.email,status:'pending-registration'}],format+': public invitation metadata only');checks++;
  assert.equal(api.isElevenLabsWebInvitationRecipientCurrent(registered,lookup,binding.scope,registered.email,metadata.revision,now),true,format+': exact registered principal');checks++;
  assert.equal(api.isElevenLabsWebInvitationRecipientCurrent({...pending,email:registered.email},lookup,binding.scope,registered.email,metadata.revision,now),false,format+': pending does not authenticate');checks++;
  assert.equal(api.isElevenLabsWebInvitationRecipientCurrent(registered,{...lookup,recipientUserId:'changed-invitation-user'},binding.scope,registered.email,metadata.revision,now),false,format+': changed registered principal denied');checks++;
  assert.equal(api.isElevenLabsWebInvitationRecipientCurrent(registered,{status:'unavailable'},binding.scope,registered.email,metadata.revision,now),false,format+': unavailable does not mean pending');checks++;
  assert.equal(api.projectElevenLabsWebInvitationList(list,{...binding,identity:{...binding.identity,vaultAgentId:102}},now),null,format+': foreign binding does not yield empty');checks++;
}
console.log(JSON.stringify({checks,total:process.argv[2]?12:24,status:'passed'}));
