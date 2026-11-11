import { z } from 'zod';
import { AssetKeySchema, AssetOriginSchema, AssetRefSchema, AssetVersionRefSchema } from './asset.js';
import {
  DecisionRequestSchema,
  decisionOutcomeMatchesSubject,
  type DecisionOutcome,
  type DecisionRequest,
} from './decision-request.js';
import { ParticipantAgentIdentitySchema } from './participant-binding.js';

/** Immutable file identity, shared with existing asset references. */
export const AssetVersionFileSchema = z.strictObject({
  assetId: AssetRefSchema.shape.assetId,
  sha256: AssetRefSchema.shape.sha256,
});
export type AssetVersionFile = z.infer<typeof AssetVersionFileSchema>;

export const AssetVersionProvenanceSchema = z.strictObject({
  createdBy: ParticipantAgentIdentitySchema,
  paperclipIssueId: z.uuid().optional(),
  sessionId: z.string().regex(/^R[1-9][0-9]*$/).optional(),
  repo: AssetOriginSchema.options[2].shape.repo,
  branch: z.string().min(1).optional(),
  commit: AssetOriginSchema.options[2].shape.commit,
  inputs: z.array(AssetVersionRefSchema).max(20).optional(),
}).superRefine((provenance, ctx) => {
  if ((provenance.repo === undefined) !== (provenance.commit === undefined)) {
    ctx.addIssue({ code: 'custom', path: ['repo'], message: 'repo and commit must be provided together' });
  }
  if (provenance.branch !== undefined && provenance.sessionId === undefined) {
    ctx.addIssue({ code: 'custom', path: ['branch'], message: 'branch requires a sessionId' });
  }
});
export type AssetVersionProvenance = z.infer<typeof AssetVersionProvenanceSchema>;

export const AssetVersionRecordSchema = z.strictObject({
  tenantId: AssetRefSchema.shape.tenantId,
  organizationId: DecisionRequestSchema.shape.organizationId,
  projectId: AssetRefSchema.shape.projectId,
  buSlug: AssetRefSchema.shape.buSlug.unwrap(),
  key: AssetKeySchema,
  version: AssetVersionRefSchema.shape.version,
  files: z.array(AssetVersionFileSchema).min(1).max(20).refine(
    (files) => new Set(files.map((file) => file.assetId)).size === files.length,
    { message: 'File assetIds must be unique within a version' },
  ),
  deliveryPackage: AssetVersionFileSchema.optional(),
  provenance: AssetVersionProvenanceSchema,
  recordedAt: AssetRefSchema.shape.createdAt,
});
export type AssetVersionRecord = z.infer<typeof AssetVersionRecordSchema>;

export const AssetVersionLeadReviewSchema = z.strictObject({
  buSlug: AssetVersionRecordSchema.shape.buSlug,
  key: AssetKeySchema,
  version: AssetVersionRefSchema.shape.version,
  verdict: z.enum(['ok', 'redo']),
  reason: z.string().min(3).max(2000).optional(),
  reviewedBy: ParticipantAgentIdentitySchema,
  reviewedAt: AssetRefSchema.shape.createdAt,
}).refine((review) => review.verdict !== 'redo' || review.reason !== undefined, {
  path: ['reason'], message: 'A redo review requires a reason',
});
export type AssetVersionLeadReview = z.infer<typeof AssetVersionLeadReviewSchema>;

export const ASSET_VERSION_STATES = [
  'delivered', 'rejected_by_lead', 'awaiting_decision', 'changes_requested', 'approved', 'superseded',
] as const;
export const AssetVersionStateSchema = z.enum(ASSET_VERSION_STATES);
export type AssetVersionState = z.infer<typeof AssetVersionStateSchema>;

export const ASSET_VERSION_TRANSITIONS: Readonly<Record<AssetVersionState, readonly AssetVersionState[]>> = {
  delivered: ['rejected_by_lead', 'awaiting_decision'],
  rejected_by_lead: [],
  awaiting_decision: ['approved', 'changes_requested'],
  changes_requested: [],
  approved: ['superseded'],
  superseded: [],
};

export function assetVersionTransitionAllowed(from: AssetVersionState, to: AssetVersionState): boolean {
  return ASSET_VERSION_TRANSITIONS[from].includes(to);
}

/** Latest request wins by creation instant, then by the greater requestId. */
export function isLaterDecisionRequest(a: DecisionRequest, b: DecisionRequest): boolean {
  const delta = Date.parse(a.createdAt) - Date.parse(b.createdAt);
  return delta !== 0 ? delta > 0 : a.requestId > b.requestId;
}

/** An unrelated answer is pending, an unsound approval has no decision state. */
export function assetVersionDecisionState(
  request: DecisionRequest, outcome: DecisionOutcome | null,
): 'awaiting_decision' | 'changes_requested' | 'approved' | null {
  if (outcome === null || outcome.requestId !== request.requestId) return 'awaiting_decision';
  if (outcome.outcome === 'rejected') return 'changes_requested';
  if (outcome.decidedBy.kind !== 'referent' || !decisionOutcomeMatchesSubject(request, outcome)) return null;
  return 'approved';
}

export type DerivedAssetVersionState = Pick<AssetVersionRecord, 'buSlug' | 'key' | 'version'> & {
  state: AssetVersionState;
  requestId?: DecisionRequest['requestId'];
  decidedAt?: DecisionOutcome['decidedAt'];
};

export const ASSET_VERSION_DUPLICATE = 'asset_version_duplicate' as const;

type AssetVersionDecision = { request: DecisionRequest; outcome: DecisionOutcome | null };
type VersionEntry = { record: AssetVersionRecord; result: DerivedAssetVersionState };

/** Derive a snapshot from recorded facts, without changing those facts or reading the clock. */
export function deriveAssetVersionStates(input: {
  versions: readonly AssetVersionRecord[];
  decisions: readonly AssetVersionDecision[];
  leadReviews: readonly AssetVersionLeadReview[];
}): DerivedAssetVersionState[] {
  const entries: VersionEntry[] = input.versions.map((record) => ({
    record,
    result: { buSlug: record.buSlug, key: record.key, version: record.version, state: 'delivered' },
  }));
  const groups = new Map<string, VersionEntry[]>();
  const seen = new Set<string>();
  for (const entry of entries) {
    const record = entry.record;
    const scope = [record.tenantId, record.organizationId, record.projectId, record.buSlug, record.key];
    const identity = JSON.stringify([...scope, record.version]);
    if (seen.has(identity)) throw new Error(`${ASSET_VERSION_DUPLICATE}: ${identity}`);
    seen.add(identity);
    const groupKey = JSON.stringify(scope);
    const group = groups.get(groupKey) ?? [];
    group.push(entry);
    groups.set(groupKey, group);
  }

  for (const group of groups.values()) {
    const scope = group[0]!.record;
    const latestDecisions = new Map<number, AssetVersionDecision>();
    for (const decision of input.decisions) {
      const { request } = decision;
      const { subject } = request;
      if (subject?.kind !== 'delivery'
        || request.tenantId !== scope.tenantId || request.organizationId !== scope.organizationId
        || request.projectId !== scope.projectId || subject.organizationId !== scope.organizationId
        || subject.projectId !== scope.projectId || subject.buSlug !== scope.buSlug) continue;

      let target: AssetVersionRecord | undefined;
      for (const { record } of group) {
        // A decision bound to an asset version belongs to that version only.
        if (subject.assetVersion !== undefined
          && (subject.assetVersion.key !== record.key || subject.assetVersion.version !== record.version)) continue;
        if (Date.parse(record.recordedAt) > Date.parse(request.createdAt)) continue;
        if (target !== undefined && record.version <= target.version) continue;
        const files = record.deliveryPackage === undefined ? record.files : [...record.files, record.deliveryPackage];
        if (files.some((file) => file.assetId === subject.deliveryRef.assetId && file.sha256 === subject.deliveryRef.sha256)) {
          target = record;
        }
      }
      if (target === undefined) continue;
      const previous = latestDecisions.get(target.version);
      if (previous === undefined || isLaterDecisionRequest(request, previous.request)) {
        latestDecisions.set(target.version, decision);
      }
    }

    for (const { record, result } of group) {
      const decision = latestDecisions.get(record.version);
      if (decision !== undefined) {
        result.state = assetVersionDecisionState(decision.request, decision.outcome) ?? 'awaiting_decision';
        result.requestId = decision.request.requestId;
        if (result.state !== 'awaiting_decision' && decision.outcome !== null) {
          result.decidedAt = decision.outcome.decidedAt;
        }
        continue;
      }

      // Reviews have no tenant fields and must be supplied from the caller's scoped history.
      let latestReview: AssetVersionLeadReview | undefined;
      for (const review of input.leadReviews) {
        if (review.buSlug !== record.buSlug || review.key !== record.key || review.version !== record.version) continue;
        if (latestReview === undefined || Date.parse(review.reviewedAt) > Date.parse(latestReview.reviewedAt)
          || (Date.parse(review.reviewedAt) === Date.parse(latestReview.reviewedAt) && review.verdict === 'redo')) {
          latestReview = review;
        }
      }
      if (latestReview?.verdict === 'redo') result.state = 'rejected_by_lead';
    }

    const latestApproved = latestApprovedAssetVersion(group.map((entry) => entry.result), scope);
    if (latestApproved === null) continue;
    for (const { result } of group) {
      if (result.state === 'approved' && result.version < latestApproved.version) result.state = 'superseded';
    }
  }
  return entries.map((entry) => entry.result);
}

export function latestApprovedAssetVersion(
  states: readonly DerivedAssetVersionState[], scope: Pick<AssetVersionRecord, 'buSlug' | 'key'>,
): DerivedAssetVersionState | null {
  let latest: DerivedAssetVersionState | null = null;
  for (const state of states) {
    if (state.buSlug !== scope.buSlug || state.key !== scope.key || state.state !== 'approved') continue;
    if (latest === null || state.version > latest.version) latest = state;
  }
  return latest;
}
