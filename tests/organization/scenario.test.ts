import { describe, expect, it } from 'vitest';
import {
  ScenarioCorpusSchema,
  ScenarioVersionRefSchema,
  ScenarioVersionSchema,
  type ScenarioCorpus,
  type ScenarioVersion,
  type ScenarioVersionRef,
} from '../../src/organization/index.js';

const ref: ScenarioVersionRef = {
  scenarioId: 'recall-private',
  version: 1,
  contentSha256: 'a1'.repeat(32),
};
const item = { itemId: 'owner-recall', input: 'Recall my preference', expected: 'Owner preference' };
const scenario: ScenarioVersion = { ...ref, items: [item] };
const corpus: ScenarioCorpus = { corpusId: 'memory-regression', scenarios: [ref] };

describe('versioned scenarios and corpora', () => {
  it('preserves valid payloads and accepts distinct identities', () => {
    expect(ScenarioVersionRefSchema.parse(ref)).toEqual(ref);
    expect(ScenarioVersionSchema.parse(scenario)).toEqual(scenario);
    expect(ScenarioCorpusSchema.parse(corpus)).toEqual(corpus);
    const multipleItems = { ...scenario, items: [item, { ...item, itemId: 'second' }] };
    expect(ScenarioVersionSchema.parse(multipleItems)).toEqual(multipleItems);
    const multipleScenarios = { ...corpus, scenarios: [ref, { ...ref, scenarioId: 'second' }] };
    expect(ScenarioCorpusSchema.parse(multipleScenarios)).toEqual(multipleScenarios);
  });

  it('rejects duplicate itemId even when content differs', () => {
    const result = ScenarioVersionSchema.safeParse({
      ...scenario, items: [item, { ...item, input: 'Different input', expected: 'Different result' }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({
        code: 'custom', path: ['items', 1, 'itemId'],
      }));
    }
  });

  it.each([1, 2])('rejects duplicate scenarioId with version %s', (version) => {
    const result = ScenarioCorpusSchema.safeParse({
      ...corpus, scenarios: [ref, { ...ref, version, contentSha256: 'b'.repeat(64) }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({
        code: 'custom', path: ['scenarios', 1, 'scenarioId'],
      }));
    }
  });

  it.each([
    { scenarioId: '' },
    { scenarioId: undefined },
    { version: 0 },
    { version: -1 },
    { version: 1.5 },
    { version: '1' },
    { version: undefined },
    { contentSha256: 'a'.repeat(63) },
    { contentSha256: 'a'.repeat(65) },
    { contentSha256: 'A'.repeat(64) },
    { contentSha256: 'g'.repeat(64) },
    { contentSha256: undefined },
    { extra: true },
  ])('rejects invalid identity in all three schemas: %j', (change) => {
    expect(ScenarioVersionRefSchema.safeParse({ ...ref, ...change }).success).toBe(false);
    expect(ScenarioVersionSchema.safeParse({ ...scenario, ...change }).success).toBe(false);
    expect(ScenarioCorpusSchema.safeParse({ ...corpus, scenarios: [{ ...ref, ...change }] }).success)
      .toBe(false);
  });

  it.each(['itemId', 'input', 'expected'])('requires nonempty item %s', (field) => {
    for (const value of ['', undefined]) {
      expect(ScenarioVersionSchema.safeParse({
        ...scenario, items: [{ ...item, [field]: value }],
      }).success).toBe(false);
    }
  });

  it('rejects extra item and corpus keys', () => {
    expect(ScenarioVersionSchema.safeParse({
      ...scenario, items: [{ ...item, extra: true }],
    }).success).toBe(false);
    expect(ScenarioCorpusSchema.safeParse({ ...corpus, extra: true }).success).toBe(false);
    expect(ScenarioVersionRefSchema.safeParse(scenario).success).toBe(false);
  });

  it('requires nonempty collections and a corpus identity', () => {
    for (const value of [[], undefined]) {
      expect(ScenarioVersionSchema.safeParse({ ...scenario, items: value }).success).toBe(false);
      expect(ScenarioCorpusSchema.safeParse({ ...corpus, scenarios: value }).success).toBe(false);
    }
    for (const corpusId of ['', undefined]) {
      expect(ScenarioCorpusSchema.safeParse({ ...corpus, corpusId }).success).toBe(false);
    }
  });
});
