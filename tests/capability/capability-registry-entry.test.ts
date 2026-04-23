import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CapabilityRegistryEntrySchema,
  toEndpoint,
  fromEndpoint,
  type CapabilityRegistryEntry,
} from '../../src/capability/index';

const FIXTURES_DIR = join(fileURLToPath(new URL('.', import.meta.url)), 'fixtures');
function loadFixture(name: string): Record<string, unknown> {
  const raw = JSON.parse(readFileSync(join(FIXTURES_DIR, name), 'utf8')) as Record<string, unknown>;
  const { _note: _ignored, ...rest } = raw;
  return rest;
}

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

// Fixture as Forge deploy.machine writes it (minimal, no tools, no protocol)
const FORGE_DEPLOY_MACHINE_FIXTURE: CapabilityRegistryEntry = {
  name: 'calendar',
  enabled: true,
  host: 'cap-calendar',
  port: 3000,
  version: '0.0.1',
};

describe('CapabilityRegistryEntrySchema', () => {
  it('parses Forge deploy.machine fixture (TEST-02 conformance)', () => {
    const result = CapabilityRegistryEntrySchema.safeParse(FORGE_DEPLOY_MACHINE_FIXTURE);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('calendar');
      expect(result.data.tools).toBeUndefined();
      expect(result.data.protocol).toBeUndefined();
    }
  });

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

describe('CapabilityRegistryEntrySchema — requires extension (Bug D1 quick-260422-wrz)', () => {
  it('parses registry entry with requires', () => {
    const entry = { ...FORGE_ENTRY, requires: ['calendar'] };
    const result = CapabilityRegistryEntrySchema.safeParse(entry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requires).toEqual(['calendar']);
    }
  });

  it('parses registry entry without requires (backward-compat)', () => {
    const result = CapabilityRegistryEntrySchema.safeParse(FORGE_ENTRY);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requires).toBeUndefined();
    }
  });

  it('parses registry entry with empty requires', () => {
    const entry = { ...FORGE_ENTRY, requires: [] };
    const result = CapabilityRegistryEntrySchema.safeParse(entry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requires).toEqual([]);
    }
  });

  it('rejects registry entry with non-string requires', () => {
    const entry = { ...FORGE_ENTRY, requires: [42] };
    expect(CapabilityRegistryEntrySchema.safeParse(entry).success).toBe(false);
  });

  it('rejects registry entry with empty-string requires entry', () => {
    const entry = { ...FORGE_ENTRY, requires: [''] };
    expect(CapabilityRegistryEntrySchema.safeParse(entry).success).toBe(false);
  });

  it('modelPolicy + requires can co-exist', () => {
    const entry = {
      ...FORGE_ENTRY,
      modelPolicy: { min: 'standard' as const, max: 'reasoning' as const },
      requires: ['calendar', 'memory'],
    };
    const result = CapabilityRegistryEntrySchema.safeParse(entry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.modelPolicy).toEqual({ min: 'standard', max: 'reasoning' });
      expect(result.data.requires).toEqual(['calendar', 'memory']);
    }
  });

  it('tools + requires can co-exist (regression guard — W2 fix)', () => {
    const entry = {
      ...X9_ENTRY,
      requires: ['calendar'],
    };
    const result = CapabilityRegistryEntrySchema.safeParse(entry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tools).toHaveLength(1);
      expect(result.data.requires).toEqual(['calendar']);
    }
  });
});

describe('CapabilityRegistryEntrySchema — modelPolicy extension (MDRT-04)', () => {
  it('accepts entry with valid modelPolicy (fixture f)', () => {
    const entry = loadFixture('registry-entry-with-model-policy.json');
    const parsed = CapabilityRegistryEntrySchema.parse(entry);
    expect(parsed.modelPolicy).toEqual({ min: 'standard', max: 'reasoning' });
  });

  it('accepts entry without modelPolicy — backward-compat (fixture g)', () => {
    const entry = loadFixture('registry-entry-without-model-policy.json');
    const parsed = CapabilityRegistryEntrySchema.parse(entry);
    expect(parsed.modelPolicy).toBeUndefined();
  });

  it('rejects entry with invalid modelPolicy (min > max) — transitive refine', () => {
    const bad = {
      name: 'x', enabled: true, host: 'h', port: 1, version: '1',
      modelPolicy: { min: 'reasoning', max: 'standard' },
    };
    const res = CapabilityRegistryEntrySchema.safeParse(bad);
    expect(res.success).toBe(false);
    if (!res.success) {
      const msgs = res.error.issues.map((i) => i.message).join(' | ');
      expect(msgs).toMatch(/min=reasoning.*max=standard/);
    }
  });

  it('toEndpoint / fromEndpoint baselines unchanged (modelPolicy does not affect helpers)', () => {
    const entry = CapabilityRegistryEntrySchema.parse(loadFixture('registry-entry-with-model-policy.json'));
    expect(toEndpoint(entry)).toBe('http://cap-briefing:3000');
    const round = fromEndpoint('http://cap-briefing:3000', { name: 'briefing', enabled: true, version: '1.0.0' });
    expect(round.modelPolicy).toBeUndefined();
  });
});
