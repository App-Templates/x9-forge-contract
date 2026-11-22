import { describe, expect, it } from 'vitest';
import { SocialJobResultSchema } from '../../../src/capability/social-listening/index.js';

// Verification fields reconstructed from the saved 03/11 topic shape; no live data is read.
const savedResult = {
  kind: 'verify',
  topicId: 'cluster-1',
  verdict: 'da_provare',
  summary: 'Le skill di Claude Code per design, scrittura e montaggio.',
  facts: [{ text: 'Le skill si installano da una cartella.', sourceUrls: ['https://example.com/post/1'] }],
  sources: [{ url: 'https://example.com/post/1', title: 'Post', opened: true }],
};
const unsupported = {
  postId: 'p1',
  verdict: 'fuffa',
  reason: 'The post promises results without showing evidence.',
  tools: [],
};
const demonstrated = {
  postId: 'p2',
  verdict: 'funziona',
  reason: 'The demonstration reproduces the documented workflow.',
  relevance: 'Useful for design and editing workflows.',
  tools: [
    { name: 'Design tool', link: 'https://example.com/tool', whatItDoes: 'Builds interfaces from a brief.' },
    { name: 'Local editor', whatItDoes: 'Edits the generated files.' },
  ],
};

describe('s9897 verify-post-analyses', () => {
  it('s9897 preserves analyses for two posts and tools with and without links', () => {
    const postAnalyses = [unsupported, demonstrated];
    const result = { ...savedResult, postAnalyses };
    expect(SocialJobResultSchema.parse(result)).toEqual(result);
  });

  it('s9897 accepts the legacy 03/11 result without postAnalyses (M1)', () => {
    const parsed = SocialJobResultSchema.parse(savedResult);
    expect(parsed).toEqual(savedResult);
    expect(parsed).not.toHaveProperty('postAnalyses');
  });

  it('s9897 accepts an empty analysis array', () => {
    const result = { ...savedResult, postAnalyses: [] };
    expect(SocialJobResultSchema.parse(result)).toEqual(result);
  });

  it('s9897 accepts exactly ten distinct post analyses', () => {
    const postAnalyses = Array.from({ length: 10 }, (_, i) => ({ ...unsupported, postId: `p${i + 1}` }));
    const result = { ...savedResult, postAnalyses };
    expect(SocialJobResultSchema.parse(result)).toEqual(result);
  });

  it.each([
    ['duplicate postId (M2)', [unsupported, { ...demonstrated, postId: unsupported.postId }]],
    ['unknown verdict', [{ ...unsupported, verdict: 'perhaps' }]],
    ['empty reason', [{ ...unsupported, reason: '' }]],
    ['non-web tool link', [{
      ...unsupported,
      tools: [{ name: 'Tool', link: 'ftp://example.com/tool', whatItDoes: 'Checks a claim.' }],
    }]],
    ['extra analysis key', [{ ...unsupported, extra: true }]],
    ['eleven distinct analyses (M3)', Array.from({ length: 11 }, (_, i) => ({
      ...unsupported, postId: `p${i + 1}`,
    }))],
  ])('s9897 rejects %s', (_name, postAnalyses) => {
    expect(SocialJobResultSchema.safeParse({ ...savedResult, postAnalyses }).success).toBe(false);
  });
});
