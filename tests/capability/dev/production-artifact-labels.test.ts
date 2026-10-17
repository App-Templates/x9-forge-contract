import { describe, expect, it } from 'vitest';
import {
  DevProductionArtifactSchema,
  DevProductionArtifactChunkSchema,
  DevProductionResultSchema,
} from '../../../src/capability/dev/index.js';

const artifact = { artifactRef: 'artifact-225', mediaType: 'application/zip', bytes: 6, sha256: 'a'.repeat(64) };
const result = {
  scope: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' },
  jobId: 'job-225', requestId: 'request_12345678', projectId: 'project-1', sessionId: 'session-1',
  productKind: 'code', reportVersion: 1, reportDigest: 'b'.repeat(64),
  finishedAt: '2026-10-16T01:02:03Z', status: 'succeeded', artifacts: [artifact],
  verification: { kind: 'tests', passed: 3, total: 3 },
};
const chunk = { artifact, offset: 0, contentBase64: 'AP8A', eof: false };

describe('bridge225', () => {
  it('preserves names through successful result and chunk', () => {
    const named = { ...artifact, fileName: '  consegna.zip  ', displayName: '  Risultato del mio agente  ' };
    const expected = { ...artifact, fileName: 'consegna.zip', displayName: 'Risultato del mio agente' };
    const parsed = DevProductionResultSchema.parse({ ...result, artifacts: [named] });
    expect(parsed.status).toBe('succeeded');
    if (parsed.status !== 'succeeded') throw new Error('Expected succeeded result');
    expect(parsed.artifacts[0]).toEqual(expected);
    expect(parsed.verification).toEqual(result.verification);
    expect(DevProductionArtifactChunkSchema.parse({ ...chunk, artifact: named })).toEqual({ ...chunk, artifact: expected });
    for (const metadata of [{ fileName: 'résultat.zip' }, { displayName: 'Risultato leggibile' }]) {
      expect(DevProductionArtifactSchema.parse({ ...artifact, ...metadata })).toEqual({ ...artifact, ...metadata });
    }
    for (const metadata of [{ fileName: 'a', displayName: 'b' }, { fileName: 'a'.repeat(180), displayName: 'b'.repeat(160) }]) {
      expect(DevProductionArtifactSchema.parse({ ...artifact, ...metadata })).toEqual({ ...artifact, ...metadata });
    }
  });

  it('keeps legacy artifacts without invented metadata', () => {
    const parsed = DevProductionResultSchema.parse(result);
    expect(parsed).toEqual(result);
    expect(DevProductionArtifactChunkSchema.parse(chunk)).toEqual(chunk);
    const legacy = DevProductionArtifactSchema.parse(artifact);
    expect(legacy).toEqual(artifact);
    expect(Object.hasOwn(legacy, 'fileName')).toBe(false);
    expect(Object.hasOwn(legacy, 'displayName')).toBe(false);
  });

  it('rejects empty names and labels', () => {
    for (const metadata of [{ fileName: '' }, { fileName: '   ' }, { displayName: '' }, { displayName: '   ' }]) {
      const empty = DevProductionArtifactSchema.safeParse({ ...artifact, ...metadata });
      expect(empty.success).toBe(false);
    }
  });

  it('rejects path separators and traversal names', () => {
    for (const fileName of ['folder/report.zip', 'folder\\report.zip', 'C:report.zip', '.', '..', ' . ', ' .. ']) {
      const path = DevProductionArtifactSchema.safeParse({ ...artifact, fileName });
      expect(path.success).toBe(false);
    }
  });

  it('rejects controls and overlong metadata', () => {
    for (const control of ['\u0000', '\u001f', '\n', '\r', '\t', '\u007f', '\u0085', '\u009f']) {
      const fileName = `report${control}.zip`;
      const controlled = DevProductionArtifactSchema.safeParse({ ...artifact, fileName });
      expect(controlled.success).toBe(false);
    }
    for (const metadata of [{ fileName: 'a'.repeat(181) }, { displayName: 'b'.repeat(161) }]) {
      const oversized = DevProductionArtifactSchema.safeParse({ ...artifact, ...metadata });
      expect(oversized.success).toBe(false);
    }
  });

  it('rejects unknown artifact properties', () => {
    const unknown = { ...artifact, fileName: 'consegna.zip', displayName: 'Consegna', extra: true };
    expect(DevProductionArtifactSchema.safeParse(unknown).success).toBe(false);
    expect(DevProductionResultSchema.safeParse({ ...result, artifacts: [unknown] }).success).toBe(false);
    expect(DevProductionArtifactChunkSchema.safeParse({ ...chunk, artifact: unknown }).success).toBe(false);
  });
});
