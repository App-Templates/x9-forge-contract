"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioCorpusSchema = exports.ScenarioVersionSchema = exports.ScenarioVersionRefSchema = void 0;
exports.assertScenarioMatchesCorpus = assertScenarioMatchesCorpus;
const zod_1 = require("zod");
const run_outcome_js_1 = require("./run-outcome.cjs");
/** Immutable scenario identity; content hashes are required and lowercase. */
exports.ScenarioVersionRefSchema = zod_1.z.strictObject({
    scenarioId: zod_1.z.string().min(1),
    version: zod_1.z.number().int().min(1),
    contentSha256: run_outcome_js_1.EvidenceRefSchema.shape.sha256.unwrap().regex(/^[a-f0-9]{64}$/),
});
exports.ScenarioVersionSchema = zod_1.z
    .strictObject({
    ...exports.ScenarioVersionRefSchema.shape,
    items: zod_1.z.array(zod_1.z.strictObject({
        itemId: zod_1.z.string().min(1),
        input: zod_1.z.string().min(1),
        expected: zod_1.z.string().min(1),
    })).min(1),
})
    .superRefine((scenario, ctx) => {
    const seen = new Set();
    scenario.items.forEach((item, index) => {
        if (seen.has(item.itemId)) {
            ctx.addIssue({
                code: 'custom',
                path: ['items', index, 'itemId'],
                message: 'itemId must be unique within a scenario',
            });
        }
        seen.add(item.itemId);
    });
});
exports.ScenarioCorpusSchema = zod_1.z
    .strictObject({
    corpusId: zod_1.z.string().min(1),
    scenarios: zod_1.z.array(exports.ScenarioVersionRefSchema).min(1),
})
    .superRefine((corpus, ctx) => {
    const seen = new Set();
    corpus.scenarios.forEach((scenario, index) => {
        if (seen.has(scenario.scenarioId)) {
            ctx.addIssue({
                code: 'custom',
                path: ['scenarios', index, 'scenarioId'],
                message: 'scenarioId must be unique within a corpus',
            });
        }
        seen.add(scenario.scenarioId);
    });
});
/** Checks that a scenario is the exact version pinned by the corpus. */
function assertScenarioMatchesCorpus(corpus, scenario) {
    const pinned = corpus.scenarios.find((s) => s.scenarioId === scenario.scenarioId);
    if (pinned === undefined)
        return { ok: false, reason: 'unknown_scenario' };
    if (pinned.version !== scenario.version)
        return { ok: false, reason: 'version_mismatch' };
    if (pinned.contentSha256 !== scenario.contentSha256)
        return { ok: false, reason: 'hash_mismatch' };
    return { ok: true };
}
//# sourceMappingURL=scenario.js.map