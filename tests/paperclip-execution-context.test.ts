import { describe, expect, it } from 'vitest';
import * as paperclip from '../src/capability/paperclip/index.js';
import * as capability from '../src/capability/index.js';
import {
  PaperclipExecutionContextSchema, PaperclipNativeRunReceiptSchema,
  PaperclipAdmissionRequestSchema, PaperclipAdmissionResponseSchema,
  PaperclipAdmissionPreparedSchema, PaperclipAdmissionMetadataSchema, PaperclipNativeRunIdentitySchema,
  matchesPaperclipExecution, isPaperclipHostWindowOpen, matchesPaperclipReceipt,
  PAPERCLIP_API_KEY, PAPERCLIP_X9_ADAPTER_SECRET, PAPERCLIP_TOOLS,
} from '../src/capability/paperclip/index.js';
import { PaperclipToolCallRequestSchema, ToolCallRequestSchema, toPaperclipToolCallScope } from '../src/capability/tool-call.js';
import {
  InternalAgentTurnRequestSchema, InternalAgentTurnResponseSchema,
  internalAgentTurnContract, internalAgentTurnPath, createBridgeClient,
} from '../src/http/index.js';

const ids = {
  companyId: '00000000-0000-4000-8000-000000000001',
  paperclipAgentId: '00000000-0000-4000-8000-000000000002',
  runId: '00000000-0000-4000-8000-000000000003',
  issueId: '00000000-0000-4000-8000-000000000004',
};
const otherId = '00000000-0000-4000-8000-000000000009';
const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'agent-a' };
const metadata = {
  ...ids, admissionId: '00000000-0000-4000-8000-000000000005', challenge: 'a'.repeat(64),
  hostIssuedAt: '2026-10-09T17:00:00.000Z', hostDeadlineAt: '2026-10-09T17:01:00.000Z',
};
const receipt = { kind: 'paperclip.x9-run-binding', schemaVersion: 1, ...metadata };
const prepared = { phase: 'prepared', ...metadata };
const execution = {
  capability: 'paperclip', source: 'x9_native_admission', scope, configVersion: 2,
  provisioningRevision: 3, sessionId: 'host-session-a', ...metadata,
};
const readback = {
  scope, appliedVersion: 2, enabled: true, provisioningRevision: 3,
  unitId: 'unit-a', callerRoleRef: 'developer', companyId: ids.companyId, paperclipAgentId: ids.paperclipAgentId,
  roleAgents: {}, provenance: { source: 'native_operator_inventory', inventoryFingerprint: 'b'.repeat(64) },
  registryFingerprint: 'c'.repeat(64), configFingerprint: 'd'.repeat(64),
};
const legacy = { callId: 'call-a', tool: 'memory_recall', input: {}, agentId: 'agent-a', sessionId: 'old-session' };
const call = {
  ...legacy, tool: 'paperclip_queue', tenantId: scope.tenantId, ownerId: scope.ownerId,
  sessionId: execution.sessionId, configVersion: 2, executionContext: execution,
  credentials: { [PAPERCLIP_API_KEY]: 'synthetic-native-value' },
};
const turn = { channelId: 'paperclip', sessionId: 'caller-correlation', message: 'Work on the assigned issue' };
const prepare = { phase: 'prepare', native: ids };
const commit = { phase: 'commit', admissionId: metadata.admissionId };
const emptyReply = { ok: true, reply: '', updatedHistory: [] };

it('exports the canonical server execution context', () => {
  expect(paperclip).toHaveProperty('PaperclipExecutionContextSchema');
});

describe('native observations, immutable receipt and host-only budget', () => {
  it('roundtrips exact native identities and the required receipt challenge', () => {
    expect(PaperclipNativeRunIdentitySchema.parse(ids)).toEqual(ids);
    expect(PaperclipNativeRunReceiptSchema.parse(receipt)).toEqual(receipt);
    expect(PaperclipExecutionContextSchema.parse(execution)).toEqual(execution);
  });
  it.each(['companyId', 'paperclipAgentId', 'runId', 'issueId'] as const)('rejects missing or non-native %s', field => {
    const missing: Record<string, unknown> = { ...ids };
    delete missing[field];
    expect(PaperclipNativeRunIdentitySchema.safeParse(missing).success).toBe(false);
    expect(PaperclipNativeRunIdentitySchema.safeParse({ ...ids, [field]: 'agent-slug' }).success).toBe(false);
    expect(PaperclipExecutionContextSchema.safeParse({ ...execution, [field]: 'agent-slug' }).success).toBe(false);
  });
  it.each(['admissionId', 'challenge', 'hostIssuedAt', 'hostDeadlineAt'] as const)('requires immutable metadata %s in receipt and execution', field => {
    const badReceipt: Record<string, unknown> = { ...receipt };
    const badExecution: Record<string, unknown> = { ...execution };
    delete badReceipt[field]; delete badExecution[field];
    expect(PaperclipNativeRunReceiptSchema.safeParse(badReceipt).success).toBe(false);
    expect(PaperclipExecutionContextSchema.safeParse(badExecution).success).toBe(false);
    expect(PaperclipAdmissionPreparedSchema.safeParse({ ...prepared, [field]: undefined }).success).toBe(false);
  });
  it.each(['', ' ', 'a'.repeat(63), 'a'.repeat(65), 'A'.repeat(64), 'g'.repeat(64)])('rejects malformed challenge %s', challenge => {
    expect(PaperclipNativeRunReceiptSchema.safeParse({ ...receipt, challenge }).success).toBe(false);
    expect(PaperclipExecutionContextSchema.safeParse({ ...execution, challenge }).success).toBe(false);
  });
  it('requires strict native tuple and host metadata with ordered ISO timestamps', () => {
    expect(PaperclipNativeRunIdentitySchema.safeParse({ ...ids, wakeReason: 'synthetic' }).success).toBe(false);
    expect(PaperclipAdmissionMetadataSchema.parse(metadata)).toEqual(metadata);
    expect(PaperclipAdmissionMetadataSchema.safeParse({ ...metadata, nativeLease: 'synthetic' }).success).toBe(false);
    expect(PaperclipAdmissionMetadataSchema.safeParse({ ...metadata, hostDeadlineAt: metadata.hostIssuedAt }).success).toBe(false);
    expect(PaperclipNativeRunReceiptSchema.safeParse({ ...receipt, hostIssuedAt: 'October 9, 2026 17:00:00 GMT' }).success).toBe(false);
    expect(PaperclipAdmissionPreparedSchema.safeParse({ ...prepared, scope }).success).toBe(false);
    expect(PaperclipAdmissionResponseSchema.safeParse({ ...prepared, phase: 'retry' }).success).toBe(false);
  });
  it('rejects invalid admission UUID without interpreting it as correlation text', () => {
    expect(PaperclipNativeRunReceiptSchema.safeParse({ ...receipt, admissionId: 'caller-id' }).success).toBe(false);
    expect(PaperclipAdmissionPreparedSchema.safeParse({ ...prepared, admissionId: 'caller-id' }).success).toBe(false);
  });
  it('rejects a foreign receipt protocol and schema version', () => {
    expect(PaperclipNativeRunReceiptSchema.safeParse({ ...receipt, kind: 'filiera.worker-binding' }).success).toBe(false);
    expect(PaperclipNativeRunReceiptSchema.safeParse({ ...receipt, schemaVersion: 2 }).success).toBe(false);
  });
  it.each(['hostIssuedAt', 'hostDeadlineAt'] as const)('rejects malformed %s', field => {
    expect(PaperclipExecutionContextSchema.safeParse({ ...execution, [field]: 'not-a-date' }).success).toBe(false);
    expect(PaperclipNativeRunReceiptSchema.safeParse({ ...receipt, [field]: 'not-a-date' }).success).toBe(false);
  });
  it.each([metadata.hostIssuedAt, '2026-10-09T16:59:59.999Z'])('rejects non-positive host window %s', hostDeadlineAt => {
    expect(PaperclipNativeRunReceiptSchema.safeParse({ ...receipt, hostDeadlineAt }).success).toBe(false);
    expect(PaperclipExecutionContextSchema.safeParse({ ...execution, hostDeadlineAt }).success).toBe(false);
    expect(PaperclipAdmissionPreparedSchema.safeParse({ ...prepared, hostDeadlineAt }).success).toBe(false);
  });
  it('accepts equivalent offset timestamps with a positive interval', () => {
    expect(PaperclipExecutionContextSchema.safeParse({ ...execution, hostIssuedAt: '2026-10-09T19:00:00+02:00' }).success).toBe(true);
  });
  it.each(['credentials', 'PAPERCLIP_RUN_ID', 'nativeDeadlineAt', 'lease', 'wakeReason', 'nonce'])('rejects receipt/execution authority extension %s', field => {
    expect(PaperclipNativeRunReceiptSchema.safeParse({ ...receipt, [field]: 'synthetic' }).success).toBe(false);
    expect(PaperclipExecutionContextSchema.safeParse({ ...execution, [field]: 'synthetic' }).success).toBe(false);
  });
  it.each(['capability', 'source', 'scope', 'configVersion', 'provisioningRevision', 'sessionId'] as const)('requires server execution field %s', field => {
    expect(PaperclipExecutionContextSchema.safeParse({ ...execution, [field]: undefined }).success).toBe(false);
  });
  it('rejects invented source, capability and unsafe server session', () => {
    expect(PaperclipExecutionContextSchema.safeParse({ ...execution, source: 'browser' }).success).toBe(false);
    expect(PaperclipExecutionContextSchema.safeParse({ ...execution, capability: 'memory' }).success).toBe(false);
    expect(PaperclipExecutionContextSchema.safeParse({ ...execution, sessionId: '../session' }).success).toBe(false);
  });
  it.each(['configVersion', 'provisioningRevision'] as const)('rejects zero, fractional and negative %s', field => {
    for (const value of [0, -1, 1.5]) expect(PaperclipExecutionContextSchema.safeParse({ ...execution, [field]: value }).success).toBe(false);
  });
  it('requires strict complete scope in execution metadata', () => {
    expect(PaperclipExecutionContextSchema.safeParse({ ...execution, scope: { ...scope, ownerId: undefined } }).success).toBe(false);
    expect(PaperclipExecutionContextSchema.safeParse({ ...execution, scope: { ...scope, userId: 'person' } }).success).toBe(false);
  });
  it('checks inclusive issuance and exclusive host deadline without attesting native lifetime', () => {
    expect(isPaperclipHostWindowOpen(execution, Date.parse(metadata.hostIssuedAt))).toBe(true);
    expect(isPaperclipHostWindowOpen(execution, Date.parse(metadata.hostDeadlineAt) - 1)).toBe(true);
    expect(isPaperclipHostWindowOpen(execution, Date.parse(metadata.hostIssuedAt) - 1)).toBe(false);
    expect(isPaperclipHostWindowOpen(execution, Date.parse(metadata.hostDeadlineAt))).toBe(false);
  });
  it('denies invalid clocks/records instead of using a default clock', () => {
    for (const now of [NaN, Infinity, -Infinity]) expect(isPaperclipHostWindowOpen(execution, now)).toBe(false);
    expect(isPaperclipHostWindowOpen({}, Date.parse(metadata.hostIssuedAt))).toBe(false);
  });
});

describe('two-phase admission over the existing per-agent turn endpoint', () => {
  it('roundtrips prepare/commit and prepared/committed metadata', () => {
    expect(PaperclipAdmissionRequestSchema.parse(prepare)).toEqual(prepare);
    expect(PaperclipAdmissionRequestSchema.parse(commit)).toEqual(commit);
    expect(PaperclipAdmissionResponseSchema.parse(prepared)).toEqual(prepared);
    const committed = { phase: 'committed', admissionId: metadata.admissionId, runId: ids.runId };
    expect(PaperclipAdmissionResponseSchema.parse(committed)).toEqual(committed);
  });
  it.each(['scope', 'configVersion', 'executionContext', 'challenge', 'admissionId'])('prepare rejects caller authority %s', field => {
    expect(PaperclipAdmissionRequestSchema.safeParse({ ...prepare, [field]: 'synthetic' }).success).toBe(false);
  });
  it.each(['scope', 'configVersion', 'executionContext', 'challenge', 'native', 'runId'])('commit rejects caller authority %s', field => {
    expect(PaperclipAdmissionRequestSchema.safeParse({ ...commit, [field]: 'synthetic' }).success).toBe(false);
  });
  it('requires native prepare tuple and commit UUID and denies invented phases', () => {
    expect(PaperclipAdmissionRequestSchema.safeParse({ phase: 'prepare' }).success).toBe(false);
    expect(PaperclipAdmissionRequestSchema.safeParse({ ...prepare, native: { ...ids, scope } }).success).toBe(false);
    expect(PaperclipAdmissionRequestSchema.safeParse({ phase: 'commit' }).success).toBe(false);
    expect(PaperclipAdmissionRequestSchema.safeParse({ ...commit, admissionId: 'caller-selected' }).success).toBe(false);
    expect(PaperclipAdmissionRequestSchema.safeParse({ phase: 'retry', admissionId: metadata.admissionId }).success).toBe(false);
  });
  it('preserves native request/response metadata through existing contract and exports', () => {
    expect(internalAgentTurnContract.method).toBe('POST');
    expect(internalAgentTurnContract.authType).toBe('secret');
    expect(internalAgentTurnPath('agent-a')).toBe('/internal/agents/agent-a/turn');
    expect(InternalAgentTurnRequestSchema.parse({ ...turn, paperclipAdmission: prepare }).paperclipAdmission).toEqual(prepare);
    expect(InternalAgentTurnRequestSchema.parse({ ...turn, paperclipAdmission: commit }).paperclipAdmission).toEqual(commit);
    expect(InternalAgentTurnResponseSchema.parse({ ...emptyReply, paperclipAdmission: prepared }).paperclipAdmission).toEqual(prepared);
  });
  it.each(['turn', 'history', 'attachment'])('denies mixed native admission and %s', field => {
    const mixed: Record<string, unknown> = {
      turn: { kind: 'prepare', turnId: 'voice-turn-a', text: '' }, history: [], attachment: { type: 'photo', fileUrl: 'https://example.test/photo' },
    };
    expect(InternalAgentTurnRequestSchema.safeParse({ ...turn, [field]: mixed[field] }).success).toBe(true);
    for (const admission of [prepare, commit]) {
      expect(InternalAgentTurnRequestSchema.safeParse({ ...turn, paperclipAdmission: admission, [field]: mixed[field] }).success).toBe(false);
    }
  });
  it('does not silently strip malformed optional admission metadata', () => {
    expect(InternalAgentTurnRequestSchema.safeParse({ ...turn, paperclipAdmission: { phase: 'prepare' } }).success).toBe(false);
    expect(InternalAgentTurnResponseSchema.safeParse({ ...emptyReply, paperclipAdmission: { phase: 'prepared' } }).success).toBe(false);
  });
  it('prepared response cannot pretend to have executed a model turn', () => {
    expect(InternalAgentTurnResponseSchema.safeParse({ ...emptyReply, paperclipAdmission: prepared, reply: 'Model output' }).success).toBe(false);
    expect(InternalAgentTurnResponseSchema.safeParse({ ...emptyReply, paperclipAdmission: prepared, updatedHistory: [{ role: 'assistant', content: 'Model output' }] }).success).toBe(false);
    expect(InternalAgentTurnResponseSchema.safeParse({ ...emptyReply, paperclipAdmission: prepared, moveId: 'move-a' }).success).toBe(false);
  });
  it.each(['lead', 'note'])('prepared response rejects otherwise valid voice %s', field => {
    expect(InternalAgentTurnResponseSchema.safeParse({ ...emptyReply, [field]: 'Voice metadata' }).success).toBe(true);
    expect(InternalAgentTurnResponseSchema.safeParse({ ...emptyReply, paperclipAdmission: prepared, [field]: 'Voice metadata' }).success).toBe(false);
  });
  it('rejects committed response without native run identity and metadata extensions', () => {
    expect(PaperclipAdmissionResponseSchema.safeParse({ phase: 'committed', admissionId: metadata.admissionId }).success).toBe(false);
    expect(PaperclipAdmissionResponseSchema.safeParse({ phase: 'committed', admissionId: metadata.admissionId, runId: 'runtime-slug' }).success).toBe(false);
    expect(PaperclipAdmissionResponseSchema.safeParse({ ...prepared, credentials: {} }).success).toBe(false);
    expect(PaperclipAdmissionResponseSchema.safeParse({ phase: 'committed', admissionId: metadata.admissionId, runId: ids.runId, challenge: metadata.challenge }).success).toBe(false);
  });
  it('legacy request/response remains valid without native metadata', () => {
    expect(InternalAgentTurnRequestSchema.parse({ ...turn, history: [] })).toEqual({ ...turn, history: [] });
    expect(InternalAgentTurnResponseSchema.parse({ ok: true, reply: 'Legacy', updatedHistory: [] })).toEqual({ ok: true, reply: 'Legacy', updatedHistory: [] });
  });
  it('existing bridge client preserves the protocol with canonical header and response parsing', async () => {
    const original = globalThis.fetch;
    const captured: { url?: string; body?: unknown; headers?: HeadersInit } = {};
    try {
      globalThis.fetch = (async (url: unknown, init?: RequestInit) => {
        captured.url = String(url); captured.body = JSON.parse(String(init?.body)); captured.headers = init?.headers;
        return new Response(JSON.stringify({ ...emptyReply, paperclipAdmission: prepared }), { status: 200 });
      }) as typeof fetch;
      const client = createBridgeClient({ baseUrl: 'http://synthetic.invalid', auth: { 'X-Internal-Secret': 'synthetic-adapter-value' } });
      const response = await client.internalAgentTurn('agent-a', { ...turn, paperclipAdmission: prepare });
      expect(captured.url).toBe('http://synthetic.invalid/internal/agents/agent-a/turn');
      expect(captured.body).toEqual({ ...turn, paperclipAdmission: prepare });
      expect((captured.headers as Record<string, string>)['X-Internal-Secret']).toBe('synthetic-adapter-value');
      expect(response.paperclipAdmission).toEqual(prepared);
    } finally { globalThis.fetch = original; }
  });
});

describe('actual binding correspondence and minimal dispatch projection', () => {
  it('matches installed identity/revisions and projects only server admission fields', () => {
    expect(matchesPaperclipExecution(readback, execution)).toBe(true);
    expect(toPaperclipToolCallScope(readback, execution)).toEqual({ ...scope, sessionId: execution.sessionId, configVersion: 2, executionContext: execution });
    expect(toPaperclipToolCallScope(readback, execution)).not.toHaveProperty('credentials');
  });
  it.each(['tenantId', 'ownerId', 'agentId'] as const)('rejects mismatched applied %s', field => {
    const different = { ...execution, scope: { ...scope, [field]: 'foreign' } };
    expect(matchesPaperclipExecution(readback, different)).toBe(false);
    expect(() => toPaperclipToolCallScope(readback, different)).toThrow('Paperclip binding mismatch');
  });
  it.each(['companyId', 'paperclipAgentId'] as const)('rejects mismatched native %s', field => {
    expect(matchesPaperclipExecution(readback, { ...execution, [field]: otherId })).toBe(false);
  });
  it.each(['configVersion', 'provisioningRevision'] as const)('rejects mismatched loaded %s', field => {
    expect(matchesPaperclipExecution(readback, { ...execution, [field]: 4 })).toBe(false);
  });
  it('returns an independent parsed execution snapshot without mutating its source', () => {
    const projected = toPaperclipToolCallScope(readback, execution);
    projected.executionContext!.scope.agentId = 'other-agent';
    expect(execution.scope.agentId).toBe('agent-a');
  });
  it('denies disabled or malformed binding/execution', () => {
    expect(matchesPaperclipExecution({ ...readback, enabled: false }, execution)).toBe(false);
    expect(matchesPaperclipExecution({}, execution)).toBe(false);
    expect(matchesPaperclipExecution(readback, {})).toBe(false);
  });
});

describe('Paperclip guard keeps run authority out of ordinary legacy envelopes', () => {
  it('publishes key names only; no run credential constant', () => {
    expect(PAPERCLIP_API_KEY).toBe('PAPERCLIP_API_KEY');
    expect(PAPERCLIP_X9_ADAPTER_SECRET).toBe('PAPERCLIP_X9_ADAPTER_SECRET');
    expect(paperclip).not.toHaveProperty('PAPERCLIP_RUN_ID');
  });
  it('legacy envelopes remain valid while Paperclip requires native admission', () => {
    expect(ToolCallRequestSchema.parse(legacy)).toEqual(legacy);
    expect(PaperclipToolCallRequestSchema.safeParse({ ...call, executionContext: undefined }).success).toBe(false);
    expect(PaperclipToolCallRequestSchema.safeParse({ ...call, configVersion: undefined }).success).toBe(false);
    expect(PaperclipToolCallRequestSchema.parse(call)).toEqual(call);
  });
  it.each(Object.values(PAPERCLIP_TOOLS))('requires the canonical tool %s', tool => {
    expect(PaperclipToolCallRequestSchema.safeParse({ ...call, tool }).success).toBe(true);
  });
  it.each(['memory_recall', 'paperclip_cancel', 'paperclip_queue_extra'])('denies non-canonical tool %s', tool => {
    expect(PaperclipToolCallRequestSchema.safeParse({ ...call, tool }).success).toBe(false);
  });
  it.each(['tenantId', 'ownerId', 'agentId', 'sessionId', 'configVersion'] as const)('denies dispatch mismatch %s', field => {
    expect(PaperclipToolCallRequestSchema.safeParse({ ...call, [field]: field === 'configVersion' ? 9 : 'foreign' }).success).toBe(false);
  });
  it.each(['tenantId', 'ownerId'] as const)('requires complete dispatch %s', field => {
    expect(PaperclipToolCallRequestSchema.safeParse({ ...call, [field]: undefined }).success).toBe(false);
  });
  it.each([undefined, {}, { PAPERCLIP_API_KEY: '' }, { PAPERCLIP_API_KEY: ' ' }, { OTHER_API_KEY: 'synthetic' },
    { PAPERCLIP_API_KEY: 'synthetic', PAPERCLIP_RUN_ID: ids.runId },
    { PAPERCLIP_API_KEY: 'synthetic', PAPERCLIP_X9_ADAPTER_SECRET: 'synthetic' },
    { PAPERCLIP_API_KEY: 'synthetic', INTERNAL_SECRET: 'synthetic' }])('requires only own native key and denies ambient/run/adapter values %#', credentials => {
    expect(PaperclipToolCallRequestSchema.safeParse({ ...call, credentials }).success).toBe(false);
  });
  it('rejects malformed execution/context revision rather than stripping new metadata', () => {
    expect(ToolCallRequestSchema.safeParse({ ...legacy, executionContext: {} }).success).toBe(false);
    expect(ToolCallRequestSchema.safeParse({ ...legacy, configVersion: 0 }).success).toBe(false);
    expect(PaperclipToolCallRequestSchema.safeParse({ ...call, runId: ids.runId }).success).toBe(false);
  });
});


describe('exact immutable receipt correspondence', () => {
  it('matches only exact echoed host/native metadata', () => {
    expect(matchesPaperclipReceipt(prepared, receipt)).toBe(true);
    expect(matchesPaperclipReceipt({}, receipt)).toBe(false);
    expect(matchesPaperclipReceipt(prepared, {})).toBe(false);
  });
  it.each(['admissionId', 'challenge', 'companyId', 'paperclipAgentId', 'runId', 'issueId', 'hostIssuedAt', 'hostDeadlineAt'] as const)(
    'denies a valid but foreign %s', field => {
      const replacement = field === 'challenge' ? 'f'.repeat(64)
        : field === 'hostIssuedAt' ? '2026-10-09T17:00:00.001Z'
          : field === 'hostDeadlineAt' ? '2026-10-09T17:01:00.001Z' : otherId;
      const changed = { ...receipt, [field]: replacement };
      expect(PaperclipNativeRunReceiptSchema.safeParse(changed).success).toBe(true);
      expect(matchesPaperclipReceipt(prepared, changed)).toBe(false);
    },
  );
});

it.each([['PaperclipToolCallRequestSchema', PaperclipToolCallRequestSchema], ['toPaperclipToolCallScope', toPaperclipToolCallScope]] as const)(
  'exports %s from the public capability barrel', (name, value) => {
    expect(capability).toHaveProperty(name, value);
  },
);
