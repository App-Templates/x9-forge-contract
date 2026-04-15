import { describe, it, expect } from 'vitest';
import {
  CapManifestResponseSchema,
  capManifestContract,
} from '../../../src/http/endpoints/cap-manifest.js';

// Real fixture from cap-calendar manifest (agent-x9 services/cap-calendar/src/manifest.ts)
const validFixture = {
  name: 'calendar',
  version: '0.0.1',
  endpoint: 'http://cap-calendar:3200',
  tools: [
    {
      name: 'calendar_today',
      description: 'Get today events',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
};

describe('CapManifestResponseSchema (re-exported from capability)', () => {
  it('parses a valid cap-calendar manifest fixture', () => {
    const result = CapManifestResponseSchema.parse(validFixture);
    expect(result.name).toBe('calendar');
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0]?.name).toBe('calendar_today');
  });

  it('parses a manifest with optional serviceName (Forge discovery)', () => {
    const result = CapManifestResponseSchema.parse({
      ...validFixture,
      serviceName: 'cap-calendar',
    });
    expect(result.serviceName).toBe('cap-calendar');
  });

  it('rejects a manifest missing tools array', () => {
    const { tools: _omit, ...noTools } = validFixture;
    void _omit;
    expect(() => CapManifestResponseSchema.parse(noTools)).toThrow();
  });
});

describe('capManifestContract', () => {
  it('declares GET /manifest with NO auth (public discovery)', () => {
    expect(capManifestContract.method).toBe('GET');
    // Wire path — capability identity is conveyed by baseUrl (not a path prefix).
    expect(capManifestContract.path).toBe('/manifest');
    expect(capManifestContract.authType).toBe('none');
  });
});
