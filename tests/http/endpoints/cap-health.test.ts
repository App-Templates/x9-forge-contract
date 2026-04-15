import { describe, it, expect } from 'vitest';
import {
  CapHealthResponseSchema,
  capHealthContract,
} from '../../../src/http/endpoints/cap-health.js';

// Real fixture from capability-sdk health.ts:26-44
const validFixture = {
  status: 'healthy' as const,
  service: 'cap-calendar',
  version: '0.0.1',
  uptime: 3600,
  timestamp: '2026-04-15T12:00:00.000Z',
  checks: { google_calendar: 'ok' as const },
};

describe('CapHealthResponseSchema', () => {
  it('parses a healthy health-status fixture', () => {
    const result = CapHealthResponseSchema.parse(validFixture);
    expect(result.status).toBe('healthy');
    expect(result.service).toBe('cap-calendar');
    expect(result.checks?.google_calendar).toBe('ok');
  });

  it('parses a degraded status without checks', () => {
    const result = CapHealthResponseSchema.parse({
      ...validFixture,
      status: 'degraded',
      checks: undefined,
    });
    expect(result.status).toBe('degraded');
  });

  it('rejects an invalid status value', () => {
    expect(() =>
      CapHealthResponseSchema.parse({ ...validFixture, status: 'weird' }),
    ).toThrow();
  });

  it('rejects a negative uptime', () => {
    expect(() =>
      CapHealthResponseSchema.parse({ ...validFixture, uptime: -1 }),
    ).toThrow();
  });
});

describe('capHealthContract', () => {
  it('declares GET /:cap/health with NO auth', () => {
    expect(capHealthContract.method).toBe('GET');
    expect(capHealthContract.path).toBe('/:cap/health');
    expect(capHealthContract.authType).toBe('none');
  });
});
