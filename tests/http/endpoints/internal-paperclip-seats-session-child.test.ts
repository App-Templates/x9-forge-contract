import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  devSessionAssignmentCanonicalJson, renderDevSessionBlock,
} from '../../../src/capability/dev/session-assignment.js';
import { PaperclipIncaricoCorpoSchema } from '../../../src/capability/paperclip-protocollo/wire-creazione.js';
import * as seats from '../../../src/http/endpoints/internal-paperclip-seats.js';

const identity = { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 };
const issueId = '11111111-1111-4111-8111-111111111111';
const executorAgentId = '22222222-2222-4222-8222-222222222222';
const assignment = {
  version: 1, tenantId: 'tenant-1', ownerId: '7', organizationId: 'good-choice', companyId: 'good-choice',
  projectId: 'good-choice-app', businessUnit: { slug: 'sviluppo' }, requestedBy: identity,
  productKind: 'code', title: 'Modulo A: scansione prodotto', task: 'Build the scanning module.',
  miniPlan: 'Structure, implement, test.', materials: [],
  destination: { repo: 'App-Templates/goodchoice-backtest' }, createdAt: '2026-10-27T15:00:00+01:00',
};

function block(raw = assignment): string {
  const digest = createHash('sha256').update(devSessionAssignmentCanonicalJson(raw)).digest('hex');
  return renderDevSessionBlock(raw, digest);
}

const request = {
  organizationId: 'good-choice', identity, sourceRunId: 'chief-run-1',
  sessionKey: 'dev-session:GOO-214:1', title: assignment.title, description: block(),
};

describe('session child contract', () => {
  it('s8037_richiesta: validates the signed block, trusted context, key and larger description', () => {
    const contract = seats.internalPaperclipSeatSessionChildContract;
    expect(contract).toBeDefined();
    const schema = contract.bodySchema;
    expect(schema.parse(request)).toEqual(request);
    for (const description of ['No block', `${block()}\n${block()}`, block().replace('```json', '```broken')]) {
      const result = schema.safeParse({ ...request, description });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues).toContainEqual(expect.objectContaining({ message: 'session_block_invalid' }));
    }
    for (const sessionKey of ['', 'dev-session:has spaces', 'wrong:GOO-214', `dev-session:${'x'.repeat(244)}`]) {
      expect(schema.safeParse({ ...request, sessionKey }).success).toBe(false);
    }
    expect(schema.safeParse({ ...request, sessionKey: `dev-session:${'x'.repeat(243)}` }).success).toBe(true);
    const { sourceRunId: _run, ...withoutRun } = request;
    expect(schema.safeParse(withoutRun).success).toBe(false);
    expect(schema.safeParse({ ...request, extra: true }).success).toBe(false);
    expect(schema.safeParse({ ...request, identity: { runtimeAgentId: 'capo-sviluppo' } }).success).toBe(false);
    expect(schema.safeParse({ ...request, title: 'ab' }).success).toBe(false);
    expect(schema.safeParse({ ...request, description: 'x'.repeat(100001) }).success).toBe(false);
    const description = block({ ...assignment, task: 't'.repeat(20000), miniPlan: 'p'.repeat(20000) });
    expect(description.length).toBeGreaterThan(20000);
    expect(seats.DEV_SESSION_PAPERCLIP_DESCRIPTION_MAX).toBe(100000);
    expect(schema.safeParse({ ...request, description }).success).toBe(true);
    expect(PaperclipIncaricoCorpoSchema.safeParse({ title: request.title, description }).success).toBe(false);
  });

  it('s8037_risposta: every result has explicit rules for child and executor identifiers', () => {
    const schema = seats.internalPaperclipSeatSessionChildContract.responseSchema;
    const fields = { issueId, identifier: 'GOO-214', executorAgentId };
    const results = ['opened', 'duplicate', 'executor_missing', 'executor_ambiguous',
      'source_run_unknown', 'source_run_without_issue', 'source_issue_not_agents', 'source_issue_closed'];
    expect(seats.PAPERCLIP_SEAT_SESSION_CHILD_RESULTS).toEqual(results);
    for (const result of results) {
      if (result === 'opened' || result === 'duplicate') {
        expect(schema.safeParse({ result, ...fields }).success).toBe(true);
        for (const field of ['issueId', 'identifier', 'executorAgentId'] as const) {
          const { [field]: _missing, ...partial } = fields;
          expect(schema.safeParse({ result, ...partial }).success).toBe(false);
        }
        expect(schema.safeParse({ result, ...fields, identifier: 'R5' }).success).toBe(false);
        expect(schema.safeParse({ result, ...fields, executorAgentId: 'executor' }).success).toBe(false);
      } else {
        expect(schema.safeParse({ result }).success).toBe(true);
        for (const field of ['issueId', 'identifier', 'executorAgentId'] as const) {
          expect(schema.safeParse({ result, [field]: fields[field] }).success).toBe(false);
        }
      }
    }
    expect(schema.safeParse({ result: 'unknown' }).success).toBe(false);
    expect(schema.safeParse({ result: 'opened', ...fields, extra: true }).success).toBe(false);
  });

  it('s8037_corpo: uses company creation fields for parent, assignee and deduplication', () => {
    const contract = seats.internalPaperclipSeatSessionChildContract;
    expect(contract.method).toBe('POST');
    expect(contract.path).toBe('/internal/paperclip/seats/session-child');
    expect(contract.path).toBe(seats.INTERNAL_PAPERCLIP_SEAT_SESSION_CHILD_PATH);
    expect(contract.authType).toBe('secret');
    expect(contract.errorResponseSchema).toBe(seats.InternalPaperclipSeatWakeErrorResponseSchema);
    const input = contract.bodySchema.parse(request);
    const body = { title: input.title, description: input.description, parentId: issueId,
      assigneeAgentId: executorAgentId, status: 'todo', idempotencyKey: input.sessionKey };
    expect(PaperclipIncaricoCorpoSchema.parse(body)).toEqual(body);
  });

  it('s8037_storico: saved reply and native wake requests still parse on the same routes', () => {
    const reply = { organizationId: 'org-a',
      identity: { managementAgentId: 'capo-finanza', runtimeAgentId: 'capo-finanza', vaultAgentId: 42 },
      messageId: '<m1@example.invalid>' };
    expect(seats.internalPaperclipSeatReplyWakeContract.bodySchema.parse(reply)).toEqual(reply);
    const native = { scope: { tenantId: 't1', ownerId: 'o1', agentId: 'director-a' }, eventId: 'evt-1',
      organizationId: 'org-a', identity: { managementAgentId: 'director-a', runtimeAgentId: 'director-a', vaultAgentId: 7 },
      event: { kind: 'email', messageId: '<m1@example.invalid>', threadKey: '<t1@example.invalid>', mode: 'request',
        from: 'capo@example.invalid', subject: 'Richiesta', receivedAt: '2026-11-02T09:11:00.000Z', excerpt: 'Testo',
        attachments: [{ name: 'a.pdf', contentType: 'application/pdf', size: 10 }] } };
    expect(seats.internalPaperclipSeatNativeWakeContract.bodySchema.parse(native)).toEqual(native);
    expect(seats.INTERNAL_PAPERCLIP_SEAT_NATIVE_WAKE_PATH).toBe('/internal/paperclip/seats/native-wake');
    expect(seats.internalPaperclipSeatNativeWakeContract.path).toBe(seats.INTERNAL_PAPERCLIP_SEAT_NATIVE_WAKE_PATH);
  });
});
