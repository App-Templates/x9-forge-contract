import { z } from 'zod';
export declare const ModelsModeSchema: z.ZodEnum<{
    v1: "v1";
    v2: "v2";
}>;
export type ModelsMode = z.infer<typeof ModelsModeSchema>;
/**
 * Order of the effective-models copies of one agent. `presetId: null` = no preset yet (then `presetGeneration` is 0).
 * Two `presetGeneration` counters of different presets are never compared: see `compareModelsGeneration`.
 */
export declare const ModelsGenerationSchema: z.ZodObject<{
    presetId: z.ZodNullable<z.ZodNumber>;
    agentGeneration: z.ZodNumber;
    presetGeneration: z.ZodNumber;
}, z.core.$strict>;
export type ModelsGeneration = z.infer<typeof ModelsGenerationSchema>;
export type ModelsGenerationOrder = 'newer' | 'same' | 'older' | 'incomparable';
/**
 * How `next` (just received) relates to `current` (held). The receiver accepts only `newer`;
 * `same` = nothing to do, `older` = discard, `incomparable` = re-read from the vault.
 */
export declare function compareModelsGeneration(next: ModelsGeneration, current: ModelsGeneration): ModelsGenerationOrder;
export declare const ModelsEtagIdentitySchema: z.ZodObject<{
    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    vaultAgentId: z.ZodNumber;
}, z.core.$strict>;
export type ModelsEtagIdentity = z.infer<typeof ModelsEtagIdentitySchema>;
export interface ModelsEtagInput {
    mode: ModelsMode;
    identity: ModelsEtagIdentity;
    generation: ModelsGeneration;
}
/** `m2-<mode>-<vaultAgentId>-<presetId>-<agentGeneration>-<presetGeneration>-<hash>` (no HTTP quotes); `presetId` null prints `null`. */
export declare function modelsEtag(input: ModelsEtagInput): string;
/** The fields readable from an ETag (the hash cannot be re-checked without the identity); `null` if it is not ours. */
export declare function parseModelsEtag(value: unknown): {
    mode: ModelsMode;
    vaultAgentId: number;
    generation: ModelsGeneration;
} | null;
//# sourceMappingURL=models-generation.d.ts.map