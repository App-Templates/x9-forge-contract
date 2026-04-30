import { describe, it, expect } from 'vitest';
import {
  memoryConsoleListContract,
  memoryConsoleParamsSchema,
  MemoryConsoleKindSchema,
} from '../../../src/http/endpoints/memory-console.js';

describe('memoryConsoleListContract', () => {
  it('declares GET /internal/memory/console/:kind with secret auth', () => {
    expect(memoryConsoleListContract.method).toBe('GET');
    expect(memoryConsoleListContract.path).toBe('/internal/memory/console/:kind');
    expect(memoryConsoleListContract.authType).toBe('secret');
  });
});

describe('MemoryConsoleKindSchema', () => {
  const validKinds = ['episodes', 'facts', 'rules', 'aliases', 'feedback'] as const;

  it.each(validKinds)('parses valid kind: %s', (kind) => {
    expect(() => MemoryConsoleKindSchema.parse(kind)).not.toThrow();
    expect(MemoryConsoleKindSchema.parse(kind)).toBe(kind);
  });

  it('rejects invalid kind value', () => {
    expect(() => MemoryConsoleKindSchema.parse('garbage')).toThrow();
  });

  it('rejects empty string', () => {
    expect(() => MemoryConsoleKindSchema.parse('')).toThrow();
  });

  it('rejects unknown kind to prevent path traversal (T-18-00-02)', () => {
    expect(() => MemoryConsoleKindSchema.parse('../etc/passwd')).toThrow();
    expect(() => MemoryConsoleKindSchema.parse('memory_episodes')).toThrow();
  });
});

describe('memoryConsoleParamsSchema', () => {
  it('parses a valid params object with required fields only', () => {
    const result = memoryConsoleParamsSchema.safeParse({
      tenant_id: 't1',
      agent_id: 'a1',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tenant_id).toBe('t1');
      expect(result.data.agent_id).toBe('a1');
      expect(result.data.cursor).toBeUndefined();
      expect(result.data.limit).toBeUndefined();
    }
  });

  it('parses a valid params object with all optional fields', () => {
    const result = memoryConsoleParamsSchema.safeParse({
      tenant_id: 'tenant-abc',
      agent_id: 'agent-xyz',
      cursor: 'cursor-token-abc123',
      limit: '50',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing tenant_id (T-18-00-04 cross-tenant leak guard)', () => {
    const result = memoryConsoleParamsSchema.safeParse({
      agent_id: 'a1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing agent_id', () => {
    const result = memoryConsoleParamsSchema.safeParse({
      tenant_id: 't1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty tenant_id', () => {
    const result = memoryConsoleParamsSchema.safeParse({
      tenant_id: '',
      agent_id: 'a1',
    });
    expect(result.success).toBe(false);
  });
});
