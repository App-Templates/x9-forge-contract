import { z } from 'zod';
/**
 * Model succession table: the single shape Forge (retired-model job) and X9
 * (retry after a provider 404) use to find the model that replaces a retired one.
 *
 * `band` and not `tier`: it must not be confused with `ModelTierSchema`
 * (standard/advanced/reasoning, `model-tier.ts`).
 */
export declare const MODEL_SUCCESSION_BANDS: readonly ["nano", "mini", "standard", "pro"];
export declare const ModelSuccessionBandSchema: z.ZodEnum<{
    standard: "standard";
    nano: "nano";
    mini: "mini";
    pro: "pro";
}>;
export type ModelSuccessionBand = z.infer<typeof ModelSuccessionBandSchema>;
export declare const ModelSuccessionRowSchema: z.ZodObject<{
    provider: z.ZodString;
    modelId: z.ZodString;
    function: z.ZodEnum<{
        reasoning: "reasoning";
        "memory-extraction": "memory-extraction";
        embedding: "embedding";
        tts: "tts";
        transcription: "transcription";
        voice: "voice";
    }>;
    line: z.ZodString;
    band: z.ZodEnum<{
        standard: "standard";
        nano: "nano";
        mini: "mini";
        pro: "pro";
    }>;
    successor: z.ZodNullable<z.ZodString>;
    effectiveFrom: z.ZodISODate;
    note: z.ZodURL;
}, z.core.$strict>;
export type ModelSuccessionRow = z.infer<typeof ModelSuccessionRowSchema>;
/** Global rules of the table; an empty list means valid. */
export declare function successionTableIssues(rows: readonly ModelSuccessionRow[]): string[];
export declare const ModelSuccessionTableSchema: z.ZodArray<z.ZodObject<{
    provider: z.ZodString;
    modelId: z.ZodString;
    function: z.ZodEnum<{
        reasoning: "reasoning";
        "memory-extraction": "memory-extraction";
        embedding: "embedding";
        tts: "tts";
        transcription: "transcription";
        voice: "voice";
    }>;
    line: z.ZodString;
    band: z.ZodEnum<{
        standard: "standard";
        nano: "nano";
        mini: "mini";
        pro: "pro";
    }>;
    successor: z.ZodNullable<z.ZodString>;
    effectiveFrom: z.ZodISODate;
    note: z.ZodURL;
}, z.core.$strict>>;
export type ModelSuccessionTable = z.infer<typeof ModelSuccessionTableSchema>;
/**
 * Rows approved by Stefano, one by one. Empty until then: with an empty table
 * every retirement is "no successor" (visible error), never an invented model.
 */
export declare const MODEL_SUCCESSION_TABLE: readonly ModelSuccessionRow[];
export declare const NO_SUCCESSOR_CAUSES: readonly ["not-in-table", "end-of-line", "none-usable"];
export declare const NoSuccessorCauseSchema: z.ZodEnum<{
    "not-in-table": "not-in-table";
    "end-of-line": "end-of-line";
    "none-usable": "none-usable";
}>;
export type NoSuccessorCause = z.infer<typeof NoSuccessorCauseSchema>;
export type SuccessorResolution = {
    outcome: 'successor';
    row: ModelSuccessionRow;
    hops: number;
} | {
    outcome: 'no-successor';
    reason: NoSuccessorCause;
};
/**
 * Follows the chain from a retired model and returns the first usable row.
 * `usable` is the caller's decision (observed in the tenant, not retired, accepted
 * by the consumer). `not-in-table` is a warning only: never an automatic upgrade.
 */
export declare function resolveSuccessor(table: readonly ModelSuccessionRow[], retired: {
    provider: string;
    modelId: string;
}, usable: (row: ModelSuccessionRow) => boolean): SuccessorResolution;
//# sourceMappingURL=model-succession.d.ts.map