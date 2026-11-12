import { describe, expect, it } from 'vitest';
import { AssetRefSchema, type AssetRef } from '../../src/organization/asset.js';
import {
  AssetVersionRecordSchema,
  deriveAssetVersionStates,
  type AssetVersionRecord,
} from '../../src/organization/asset-version.js';
import {
  BusinessUnitStateSummarySchema,
  deriveBusinessUnitStateSummary,
} from '../../src/organization/business-unit-state.js';
import {
  DecisionOutcomeSchema,
  DecisionRequestSchema,
  type DecisionOutcome,
  type DecisionRequest,
} from '../../src/organization/decision-request.js';
import { ParticipantAgentIdentitySchema } from '../../src/organization/participant-binding.js';
import { DevSessionOutcomeSchema, type DevSessionOutcome } from '../../src/capability/dev/session-outcome.js';

const scope = { tenantId: '1', organizationId: 'good-choice', projectId: 'orto-facile', buSlug: 'orto-design' };
const lead = ParticipantAgentIdentitySchema.parse({
  managementAgentId: 'capo-orto-design', runtimeAgentId: 'agent-capo-orto-design', vaultAgentId: 20,
});
const referent = { kind: 'referent', email: 'referente@ortofacile.example' } as const;
const repo = 'good-choice/orto-facile';
const commit = 'd'.repeat(40);

function sessionAsset(sessionId: string, fingerprint: string, overrides: Record<string, unknown> = {}): AssetRef {
  return AssetRefSchema.parse({
    assetId: 'asset-' + sessionId, sha256: fingerprint.repeat(64), name: 'design.pdf', mediaType: 'application/pdf',
    sizeBytes: 2048, origin: { kind: 'session', sessionId, repo, commit, path: 'design/design.pdf' },
    tenantId: scope.tenantId, companyId: 'orto-facile', projectId: scope.projectId, buSlug: scope.buSlug,
    createdAt: '2026-11-11T07:00:00Z', ...overrides,
  });
}

const r20 = sessionAsset('R20', 'a');
const r22 = sessionAsset('R22', 'b');

function version(number: number, asset: AssetRef, sessionId: string, overrides: Record<string, unknown> = {}): AssetVersionRecord {
  return AssetVersionRecordSchema.parse({
    ...scope, key: 'design', version: number, files: [{ assetId: asset.assetId, sha256: asset.sha256 }],
    provenance: { createdBy: lead, sessionId, repo, commit, branch: 'consegna/' + sessionId.slice(1) },
    recordedAt: number === 1 ? '2026-11-11T08:00:00Z' : '2026-11-11T10:00:00Z', ...overrides,
  });
}

// Requests in the form saved today: only deliveryRef, no assetVersion.
function request(asset: AssetRef, requestId: string, createdAt: string, overrides: Record<string, unknown> = {}): DecisionRequest {
  return DecisionRequestSchema.parse({
    requestId, tenantId: scope.tenantId, organizationId: scope.organizationId, projectId: scope.projectId,
    subject: {
      kind: 'delivery', organizationId: scope.organizationId, projectId: scope.projectId, buSlug: scope.buSlug,
      deliveryRef: { assetId: asset.assetId, sha256: asset.sha256 },
    },
    question: 'Approvi il design di Orto Facile?',
    options: [{ optionId: 'approva', label: 'Approvo' }, { optionId: 'richiedi-modifiche', label: 'Richiedi modifiche' }],
    requestedBy: lead, addressedTo: referent, channel: 'email', createdAt, ...overrides,
  });
}

function answer(req: DecisionRequest, outcome: 'approved' | 'rejected', decidedAt: string): DecisionOutcome {
  return DecisionOutcomeSchema.parse({
    requestId: req.requestId, subject: req.subject, decidedBy: referent, decidedAt, channel: 'email',
    sourceRef: 'message-' + req.requestId,
    ...(outcome === 'approved' ? { outcome, optionId: 'approva' } : { outcome, reason: 'chiedo modifiche' }),
  });
}

function outcomeOf(sessionId: string, attempt: number, fields: Record<string, unknown> = {}): DevSessionOutcome {
  return DevSessionOutcomeSchema.parse({
    version: 1, sessionId, attempt, state: 'delivered', reason: { code: 'tests_green', text: 'Test verdi.' },
    executorVersion: '1.170.0', createdAt: '2026-11-11T12:00:00Z', ...fields,
  });
}

const v1 = version(1, r20, 'R20');
const v2 = version(2, r22, 'R22');
const dec1 = request(r20, 'dec_ef223ebd', '2026-11-11T09:00:00Z');
const dec2 = request(r22, 'dec_a2cdf8c3', '2026-11-11T11:00:00Z');
const decisions = [
  { request: dec1, outcome: answer(dec1, 'rejected', '2026-11-11T09:30:00Z') },
  { request: dec2, outcome: answer(dec2, 'approved', '2026-11-11T11:30:00Z') },
];

function summary(overrides: Record<string, unknown> = {}) {
  return deriveBusinessUnitStateSummary({
    scope, versions: [v1, v2], decisions, leadReviews: [], assets: [], sessionOutcomes: [], ...overrides,
  });
}

describe('business unit state summary', () => {
  it('s6343 riepilogo-reparto: deriveBusinessUnitStateSummary gives, for one business unit, the latest version and state of each deliverable key through deriveAssetVersionStates, the open delivery decisions, the received materials and the last outcome of each session, ignoring facts of other scopes', () => {
    const result = summary();
    expect(result.deliverables).toEqual([{
      key: 'design', versions: 2,
      latest: { version: 2, state: 'approved', requestId: 'dec_a2cdf8c3', decidedAt: '2026-11-11T11:30:00Z' },
      latestApprovedVersion: 2,
    }]);
    expect(result.openDecisions).toEqual([]);
    // Same single rule: the older version is changes_requested, not "superseded".
    const states = deriveAssetVersionStates({ versions: [v1, v2], decisions, leadReviews: [] });
    expect(states.map((s) => [s.version, s.state])).toEqual([[1, 'changes_requested'], [2, 'approved']]);
    expect(BusinessUnitStateSummarySchema.parse(result)).toEqual(result);
  });

  it('s6343 riepilogo-reparto: a second request on the same delivery without outcome stays visible as open decision', () => {
    const dec3 = request(r22, 'dec_8c1f1501', '2026-11-11T13:00:00Z');
    const all = [...decisions, { request: dec3, outcome: null }];
    const result = summary({ decisions: all });
    expect(result.openDecisions).toEqual([{
      requestId: 'dec_8c1f1501', createdAt: '2026-11-11T13:00:00Z',
      deliveryRef: { assetId: r22.assetId, sha256: r22.sha256 },
    }]);
    const states = deriveAssetVersionStates({ versions: [v1, v2], decisions: all, leadReviews: [] });
    expect(result.deliverables[0]!.latest.state).toBe(states[1]!.state);
    expect(result.deliverables[0]!.latest.state).toBe('awaiting_decision');
    expect(result.deliverables[0]!.latestApprovedVersion).toBeNull();
  });

  it('s6343 riepilogo-reparto: each session shows its highest attempt', () => {
    const failure = {
      state: 'failed', reason: { code: 'materials_not_obtained', text: 'Materiali non ottenuti.' },
      disposition: { nature: 'missing_data', retry: 'never', nextMove: 'ask_director' },
      missingMaterials: [{ ref: 'logo.svg', error: 'non trovato' }],
    };
    const result = summary({
      sessionOutcomes: [
        outcomeOf('R22', 1, { ...failure, createdAt: '2026-11-11T13:00:00Z' }),
        outcomeOf('R21', 1, failure),
        outcomeOf('R22', 2, { createdAt: '2026-11-11T14:00:00Z' }),
      ],
    });
    expect(result.sessions.map((s) => [s.sessionId, s.attempt, s.state, s.reasonCode])).toEqual([
      ['R21', 1, 'failed', 'materials_not_obtained'],
      ['R22', 2, 'delivered', 'tests_green'],
    ]);
    expect(result.sessions[0]).toMatchObject({ nature: 'missing_data', nextMove: 'ask_director' });
    expect(result.sessions[1]).not.toHaveProperty('nature');
  });

  it('s6343 riepilogo-reparto: facts of other scopes and session assets are ignored, empty input gives empty lists', () => {
    const otherBu = { ...scope, buSlug: 'orto-web' };
    const webAsset = sessionAsset('R30', 'c', { assetId: 'asset-web', buSlug: 'orto-web' });
    const webVersion = version(1, webAsset, 'R30', { buSlug: 'orto-web', key: 'sito' });
    const webReq = request(webAsset, 'dec_00000web', '2026-11-11T09:00:00Z', {
      subject: {
        kind: 'delivery', organizationId: scope.organizationId, projectId: scope.projectId, buSlug: 'orto-web',
        deliveryRef: { assetId: webAsset.assetId, sha256: webAsset.sha256 },
      },
    });
    const foreignTenant = version(1, r20, 'R20', { tenantId: '2', key: 'altro' });
    const mail = AssetRefSchema.parse({
      assetId: 'asset-mail', sha256: 'e'.repeat(64), name: 'foto.jpg', mediaType: 'image/jpeg', sizeBytes: 10,
      origin: { kind: 'email', messageId: '<m@x>' }, tenantId: scope.tenantId, companyId: 'orto-facile',
      projectId: scope.projectId, buSlug: scope.buSlug, createdAt: '2026-11-11T06:00:00Z',
    });
    const foreignMail = AssetRefSchema.parse({ ...mail, assetId: 'asset-mail-2', tenantId: '2' });
    const webMail = AssetRefSchema.parse({ ...mail, assetId: 'asset-mail-3', buSlug: otherBu.buSlug });
    const result = summary({
      versions: [v1, v2, webVersion, foreignTenant],
      decisions: [...decisions, { request: webReq, outcome: null }],
      assets: [r20, mail, mail, foreignMail, webMail],
    });
    expect(result.deliverables.map((d) => d.key)).toEqual(['design']);
    expect(result.openDecisions).toEqual([]);
    expect(result.receivedMaterials).toEqual([
      { assetId: 'asset-mail', sha256: mail.sha256, name: 'foto.jpg', createdAt: '2026-11-11T06:00:00Z' },
    ]);
    expect(summary({ versions: [], decisions: [], assets: [] })).toEqual({
      scope, deliverables: [], openDecisions: [], receivedMaterials: [], sessions: [],
    });
  });
});
