import { z } from 'zod';
import { type DecisionOutcome, type DecisionRequest } from "./decision-request.cjs";
/** Immutable file identity, shared with existing asset references. */
export declare const AssetVersionFileSchema: z.ZodObject<{
    assetId: z.ZodString;
    sha256: z.ZodString;
}, z.core.$strict>;
export type AssetVersionFile = z.infer<typeof AssetVersionFileSchema>;
export declare const AssetVersionProvenanceSchema: z.ZodObject<{
    createdBy: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    paperclipIssueId: z.ZodOptional<z.ZodUUID>;
    sessionId: z.ZodOptional<z.ZodString>;
    repo: z.ZodOptional<z.ZodString>;
    branch: z.ZodOptional<z.ZodString>;
    commit: z.ZodOptional<z.ZodString>;
    inputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type AssetVersionProvenance = z.infer<typeof AssetVersionProvenanceSchema>;
export declare const AssetVersionRecordSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    projectId: z.ZodString;
    buSlug: z.ZodString;
    key: z.ZodString;
    version: z.ZodNumber;
    files: z.ZodArray<z.ZodObject<{
        assetId: z.ZodString;
        sha256: z.ZodString;
    }, z.core.$strict>>;
    deliveryPackage: z.ZodOptional<z.ZodObject<{
        assetId: z.ZodString;
        sha256: z.ZodString;
    }, z.core.$strict>>;
    provenance: z.ZodObject<{
        createdBy: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        paperclipIssueId: z.ZodOptional<z.ZodUUID>;
        sessionId: z.ZodOptional<z.ZodString>;
        repo: z.ZodOptional<z.ZodString>;
        branch: z.ZodOptional<z.ZodString>;
        commit: z.ZodOptional<z.ZodString>;
        inputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    recordedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type AssetVersionRecord = z.infer<typeof AssetVersionRecordSchema>;
export declare const ASSET_VERSION_REDO_REASON_MESSAGE = "A redo review requires a reason";
export declare function assetVersionRedoHasReason(review: {
    verdict: string;
    reason?: string | undefined;
}): boolean;
export declare const AssetVersionLeadReviewSchema: z.ZodObject<{
    buSlug: z.ZodString;
    key: z.ZodString;
    version: z.ZodNumber;
    verdict: z.ZodEnum<{
        ok: "ok";
        redo: "redo";
    }>;
    reason: z.ZodOptional<z.ZodString>;
    reviewedBy: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    reviewedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type AssetVersionLeadReview = z.infer<typeof AssetVersionLeadReviewSchema>;
export declare const ASSET_VERSION_STATES: readonly ["delivered", "rejected_by_lead", "awaiting_decision", "changes_requested", "approved", "superseded"];
export declare const AssetVersionStateSchema: z.ZodEnum<{
    approved: "approved";
    changes_requested: "changes_requested";
    delivered: "delivered";
    superseded: "superseded";
    rejected_by_lead: "rejected_by_lead";
    awaiting_decision: "awaiting_decision";
}>;
export type AssetVersionState = z.infer<typeof AssetVersionStateSchema>;
export declare const ASSET_VERSION_TRANSITIONS: Readonly<Record<AssetVersionState, readonly AssetVersionState[]>>;
export declare function assetVersionTransitionAllowed(from: AssetVersionState, to: AssetVersionState): boolean;
/** Latest request wins by creation instant, then by the greater requestId. */
export declare function isLaterDecisionRequest(a: DecisionRequest, b: DecisionRequest): boolean;
/** An unrelated answer is pending, an unsound approval has no decision state. */
export declare function assetVersionDecisionState(request: DecisionRequest, outcome: DecisionOutcome | null): 'awaiting_decision' | 'changes_requested' | 'approved' | null;
export type DerivedAssetVersionState = Pick<AssetVersionRecord, 'buSlug' | 'key' | 'version'> & {
    state: AssetVersionState;
    requestId?: DecisionRequest['requestId'];
    decidedAt?: DecisionOutcome['decidedAt'];
};
export declare const ASSET_VERSION_DUPLICATE: "asset_version_duplicate";
type AssetVersionDecision = {
    request: DecisionRequest;
    outcome: DecisionOutcome | null;
};
/** Derive a snapshot from recorded facts, without changing those facts or reading the clock. */
export declare function deriveAssetVersionStates(input: {
    versions: readonly AssetVersionRecord[];
    decisions: readonly AssetVersionDecision[];
    leadReviews: readonly AssetVersionLeadReview[];
}): DerivedAssetVersionState[];
export declare function latestApprovedAssetVersion(states: readonly DerivedAssetVersionState[], scope: Pick<AssetVersionRecord, 'buSlug' | 'key'>): DerivedAssetVersionState | null;
export {};
//# sourceMappingURL=asset-version.d.ts.map