import { z } from 'zod';
import { DevSessionOutcomeSchema, type DevSessionOutcome } from '../capability/dev/session-outcome.js';
import { ToolErrorNatureSchema, ToolErrorNextMoveSchema } from '../capability/tool-call.js';
import { AssetRefSchema, type AssetRef } from './asset.js';
import {
  AssetVersionRecordSchema,
  AssetVersionStateSchema,
  assetVersionDecisionState,
  deriveAssetVersionStates,
  latestApprovedAssetVersion,
  type AssetVersionLeadReview,
  type AssetVersionRecord,
} from './asset-version.js';
import { DecisionRequestSchema, type DecisionOutcome, type DecisionRequest } from './decision-request.js';

/** The department whose state is summarised; every fact outside it is ignored. */
export const BusinessUnitStateScopeSchema = z.strictObject({
  tenantId: AssetVersionRecordSchema.shape.tenantId,
  organizationId: AssetVersionRecordSchema.shape.organizationId,
  projectId: AssetVersionRecordSchema.shape.projectId,
  buSlug: AssetVersionRecordSchema.shape.buSlug,
});
export type BusinessUnitStateScope = z.infer<typeof BusinessUnitStateScopeSchema>;

export const BusinessUnitStateSummarySchema = z.strictObject({
  scope: BusinessUnitStateScopeSchema,
  deliverables: z.array(z.strictObject({
    key: AssetVersionRecordSchema.shape.key,
    versions: z.number().int().min(1),
    latest: z.strictObject({
      version: AssetVersionRecordSchema.shape.version,
      state: AssetVersionStateSchema,
      requestId: DecisionRequestSchema.shape.requestId.optional(),
      decidedAt: z.iso.datetime({ offset: true }).optional(),
    }),
    latestApprovedVersion: AssetVersionRecordSchema.shape.version.nullable(),
  })),
  openDecisions: z.array(z.strictObject({
    requestId: DecisionRequestSchema.shape.requestId,
    createdAt: DecisionRequestSchema.shape.createdAt,
    deliveryRef: z.strictObject({ assetId: AssetRefSchema.shape.assetId, sha256: AssetRefSchema.shape.sha256 }),
    assetVersion: z.strictObject({
      key: AssetVersionRecordSchema.shape.key,
      version: AssetVersionRecordSchema.shape.version,
    }).optional(),
  })),
  receivedMaterials: z.array(z.strictObject({
    assetId: AssetRefSchema.shape.assetId,
    sha256: AssetRefSchema.shape.sha256,
    name: AssetRefSchema.shape.name,
    createdAt: AssetRefSchema.shape.createdAt,
  })),
  sessions: z.array(z.strictObject({
    sessionId: DevSessionOutcomeSchema.shape.sessionId,
    attempt: DevSessionOutcomeSchema.shape.attempt,
    state: DevSessionOutcomeSchema.shape.state,
    reasonCode: DevSessionOutcomeSchema.shape.reason.shape.code,
    nature: ToolErrorNatureSchema.optional(),
    nextMove: ToolErrorNextMoveSchema.optional(),
    executorVersion: DevSessionOutcomeSchema.shape.executorVersion,
    createdAt: DevSessionOutcomeSchema.shape.createdAt,
  })),
});
export type BusinessUnitStateSummary = z.infer<typeof BusinessUnitStateSummarySchema>;

type DeliveryDecision = { request: DecisionRequest; outcome: DecisionOutcome | null };
/** A lead review carries no scope of its own: it arrives paired with the scope it was recorded in. */
export type BusinessUnitStateLeadReview = { scope: BusinessUnitStateScope; review: AssetVersionLeadReview };
/** A session outcome carries no scope of its own: it arrives paired with the scope of the session's assignment. */
export type BusinessUnitStateSessionOutcome = { scope: BusinessUnitStateScope; outcome: DevSessionOutcome };

const sameScope = (a: BusinessUnitStateScope, b: BusinessUnitStateScope): boolean => a.tenantId === b.tenantId
  && a.organizationId === b.organizationId && a.projectId === b.projectId && a.buSlug === b.buSlug;

const byText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
const byInstant = (a: string, b: string): number => Date.parse(a) - Date.parse(b);

/**
 * One department's state, read from recorded facts only: no clock, no second state rule. Version states come
 * from `deriveAssetVersionStates`. Every fact outside the requested scope is ignored; facts whose record
 * carries no scope (lead reviews, session outcomes) arrive paired with the scope they were recorded in.
 */
export function deriveBusinessUnitStateSummary(input: {
  scope: BusinessUnitStateScope;
  versions: readonly AssetVersionRecord[];
  decisions: readonly DeliveryDecision[];
  leadReviews: readonly BusinessUnitStateLeadReview[];
  assets: readonly AssetRef[];
  sessionOutcomes: readonly BusinessUnitStateSessionOutcome[];
}): BusinessUnitStateSummary {
  const { scope } = input;
  const versions = input.versions.filter((record) => sameScope(record, scope));
  const decisions = input.decisions.filter(({ request }) => request.tenantId === scope.tenantId
    && request.organizationId === scope.organizationId && request.projectId === scope.projectId
    && request.subject?.kind === 'delivery' && request.subject.buSlug === scope.buSlug);
  const leadReviews = input.leadReviews
    .filter((entry) => sameScope(entry.scope, scope) && entry.review.buSlug === scope.buSlug)
    .map((entry) => entry.review);
  const states = deriveAssetVersionStates({ versions, decisions, leadReviews });

  const keys = new Map<string, typeof states>();
  for (const state of states) keys.set(state.key, [...(keys.get(state.key) ?? []), state]);
  const deliverables = [...keys.entries()].sort(([a], [b]) => byText(a, b)).map(([key, group]) => {
    const latest = group.reduce((best, state) => (state.version > best.version ? state : best));
    const approved = latestApprovedAssetVersion(group, { buSlug: scope.buSlug, key });
    return {
      key,
      versions: group.length,
      latest: {
        version: latest.version,
        state: latest.state,
        ...(latest.requestId === undefined ? {} : { requestId: latest.requestId }),
        ...(latest.decidedAt === undefined ? {} : { decidedAt: latest.decidedAt }),
      },
      latestApprovedVersion: approved?.version ?? null,
    };
  });

  const openDecisions = decisions.flatMap(({ request, outcome }) => {
    const { subject } = request;
    if (subject?.kind !== 'delivery' || assetVersionDecisionState(request, outcome) !== 'awaiting_decision') return [];
    return [{
      requestId: request.requestId,
      createdAt: request.createdAt,
      deliveryRef: { assetId: subject.deliveryRef.assetId, sha256: subject.deliveryRef.sha256 },
      ...(subject.assetVersion === undefined ? {} : { assetVersion: subject.assetVersion }),
    }];
  }).sort((a, b) => byInstant(a.createdAt, b.createdAt) || byText(a.requestId, b.requestId));

  const seenAssets = new Set<string>();
  const receivedMaterials = input.assets.filter((asset) => {
    if (asset.tenantId !== scope.tenantId || asset.projectId !== scope.projectId || asset.buSlug !== scope.buSlug
      || asset.origin.kind === 'session' || seenAssets.has(asset.assetId)) return false;
    seenAssets.add(asset.assetId);
    return true;
  }).map(({ assetId, sha256, name, createdAt }) => ({ assetId, sha256, name, createdAt }))
    .sort((a, b) => byInstant(a.createdAt, b.createdAt) || byText(a.assetId, b.assetId));

  const lastBySession = new Map<string, DevSessionOutcome>();
  for (const { scope: outcomeScope, outcome } of input.sessionOutcomes) {
    if (!sameScope(outcomeScope, scope)) continue;
    const previous = lastBySession.get(outcome.sessionId);
    if (previous === undefined || outcome.attempt > previous.attempt
      || (outcome.attempt === previous.attempt && byInstant(outcome.createdAt, previous.createdAt) > 0)) {
      lastBySession.set(outcome.sessionId, outcome);
    }
  }
  const sessions = [...lastBySession.values()].map((outcome) => ({
    sessionId: outcome.sessionId,
    attempt: outcome.attempt,
    state: outcome.state,
    reasonCode: outcome.reason.code,
    ...(outcome.disposition === undefined
      ? {}
      : { nature: outcome.disposition.nature, nextMove: outcome.disposition.nextMove }),
    executorVersion: outcome.executorVersion,
    createdAt: outcome.createdAt,
  })).sort((a, b) => Number(a.sessionId.slice(1)) - Number(b.sessionId.slice(1)));

  return BusinessUnitStateSummarySchema.parse({ scope, deliverables, openDecisions, receivedMaterials, sessions });
}
