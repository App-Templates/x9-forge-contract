import { describe, expect, it } from 'vitest';
import { AssetRefSchema, type AssetRef } from '../../src/organization/asset.js';
import { deriveAssetVersionStates, AssetVersionRecordSchema } from '../../src/organization/asset-version.js';
import {
  DecisionOutcomeSchema,
  DecisionRequestSchema,
  confirmationSetDigest,
  decisionOutcomeFromEmailReply,
  decisionOutcomeMatchesSubject,
  type DecisionRequest,
} from '../../src/organization/decision-request.js';
import { ParticipantAgentIdentitySchema } from '../../src/organization/participant-binding.js';

const lead = ParticipantAgentIdentitySchema.parse({
  managementAgentId: 'bu-design-goodchoice', runtimeAgentId: 'agent-bu-design-goodchoice', vaultAgentId: 20,
});
const referent = { kind: 'referent', email: 'referente@ortofacile.example' } as const;
const asset: AssetRef = AssetRefSchema.parse({
  assetId: 'asset-R20-calendario', sha256: 'a'.repeat(64), name: 'calendario.pdf', mediaType: 'application/pdf',
  sizeBytes: 2048, origin: { kind: 'session', sessionId: 'R20', repo: 'good-choice/orto-facile', commit: 'd'.repeat(40), path: 'design/calendario.pdf' },
  tenantId: 'tenant-goodchoice', companyId: 'orto-facile', projectId: 'orto-facile', buSlug: 'design', createdAt: '2026-11-11T07:00:00Z',
});
const subject = {
  kind: 'delivery' as const, organizationId: 'good-choice', projectId: 'orto-facile', buSlug: 'design',
  deliveryRef: { assetId: asset.assetId, sha256: asset.sha256 },
};
const effects = [
  { optionId: 'approvo', label: 'Approvo', effect: 'approve' as const },
  { optionId: 'richiedi-modifiche', label: 'Chiedo modifiche', effect: 'request_changes' as const },
  { optionId: 'scarto', label: 'Scarto il pezzo', effect: 'reject' as const },
];
function make(overrides: Record<string, unknown> = {}) {
  return {
    requestId: 'dec_ef223ebd', tenantId: 'tenant-goodchoice', organizationId: 'good-choice', projectId: 'orto-facile',
    subject, question: 'Approvi il calendario?', options: effects, requestedBy: lead, addressedTo: referent,
    channel: 'email', createdAt: '2026-11-11T09:00:00Z', ...overrides,
  };
}
function reply(req: DecisionRequest, optionId: string, kind: 'approve' | 'refuse' = 'approve') {
  return decisionOutcomeFromEmailReply({
    request: req,
    reply: kind === 'approve'
      ? { kind, requestId: req.requestId, optionId }
      : { kind, requestId: req.requestId, reason: 'Non va bene' },
    from: { email: referent.email }, receivedAt: '2026-11-11T11:30:00Z', messageId: 'message-1',
  });
}

describe('decision option effects', () => {
  it('s6307 chiedo-modifiche-non-approva: a reply choosing an option with effect request_changes records a rejected outcome, while stored options without effect decide as before', () => {
    const req = DecisionRequestSchema.parse(make());
    const changes = reply(req, 'richiedi-modifiche');
    expect(changes).toMatchObject({ ok: true, outcome: { outcome: 'rejected', reason: 'Chiedo modifiche' } });
    expect(reply(req, 'scarto')).toMatchObject({ ok: true, outcome: { outcome: 'rejected', reason: 'Scarto il pezzo' } });
    expect(reply(req, 'approvo')).toMatchObject({ ok: true, outcome: { outcome: 'approved', optionId: 'approvo' } });
    expect(reply(req, 'x', 'refuse')).toMatchObject({ ok: true, outcome: { outcome: 'rejected' } });
  });

  it('keeps legacy requests without effect: the saved dec_ef223ebd shape still approves', () => {
    const req = DecisionRequestSchema.parse(make({
      options: [{ optionId: 'approva', label: 'Approvo' }, { optionId: 'richiedi-modifiche', label: 'Richiedi modifiche' }],
    }));
    expect(reply(req, 'richiedi-modifiche')).toMatchObject({ ok: true, outcome: { outcome: 'approved' } });
    const saved = DecisionOutcomeSchema.parse({
      requestId: req.requestId, subject, decidedBy: referent, decidedAt: '2026-11-11T11:30:00Z', channel: 'email',
      sourceRef: 'm', outcome: 'approved', optionId: 'richiedi-modifiche',
    });
    expect(decisionOutcomeMatchesSubject(req, saved)).toBe(true);
  });

  it('rejects inconsistent effect declarations', () => {
    const [approve, changes] = effects;
    expect(DecisionRequestSchema.safeParse(make({ options: [approve, { optionId: 'altro', label: 'Altro' }] })).success).toBe(false);
    expect(DecisionRequestSchema.safeParse(make({ options: [changes, effects[2]] })).success).toBe(false);
    expect(DecisionRequestSchema.safeParse(make({ options: [{ ...changes, label: 'No' }, approve] })).success).toBe(false);
    expect(DecisionRequestSchema.safeParse(make({ options: [approve, changes] })).success).toBe(true);
  });

  it('rejects effects on a confirmation set', () => {
    const entry = { level: 'project' as const, projectId: 'orto-facile', kind: 'referent' as const, entryRef: 'r1', entryVersion: 1, entryDigest: 'b'.repeat(64) };
    const digest = confirmationSetDigest([entry]);
    const confirmationRequest = make({
      subject: { kind: 'confirmation_set', planId: 'mapset-' + digest.slice(0, 40), planVersion: 1, digest, clientId: 'orto-facile', entries: [entry] },
      addressedTo: { ownerId: 'owner-1' },
    });
    const withoutEffects = effects.map(({ optionId, label }) => ({ optionId, label }));
    expect(DecisionRequestSchema.safeParse({ ...confirmationRequest, options: withoutEffects }).success).toBe(true);
    const result = DecisionRequestSchema.safeParse(confirmationRequest);
    expect(result.success).toBe(false);
    if (result.success) throw new Error('Expected confirmation set effects to be rejected');
    expect(result.error.issues).toEqual([
      expect.objectContaining({ path: ['options'], message: 'A confirmation set does not declare option effects' }),
    ]);
  });

  it('binds the delivery subject to an exact asset version', () => {
    const v2 = { key: 'design-calendario', version: 2 };
    const req = DecisionRequestSchema.parse(make({ subject: { ...subject, assetVersion: v2 } }));
    const ok = reply(req, 'approvo');
    expect(ok).toMatchObject({ ok: true, outcome: { subject: { assetVersion: v2 } } });
    if (!ok.ok) throw new Error('unreachable');
    expect(decisionOutcomeMatchesSubject(req, ok.outcome)).toBe(true);
    const old = DecisionOutcomeSchema.parse({ ...ok.outcome, subject: { ...subject, assetVersion: { ...v2, version: 1 } } });
    expect(decisionOutcomeMatchesSubject(req, old)).toBe(false);
    const bare = DecisionOutcomeSchema.parse({ ...ok.outcome, subject });
    expect(decisionOutcomeMatchesSubject(req, bare)).toBe(false);
  });

  it('derivation: a decision bound to v1 decides only v1 even when v2 holds the same file', () => {
    const base = {
      tenantId: 'tenant-goodchoice', organizationId: 'good-choice', projectId: 'orto-facile', buSlug: 'design',
      key: 'design-calendario', files: [{ assetId: asset.assetId, sha256: asset.sha256 }],
      provenance: { createdBy: lead }, recordedAt: '2026-11-11T08:00:00Z',
    };
    const versions = [1, 2].map((version) => AssetVersionRecordSchema.parse({ ...base, version }));
    const run = (assetVersion?: { key: string; version: number }) => {
      const req = DecisionRequestSchema.parse(make({ subject: { ...subject, ...(assetVersion ? { assetVersion } : {}) } }));
      return deriveAssetVersionStates({ versions, decisions: [{ request: req, outcome: null }], leadReviews: [] })
        .map((s) => s.state);
    };
    expect(run({ key: 'design-calendario', version: 1 })).toEqual(['awaiting_decision', 'delivered']);
    expect(run({ key: 'design-calendario', version: 2 })).toEqual(['delivered', 'awaiting_decision']);
    expect(run()).toEqual(['delivered', 'awaiting_decision']);
  });
});
