import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  COLLOQUIO_LINK_CODE_PATTERN,
  COLLOQUIO_LINK_REFUSALS,
  COLLOQUIO_LINK_TTL_MS,
  COLLOQUIO_TOPIC_EXCERPT_MAX,
  COLLOQUIO_TOPIC_SUBJECT_MAX,
  ColloquioLinkRefusalSchema,
  ColloquioLinkRequestSchema,
  ColloquioLinkResponseSchema,
  colloquioLinkContract,
} from '../../src/http/endpoints/internal-colloquio-links.js';
import { DEV_DELIVERY_LINK_TTL_MS, devDeliveryLinksContract } from '../../src/http/endpoints/internal-dev-delivery-links.js';
import { CapabilityCallContextErrorCodeSchema } from '../../src/capability/capability-call-context.js';
import {
  colloquioLinkContract as exportedContract,
  ColloquioLinkRequestSchema as exportedRequest,
} from '../../src/http/index.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const base = {
  scope,
  recipient: 'referente@example.com',
  email: { threadKey: 'thread-1' },
  topic: { subject: 'Piano del progetto' },
};
const response = {
  url: 'https://colloquio.example.com/c/abcDEF12345',
  code: 'abcDEF12345',
  expiresAt: '2026-12-24T10:00:00+01:00',
};

describe('s8610 request', () => {
  it('accepts threadKey only, messageId only and both', () => {
    expect(ColloquioLinkRequestSchema.parse(base).email).toEqual({ threadKey: 'thread-1' });
    expect(ColloquioLinkRequestSchema.parse({ ...base, email: { messageId: '<m@example.com>' } }).email).toEqual({ messageId: '<m@example.com>' });
    expect(ColloquioLinkRequestSchema.parse({ ...base, email: { threadKey: 't', messageId: 'm' } }).email).toEqual({ threadKey: 't', messageId: 'm' });
  });
  it('accepts projectId and excerpt, with and without', () => {
    const full = ColloquioLinkRequestSchema.parse({
      ...base, projectId: 'progetto-uno', topic: { subject: ' Oggetto ', excerpt: 'x'.repeat(COLLOQUIO_TOPIC_EXCERPT_MAX) },
    });
    expect(full.projectId).toBe('progetto-uno');
    expect(full.topic.subject).toBe('Oggetto');
    expect(full.topic.excerpt).toHaveLength(500);
    expect(ColloquioLinkRequestSchema.parse(base).projectId).toBeUndefined();
  });
  it('returns the recipient lowercased', () => {
    expect(ColloquioLinkRequestSchema.parse({ ...base, recipient: 'Referente@Example.COM' }).recipient).toBe('referente@example.com');
  });
  it('rejects emails without references, blank or oversized references', () => {
    for (const email of [{}, { threadKey: '' }, { threadKey: '   ' }, { messageId: 'm'.repeat(999) }]) {
      expect(ColloquioLinkRequestSchema.safeParse({ ...base, email }).success).toBe(false);
    }
    expect(ColloquioLinkRequestSchema.safeParse({ ...base, email: { threadKey: 'm'.repeat(998) } }).success).toBe(true);
  });
  it('rejects bad topics', () => {
    for (const topic of [
      { subject: '' },
      { subject: 'x'.repeat(COLLOQUIO_TOPIC_SUBJECT_MAX + 1) },
      { subject: 'ok', excerpt: 'x'.repeat(COLLOQUIO_TOPIC_EXCERPT_MAX + 1) },
    ]) {
      expect(ColloquioLinkRequestSchema.safeParse({ ...base, topic }).success).toBe(false);
    }
  });
  it('rejects bad recipient, projectId, extra fields and incomplete scope', () => {
    expect(ColloquioLinkRequestSchema.safeParse({ ...base, recipient: 'not-an-email' }).success).toBe(false);
    expect(ColloquioLinkRequestSchema.safeParse({ ...base, projectId: 'Bad Project' }).success).toBe(false);
    expect(ColloquioLinkRequestSchema.safeParse({ ...base, extra: 1 }).success).toBe(false);
    expect(ColloquioLinkRequestSchema.safeParse({ ...base, email: { threadKey: 't', extra: 1 } }).success).toBe(false);
    expect(ColloquioLinkRequestSchema.safeParse({ ...base, topic: { subject: 's', extra: 1 } }).success).toBe(false);
    expect(ColloquioLinkRequestSchema.safeParse({ ...base, scope: { ...scope, extra: 1 } }).success).toBe(false);
    expect(ColloquioLinkRequestSchema.safeParse({ ...base, scope: { ownerId: 'o', agentId: 'a' } }).success).toBe(false);
  });
});

describe('s8610 response', () => {
  it('accepts an https url with an 11 character code and an offset expiry', () => {
    expect(ColloquioLinkResponseSchema.parse(response)).toEqual(response);
  });
  it('rejects http, wrong code lengths, dashes, missing offset and extra fields', () => {
    for (const bad of [
      { ...response, url: 'http://colloquio.example.com/c/abc' },
      { ...response, code: 'abcDEF1234' },
      { ...response, code: 'abcDEF123456' },
      { ...response, code: 'abcDEF-1234' },
      { ...response, expiresAt: '2026-12-24T10:00:00' },
      { ...response, extra: true },
    ]) {
      expect(ColloquioLinkResponseSchema.safeParse(bad).success).toBe(false);
    }
    expect(COLLOQUIO_LINK_CODE_PATTERN.test('abcDEF12345')).toBe(true);
  });
});

describe('s8610 refusal', () => {
  it('lists exactly the four codes in order', () => {
    expect([...COLLOQUIO_LINK_REFUSALS]).toEqual(['capability_disabled', 'identity_mismatch', 'recipient_not_referente', 'unavailable']);
    for (const error of COLLOQUIO_LINK_REFUSALS) expect(ColloquioLinkRefusalSchema.parse({ error })).toEqual({ error });
  });
  it('rejects unknown codes and extra fields', () => {
    expect(ColloquioLinkRefusalSchema.safeParse({ error: 'nope' }).success).toBe(false);
    expect(ColloquioLinkRefusalSchema.safeParse({ error: 'unavailable', extra: 1 }).success).toBe(false);
  });
  it('shares two literals with the capability call context codes', () => {
    const shared = CapabilityCallContextErrorCodeSchema.options as readonly string[];
    expect(shared).toContain('capability_disabled');
    expect(shared).toContain('identity_mismatch');
  });
});

describe('s8610 contract', () => {
  it('declares method, path and auth', () => {
    expect(colloquioLinkContract.method).toBe('POST');
    expect(colloquioLinkContract.path).toBe('/internal/capability/agents/:agentId/colloquio/links');
    expect(colloquioLinkContract.authType).toBe('secret');
    expect(colloquioLinkContract.paramsSchema.safeParse({ agentId: '' }).success).toBe(false);
    expect(colloquioLinkContract.paramsSchema.parse({ agentId: 'agent-1' })).toEqual({ agentId: 'agent-1' });
    expect(colloquioLinkContract.bodySchema).toBe(ColloquioLinkRequestSchema);
    expect(colloquioLinkContract.responseSchema).toBe(ColloquioLinkResponseSchema);
    expect(colloquioLinkContract.refusalSchema).toBe(ColloquioLinkRefusalSchema);
  });
  it('is exported from the http index identically', () => {
    expect(exportedContract).toBe(colloquioLinkContract);
    expect(exportedRequest).toBe(ColloquioLinkRequestSchema);
  });
  it('keeps the link ttl of the delivery links and their path', () => {
    expect(COLLOQUIO_LINK_TTL_MS).toBe(DEV_DELIVERY_LINK_TTL_MS);
    expect(devDeliveryLinksContract.path).toBe('/internal/capability/agents/:agentId/dev/sessions/:sessionId/delivery-links');
  });
  it('is released as 1.319.0', () => {
    const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string };
    expect(pkg.version).toBe('1.319.0');
  });
});
