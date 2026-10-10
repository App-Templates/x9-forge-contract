import { expect, it } from 'vitest';
import { CapabilityContextRequestSchema } from '../../src/capability/capability-context.js';
import { AgentSpendQuerySchema } from '../../src/http/endpoints/internal-capability-agent.js';
import { InternalAgentTurnRequestSchema } from '../../src/http/endpoints/internal-agent-turn.js';
import * as HTTP from '../../src/http/index.js';
import * as LAB from '../../src/capability/lab/index.js';
const scope = { agentId: 'runtime-a', ownerId: 'owner-a', tenantId: 'tenant-a' };
const context = { agentId: scope.agentId, sessionId: 'session-a' };
const spend = { from: '2026-10-01', to: '2026-10-02' };
it('retains complete scoped context while preserving the legacy request', () => {
  expect(CapabilityContextRequestSchema.parse(context)).toEqual(context);
  expect(CapabilityContextRequestSchema.parse({ ...context, ...scope })).toEqual({ ...context, ...scope });
});
it.each(['ownerId', 'tenantId'])('rejects an incomplete context scope missing %s', key => {
  const input: Record<string, unknown> = { ...context, ...scope }; delete input[key];
  expect(CapabilityContextRequestSchema.safeParse(input).success).toBe(false);
});
it('retains the scoped spend selector while preserving legacy spend', () => {
  expect(AgentSpendQuerySchema.parse(spend)).toEqual(spend);
  expect(AgentSpendQuerySchema.safeParse({ ...spend, tenantId: scope.tenantId, ownerId: scope.ownerId }).success).toBe(true);
  expect(AgentSpendQuerySchema.parse({ ...spend, tenantId: scope.tenantId, ownerId: scope.ownerId })).toEqual({ ...spend, tenantId: scope.tenantId, ownerId: scope.ownerId });
});
it.each(['ownerId', 'tenantId'])('rejects an incomplete spend scope missing %s', key => {
  const input: Record<string, unknown> = { ...spend, tenantId: scope.tenantId, ownerId: scope.ownerId }; delete input[key];
  expect(AgentSpendQuerySchema.safeParse(input).success).toBe(false);
});
it('retains canonical admission identity on native per-agent turns', () => {
  const input = { channelId: 'live-web', sessionId: 'session-a', message: 'synthetic', history: [], identity: scope };
  expect(InternalAgentTurnRequestSchema.parse(input)).toEqual(input);
  expect(InternalAgentTurnRequestSchema.safeParse({ ...input, identity: { agentId: scope.agentId } }).success).toBe(false);
});
it.each([
  ['news_digest', { categories: ['technology'], skipCategories: ['sports'] }],
  ['news_digest_topic', { topic: 'weather' }],
  ['calendar_today', { date: '2026-10-10' }],
  ['calendar_week', { targetDate: '2026-10-10', weekOffset: 1 }],
  ['lab_execute', { jobId: '8f0b66b3-6f48-4831-b739-52fb906dc000', leaseToken: '8f0b66b3-6f48-4831-b739-52fb906dc001' }],
] as const)('registers fixed %s with strict input and no LLM visibility', (execution, input) => {
  const entry = Reflect.get(HTTP.INTERNAL_AGENT_EXECUTIONS, execution);
  expect(entry).toBeDefined(); expect(entry.modelVisible).toBe(false); expect(entry.tool).toBe(execution);
  expect(HTTP.InternalAgentToolDispatchRequestSchema.safeParse({ requestId: 'request-a', identity: scope, execution, input }).success).toBe(true);
  for (const key of ['credentials', 'url', 'model', 'ownerId']) {
    expect(HTTP.InternalAgentToolDispatchRequestSchema.safeParse({ requestId: 'request-a', identity: scope, execution, input: { ...input, [key]: 'forged' } }).success).toBe(false);
  }
});
it('Lab execution uses only the current SQL claim, outside the model tools', () => {
  expect(Reflect.get(LAB, 'LAB_INTERNAL_TOOLS')).toEqual({ execute: 'lab_execute' });
  expect(Object.values(LAB.LAB_TOOLS)).not.toContain('lab_execute');
  const schema = Reflect.get(LAB, 'LabExecuteInputSchema'); expect(schema).toBeDefined();
  expect(schema.safeParse({ jobId: 'invalid', leaseToken: 'invalid' }).success).toBe(false);
  const output = Reflect.get(LAB, 'LabExecuteOutputSchema'); expect(output).toBeDefined();
  expect(output.safeParse({ jobId: '8f0b66b3-6f48-4831-b739-52fb906dc000', state: 'completed', credentials: {} }).success).toBe(false);
});
it('Briefing receives only canonical native Calendar prerequisite fields', () => {
  expect(HTTP.INTERNAL_AGENT_EXECUTIONS.scheduler_briefing_generate.credentialKeys).toEqual([
    'OPENAI_API_KEY', 'ELEVENLABS_API_KEY', 'TELEGRAM_BOT_TOKEN',
    'GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CALENDAR_CLIENT_SECRET', 'GOOGLE_CALENDAR_REFRESH_TOKEN',
  ]);
});

it('compiled public exports retain the complete new ingress contracts', async () => {
  const compiled = await import('@x9-forge/contracts/http');
  const cap = await import('@x9-forge/contracts/capability');
  const lab = await import('@x9-forge/contracts/capability/lab');
  expect(cap.CapabilityContextRequestSchema.parse({...context,...scope})).toEqual({...context,...scope});
  expect(compiled.AgentSpendQuerySchema.parse({...spend,ownerId:scope.ownerId,tenantId:scope.tenantId})).toEqual({...spend,ownerId:scope.ownerId,tenantId:scope.tenantId});
  expect(compiled.InternalAgentTurnRequestSchema.parse({channelId:'live-web',sessionId:'session',message:'synthetic',history:[],identity:scope})).toHaveProperty('identity',scope);
  expect(Reflect.get(compiled.INTERNAL_AGENT_EXECUTIONS,'lab_execute')).toBeDefined();
  expect(Reflect.get(lab,'LabExecuteInputSchema')).toBeDefined();
});
