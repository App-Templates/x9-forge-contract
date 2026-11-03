import { z } from 'zod';
/** Immutable scenario identity; content hashes are required and lowercase. */
export declare const ScenarioVersionRefSchema: z.ZodObject<{
    scenarioId: z.ZodString;
    version: z.ZodNumber;
    contentSha256: z.ZodString;
}, z.core.$strict>;
export type ScenarioVersionRef = z.infer<typeof ScenarioVersionRefSchema>;
export declare const ScenarioVersionSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        itemId: z.ZodString;
        input: z.ZodString;
        expected: z.ZodString;
    }, z.core.$strict>>;
    scenarioId: z.ZodString;
    version: z.ZodNumber;
    contentSha256: z.ZodString;
}, z.core.$strict>;
export type ScenarioVersion = z.infer<typeof ScenarioVersionSchema>;
export declare const ScenarioCorpusSchema: z.ZodObject<{
    corpusId: z.ZodString;
    scenarios: z.ZodArray<z.ZodObject<{
        scenarioId: z.ZodString;
        version: z.ZodNumber;
        contentSha256: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ScenarioCorpus = z.infer<typeof ScenarioCorpusSchema>;
export type ScenarioCorpusMatch = {
    ok: true;
} | {
    ok: false;
    reason: 'unknown_scenario' | 'version_mismatch' | 'hash_mismatch';
};
/** Checks that a scenario is the exact version pinned by the corpus. */
export declare function assertScenarioMatchesCorpus(corpus: ScenarioCorpus, scenario: ScenarioVersionRef): ScenarioCorpusMatch;
//# sourceMappingURL=scenario.d.ts.map