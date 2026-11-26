import { describe, expect, it } from 'vitest';
import { VideoModelProductionQuerySchema } from '../../../src/capability/video/produzione-modella.js';

// SUMMARY: Gate mutation: remove environmentId.optional(); the request as sent today must fail.
// Acceptance, type checking and mutation execution belong to the gate.
const AS_TODAY = {
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  agentId: 'agent-1',
  videoProjectId: 'proj-1',
  modelId: 'anna',
  modelVersion: '1',
  purpose: 'Presentazione del prodotto',
  name: 'Anna al lavoro',
  durationSeconds: '30',
  budgetUsd: '5',
  fileName: 'look.png',
};

describe('VideoModelProductionQuerySchema, ambiente facoltativo', () => {
  it('accepts the request as sent today, without environment', () => {
    const parsed = VideoModelProductionQuerySchema.parse(AS_TODAY);
    expect(parsed).toEqual(AS_TODAY);
    expect(parsed).not.toHaveProperty('environmentId');
  });

  it('accepts an approved environment with its version', () => {
    const parsed = VideoModelProductionQuerySchema.parse({ ...AS_TODAY, environmentId: 'studio-podcast', environmentVersion: '2' });
    expect(parsed.environmentId).toBe('studio-podcast');
    expect(parsed.environmentVersion).toBe('2');
  });

  it.each([
    { environmentId: 'studio-podcast' },
    { environmentVersion: '2' },
  ])('keeps each environment field independently optional: %j', (extra) => {
    const query = { ...AS_TODAY, ...extra };
    expect(VideoModelProductionQuerySchema.parse(query)).toEqual(query);
  });

  it.each([
    ['uppercase id', { environmentId: 'Studio' }],
    ['49 character id', { environmentId: `a${'b'.repeat(48)}` }],
    ['version 0', { environmentId: 'studio', environmentVersion: '0' }],
    ['version 051', { environmentId: 'studio', environmentVersion: '051' }],
    ['version abc', { environmentId: 'studio', environmentVersion: 'abc' }],
  ])('rejects %s', (_label, extra) => {
    expect(VideoModelProductionQuerySchema.safeParse({ ...AS_TODAY, ...extra }).success).toBe(false);
  });

  it('rejects an unknown field', () => {
    expect(VideoModelProductionQuerySchema.safeParse({ ...AS_TODAY, environment: 'studio' }).success).toBe(false);
  });

  it('keeps omit() usable', () => {
    expect(() => VideoModelProductionQuerySchema.omit({ tenantId: true })).not.toThrow();
  });
});
