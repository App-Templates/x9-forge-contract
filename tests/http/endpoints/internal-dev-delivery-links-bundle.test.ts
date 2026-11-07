import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  DEV_DELIVERY_LINKS_MAX_PATHS,
  DevDeliveryLinksRequestSchema,
  DevDeliveryLinksResponseSchema,
} from '../../../src/http/endpoints/internal-dev-delivery-links.js';

const request = {
  scope: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' },
  deliveryRef: {
    assetId: 'asset-design-058',
    sha256: 'a'.repeat(64),
    name: 'consegna.json',
    mediaType: 'application/json',
    sizeBytes: 1024,
    origin: {
      kind: 'session',
      sessionId: 'session-design-058',
      repo: 'acme/design',
      commit: 'b'.repeat(40),
      path: 'consegna/consegna.json',
    },
    tenantId: 'tenant-1',
    companyId: 'company-1',
    projectId: 'project-058',
    createdAt: '2026-11-06T09:00:00+01:00',
  },
  paths: ['consegna/overview.png'],
};
const bundle = {
  fileName: 'schermate.zip',
  paths: Array.from({ length: 8 }, (_, index) => `consegna/schermata-${index + 1}.png`),
};
const link = {
  path: request.paths[0],
  url: 'https://dev.example.com/consegne/overview',
  expiresAt: '2026-12-06T09:00:00+01:00',
  mediaType: 'image/png',
  sha256: 'c'.repeat(64),
  sizeBytes: 2048,
};
const bundleLink = {
  ...link,
  path: bundle.fileName,
  url: 'https://dev.example.com/consegne/schermate',
  mediaType: 'application/zip',
  sizeBytes: 16384,
};
const built = createRequire(import.meta.url)('../../../dist/http/endpoints/index.cjs') as Pick<
  typeof import('../../../src/http/endpoints/index.js'),
  'DevDeliveryLinksRequestSchema' | 'DevDeliveryLinksResponseSchema'
>;

describe.each([
  { name: 'source', requestSchema: DevDeliveryLinksRequestSchema, responseSchema: DevDeliveryLinksResponseSchema },
  { name: 'built CommonJS', requestSchema: built.DevDeliveryLinksRequestSchema, responseSchema: built.DevDeliveryLinksResponseSchema },
])('delivery links bundle ($name)', ({ requestSchema, responseSchema }) => {
  it('accepts eight PNGs in one ZIP request without changing the input', () => {
    const input = { ...request, bundle };
    expect(requestSchema.parse(input)).toStrictEqual(input);
  });

  it.each([
    'schermate', 'schermate.png', 'cartella/schermate.zip', 'Schermate.zip',
    'schermate.ZIP', '-schermate.zip', 'schermate_extra.zip', `${'a'.repeat(61)}.zip`,
  ])('rejects invalid bundle fileName %s', (fileName) => {
    const result = requestSchema.safeParse({ ...request, bundle: { ...bundle, fileName } });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path)).toContainEqual(['bundle', 'fileName']);
  });

  it.each(['a.zip', '0-schermate.zip', `${'a'.repeat(60)}.zip`])('accepts bundle fileName %s', (fileName) => {
    const input = { ...request, bundle: { ...bundle, fileName } };
    expect(requestSchema.parse(input)).toStrictEqual(input);
  });

  it('rejects repeated bundle paths with the distinct-path issue at bundle.paths', () => {
    const result = requestSchema.safeParse({
      ...request, bundle: { ...bundle, paths: [bundle.paths[0], bundle.paths[0]] },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toStrictEqual([
      { code: 'custom', path: ['bundle', 'paths'], message: 'Paths must be distinct' },
    ]);
  });

  it('accepts one through twelve bundle paths and rejects zero or thirteen', () => {
    for (const length of [1, DEV_DELIVERY_LINKS_MAX_PATHS]) {
      const input = { ...request, bundle: { ...bundle, paths: Array.from({ length }, (_, i) => `consegna/${i}.png`) } };
      expect(requestSchema.parse(input)).toStrictEqual(input);
    }
    for (const length of [0, DEV_DELIVERY_LINKS_MAX_PATHS + 1]) {
      const result = requestSchema.safeParse({
        ...request, bundle: { ...bundle, paths: Array.from({ length }, (_, i) => `consegna/${i}.png`) },
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues.map((issue) => issue.path)).toContainEqual(['bundle', 'paths']);
    }
  });

  it.each(['/screen.png', 'consegna/../screen.png', 'consegna\\screen.png', 'consegna/my screen.png'])('rejects unsafe bundle path %s', (path) => {
    const result = requestSchema.safeParse({ ...request, bundle: { ...bundle, paths: [path] } });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path)).toContainEqual(['bundle', 'paths', 0]);
  });

  it('keeps top-level paths required even with a bundle', () => {
    const { paths: _paths, ...withoutPaths } = request;
    expect(requestSchema.safeParse({ ...withoutPaths, bundle }).success).toBe(false);
    expect(requestSchema.safeParse({ ...request, paths: [], bundle }).success).toBe(false);
  });

  it('rejects undeclared bundle fields', () => {
    expect(requestSchema.safeParse({ ...request, bundle: { ...bundle, extra: true } }).success).toBe(false);
  });

  it('preserves existing requests and responses without a bundle', () => {
    expect(requestSchema.parse(request)).toStrictEqual(request);
    expect(responseSchema.parse({ links: [link] })).toStrictEqual({ links: [link] });
  });

  it('accepts a ZIP response link whose path is the requested fileName', () => {
    const response = { links: [link], bundle: bundleLink };
    expect(responseSchema.parse(response)).toStrictEqual(response);
  });

  it('rejects a bundle response with a different media type', () => {
    const result = responseSchema.safeParse({ links: [link], bundle: { ...bundleLink, mediaType: 'image/png' } });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path)).toContainEqual(['bundle', 'mediaType']);
  });

  it.each(['consegna/schermate.zip', 'Schermate.zip', 'schermate.png'])('rejects bundle response path %s that is not a ZIP fileName', (path) => {
    const result = responseSchema.safeParse({ links: [link], bundle: { ...bundleLink, path } });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path)).toContainEqual(['bundle', 'path']);
  });

  it('retains signed-link validation for the bundle response', () => {
    for (const invalid of [
      { url: 'http://dev.example.com/consegne/schermate' },
      { expiresAt: 'tomorrow' }, { sha256: 'invalid' }, { sizeBytes: -1 }, { extra: true },
    ]) {
      expect(responseSchema.safeParse({ links: [link], bundle: { ...bundleLink, ...invalid } }).success).toBe(false);
    }
  });
});
