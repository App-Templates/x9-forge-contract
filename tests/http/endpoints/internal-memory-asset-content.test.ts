import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  INTERNAL_MEMORY_ASSET_CONTENT_PATH,
  InternalMemoryAssetContentRequestSchema,
  InternalMemoryAssetContentResponseSchema,
  internalMemoryAssetContentContract,
  type InternalMemoryAssetContentRequest,
  type InternalMemoryAssetContentResponse,
} from '../../../src/http/index.js';
import {
  INTERNAL_MEMORY_ASSET_CONTENT_PATH as endpointPath,
  INTERNAL_MEMORY_ASSETS_PATH,
  INTERNAL_MEMORY_ASSETS_LIST_PATH,
  InternalMemoryAssetContentRequestSchema as endpointRequestSchema,
  InternalMemoryAssetContentResponseSchema as endpointResponseSchema,
  internalMemoryAssetContentContract as endpointContract,
  InternalMemoryAssetIngestRequestSchema,
  DevSessionAssetReadSchema,
  readDevSessionAssetContract,
  type InternalMemoryAssetContentRequest as EndpointContentRequest,
  type InternalMemoryAssetContentResponse as EndpointContentResponse,
} from '../../../src/http/endpoints/index.js';
import { AssetRefSchema, OrganizationRunContextSchema } from '../../../src/organization/index.js';

// Synthetic contract fixtures. Authentication, storage and full-file verification belong to the services.
const context = {
  schemaVersion: 1,
  runId: 'run-367',
  organizationId: 'org-1',
  ownerId: 'owner-1',
  identity: { managementAgentId: 'director', runtimeAgentId: 'director' },
  issuer: 'x9',
  issuedAt: '2026-10-29T07:00:00.000Z',
  expiresAt: '2026-10-29T09:00:00.000Z',
};
const content = Buffer.from('abcdefghijkl');
const asset = {
  assetId: 'asset_000367',
  sha256: createHash('sha256').update(content).digest('hex'),
  name: 'delivery.txt',
  mediaType: 'text/plain',
  sizeBytes: content.length,
  origin: { kind: 'generated', agentId: 'data-lead', sourceAssetIds: ['asset_source'] },
  tenantId: 'tenant-1',
  companyId: 'company-1',
  projectId: 'project-1',
  buSlug: 'data',
  createdAt: '2026-10-29T07:30:00.000Z',
};
const request = { context, asset, offset: 0, length: 4 };
const response = {
  assetId: asset.assetId,
  sha256: asset.sha256,
  sizeBytes: asset.sizeBytes,
  offset: 0,
  contentBase64: content.subarray(0, 4).toString('base64'),
  eof: false,
};
const otherOrigins = [
  { kind: 'email', messageId: 'message-1', attachmentName: asset.name },
  { kind: 'archive', archiveSha256: 'b'.repeat(64), entryPath: 'docs/delivery.txt' },
  { kind: 'session', sessionId: 'session-1' },
  { kind: 'link', url: 'https://example.com/delivery' },
];

describe('generated memory asset content contract', () => {
  it('exports identical paths, schemas and secret-authenticated POST metadata from both public barrels', () => {
    expect(INTERNAL_MEMORY_ASSET_CONTENT_PATH).toBe('/internal/memory/assets/content');
    expect(endpointPath).toBe(INTERNAL_MEMORY_ASSET_CONTENT_PATH);
    expect(endpointRequestSchema).toBe(InternalMemoryAssetContentRequestSchema);
    expect(endpointResponseSchema).toBe(InternalMemoryAssetContentResponseSchema);
    expect(endpointContract).toBe(internalMemoryAssetContentContract);
    expect(internalMemoryAssetContentContract).toEqual({
      method: 'POST', path: INTERNAL_MEMORY_ASSET_CONTENT_PATH, authType: 'secret',
      bodySchema: InternalMemoryAssetContentRequestSchema,
      responseSchema: InternalMemoryAssetContentResponseSchema,
    });
    expect(InternalMemoryAssetContentRequestSchema.shape.context).toBe(OrganizationRunContextSchema);
    expect(InternalMemoryAssetContentRequestSchema.shape.asset).toBe(AssetRefSchema);
    expect(InternalMemoryAssetContentResponseSchema.shape.assetId).toBe(AssetRefSchema.shape.assetId);
    expect(InternalMemoryAssetContentResponseSchema.shape.sha256).toBe(AssetRefSchema.shape.sha256);
    expect(InternalMemoryAssetContentResponseSchema.shape.sizeBytes).toBe(AssetRefSchema.shape.sizeBytes);
    const parsedRequest: InternalMemoryAssetContentRequest = InternalMemoryAssetContentRequestSchema.parse(request);
    const endpointRequest: EndpointContentRequest = parsedRequest;
    const parsedResponse: InternalMemoryAssetContentResponse = InternalMemoryAssetContentResponseSchema.parse(response);
    const endpointResponse: EndpointContentResponse = parsedResponse;
    expect(endpointRequest).toStrictEqual(request);
    expect(endpointResponse).toStrictEqual(response);
  });

  it('generated asset content request accepts only generated assets', () => {
    expect(InternalMemoryAssetContentRequestSchema.parse(request)).toStrictEqual(request);
    for (const origin of otherOrigins) {
      const otherAsset = { ...asset, origin };
      expect(AssetRefSchema.safeParse(otherAsset).success).toBe(true);
      const result = InternalMemoryAssetContentRequestSchema.safeParse({ ...request, asset: otherAsset });
      expect(result.success).toBe(false);
      expect(result.error?.issues).toContainEqual({
        code: 'custom', path: ['asset', 'origin'], message: 'Asset must have a generated origin',
      });
    }
  });

  it('accepts a generated asset without optional provenance or BU fields', () => {
    const { buSlug: _buSlug, ...withoutBu } = asset;
    const input = { ...request, asset: { ...withoutBu, origin: { kind: 'generated', agentId: 'data-lead' } } };
    expect(InternalMemoryAssetContentRequestSchema.parse(input)).toStrictEqual(input);
  });

  it.each([1, 262144])('accepts the inclusive request length boundary %i', (length) => {
    const input = { ...request, length };
    expect(InternalMemoryAssetContentRequestSchema.parse(input)).toStrictEqual(input);
  });

  it('accepts the final readable offset even when the requested length extends beyond the file', () => {
    const input = { ...request, offset: asset.sizeBytes - 1, length: 262144 };
    expect(InternalMemoryAssetContentRequestSchema.parse(input)).toStrictEqual(input);
  });

  it('rejects requests without a signed organization context', () => {
    expect(InternalMemoryAssetContentRequestSchema.safeParse({ asset, offset: 0, length: 4 }).success).toBe(false);
  });

  // The shared context validates timestamp ordering; actual expiry and signature checks belong to the service.
  it.each([context.issuedAt, '2026-10-29T06:00:00.000Z'])(
    'rejects a context expired at or before its issuance: %s', (expiresAt) => {
      expect(InternalMemoryAssetContentRequestSchema.safeParse({
        ...request, context: { ...context, expiresAt },
      }).success).toBe(false);
    },
  );

  it.each(['context', 'asset', 'offset', 'length'] as const)('requires the request field %s', (field) => {
    const input: Record<string, unknown> = { ...request };
    delete input[field];
    expect(InternalMemoryAssetContentRequestSchema.safeParse(input).success).toBe(false);
  });

  it.each(['sha256', 'sizeBytes', 'tenantId', 'companyId', 'projectId'] as const)(
    'requires the complete asset reference field %s', (field) => {
      const incomplete: Record<string, unknown> = { ...asset };
      delete incomplete[field];
      expect(InternalMemoryAssetContentRequestSchema.safeParse({ ...request, asset: incomplete }).success).toBe(false);
    },
  );

  it.each([{ offset: -1 }, { offset: 0.5 }, { length: 0 }, { length: 262145 }, { length: 1.5 }])(
    'rejects invalid integer chunk boundaries %j', (patch) => {
      expect(InternalMemoryAssetContentRequestSchema.safeParse({ ...request, ...patch }).success).toBe(false);
    },
  );

  it.each([asset.sizeBytes, asset.sizeBytes + 1])('rejects an offset at or beyond sizeBytes: %i', (offset) => {
    const result = InternalMemoryAssetContentRequestSchema.safeParse({ ...request, offset });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual({
      code: 'custom', path: ['offset'], message: 'Offset must be less than asset sizeBytes',
    });
  });

  it('rejects a zero-byte generated asset because it has no readable blocks', () => {
    expect(InternalMemoryAssetContentRequestSchema.safeParse({
      ...request, asset: { ...asset, sizeBytes: 0 },
    }).success).toBe(false);
  });

  it('rejects unknown request keys instead of stripping them', () => {
    expect(InternalMemoryAssetContentRequestSchema.safeParse({ ...request, extra: true }).success).toBe(false);
  });

  it.each([
    { context: { ...context, extra: true } },
    { asset: { ...asset, storagePath: 'private/object' } },
    { asset: { ...asset, origin: { ...asset.origin, extra: true } } },
  ])('rejects unknown nested request keys %j', (patch) => {
    expect(InternalMemoryAssetContentRequestSchema.safeParse({ ...request, ...patch }).success).toBe(false);
  });

  it.each([{ offset: 0, eof: false }, { offset: 4, eof: false }, { offset: 8, eof: true }])(
    'accepts first, intermediate and final chunks at offset $offset with eof=$eof', ({ offset, eof }) => {
      const chunk = { ...response, offset, contentBase64: content.subarray(offset, offset + 4).toString('base64'), eof };
      expect(InternalMemoryAssetContentResponseSchema.parse(chunk)).toStrictEqual(chunk);
    },
  );

  it.each([1, 2, 3, 262144])('accepts %i decoded bytes with the corresponding base64 padding', (sizeBytes) => {
    const chunk = { ...response, sizeBytes, contentBase64: Buffer.alloc(sizeBytes, 37).toString('base64'), eof: true };
    expect(InternalMemoryAssetContentResponseSchema.parse(chunk)).toStrictEqual(chunk);
  });

  it.each(['!', 'YQ', 'YQ=', '=YQ=', 'Y===', 'YQ===', 'YQ==AA==', 'Y Q==', 'YQ==\n', '_w==', '-w=='])(
    'rejects malformed or nonstandard base64 %j', (contentBase64) => {
      expect(InternalMemoryAssetContentResponseSchema.safeParse({ ...response, contentBase64 }).success).toBe(false);
    },
  );

  it.each([0, 262145])('rejects a block with %i decoded bytes independently of EOF and file size', (sizeBytes) => {
    expect(InternalMemoryAssetContentResponseSchema.safeParse({
      ...response, sizeBytes, contentBase64: Buffer.alloc(sizeBytes).toString('base64'), eof: true,
    }).success).toBe(false);
  });

  it('rejects an empty block even in the middle of a nonempty asset', () => {
    expect(InternalMemoryAssetContentResponseSchema.safeParse({ ...response, contentBase64: '' }).success).toBe(false);
  });

  it('rejects a block extending beyond sizeBytes', () => {
    const result = InternalMemoryAssetContentResponseSchema.safeParse({ ...response, offset: asset.sizeBytes - 1 });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual({
      code: 'custom', path: ['contentBase64'], message: 'Chunk exceeds asset sizeBytes',
    });
  });

  it.each([{ offset: 0, eof: true }, { offset: 8, eof: false }])(
    'rejects inconsistent EOF at offset $offset with eof=$eof', (patch) => {
      const result = InternalMemoryAssetContentResponseSchema.safeParse({ ...response, ...patch });
      expect(result.success).toBe(false);
      expect(result.error?.issues).toContainEqual({
        code: 'custom', path: ['eof'], message: 'EOF must match the final asset byte',
      });
    },
  );

  it.each([
    { assetId: 'bad' }, { sha256: 'a'.repeat(63) }, { sha256: 'A'.repeat(64) },
    { sizeBytes: -1 }, { sizeBytes: 1.5 }, { offset: -1 }, { offset: 0.5 }, { eof: 'false' },
  ])('rejects malformed response metadata %j', (patch) => {
    expect(InternalMemoryAssetContentResponseSchema.safeParse({ ...response, ...patch }).success).toBe(false);
  });

  it.each(['assetId', 'sha256', 'sizeBytes', 'offset', 'contentBase64', 'eof'] as const)(
    'requires the response field %s', (field) => {
      const input: Record<string, unknown> = { ...response };
      delete input[field];
      expect(InternalMemoryAssetContentResponseSchema.safeParse(input).success).toBe(false);
    },
  );

  it.each([{ extra: true }, { storagePath: 'private/object' }])('rejects unknown response keys %j', (patch) => {
    expect(InternalMemoryAssetContentResponseSchema.safeParse({ ...response, ...patch }).success).toBe(false);
  });

  it('keeps ingest and session requests separate from generated content reads in both directions', () => {
    const ingest = { context, asset, contentBase64: content.toString('base64') };
    const session = {
      scope: { tenantId: asset.tenantId, ownerId: context.ownerId, agentId: 'data-lead' },
      asset: { ...asset, origin: { kind: 'session', sessionId: 'session-1' } },
      offset: 0,
      length: 4,
    };
    expect(InternalMemoryAssetIngestRequestSchema.parse(ingest)).toStrictEqual(ingest);
    expect(DevSessionAssetReadSchema.parse(session)).toStrictEqual(session);
    expect(InternalMemoryAssetContentRequestSchema.safeParse(ingest).success).toBe(false);
    expect(InternalMemoryAssetContentRequestSchema.safeParse(session).success).toBe(false);
    expect(InternalMemoryAssetIngestRequestSchema.safeParse(request).success).toBe(false);
    expect(DevSessionAssetReadSchema.safeParse(request).success).toBe(false);
    expect(DevSessionAssetReadSchema.safeParse({ ...session, asset }).success).toBe(false);
    expect(InternalMemoryAssetContentResponseSchema.safeParse(request).success).toBe(false);
    expect(InternalMemoryAssetContentRequestSchema.safeParse(response).success).toBe(false);
  });

  it('uses a different path from ingest, list and session content', () => {
    for (const path of [INTERNAL_MEMORY_ASSETS_PATH, INTERNAL_MEMORY_ASSETS_LIST_PATH, readDevSessionAssetContract.path]) {
      expect(INTERNAL_MEMORY_ASSET_CONTENT_PATH).not.toBe(path);
    }
  });

  it('reassembles multiple binary blocks and verifies the declared full-file sha256 and size', () => {
    const original = Buffer.alloc(262144 * 2 + 37);
    for (let index = 0; index < original.length; index += 1) original[index] = index % 256;
    const generated = { ...asset, sizeBytes: original.length, sha256: createHash('sha256').update(original).digest('hex') };
    const blocks: Buffer[] = [];
    const offsets: number[] = [];
    const endings: boolean[] = [];
    let offset = 0;
    while (offset < original.length) {
      const read = InternalMemoryAssetContentRequestSchema.parse({ context, asset: generated, offset, length: 262144 });
      const bytes = original.subarray(read.offset, read.offset + read.length);
      const chunk = InternalMemoryAssetContentResponseSchema.parse({
        assetId: generated.assetId, sha256: generated.sha256, sizeBytes: generated.sizeBytes,
        offset: read.offset, contentBase64: bytes.toString('base64'), eof: read.offset + bytes.length === generated.sizeBytes,
      });
      expect(chunk.assetId).toBe(read.asset.assetId);
      expect(chunk.sha256).toBe(read.asset.sha256);
      expect(chunk.sizeBytes).toBe(read.asset.sizeBytes);
      expect(chunk.offset).toBe(read.offset);
      const decoded = Buffer.from(chunk.contentBase64, 'base64');
      blocks.push(decoded);
      offsets.push(chunk.offset);
      endings.push(chunk.eof);
      offset += decoded.length;
    }
    const assembled = Buffer.concat(blocks);
    expect(offsets).toEqual([0, 262144, 524288]);
    expect(endings).toEqual([false, false, true]);
    expect(assembled).toEqual(original);
    expect(assembled.length).toBe(generated.sizeBytes);
    expect(createHash('sha256').update(assembled).digest('hex')).toBe(generated.sha256);
  });

  // Build first at the gate. Native Node resolution checks compiled public exports without source aliases.
  it.each(['ESM', 'CJS'])('loads the compiled public HTTP package and endpoints barrel through %s', (format) => {
    const load = format === 'ESM' ? 'await import' : 'require';
    const endpointModule = `./dist/http/endpoints/index.${format === 'ESM' ? 'js' : 'cjs'}`;
    const program = `
      import assert from 'node:assert/strict';
      import { createRequire } from 'node:module';
      const require = createRequire(import.meta.url);
      const http = ${load}('@x9-forge/contracts/http');
      const endpoints = ${load}(${JSON.stringify(endpointModule)});
      const request = ${JSON.stringify(request)};
      const response = ${JSON.stringify(response)};
      for (const exports of [http, endpoints]) {
        assert.equal(exports.INTERNAL_MEMORY_ASSET_CONTENT_PATH, ${JSON.stringify(INTERNAL_MEMORY_ASSET_CONTENT_PATH)});
        const contract = exports.internalMemoryAssetContentContract;
        assert.equal(contract.method, 'POST');
        assert.equal(contract.path, exports.INTERNAL_MEMORY_ASSET_CONTENT_PATH);
        assert.equal(contract.authType, 'secret');
        assert.equal(contract.bodySchema, exports.InternalMemoryAssetContentRequestSchema);
        assert.equal(contract.responseSchema, exports.InternalMemoryAssetContentResponseSchema);
        assert.deepEqual(contract.bodySchema.parse(request), request);
        assert.deepEqual(contract.responseSchema.parse(response), response);
        assert.equal(contract.bodySchema.safeParse({ ...request, extra: true }).success, false);
        assert.equal(contract.bodySchema.safeParse({ ...request, offset: request.asset.sizeBytes }).success, false);
        for (const origin of ${JSON.stringify(otherOrigins)}) {
          assert.equal(contract.bodySchema.safeParse({ ...request, asset: { ...request.asset, origin } }).success, false);
        }
        assert.equal(contract.responseSchema.safeParse({ ...response, eof: true }).success, false);
        assert.equal(contract.responseSchema.safeParse({ ...response, extra: true }).success, false);
      }
      process.stdout.write('PASS');
    `;
    expect(execFileSync(process.execPath, ['--input-type=module', '--eval', program], {
      cwd: fileURLToPath(new URL('../../../', import.meta.url)),
      encoding: 'utf8',
    })).toBe('PASS');
  });
});
