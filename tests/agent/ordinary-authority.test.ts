import { describe, expect, it } from 'vitest';
import { digestAgentWorkspace } from '../../src/agent/agent-workspace-digest.js';
import { AgentOrdinaryAuthorityQuerySchema, AgentOrdinaryAuthoritySchema, projectAgentOrdinaryAuthority, parseAgentOrdinaryAuthorityResponse } from '../../src/agent/ordinary-authority.js';
import { agentOrdinaryAuthorityPath, agentOrdinaryAuthorityContract } from '../../src/http/endpoints/internal-agents-ordinary-authority.js';
import { workspace } from './ordinary-workspace-fixture.js';

const identity = { managementAgentId: 'forge-1', runtimeAgentId: 'agent-1' };
async function input() {
  const descriptor = workspace(); const bundle = await digestAgentWorkspace(descriptor);
  return { descriptor, identity, retainedRequestId: 'apply-request-1', query: {
    view: 'ordinary-authority', tenantId: 'tenant-1', ownerId: 'owner-1', runtimeAgentId: 'agent-1',
    capability: 'calendar', requestId: 'apply-request-1', bundleVersion: bundle.appliedVersion, bundleSha256: bundle.sha256,
  } };
}
describe('retained capability authority', () => {
  it('projects only one capability with no context or credentials', async () => {
    const result = await projectAgentOrdinaryAuthority(await input());
    expect(result).toEqual({ scope: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' }, identity,
      requestId: 'apply-request-1', capability: 'calendar', bundle: await digestAgentWorkspace(workspace()), membership: 'removed', configuration: null });
    expect(Object.keys(result)).toEqual(['scope', 'identity', 'capability', 'requestId', 'bundle', 'membership', 'configuration']);
  });
  it.each(['tenantId', 'ownerId', 'runtimeAgentId', 'requestId', 'bundleVersion', 'bundleSha256'] as const)('rejects foreign or stale lookup %s', async field => {
    const data = await input();
    if (field === 'bundleVersion') data.query[field]++;
    else if (field === 'bundleSha256') data.query[field] = 'b'.repeat(64);
    else data.query[field] += '-foreign';
    await expect(projectAgentOrdinaryAuthority(data)).rejects.toThrow();
  });
  it('rejects a mismatched server identity instead of borrowing a descriptor', async () => {
    const data = await input(); data.identity = { ...identity, runtimeAgentId: 'other-agent' };
    await expect(projectAgentOrdinaryAuthority(data)).rejects.toThrow();
  });
  it('binds the authenticated response to the full lookup and expected identity', async () => {
    const data = await input(); const result = await projectAgentOrdinaryAuthority(data);
    expect(parseAgentOrdinaryAuthorityResponse(result, data.query, identity)).toEqual(result);
    for (const field of ['tenantId', 'ownerId', 'runtimeAgentId', 'capability', 'requestId', 'bundleSha256'] as const) {
      expect(() => parseAgentOrdinaryAuthorityResponse(result, { ...data.query, [field]: data.query[field] + '-foreign' }, identity)).toThrow();
    }
    expect(() => parseAgentOrdinaryAuthorityResponse(result, { ...data.query, bundleVersion: 8 }, identity)).toThrow();
    expect(() => parseAgentOrdinaryAuthorityResponse(result, data.query, { ...identity, managementAgentId: 'other' })).toThrow();
  });
  it('projects exact retained values and rejects changed configuration under the old digest', async () => {
    const data = await input();
    const configuration = { format: 'ordinary-v2', scope: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' }, capability: 'calendar', version: 1,
      parameters: [{ parameter: { key: 'limit', type: 'integer', label: 'Limit', description: 'Limit', status: 'decided', reference: 'consumer', appliesWhen: 'next_apply', consumes: true, optional: false, editableBy: ['owner'], min: 1, max: 10 }, origin: { kind: 'agent_override' }, value: 7 }] };
    Object.assign(data.descriptor, { ordinaryConfigurations: [configuration] });
    Object.assign(data.descriptor.registry, { capabilities: [{ name: 'calendar', enabled: true, host: 'calendar', port: 3001, version: '1' }] });
    Object.assign(data.descriptor, { skills: [{ capability: 'calendar', description: 'Calendar operations', procedure: { path: 'skills/calendar/SKILL.md', load: 'on-demand', editable: false, version: 7, hash: 'a'.repeat(64), bytes: 100 } }] });
    data.query.bundleSha256 = (await digestAgentWorkspace(data.descriptor)).sha256;
    const result = await projectAgentOrdinaryAuthority(data);
    expect(result.configuration).toEqual(configuration); expect(result.membership).toBe('enabled');
    configuration.parameters[0]!.value = 8;
    await expect(projectAgentOrdinaryAuthority(data)).rejects.toThrow('bundle');
  });
  it('keeps disabled distinct from removed', async () => {
    const data = await input();
    Object.assign(data.descriptor.registry, { capabilities: [{ name: 'calendar', enabled: false, host: 'calendar', port: 3001, version: '1' }] });
    const bundle = await digestAgentWorkspace(data.descriptor); data.query.bundleSha256 = bundle.sha256;
    expect((await projectAgentOrdinaryAuthority(data)).membership).toBe('disabled');
  });
  it('uses the canonical authenticated management path and validates query versions', async () => {
    const { query } = await input();
    expect(agentOrdinaryAuthorityContract.authType).toBe('secret');
    expect(agentOrdinaryAuthorityPath('forge-1', { ...query, bundleVersion: '7' })).toMatch(/^\/internal\/agents\/forge-1\/management\?view=ordinary-authority&/);
    for (const version of [true, '', '0', '7.1', '01', Infinity]) expect(AgentOrdinaryAuthorityQuerySchema.safeParse({ ...query, bundleVersion: version }).success).toBe(false);
  });
  it('rejects response config belonging to another scope or capability and extra context', async () => {
    const result = await projectAgentOrdinaryAuthority(await input());
    expect(AgentOrdinaryAuthoritySchema.safeParse({ ...result, context: {} }).success).toBe(false);
    for (const scope of [{ ...result.scope, ownerId: 'other' }, { ...result.scope, agentId: 'other' }]) {
      expect(AgentOrdinaryAuthoritySchema.safeParse({ ...result, membership: 'enabled', configuration: { format: 'ordinary-v2', scope, capability: result.capability, version: 1, parameters: [] } }).success).toBe(false);
    }
    expect(AgentOrdinaryAuthoritySchema.safeParse({ ...result, membership: 'enabled', configuration: { format: 'ordinary-v2', scope: result.scope, capability: 'other', version: 1, parameters: [] } }).success).toBe(false);
  });
});
