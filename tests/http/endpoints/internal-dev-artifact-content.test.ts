import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { DevProductionArtifactRead } from '../../../src/http/index.js';
import * as http from '../../../src/http/endpoints/internal-dev-artifact-content.js';
import { CapabilityAgentParamsSchema } from '../../../src/http/endpoints/internal-capability-agent.js';
import { CapabilityAgentScopeSchema } from '../../../src/capability/capability-call-context.js';
import { DevProductionJobSchema } from '../../../src/capability/dev/production-job.js';
import { DevProductionArtifactSchema } from '../../../src/capability/dev/production-result.js';
import { DevProductionArtifactChunkSchema } from '../../../src/capability/dev/production-artifact-content.js';

const contract = http.readDevProductionArtifactContract;
const body = http.DevProductionArtifactReadSchema;
const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const params = { agentId: scope.agentId, jobId: 'job-1' };
const request: http.DevProductionArtifactRead = {
  scope, requestId: 'request_12345678', artifactRef: 'opaque-product-1', offset: 0, length: 3,
};

// Fixtures validate transport only, not persisted ownership or artifact authorization.
describe('internal dev artifact content', () => {
  it('exports POST method', () => {
    expect(contract.method === 'POST').toBe(true);
  });
  it('exports exact path', () => {
    expect(contract.path === '/internal/capability/agents/:agentId/dev/jobs/:jobId/artifacts/read').toBe(true);
  });
  it('requires secret authentication', () => {
    expect(contract.authType === 'secret').toBe(true);
  });
  it('reuses response schema', () => {
    expect(contract.responseSchema === DevProductionArtifactChunkSchema).toBe(true);
  });
  it('reuses body schema', () => {
    expect(contract.bodySchema === http.DevProductionArtifactReadSchema).toBe(true);
  });
  it('reuses agent schema', () => {
    expect(contract.paramsSchema.shape.agentId === CapabilityAgentParamsSchema.shape.agentId).toBe(true);
  });
  it('reuses job schema', () => {
    expect(contract.paramsSchema.shape.jobId === DevProductionJobSchema.shape.jobId).toBe(true);
  });
  it('reuses scope schema', () => {
    expect(body.shape.scope === CapabilityAgentScopeSchema).toBe(true);
  });
  it('reuses request schema', () => {
    expect(body.shape.requestId === DevProductionJobSchema.shape.requestId).toBe(true);
  });
  it('reuses artifact reference schema', () => {
    expect(body.shape.artifactRef === DevProductionArtifactSchema.shape.artifactRef).toBe(true);
  });
  it('reuses offset schema', () => {
    expect(body.shape.offset === DevProductionArtifactChunkSchema.shape.offset).toBe(true);
  });
  it('rejects extra params', () => {
    expect(!contract.paramsSchema.safeParse({ ...params, extra: true }).success).toBe(true);
  });
  it('rejects missing agent', () => {
    expect(!contract.paramsSchema.safeParse({ jobId: params.jobId }).success).toBe(true);
  });
  it('rejects missing job', () => {
    expect(!contract.paramsSchema.safeParse({ agentId: params.agentId }).success).toBe(true);
  });
  it('rejects extra body', () => {
    expect(!body.safeParse({ ...request, extra: true }).success).toBe(true);
  });
  it('rejects missing requestId', () => {
    expect(!body.safeParse({ scope, artifactRef: request.artifactRef, offset: 0, length: 3 }).success).toBe(true);
  });
  it('rejects zero length', () => {
    expect(!body.safeParse({ ...request, length: 0 }).success).toBe(true);
  });
  it('rejects fractional length', () => {
    expect(!body.safeParse({ ...request, length: 1.5 }).success).toBe(true);
  });
  it('rejects excessive length', () => {
    expect(!body.safeParse({ ...request, length: 262145 }).success).toBe(true);
  });
  it('accepts maximum length', () => {
    expect(body.safeParse({ ...request, length: 262144 }).success).toBe(true);
  });
  it('exports through HTTP barrel', () => {
    expect(readFileSync(new URL('../../../src/http/endpoints/index.ts', import.meta.url), 'utf8').includes("export * " + "from './internal-dev-artifact-content.js';")).toBe(true);
  });
  it('imports schema type and route from HTTP barrel', async () => {
    const barrel = await import('../../../src/http/index.js');
    const typed: DevProductionArtifactRead = request;
    expect(barrel.readDevProductionArtifactContract).toBe(contract);
    expect(barrel.DevProductionArtifactReadSchema.parse(typed)).toEqual(request);
  });
  it('accepts initial and successive chunks for separate owners', () => {
    const other = {
      params: { agentId: 'agent-2', jobId: 'job-2' },
      request: { scope: { tenantId: 'tenant-2', ownerId: 'owner-2', agentId: 'agent-2' },
        requestId: 'request_87654321', artifactRef: 'opaque-product-2', offset: 0, length: 3 },
    };
    for (const fixture of [{ params, request }, other]) {
      expect(contract.paramsSchema.parse(fixture.params)).toEqual(fixture.params);
      const artifact = { artifactRef: fixture.request.artifactRef, mediaType: 'text/plain', bytes: 6, sha256: 'a'.repeat(64) };
      for (const offset of [0, 3]) {
        const next = { ...fixture.request, offset };
        expect(body.parse(next)).toEqual(next);
        const chunk = { artifact, offset, contentBase64: offset === 0 ? 'YWJj' : 'ZGVm', eof: offset === 3 };
        expect(contract.responseSchema.parse(chunk)).toEqual(chunk);
      }
    }
  });
  it('inherits canonical input and response rejection', () => {
    for (const invalid of [{ ...request, offset: -1 }, { ...request, offset: 0.5 },
      { ...request, artifactRef: '' }, { ...request, requestId: '' },
      { ...request, scope: { ...scope, ownerId: '' } }]) {
      expect(body.safeParse(invalid).success).toBe(false);
    }
    const artifact = { artifactRef: request.artifactRef, mediaType: 'text/plain', bytes: 3, sha256: 'a'.repeat(64) };
    for (const invalid of [{ artifact, offset: 0, contentBase64: '', eof: true },
      { artifact, offset: 0, contentBase64: 'YWJj', eof: false },
      { artifact, offset: 1, contentBase64: 'YWJj', eof: true }]) {
      expect(contract.responseSchema.safeParse(invalid).success).toBe(false);
    }
  });
});
