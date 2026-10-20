import { z } from 'zod';
import { MODEL_TIERS } from "./model-tier.js";
import { sameModelDescriptor } from "./model-catalog.js";
import { ModelSlotIdSchema } from "./model-slot.js";
/**
 * Inheritance from the Master row by row (Stefano 20/10 18:45): a tiered seat (the brain) is one row per tier plus its
 * fallback; a single-model seat is one row, the seat itself. A row stops following the Master ONLY when it is changed by
 * hand on the agent; every other row keeps following it, and a Master change updates it. «Risincronizza» on a row gives
 * it back to the Master.
 */
export const MODEL_POSITIONS = [...MODEL_TIERS, 'fallback'];
export const ModelPositionSchema = z.enum(MODEL_POSITIONS);
/** Canonical order, no duplicates: the same set always serializes the same way. */
export function canonicalModelPositions(positions) {
    const chosen = new Set(positions);
    return MODEL_POSITIONS.filter(position => chosen.has(position));
}
/** The rows of one Master-bound seat that were changed by hand on the agent. Absent means every row follows the Master. */
export const AgentModelCustomPositionsSchema = z.array(ModelPositionSchema).min(1).max(MODEL_POSITIONS.length).superRefine((positions, ctx) => {
    if (JSON.stringify(positions) !== JSON.stringify(canonicalModelPositions(positions)))
        ctx.addIssue({ code: 'custom', message: 'Custom positions must be unique and in canonical order' });
});
/**
 * Durable per-agent record, beside the per-seat binding: seat → rows changed by hand while the seat follows the Master.
 * A record saved before per-row inheritance is `{}`: a Master-bound seat follows the Master on every row, a custom seat
 * stays custom on every row (nothing saved changes behaviour without a gesture).
 */
export const AgentModelSlotPositionsSchema = z.record(ModelSlotIdSchema, AgentModelCustomPositionsSchema);
/** Key order never decides an equality between two selections. */
const stable = (value) => JSON.stringify(value, (_key, entry) => entry !== null && typeof entry === 'object' && !Array.isArray(entry)
    ? Object.fromEntries(Object.entries(entry).sort(([left], [right]) => left.localeCompare(right))) : entry);
export function isTieredModelSettings(settings) {
    return settings.mode === 'automatic' || settings.mode === 'pin';
}
function descriptorAtPosition(settings, position) {
    return position === 'fallback' ? settings.fallback : settings.tiers[position];
}
/** Rows whose model differs between two tiered selections; null when either seat is not tiered (it is one row). */
export function changedModelPositions(before, after) {
    if (!isTieredModelSettings(before) || !isTieredModelSettings(after))
        return null;
    return MODEL_POSITIONS.filter(position => !sameModelDescriptor(descriptorAtPosition(before, position), descriptorAtPosition(after, position)));
}
/**
 * The Master's selection with the agent's own model on its custom rows. With no custom row it is the Master's selection.
 * A pinned Master stays pinned only while every row still has one model; otherwise the tiers are kept as rows.
 */
export function mergeMasterModelPositions(master, own, positions) {
    if (positions.length === 0)
        return master;
    if (!isTieredModelSettings(master) || !isTieredModelSettings(own))
        return own;
    const custom = new Set(positions);
    const at = (position) => descriptorAtPosition(custom.has(position) ? own : master, position);
    const tiers = Object.fromEntries(MODEL_TIERS.map(tier => [tier, at(tier)]));
    const fallback = at('fallback');
    const { capability, function: fn, catalogVersion, requirements } = master;
    const single = MODEL_POSITIONS.every(position => sameModelDescriptor(at(position), fallback));
    return master.mode === 'pin' && single
        ? { capability, function: fn, catalogVersion, requirements, tiers, fallback, mode: 'pin', pin: fallback }
        : { capability, function: fn, catalogVersion, requirements, tiers, fallback, mode: 'automatic' };
}
/** The agent's selection uses the Master's model on every row that is not custom (catalog version and mode aside). */
export function followsMasterModelPositions(own, master, positions) {
    if (own.capability !== master.capability || own.function !== master.function || stable(own.requirements) !== stable(master.requirements))
        return false;
    if (positions.length === 0)
        return stable({ ...own, catalogVersion: undefined }) === stable({ ...master, catalogVersion: undefined });
    if (!isTieredModelSettings(own) || !isTieredModelSettings(master))
        return false;
    return MODEL_POSITIONS.every(position => positions.includes(position) || sameModelDescriptor(descriptorAtPosition(own, position), descriptorAtPosition(master, position)));
}
/** Rows that follow the Master after a «Risincronizza» of `reset` on a seat whose custom rows are `custom` (all rows when null). */
export function remainingCustomPositions(custom, reset) {
    if (reset === undefined)
        return [];
    return canonicalModelPositions((custom ?? MODEL_POSITIONS).filter(position => !reset.includes(position)));
}
//# sourceMappingURL=model-positions.js.map