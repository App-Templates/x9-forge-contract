import { describe, it, expect } from 'vitest';
import {
  CapabilityRegistryEntrySchema,
  toEndpoint,
  fromEndpoint,
  type CapabilityRegistryEntry,
} from '../../src/capability/index';

// Canonical entries as Forge writes them (no tools, no protocol)
const FORGE_ENTRY: CapabilityRegistryEntry = {
  name: 'cap-calendar',
  enabled: true,
  host: 'cap-calendar',
  port: 3000,
  version: '1.0.0',
};

// Entries as X9 generate-registry writes them (with tools)
const X9_ENTRY: CapabilityRegistryEntry = {
  name: 'memory',
  enabled: true,
  host: 'memory',
  port: 3001,
  version: '1.0.0',
  tools: [
    {
      name: 'memory_recall',
      description: 'Search long-term memory',
      inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    },
  ],
};

describe('CapabilityRegistryEntrySchema', () => {
  it('parses Forge-style entry (no tools, no protocol)', () => {
    const result = CapabilityRegistryEntrySchema.safeParse(FORGE_ENTRY);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tools).toBeUndefined();
      expect(result.data.protocol).toBeUndefined();
    }
  });

  it('parses X9-style entry (with tools, no protocol)', () => {
    const result = CapabilityRegistryEntrySchema.safeParse(X9_ENTRY);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tools).toHaveLength(1);
    }
  });

  it('parses entry with explicit https protocol', () => {
    const https_entry = { ...FORGE_ENTRY, protocol: 'https' as const };
    const result = CapabilityRegistryEntrySchema.safeParse(https_entry);
    expect(result.success).toBe(true);
  });

  it('rejects entry with missing host (fail-loud)', () => {
    const { host: _, ...withoutHost } = FORGE_ENTRY;
    expect(CapabilityRegistryEntrySchema.safeParse(withoutHost).success).toBe(false);
  });

  it('rejects entry with port 0 (fail-loud — must be positive int)', () => {
    expect(CapabilityRegistryEntrySchema.safeParse({ ...FORGE_ENTRY, port: 0 }).success).toBe(false);
  });

  it('rejects entry with float port (fail-loud)', () => {
    expect(CapabilityRegistryEntrySchema.safeParse({ ...FORGE_ENTRY, port: 3000.5 }).success).toBe(false);
  });

  it('rejects unknown protocol value (fail-loud)', () => {
    expect(CapabilityRegistryEntrySchema.safeParse({ ...FORGE_ENTRY, protocol: 'ftp' }).success).toBe(false);
  });
});

describe('toEndpoint', () => {
  it('produces http URL (protocol absent → defaults to http)', () => {
    expect(toEndpoint(FORGE_ENTRY)).toBe('http://cap-calendar:3000');
  });

  it('produces http URL when protocol is explicit http', () => {
    expect(toEndpoint({ ...FORGE_ENTRY, protocol: 'http' })).toBe('http://cap-calendar:3000');
  });

  it('produces https URL', () => {
    expect(toEndpoint({ ...FORGE_ENTRY, protocol: 'https' })).toBe('https://cap-calendar:3000');
  });

  it('matches real registry.json memory endpoint', () => {
    expect(toEndpoint(X9_ENTRY)).toBe('http://memory:3001');
  });
});

describe('fromEndpoint', () => {
  it('parses http endpoint — omits protocol field (http is default)', () => {
    const entry = fromEndpoint('http://memory:3001', { name: 'memory', enabled: true, version: '1.0.0' });
    expect(entry.host).toBe('memory');
    expect(entry.port).toBe(3001);
    expect(entry.protocol).toBeUndefined();
    expect(entry.version).toBe('1.0.0');
  });

  it('parses https endpoint — stores protocol: https', () => {
    const entry = fromEndpoint('https://secure-cap:443', { name: 'secure-cap', enabled: true, version: '2.0.0' });
    expect(entry.host).toBe('secure-cap');
    expect(entry.port).toBe(443);
    expect(entry.protocol).toBe('https');
  });

  it('round-trips: fromEndpoint → toEndpoint produces original URL', () => {
    const originalUrl = 'http://cap-calendar:3000';
    const entry = fromEndpoint(originalUrl, { name: 'calendar', enabled: true, version: '1.0.0' });
    expect(toEndpoint(entry)).toBe(originalUrl);
  });

  it('throws on malformed URL', () => {
    expect(() => fromEndpoint('not-a-url', { name: 'x', enabled: true, version: '1.0.0' })).toThrow();
  });
});
