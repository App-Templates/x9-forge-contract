import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SyncAgentResultSchema,
  SyncAllRequestSchema,
  SyncAllResponseSchema,
  SyncAllErrorResponseSchema,
  syncAllContract,
} from '../../src/vault/vault-sync-event.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const loadFixture = (name: string): unknown =>
  JSON.parse(readFileSync(join(__dirname, 'fixtures', name), 'utf8'));

describe('SyncAllRequestSchema', () => {
  it('parses empty object', () => {
    expect(SyncAllRequestSchema.parse({})).toEqual({});
  });

  it('rejects non-empty body (strict)', () => {
    expect(SyncAllRequestSchema.safeParse({ trigger: true }).success).toBe(false);
  });
});

describe('SyncAllResponseSchema', () => {
  it('parses sync-all-response-ok fixture with mixed results', () => {
    const parsed = SyncAllResponseSchema.parse(loadFixture('sync-all-response-ok.json'));
    expect(parsed.ok).toBe(true);
    expect(parsed.synced.length).toBe(2);
    expect(parsed.errors.length).toBe(1);
  });

  it('parses sync-all-response-all-ok fixture', () => {
    const parsed = SyncAllResponseSchema.parse(
      loadFixture('sync-all-response-all-ok.json'),
    );
    expect(parsed.errors.length).toBe(0);
  });

  it('parses sync-all-response-all-errors fixture', () => {
    const parsed = SyncAllResponseSchema.parse(
      loadFixture('sync-all-response-all-errors.json'),
    );
    expect(parsed.synced.length).toBe(0);
  });

  it('rejects ok=false (literal true enforced)', () => {
    expect(
      SyncAllResponseSchema.safeParse({ ok: false, synced: [], errors: [] }).success,
    ).toBe(false);
  });
});

describe('SyncAllErrorResponseSchema', () => {
  it('parses { ok:false, error:"boom" }', () => {
    expect(SyncAllErrorResponseSchema.parse({ ok: false, error: 'boom' })).toEqual({
      ok: false,
      error: 'boom',
    });
  });
});

describe('SyncAgentResultSchema', () => {
  it('accepts only slug (optional fields absent)', () => {
    expect(SyncAgentResultSchema.parse({ slug: 'x' })).toEqual({ slug: 'x' });
  });
});

describe('syncAllContract', () => {
  it('has the expected method/path/authType triple', () => {
    expect(syncAllContract.path).toBe('/api/vault/sync-all');
    expect(syncAllContract.method).toBe('POST');
    expect(syncAllContract.authType).toBe('none');
  });
});
