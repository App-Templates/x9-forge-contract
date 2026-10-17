/**
 * Pure compatibility check for S3's final configuration reread. Only an explicit
 * applied state qualifies; ready/pending do not attest an applied configuration.
 * This proves neither installation, consent, online presence nor an A11 signature/nonce.
 * The service must separately check the APPLIED capability manifest/context, a fresh
 * trusted lease and the execution permit before effects.
 */
export declare function isDevProductionJobForConfig(rawJob: unknown, rawConfigState: unknown): boolean;
/**
 * Pure metadata check that the owner's explicit per-role choices are still offered by a
 * trusted catalog for the job's own session at the injected clock. A job without
 * roleModels carries no evidence of a choice, so it is never usable here. Callers must
 * also use isDevProductionJobForConfig, A11 verification and the installation check
 * before any effect; this proves none of them.
 */
export declare function isDevProductionJobModelsUsable(rawJob: unknown, rawCatalog: unknown, nowMs: number): boolean;
//# sourceMappingURL=production-config-match.d.ts.map