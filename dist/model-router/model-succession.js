import { z } from 'zod';
import { CapabilityModelIdSchema } from "../capability/ricerca/agent-config.js";
import { ModelCatalogProviderIdSchema, ModelFunctionSchema } from "./model-catalog.js";
/**
 * Model succession table: the single shape Forge (retired-model job) and X9
 * (retry after a provider 404) use to find the model that replaces a retired one.
 *
 * `band` and not `tier`: it must not be confused with `ModelTierSchema`
 * (standard/advanced/reasoning, `model-tier.ts`).
 */
export const MODEL_SUCCESSION_BANDS = ['nano', 'mini', 'standard', 'pro'];
export const ModelSuccessionBandSchema = z.enum(MODEL_SUCCESSION_BANDS);
export const ModelSuccessionRowSchema = z.object({
    provider: ModelCatalogProviderIdSchema,
    modelId: CapabilityModelIdSchema,
    function: ModelFunctionSchema,
    /** Model family inside the provider; the successor may belong to another line. */
    line: z.string().trim().min(1).max(64),
    band: ModelSuccessionBandSchema,
    /** `null` ends the chain: no successor approved. */
    successor: CapabilityModelIdSchema.nullable(),
    effectiveFrom: z.iso.date(),
    /** Provider announcement that justifies the row. */
    note: z.url(),
}).strict().superRefine((row, ctx) => {
    if (row.successor === row.modelId) {
        ctx.addIssue({ code: 'custom', path: ['successor'], message: 'A model cannot succeed itself' });
    }
});
const rowKey = (provider, modelId) => JSON.stringify([provider, modelId]);
/** Global rules of the table; an empty list means valid. */
export function successionTableIssues(rows) {
    const issues = [];
    const byKey = new Map();
    for (const row of rows) {
        const key = rowKey(row.provider, row.modelId);
        if (byKey.has(key))
            issues.push(`Duplicate row for ${row.provider}/${row.modelId}`);
        else
            byKey.set(key, row);
    }
    for (const row of rows) {
        if (row.successor === null)
            continue;
        const next = byKey.get(rowKey(row.provider, row.successor));
        if (!next) {
            issues.push(`Successor ${row.successor} of ${row.provider}/${row.modelId} is not a row of the same provider`);
        }
        else if (next.function !== row.function) {
            issues.push(`Successor ${row.successor} of ${row.provider}/${row.modelId} has another function`);
        }
    }
    const reported = new Set();
    for (const start of byKey.values()) {
        const seen = new Set();
        let current = start;
        while (current && current.successor !== null) {
            seen.add(rowKey(current.provider, current.modelId));
            const next = byKey.get(rowKey(current.provider, current.successor));
            if (next && seen.has(rowKey(next.provider, next.modelId))) {
                const key = rowKey(start.provider, start.modelId);
                if (!reported.has(key)) {
                    reported.add(key);
                    issues.push(`Cycle in the succession chain starting at ${start.provider}/${start.modelId}`);
                }
                break;
            }
            current = next;
        }
    }
    return issues;
}
export const ModelSuccessionTableSchema = z.array(ModelSuccessionRowSchema).max(500).superRefine((rows, ctx) => {
    for (const message of successionTableIssues(rows))
        ctx.addIssue({ code: 'custom', message });
});
/**
 * Rows approved by Stefano, one by one. Empty until then: with an empty table
 * every retirement is "no successor" (visible error), never an invented model.
 */
export const MODEL_SUCCESSION_TABLE = Object.freeze(ModelSuccessionTableSchema.parse([]));
export const NO_SUCCESSOR_CAUSES = ['not-in-table', 'end-of-line', 'none-usable'];
export const NoSuccessorCauseSchema = z.enum(NO_SUCCESSOR_CAUSES);
/**
 * Follows the chain from a retired model and returns the first usable row.
 * `usable` is the caller's decision (observed in the tenant, not retired, accepted
 * by the consumer). `not-in-table` is a warning only: never an automatic upgrade.
 */
export function resolveSuccessor(table, retired, usable) {
    const find = (provider, modelId) => table.find(row => row.provider === provider && row.modelId === modelId);
    let current = find(retired.provider, retired.modelId);
    if (!current)
        return { outcome: 'no-successor', reason: 'not-in-table' };
    let discarded = false;
    for (let hops = 1; hops <= table.length; hops += 1) {
        if (current.successor === null)
            break;
        const next = find(current.provider, current.successor);
        if (!next)
            break;
        if (usable(next))
            return { outcome: 'successor', row: next, hops };
        discarded = true;
        current = next;
    }
    return { outcome: 'no-successor', reason: discarded ? 'none-usable' : 'end-of-line' };
}
//# sourceMappingURL=model-succession.js.map