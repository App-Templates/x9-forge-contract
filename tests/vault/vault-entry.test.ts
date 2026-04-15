import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AES_WIRE_FORMAT_REGEX,
  VaultEntryPlainSchema,
  VaultEntryEncryptedSchema,
} from '../../src/vault/vault-entry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const loadFixture = (name: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(__dirname, 'fixtures', name), 'utf8')) as Record<string, unknown>;

describe('AES_WIRE_FORMAT_REGEX', () => {
  it('matches synthetic encrypted fixture (agent)', () => {
    const fx = loadFixture('vault-entry-encrypted-agent.json');
    expect(AES_WIRE_FORMAT_REGEX.test(fx['value'] as string)).toBe(true);
  });

  it('matches synthetic encrypted fixture (owner)', () => {
    const fx = loadFixture('vault-entry-encrypted-owner.json');
    expect(AES_WIRE_FORMAT_REGEX.test(fx['value'] as string)).toBe(true);
  });

  it('rejects uppercase hex', () => {
    expect(
      AES_WIRE_FORMAT_REGEX.test(
        'AAAAAAAAAAAAAAAAAAAAAAAA:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb:deadbeef',
      ),
    ).toBe(false);
  });

  it('rejects missing segment', () => {
    expect(
      AES_WIRE_FORMAT_REGEX.test('aaaaaaaaaaaaaaaaaaaaaaaa:deadbeef'),
    ).toBe(false);
  });

  it('rejects too-short ciphertext (1 hex char)', () => {
    expect(
      AES_WIRE_FORMAT_REGEX.test(
        'aaaaaaaaaaaaaaaaaaaaaaaa:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb:a',
      ),
    ).toBe(false);
  });
});

describe('VaultEntryPlainSchema', () => {
  it('parses plain-agent fixture', () => {
    const fx = loadFixture('vault-entry-plain-agent.json');
    const parsed = VaultEntryPlainSchema.parse(fx);
    expect(parsed.key).toBe('OPENAI_API_KEY');
    expect(parsed.value).toBe('REDACTED');
    expect(parsed.isSecret).toBe(true);
  });

  it('parses plain-platform fixture', () => {
    const fx = loadFixture('vault-entry-plain-platform.json');
    const parsed = VaultEntryPlainSchema.parse(fx);
    expect(parsed.tier).toBe('platform');
    expect(parsed.isSecret).toBe(false);
  });

  it('T-05-01 guard: rejects isSecret=true with AES-wire-format value', () => {
    const fx = loadFixture('vault-entry-plain-agent.json');
    const leaky = {
      ...fx,
      value: 'aaaaaaaaaaaaaaaaaaaaaaaa:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb:deadbeef',
      isSecret: true,
    };
    const result = VaultEntryPlainSchema.safeParse(leaky);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message).join(' | ');
      expect(messages).toContain('decrypt was not performed');
    }
  });

  it('allows isSecret=false with AES-wire-format-shaped value (non-secret)', () => {
    const fx = loadFixture('vault-entry-plain-platform.json');
    const allowed = {
      ...fx,
      value: 'aaaaaaaaaaaaaaaaaaaaaaaa:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb:deadbeef',
      isSecret: false,
    };
    const result = VaultEntryPlainSchema.safeParse(allowed);
    expect(result.success).toBe(true);
  });
});

describe('VaultEntryEncryptedSchema', () => {
  it('parses encrypted-agent fixture', () => {
    const fx = loadFixture('vault-entry-encrypted-agent.json');
    const parsed = VaultEntryEncryptedSchema.parse(fx);
    expect(parsed.isSecret).toBe(true);
    expect(parsed.tier).toBe('agent');
  });

  it('parses encrypted-owner fixture', () => {
    const fx = loadFixture('vault-entry-encrypted-owner.json');
    const parsed = VaultEntryEncryptedSchema.parse(fx);
    expect(parsed.isSecret).toBe(true);
    expect(parsed.tier).toBe('owner');
  });

  it('rejects plaintext value (no colons)', () => {
    const fx = loadFixture('vault-entry-encrypted-agent.json');
    const bad = { ...fx, value: 'plain-text-no-colons' };
    expect(VaultEntryEncryptedSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects isSecret=false (literal true enforced)', () => {
    const fx = loadFixture('vault-entry-encrypted-agent.json');
    const bad = { ...fx, isSecret: false };
    expect(VaultEntryEncryptedSchema.safeParse(bad).success).toBe(false);
  });
});
