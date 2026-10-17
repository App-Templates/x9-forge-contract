import { describe, expect, it } from 'vitest';
import { DevProductionArtifactSchema as artifactSchema, DevProductionResultSchema as schema, isDevProductionResultForJob as matches } from '../../../src/capability/dev/production-result.js';
import { DevProductionJobSchema, type DevProductionKind } from '../../../src/capability/dev/production-job.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const job = {
  version: 1, scope, jobId: 'job-1', requestId: 'request_12345678', projectId: 'project-1',
  session: { scope, sessionId: 'session-1', target: { kind: 'local', deviceId: 'device-1' }, engines: ['codex'] },
  productKind: 'code', instruction: 'Build the requested product.', reportVersion: 1,
  reportDigest: 'a'.repeat(64), configVersion: 0, keyVersion: 1,
  limits: { maxDurationSeconds: 600, maxAttempts: 1, maxTasks: 3 },
};
const artifact = { artifactRef: 'artifact-1', mediaType: 'application/zip', bytes: 128, sha256: 'b'.repeat(64) };
const testsProof = { kind: 'tests', passed: 3, total: 3 };
const visualProof = { kind: 'visual_review', previewRef: 'preview-1', reviewRef: 'review-1', ownerAcceptanceRef: 'acceptance-1' };
const result = {
  scope, jobId: job.jobId, requestId: job.requestId, projectId: job.projectId, sessionId: job.session.sessionId,
  productKind: job.productKind, reportVersion: job.reportVersion, reportDigest: job.reportDigest,
  finishedAt: '2026-10-16T01:02:03Z', status: 'succeeded', artifacts: [artifact], verification: testsProof,
};
const { artifacts: unusedArtifacts, verification: unusedVerification, ...resultBase } = result;
void unusedArtifacts;
void unusedVerification;
const failed = { ...resultBase, status: 'failed', reason: 'Execution stopped.' };

describe('dev production result', () => {
  it("accepts succeeded code", () => {
    expect(schema.safeParse({ ...result, productKind: 'code', verification: testsProof }).success).toBe(true);
  });
  it("correlates succeeded code", () => {
    const candidate = { ...result, productKind: 'code', verification: testsProof };
    const expected = { ...job, productKind: 'code' };
    expect(matches(candidate, expected)).toBe(true);
  });
  it("accepts succeeded automation", () => {
    expect(schema.safeParse({ ...result, productKind: 'automation', verification: testsProof }).success).toBe(true);
  });
  it("correlates succeeded automation", () => {
    const candidate = { ...result, productKind: 'automation', verification: testsProof };
    const expected = { ...job, productKind: 'automation' };
    expect(matches(candidate, expected)).toBe(true);
  });
  it("accepts succeeded presentation", () => {
    expect(schema.safeParse({ ...result, productKind: 'presentation', verification: visualProof }).success).toBe(true);
  });
  it("correlates succeeded presentation", () => {
    const candidate = { ...result, productKind: 'presentation', verification: visualProof };
    const expected = { ...job, productKind: 'presentation' };
    expect(matches(candidate, expected)).toBe(true);
  });
  it("accepts succeeded design", () => {
    expect(schema.safeParse({ ...result, productKind: 'design', verification: visualProof }).success).toBe(true);
  });
  it("correlates succeeded design", () => {
    const candidate = { ...result, productKind: 'design', verification: visualProof };
    const expected = { ...job, productKind: 'design' };
    expect(matches(candidate, expected)).toBe(true);
  });
  it("accepts failed", () => {
    expect(schema.safeParse({ ...failed, status: 'failed' }).success).toBe(true);
  });
  it("correlates failed", () => {
    expect(matches({ ...failed, status: 'failed' }, job)).toBe(true);
  });
  it("failed rejects artifacts", () => {
    expect(schema.safeParse({ ...failed, status: 'failed', artifacts: [artifact] }).success).toBe(false);
  });
  it("failed rejects verification", () => {
    expect(schema.safeParse({ ...failed, status: 'failed', verification: testsProof }).success).toBe(false);
  });
  it("failed requires reason", () => {
    expect(schema.safeParse({ ...resultBase, status: 'failed' }).success).toBe(false);
  });
  it("accepts blocked", () => {
    expect(schema.safeParse({ ...failed, status: 'blocked' }).success).toBe(true);
  });
  it("correlates blocked", () => {
    expect(matches({ ...failed, status: 'blocked' }, job)).toBe(true);
  });
  it("blocked rejects artifacts", () => {
    expect(schema.safeParse({ ...failed, status: 'blocked', artifacts: [artifact] }).success).toBe(false);
  });
  it("blocked rejects verification", () => {
    expect(schema.safeParse({ ...failed, status: 'blocked', verification: testsProof }).success).toBe(false);
  });
  it("blocked requires reason", () => {
    expect(schema.safeParse({ ...resultBase, status: 'blocked' }).success).toBe(false);
  });
  it("accepts cancelled", () => {
    expect(schema.safeParse({ ...failed, status: 'cancelled' }).success).toBe(true);
  });
  it("correlates cancelled", () => {
    expect(matches({ ...failed, status: 'cancelled' }, job)).toBe(true);
  });
  it("cancelled rejects artifacts", () => {
    expect(schema.safeParse({ ...failed, status: 'cancelled', artifacts: [artifact] }).success).toBe(false);
  });
  it("cancelled rejects verification", () => {
    expect(schema.safeParse({ ...failed, status: 'cancelled', verification: testsProof }).success).toBe(false);
  });
  it("cancelled requires reason", () => {
    expect(schema.safeParse({ ...resultBase, status: 'cancelled' }).success).toBe(false);
  });
  it("accepts uncertain", () => {
    expect(schema.safeParse({ ...failed, status: 'uncertain' }).success).toBe(true);
  });
  it("correlates uncertain", () => {
    expect(matches({ ...failed, status: 'uncertain' }, job)).toBe(true);
  });
  it("uncertain rejects artifacts", () => {
    expect(schema.safeParse({ ...failed, status: 'uncertain', artifacts: [artifact] }).success).toBe(false);
  });
  it("uncertain rejects verification", () => {
    expect(schema.safeParse({ ...failed, status: 'uncertain', verification: testsProof }).success).toBe(false);
  });
  it("uncertain requires reason", () => {
    expect(schema.safeParse({ ...resultBase, status: 'uncertain' }).success).toBe(false);
  });
  it("accepts artifact", () => {
    expect(artifactSchema.safeParse(artifact).success).toBe(true);
  });
  it("rejects empty artifact reference", () => {
    expect(artifactSchema.safeParse({ ...artifact, artifactRef: '' }).success).toBe(false);
  });
  it("rejects empty media type", () => {
    expect(artifactSchema.safeParse({ ...artifact, mediaType: '' }).success).toBe(false);
  });
  it("rejects zero bytes", () => {
    expect(artifactSchema.safeParse({ ...artifact, bytes: 0 }).success).toBe(false);
  });
  it("rejects fractional bytes", () => {
    expect(artifactSchema.safeParse({ ...artifact, bytes: 1.5 }).success).toBe(false);
  });
  it("rejects infinite bytes", () => {
    expect(artifactSchema.safeParse({ ...artifact, bytes: Infinity }).success).toBe(false);
  });
  it("rejects uppercase artifact digest", () => {
    expect(artifactSchema.safeParse({ ...artifact, sha256: 'B'.repeat(64) }).success).toBe(false);
  });
  it("rejects short artifact digest", () => {
    expect(artifactSchema.safeParse({ ...artifact, sha256: 'b'.repeat(63) }).success).toBe(false);
  });
  it("rejects nonhex artifact digest", () => {
    expect(artifactSchema.safeParse({ ...artifact, sha256: 'g'.repeat(64) }).success).toBe(false);
  });
  it("rejects artifact extras", () => {
    expect(artifactSchema.safeParse({ ...artifact, extra: true }).success).toBe(false);
  });
  it("rejects missing bytes", () => {
    expect(artifactSchema.safeParse({ ...artifact, bytes: undefined }).success).toBe(false);
  });
  it("rejects negative bytes", () => {
    expect(artifactSchema.safeParse({ ...artifact, bytes: -1 }).success).toBe(false);
  });
  it("rejects NaN bytes", () => {
    expect(artifactSchema.safeParse({ ...artifact, bytes: NaN }).success).toBe(false);
  });
  it("rejects empty artifacts", () => {
    expect(schema.safeParse({ ...result, artifacts: [] }).success).toBe(false);
  });
  it("requires artifacts", () => {
    expect(schema.safeParse({ ...result, artifacts: undefined }).success).toBe(false);
  });
  it("requires verification", () => {
    expect(schema.safeParse({ ...result, verification: undefined }).success).toBe(false);
  });
  it("rejects zero test counts", () => {
    expect(schema.safeParse({ ...result, verification: { ...testsProof, passed: 0, total: 0 } }).success).toBe(false);
  });
  it("rejects fractional test counts", () => {
    expect(schema.safeParse({ ...result, verification: { ...testsProof, passed: 1.5, total: 1.5 } }).success).toBe(false);
  });
  it("rejects partial tests", () => {
    expect(schema.safeParse({ ...result, verification: { ...testsProof, passed: 2 } }).success).toBe(false);
  });
  it("rejects excess passed tests", () => {
    expect(schema.safeParse({ ...result, verification: { ...testsProof, passed: 4 } }).success).toBe(false);
  });
  it("rejects tests proof extras", () => {
    expect(schema.safeParse({ ...result, verification: { ...testsProof, extra: true } }).success).toBe(false);
  });
  it("rejects visual proof extras", () => {
    expect(schema.safeParse({ ...result, productKind: 'presentation', verification: { ...visualProof, extra: true } }).success).toBe(false);
  });
  it("rejects empty previewRef", () => {
    expect(schema.safeParse({ ...result, productKind: 'presentation', verification: { ...visualProof, previewRef: '' } }).success).toBe(false);
  });
  it("rejects missing previewRef", () => {
    expect(schema.safeParse({ ...result, productKind: 'presentation', verification: { ...visualProof, previewRef: undefined } }).success).toBe(false);
  });
  it("rejects empty reviewRef", () => {
    expect(schema.safeParse({ ...result, productKind: 'presentation', verification: { ...visualProof, reviewRef: '' } }).success).toBe(false);
  });
  it("rejects missing reviewRef", () => {
    expect(schema.safeParse({ ...result, productKind: 'presentation', verification: { ...visualProof, reviewRef: undefined } }).success).toBe(false);
  });
  it("rejects empty ownerAcceptanceRef", () => {
    expect(schema.safeParse({ ...result, productKind: 'presentation', verification: { ...visualProof, ownerAcceptanceRef: '' } }).success).toBe(false);
  });
  it("rejects missing ownerAcceptanceRef", () => {
    expect(schema.safeParse({ ...result, productKind: 'presentation', verification: { ...visualProof, ownerAcceptanceRef: undefined } }).success).toBe(false);
  });
  it("rejects wrong proof for code", () => {
    expect(schema.safeParse({ ...result, productKind: 'code', verification: visualProof }).success).toBe(false);
  });
  it("rejects wrong proof for automation", () => {
    expect(schema.safeParse({ ...result, productKind: 'automation', verification: visualProof }).success).toBe(false);
  });
  it("rejects wrong proof for presentation", () => {
    expect(schema.safeParse({ ...result, productKind: 'presentation', verification: testsProof }).success).toBe(false);
  });
  it("rejects wrong proof for design", () => {
    expect(schema.safeParse({ ...result, productKind: 'design', verification: testsProof }).success).toBe(false);
  });
  it("rejects unknown proof kind", () => {
    expect(schema.safeParse({ ...result, verification: { ...testsProof, kind: 'manual' } }).success).toBe(false);
  });
  it("rejects empty jobId", () => {
    expect(schema.safeParse({ ...result, jobId: '' }).success).toBe(false);
  });
  it("rejects malformed requestId", () => {
    expect(schema.safeParse({ ...result, requestId: 'short' }).success).toBe(false);
  });
  it("rejects empty projectId", () => {
    expect(schema.safeParse({ ...result, projectId: '' }).success).toBe(false);
  });
  it("rejects empty sessionId", () => {
    expect(schema.safeParse({ ...result, sessionId: '' }).success).toBe(false);
  });
  it("rejects zero reportVersion", () => {
    expect(schema.safeParse({ ...result, reportVersion: 0 }).success).toBe(false);
  });
  it("rejects uppercase reportDigest", () => {
    expect(schema.safeParse({ ...result, reportDigest: 'A'.repeat(64) }).success).toBe(false);
  });
  it("rejects fractional reportVersion", () => {
    expect(schema.safeParse({ ...result, reportVersion: 1.5 }).success).toBe(false);
  });
  it("rejects unknown product", () => {
    expect(schema.safeParse({ ...failed, productKind: 'unknown' }).success).toBe(false);
  });
  it("rejects invalid finish time", () => {
    expect(schema.safeParse({ ...result, finishedAt: 'yesterday' }).success).toBe(false);
  });
  it("rejects result extras", () => {
    expect(schema.safeParse({ ...result, extra: true }).success).toBe(false);
  });
  it("rejects scope extras", () => {
    expect(schema.safeParse({ ...result, scope: { ...scope, extra: true } }).success).toBe(false);
  });
  it("rejects missing tenant", () => {
    expect(schema.safeParse({ ...result, scope: { ownerId: scope.ownerId, agentId: scope.agentId } }).success).toBe(false);
  });
  it("rejects empty reason", () => {
    expect(schema.safeParse({ ...failed, reason: '' }).success).toBe(false);
  });
  it("rejects oversized reason", () => {
    expect(schema.safeParse({ ...failed, reason: 'x'.repeat(1001) }).success).toBe(false);
  });
  it("accepts maximum reason", () => {
    expect(schema.safeParse({ ...failed, reason: 'x'.repeat(1000) }).success).toBe(true);
  });
  it("rejects unknown status", () => {
    expect(schema.safeParse({ ...failed, status: 'retry' }).success).toBe(false);
  });
  it("rejects succeeded reason", () => {
    expect(schema.safeParse({ ...result, reason: 'unexpected' }).success).toBe(false);
  });
  it("rejects different tenantId", () => {
    const candidate = { ...result, scope: { ...scope, tenantId: 'other-tenantId' } };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(matches(candidate, job)).toBe(false);
  });
  it("rejects different ownerId", () => {
    const candidate = { ...result, scope: { ...scope, ownerId: 'other-ownerId' } };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(matches(candidate, job)).toBe(false);
  });
  it("rejects different agentId", () => {
    const candidate = { ...result, scope: { ...scope, agentId: 'other-agentId' } };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(matches(candidate, job)).toBe(false);
  });
  it("rejects different jobId", () => {
    const candidate = { ...result, jobId: 'other-job' };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(matches(candidate, job)).toBe(false);
  });
  it("rejects different requestId", () => {
    const candidate = { ...result, requestId: 'request_87654321' };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(matches(candidate, job)).toBe(false);
  });
  it("rejects different projectId", () => {
    const candidate = { ...result, projectId: 'other-project' };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(matches(candidate, job)).toBe(false);
  });
  it("rejects different sessionId", () => {
    const candidate = { ...result, sessionId: 'other-session' };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(matches(candidate, job)).toBe(false);
  });
  it("rejects different productKind", () => {
    const candidate = { ...result, productKind: 'automation' };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(matches(candidate, job)).toBe(false);
  });
  it("rejects different reportVersion", () => {
    const candidate = { ...result, reportVersion: 2 };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(matches(candidate, job)).toBe(false);
  });
  it("rejects different reportDigest", () => {
    const candidate = { ...result, reportDigest: 'c'.repeat(64) };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(matches(candidate, job)).toBe(false);
  });
  it("rejects malformed result in correlator", () => {
    expect(matches({ ...result, finishedAt: 'bad' }, job)).toBe(false);
  });
  it("rejects malformed job in correlator", () => {
    expect(matches(result, { ...job, instruction: '' })).toBe(false);
  });
  it("rejects null inputs", () => {
    expect(matches(null, null)).toBe(false);
  });
  it("rejects mismatched job session scope", () => {
    expect(matches(result, { ...job, session: { ...job.session, scope: { ...scope, ownerId: 'other-owner' } } })).toBe(false);
  });
  it("accepts typed job", () => {
    expect(DevProductionJobSchema.safeParse({ ...job, productKind: 'code' satisfies DevProductionKind }).success).toBe(true);
  });
});
