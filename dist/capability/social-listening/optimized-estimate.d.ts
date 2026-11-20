/** Mirino estimate of the server cost per post for the optimized round (D10), until P0 replaces it with measured values. */
export declare const SOCIAL_OPTIMIZED_COST_PER_POST_USD: {
    readonly low: 0.08;
    readonly high: 0.1;
};
/** Provisional: "near" means not more than 50% above the estimate; to be confirmed after P0. */
export declare const SOCIAL_COST_NEAR_TOLERANCE = 0.5;
/** Compares a measured cost per post with the optimized-round estimate, in microdollars; `null` on invalid input. */
export declare function socialCostVsEstimate({ costPerPostUsd, estimateUsd, tolerance, }: {
    costPerPostUsd: number;
    estimateUsd?: number;
    tolerance?: number;
}): {
    costPerPostUsd: number;
    estimateUsd: number;
    ratio: number;
    near: boolean;
} | null;
//# sourceMappingURL=optimized-estimate.d.ts.map