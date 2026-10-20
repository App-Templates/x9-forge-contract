"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentModelSlotPositionsSchema = exports.AgentModelCustomPositionsSchema = exports.ModelPositionSchema = exports.MODEL_POSITIONS = void 0;
exports.canonicalModelPositions = canonicalModelPositions;
exports.isTieredModelSettings = isTieredModelSettings;
exports.changedModelPositions = changedModelPositions;
exports.mergeMasterModelPositions = mergeMasterModelPositions;
exports.followsMasterModelPositions = followsMasterModelPositions;
exports.remainingCustomPositions = remainingCustomPositions;
const zod_1 = require("zod");
const model_tier_js_1 = require("./model-tier.cjs");
const model_catalog_js_1 = require("./model-catalog.cjs");
const model_slot_js_1 = require("./model-slot.cjs");
/**
 * Inheritance from the Master row by row (Stefano 20/10 18:45): a tiered seat (the brain) is one row per tier plus its
 * fallback; a single-model seat is one row, the seat itself. A row stops following the Master ONLY when it is changed by
 * hand on the agent; every other row keeps following it, and a Master change updates it. «Risincronizza» on a row gives
 * it back to the Master.
 */
exports.MODEL_POSITIONS = [...model_tier_js_1.MODEL_TIERS, 'fallback'];
exports.ModelPositionSchema = zod_1.z.enum(exports.MODEL_POSITIONS);
/** Canonical order, no duplicates: the same set always serializes the same way. */
function canonicalModelPositions(positions) {
    const chosen = new Set(positions);
    return exports.MODEL_POSITIONS.filter(position => chosen.has(position));
}
/** The rows of one Master-bound seat that were changed by hand on the agent. Absent means every row follows the Master. */
exports.AgentModelCustomPositionsSchema = zod_1.z.array(exports.ModelPositionSchema).min(1).max(exports.MODEL_POSITIONS.length).superRefine((positions, ctx) => {
    if (JSON.stringify(positions) !== JSON.stringify(canonicalModelPositions(positions)))
        ctx.addIssue({ code: 'custom', message: 'Custom positions must be unique and in canonical order' });
});
/**
 * Durable per-agent record, beside the per-seat binding: seat → rows changed by hand while the seat follows the Master.
 * A record saved before per-row inheritance is `{}`: a Master-bound seat follows the Master on every row, a custom seat
 * stays custom on every row (nothing saved changes behaviour without a gesture).
 */
exports.AgentModelSlotPositionsSchema = zod_1.z.record(model_slot_js_1.ModelSlotIdSchema, exports.AgentModelCustomPositionsSchema);
/** Key order never decides an equality between two selections. */
const stable = (value) => JSON.stringify(value, (_key, entry) => entry !== null && typeof entry === 'object' && !Array.isArray(entry)
    ? Object.fromEntries(Object.entries(entry).sort(([left], [right]) => left.localeCompare(right))) : entry);
function isTieredModelSettings(settings) {
    return settings.mode === 'automatic' || settings.mode === 'pin';
}
function descriptorAtPosition(settings, position) {
    return position === 'fallback' ? settings.fallback : settings.tiers[position];
}
/** Rows whose model differs between two tiered selections; null when either seat is not tiered (it is one row). */
function changedModelPositions(before, after) {
    if (!isTieredModelSettings(before) || !isTieredModelSettings(after))
        return null;
    return exports.MODEL_POSITIONS.filter(position => !(0, model_catalog_js_1.sameModelDescriptor)(descriptorAtPosition(before, position), descriptorAtPosition(after, position)));
}
/**
 * The Master's selection with the agent's own model on its custom rows. With no custom row it is the Master's selection.
 * A pinned Master stays pinned only while every row still has one model; otherwise the tiers are kept as rows.
 */
function mergeMasterModelPositions(master, own, positions) {
    if (positions.length === 0)
        return master;
    if (!isTieredModelSettings(master) || !isTieredModelSettings(own))
        return own;
    const custom = new Set(positions);
    const at = (position) => descriptorAtPosition(custom.has(position) ? own : master, position);
    const tiers = Object.fromEntries(model_tier_js_1.MODEL_TIERS.map(tier => [tier, at(tier)]));
    const fallback = at('fallback');
    const { capability, function: fn, catalogVersion, requirements } = master;
    const single = exports.MODEL_POSITIONS.every(position => (0, model_catalog_js_1.sameModelDescriptor)(at(position), fallback));
    return master.mode === 'pin' && single
        ? { capability, function: fn, catalogVersion, requirements, tiers, fallback, mode: 'pin', pin: fallback }
        : { capability, function: fn, catalogVersion, requirements, tiers, fallback, mode: 'automatic' };
}
/** The agent's selection uses the Master's model on every row that is not custom (catalog version and mode aside). */
function followsMasterModelPositions(own, master, positions) {
    if (own.capability !== master.capability || own.function !== master.function || stable(own.requirements) !== stable(master.requirements))
        return false;
    if (positions.length === 0)
        return stable({ ...own, catalogVersion: undefined }) === stable({ ...master, catalogVersion: undefined });
    if (!isTieredModelSettings(own) || !isTieredModelSettings(master))
        return false;
    return exports.MODEL_POSITIONS.every(position => positions.includes(position) || (0, model_catalog_js_1.sameModelDescriptor)(descriptorAtPosition(own, position), descriptorAtPosition(master, position)));
}
/** Rows that follow the Master after a «Risincronizza» of `reset` on a seat whose custom rows are `custom` (all rows when null). */
function remainingCustomPositions(custom, reset) {
    if (reset === undefined)
        return [];
    return canonicalModelPositions((custom ?? exports.MODEL_POSITIONS).filter(position => !reset.includes(position)));
}
//# sourceMappingURL=model-positions.js.map