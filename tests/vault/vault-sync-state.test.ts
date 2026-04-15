import { describe, it, expect } from 'vitest';
import {
  VaultSyncStateSchema,
  VAULT_SYNC_STATES,
  toSyncState,
} from '../../src/vault/vault-sync-state.js';
import * as mod from '../../src/vault/vault-sync-state.js';

describe('VaultSyncStateSchema', () => {
  it('parses "synced"', () => {
    expect(VaultSyncStateSchema.parse('synced')).toBe('synced');
  });

  it('parses "overridden"', () => {
    expect(VaultSyncStateSchema.parse('overridden')).toBe('overridden');
  });

  it('rejects unknown state strings', () => {
    expect(VaultSyncStateSchema.safeParse('pending').success).toBe(false);
  });
});

describe('VAULT_SYNC_STATES', () => {
  it('equals ["synced","overridden"]', () => {
    expect(VAULT_SYNC_STATES).toEqual(['synced', 'overridden']);
  });
});

describe('toSyncState', () => {
  it('maps platform → synced', () => {
    expect(toSyncState('platform')).toBe('synced');
  });

  it('maps owner → synced', () => {
    expect(toSyncState('owner')).toBe('synced');
  });

  it('maps agent → overridden', () => {
    expect(toSyncState('agent')).toBe('overridden');
  });
});

describe('module surface (invariant I4)', () => {
  it('does not export fromSyncState (lossy by design)', () => {
    expect((mod as unknown as { fromSyncState?: unknown }).fromSyncState).toBeUndefined();
  });
});
