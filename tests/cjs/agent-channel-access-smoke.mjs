import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const probes = {
  agent: {
    sameAgentChannelAccessBinding: 'function', AgentTelegramChatTypeSchema: 'object', AgentChannelAccessNameSchema: 'object',
    AgentChannelAccessPolicySchema: 'object', AgentChannelAccessConfigurationSchema: 'object', AgentChannelEmailAddressSchema: 'object',
    AgentChannelAccessErrorCodeSchema: 'object', AgentChannelAccessErrorResponseSchema: 'object', AgentChannelAccessRequestOperationSchema: 'object',
    AgentChannelAccessRequestSourceSchema: 'object', AgentChannelAccessRequestResultSchema: 'object',
    AgentChannelAccessBindingSchema: 'object', AgentTelegramChatIdSchema: 'object', AgentTelegramAdmittedChatSchema: 'object',
    AgentTelegramAccessPolicySchema: 'object', AgentEmailAccessPolicySchema: 'object', AgentChannelAddressBookSchema: 'object',
    AgentTelegramAccessRequestSchema: 'object', AgentTelegramAccessRequestQueueSchema: 'object', AgentChannelAccessRequestChangesSchema: 'object',
    AgentChannelAccessApplyCommandSchema: 'object', AgentChannelAccessSnapshotSchema: 'object', AgentChannelAccessApplyResultSchema: 'object',
    isTelegramChatAdmitted: 'function', isEmailSenderAdmitted: 'function', isAgentChannelAccessSnapshotCurrent: 'function',
    isAgentChannelAccessApplyReady: 'function', isAgentChannelAccessResultForCommand: 'function',
  },
  http: {
    AgentChannelAccessParamsSchema: 'object', internalAgentChannelAccessSnapshotContract: 'object', internalAgentChannelAccessApplyContract: 'object',
    internalAgentChannelAccessPath: 'function', internalAgentChannelAccessApplyPath: 'function',
    ForgeAgentChannelAccessAuthorizationSchema: 'object', ForgeAgentChannelAccessDraftSchema: 'object', ForgeAgentChannelAccessPreviewSchema: 'object',
    isAgentChannelAccessWithinForgeAuthorization: 'function', isForgeAgentChannelAccessDraftForSnapshot: 'function', isForgeAgentChannelAccessPreviewForDraft: 'function',
    forgeAgentChannelAccessSnapshotContract: 'object', forgeAgentChannelAccessPreviewContract: 'object', forgeAgentChannelAccessApplyContract: 'object',
    forgeAgentChannelAccessPath: 'function', forgeAgentChannelAccessPreviewPath: 'function', forgeAgentChannelAccessApplyPath: 'function',
  },
};
let passed = 0, total = 0;
function check(actual, expected, message) { total++; assert.deepEqual(actual, expected, message); passed++; }
for (const [loader, load] of [['cjs', specifier => require(specifier)], ['esm', specifier => import(specifier)]]) {
  const agent = await load('@x9-forge/contracts/agent'), http = await load('@x9-forge/contracts/http');
  for (const [subpath, symbols] of Object.entries(probes)) {
    const mod = subpath === 'agent' ? agent : http;
    for (const [name, type] of Object.entries(symbols)) check(typeof mod[name], type, `${loader}/${subpath}/${name}`);
  }
  check(agent.isTelegramChatAdmitted({ kind: 'telegram', mode: 'approved-chats', chats: [] }, '123'), false, loader + '/empty-closed');
  check(agent.isTelegramChatAdmitted({ kind: 'telegram', mode: 'anyone', chats: [] }, '123'), true, loader + '/explicit-anyone');
  check(agent.AgentChannelAccessApplyCommandSchema.safeParse({ action: 'apply-channel', requestId: 'smoke-00001', desiredVersion: 2, expectedAppliedVersion: 1, requestChanges: null }).success, true, loader + '/canonical-command');
  check(agent.AgentChannelAccessApplyCommandSchema.safeParse({ action: 'apply-channel', requestId: 'smoke-00001', desiredVersion: 2, expectedAppliedVersion: 1, requestChanges: null, role: 'sa' }).success, false, loader + '/body-role-denied');
  check(http.internalAgentChannelAccessPath('agent-a', 'telegram'), '/internal/agents/agent-a/channels/telegram/access', loader + '/internal-path');
  check(http.forgeAgentChannelAccessApplyPath('agent-a', 'email'), '/api/agents/agent-a/channels/email/access/apply', loader + '/forge-path');
}
console.log(JSON.stringify({ passed, total, loaders: ['cjs', 'esm'] }));
