import { describe, expect, it } from 'vitest';
import {
  DEV_DELIVERY_LINKS_MAX_PATHS,
  DEV_DELIVERY_LINK_TTL_MS,
  DevDeliveryLinksRequestSchema,
  DevDeliveryLinksResponseSchema,
  devDeliveryLinksContract,
} from '../../src/http/endpoints/internal-dev-delivery-links.js';
import { readDevSessionAssetContract } from '../../src/http/endpoints/internal-dev-session-asset-content.js';
import {
  devDeliveryLinksContract as exportedContract,
  DevDeliveryLinksRequestSchema as exportedRequest,
} from '../../src/http/index.js';

const deliveryRef = {
  assetId: 'asset-123',
  sha256: 'a'.repeat(64),
  name: 'consegna.zip',
  mediaType: 'application/zip',
  sizeBytes: 1024,
  origin: {
    kind: 'session',
    sessionId: 'session-123',
    repo: 'acme/sito',
    commit: 'b'.repeat(40),
    path: 'dist/index.html',
  },
  tenantId: 'tenant-1',
  companyId: 'company-1',
  projectId: 'project-1',
  createdAt: '2026-10-22T10:00:00+02:00',
};
const request = {
  scope: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' },
  deliveryRef,
  paths: ['dist/index.html', 'dist/app.css'],
};
const link = {
  path: 'dist/index.html',
  url: 'https://dev.example.com/dev/consegne/abc',
  expiresAt: '2026-12-04T10:00:00+01:00',
  mediaType: 'text/html',
  sha256: 'c'.repeat(64),
  sizeBytes: 10,
};

describe('internal dev delivery links', () => {
  it('accepts a valid request and exposes constants and contract', () => {
    expect(DevDeliveryLinksRequestSchema.parse(request)).toEqual(request);
    expect(DEV_DELIVERY_LINKS_MAX_PATHS).toBe(12);
    expect(DEV_DELIVERY_LINK_TTL_MS).toBe(2592000000);
    expect(devDeliveryLinksContract.method).toBe('POST');
    expect(devDeliveryLinksContract.authType).toBe('secret');
    expect(devDeliveryLinksContract.paramsSchema).toBe(readDevSessionAssetContract.paramsSchema);
    expect(devDeliveryLinksContract.path).toBe('/internal/capability/agents/:agentId/dev/sessions/:sessionId/delivery-links');
  });

  it('rejects an email origin', () => {
    const origin = { kind: 'email', messageId: 'm-1' };
    expect(DevDeliveryLinksRequestSchema.safeParse({ ...request, deliveryRef: { ...deliveryRef, origin } }).success).toBe(false);
  });

  it('rejects a session origin without commit', () => {
    const { commit: _commit, ...origin } = deliveryRef.origin;
    expect(DevDeliveryLinksRequestSchema.safeParse({ ...request, deliveryRef: { ...deliveryRef, origin } }).success).toBe(false);
  });

  it('rejects a session origin with only the session', () => {
    const origin = { kind: 'session', sessionId: 'session-123' };
    expect(DevDeliveryLinksRequestSchema.safeParse({ ...request, deliveryRef: { ...deliveryRef, origin } }).success).toBe(false);
  });

  it('accepts 12 paths and rejects 13 or none', () => {
    const paths = (n: number) => Array.from({ length: n }, (_, i) => `dist/f${i}.txt`);
    expect(DevDeliveryLinksRequestSchema.safeParse({ ...request, paths: paths(12) }).success).toBe(true);
    expect(DevDeliveryLinksRequestSchema.safeParse({ ...request, paths: paths(13) }).success).toBe(false);
    expect(DevDeliveryLinksRequestSchema.safeParse({ ...request, paths: [] }).success).toBe(false);
  });

  it('rejects unsafe paths', () => {
    expect(DevDeliveryLinksRequestSchema.safeParse({ ...request, paths: ['dist/../secret'] }).success).toBe(false);
    expect(DevDeliveryLinksRequestSchema.safeParse({ ...request, paths: ['/abs/file'] }).success).toBe(false);
  });

  it('rejects a path with a space', () => {
    expect(DevDeliveryLinksRequestSchema.safeParse({ ...request, paths: ['dist/my file.html'] }).success).toBe(false);
  });

  it('rejects duplicate paths', () => {
    expect(DevDeliveryLinksRequestSchema.safeParse({ ...request, paths: ['dist/a.html', 'dist/a.html'] }).success).toBe(false);
  });

  it('validates the response', () => {
    expect(DevDeliveryLinksResponseSchema.parse({ links: [link] })).toEqual({ links: [link] });
    expect(DevDeliveryLinksResponseSchema.safeParse({ links: [{ ...link, url: 'http://dev.example.com/x' }] }).success).toBe(false);
    expect(DevDeliveryLinksResponseSchema.safeParse({ links: [link, link] }).success).toBe(false);
    expect(DevDeliveryLinksResponseSchema.safeParse({ links: [{ ...link, expiresAt: 'tomorrow' }] }).success).toBe(false);
    const many = Array.from({ length: 13 }, (_, i) => ({ ...link, path: `dist/f${i}.txt` }));
    expect(DevDeliveryLinksResponseSchema.safeParse({ links: many }).success).toBe(false);
  });

  it('is exported from the http index', () => {
    expect(exportedContract).toBe(devDeliveryLinksContract);
    expect(exportedRequest).toBe(DevDeliveryLinksRequestSchema);
  });
});
