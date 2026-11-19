import { describe, expect, it } from 'vitest';
import { RICERCA_TOOLS } from '../../../src/capability/ricerca/tools.js';
import {
  SOCIAL_JOB_KINDS,
  SOCIAL_JOB_TOOL,
  SOCIAL_SERVER_VERIFY_ESTIMATE_USD,
  socialCapDecision,
  socialJobRoute,
  socialServerVerifyEstimate,
  type SocialJobKind,
  type SocialJobRoute,
} from '../../../src/capability/social-listening/index.js';

describe('social job routing and server verification reservation', () => {
  it('(a) routes every Mac job through its existing laptop tool', () => {
    for (const kind of SOCIAL_JOB_KINDS) {
      expect(socialJobRoute(kind, 'mac')).toEqual({
        runner: 'executor', executor: 'laptop', tool: SOCIAL_JOB_TOOL[kind],
      });
    }
  });

  it('(b) routes all server jobs without Instagram cookies or Apple tools', () => {
    const expected: Record<SocialJobKind, SocialJobRoute> = {
      collect: { runner: 'service', source: 'meta_graph' },
      transcribe: { runner: 'capability', capability: 'stt', tool: 'transcribe' },
      verify: { runner: 'capability', capability: 'ricerca', tool: RICERCA_TOOLS.start },
      filter: { runner: 'executor', executor: 'server', tool: 'claude_p' },
      group: { runner: 'executor', executor: 'server', tool: 'claude_p' },
    };
    expect(RICERCA_TOOLS.start).toBe('research_start');
    for (const kind of SOCIAL_JOB_KINDS) {
      const route = socialJobRoute(kind, 'server');
      expect(route).toEqual(expected[kind]);
      if ('tool' in route) {
        expect(route.tool).not.toBe('ig_collect');
        expect(route.tool).not.toBe('mlx_whisper');
      }
    }
  });

  it('(c) rejects unknown tracks and job kinds with a TypeError', () => {
    for (const call of [
      () => socialJobRoute('collect', 'cloud' as never),
      () => socialJobRoute('publish' as never, 'mac'),
      () => socialJobRoute('publish' as never, 'server'),
      () => socialJobRoute('toString' as never, 'mac'),
    ]) {
      expect(call).toThrow(TypeError);
      expect(call).toThrow('unknown_job_route');
    }
  });

  it('(d) reserves at least the placeholder and ignores invalid observations', () => {
    expect(SOCIAL_SERVER_VERIFY_ESTIMATE_USD).toBe(0.25);
    expect(socialServerVerifyEstimate([])).toBe(0.25);
    expect(socialServerVerifyEstimate([0.1, 0.4])).toBe(0.4);
    expect(socialServerVerifyEstimate([NaN, -1, Infinity, 0.3])).toBe(0.3);
    expect(socialServerVerifyEstimate([NaN, -1, Infinity, -Infinity])).toBe(0.25);
    expect(socialServerVerifyEstimate([0, 0.1])).toBe(0.25);
  });

  it('(e) applies the verification reservation to the daily server cap', () => {
    const estimateUsd = socialServerVerifyEstimate([]);
    expect(socialCapDecision({ track: 'server', capUsd: 2, spentUsd: 1.8, estimateUsd }))
      .toEqual({ ok: false, reason: 'cap_reached', remainingUsd: 0.2 });
    expect(socialCapDecision({ track: 'server', capUsd: 2, spentUsd: 1.7, estimateUsd }))
      .toEqual({ ok: true, capped: true, remainingUsd: 0.3 });
  });
});
