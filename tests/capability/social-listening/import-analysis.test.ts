import { describe, expect, it } from 'vitest';
import {
  SOCIAL_IMPORT_ANALYSIS_ERRORS,
  SocialLegacyAnalysisRowSchema,
  SocialPostAnalysisSchema,
  SocialPostSchema,
  socialImportPost,
  socialImportPostAnalysis,
  socialImportPostWithAnalysis,
} from '../../../src/capability/social-listening/index';

const identity = { tenantId: 'tenant-social', ownerId: 'owner-social', agentId: 'agent-social' };
const row = {
  schema: 'ig-ascolto-analisi-v1',
  analizzato_il: '2026-11-17T10:30:00+0000',
  pubblicato_il: '2026-11-16T09:15:00+0000',
  post_id: 'post-22',
  profilo: 'example.creator',
  tipo: 'VIDEO',
  link: 'https://example.com/posts/22',
  ripubblicazioni: [],
  didascalia: 'A demonstration of tools for reviewing sources.',
  trascrizione: 'Compare the original sources before sharing the result.',
  titolo: 'A workflow for reviewing sources',
  strumenti: [
    { nome: 'Source reviewer', link: 'https://example.com/reviewer', cosa_fa: 'Reviews sources. '.repeat(20) },
    { nome: 'Local notes tool', link: '', cosa_fa: 'Collects local notes and keeps their references for later review.' },
    { nome: 'Reference browser', link: 'https://example.com/browser', cosa_fa: 'Opens source references.' },
  ],
  verdetto: 'funzionale',
  perche: `  ${'r'.repeat(444)}  `,
  per_stefano: `  ${'s'.repeat(182)}  `,
};

describe('s3619 legacy post analysis import', () => {
  it('s3619 maps a complete row and omits an empty tool link', () => {
    const result = socialImportPostWithAnalysis(row, { identity });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    const expected = {
      verdict: 'funziona',
      reason: row.perche.trim(),
      relevance: row.per_stefano.trim(),
      facts: [],
      tools: row.strumenti.map(tool => ({
        name: tool.nome,
        whatItDoes: tool.cosa_fa,
        ...(tool.link !== '' ? { link: tool.link } : {}),
      })),
      analyzedAt: '2026-11-17T10:30:00+00:00',
    };
    expect(result.post).toEqual({ ...socialImportPost(row, { identity }), analysis: expected });
    expect(result.post.publishedAt).toBe('2026-11-16T09:15:00+00:00');
    expect(result.post.analysis?.tools[1]).not.toHaveProperty('link');
    expect(SocialPostSchema.safeParse(result.post).success).toBe(true);
    expect(SocialPostAnalysisSchema.parse(result.post.analysis)).toEqual(expected);
    expect(socialImportPostAnalysis(row)).toEqual({ ok: true, analysis: expected });
  });

  it.each([
    ['funzionale', 'funziona'],
    ['da provare', 'da_provare'],
    ['non funzionale', 'non_funziona'],
    ['fuffa', 'fuffa'],
  ])('maps verdict %s to %s', (verdetto, expected) => {
    const result = socialImportPostAnalysis({ ...row, verdetto });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.analysis.verdict).toBe(expected);
  });

  it.each(['', '   '])('omits blank relevance %j', per_stefano => {
    const result = socialImportPostAnalysis({ ...row, per_stefano });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.analysis).not.toHaveProperty('relevance');
  });

  it.each([861, 2000])('preserves a reason of %i characters', length => {
    const reason = 'r'.repeat(length);
    const result = socialImportPostAnalysis({ ...row, perche: ` ${reason} ` });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.analysis.reason).toBe(reason);
  });

  it.each(['', ' \n '])('rejects an empty reason %j', perche => {
    const input = { ...row, perche };
    expect(socialImportPostAnalysis(input)).toEqual({ ok: false, error: 'empty_reason' });
    expect(socialImportPostWithAnalysis(input, { identity })).toEqual({ ok: false, error: 'empty_reason' });
  });

  it.each([
    ['oversized reason', { perche: 'r'.repeat(2001) }],
    ['oversized relevance', { per_stefano: 's'.repeat(1001) }],
    ['empty tool name', { strumenti: [{ nome: '', link: '', cosa_fa: 'Reviews sources.' }] }],
    ['oversized tool name', { strumenti: [{ nome: 'n'.repeat(201), link: '', cosa_fa: 'Reviews sources.' }] }],
    ['empty tool description', { strumenti: [{ nome: 'Source reviewer', link: '', cosa_fa: '' }] }],
    ['oversized tool description', { strumenti: [{ nome: 'Source reviewer', link: '', cosa_fa: 'w'.repeat(501) }] }],
  ] as const)('rejects %s without truncating data', (_name, patch) => {
    const input = { ...row, ...patch };
    expect(socialImportPostAnalysis(input)).toEqual({ ok: false, error: 'invalid_analysis' });
    expect(socialImportPostWithAnalysis(input, { identity })).toEqual({ ok: false, error: 'invalid_analysis' });
  });

  it('reports an invalid analysis timestamp', () => {
    const input = { ...row, analizzato_il: '2026-13-40' };
    expect(socialImportPostAnalysis(input)).toEqual({ ok: false, error: 'invalid_timestamp' });
    expect(socialImportPostWithAnalysis(input, { identity })).toEqual({ ok: false, error: 'invalid_timestamp' });
  });

  it.each([
    ['extra field', { ...row, extra: true }],
    ['foreign identity', { ...row, tenantId: 'foreign-tenant' }],
    ['different schema', { ...row, schema: 'other' }],
    ['text', 'not a row'],
    ['null', null],
    ['invalid publication date', { ...row, pubblicato_il: '2026-13-40' }],
    ['missing analysis date', { ...row, analizzato_il: undefined }],
    ['empty post link', { ...row, link: '' }],
    ['unsafe tool link', { ...row, strumenti: [{ ...row.strumenti[0], link: 'file:///tool' }] }],
    ['extra field and bad timestamp', { ...row, extra: true, analizzato_il: '2026-13-40' }],
  ])('rejects %s without throwing', (_name, input) => {
    expect(socialImportPostAnalysis(input)).toEqual({ ok: false, error: 'invalid_row' });
    expect(socialImportPostWithAnalysis(input, { identity })).toEqual({ ok: false, error: 'invalid_row' });
  });

  it.each(['tenantId', 'ownerId', 'agentId'] as const)('rejects a context without %s', key => {
    const { [key]: _omitted, ...incomplete } = identity;
    expect(socialImportPostWithAnalysis(row, { identity: incomplete })).toEqual({ ok: false, error: 'invalid_row' });
  });

  it.each([undefined, 'ai'])('accepts a row with vertical %s and preserves context identity', verticale => {
    const input = verticale === undefined ? row : { ...row, verticale };
    const result = socialImportPostWithAnalysis(input, { identity });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.post.identity).toEqual(identity);
  });

  it('preserves compatibility with posts imported without analysis', () => {
    expect(SocialLegacyAnalysisRowSchema.safeParse(row).success).toBe(true);
    const post = socialImportPost(row, { identity });
    expect(SocialPostSchema.safeParse(post).success).toBe(true);
    expect(post).not.toHaveProperty('analysis');
  });

  it('exports the four stable analysis error codes', () => {
    expect(SOCIAL_IMPORT_ANALYSIS_ERRORS).toEqual([
      'invalid_row', 'invalid_timestamp', 'empty_reason', 'invalid_analysis',
    ]);
  });
});
