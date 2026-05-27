import { describe, expect, it } from 'vitest';
import { AgentEmailInboxSchema } from '../../src/messaging/agent-email-inbox.js';

describe('AgentEmailInboxSchema', () => {
  it('parses canonical Forge-shaped inbox', () => {
    const r = AgentEmailInboxSchema.safeParse({
      agent_id: 'agent-bellini-001',
      provider_inbox_id: 'inbox_2qZxKv8s',
      address: 'giovanni.bellini@agentmail.to',
      display_name: 'Giovanni Bellini',
      created_at: '2026-05-27T08:00:00+00:00',
    });
    expect(r.success).toBe(true);
  });

  it('parses inbox without display_name (null)', () => {
    const r = AgentEmailInboxSchema.safeParse({
      agent_id: 'agent-bellini-001',
      provider_inbox_id: 'inbox_2qZxKv8s',
      address: 'giovanni.bellini@agentmail.to',
      display_name: null,
      created_at: '2026-05-27T08:00:00+00:00',
    });
    expect(r.success).toBe(true);
  });

  it('rejects non-email address', () => {
    const r = AgentEmailInboxSchema.safeParse({
      agent_id: 'agent-x',
      provider_inbox_id: 'inbox_x',
      address: 'not-an-email',
      display_name: null,
      created_at: '2026-05-27T08:00:00+00:00',
    });
    expect(r.success).toBe(false);
  });

  it('rejects empty provider_inbox_id', () => {
    const r = AgentEmailInboxSchema.safeParse({
      agent_id: 'agent-x',
      provider_inbox_id: '',
      address: 'x@y.test',
      display_name: null,
      created_at: '2026-05-27T08:00:00+00:00',
    });
    expect(r.success).toBe(false);
  });

  it('rejects empty agent_id (branded type guards against empty string)', () => {
    const r = AgentEmailInboxSchema.safeParse({
      agent_id: '',
      provider_inbox_id: 'inbox_x',
      address: 'x@y.test',
      display_name: null,
      created_at: '2026-05-27T08:00:00+00:00',
    });
    expect(r.success).toBe(false);
  });
});
