import { describe, expect, it } from 'vitest';
import {
  AgentCreationByEmailErrorCodeSchema, AgentCreationByEmailErrorSchema,
  AgentCreationByEmailRequestSchema, AgentCreationByEmailResultSchema,
} from '../../src/agent/index.js';

const attestation = {
  tenantId: 't1', actorId: 'actor-1', channel: 'telegram', issuer: 'forge',
  issuedAt: '2026-10-15T10:00:00.000Z', expiresAt: '2026-10-15T10:05:00.000Z', nonce: 'n-1',
};
const authorization = { tenantId: 't1', actorId: 'actor-1', decision: 'granted', attestation };
const request = {
  idempotencyKey: 'create-by-email-1',
  recipientEmail: 'persona@example.com',
  draft: { name: 'Assistente', objective: 'Gestire la posta', allowedCapabilities: ['email', 'calendar'] },
  authorization,
};
const identity = { managementAgentId: 'assistente', runtimeAgentId: 'agt-1' };

describe('agent creation by email', () => {
  it('accepts a valid request', () => {
    expect(AgentCreationByEmailRequestSchema.safeParse(request).success).toBe(true);
  });
  it('rejects an imposed owner', () => {
    expect(AgentCreationByEmailRequestSchema.safeParse({ ...request, ownerId: 'o-1' }).success).toBe(false);
    expect(AgentCreationByEmailRequestSchema.safeParse({ ...request, targetIdentity: identity }).success).toBe(false);
  });
  it('rejects a denied authorization', () => {
    const denied = { ...authorization, decision: 'denied', reason: 'no' };
    expect(AgentCreationByEmailRequestSchema.safeParse({ ...request, authorization: denied }).success).toBe(false);
  });
  it('rejects duplicate capabilities and a malformed email', () => {
    const draft = { ...request.draft, allowedCapabilities: ['email', 'email'] };
    expect(AgentCreationByEmailRequestSchema.safeParse({ ...request, draft }).success).toBe(false);
    expect(AgentCreationByEmailRequestSchema.safeParse({ ...request, recipientEmail: 'not-an-email' }).success).toBe(false);
  });
  it('accepts every error code and rejects an unknown one', () => {
    for (const code of ['not_platform_owner', 'email_ambiguous', 'tenant_mismatch', 'intent_conflict', 'authorization_expired', 'resolution_failed']) {
      expect(AgentCreationByEmailErrorCodeSchema.safeParse(code).success).toBe(true);
      expect(AgentCreationByEmailErrorSchema.safeParse({ code, message: 'm' }).success).toBe(true);
    }
    expect(AgentCreationByEmailErrorSchema.safeParse({ code: 'boom', message: 'm' }).success).toBe(false);
    expect(AgentCreationByEmailErrorSchema.safeParse({ code: 'tenant_mismatch', message: '' }).success).toBe(false);
  });
  it('accepts created and invited results', () => {
    expect(AgentCreationByEmailResultSchema.safeParse({
      status: 'created', agentIdentity: identity, ownerResolution: 'existing_user', replayed: false,
    }).success).toBe(true);
    expect(AgentCreationByEmailResultSchema.safeParse({
      status: 'invited', agentIdentity: identity, ownerResolution: 'invited_identity', replayed: true,
    }).success).toBe(true);
  });
  it('requires identity for created and forbids it otherwise', () => {
    expect(AgentCreationByEmailResultSchema.safeParse({ status: 'created', ownerResolution: 'existing_user', replayed: false }).success).toBe(false);
    expect(AgentCreationByEmailResultSchema.safeParse({ status: 'pending', agentIdentity: identity, replayed: false }).success).toBe(false);
    expect(AgentCreationByEmailResultSchema.safeParse({ status: 'failed', replayed: false }).success).toBe(true);
    expect(AgentCreationByEmailResultSchema.safeParse({
      status: 'invited', agentIdentity: identity, ownerResolution: 'existing_user', replayed: false,
    }).success).toBe(false);
  });
  it('round trips through JSON', () => {
    const parsed = AgentCreationByEmailRequestSchema.parse(request);
    expect(AgentCreationByEmailRequestSchema.parse(JSON.parse(JSON.stringify(parsed)))).toEqual(parsed);
    const result = AgentCreationByEmailResultSchema.parse({ status: 'created', agentIdentity: identity, ownerResolution: 'existing_user', replayed: false });
    expect(AgentCreationByEmailResultSchema.parse(JSON.parse(JSON.stringify(result)))).toEqual(result);
  });
});
