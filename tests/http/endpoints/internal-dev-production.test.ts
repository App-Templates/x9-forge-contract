import { afterEach, describe, expect, it, vi } from 'vitest';
import * as http from '../../../src/http/index.js';
import * as approvals from '../../../src/capability/approvals/index.js';
import { CapabilityAgentScopeSchema } from '../../../src/capability/capability-call-context.js';
import { CapabilityAgentParamsSchema } from '../../../src/http/endpoints/internal-capability-agent.js';
import { DevProductionJobSchema, devProductionApprovalBindings } from '../../../src/capability/dev/production-job.js';
import { DevProductionResultSchema } from '../../../src/capability/dev/production-result.js';

const submit = http.submitDevProductionContract;
const get = http.getDevProductionResultContract;
const matches = http.isDevProductionApprovalForJob;
const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const job = DevProductionJobSchema.parse({
  version: 1, scope, jobId: 'job-1', requestId: 'request_12345678', projectId: 'project-1',
  session: { scope, sessionId: 'session-1', target: { kind: 'local', deviceId: 'device-1' }, engines: ['codex', 'claude'] },
  productKind: 'code', instruction: 'Create the requested deliverable.', reportVersion: 1,
  reportDigest: 'a'.repeat(64), configVersion: 0, keyVersion: 1,
  limits: { maxDurationSeconds: 600, maxAttempts: 2, maxTasks: 3 },
});
const digest = 'b'.repeat(64);
const now = Date.parse('2026-10-16T01:01:00Z');
const signed = approvals.SignedApprovalPermitSchema.parse({
  permit: { v: 1, client: 'dev', type: 'dev.produce', ...scope, requestId: job.requestId,
    textSha256: digest, bindings: devProductionApprovalBindings(job),
    issuedAt: '2026-10-16T01:00:00Z', expiresAt: '2026-10-16T01:05:00Z', nonce: 'n'.repeat(22) },
  keyId: 'key-1', signature: 's'.repeat(86),
});
// Synthetic signatures exercise shape and correlation only, never cryptographic verification.
const permitWith = (patch: Record<string, unknown>) => approvals.SignedApprovalPermitSchema.parse({ ...signed, permit: { ...signed.permit, ...patch } });
const queued = { jobId: job.jobId, requestId: job.requestId, status: 'queued' };
const pending = { ...queued, status: 'pending' };
const result = DevProductionResultSchema.parse({
  scope, jobId: job.jobId, requestId: job.requestId, projectId: job.projectId, sessionId: job.session.sessionId,
  productKind: job.productKind, reportVersion: job.reportVersion, reportDigest: job.reportDigest,
  finishedAt: '2026-10-16T01:02:03Z', status: 'succeeded',
  artifacts: [{ artifactRef: 'artifact-1', mediaType: 'application/zip', bytes: 128, sha256: 'c'.repeat(64) }],
  verification: { kind: 'tests', passed: 3, total: 3 },
});
afterEach(() => vi.restoreAllMocks());

describe('internal dev production', () => {
  it("submit exact method", () => {
    expect(submit.method === 'POST').toBe(true); // P001
  });
  it("submit exact path", () => {
    expect(submit.path === '/internal/capability/agents/:agentId/dev/jobs').toBe(true); // P002
  });
  it("submit exact authType", () => {
    expect(submit.authType === 'secret').toBe(true); // P003
  });
  it("get exact method", () => {
    expect(get.method === 'GET').toBe(true); // P004
  });
  it("get exact path", () => {
    expect(get.path === '/internal/capability/agents/:agentId/dev/jobs/:jobId').toBe(true); // P005
  });
  it("get exact authType", () => {
    expect(get.authType === 'secret').toBe(true); // P006
  });
  it("reuses submit params", () => {
    expect(submit.paramsSchema === CapabilityAgentParamsSchema).toBe(true); // P007
  });
  it("reuses submission body", () => {
    expect(submit.bodySchema === http.DevProductionSubmissionSchema).toBe(true); // P008
  });
  it("reuses job schema", () => {
    expect(http.DevProductionSubmissionSchema.shape.job === DevProductionJobSchema).toBe(true); // P009
  });
  it("reuses signed approval schema", () => {
    expect(http.DevProductionSubmissionSchema.shape.approval === approvals.SignedApprovalPermitSchema).toBe(true); // P010
  });
  it("reuses result schema", () => {
    expect(get.responseSchema.options[1].shape.result === DevProductionResultSchema).toBe(true); // P011
  });
  it("reuses get agent schema", () => {
    expect(get.paramsSchema.shape.agentId === CapabilityAgentParamsSchema.shape.agentId).toBe(true); // P012
  });
  it("reuses scope schema", () => {
    expect(get.querySchema.shape.scope === CapabilityAgentScopeSchema).toBe(true); // P013
  });
  it("accepts submission", () => {
    expect(submit.bodySchema.safeParse({ job, approval: signed }).success).toBe(true); // P014
  });
  it("submission is strict", () => {
    expect(submit.bodySchema.safeParse({ job, approval: signed, approved: true }).success).toBe(false); // P015
  });
  it("submission rejects invalid job", () => {
    expect(submit.bodySchema.safeParse({ job: { ...job, jobId: "" }, approval: signed }).success).toBe(false); // P016
  });
  it("submission rejects invalid approval", () => {
    expect(submit.bodySchema.safeParse({ job, approval: { ...signed, signature: "bad" } }).success).toBe(false); // P017
  });
  it("submission requires job", () => {
    expect(submit.bodySchema.safeParse({ approval: signed }).success).toBe(false); // P018
  });
  it("submission requires approval", () => {
    expect(submit.bodySchema.safeParse({ job }).success).toBe(false); // P019
  });
  it("accepts queued receipt", () => {
    expect(submit.responseSchema.safeParse(queued).success).toBe(true); // P020
  });
  it("queued has no artifacts", () => {
    expect(submit.responseSchema.safeParse({ ...queued, artifacts: [] }).success).toBe(false); // P021
  });
  it("queued is not succeeded", () => {
    expect(submit.responseSchema.safeParse({ ...queued, status: "succeeded" }).success).toBe(false); // P022
  });
  it("queued requires job identity", () => {
    expect(submit.responseSchema.safeParse({ ...queued, jobId: "" }).success).toBe(false); // P023
  });
  it("queued validates request identity", () => {
    expect(submit.responseSchema.safeParse({ ...queued, requestId: "short" }).success).toBe(false); // P024
  });
  it("get params are strict", () => {
    expect(get.paramsSchema.safeParse({ agentId: scope.agentId, jobId: job.jobId, extra: true }).success).toBe(false); // P025
  });
  it("get requires job identity", () => {
    expect(get.paramsSchema.safeParse({ agentId: scope.agentId, jobId: "" }).success).toBe(false); // P026
  });
  it("get query is strict", () => {
    expect(get.querySchema.safeParse({ scope, extra: true }).success).toBe(false); // P027
  });
  it("get requires scope", () => {
    expect(get.querySchema.safeParse({}).success).toBe(false); // P028
  });
  it("get rejects incomplete scope", () => {
    expect(get.querySchema.safeParse({ scope: { ...scope, ownerId: "" } }).success).toBe(false); // P029
  });
  it("accepts pending without artifacts", () => {
    expect(get.responseSchema.safeParse(pending).success).toBe(true); // P030
  });
  it("pending has no artifacts", () => {
    expect(get.responseSchema.safeParse({ ...pending, artifacts: [] }).success).toBe(false); // P031
  });
  it("pending validates job identity", () => {
    expect(get.responseSchema.safeParse({ ...pending, jobId: "" }).success).toBe(false); // P032
  });
  it("pending validates request identity", () => {
    expect(get.responseSchema.safeParse({ ...pending, requestId: "short" }).success).toBe(false); // P033
  });
  it("accepts validated finished result", () => {
    expect(get.responseSchema.safeParse({ status: "finished", result }).success).toBe(true); // P034
  });
  it("finished envelope is strict", () => {
    expect(get.responseSchema.safeParse({ status: "finished", result, artifacts: [] }).success).toBe(false); // P035
  });
  it("finished validates result", () => {
    expect(get.responseSchema.safeParse({ status: "finished", result: { ...result, artifacts: [] } }).success).toBe(false); // P036
  });
  it("finished requires result", () => {
    expect(get.responseSchema.safeParse({ status: "finished" }).success).toBe(false); // P037
  });
  it("finished accepts failure without artifacts", () => {
    expect(get.responseSchema.safeParse({ status: "finished", result: { scope, jobId: job.jobId, requestId: job.requestId, projectId: job.projectId, sessionId: job.session.sessionId, productKind: job.productKind, reportVersion: job.reportVersion, reportDigest: job.reportDigest, finishedAt: result.finishedAt, status: "failed", reason: "Execution stopped" } }).success).toBe(true); // P038
  });
  it("nominal correlation uses A11", () => {
    expect(matches(signed, job, digest, now)).toBe(true); // P039
  });
  it("A11 call receives the permit", () => {
    expect(matches(signed, job, digest, now)).toBe(true); // P040
  });
  it("A11 rejection is returned", () => {
    expect(matches(permitWith({ requestId: "request_87654321" }), job, digest, now)).toBe(false); // P041
  });
  it("A11 result is not inverted", () => {
    expect(matches(signed, job, digest, now)).toBe(true); // P042
  });
  it("independent A11 client", () => {
    const foreign = permitWith({ client: 'backup', type: 'backup.create', tenantId: 'tenant-2', ownerId: 'owner-2', agentId: 'agent-2', requestId: 'request_87654321', textSha256: 'd'.repeat(64), bindings: Object.fromEntries(Object.entries(signed.permit.bindings).map(([key, value]) => [key, typeof value === 'number' ? value + 1 : `${value}-other`])) });
    const spy = vi.spyOn(approvals, 'checkApprovalPermit');
    matches(foreign, job, digest, now);
    expect(JSON.stringify(spy.mock.calls) === JSON.stringify([[foreign.permit, { client: 'dev', type: 'dev.produce', scope: job.scope, requestId: job.requestId, textSha256: digest, bindings: devProductionApprovalBindings(job) }, now]])).toBe(true); // P043
  });
  it("independent A11 type", () => {
    const foreign = permitWith({ client: 'backup', type: 'backup.create', tenantId: 'tenant-2', ownerId: 'owner-2', agentId: 'agent-2', requestId: 'request_87654321', textSha256: 'd'.repeat(64), bindings: Object.fromEntries(Object.entries(signed.permit.bindings).map(([key, value]) => [key, typeof value === 'number' ? value + 1 : `${value}-other`])) });
    const spy = vi.spyOn(approvals, 'checkApprovalPermit');
    matches(foreign, job, digest, now);
    expect(JSON.stringify(spy.mock.calls) === JSON.stringify([[foreign.permit, { client: 'dev', type: 'dev.produce', scope: job.scope, requestId: job.requestId, textSha256: digest, bindings: devProductionApprovalBindings(job) }, now]])).toBe(true); // P044
  });
  it("independent A11 scope", () => {
    const foreign = permitWith({ client: 'backup', type: 'backup.create', tenantId: 'tenant-2', ownerId: 'owner-2', agentId: 'agent-2', requestId: 'request_87654321', textSha256: 'd'.repeat(64), bindings: Object.fromEntries(Object.entries(signed.permit.bindings).map(([key, value]) => [key, typeof value === 'number' ? value + 1 : `${value}-other`])) });
    const spy = vi.spyOn(approvals, 'checkApprovalPermit');
    matches(foreign, job, digest, now);
    expect(JSON.stringify(spy.mock.calls) === JSON.stringify([[foreign.permit, { client: 'dev', type: 'dev.produce', scope: job.scope, requestId: job.requestId, textSha256: digest, bindings: devProductionApprovalBindings(job) }, now]])).toBe(true); // P045
  });
  it("independent A11 request", () => {
    const foreign = permitWith({ client: 'backup', type: 'backup.create', tenantId: 'tenant-2', ownerId: 'owner-2', agentId: 'agent-2', requestId: 'request_87654321', textSha256: 'd'.repeat(64), bindings: Object.fromEntries(Object.entries(signed.permit.bindings).map(([key, value]) => [key, typeof value === 'number' ? value + 1 : `${value}-other`])) });
    const spy = vi.spyOn(approvals, 'checkApprovalPermit');
    matches(foreign, job, digest, now);
    expect(JSON.stringify(spy.mock.calls) === JSON.stringify([[foreign.permit, { client: 'dev', type: 'dev.produce', scope: job.scope, requestId: job.requestId, textSha256: digest, bindings: devProductionApprovalBindings(job) }, now]])).toBe(true); // P046
  });
  it("independent A11 text", () => {
    const foreign = permitWith({ client: 'backup', type: 'backup.create', tenantId: 'tenant-2', ownerId: 'owner-2', agentId: 'agent-2', requestId: 'request_87654321', textSha256: 'd'.repeat(64), bindings: Object.fromEntries(Object.entries(signed.permit.bindings).map(([key, value]) => [key, typeof value === 'number' ? value + 1 : `${value}-other`])) });
    const spy = vi.spyOn(approvals, 'checkApprovalPermit');
    matches(foreign, job, digest, now);
    expect(JSON.stringify(spy.mock.calls) === JSON.stringify([[foreign.permit, { client: 'dev', type: 'dev.produce', scope: job.scope, requestId: job.requestId, textSha256: digest, bindings: devProductionApprovalBindings(job) }, now]])).toBe(true); // P047
  });
  it("independent A11 bindings", () => {
    const foreign = permitWith({ client: 'backup', type: 'backup.create', tenantId: 'tenant-2', ownerId: 'owner-2', agentId: 'agent-2', requestId: 'request_87654321', textSha256: 'd'.repeat(64), bindings: Object.fromEntries(Object.entries(signed.permit.bindings).map(([key, value]) => [key, typeof value === 'number' ? value + 1 : `${value}-other`])) });
    const spy = vi.spyOn(approvals, 'checkApprovalPermit');
    matches(foreign, job, digest, now);
    expect(JSON.stringify(spy.mock.calls) === JSON.stringify([[foreign.permit, { client: 'dev', type: 'dev.produce', scope: job.scope, requestId: job.requestId, textSha256: digest, bindings: devProductionApprovalBindings(job) }, now]])).toBe(true); // P048
  });
  it("A11 is actually invoked", () => {
    const spy = vi.spyOn(approvals, 'checkApprovalPermit'); matches(signed, job, digest, now);
    expect(spy.mock.calls.length === 1).toBe(true); // P049
  });
  it("rejects changed tenantId", () => {
    expect(matches(permitWith({ tenantId: "other-identity" }), job, digest, now)).toBe(false); // P050
  });
  it("rejects changed ownerId", () => {
    expect(matches(permitWith({ ownerId: "other-identity" }), job, digest, now)).toBe(false); // P051
  });
  it("rejects changed agentId", () => {
    expect(matches(permitWith({ agentId: "other-identity" }), job, digest, now)).toBe(false); // P052
  });
  it("rejects changed request", () => {
    expect(matches(permitWith({ requestId: "request_87654321" }), job, digest, now)).toBe(false); // P053
  });
  it("rejects changed type", () => {
    expect(matches(permitWith({ type: "dev.release" }), job, digest, now)).toBe(false); // P054
  });
  it("rejects changed client", () => {
    expect(matches(permitWith({ client: "backup", type: "backup.create" }), job, digest, now)).toBe(false); // P055
  });
  it("rejects different expected text", () => {
    expect(matches(signed, job, "e".repeat(64), now)).toBe(false); // P056
  });
  it("rejects changed binding jobId", () => {
    expect(matches(permitWith({ bindings: { ...signed.permit.bindings, jobId: String(signed.permit.bindings.jobId) + "-other" } }), job, digest, now)).toBe(false); // P057
  });
  it("rejects changed binding projectId", () => {
    expect(matches(permitWith({ bindings: { ...signed.permit.bindings, projectId: String(signed.permit.bindings.projectId) + "-other" } }), job, digest, now)).toBe(false); // P058
  });
  it("rejects changed binding sessionId", () => {
    expect(matches(permitWith({ bindings: { ...signed.permit.bindings, sessionId: String(signed.permit.bindings.sessionId) + "-other" } }), job, digest, now)).toBe(false); // P059
  });
  it("rejects changed binding sessionKind", () => {
    expect(matches(permitWith({ bindings: { ...signed.permit.bindings, sessionKind: String(signed.permit.bindings.sessionKind) + "-other" } }), job, digest, now)).toBe(false); // P060
  });
  it("rejects changed binding sessionTarget", () => {
    expect(matches(permitWith({ bindings: { ...signed.permit.bindings, sessionTarget: String(signed.permit.bindings.sessionTarget) + "-other" } }), job, digest, now)).toBe(false); // P061
  });
  it("rejects changed binding engines", () => {
    expect(matches(permitWith({ bindings: { ...signed.permit.bindings, engines: String(signed.permit.bindings.engines) + "-other" } }), job, digest, now)).toBe(false); // P062
  });
  it("rejects changed binding productKind", () => {
    expect(matches(permitWith({ bindings: { ...signed.permit.bindings, productKind: String(signed.permit.bindings.productKind) + "-other" } }), job, digest, now)).toBe(false); // P063
  });
  it("rejects changed binding reportVersion", () => {
    expect(matches(permitWith({ bindings: { ...signed.permit.bindings, reportVersion: Number(signed.permit.bindings.reportVersion) + 1 } }), job, digest, now)).toBe(false); // P064
  });
  it("rejects changed binding reportDigest", () => {
    expect(matches(permitWith({ bindings: { ...signed.permit.bindings, reportDigest: String(signed.permit.bindings.reportDigest) + "-other" } }), job, digest, now)).toBe(false); // P065
  });
  it("rejects changed binding configVersion", () => {
    expect(matches(permitWith({ bindings: { ...signed.permit.bindings, configVersion: Number(signed.permit.bindings.configVersion) + 1 } }), job, digest, now)).toBe(false); // P066
  });
  it("rejects changed binding keyVersion", () => {
    expect(matches(permitWith({ bindings: { ...signed.permit.bindings, keyVersion: Number(signed.permit.bindings.keyVersion) + 1 } }), job, digest, now)).toBe(false); // P067
  });
  it("rejects expired permit", () => {
    expect(matches(signed, job, digest, Date.parse(signed.permit.expiresAt))).toBe(false); // P068
  });
  it("rejects future permit", () => {
    expect(matches(signed, job, digest, Date.parse(signed.permit.issuedAt) - 31000)).toBe(false); // P069
  });
  it("rejects NaN clock", () => {
    const spy = vi.spyOn(approvals, 'checkApprovalPermit');
    expect(!matches(signed, job, digest, NaN) && spy.mock.calls.length === 0).toBe(true); // P070
  });
  it("rejects positive infinity clock", () => {
    const spy = vi.spyOn(approvals, 'checkApprovalPermit');
    expect(!matches(signed, job, digest, Infinity) && spy.mock.calls.length === 0).toBe(true); // P071
  });
  it("rejects negative infinity clock", () => {
    const spy = vi.spyOn(approvals, 'checkApprovalPermit');
    expect(!matches(signed, job, digest, -Infinity) && spy.mock.calls.length === 0).toBe(true); // P072
  });
  it("parses signed envelope", () => {
    expect(matches({ ...signed, signature: "invalid" }, job, digest, now)).toBe(false); // P073
  });
  it("parses expected job", () => {
    expect(matches(signed, { ...job, extra: true }, digest, now)).toBe(false); // P074
  });
  it("parses expected digest", () => {
    expect(matches(signed, job, digest.toUpperCase(), now)).toBe(false); // P075
  });
  it("rejects malformed inputs", () => {
    expect([null, {}, true].every(raw => !matches(raw, job, digest, now) && !matches(signed, raw, digest, now) && !matches(signed, job, raw, now))).toBe(true); // P076
  });
  it("correlates two owners and two agents independently", () => {
    const combinations = ['owner-1', 'owner-2'].flatMap(ownerId => ['agent-1', 'agent-2'].map(agentId => { const ownScope = { ...scope, ownerId, agentId }; const ownJob = DevProductionJobSchema.parse({ ...job, scope: ownScope, session: { ...job.session, scope: ownScope } }); return { ownJob, ownPermit: permitWith(ownScope) }; }));
    expect(combinations.every(({ ownJob, ownPermit }) => matches(ownPermit, ownJob, digest, now) && combinations.filter(other => other.ownJob !== ownJob).every(other => !matches(ownPermit, other.ownJob, digest, now)))).toBe(true); // P077
  });
});
