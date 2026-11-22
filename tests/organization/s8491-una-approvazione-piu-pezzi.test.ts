import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DELIVERY_DECISION_MAX_ASSET_VERSIONS,
  DecisionOutcomeSchema,
  DecisionRequestSchema,
  DeliveryDecisionSubjectSchema,
  decisionOutcomeMatchesSubject,
  deliveryDecisionAssetVersions,
  deliveryDecisionDuplicate,
} from '../../src/organization/decision-request.js';
import { AssetVersionRecordSchema, deriveAssetVersionStates } from '../../src/organization/asset-version.js';

// This fixture documents its reconstruction rather than claiming to contain the missing saved row.
const saved: { request: unknown; outcome: unknown } = JSON.parse(readFileSync(
  new URL('./decision-request-s8491-dec-32f00f5b.json', import.meta.url), 'utf8',
));
const legacy = DecisionRequestSchema.parse(saved.request);
const legacyOutcome = DecisionOutcomeSchema.parse(saved.outcome);
const legacySubject = DeliveryDecisionSubjectSchema.parse(legacy.subject);
const refs = [{ key: 'stati-di-sistema', version: 5 }, { key: 'catalogo', version: 2 }];
const packageRef = { assetId: 'asset-delivery-r69', sha256: 'b'.repeat(64) };

function redo() {
  return DecisionRequestSchema.parse({
    ...legacy, requestId: 'dec_redo_r69', createdAt: '2026-11-22T13:00:00Z',
    subject: { ...legacySubject, deliveryRef: packageRef, assetVersions: refs },
  });
}

function versions() {
  return refs.map((ref) => AssetVersionRecordSchema.parse({
    tenantId: legacy.tenantId, organizationId: legacy.organizationId, projectId: legacy.projectId,
    buSlug: legacySubject.buSlug, ...ref,
    files: [{ assetId: `asset-${ref.key}-r69`, sha256: 'c'.repeat(64) }],
    deliveryPackage: packageRef, provenance: { createdBy: legacy.requestedBy, sessionId: 'R69' },
    recordedAt: '2026-11-22T12:59:00Z',
  }));
}

describe('s8491 one approval for a multi-piece redo', () => {
  it('s8491 regressione-r67-un-ok-per-tutti-i-pezzi-del-rifacimento', () => {
    const request = redo();
    const subject = DeliveryDecisionSubjectSchema.parse(request.subject);
    const outcome = DecisionOutcomeSchema.parse({
      requestId: request.requestId, subject, decidedBy: legacyOutcome.decidedBy,
      channel: legacyOutcome.channel, sourceRef: legacyOutcome.sourceRef,
      outcome: 'approved', optionId: 'approve', decidedAt: '2026-11-22T14:00:00Z',
    });
    expect(deliveryDecisionAssetVersions(subject)).toEqual(refs);
    expect(decisionOutcomeMatchesSubject(request, outcome)).toBe(true);
    expect(decisionOutcomeMatchesSubject(request, {
      ...outcome, subject: { ...subject, assetVersions: [...refs].reverse() },
    })).toBe(true);
    expect(deriveAssetVersionStates({ versions: versions(), decisions: [{ request, outcome }], leadReviews: [] }))
      .toEqual(refs.map((ref) => ({
        buSlug: subject.buSlug, ...ref, state: 'approved', requestId: request.requestId, decidedAt: outcome.decidedAt,
      })));

    for (const assetVersions of [
      [refs[0], { key: 'catalogo', version: 3 }],
      [refs[0], { key: 'altro-pezzo', version: 2 }],
    ]) {
      const unrelated = DecisionOutcomeSchema.parse({ ...outcome, subject: { ...subject, assetVersions } });
      expect(decisionOutcomeMatchesSubject(request, unrelated)).toBe(false);
      expect(decisionOutcomeMatchesSubject({ subject: unrelated.subject }, outcome)).toBe(false);
      expect(deriveAssetVersionStates({ versions: versions(), decisions: [{ request, outcome: unrelated }], leadReviews: [] })
        .map((entry) => entry.state)).toEqual(['awaiting_decision', 'awaiting_decision']);
    }

    const single = DecisionRequestSchema.parse({
      ...request, requestId: 'dec_catalogo_v2', subject: {
        ...legacySubject, deliveryRef: { assetId: 'asset-other-package', sha256: 'd'.repeat(64) }, assetVersion: refs[1],
      },
    });
    expect(deliveryDecisionDuplicate(single, [{ request, outcome: null }]))
      .toEqual({ code: 'decision_already_pending', requestId: request.requestId });
    expect(deliveryDecisionDuplicate(request, [{ request: single, outcome: null }]))
      .toEqual({ code: 'decision_already_pending', requestId: single.requestId });
    expect(deliveryDecisionDuplicate(single, [{ request, outcome }]))
      .toEqual({ code: 'decision_already_approved', requestId: request.requestId });
    const differentVersion = DecisionRequestSchema.parse({
      ...single, subject: { ...legacySubject, deliveryRef: packageRef, assetVersion: { key: 'catalogo', version: 3 } },
    });
    expect(deliveryDecisionDuplicate(differentVersion, [{ request, outcome: null }])).toBeNull();
  });

  it('requires two to twenty distinct pieces and preserves single-version subjects', () => {
    expect(DELIVERY_DECISION_MAX_ASSET_VERSIONS).toBe(20);
    const twenty = Array.from({ length: 20 }, (_, i) => ({ key: `piece-${i}`, version: 1 }));
    expect(DeliveryDecisionSubjectSchema.parse({ ...legacySubject, assetVersions: twenty }).assetVersions).toEqual(twenty);
    for (const invalid of [
      { assetVersions: [] }, { assetVersions: [refs[0]] },
      { assetVersions: [...twenty, { key: 'piece-extra', version: 1 }] },
      { assetVersions: [refs[0], refs[0]] },
      { assetVersions: [refs[0], { key: 'stati-di-sistema', version: 6 }] },
      { assetVersion: refs[0], assetVersions: refs },
      { assetVersions: [refs[0], { key: 'bad/key', version: 1 }] },
      { assetVersions: [refs[0], { key: 'catalogo', version: 0 }] },
    ]) {
      const subject = { ...legacySubject, ...invalid };
      expect(DeliveryDecisionSubjectSchema.safeParse(subject).success).toBe(false);
      expect(DecisionRequestSchema.safeParse({ ...legacy, subject }).success).toBe(false);
      expect(DecisionOutcomeSchema.safeParse({ ...legacyOutcome, subject }).success).toBe(false);
    }
    const single = DeliveryDecisionSubjectSchema.parse({ ...legacySubject, assetVersion: refs[0] });
    expect(single).toEqual({ ...legacySubject, assetVersion: refs[0] });
    expect(deliveryDecisionAssetVersions(single)).toEqual([refs[0]]);
    expect(deliveryDecisionAssetVersions(legacySubject)).toEqual([]);
    expect(decisionOutcomeMatchesSubject({ subject: single }, { subject: single })).toBe(true);
    expect(decisionOutcomeMatchesSubject({ subject: single }, { subject: legacySubject })).toBe(false);
    expect(decisionOutcomeMatchesSubject({ subject: single }, {
      subject: { ...single, assetVersion: { key: 'stati-di-sistema', version: 6 } },
    })).toBe(false);
  });

  it('rereads the reconstructed legacy decision unchanged and leaves unrelated history unchanged', () => {
    expect(legacy).toEqual(saved.request);
    expect(legacyOutcome).toEqual(saved.outcome);
    expect(decisionOutcomeMatchesSubject(legacy, legacyOutcome)).toBe(true);
    expect(legacySubject).not.toHaveProperty('assetVersion');
    expect(legacySubject).not.toHaveProperty('assetVersions');
    const history = [1, 2, 3, 4].map((version) => AssetVersionRecordSchema.parse({
      ...versions()[0], version, deliveryPackage: undefined,
      provenance: { createdBy: legacy.requestedBy, ...(
        version === 1 ? { sessionId: 'R43' } : version === 3 ? { sessionId: 'R58' } : {}
      ) }, recordedAt: '2026-11-20T10:00:00Z',
    }));
    const before = deriveAssetVersionStates({ versions: history, decisions: [], leadReviews: [] });
    expect(deriveAssetVersionStates({ versions: history, decisions: [{ request: legacy, outcome: legacyOutcome }], leadReviews: [] }))
      .toEqual(before);
    const packageHistory = versions().map((version) => ({ ...version, deliveryPackage: legacySubject.deliveryRef }));
    expect(deriveAssetVersionStates({ versions: packageHistory, decisions: [{ request: legacy, outcome: legacyOutcome }], leadReviews: [] })
      .map((entry) => entry.state)).toEqual(['delivered', 'delivered']);
    const earlyHistory = packageHistory.map((version) => ({ ...version, recordedAt: '2026-11-22T12:00:00Z' }));
    expect(deriveAssetVersionStates({ versions: earlyHistory, decisions: [{ request: legacy, outcome: legacyOutcome }], leadReviews: [] })
      .map((entry) => entry.state)).toEqual(['changes_requested', 'changes_requested']);
  });
});
