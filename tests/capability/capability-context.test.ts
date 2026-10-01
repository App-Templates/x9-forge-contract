import { describe, it, expect } from 'vitest';
import {
  CAPABILITY_CONTEXT_MAX_CHARS,
  CapabilityContextRequestSchema,
  CapabilityContextResponseSchema,
  CapabilityManifestSchema,
  CapabilityRegistryEntrySchema,
  AgentRegistryFileSchema,
} from '../../src/capability/index';
import { capContextContract } from '../../src/http/endpoints/index';

const manifest = { name: 'ea-core', version: '0.1.0', endpoint: 'http://ea-core:3240', tools: [] };
const entry = { name: 'ea-core', enabled: true, host: 'ea-core', port: 3240, version: '0.1.0' };

describe('capability context (v1.24.0)', () => {
  it('a manifest and a registry entry may declare the context; without it they stay valid (pre-1.24)', () => {
    expect(CapabilityManifestSchema.parse({ ...manifest, context: { maxChars: 4000 } }).context).toEqual({ maxChars: 4000 });
    expect(CapabilityManifestSchema.parse(manifest).context).toBeUndefined();
    expect(CapabilityRegistryEntrySchema.parse({ ...entry, context: { maxChars: 4000 } }).context).toEqual({ maxChars: 4000 });
    expect(AgentRegistryFileSchema.safeParse({ capabilities: [entry] }).success).toBe(true);
  });

  it('a declaration above the hard ceiling, zero or fractional is refused', () => {
    for (const maxChars of [CAPABILITY_CONTEXT_MAX_CHARS + 1, 0, 10.5]) {
      expect(CapabilityManifestSchema.safeParse({ ...manifest, context: { maxChars } }).success, String(maxChars)).toBe(false);
    }
    expect(CapabilityManifestSchema.safeParse({ ...manifest, context: { maxChars: CAPABILITY_CONTEXT_MAX_CHARS } }).success).toBe(true);
  });

  it('the request carries the agent and the session; the channel is optional', () => {
    expect(CapabilityContextRequestSchema.safeParse({ agentId: 'ea-x', sessionId: 's' }).success).toBe(true);
    expect(CapabilityContextRequestSchema.safeParse({ agentId: 'ea-x', sessionId: 's', channelId: 'live-web' }).success).toBe(true);
    expect(CapabilityContextRequestSchema.safeParse({ sessionId: 's' }).success).toBe(false);
  });

  it('the response is a bounded text or null, with a version', () => {
    expect(CapabilityContextResponseSchema.safeParse({ text: null, version: 'none' }).success).toBe(true);
    expect(CapabilityContextResponseSchema.safeParse({ text: 'Profilo: designer.', version: 'abc' }).success).toBe(true);
    expect(CapabilityContextResponseSchema.safeParse({ text: 'x'.repeat(CAPABILITY_CONTEXT_MAX_CHARS + 1), version: 'v' }).success).toBe(false);
    expect(CapabilityContextResponseSchema.safeParse({ text: '', version: 'v' }).success).toBe(false);
    expect(CapabilityContextResponseSchema.safeParse({ text: 'x' }).success).toBe(false);
  });

  it('the endpoint is POST /context with the platform secret, like /call/:tool', () => {
    expect(capContextContract).toMatchObject({ method: 'POST', path: '/context', authType: 'secret' });
  });
});
