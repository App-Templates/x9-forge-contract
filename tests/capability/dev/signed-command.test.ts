import { describe, expect, it } from 'vitest';
import {
  canonicalizeDevSignedCommandV2,
  DEV_SIGNED_COMMAND_V2_DOMAIN,
  DevSignedCommandV2Schema,
} from '../../../src/capability/dev/signed-command.js';

const valid = {
  version: 2 as const,
  domain: DEV_SIGNED_COMMAND_V2_DOMAIN,
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  agentId: 'agent-1',
  boardId: 'board-1',
  computerId: 'computer-1',
  projectId: 'project-1',
  issueId: 'issue-1',
  command: 'status' as const,
  configVersion: 0,
  keyVersion: 1,
  requestId: 'request-1',
  nonce: '0123456789abcdef',
  expiresAt: '2026-10-14T12:00:00.000Z',
};

const scopeFields = ['tenantId', 'ownerId', 'agentId', 'boardId', 'computerId', 'projectId', 'issueId'] as const;

function assertScopeBound(canonicalize: typeof canonicalizeDevSignedCommandV2, field: typeof scopeFields[number]) {
  expect(canonicalize({ ...valid, [field]: `${valid[field]}-changed` }))
    .not.toBe(canonicalize(valid));
}

describe('DevSignedCommandV2', () => {
  it('accepts a valid message and normalizes an absent digest to null', () => {
    expect(DevSignedCommandV2Schema.parse(valid)).toEqual({ ...valid, reportDigest: null });
    expect(canonicalizeDevSignedCommandV2(valid)).toBe(canonicalizeDevSignedCommandV2({ ...valid, reportDigest: null }));
  });

  it('matches literal canonical vectors independent of insertion order', () => {
    expect(canonicalizeDevSignedCommandV2(valid)).toBe('{"agentId":"agent-1","boardId":"board-1","command":"status","computerId":"computer-1","configVersion":0,"domain":"x9.cap-dev.command","expiresAt":"2026-10-14T12:00:00.000Z","issueId":"issue-1","keyVersion":1,"nonce":"0123456789abcdef","ownerId":"owner-1","projectId":"project-1","reportDigest":null,"requestId":"request-1","tenantId":"tenant-1","version":2}');
    const withDigest = {
      ...valid,
      command: 'report' as const,
      projectId: 'progetto-caffè',
      reportDigest: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    };
    const expected = '{"agentId":"agent-1","boardId":"board-1","command":"report","computerId":"computer-1","configVersion":0,"domain":"x9.cap-dev.command","expiresAt":"2026-10-14T12:00:00.000Z","issueId":"issue-1","keyVersion":1,"nonce":"0123456789abcdef","ownerId":"owner-1","projectId":"progetto-caffè","reportDigest":"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef","requestId":"request-1","tenantId":"tenant-1","version":2}';
    expect(canonicalizeDevSignedCommandV2(withDigest)).toBe(expected);
    expect(canonicalizeDevSignedCommandV2({ reportDigest: withDigest.reportDigest, ...valid, command: 'report', projectId: 'progetto-caffè' })).toBe(expected);
  });

  it.each(scopeFields)('binds scope field %s', (field) => {
    assertScopeBound(canonicalizeDevSignedCommandV2, field);
  });

  it('detects the mutation that omits computerId', () => {
    const omitComputerId: typeof canonicalizeDevSignedCommandV2 = (msg) => {
      const parsed = DevSignedCommandV2Schema.parse(msg);
      return JSON.stringify(Object.fromEntries(Object.entries(parsed)
        .filter(([key]) => key !== 'computerId')
        .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)));
    };
    assertScopeBound(canonicalizeDevSignedCommandV2, 'computerId');
    expect(() => assertScopeBound(omitComputerId, 'computerId')).toThrow();
  });

  it.each(['status', 'plan', 'start', 'stop', 'report'])('accepts command %s', (command) => {
    expect(DevSignedCommandV2Schema.safeParse({ ...valid, command }).success).toBe(true);
  });

  it.each([
    { extra: true }, { version: 1 }, { command: 'execute' }, { domain: 'other' },
    { configVersion: -1 }, { configVersion: 0.5 }, { keyVersion: 0 }, { keyVersion: 1.5 },
    { requestId: '' }, { nonce: '0123456789abcde' }, { expiresAt: 'tomorrow' },
    { reportDigest: 'a'.repeat(63) }, { reportDigest: 'a'.repeat(65) }, { reportDigest: 'g'.repeat(64) },
    ...scopeFields.map((field) => ({ [field]: '' })),
    ...scopeFields.map((field) => ({ [field]: undefined })),
  ])('rejects invalid payload %j', (patch) => {
    const payload = { ...valid, ...patch };
    expect(DevSignedCommandV2Schema.safeParse(payload).success).toBe(false);
  });
});
