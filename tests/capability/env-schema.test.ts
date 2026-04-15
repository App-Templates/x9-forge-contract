import { describe, it, expect } from 'vitest';
import { EnvSchemaFieldSchema, EnvSchemaDocSchema, type EnvSchemaDoc } from '../../src/capability/index';

// Real fixture shape from a capability service env-schema response
const VALID_DOC: EnvSchemaDoc = {
  required: [
    { key: 'OPENAI_API_KEY', description: 'OpenAI API key for LLM calls', secret: true, required: true },
    { key: 'TELEGRAM_BOT_TOKEN', description: 'Telegram bot token', secret: true, required: true },
  ],
  optional: [
    { key: 'LOG_LEVEL', description: 'Log verbosity', secret: false, required: false, default: 'info' },
  ],
};

describe('EnvSchemaFieldSchema', () => {
  it('parses a required secret field', () => {
    const result = EnvSchemaFieldSchema.safeParse({
      key: 'API_KEY',
      description: 'API key',
      secret: true,
      required: true,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.default).toBeUndefined();
  });

  it('parses an optional field with default value', () => {
    const result = EnvSchemaFieldSchema.safeParse({
      key: 'LOG_LEVEL',
      description: 'Log level',
      secret: false,
      required: false,
      default: 'info',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.default).toBe('info');
  });

  it('rejects field with empty key (fail-loud)', () => {
    expect(EnvSchemaFieldSchema.safeParse({ key: '', description: 'x', secret: false, required: true }).success).toBe(false);
  });
});

describe('EnvSchemaDocSchema', () => {
  it('parses real env-schema fixture', () => {
    const result = EnvSchemaDocSchema.safeParse(VALID_DOC);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.required).toHaveLength(2);
      expect(result.data.optional).toHaveLength(1);
    }
  });

  it('parses empty doc (capability with no env vars)', () => {
    const result = EnvSchemaDocSchema.safeParse({ required: [], optional: [] });
    expect(result.success).toBe(true);
  });

  it('rejects doc missing optional array (fail-loud)', () => {
    expect(EnvSchemaDocSchema.safeParse({ required: [] }).success).toBe(false);
  });
});
