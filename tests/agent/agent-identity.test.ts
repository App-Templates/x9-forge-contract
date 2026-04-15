import { describe, it, expect } from 'vitest';
import {
  AgentIdSchema,
  OwnerIdSchema,
  AgentIdentitySchema,
} from '../../src/agent/agent-identity.js';

describe('AgentIdSchema', () => {
  it('parses a valid agent ID string', () => {
    const result = AgentIdSchema.parse('agent-stefano-prod-001');
    expect(result).toBe('agent-stefano-prod-001');
  });

  it('rejects empty string', () => {
    expect(() => AgentIdSchema.parse('')).toThrow();
  });

  it('rejects non-string', () => {
    expect(() => AgentIdSchema.parse(123)).toThrow();
  });
});

describe('OwnerIdSchema', () => {
  it('parses a valid owner ID string', () => {
    const result = OwnerIdSchema.parse('owner_clerk_abc123');
    expect(result).toBe('owner_clerk_abc123');
  });

  it('rejects empty string', () => {
    expect(() => OwnerIdSchema.parse('')).toThrow();
  });
});

describe('AgentIdentitySchema', () => {
  it('parses valid identity', () => {
    const result = AgentIdentitySchema.parse({
      agentId: 'agent-stefano-prod-001',
      ownerId: 'owner_clerk_abc123',
    });
    expect(result.agentId).toBe('agent-stefano-prod-001');
    expect(result.ownerId).toBe('owner_clerk_abc123');
  });

  it('rejects missing agentId', () => {
    expect(() => AgentIdentitySchema.parse({ ownerId: 'owner_clerk_abc123' })).toThrow();
  });

  it('rejects missing ownerId', () => {
    expect(() => AgentIdentitySchema.parse({ agentId: 'agent-001' })).toThrow();
  });
});
