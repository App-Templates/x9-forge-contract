import { describe, expect, it } from 'vitest';
import {
  ASSET_VERSION_REFUSALS,
  INTERNAL_MEMORY_ASSET_VERSIONS_PATH,
  INTERNAL_MEMORY_ASSET_VERSIONS_LIST_PATH,
  INTERNAL_MEMORY_ASSET_VERSIONS_LATEST_PATH,
  INTERNAL_MEMORY_ASSET_VERSIONS_REVIEWS_PATH,
  internalMemoryAssetVersionRecordContract,
  internalMemoryAssetVersionListContract,
  internalMemoryAssetVersionLatestContract,
  internalMemoryAssetVersionReviewContract,
} from '../../../src/http/endpoints/index.js';
import { ASSET_VERSION_STATES } from '../../../src/organization/asset-version.js';

const context = {
  schemaVersion: 1,
  runId: 'run-6306-R22',
  organizationId: 'good-choice',
  ownerId: 'owner-goodchoice',
  identity: { managementAgentId: 'bu-design-goodchoice', runtimeAgentId: 'agent-bu-design-goodchoice' },
  issuer: 'x9',
  issuedAt: '2026-11-11T07:00:00.000Z',
  expiresAt: '2026-11-11T09:00:00.000Z',
};
const lead = { ...context.identity, vaultAgentId: 20 };
const file = { assetId: 'asset-R22-calendario', sha256: 'b'.repeat(64) };
const deliveryPackage = { assetId: 'asset-R22-package', sha256: 'c'.repeat(64) };
const scope = { projectId: 'orto-facile', buSlug: 'design', key: 'design-calendario' };
const provenance = {
  paperclipIssueId: '8d129c8b-95e8-46ab-8a24-45767b7cbf01',
  sessionId: 'R22',
  repo: 'good-choice/orto-facile',
  branch: 'consegna/22',
  commit: 'd'.repeat(40),
};
const registration = { context, ...scope, expectedPreviousVersion: 1, files: [file], deliveryPackage, provenance };
const record = {
  tenantId: 'tenant-goodchoice', organizationId: context.organizationId, ...scope,
  version: 2, files: [file], deliveryPackage, provenance: { ...provenance, createdBy: lead },
  recordedAt: '2026-11-11T08:00:00Z',
};
const approved = {
  record, state: 'approved' as const, requestId: 'dec_R22_calendar', decidedAt: '2026-11-11T08:30:00Z',
};
const reviewRequest = { context, ...scope, version: 2, verdict: 'redo', reason: 'Improve the calendar legend.' };
const review = {
  buSlug: scope.buSlug, key: scope.key, version: 2, verdict: 'redo', reason: reviewRequest.reason,
  reviewedBy: lead, reviewedAt: '2026-11-11T08:15:00Z',
};

describe('internal memory asset versions', () => {
  it('s6306 registro-versioni: the asset version contracts record, list with state, read the latest approved and record the lead review', () => {
    const contracts = [
      [internalMemoryAssetVersionRecordContract, INTERNAL_MEMORY_ASSET_VERSIONS_PATH, '/internal/memory/asset-versions'],
      [internalMemoryAssetVersionListContract, INTERNAL_MEMORY_ASSET_VERSIONS_LIST_PATH, '/internal/memory/asset-versions/list'],
      [internalMemoryAssetVersionLatestContract, INTERNAL_MEMORY_ASSET_VERSIONS_LATEST_PATH, '/internal/memory/asset-versions/latest'],
      [internalMemoryAssetVersionReviewContract, INTERNAL_MEMORY_ASSET_VERSIONS_REVIEWS_PATH, '/internal/memory/asset-versions/reviews'],
    ] as const;
    for (const [contract, path, expectedPath] of contracts) {
      expect(path).toBe(expectedPath);
      expect(contract).toMatchObject({ method: 'POST', path: expectedPath, authType: 'secret' });
    }
    expect(internalMemoryAssetVersionRecordContract.bodySchema.parse(registration)).toEqual(registration);
    for (const outcome of ['recorded', 'already_recorded']) {
      const response = { outcome, version: record };
      expect(internalMemoryAssetVersionRecordContract.responseSchema.parse(response)).toEqual(response);
    }
    expect(ASSET_VERSION_REFUSALS).toEqual([
      'asset_version_conflict', 'asset_version_unknown_file',
      'asset_version_foreign_business_unit', 'asset_version_key_not_in_mandate',
    ]);
    for (const code of ASSET_VERSION_REFUSALS) {
      const response = { outcome: 'refused', code };
      expect(internalMemoryAssetVersionRecordContract.responseSchema.parse(response)).toEqual(response);
    }
    expect(internalMemoryAssetVersionListContract.bodySchema.parse({ context, projectId: scope.projectId }))
      .toEqual({ context, projectId: scope.projectId });
    expect(internalMemoryAssetVersionListContract.bodySchema.parse({ context, ...scope, limit: 200 }))
      .toEqual({ context, ...scope, limit: 200 });
    const versions = ASSET_VERSION_STATES.map((state) => ({ record, state }));
    versions.push(approved);
    expect(internalMemoryAssetVersionListContract.responseSchema.parse({ versions })).toEqual({ versions });
    expect(internalMemoryAssetVersionLatestContract.bodySchema.parse({ context, ...scope })).toEqual({ context, ...scope });
    expect(internalMemoryAssetVersionLatestContract.responseSchema.parse({ version: approved })).toEqual({ version: approved });
    expect(internalMemoryAssetVersionReviewContract.bodySchema.parse(reviewRequest)).toEqual(reviewRequest);
    expect(internalMemoryAssetVersionReviewContract.responseSchema.parse({ outcome: 'recorded', review }))
      .toEqual({ outcome: 'recorded', review });
    for (const code of ['asset_version_not_found', 'asset_version_review_not_lead']) {
      expect(internalMemoryAssetVersionReviewContract.responseSchema.parse({ outcome: 'refused', code }))
        .toEqual({ outcome: 'refused', code });
    }
  });

  it('accepts the Director content matrix without a session and the first expected version', () => {
    const request = {
      context: { ...context, identity: { managementAgentId: 'director-goodchoice', runtimeAgentId: 'agent-director-goodchoice' } },
      projectId: scope.projectId, buSlug: 'director', key: 'matrice-contenuti', expectedPreviousVersion: 0,
      files: [{ assetId: 'asset-director-matrice', sha256: 'a'.repeat(64) }], provenance: {},
    };
    expect(internalMemoryAssetVersionRecordContract.bodySchema.parse(request)).toEqual(request);
  });

  it('rejects caller createdBy, unknown fields, negative or fractional previous versions and invalid keys', () => {
    for (const request of [
      { ...registration, provenance: { ...provenance, createdBy: lead } },
      { ...registration, unexpected: 'unknown' },
      { ...registration, provenance: { ...provenance, unexpected: 'unknown' } },
      { ...registration, expectedPreviousVersion: -1 },
      { ...registration, expectedPreviousVersion: 1.5 },
      { ...registration, key: 'Unknown Key' },
    ]) expect(internalMemoryAssetVersionRecordContract.bodySchema.safeParse(request).success).toBe(false);
    // A syntactically valid key outside the mandate is refused by the service, not by the wire schema.
    expect(internalMemoryAssetVersionRecordContract.bodySchema.safeParse({ ...registration, key: 'not-in-mandate' }).success).toBe(true);
  });

  it('preserves the canonical provenance and file checks without accepting a caller identity', () => {
    for (const invalidProvenance of [
      { repo: provenance.repo }, { commit: provenance.commit }, { branch: provenance.branch },
    ]) {
      expect(internalMemoryAssetVersionRecordContract.bodySchema.safeParse({ ...registration, provenance: invalidProvenance }).success).toBe(false);
    }
    for (const files of [[], [file, file], [{ ...file, sha256: 'bad' }], Array.from({ length: 21 }, (_, i) => ({ ...file, assetId: `asset-${i}` }))]) {
      expect(internalMemoryAssetVersionRecordContract.bodySchema.safeParse({ ...registration, files }).success).toBe(false);
    }
  });

  it('rejects invalid list limits, states and invented refusal codes', () => {
    for (const limit of [0, 201, 1.5]) {
      expect(internalMemoryAssetVersionListContract.bodySchema.safeParse({ context, projectId: scope.projectId, limit }).success).toBe(false);
    }
    expect(internalMemoryAssetVersionListContract.responseSchema.safeParse({ versions: [{ record, state: 'invented' }] }).success).toBe(false);
    for (const contract of [internalMemoryAssetVersionRecordContract, internalMemoryAssetVersionReviewContract]) {
      expect(contract.responseSchema.safeParse({ outcome: 'refused', code: 'invented' }).success).toBe(false);
    }
  });

  it('reads a null latest version and rejects every state other than approved and missing decision metadata', () => {
    expect(internalMemoryAssetVersionLatestContract.responseSchema.parse({ version: null })).toEqual({ version: null });
    for (const state of ASSET_VERSION_STATES.filter((state) => state !== 'approved')) {
      expect(internalMemoryAssetVersionLatestContract.responseSchema.safeParse({ version: { ...approved, state } }).success).toBe(false);
    }
    for (const version of [
      { record, state: 'approved', decidedAt: approved.decidedAt },
      { record, state: 'approved', requestId: approved.requestId },
    ]) expect(internalMemoryAssetVersionLatestContract.responseSchema.safeParse({ version }).success).toBe(false);
  });

  it('preserves the lead redo reason requirement and rejects service-owned review fields', () => {
    expect(internalMemoryAssetVersionReviewContract.bodySchema.parse({ context, ...scope, version: 2, verdict: 'ok' }))
      .toEqual({ context, ...scope, version: 2, verdict: 'ok' });
    for (const request of [
      { context, ...scope, version: 2, verdict: 'redo' },
      { ...reviewRequest, reason: 'no' },
      { ...reviewRequest, reviewedBy: lead },
      { ...reviewRequest, reviewedAt: review.reviewedAt },
      { ...reviewRequest, version: 0 },
      { ...reviewRequest, verdict: 'invented' },
    ]) expect(internalMemoryAssetVersionReviewContract.bodySchema.safeParse(request).success).toBe(false);
    expect(internalMemoryAssetVersionReviewContract.responseSchema.safeParse({ outcome: 'recorded', review: { ...review, reason: undefined } }).success).toBe(false);
  });

  it('requires the signed organization context on every route and validates decision metadata', () => {
    const requests = [
      [internalMemoryAssetVersionRecordContract, registration],
      [internalMemoryAssetVersionListContract, { context, projectId: scope.projectId }],
      [internalMemoryAssetVersionLatestContract, { context, ...scope }],
      [internalMemoryAssetVersionReviewContract, reviewRequest],
    ] as const;
    for (const [contract, request] of requests) {
      expect(contract.bodySchema.safeParse({ ...request, context: undefined }).success).toBe(false);
      expect(contract.bodySchema.safeParse({ ...request, context: { ...context, expiresAt: context.issuedAt } }).success).toBe(false);
    }
    for (const version of [{ ...approved, requestId: '?' }, { ...approved, decidedAt: 'yesterday' }]) {
      expect(internalMemoryAssetVersionListContract.responseSchema.safeParse({ versions: [version] }).success).toBe(false);
      expect(internalMemoryAssetVersionLatestContract.responseSchema.safeParse({ version }).success).toBe(false);
    }
  });
});
