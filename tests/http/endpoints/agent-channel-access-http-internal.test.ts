import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as Http from '../../../src/http/index.js';
import * as Agent from '../../../src/agent/index.js';
function value(name: string): unknown { const item: unknown = Reflect.get(Http, name); expect(item, name).toBeDefined(); return item; }
function schema(name: string): z.ZodType { return value(name) as z.ZodType; }
function path(name: string, agentId: string, kind: string): unknown { return (value(name) as (agentId: string, kind: string) => string)(agentId, kind); }
const read = 'internalAgentChannelAccessSnapshotContract', apply = 'internalAgentChannelAccessApplyContract';
describe('C1 secret-only internal door endpoints', () => {
 it('declares the canonical read and apply paths with service authentication', () => {
  expect(value(read)).toMatchObject({ method: 'GET', path: '/internal/agents/:agentId/channels/:kind/access', authType: 'secret' });
  expect(value(apply)).toMatchObject({ method: 'POST', path: '/internal/agents/:agentId/channels/:kind/access/apply', authType: 'secret' });
 });
 it('reuses canonical command, response and error schemas without a local DTO', () => {
  expect(value(read)).toMatchObject({ responseSchema: Agent.AgentChannelAccessSnapshotSchema, errorResponseSchema: Agent.AgentChannelAccessErrorResponseSchema, paramsSchema: value('AgentChannelAccessParamsSchema') });
  expect(value(apply)).toMatchObject({ paramsSchema: value('AgentChannelAccessParamsSchema'), bodySchema: Agent.AgentChannelAccessApplyCommandSchema, responseSchema: Agent.AgentChannelAccessApplyResultSchema, errorResponseSchema: Agent.AgentChannelAccessErrorResponseSchema });
 });
 it.each(['telegram', 'email'])('builds validated %s paths for a resolved identity', kind => {
  expect(path('internalAgentChannelAccessPath', 'agent-a', kind)).toBe(`/internal/agents/agent-a/channels/${kind}/access`);
  expect(path('internalAgentChannelAccessApplyPath', 'runtime-b', kind)).toBe(`/internal/agents/runtime-b/channels/${kind}/access/apply`);
 });
 it.each([['../other', 'telegram'], ['UPPER', 'email'], ['agent-a', 'voice'], ['agent-a', 'telegram/../../other'], ['agent-a', 'phone']])('refuses invalid agent/kind %j %j', (agentId, kind) => {
  value('internalAgentChannelAccessPath'); value('internalAgentChannelAccessApplyPath');
  expect(() => path('internalAgentChannelAccessPath', agentId, kind)).toThrow();
  expect(() => path('internalAgentChannelAccessApplyPath', agentId, kind)).toThrow();
 });
 it('rejects params carrying user-declared authorization and permits only known birth doors', () => {
  expect(schema('AgentChannelAccessParamsSchema').safeParse({ agentId: 'agent-a', kind: 'telegram' }).success).toBe(true);
  expect(schema('AgentChannelAccessParamsSchema').safeParse({ agentId: 'agent-a', kind: 'telegram', role: 'sa' }).success).toBe(false);
 });
});
