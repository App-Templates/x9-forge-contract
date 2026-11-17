import { describe, expect, it } from 'vitest';
import {
  SOCIAL_LEGACY_ANALYSIS_SCHEMA,
  SOCIAL_LEGACY_CLUSTER_SCHEMA,
  SOCIAL_LEGACY_VERDICTS,
  SOCIAL_TOPIC_TITLE_MAX,
  SOCIAL_VERDICT_TRUTH_SCORE,
  SocialLegacyAnalysisRowSchema,
  SocialLegacyClusterRowSchema,
  SocialPostSchema,
  SocialTopicSchema,
  shortenSocialTopicTitle,
  socialImportKind,
  socialImportPost,
  socialImportTimestamp,
  socialImportTopic,
  socialImportVerdict,
} from '../../../src/capability/social-listening/index';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const links = [1, 2, 3].map(id => `https://example.com/post/${id}`);
const analysis = {
  schema: 'ig-ascolto-analisi-v1',
  analizzato_il: '2026-10-27T15:00:00+0000',
  pubblicato_il: '2026-10-27T14:31:00+0000',
  post_id: 'p1',
  profilo: 'creator.one',
  tipo: 'CAROUSEL_ALBUM',
  link: links[0],
  ripubblicazioni: [],
  didascalia: '',
  trascrizione: null,
  titolo: 'Un esempio di strumento',
  strumenti: [{ nome: 'Tool', link: 'https://example.com/tool', cosa_fa: 'Modifica testi.' }],
  verdetto: 'funzionale',
  perche: 'Il risultato è riproducibile.',
  per_stefano: 'Prova sul progetto.',
};
const cluster = {
  schema: 'ig-ascolto-cluster-v1',
  argomento: 'Skill di Claude Code e Claude: design, scrittura, montaggio',
  post_ids: ['p1', 'p2', 'p3'],
  sintesi: 'Le skill raccolgono procedure riutilizzabili.',
  fatti: ['Si installano localmente.', 'Hanno istruzioni.', 'Possono citare file.', 'Sono riutilizzabili.', 'Si possono modificare.'],
  link: links,
  verdetto: 'da provare',
  angolo_story: 'Una prova pratica.',
  verticale: 'ai',
  destinazioni: ['story'],
  creator: ['creator.one', 'creator.two', 'creator.three'],
  n_post: 3,
  ultimo_post: '2026-11-03T20:00:00+0100',
  calcolato_il: '2026-11-03T21:29:03+01:00',
  hype: 7.6,
  post: links.map((link, i) => ({ post_id: `p${i + 1}`, profilo: clusterHandle(i), link })),
};
const ctx = {
  identity,
  topicId: 'cluster-1',
  vertical: { id: 'ai', categories: [{ slug: 'coding', label: 'Coding' }] },
  category: 'coding',
};

function clusterHandle(index: number): string {
  return ['creator.one', 'creator.two', 'creator.three'][index];
}

describe('social-listening legacy import', () => {
  it('(a) imports a legacy carousel with null transcript and compact offsets', () => {
    expect(SOCIAL_LEGACY_ANALYSIS_SCHEMA).toBe('ig-ascolto-analisi-v1');
    const row = SocialLegacyAnalysisRowSchema.parse(analysis);
    const post = socialImportPost(row, { identity });
    expect(SocialPostSchema.safeParse(post).success).toBe(true);
    expect(post).toEqual({
      identity, postId: 'p1', provider: 'instagram', handle: 'creator.one', link: links[0],
      publishedAt: '2026-10-27T14:31:00+00:00', kind: 'carousel', caption: '',
      collectedAt: '2026-10-27T15:00:00+00:00',
    });
    expect(post).not.toHaveProperty('transcript');
  });

  it('(a) preserves full transcripts and accepts reposts, optional vertical and long titles', () => {
    const row = SocialLegacyAnalysisRowSchema.parse({
      ...analysis, tipo: 'VIDEO', verticale: 'ai', titolo: 't'.repeat(195),
      trascrizione: 'Testo trascritto.', ripubblicazioni: [links[1]],
    });
    expect(socialImportPost(row, { identity }).transcript).toBe('Testo trascritto.');
    expect(socialImportPost({ ...row, trascrizione: '' }, { identity })).not.toHaveProperty('transcript');
    expect(socialImportKind('VIDEO')).toBe('video');
    expect(socialImportKind('CAROUSEL_ALBUM')).toBe('carousel');
    expect(socialImportKind('IMAGE')).toBe('image');
  });

  it('(b) rejects unknown keys, wrong schema and unknown verdicts at every legacy boundary', () => {
    expect(SOCIAL_LEGACY_CLUSTER_SCHEMA).toBe('ig-ascolto-cluster-v1');
    for (const [schema, row] of [[SocialLegacyAnalysisRowSchema, analysis], [SocialLegacyClusterRowSchema, cluster]] as const) {
      for (const extra of [{ extra: true }, { schema: 'other-v1' }, { verdetto: 'ottimo' }, { identity }]) {
        expect(schema.safeParse({ ...row, ...extra }).success).toBe(false);
      }
    }
    expect(SocialLegacyAnalysisRowSchema.safeParse({
      ...analysis, strumenti: [{ ...analysis.strumenti[0], extra: true }],
    }).success).toBe(false);
    expect(SocialLegacyClusterRowSchema.safeParse({
      ...cluster, post: [{ ...cluster.post[0], extra: true }],
    }).success).toBe(false);
    expect(() => socialImportPost({ ...analysis, identity }, { identity })).toThrow();
    expect(socialImportTopic({ ...cluster, extra: true }, ctx)).toEqual({ ok: false, error: 'invalid_topic' });
  });

  it('(b) enforces legacy text, array, URL and scalar limits', () => {
    for (const patch of [
      { titolo: '' }, { titolo: 't'.repeat(301) }, { didascalia: 'c'.repeat(5001) },
      { trascrizione: 't'.repeat(60001) }, { post_id: 'p'.repeat(101) },
      { strumenti: Array.from({ length: 21 }, () => analysis.strumenti[0]) },
      { ripubblicazioni: Array.from({ length: 51 }, () => links[0]) },
      { link: 'file:///post' }, { profilo: '@creator' }, { tipo: 'REEL' },
      { pubblicato_il: '2026-02-30T12:00:00+0000' },
    ]) expect(SocialLegacyAnalysisRowSchema.safeParse({ ...analysis, ...patch }).success).toBe(false);
    for (const patch of [
      { argomento: '' }, { argomento: 't'.repeat(201) }, { sintesi: 's'.repeat(2001) },
      { post_ids: [] }, { post_ids: Array.from({ length: 101 }, () => 'p') },
      { fatti: [''] }, { fatti: ['f'.repeat(2001)] }, { link: [] },
      { link: Array.from({ length: 51 }, () => links[0]) }, { creator: [] },
      { creator: Array.from({ length: 51 }, () => 'creator') },
      { n_post: 0 }, { n_post: 1.5 }, { hype: -1 }, { hype: 10.1 },
    ]) expect(SocialLegacyClusterRowSchema.safeParse({ ...cluster, ...patch }).success).toBe(false);
  });

  it('(c) maps each legacy verdict to its exact verdict and truth score', () => {
    expect(SOCIAL_LEGACY_VERDICTS).toEqual({
      funzionale: 'funziona', 'da provare': 'da_provare', 'non funzionale': 'non_funziona', fuffa: 'fuffa',
    });
    const cases = [
      ['funzionale', 'funziona', 100], ['da provare', 'da_provare', 50],
      ['non funzionale', 'non_funziona', 0], ['fuffa', 'fuffa', 0],
    ] as const;
    for (const [legacy, expected, score] of cases) {
      expect(socialImportVerdict(legacy)).toBe(expected);
      expect(SOCIAL_VERDICT_TRUTH_SCORE[socialImportVerdict(legacy)]).toBe(score);
    }
  });

  it('(d) normalizes compact positive and negative offsets and rejects invalid dates', () => {
    expect(socialImportTimestamp('2026-10-27T14:31:00+0000')).toBe('2026-10-27T14:31:00+00:00');
    expect(socialImportTimestamp('2026-10-27T14:31:00+01:00')).toBe('2026-10-27T14:31:00+01:00');
    expect(socialImportTimestamp('2026-10-27T14:31:00-0530')).toBe('2026-10-27T14:31:00-05:30');
    for (const value of ['2026-13-40', '2026-02-30T12:00:00+0000', '2026-10-27T14:31:00', 'garbage']) {
      expect(socialImportTimestamp(value)).toBeNull();
    }
  });

  it('(e) shortens at a word boundary without ellipses or trailing punctuation', () => {
    expect(shortenSocialTopicTitle(cluster.argomento)).toBe('Skill di Claude Code e Claude');
    expect(shortenSocialTopicTitle('  Un titolo di 20 char  ')).toBe('Un titolo di 20 char');
    expect(shortenSocialTopicTitle('a'.repeat(40))).toBe('a'.repeat(31));
    expect(shortenSocialTopicTitle(`${'a'.repeat(28)}: more text`)).toBe('a'.repeat(28));
    for (const text of ['', '   ', ':'.repeat(40), 'a'.repeat(31), cluster.argomento]) {
      const title = shortenSocialTopicTitle(text);
      expect(title.trim().length).toBeGreaterThan(0);
      expect(title.length).toBeLessThanOrEqual(SOCIAL_TOPIC_TITLE_MAX);
      expect(title).not.toContain('…');
    }
  });

  it('(f) imports a full cluster with verdict, local day, sources, creators and uncertain Mac cost', () => {
    const row = SocialLegacyClusterRowSchema.parse(cluster);
    const result = socialImportTopic(row, ctx);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(SocialTopicSchema.safeParse(result.topic).success).toBe(true);
    expect(result.topic).toEqual({
      identity, topicId: ctx.topicId, verticalId: 'ai', day: '2026-11-03',
      title: 'Skill di Claude Code e Claude', category: 'coding', summary: cluster.sintesi,
      verdict: 'da_provare', facts: cluster.fatti.map(text => ({ text, sourceUrls: links })),
      sources: links.map(url => ({ url, opened: true })), heat: 7.6,
      postIds: cluster.post_ids, creators: cluster.creator,
      cost: { usd: 0, track: 'mac', uncertain: true }, computedAt: cluster.calcolato_il,
    });
    const functional = socialImportTopic({ ...row, verdetto: 'funzionale' }, ctx);
    expect(functional.ok && functional.topic.verdict).toBe('funziona');
    const compact = socialImportTopic({ ...row, calcolato_il: '2026-11-03T00:29:03+0100' }, ctx);
    expect(compact.ok && compact.topic.day).toBe('2026-11-03');
    expect(compact.ok && compact.topic.computedAt).toBe('2026-11-03T00:29:03+01:00');
  });

  it('(f) refuses a different vertical, unknown category, bad timestamps and invalid topics', () => {
    expect(socialImportTopic(cluster, { ...ctx, vertical: { ...ctx.vertical, id: 'other' } }))
      .toEqual({ ok: false, error: 'vertical_mismatch' });
    expect(socialImportTopic(cluster, { ...ctx, category: 'unknown' }))
      .toEqual({ ok: false, error: 'category_not_in_vertical' });
    for (const field of ['calcolato_il', 'ultimo_post']) {
      expect(socialImportTopic({ ...cluster, [field]: '2026-13-40' }, ctx))
        .toEqual({ ok: false, error: 'invalid_timestamp' });
    }
    expect(socialImportTopic({ ...cluster, fatti: Array.from({ length: 21 }, () => 'Fact') }, ctx))
      .toEqual({ ok: false, error: 'invalid_topic' });
    expect(socialImportTopic({ ...cluster, fatti: [] }, ctx)).toEqual({ ok: false, error: 'invalid_topic' });
    expect(socialImportTopic(cluster, { ...ctx, topicId: '' })).toEqual({ ok: false, error: 'invalid_topic' });
    for (const key of ['tenantId', 'ownerId', 'agentId'] as const) {
      const { [key]: _omitted, ...incomplete } = identity;
      expect(socialImportTopic(cluster, { ...ctx, identity: incomplete })).toEqual({ ok: false, error: 'invalid_topic' });
      expect(() => socialImportPost(analysis, { identity: incomplete })).toThrow();
    }
  });

  it('(f) uses at most the first twenty sources for each fact without dropping topic sources', () => {
    const sources = Array.from({ length: 25 }, (_, i) => `https://example.com/source/${i}`);
    const result = socialImportTopic({ ...cluster, link: sources }, ctx);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.topic.sources).toHaveLength(25);
    for (const fact of result.topic.facts) expect(fact.sourceUrls).toEqual(sources.slice(0, 20));
  });
});
