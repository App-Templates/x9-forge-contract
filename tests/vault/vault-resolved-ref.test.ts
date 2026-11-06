import { describe, expect, it } from 'vitest';
import {
  VaultResolvedEntrySchema,
  VaultResolvedResponseSchema,
  resolvedEntryRef,
} from '../../src/vault/index.js';
import type { VaultResolvedEntry } from '../../src/vault/index.js';

const legacyEntry: VaultResolvedEntry = {
  key: 'OPENAI_API_KEY',
  value: 'synthetic-provider-value',
  tier: 'preset',
  secret: true,
};

const versionedEntry = { ...legacyEntry, source: 'preset:2', counter: 4 };

describe('resolved credential version references', () => {
  it('accepts a 1.105.0 entry without inventing a counter', () => {
    const parsed = VaultResolvedEntrySchema.parse(legacyEntry);
    expect(parsed).toEqual(legacyEntry);
    expect(resolvedEntryRef(parsed)).toBeNull();
    expect(resolvedEntryRef({ ...legacyEntry, source: 'preset:2' })).toBeNull();
    expect(resolvedEntryRef({ ...legacyEntry, counter: 4 })).toBeNull();
    expect(resolvedEntryRef({ ...versionedEntry, counter: null })).toBeNull();
  });

  it('resolves a coherent preset version with revocation defaulting to false', () => {
    expect(resolvedEntryRef(VaultResolvedEntrySchema.parse(versionedEntry))).toEqual({
      source: 'preset:2', counter: 4, revoked: false,
    });
    expect(resolvedEntryRef(VaultResolvedEntrySchema.parse({
      ...versionedEntry, revoked: true,
    }))).toEqual({ source: 'preset:2', counter: 4, revoked: true });
  });

  it.each([
    ['platform', 'platform'],
    ['owner', 'owner:3'],
    ['agent', 'agent:7'],
    ['preset', 'preset:2'],
  ] as const)('resolves a matching %s source', (tier, source) => {
    expect(resolvedEntryRef({ ...legacyEntry, tier, source, counter: 4 })).toEqual({
      source, counter: 4, revoked: false,
    });
  });

  it.each([
    ['platform', 'preset:2'],
    ['owner', 'agent:3'],
    ['agent', 'owner:7'],
    ['preset', 'platform'],
  ] as const)('rejects a source outside the %s tier', (tier, source) => {
    const parsed = VaultResolvedEntrySchema.parse({ ...versionedEntry, tier, source });
    expect(resolvedEntryRef(parsed)).toBeNull();
  });

  it('rejects unsupported sources and unknown fields while remaining strict', () => {
    expect(VaultResolvedEntrySchema.safeParse({
      ...versionedEntry, source: 'company:1',
    }).success).toBe(false);
    expect(VaultResolvedEntrySchema.safeParse({
      ...versionedEntry, extra: true,
    }).success).toBe(false);
  });

  it.each([0, -1, 1.5, Infinity, NaN, '4'])('rejects invalid counter %s', (counter) => {
    expect(VaultResolvedEntrySchema.safeParse({ ...versionedEntry, counter }).success).toBe(false);
  });

  it('rejects non-boolean revocation flags', () => {
    expect(VaultResolvedEntrySchema.safeParse({
      ...versionedEntry, revoked: 'true',
    }).success).toBe(false);
  });

  it('accepts a response mixing legacy entries, versioned entries and thresholds', () => {
    const response = {
      agentId: 7,
      entries: [legacyEntry, versionedEntry, {
        ...versionedEntry,
        counter: 5,
        revoked: false,
        revokedThrough: { source: 'preset:2', counter: 4, revoked: true },
      }],
    };
    expect(VaultResolvedResponseSchema.parse(response)).toEqual(response);
  });

  it('applies the same-source revocation threshold even when revoked is false', () => {
    const revokedThrough = { source: 'preset:2', counter: 4, revoked: true };
    for (const counter of [3, 4, 5]) {
      const parsed = VaultResolvedEntrySchema.parse({
        ...versionedEntry, counter, revoked: false, revokedThrough,
      });
      expect(parsed.revokedThrough).toEqual(revokedThrough);
      expect(resolvedEntryRef(parsed)).toEqual({
        source: 'preset:2', counter, revoked: counter <= 4,
      });
    }
  });

  it('does not apply thresholds from a different source or erase urgent revocation', () => {
    expect(resolvedEntryRef(VaultResolvedEntrySchema.parse({
      ...versionedEntry,
      revokedThrough: { source: 'preset:3', counter: 99, revoked: true },
    }))).toEqual({ source: 'preset:2', counter: 4, revoked: false });
    expect(resolvedEntryRef(VaultResolvedEntrySchema.parse({
      ...versionedEntry,
      revoked: true,
      revokedThrough: { source: 'preset:2', counter: 3, revoked: true },
    }))).toEqual({ source: 'preset:2', counter: 4, revoked: true });
  });

  it('does not manufacture an entry version from the revocation threshold', () => {
    expect(resolvedEntryRef(VaultResolvedEntrySchema.parse({
      ...legacyEntry,
      source: 'preset:2',
      revokedThrough: { source: 'preset:2', counter: 4, revoked: true },
    }))).toBeNull();
  });

  it('validates revocation thresholds as strict version references', () => {
    for (const revokedThrough of [
      4,
      null,
      { source: 'preset:2' },
      { source: 'preset:2', counter: 0 },
      { source: 'company:1', counter: 4 },
      { source: 'preset:2', counter: 4, extra: true },
    ]) {
      expect(VaultResolvedEntrySchema.safeParse({ ...versionedEntry, revokedThrough }).success)
        .toBe(false);
    }
  });
});
