"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCIAL_COST_NEAR_TOLERANCE = exports.SOCIAL_OPTIMIZED_COST_PER_POST_USD = void 0;
exports.socialCostVsEstimate = socialCostVsEstimate;
/** Mirino estimate of the server cost per post for the optimized round (D10), until P0 replaces it with measured values. */
exports.SOCIAL_OPTIMIZED_COST_PER_POST_USD = { low: 0.08, high: 0.1 };
/** Provisional: "near" means not more than 50% above the estimate; to be confirmed after P0. */
exports.SOCIAL_COST_NEAR_TOLERANCE = 0.5;
const MICRO = 1e6;
/** Compares a measured cost per post with the optimized-round estimate, in microdollars; `null` on invalid input. */
function socialCostVsEstimate({ costPerPostUsd, estimateUsd = exports.SOCIAL_OPTIMIZED_COST_PER_POST_USD.high, tolerance = exports.SOCIAL_COST_NEAR_TOLERANCE, }) {
    if (!Number.isFinite(costPerPostUsd) || costPerPostUsd < 0)
        return null;
    if (!Number.isFinite(estimateUsd) || estimateUsd <= 0)
        return null;
    if (!Number.isFinite(tolerance) || tolerance < 0)
        return null;
    const costMicro = Math.round(costPerPostUsd * MICRO);
    const estimateMicro = Math.round(estimateUsd * MICRO);
    if (estimateMicro <= 0)
        return null;
    return {
        costPerPostUsd: costMicro / MICRO,
        estimateUsd: estimateMicro / MICRO,
        ratio: Math.round((costMicro / estimateMicro) * MICRO) / MICRO,
        near: costMicro <= Math.round(estimateMicro * (1 + tolerance)),
    };
}
//# sourceMappingURL=optimized-estimate.js.map