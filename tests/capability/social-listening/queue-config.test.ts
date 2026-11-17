import { describe, it, expect } from 'vitest';
import {
  SocialJobSchema,
  SocialRoundSchema,
  SocialListeningAgentConfigSchema,
  SOCIAL_LISTENING_PARAMETERS,
  SOCIAL_LISTENING_PARAMETER_KEYS,
  SocialClockTimeSchema,
} from '../../../src/capability/social-listening/index';
import { CapabilityParametersDeclarationSchema } from '../../../src/capability/parameters';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const at = '2026-11-17T07:00:00+01:00';

const job = {
  identity,
  jobId: '3f2b8a52-6c1e-4d0a-9a53-0d5f0c3f6a11',
  kind: 'transcribe',
  state: 'queued',
  track: 'mac',
  day: '2026-11-17',
  verticalId: 'ai',
  postId: 'p1',
  attempts: 0,
  createdAt: at,
  updatedAt: at,
};

const round = {
  identity,
  verticalId: 'ai',
  day: '2026-11-17',
  track: 'mac',
  state: 'done',
  scheduledFor: at,
  startedAt: at,
  finishedAt: '2026-11-17T07:40:00+01:00',
  postsSeen: 120,
  topicsCount: 9,
  spentUsd: 0,
};

const config = {
  agentId: 'x9',
  version: 1,
  round: {
    runsOn: 'mac',
    localTime: '07:00',
    timezone: 'Europe/Rome',
    fallbackToServer: true,
    fallbackTime: '08:00',
    serverDailyCapUsd: 2,
  },
  research: { maxUsdPerResearch: 0.3, dailyCapUsd: 1 },
};

describe('SocialJobSchema', () => {
  it('(a) accepts a transcribe job with a post', () => {
    expect(SocialJobSchema.safeParse(job).success).toBe(true);
  });
  it('(a) rejects transcribe and filter without postId', () => {
    const { postId: _p, ...noPost } = job;
    expect(SocialJobSchema.safeParse(noPost).success).toBe(false);
    expect(SocialJobSchema.safeParse({ ...noPost, kind: 'filter' }).success).toBe(false);
    expect(SocialJobSchema.safeParse({ ...noPost, kind: 'collect' }).success).toBe(true);
  });
  it('(a) failed needs error, error only with failed', () => {
    expect(SocialJobSchema.safeParse({ ...job, state: 'failed' }).success).toBe(false);
    expect(SocialJobSchema.safeParse({ ...job, state: 'failed', error: 'timeout' }).success).toBe(true);
    expect(SocialJobSchema.safeParse({ ...job, state: 'done', error: 'timeout' }).success).toBe(false);
  });
  it('(a) attempts 0-10 only, strict, identity required', () => {
    expect(SocialJobSchema.safeParse({ ...job, attempts: 10 }).success).toBe(true);
    expect(SocialJobSchema.safeParse({ ...job, attempts: 11 }).success).toBe(false);
    expect(SocialJobSchema.safeParse({ ...job, extra: 1 }).success).toBe(false);
    expect(SocialJobSchema.safeParse({ ...job, identity: { tenantId: 't' } }).success).toBe(false);
    expect(SocialJobSchema.safeParse({ ...job, createdAt: '2026-11-17T07:00:00' }).success).toBe(false);
  });
});

describe('SocialRoundSchema', () => {
  it('(b) accepts a done round on the Mac', () => {
    expect(SocialRoundSchema.safeParse(round).success).toBe(true);
  });
  it('(b) finishedAt only with done, failed or cap_reached', () => {
    expect(SocialRoundSchema.safeParse({ ...round, state: 'running' }).success).toBe(false);
    expect(SocialRoundSchema.safeParse({ ...round, state: 'scheduled' }).success).toBe(false);
    expect(SocialRoundSchema.safeParse({ ...round, state: 'failed' }).success).toBe(true);
  });
  it('(b) handedToServerAt only on the server track', () => {
    const handed = { ...round, handedToServerAt: '2026-11-17T08:00:00+01:00' };
    expect(SocialRoundSchema.safeParse(handed).success).toBe(false);
    expect(SocialRoundSchema.safeParse({ ...handed, track: 'server' }).success).toBe(true);
  });
  it('(b) cap_reached only on the server with capUsd', () => {
    const capped = { ...round, state: 'cap_reached', track: 'server', capUsd: 2, spentUsd: 2 };
    expect(SocialRoundSchema.safeParse(capped).success).toBe(true);
    expect(SocialRoundSchema.safeParse({ ...capped, track: 'mac' }).success).toBe(false);
    const { capUsd: _c, ...noCap } = capped;
    expect(SocialRoundSchema.safeParse(noCap).success).toBe(false);
    expect(SocialRoundSchema.safeParse({ ...capped, capUsd: 0 }).success).toBe(false);
  });
  it('(b) incomplete identity and negative counts are rejected', () => {
    expect(SocialRoundSchema.safeParse({ ...round, identity: { tenantId: 't', ownerId: 'o' } }).success).toBe(false);
    expect(SocialRoundSchema.safeParse({ ...round, postsSeen: -1 }).success).toBe(false);
    expect(SocialRoundSchema.safeParse({ ...round, spentUsd: -0.1 }).success).toBe(false);
  });
});

describe('SOCIAL_LISTENING_PARAMETERS', () => {
  const byKey = new Map(SOCIAL_LISTENING_PARAMETERS.parameters.map(p => [p.key, p]));
  it('(c) passes the B1 declaration schema and keys match without duplicates', () => {
    expect(CapabilityParametersDeclarationSchema.safeParse(SOCIAL_LISTENING_PARAMETERS).success).toBe(true);
    expect(SOCIAL_LISTENING_PARAMETERS.consumes).toBe(true);
    expect(SOCIAL_LISTENING_PARAMETERS.spendLedger).toBe(true);
    const keys = SOCIAL_LISTENING_PARAMETERS.parameters.map(p => p.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect([...keys].sort()).toEqual([...SOCIAL_LISTENING_PARAMETER_KEYS].sort());
    expect(keys).toHaveLength(7);
  });
  it('(c) the owner choices have no default, the others do', () => {
    for (const key of ['round.runsOn', 'round.fallbackToServer']) {
      expect(byKey.get(key)?.platformDefault, key).toBeUndefined();
      expect(byKey.get(key)?.status, key).toBe('proposed');
    }
    for (const key of SOCIAL_LISTENING_PARAMETER_KEYS.filter(k => k !== 'round.runsOn' && k !== 'round.fallbackToServer')) {
      expect(byKey.get(key)?.platformDefault, key).toBeDefined();
    }
    expect(byKey.get('round.localTime')?.platformDefault).toBe('07:00');
    expect(byKey.get('round.fallbackTime')?.platformDefault).toBe('08:00');
    expect(byKey.get('round.serverDailyCapUsd')?.platformDefault).toBe(2);
    expect(byKey.get('research.maxUsdPerResearch')?.platformDefault).toBe(0.3);
    expect(byKey.get('research.dailyCapUsd')?.platformDefault).toBe(1);
    expect(byKey.get('round.localTime')?.status).toBe('decided');
    expect(byKey.get('research.dailyCapUsd')?.status).toBe('decided');
  });
  it('(c) the clock pattern of the parameters agrees with SocialClockTimeSchema', () => {
    for (const key of ['round.localTime', 'round.fallbackTime']) {
      const p = byKey.get(key);
      expect(p?.type).toBe('string');
      const re = new RegExp((p as { pattern: string }).pattern);
      expect(re.test('07:00')).toBe(true);
      expect(re.test('24:00')).toBe(false);
    }
  });
  it('(e) every key is a real path of the configuration and none is a credential', () => {
    for (const key of SOCIAL_LISTENING_PARAMETER_KEYS) {
      const value = key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], config);
      expect(value, key).toBeDefined();
      expect(key).not.toMatch(/key|token|secret|password|credential/i);
    }
  });
});

describe('SocialListeningAgentConfigSchema', () => {
  it('(d) accepts a complete configuration', () => {
    expect(SocialListeningAgentConfigSchema.safeParse(config).success).toBe(true);
  });
  it('(d) rejects a missing runsOn or fallbackToServer (no defaults)', () => {
    const { runsOn: _r, ...noRuns } = config.round;
    expect(SocialListeningAgentConfigSchema.safeParse({ ...config, round: noRuns }).success).toBe(false);
    const { fallbackToServer: _f, ...noFb } = config.round;
    expect(SocialListeningAgentConfigSchema.safeParse({ ...config, round: noFb }).success).toBe(false);
  });
  it('(d) fallbackTime must be after localTime', () => {
    expect(SocialListeningAgentConfigSchema.safeParse({ ...config, round: { ...config.round, fallbackTime: '06:30' } }).success).toBe(false);
    expect(SocialListeningAgentConfigSchema.safeParse({ ...config, round: { ...config.round, fallbackTime: '07:00' } }).success).toBe(false);
  });
  it('(d) rejects 24:00 and per-research above daily', () => {
    expect(SocialClockTimeSchema.safeParse('24:00').success).toBe(false);
    expect(SocialListeningAgentConfigSchema.safeParse({ ...config, round: { ...config.round, localTime: '24:00' } }).success).toBe(false);
    expect(SocialListeningAgentConfigSchema.safeParse({ ...config, research: { maxUsdPerResearch: 1.5, dailyCapUsd: 1 } }).success).toBe(false);
  });
  it('(d) rejects unknown timezone, extra fields, zero caps', () => {
    expect(SocialListeningAgentConfigSchema.safeParse({ ...config, round: { ...config.round, timezone: 'Nowhere/Land' } }).success).toBe(false);
    expect(SocialListeningAgentConfigSchema.safeParse({ ...config, extra: 1 }).success).toBe(false);
    expect(SocialListeningAgentConfigSchema.safeParse({ ...config, round: { ...config.round, serverDailyCapUsd: 0 } }).success).toBe(false);
  });
});
