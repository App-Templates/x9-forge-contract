import { describe, it, expect } from 'vitest';
import {
  CapEnvSchemaResponseSchema,
  capEnvSchemaContract,
} from '../../../src/http/endpoints/cap-env-schema.js';

// Real fixture derived from cap-calendar app.ts:9-16
const validFixture = {
  required: [
    {
      key: 'GOOGLE_CALENDAR_CLIENT_ID',
      description: 'OAuth2 client ID',
      secret: false,
      required: true,
    },
  ],
  optional: [
    {
      key: 'GOOGLE_CALENDAR_TZ',
      description: 'Override timezone',
      secret: false,
      required: false,
      default: 'Europe/Rome',
    },
  ],
};

describe('CapEnvSchemaResponseSchema', () => {
  it('parses a valid env-schema fixture', () => {
    const result = CapEnvSchemaResponseSchema.parse(validFixture);
    expect(result.required).toHaveLength(1);
    expect(result.optional).toHaveLength(1);
    expect(result.required[0]?.key).toBe('GOOGLE_CALENDAR_CLIENT_ID');
  });

  it('parses an empty env-schema', () => {
    const result = CapEnvSchemaResponseSchema.parse({ required: [], optional: [] });
    expect(result.required).toEqual([]);
  });

  it('rejects a schema missing required array', () => {
    expect(() => CapEnvSchemaResponseSchema.parse({ optional: [] })).toThrow();
  });
});

describe('capEnvSchemaContract', () => {
  it('declares GET /env-schema with NO auth', () => {
    expect(capEnvSchemaContract.method).toBe('GET');
    // Wire path — capability identity is conveyed by baseUrl (not a path prefix).
    expect(capEnvSchemaContract.path).toBe('/env-schema');
    expect(capEnvSchemaContract.authType).toBe('none');
  });
});
