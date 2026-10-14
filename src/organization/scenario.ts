import { z } from 'zod';
import { EvidenceRefSchema } from './run-outcome.js';

/** Immutable scenario identity; content hashes are required and lowercase. */
export const ScenarioVersionRefSchema = z.strictObject({
  scenarioId: z.string().min(1),
  version: z.number().int().min(1),
  contentSha256: EvidenceRefSchema.shape.sha256.unwrap().regex(/^[a-f0-9]{64}$/),
});
export type ScenarioVersionRef = z.infer<typeof ScenarioVersionRefSchema>;

export const ScenarioVersionSchema = z
  .strictObject({
    ...ScenarioVersionRefSchema.shape,
    items: z.array(z.strictObject({
      itemId: z.string().min(1),
      input: z.string().min(1),
      expected: z.string().min(1),
    })).min(1),
  })
  .superRefine((scenario, ctx) => {
    const seen = new Set<string>();
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
export type ScenarioVersion = z.infer<typeof ScenarioVersionSchema>;

export const ScenarioCorpusSchema = z
  .strictObject({
    corpusId: z.string().min(1),
    scenarios: z.array(ScenarioVersionRefSchema).min(1),
  })
  .superRefine((corpus, ctx) => {
    const seen = new Set<string>();
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
export type ScenarioCorpus = z.infer<typeof ScenarioCorpusSchema>;

export type ScenarioCorpusMatch =
  | { ok: true }
  | { ok: false; reason: 'unknown_scenario' | 'version_mismatch' | 'hash_mismatch' };

/** Checks that a scenario is the exact version pinned by the corpus. */
export function assertScenarioMatchesCorpus(
  corpus: ScenarioCorpus,
  scenario: ScenarioVersionRef,
): ScenarioCorpusMatch {
  const pinned = corpus.scenarios.find((s) => s.scenarioId === scenario.scenarioId);
  if (pinned === undefined) return { ok: false, reason: 'unknown_scenario' };
  if (pinned.version !== scenario.version) return { ok: false, reason: 'version_mismatch' };
  if (pinned.contentSha256 !== scenario.contentSha256) return { ok: false, reason: 'hash_mismatch' };
  return { ok: true };
}
