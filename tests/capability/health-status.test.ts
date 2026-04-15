import { describe, it, expect } from 'vitest';
import { HealthStatusSchema, type HealthStatus } from '../../src/capability/index';

const HEALTHY: HealthStatus = {
  status: 'healthy',
  service: 'cap-calendar',
  version: '1.0.0',
  uptime: 3600,
  timestamp: '2026-04-15T00:00:00.000Z',
};

describe('HealthStatusSchema', () => {
  it('parses healthy status without checks', () => {
    const result = HealthStatusSchema.safeParse(HEALTHY);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.checks).toBeUndefined();
  });

  it('parses degraded status with subsystem checks', () => {
    const degraded: HealthStatus = {
      ...HEALTHY,
      status: 'degraded',
      service: 'cap-email',
      checks: { smtp: 'error', db: 'ok' },
    };
    const result = HealthStatusSchema.safeParse(degraded);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('degraded');
      expect(result.data.checks?.smtp).toBe('error');
    }
  });

  it('parses down status', () => {
    const result = HealthStatusSchema.safeParse({ ...HEALTHY, status: 'down' });
    expect(result.success).toBe(true);
  });

  it('rejects unknown status value (fail-loud)', () => {
    expect(HealthStatusSchema.safeParse({ ...HEALTHY, status: 'starting' }).success).toBe(false);
  });

  it('rejects negative uptime (fail-loud)', () => {
    expect(HealthStatusSchema.safeParse({ ...HEALTHY, uptime: -1 }).success).toBe(false);
  });

  it('rejects invalid check value (fail-loud — only ok|error allowed)', () => {
    const invalid = { ...HEALTHY, checks: { db: 'warning' } };
    expect(HealthStatusSchema.safeParse(invalid).success).toBe(false);
  });
});
