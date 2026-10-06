import { describe, expect, it } from 'vitest';
import {
  AgentActionLogEventSchema,
  AgentScopePolicySchema,
  PolicyApprovalSchema,
  resolvePolicyDecision,
} from '../../src/agent/index.js';

const normal = {
  version: 2,
  defaultWebSearch: true,
  scopeLimited: false,
  defaults: { read: 'allow', write: 'ask' },
  rules: [
    { capability: 'calendar', read: 'allow', write: 'ask' },
    { capability: 'calendar', tool: 'calendar_delete_event', read: 'deny', write: 'deny' },
    { capability: 'email', read: 'allow', write: 'deny' },
  ],
};
const limited = {
  version: 1,
  defaultWebSearch: false,
  scopeLimited: true,
  purpose: 'Guidare la meditazione della persona',
  defaults: { read: 'deny', write: 'deny' },
  rules: [{ capability: 'coach', read: 'allow', write: 'allow' }],
};

describe('R5 scope policy', () => {
  it('accepts a normal agent with native web search and a purpose-limited agent', () => {
    expect(AgentScopePolicySchema.safeParse(normal).success).toBe(true);
    expect(AgentScopePolicySchema.safeParse(limited).success).toBe(true);
  });

  it.each([
    ['limited agent with permissive read default', { ...limited, defaults: { read: 'allow', write: 'deny' } }],
    ['limited agent with ask write default', { ...limited, defaults: { read: 'deny', write: 'ask' } }],
    ['limited agent without purpose', { ...limited, purpose: undefined }],
    ['duplicate capability rule', { ...normal, rules: [normal.rules[0], normal.rules[0]] }],
    ['duplicate tool rule', { ...normal, rules: [normal.rules[1], normal.rules[1]] }],
    ['unknown decision', { ...normal, defaults: { read: 'maybe', write: 'ask' } }],
    ['rule without write decision', { ...normal, rules: [{ capability: 'email', read: 'allow' }] }],
    ['invalid tool name', { ...normal, rules: [{ capability: 'email', tool: 'Send Mail', read: 'allow', write: 'deny' }] }],
    ['missing web search flag', { ...normal, defaultWebSearch: undefined }],
  ])('rejects %s', (_label, input) => {
    expect(AgentScopePolicySchema.safeParse(input).success).toBe(false);
  });

  it.each([
    [{ capability: 'calendar', tool: 'calendar_delete_event', access: 'read' }, 'deny'],
    [{ capability: 'calendar', tool: 'calendar_list', access: 'write' }, 'ask'],
    [{ capability: 'calendar', access: 'read' }, 'allow'],
    [{ capability: 'email', tool: 'email_send', access: 'write' }, 'deny'],
    [{ capability: 'news', tool: 'news_digest', access: 'read' }, 'allow'],
    [{ capability: 'news', access: 'write' }, 'ask'],
  ] as const)('resolves tool rule > capability rule > default', (request, expected) => {
    expect(resolvePolicyDecision(AgentScopePolicySchema.parse(normal), request)).toBe(expected);
  });

  it('does not confuse another tool rule with the capability rule, whatever the order', () => {
    const reordered = AgentScopePolicySchema.parse({ ...normal, rules: [normal.rules[1], normal.rules[0]] });
    expect(resolvePolicyDecision(reordered, { capability: 'calendar', tool: 'calendar_list', access: 'read' })).toBe('allow');
  });

  it('denies everything outside the purpose of a limited agent', () => {
    const policy = AgentScopePolicySchema.parse(limited);
    expect(resolvePolicyDecision(policy, { capability: 'coach', tool: 'coach_session_start', access: 'write' })).toBe('allow');
    expect(resolvePolicyDecision(policy, { capability: 'email', tool: 'email_send', access: 'write' })).toBe('deny');
    expect(resolvePolicyDecision(policy, { capability: 'ricerca', access: 'read' })).toBe('deny');
  });
});

const identity = { tenantId: 't-1', ownerId: 'o-2', agentId: 'agent-7', userId: 'person-9' };
const approval = {
  approvalId: 'apr-00000001', identity, capability: 'calendar', tool: 'calendar_create_event', access: 'write',
  policyVersion: 2, requestedAt: '2026-10-07T01:00:00Z', expiresAt: '2026-10-07T01:15:00Z', status: 'pending',
};

describe('R5 approval of an ask decision', () => {
  it('tracks a pending request and an authenticated human decision', () => {
    expect(PolicyApprovalSchema.safeParse(approval).success).toBe(true);
    expect(PolicyApprovalSchema.safeParse({ ...approval, status: 'approved', decidedBy: 'clerk:user_1', decidedAt: '2026-10-07T01:05:00Z' }).success).toBe(true);
    expect(PolicyApprovalSchema.safeParse({ ...approval, status: 'expired' }).success).toBe(true);
  });

  it.each([
    ['approval without decider', { status: 'approved', decidedAt: '2026-10-07T01:05:00Z' }],
    ['rejection without time', { status: 'rejected', decidedBy: 'clerk:user_1' }],
    ['pending with a decider', { decidedBy: 'clerk:user_1', decidedAt: '2026-10-07T01:05:00Z' }],
    ['approval after expiry', { status: 'approved', decidedBy: 'clerk:user_1', decidedAt: '2026-10-07T01:20:00Z' }],
    ['decision before request', { status: 'approved', decidedBy: 'clerk:user_1', decidedAt: '2026-10-07T00:59:00Z' }],
    ['expiry before request', { expiresAt: '2026-10-07T00:30:00Z' }],
    ['approval by the model', { status: 'approved', decidedBy: 'clerk:user_1', decidedAt: '2026-10-07T01:05:00Z', decidedByModel: true }],
  ])('rejects %s', (_label, patch) => {
    expect(PolicyApprovalSchema.safeParse({ ...approval, ...patch }).success).toBe(false);
  });
});

describe('R5 action log event', () => {
  const event = {
    eventId: 'evt-00000001', occurredAt: '2026-10-07T01:00:00Z', identity, capability: 'calendar',
    tool: 'calendar_list', access: 'read', decision: 'allow', outcome: 'executed', policyVersion: 2, provenance: 'user', channel: 'telegram',
  };

  it.each([
    [{}],
    [{ decision: 'deny', outcome: 'denied' }],
    [{ decision: 'ask', outcome: 'pending-approval', approvalId: 'apr-00000001', access: 'write' }],
    [{ decision: 'ask', outcome: 'executed', approvalId: 'apr-00000001', access: 'write' }],
    [{ decision: 'ask', outcome: 'denied', approvalId: 'apr-00000001' }],
    [{ decision: 'ask', outcome: 'expired', approvalId: 'apr-00000001' }],
    [{ outcome: 'failed', provenance: 'external-content' }],
  ])('accepts a coherent event %#', (patch) => {
    expect(AgentActionLogEventSchema.safeParse({ ...event, ...patch }).success).toBe(true);
  });

  it.each([
    ['executed after deny', { decision: 'deny', outcome: 'executed' }],
    ['executed ask without approval', { decision: 'ask', outcome: 'executed' }],
    ['pending without ask', { decision: 'allow', outcome: 'pending-approval', approvalId: 'apr-00000001' }],
    ['denied ask without approval', { decision: 'ask', outcome: 'denied' }],
    ['allowed but denied', { decision: 'allow', outcome: 'denied' }],
    ['payload in the log', { input: { to: 'someone@example.com' } }],
    ['secret in the log', { credentials: { K: 'v' } }],
    ['unknown provenance', { provenance: 'tool-output-says-so' }],
  ])('rejects %s', (_label, patch) => {
    expect(AgentActionLogEventSchema.safeParse({ ...event, ...patch }).success).toBe(false);
  });
});
