import { z } from 'zod';
import type { CapabilityModelSettings } from "./capability-model-settings.js";
/**
 * Inheritance from the Master row by row (Stefano 20/10 18:45): a tiered seat (the brain) is one row per tier plus its
 * fallback; a single-model seat is one row, the seat itself. A row stops following the Master ONLY when it is changed by
 * hand on the agent; every other row keeps following it, and a Master change updates it. «Risincronizza» on a row gives
 * it back to the Master.
 */
export declare const MODEL_POSITIONS: readonly ["standard", "advanced", "reasoning", "fallback"];
export declare const ModelPositionSchema: z.ZodEnum<{
    standard: "standard";
    advanced: "advanced";
    reasoning: "reasoning";
    fallback: "fallback";
}>;
export type ModelPosition = z.infer<typeof ModelPositionSchema>;
/** Canonical order, no duplicates: the same set always serializes the same way. */
export declare function canonicalModelPositions(positions: Iterable<ModelPosition>): ModelPosition[];
/** The rows of one Master-bound seat that were changed by hand on the agent. Absent means every row follows the Master. */
export declare const AgentModelCustomPositionsSchema: z.ZodArray<z.ZodEnum<{
    standard: "standard";
    advanced: "advanced";
    reasoning: "reasoning";
    fallback: "fallback";
}>>;
export type AgentModelCustomPositions = z.infer<typeof AgentModelCustomPositionsSchema>;
/**
 * Durable per-agent record, beside the per-seat binding: seat → rows changed by hand while the seat follows the Master.
 * A record saved before per-row inheritance is `{}`: a Master-bound seat follows the Master on every row, a custom seat
 * stays custom on every row (nothing saved changes behaviour without a gesture).
 */
export declare const AgentModelSlotPositionsSchema: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodEnum<{
    standard: "standard";
    advanced: "advanced";
    reasoning: "reasoning";
    fallback: "fallback";
}>>>;
export type AgentModelSlotPositions = z.infer<typeof AgentModelSlotPositionsSchema>;
type TieredSettings = Extract<CapabilityModelSettings, {
    mode: 'automatic' | 'pin';
}>;
export declare function isTieredModelSettings(settings: CapabilityModelSettings): settings is TieredSettings;
/** Rows whose model differs between two tiered selections; null when either seat is not tiered (it is one row). */
export declare function changedModelPositions(before: CapabilityModelSettings, after: CapabilityModelSettings): ModelPosition[] | null;
/**
 * The Master's selection with the agent's own model on its custom rows. With no custom row it is the Master's selection.
 * A pinned Master stays pinned only while every row still has one model; otherwise the tiers are kept as rows.
 */
export declare function mergeMasterModelPositions(master: CapabilityModelSettings, own: CapabilityModelSettings, positions: readonly ModelPosition[]): CapabilityModelSettings;
/** The agent's selection uses the Master's model on every row that is not custom (catalog version and mode aside). */
export declare function followsMasterModelPositions(own: CapabilityModelSettings, master: CapabilityModelSettings, positions: readonly ModelPosition[]): boolean;
/** Rows that follow the Master after a «Risincronizza» of `reset` on a seat whose custom rows are `custom` (all rows when null). */
export declare function remainingCustomPositions(custom: readonly ModelPosition[] | null, reset: readonly ModelPosition[] | undefined): ModelPosition[];
export {};
//# sourceMappingURL=model-positions.d.ts.map