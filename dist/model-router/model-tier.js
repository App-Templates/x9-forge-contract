import { z } from 'zod';
/**
 * Model capability tiers — ordered from lowest to highest capability.
 *
 *   standard < advanced < reasoning
 *
 * NOTE: lexical order does NOT match capability priority (unlike VaultTier).
 * Use `TIER_ORDER` / `compareTiers` for comparisons.
 *
 * Adding a new tier (e.g. 'omni') is a BREAKING semantic change — it reorders
 * TIER_ORDER and every consumer must bump. See CONTEXT D-07.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see agent-x9/.planning/ROADMAP.md (Phase 35 Model Router ROUTER-01)
 * @see forge-v2/.planning/ROADMAP.md (Phase 10 — TBD post-freeze)
 */
export const MODEL_TIERS = ['standard', 'advanced', 'reasoning'];
export const ModelTierSchema = z.enum(MODEL_TIERS);
/** Logical order — low → high capability. Source of truth for compareTiers. */
export const TIER_ORDER = MODEL_TIERS;
/**
 * Compare two model tiers by capability order.
 * Returns -1 if `a < b`, 0 if equal, 1 if `a > b`.
 *
 * @example
 *   compareTiers('standard', 'reasoning') // -1
 *   compareTiers('advanced', 'advanced')  //  0
 *   compareTiers('reasoning', 'standard') //  1
 *
 * @see MODEL_TIERS — the canonical order.
 */
export function compareTiers(a, b) {
    const ai = TIER_ORDER.indexOf(a);
    const bi = TIER_ORDER.indexOf(b);
    if (ai < bi)
        return -1;
    if (ai > bi)
        return 1;
    return 0;
}
//# sourceMappingURL=model-tier.js.map