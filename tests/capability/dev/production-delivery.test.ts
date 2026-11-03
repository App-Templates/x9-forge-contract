import { describe, expect, it } from 'vitest';
import { DevProductionArtifactSchema, DevProductionResultSchema as schema } from '../../../src/capability/dev/index.js';
import { getDevProductionResultContract } from '../../../src/http/endpoints/internal-dev-production.js';

const artifact = { artifactRef: 'artifact-main', mediaType: 'application/zip', bytes: 128, sha256: 'b'.repeat(64) };
const base = {
  scope: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' },
  jobId: 'job-1', requestId: 'request_12345678', projectId: 'project-1', sessionId: 'session-1',
  productKind: 'code', reportVersion: 1, reportDigest: 'a'.repeat(64),
  finishedAt: '2026-10-16T01:02:03Z',
};
const success = { ...base, status: 'succeeded', artifacts: [artifact], verification: { kind: 'tests', passed: 1, total: 1 } };
const delivery = { summary: 'Open the project', instructions: 'Open index.html.', primaryArtifactRef: artifact.artifactRef };
const accepts = (patch: Record<string, unknown>) => schema.safeParse({ ...success, delivery: { ...delivery, ...patch } }).success;

describe('bridge226', () => {
  it('roundtrips delivery through finished response', () => {
    const response = getDevProductionResultContract.responseSchema.parse(JSON.parse(JSON.stringify({
      status: 'finished', result: { ...success, artifacts: [{ ...artifact, artifactRef: 'artifact-other' }, artifact], delivery },
    })));
    const retainsDelivery = response.status === 'finished' && response.result.status === 'succeeded'
      && JSON.stringify(response.result.delivery) === JSON.stringify(delivery);
    expect(retainsDelivery).toBe(true);
    const trimmed = schema.parse({ ...success, delivery: { ...delivery, summary: ' \n Open the project \t ' } });
    const trimsSummary = trimmed.status === 'succeeded' && trimmed.delivery?.summary === delivery.summary;
    expect(trimsSummary).toBe(true);
    expect(schema.options[0].shape.delivery.unwrap().shape.primaryArtifactRef).toBe(DevProductionArtifactSchema.shape.artifactRef);
    const rejectsExtra = accepts({ publish: true });
    expect(rejectsExtra).toBe(false);
    for (const key of ['summary', 'instructions', 'primaryArtifactRef']) {
      expect(accepts({ [key]: undefined })).toBe(false);
    }
  });

  it('preserves multiline instructions exactly', () => {
    const instructions = '  Open the archive.\r\n\r\n  Run the local preview.\n\tKeep these spaces.  \n';
    const parsed = schema.parse({ ...success, delivery: { ...delivery, instructions } });
    const preservesInstructions = parsed.status === 'succeeded' && parsed.delivery?.instructions === instructions;
    expect(preservesInstructions).toBe(true);
    const response = getDevProductionResultContract.responseSchema.parse({ status: 'finished', result: parsed });
    expect(response).toEqual({ status: 'finished', result: { ...success, delivery: { ...delivery, instructions } } });
  });

  it('accepts legacy success without delivery', () => {
    const legacy = schema.safeParse(success);
    expect(legacy.success).toBe(true);
    if (!legacy.success) throw new Error('Legacy success rejected');
    const hasDelivery = Object.hasOwn(legacy.data, 'delivery');
    expect(hasDelivery).toBe(false);
    expect(getDevProductionResultContract.responseSchema.parse({ status: 'finished', result: success })).toEqual({ status: 'finished', result: success });
  });

  it('rejects empty or overlong delivery text', () => {
    const emptySummary = accepts({ summary: '' });
    expect(emptySummary).toBe(false);
    expect(accepts({ summary: ' \n\t' })).toBe(false);
    const longSummary = accepts({ summary: 's'.repeat(1001) });
    expect(longSummary).toBe(false);
    const shortInstructions = accepts({ instructions: 'x' });
    expect(shortInstructions).toBe(true);
    expect(accepts({ instructions: '' })).toBe(false);
    const longInstructions = accepts({ instructions: 'i'.repeat(8001) });
    expect(longInstructions).toBe(false);
    const blankInstructions = accepts({ instructions: ' \r\n\t' });
    expect(blankInstructions).toBe(false);
    expect(accepts({ summary: 's', instructions: 'i'.repeat(8000) })).toBe(true);
    expect(accepts({ summary: 's'.repeat(1000) })).toBe(true);
  });

  it('rejects missing or duplicate primary artifact', () => {
    const missingPrimary = accepts({ primaryArtifactRef: 'artifact-foreign' });
    expect(missingPrimary).toBe(false);
    const duplicatePrimary = schema.safeParse({ ...success, artifacts: [artifact, { ...artifact, mediaType: 'text/plain' }], delivery }).success;
    expect(duplicatePrimary).toBe(false);
    expect(accepts({ primaryArtifactRef: '' })).toBe(false);
    expect(accepts({ primaryArtifactRef: undefined })).toBe(false);
    expect(schema.safeParse({ ...success, artifacts: [artifact, { ...artifact, artifactRef: 'other' }, { ...artifact, artifactRef: 'other' }], delivery }).success).toBe(true);
  });

  it('rejects delivery on unsuccessful results', () => {
    for (const status of ['failed', 'blocked', 'cancelled', 'uncertain']) {
      const terminal = { ...base, status, reason: 'Execution stopped.' };
      expect(schema.safeParse(terminal).success).toBe(true);
      expect(schema.safeParse({ ...terminal, delivery }).success).toBe(false);
      expect(getDevProductionResultContract.responseSchema.safeParse({ status: 'finished', result: { ...terminal, delivery } }).success).toBe(false);
    }
  });
});
