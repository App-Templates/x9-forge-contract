import { describe, expect, it } from 'vitest';
import { AssetRefSchema, type AssetRef } from '../../src/organization/asset.js';
import {
  ASSET_VERSION_STATES,
  ASSET_VERSION_TRANSITIONS,
  AssetVersionFileSchema,
  AssetVersionLeadReviewSchema,
  AssetVersionProvenanceSchema,
  AssetVersionRecordSchema,
  assetVersionDecisionState,
  assetVersionTransitionAllowed,
  deriveAssetVersionStates,
  isLaterDecisionRequest,
  latestApprovedAssetVersion,
  type AssetVersionLeadReview,
  type AssetVersionRecord,
  type AssetVersionState,
} from '../../src/organization/asset-version.js';
import {
  DecisionOutcomeSchema,
  DecisionRequestSchema,
  type DecisionOutcome,
  type DecisionRequest,
} from '../../src/organization/decision-request.js';
import { ParticipantAgentIdentitySchema } from '../../src/organization/participant-binding.js';

const scope = { tenantId: 'tenant-goodchoice', organizationId: 'good-choice', projectId: 'orto-facile' };
const piece = { buSlug: 'design', key: 'design-calendario' };
const lead = ParticipantAgentIdentitySchema.parse({
  managementAgentId: 'bu-design-goodchoice', runtimeAgentId: 'agent-bu-design-goodchoice', vaultAgentId: 20,
});
const director = ParticipantAgentIdentitySchema.parse({
  managementAgentId: 'director-goodchoice', runtimeAgentId: 'agent-director-goodchoice', vaultAgentId: 1,
});
const repo = 'good-choice/orto-facile';
const commit = 'd'.repeat(40);
const referent = { kind: 'referent', email: 'referente@ortofacile.example' } as const;

function sessionAsset(sessionId: string, fingerprint: string): AssetRef {
  return AssetRefSchema.parse({
    assetId: 'asset-' + sessionId + '-calendario', sha256: fingerprint.repeat(64),
    name: 'calendario.pdf', mediaType: 'application/pdf', sizeBytes: 2048,
    origin: { kind: 'session', sessionId, repo, commit, path: 'design/calendario.pdf' },
    tenantId: scope.tenantId, companyId: 'orto-facile', projectId: scope.projectId,
    buSlug: piece.buSlug, createdAt: '2026-11-11T07:00:00Z',
  });
}

const r20 = sessionAsset('R20', 'a');
const r22 = sessionAsset('R22', 'b');
const r24 = sessionAsset('R24', 'c');

function fileOf(asset: AssetRef) {
  return AssetVersionFileSchema.parse({ assetId: asset.assetId, sha256: asset.sha256 });
}

function version(number: number, asset = r20, overrides: Partial<AssetVersionRecord> = {}): AssetVersionRecord {
  return AssetVersionRecordSchema.parse({
    ...scope, ...piece, version: number, files: [fileOf(asset)],
    provenance: { createdBy: lead, sessionId: 'R20', repo, commit, branch: 'consegna/20' },
    recordedAt: '2026-11-11T08:00:00Z', ...overrides,
  });
}

function request(
  record: AssetVersionRecord, requestId = 'dec_ef223ebd', createdAt = '2026-11-11T09:00:00Z',
): DecisionRequest {
  return DecisionRequestSchema.parse({
    requestId, tenantId: record.tenantId, organizationId: record.organizationId, projectId: record.projectId,
    subject: {
      kind: 'delivery', organizationId: record.organizationId, projectId: record.projectId,
      buSlug: record.buSlug, deliveryRef: record.files[0],
    },
    question: 'Approvi il calendario di Orto Facile?',
    options: [
      { optionId: 'approva', label: 'Approvo' },
      { optionId: 'richiedi-modifiche', label: 'Richiedi modifiche' },
    ],
    requestedBy: lead, addressedTo: referent, channel: 'email', createdAt,
  });
}

function answer(req: DecisionRequest, outcome: 'approved' | 'rejected' = 'approved'): DecisionOutcome {
  return DecisionOutcomeSchema.parse({
    requestId: req.requestId, subject: req.subject, decidedBy: referent,
    decidedAt: '2026-11-11T11:30:00Z', channel: 'email', sourceRef: 'message-' + req.requestId,
    // Saved approvals can carry this optionId, as in dec_ef223ebd. The outcome decides the state.
    ...(outcome === 'approved'
      ? { outcome, optionId: 'richiedi-modifiche' }
      : { outcome, reason: 'Rivedere la leggibilità del calendario.' }),
  });
}

function review(record: AssetVersionRecord, verdict: 'ok' | 'redo' = 'redo'): AssetVersionLeadReview {
  return AssetVersionLeadReviewSchema.parse({
    buSlug: record.buSlug, key: record.key, version: record.version, verdict,
    ...(verdict === 'redo' ? { reason: 'Rivedere la legenda.' } : {}),
    reviewedBy: lead, reviewedAt: '2026-11-11T08:30:00Z',
  });
}

function derive(
  versions: AssetVersionRecord[],
  decisions: { request: DecisionRequest; outcome: DecisionOutcome | null }[] = [],
  leadReviews: AssetVersionLeadReview[] = [],
) {
  const states = deriveAssetVersionStates({ versions, decisions, leadReviews });
  // Every snapshot state must be reachable from delivery through the published transitions.
  const reachable = new Set<AssetVersionState>(['delivered']);
  const pending: AssetVersionState[] = ['delivered'];
  for (const state of pending) {
    for (const next of ASSET_VERSION_TRANSITIONS[state]) {
      if (reachable.has(next)) continue;
      reachable.add(next);
      pending.push(next);
    }
  }
  for (const entry of states) expect(reachable.has(entry.state)).toBe(true);
  return states;
}

describe('project asset versions', () => {
  it('s6305 superato-solo-da-approvata: an approved version becomes superseded only when a newer version of the same key is approved', () => {
    const v1 = version(1);
    const v2 = version(2, r22, {
      provenance: { createdBy: lead, sessionId: 'R22', repo, commit, branch: 'consegna/22' },
      recordedAt: '2026-11-11T10:00:00Z',
    });
    const first = request(v1);
    const second = request(v2, 'dec_r22_calendar', '2026-11-11T11:00:00Z');
    const decisions = [
      { request: first, outcome: answer(first) },
      { request: second, outcome: answer(second) },
    ];
    const approved = derive([v1, v2], decisions);
    expect(approved.map((entry) => entry.state)).toEqual(['superseded', 'approved']);
    const v3 = version(3, r24, { recordedAt: '2026-11-11T12:00:00Z' });
    const states = derive([v1, v2, v3], decisions);
    expect(states).toEqual([
      { ...piece, version: 1, state: 'superseded', requestId: first.requestId, decidedAt: answer(first).decidedAt },
      { ...piece, version: 2, state: 'approved', requestId: second.requestId, decidedAt: answer(second).decidedAt },
      { ...piece, version: 3, state: 'delivered' },
    ]);
    expect(latestApprovedAssetVersion(states, piece)).toEqual(states[1]);
    expect(derive([v3, v2, v1], [...decisions].reverse())).toEqual([...states].reverse());
  });

  it('derives awaiting, changes requested and an unsound approval from the saved decision', () => {
    const record = version(1);
    const req = request(record);
    expect(derive([record], [{ request: req, outcome: null }])[0]).toEqual({
      ...piece, version: 1, state: 'awaiting_decision', requestId: req.requestId,
    });
    const rejected = answer(req, 'rejected');
    expect(assetVersionDecisionState(req, rejected)).toBe('changes_requested');
    expect(derive([record], [{ request: req, outcome: rejected }])[0]).toMatchObject({
      state: 'changes_requested', decidedAt: rejected.decidedAt,
    });
    const approved = answer(req);
    const wrongSubject = DecisionOutcomeSchema.parse({
      ...approved, subject: { ...req.subject, deliveryRef: { ...fileOf(r20), sha256: 'f'.repeat(64) } },
    });
    expect(assetVersionDecisionState(req, wrongSubject)).toBeNull();
    expect(derive([record], [{ request: req, outcome: wrongSubject }])[0]).toEqual({
      ...piece, version: 1, state: 'awaiting_decision', requestId: req.requestId,
    });
  });

  it('uses the human decision ahead of the lead review', () => {
    const record = version(1);
    const req = request(record);
    const redo = review(record);
    expect(derive([record], [], [redo])[0]?.state).toBe('rejected_by_lead');
    expect(derive([record], [], [review(record, 'ok')])[0]?.state).toBe('delivered');
    expect(derive([record], [{ request: req, outcome: answer(req) }], [redo])[0]?.state).toBe('approved');
    expect(derive([record], [{ request: req, outcome: null }], [redo])[0]?.state).toBe('awaiting_decision');
    expect(derive([record], [{ request: req, outcome: answer(req, 'rejected') }], [redo])[0]?.state).toBe('changes_requested');
  });

  it('ignores an answer to another request and refuses an approval without a referent', () => {
    const record = version(1);
    const req = request(record);
    const unrelated = { ...answer(req, 'rejected'), requestId: 'dec_another' };
    expect(assetVersionDecisionState(req, unrelated)).toBe('awaiting_decision');
    expect(derive([record], [{ request: req, outcome: unrelated }])[0]).toEqual({
      ...piece, version: 1, state: 'awaiting_decision', requestId: req.requestId,
    });
    const ownerAnswer = DecisionOutcomeSchema.parse({
      ...answer(req), subject: undefined, decidedBy: { kind: 'owner', ownerId: 'owner-goodchoice' },
    });
    expect(assetVersionDecisionState(req, ownerAnswer)).toBeNull();
  });

  it('s6305 unchanged file: a request after v2 was recorded decides only v2', () => {
    const v1 = version(1);
    const v2 = version(2, r20, { recordedAt: '2026-11-11T10:00:00Z' });
    const req = request(v2, 'dec_unchanged', '2026-11-11T11:00:00+01:00');
    expect(derive([v1, v2], [{ request: req, outcome: null }])).toEqual([
      { ...piece, version: 1, state: 'delivered' },
      { ...piece, version: 2, state: 'awaiting_decision', requestId: req.requestId },
    ]);
    const first = request(v1, 'dec_before_v2');
    const future = version(3, r20, { recordedAt: '2026-11-11T12:00:00Z' });
    const states = derive([future, v2, v1], [
      { request: first, outcome: answer(first) }, { request: req, outcome: null },
    ]);
    expect(states.map((entry) => entry.state)).toEqual(['delivered', 'awaiting_decision', 'approved']);
    expect(latestApprovedAssetVersion(states, piece)?.version).toBe(1);
    expect(derive([v1, v2], [{ request: req, outcome: answer(req) }]).map((entry) => entry.state))
      .toEqual(['delivered', 'approved']);
  });

  it('ignores a request before any matching version was recorded', () => {
    const record = version(1);
    const req = request(record, 'dec_too_early', '2026-11-11T07:59:59Z');
    expect(derive([record], [{ request: req, outcome: answer(req) }])[0]?.state).toBe('delivered');
  });

  it('selects the latest request by instant and requestId independently of input order', () => {
    const record = version(1);
    const early = request(record, 'dec_z_early', '2026-11-11T10:00:00+01:00');
    const late = request(record, 'dec_a_late', '2026-11-11T09:30:00Z');
    expect(isLaterDecisionRequest(late, early)).toBe(true);
    expect(isLaterDecisionRequest(early, late)).toBe(false);
    const decisions = [{ request: early, outcome: answer(early) }, { request: late, outcome: null }];
    for (const order of [decisions, [...decisions].reverse()]) {
      expect(derive([record], order)[0]).toMatchObject({ state: 'awaiting_decision', requestId: late.requestId });
    }
    const tie = request(record, 'dec_z_tie', late.createdAt);
    expect(isLaterDecisionRequest(tie, late)).toBe(true);
    expect(isLaterDecisionRequest(late, late)).toBe(false);
    for (const order of [[late, tie], [tie, late]]) {
      expect(derive([record], order.map((req) => ({ request: req, outcome: req === tie ? null : answer(req) })))[0])
        .toMatchObject({ state: 'awaiting_decision', requestId: tie.requestId });
    }
  });

  it('requires both file identity and fingerprint and also accepts the delivery package', () => {
    const record = version(1);
    const req = request(record);
    for (const changed of [
      { ...fileOf(r20), sha256: 'f'.repeat(64) }, { ...fileOf(r20), assetId: 'asset-another' },
    ]) {
      expect(derive([version(1, r20, { files: [changed] })], [{ request: req, outcome: answer(req) }])[0]?.state)
        .toBe('delivered');
    }
    const packaged = version(1, r22, { deliveryPackage: fileOf(r20) });
    expect(derive([packaged], [{ request: req, outcome: answer(req) }])[0]?.state).toBe('approved');
  });

  it('keeps decisions, supersession and duplicate detection within the complete version scope', () => {
    const record = version(1);
    const req = request(record);
    const foreignScopes: Partial<AssetVersionRecord>[] = [
      { tenantId: 'other-tenant' }, { organizationId: 'other-organization' },
      { projectId: 'other-project' }, { buSlug: 'contenuti' }, { key: 'design-legenda' },
    ];
    for (const foreignScope of foreignScopes) {
      const other = version(2, r22, foreignScope);
      const otherRequest = request(other, 'dec_other_scope');
      const states = derive([record, other], [
        { request: req, outcome: answer(req) }, { request: otherRequest, outcome: answer(otherRequest) },
      ]);
      expect(states.map((entry) => entry.state)).toEqual(['approved', 'approved']);
      expect(derive([version(1, r20, foreignScope), record], [{ request: req, outcome: answer(req) }])).toHaveLength(2);
    }
    for (const foreignScope of foreignScopes.slice(0, 4)) {
      expect(derive([version(1, r20, foreignScope)], [{ request: req, outcome: answer(req) }])[0]?.state).toBe('delivered');
    }
    expect(() => derive([record, { ...record }])).toThrow('asset_version_duplicate');
  });

  it('accepts the Director generated content matrix without a session or asset buSlug', () => {
    const generated = AssetRefSchema.parse({
      assetId: 'asset-matrice-contenuti', sha256: 'e'.repeat(64), name: 'matrice-contenuti.md',
      mediaType: 'text/markdown', sizeBytes: 1024, origin: { kind: 'generated', agentId: director.managementAgentId },
      tenantId: scope.tenantId, companyId: 'orto-facile', projectId: scope.projectId,
      createdAt: '2026-11-11T08:00:00Z',
    });
    expect(generated.buSlug).toBeUndefined();
    const record = version(1, generated, {
      buSlug: 'contenuti', key: 'matrice-contenuti', provenance: { createdBy: director },
    });
    expect(AssetVersionRecordSchema.parse(record)).toEqual(record);
    expect(record.provenance.sessionId).toBeUndefined();
    expect(derive([record])).toEqual([{ buSlug: 'contenuti', key: 'matrice-contenuti', version: 1, state: 'delivered' }]);
  });

  it('round-trips current session, generated, email and decision saved forms unchanged', () => {
    const assets = [r20, AssetRefSchema.parse({
      ...r20, assetId: 'asset-generated', origin: { kind: 'generated', agentId: director.managementAgentId }, buSlug: undefined,
    }), AssetRefSchema.parse({
      ...r20, assetId: 'asset-email', origin: { kind: 'email', messageId: 'msg-orto-facile', attachmentName: 'calendario.pdf' },
    })];
    for (const original of assets) {
      const saved = JSON.parse(JSON.stringify(original));
      expect(AssetRefSchema.parse(saved)).toEqual(saved);
      expect(fileOf(AssetRefSchema.parse(saved))).toEqual({ assetId: saved.assetId, sha256: saved.sha256 });
    }
    const req = request(version(1));
    const outcome = answer(req);
    expect(DecisionRequestSchema.parse(JSON.parse(JSON.stringify(req)))).toEqual(req);
    expect(DecisionOutcomeSchema.parse(JSON.parse(JSON.stringify(outcome)))).toEqual(outcome);
    expect(assetVersionDecisionState(req, outcome)).toBe('approved');
  });

  it('validates provenance pointers, session identifiers, identities and input bounds', () => {
    const base = { createdBy: director };
    const valid = [base, { ...base, repo, commit }, {
      ...base, sessionId: 'R22', branch: 'consegna/22', paperclipIssueId: '123e4567-e89b-42d3-a456-426614174000',
      inputs: Array.from({ length: 20 }, (_, index) => ({ key: 'matrice-contenuti', version: index + 1 })),
    }];
    for (const value of valid) expect(AssetVersionProvenanceSchema.parse(value)).toEqual(value);
    for (const value of [
      { ...base, branch: 'consegna/22' }, { ...base, repo }, { ...base, commit },
      { ...base, repo: '../orto-facile', commit }, { ...base, repo, commit: 'd'.repeat(39) },
      { ...base, sessionId: 'R0' }, { ...base, sessionId: 'R01' }, { ...base, sessionId: 'session-22' },
      { ...base, sessionId: 'R22', branch: '' }, { ...base, paperclipIssueId: 'issue-22' },
      { createdBy: { managementAgentId: 'director' } },
      { ...base, inputs: Array.from({ length: 21 }, () => ({ key: 'matrice-contenuti', version: 1 })) },
      { ...base, inputs: [{ key: 'Invalid Key', version: 1 }] },
      { ...base, inputs: [{ key: 'matrice-contenuti', version: 0 }] }, { ...base, extra: true },
    ]) expect(AssetVersionProvenanceSchema.safeParse(value).success).toBe(false);
  });

  it('validates nonempty unique bounded files and record identity fields', () => {
    const record = version(1);
    const files = Array.from({ length: 20 }, (_, index) => ({ assetId: 'asset-calendar-' + index, sha256: r20.sha256 }));
    expect(AssetVersionRecordSchema.safeParse({ ...record, files }).success).toBe(true);
    for (const changes of [
      { files: [] }, { files: [...files, fileOf(r20)] },
      { files: [fileOf(r20), { ...fileOf(r20), sha256: 'f'.repeat(64) }] },
      { tenantId: '' }, { organizationId: '' }, { projectId: '' }, { buSlug: '' },
      { key: 'Design Calendar' }, { version: 0 }, { version: 1.5 },
      { recordedAt: '2026-11-11T08:00:00' }, { extra: true },
      { deliveryPackage: { assetId: 'short', sha256: r20.sha256 } },
    ]) expect(AssetVersionRecordSchema.safeParse({ ...record, ...changes }).success).toBe(false);
    expect(AssetVersionFileSchema.shape.assetId).toBe(AssetRefSchema.shape.assetId);
    expect(AssetVersionFileSchema.shape.sha256).toBe(AssetRefSchema.shape.sha256);
    expect(AssetVersionFileSchema.safeParse({ ...fileOf(r20), sha256: 'A'.repeat(64) }).success).toBe(false);
    expect(AssetVersionFileSchema.safeParse({ ...fileOf(r20), extra: true }).success).toBe(false);
  });

  it('requires a bounded redo reason and a complete reviewer identity', () => {
    const record = version(1);
    const redo = review(record);
    expect(AssetVersionLeadReviewSchema.parse(redo)).toEqual(redo);
    expect(AssetVersionLeadReviewSchema.parse(review(record, 'ok')).reason).toBeUndefined();
    for (const changes of [
      { reason: undefined }, { reason: 'no' }, { reason: 'x'.repeat(2001) },
      { reviewedBy: { managementAgentId: 'lead' } }, { verdict: 'approved' },
      { version: 0 }, { key: 'Bad Key' }, { extra: true },
    ]) expect(AssetVersionLeadReviewSchema.safeParse({ ...redo, ...changes }).success).toBe(false);
  });

  it('selects the most recent lead review with redo winning a simultaneous tie', () => {
    const record = version(1);
    const redo = review(record);
    const ok = { ...review(record, 'ok'), reviewedAt: '2026-11-11T09:00:00Z' };
    for (const order of [[redo, ok], [ok, redo]]) expect(derive([record], [], order)[0]?.state).toBe('delivered');
    const tied = { ...ok, reviewedAt: redo.reviewedAt };
    for (const order of [[redo, tied], [tied, redo]]) expect(derive([record], [], order)[0]?.state).toBe('rejected_by_lead');
    const unrelated = { ...redo, key: 'design-legenda' };
    expect(derive([record], [], [unrelated])[0]?.state).toBe('delivered');
  });

  it('publishes exactly the allowed transitions including all terminal states', () => {
    const expected: Record<AssetVersionState, AssetVersionState[]> = {
      delivered: ['rejected_by_lead', 'awaiting_decision'], rejected_by_lead: [],
      awaiting_decision: ['approved', 'changes_requested'], changes_requested: [],
      approved: ['superseded'], superseded: [],
    };
    expect(ASSET_VERSION_STATES).toEqual(Object.keys(expected));
    expect(ASSET_VERSION_TRANSITIONS).toEqual(expected);
    for (const from of ASSET_VERSION_STATES) {
      for (const to of ASSET_VERSION_STATES) expect(assetVersionTransitionAllowed(from, to)).toBe(expected[from].includes(to));
    }
  });

  it('returns no latest approval for empty, pending or differently scoped states', () => {
    expect(derive([])).toEqual([]);
    expect(latestApprovedAssetVersion([], piece)).toBeNull();
    expect(latestApprovedAssetVersion(derive([version(1)]), piece)).toBeNull();
    const record = version(1);
    const req = request(record);
    const states = derive([record], [{ request: req, outcome: answer(req) }]);
    expect(latestApprovedAssetVersion(states, { ...piece, buSlug: 'contenuti' })).toBeNull();
    expect(latestApprovedAssetVersion(states, { ...piece, key: 'design-legenda' })).toBeNull();
  });
});
