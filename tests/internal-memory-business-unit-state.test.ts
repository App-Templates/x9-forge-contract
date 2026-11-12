import { describe, expect, it } from 'vitest';
import {
  INTERNAL_MEMORY_BUSINESS_UNIT_STATE_PATH,
  InternalMemoryBusinessUnitStateRequestSchema,
  InternalMemoryBusinessUnitStateResponseSchema,
  internalMemoryBusinessUnitStateContract,
} from '../src/http/endpoints/internal-memory-business-unit-state.js';
import { deriveAssetVersionStates } from '../src/organization/asset-version.js';
import { deriveBusinessUnitStateSummary } from '../src/organization/business-unit-state.js';

const scope = { tenantId: '1', organizationId: 'good-choice', projectId: 'orto-facile', buSlug: 'orto-design' };
const lead = { managementAgentId: 'capo-orto-design', runtimeAgentId: 'agent-capo-orto-design', vaultAgentId: 20 };
const context = {
  schemaVersion: 1, runId: 'run-6530-R22', organizationId: scope.organizationId, ownerId: '1',
  identity: { managementAgentId: lead.managementAgentId, runtimeAgentId: lead.runtimeAgentId },
  issuer: 'x9', issuedAt: '2026-11-11T07:00:00Z', expiresAt: '2026-11-11T09:00:00Z',
};
const referent = { kind: 'referent', email: 'referente@ortofacile.example' };
const file1 = { assetId: 'asset-R20-design', sha256: 'a'.repeat(64) };
const file2 = { assetId: 'asset-R22-design', sha256: 'b'.repeat(64) };
const versions = [file1, file2].map((file, index) => ({
  ...scope, key: 'design', version: index + 1, files: [file],
  provenance: {
    createdBy: lead, sessionId: index === 0 ? 'R20' : 'R22', repo: 'good-choice/orto-facile',
    commit: 'd'.repeat(40), branch: index === 0 ? 'consegna/20' : 'consegna/22',
  },
  recordedAt: index === 0 ? '2026-11-11T08:00:00Z' : '2026-11-11T10:00:00Z',
}));
// Production shape saved on November 11: deliveryRef only, options without effect.
const requests = [file1, file2].map((deliveryRef, index) => ({
  requestId: index === 0 ? 'dec_ef223ebd' : 'dec_a2cdf8c3',
  tenantId: scope.tenantId, organizationId: scope.organizationId, projectId: scope.projectId,
  subject: {
    kind: 'delivery', organizationId: scope.organizationId, projectId: scope.projectId,
    buSlug: scope.buSlug, deliveryRef,
  },
  question: 'Approvi il design di Orto Facile?',
  options: [{ optionId: 'approva', label: 'Approvo' }, { optionId: 'richiedi-modifiche', label: 'Richiedi modifiche' }],
  requestedBy: lead, addressedTo: referent, channel: 'email',
  createdAt: index === 0 ? '2026-11-11T09:00:00Z' : '2026-11-11T11:00:00Z',
}));
const request1 = requests[0]!;
const request2 = requests[1]!;
const answer1 = {
  requestId: request1.requestId, subject: request1.subject, decidedBy: referent,
  decidedAt: '2026-11-11T09:30:00Z', channel: 'email', sourceRef: 'message-dec_ef223ebd',
  outcome: 'approved', optionId: 'richiedi-modifiche',
};
const review = {
  buSlug: scope.buSlug, key: 'design', version: 2, verdict: 'redo', reason: 'Improve the design legend.',
  reviewedBy: lead, reviewedAt: '2026-11-11T10:30:00Z',
};
const receivedAsset = {
  assetId: 'asset-mail-foto', sha256: 'e'.repeat(64), name: 'foto.jpg', mediaType: 'image/jpeg', sizeBytes: 10,
  origin: { kind: 'email', messageId: '<orto-foto@example.com>' }, tenantId: scope.tenantId,
  companyId: 'orto-facile', projectId: scope.projectId, buSlug: scope.buSlug, createdAt: '2026-11-11T06:00:00Z',
};
const department = {
  scope, versions, decisions: [{ request: request1, outcome: answer1 }, { request: request2, outcome: null }],
  leadReviews: [review], assets: [receivedAsset],
};
const listed = { outcome: 'listed', role: 'capo-bu', departments: [department] };

describe('internal memory business unit state', () => {
  it('s6530 fatti-del-reparto: the request carries only the signed run context', () => {
    expect(INTERNAL_MEMORY_BUSINESS_UNIT_STATE_PATH).toBe('/internal/memory/business-unit-state');
    expect(internalMemoryBusinessUnitStateContract).toEqual({
      method: 'POST', path: INTERNAL_MEMORY_BUSINESS_UNIT_STATE_PATH, authType: 'secret',
      bodySchema: InternalMemoryBusinessUnitStateRequestSchema,
      responseSchema: InternalMemoryBusinessUnitStateResponseSchema,
    });
    expect(InternalMemoryBusinessUnitStateRequestSchema.parse({ context })).toEqual({ context });
    for (const field of ['projectId', 'buSlug', 'role']) {
      expect(InternalMemoryBusinessUnitStateRequestSchema.safeParse({ context, [field]: 'caller-choice' }).success).toBe(false);
    }
    expect(InternalMemoryBusinessUnitStateRequestSchema.safeParse({}).success).toBe(false);
    expect(InternalMemoryBusinessUnitStateRequestSchema.safeParse({ context: { ...context, role: 'director' } }).success).toBe(false);
  });

  it('s6530 fatti-del-reparto: production facts survive parsing and feed the single department derivation', () => {
    const parsed = InternalMemoryBusinessUnitStateResponseSchema.parse(listed);
    expect(parsed).toEqual(listed);
    if (parsed.outcome !== 'listed') throw new Error('Expected listed facts');
    const facts = parsed.departments[0]!;
    const result = deriveBusinessUnitStateSummary({
      ...facts, leadReviews: facts.leadReviews.map((review) => ({ scope: facts.scope, review })), sessionOutcomes: [],
    });
    expect(result).toEqual({
      scope,
      deliverables: [{
        key: 'design', versions: 2, latest: { version: 2, state: 'awaiting_decision', requestId: request2.requestId },
        latestApprovedVersion: 1,
      }],
      openDecisions: [{ requestId: request2.requestId, createdAt: request2.createdAt, deliveryRef: file2 }],
      receivedMaterials: [{
        assetId: receivedAsset.assetId, sha256: receivedAsset.sha256, name: receivedAsset.name, createdAt: receivedAsset.createdAt,
      }],
      sessions: [],
    });
    // A recorded approved/richiedi-modifiche outcome keeps its stored meaning; do not reinterpret old rows.
    expect(deriveAssetVersionStates(facts).map(({ version, state }) => [version, state]))
      .toEqual([[1, 'approved'], [2, 'awaiting_decision']]);
    const beforeSecondRequest = deriveBusinessUnitStateSummary({
      ...facts, decisions: facts.decisions.slice(0, 1),
      leadReviews: facts.leadReviews.map((review) => ({ scope: facts.scope, review })), sessionOutcomes: [],
    });
    expect(beforeSecondRequest.deliverables[0]!.latest.state).toBe('rejected_by_lead');

    const approvedFacts = InternalMemoryBusinessUnitStateResponseSchema.parse({
      ...listed, departments: [{ ...department, decisions: [department.decisions[0], {
        request: request2, outcome: {
          ...answer1, requestId: request2.requestId, subject: request2.subject, optionId: 'approva',
          decidedAt: '2026-11-11T11:30:00Z', sourceRef: 'message-dec_a2cdf8c3',
        },
      }] }],
    });
    if (approvedFacts.outcome !== 'listed') throw new Error('Expected listed facts');
    const approvedDepartment = approvedFacts.departments[0]!;
    expect(deriveAssetVersionStates(approvedDepartment).map(({ version, state }) => [version, state]))
      .toEqual([[1, 'superseded'], [2, 'approved']]);
    expect(deriveBusinessUnitStateSummary({
      ...approvedDepartment,
      leadReviews: approvedDepartment.leadReviews.map((review) => ({ scope: approvedDepartment.scope, review })),
      sessionOutcomes: [],
    }).deliverables).toEqual([{
      key: 'design', versions: 2,
      latest: { version: 2, state: 'approved', requestId: request2.requestId, decidedAt: '2026-11-11T11:30:00Z' },
      latestApprovedVersion: 2,
    }]);
  });

  it('s6530 fatti-del-reparto: a non-covered role gets no department and a Director can read departments', () => {
    expect(InternalMemoryBusinessUnitStateResponseSchema.safeParse({ ...listed, role: 'other' }).success).toBe(false);
    const empty = { outcome: 'listed', role: 'other', departments: [] };
    expect(InternalMemoryBusinessUnitStateResponseSchema.parse(empty)).toEqual(empty);
    expect(InternalMemoryBusinessUnitStateResponseSchema.parse({ ...listed, role: 'director' }))
      .toEqual({ ...listed, role: 'director' });
    expect(InternalMemoryBusinessUnitStateResponseSchema.safeParse({ ...listed, role: 'admin' }).success).toBe(false);
  });

  it('s6530 fatti-del-reparto: at most twenty departments are returned', () => {
    const departments = Array.from({ length: 20 }, (_, index) => ({
      ...department, scope: { ...scope, buSlug: `orto-unit-${index}` },
    }));
    expect(InternalMemoryBusinessUnitStateResponseSchema.safeParse({ ...listed, departments }).success).toBe(true);
    expect(InternalMemoryBusinessUnitStateResponseSchema.safeParse({ ...listed, departments: [...departments, department] }).success)
      .toBe(false);
  });

  it('s6530 fatti-del-reparto: oversized fact lists are refused rather than cut', () => {
    for (const [field, limit] of [['versions', 1000], ['decisions', 1000], ['leadReviews', 1000], ['assets', 200]] as const) {
      const items = Array.from({ length: limit }, () => department[field][0]!);
      expect(InternalMemoryBusinessUnitStateResponseSchema.safeParse({
        ...listed, departments: [{ ...department, [field]: items }],
      }).success).toBe(true);
      expect(InternalMemoryBusinessUnitStateResponseSchema.safeParse({
        ...listed, departments: [{ ...department, [field]: [...items, items[0]] }],
      }).success).toBe(false);
    }
  });

  it('s6530 fatti-del-reparto: an answer that is too large is a named refusal, never a cut list', () => {
    const refused = { outcome: 'refused', code: 'state_too_large' };
    expect(InternalMemoryBusinessUnitStateResponseSchema.parse(refused)).toEqual(refused);
    expect(InternalMemoryBusinessUnitStateResponseSchema.safeParse({ ...refused, code: 'unknown' }).success).toBe(false);
    expect(InternalMemoryBusinessUnitStateResponseSchema.safeParse({ ...refused, departments: [] }).success).toBe(false);
    expect(InternalMemoryBusinessUnitStateResponseSchema.safeParse({ ...listed, truncated: true }).success).toBe(false);
    expect(InternalMemoryBusinessUnitStateResponseSchema.safeParse({
      ...listed, departments: [{ ...department, extra: true }],
    }).success).toBe(false);
  });
});
