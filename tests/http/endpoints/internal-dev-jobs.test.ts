import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DevProductionJobsPageSchema as pageSchema, listDevProductionJobsContract as contract, type DevProductionJobsPage } from '../../../src/http/endpoints/internal-dev-jobs.js';
import { CapabilityAgentParamsSchema } from '../../../src/http/endpoints/internal-capability-agent.js';
import { CapabilityAgentScopeSchema } from '../../../src/capability/capability-call-context.js';
import { DevProductionJobSchema } from '../../../src/capability/dev/production-job.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
function job(jobId: string, identity = scope, productKind = 'code') {
  return {
    version: 1, scope: identity, jobId, requestId: 'request_12345678', projectId: 'project-1',
    session: { scope: identity, sessionId: 'session-1', target: { kind: 'local', deviceId: 'device-1' }, engines: ['codex', 'claude'] },
    productKind, instruction: 'Create the requested deliverable.', reportVersion: 1,
    reportDigest: 'a'.repeat(64), configVersion: 0, keyVersion: 1,
    limits: { maxDurationSeconds: 600, maxAttempts: 2, maxTasks: 3 },
  };
}
const page = { items: [job('job-1')], nextCursor: null };
const validPage = (raw: unknown) => pageSchema.safeParse(raw).success;
const validQuery = (raw: unknown) => contract.querySchema.safeParse(raw).success;

// These fixtures exercise contract validation, not a service's storage or owner filter.
describe('internal dev jobs', () => {
  it('exports GET method', () => {
    expect(contract.method === 'GET').toBe(true);
  });
  it('exports exact path', () => {
    expect(contract.path === '/internal/capability/agents/:agentId/dev/jobs').toBe(true);
  });
  it('requires secret authentication', () => {
    expect(contract.authType === 'secret').toBe(true);
  });
  it('has no body', () => {
    expect(!('bodySchema' in contract)).toBe(true);
  });
  it('reuses response schema', () => {
    expect(contract.responseSchema === pageSchema).toBe(true);
  });
  it('reuses job schema by identity', () => {
    expect(pageSchema.shape.items.element === DevProductionJobSchema).toBe(true);
  });
  it('reuses agent id schema', () => {
    expect(contract.paramsSchema.shape.agentId === CapabilityAgentParamsSchema.shape.agentId).toBe(true);
  });
  it('reuses scope schema', () => {
    expect(contract.querySchema.shape.scope === CapabilityAgentScopeSchema).toBe(true);
  });
  it('exports through HTTP barrel', () => {
    expect(readFileSync(new URL('../../../src/http/endpoints/index.ts', import.meta.url), 'utf8').includes("export * " + "from " + "'./internal-dev-jobs.js';")).toBe(true);
  });
  it('accepts separate owner agent pages with code design and cursor', () => {
    expect((() => {
      const other = { tenantId: 'tenant-2', ownerId: 'owner-2', agentId: 'agent-2' };
      const first: DevProductionJobsPage = pageSchema.parse({ items: [job('job-1'), job('job-2', scope, 'design')], nextCursor: ' opaque-1 ' });
      const second = { items: [job('job-3', other, 'design')], nextCursor: null };
      return first.nextCursor === 'opaque-1' && first.items.length === 2 && validPage(second)
        && contract.paramsSchema.safeParse({ agentId: other.agentId }).success
        && validQuery({ scope: other, cursor: 'opaque-1', limit: 50 });
    })()).toBe(true);
  });
  it('accepts empty page', () => {
    expect(validPage({ items: [], nextCursor: null })).toBe(true);
  });
  it('accepts fifty unique jobs', () => {
    expect(validPage({ items: Array.from({ length: 50 }, (_, i) => job(`job-${i}`)), nextCursor: 'x'.repeat(512) })).toBe(true);
  });
  it('rejects duplicate job ids', () => {
    expect(!validPage({ ...page, items: [job('same'), job('same')] })).toBe(true);
  });
  it('rejects mixed tenantId', () => {
    expect((() => { const foreign = job('job-2', { ...scope, tenantId: 'foreign' }); return DevProductionJobSchema.safeParse(foreign).success && !validPage({ ...page, items: [job('job-1'), foreign] }); })()).toBe(true);
  });
  it('rejects mixed ownerId', () => {
    expect((() => { const foreign = job('job-2', { ...scope, ownerId: 'foreign' }); return DevProductionJobSchema.safeParse(foreign).success && !validPage({ ...page, items: [job('job-1'), foreign] }); })()).toBe(true);
  });
  it('rejects mixed agentId', () => {
    expect((() => { const foreign = job('job-2', { ...scope, agentId: 'foreign' }); return DevProductionJobSchema.safeParse(foreign).success && !validPage({ ...page, items: [job('job-1'), foreign] }); })()).toBe(true);
  });
  it('rejects oversized page', () => {
    expect(!validPage({ ...page, items: Array.from({ length: 51 }, (_, i) => job(`job-${i}`)) })).toBe(true);
  });
  it('rejects page extras', () => {
    expect(!validPage({ ...page, extra: true })).toBe(true);
  });
  it('rejects params extras', () => {
    expect(!contract.paramsSchema.safeParse({ agentId: scope.agentId, extra: true }).success).toBe(true);
  });
  it('rejects missing and empty agent params', () => {
    expect([{}, { agentId: '' }].every(raw => !contract.paramsSchema.safeParse(raw).success)).toBe(true);
  });
  it('rejects query extras', () => {
    expect(!validQuery({ scope, extra: true })).toBe(true);
  });
  it('rejects incomplete and extra scope', () => {
    expect([{}, { scope: {} }, { scope: { ...scope, extra: true } }, ...Object.keys(scope).map(key => ({ scope: { ...scope, [key]: '' } }))].every(raw => !validQuery(raw))).toBe(true);
  });
  it('rejects invalid job identity', () => {
    expect(!validPage({ ...page, items: [{ ...job('job-1'), jobId: '' }] })).toBe(true);
  });
  it('trims cursor', () => {
    expect(contract.querySchema.parse({ scope, cursor: ' opaque ' }).cursor === 'opaque').toBe(true);
  });
  it('rejects empty cursor', () => {
    expect(!validQuery({ scope, cursor: '' })).toBe(true);
  });
  it('rejects long cursor', () => {
    expect(!validQuery({ scope, cursor: 'x'.repeat(513) })).toBe(true);
  });
  it('rejects blank cursor', () => {
    expect(!validQuery({ scope, cursor: '   ' })).toBe(true);
  });
  it('rejects numeric cursor', () => {
    expect(!validQuery({ scope, cursor: 42 })).toBe(true);
  });
  it('trims nextCursor', () => {
    expect(pageSchema.parse({ ...page, nextCursor: ' opaque ' }).nextCursor === 'opaque').toBe(true);
  });
  it('rejects empty nextCursor', () => {
    expect(!validPage({ ...page, nextCursor: '' })).toBe(true);
  });
  it('rejects long nextCursor', () => {
    expect(!validPage({ ...page, nextCursor: 'x'.repeat(513) })).toBe(true);
  });
  it('rejects blank nextCursor', () => {
    expect(!validPage({ ...page, nextCursor: '   ' })).toBe(true);
  });
  it('rejects numeric nextCursor', () => {
    expect(!validPage({ ...page, nextCursor: 42 })).toBe(true);
  });
  it('accepts omitted cursor', () => {
    expect(validQuery({ scope })).toBe(true);
  });
  it('accepts null next cursor', () => {
    expect(validPage(page)).toBe(true);
  });
  it('requires next cursor', () => {
    expect(!validPage({ items: [] })).toBe(true);
  });
  it('defaults limit to twenty', () => {
    expect(contract.querySchema.parse({ scope }).limit === 20).toBe(true);
  });
  it('accepts limit boundaries', () => {
    expect(validQuery({ scope, limit: 1, cursor: 'x'.repeat(512) }) && validQuery({ scope, limit: 50 })).toBe(true);
  });
  it('rejects zero limit', () => {
    expect(!validQuery({ scope, limit: 0 })).toBe(true);
  });
  it('rejects large limit', () => {
    expect(!validQuery({ scope, limit: 51 })).toBe(true);
  });
  it('rejects fractional limit', () => {
    expect(!validQuery({ scope, limit: 1.5 })).toBe(true);
  });
  it('rejects string limit', () => {
    expect(!validQuery({ scope, limit: '20' })).toBe(true);
  });
});
