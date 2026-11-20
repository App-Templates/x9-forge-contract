import { describe, it, expect } from 'vitest';
import {
  SOCIAL_COSTS_TOOLS,
  SOCIAL_COSTS_REPORT_MAX_DAYS,
  SOCIAL_LISTENING_TOOLS,
  SocialCostsReportInputSchema,
  SocialCostsReportOutputSchema,
  SocialCostsToolErrorSchema,
} from '../../../src/capability/social-listening/index';

const input = { verticalId: 'ai', from: '2026-11-01', to: '2026-11-10' };
const author = { provider: 'instagram', handle: 'maker', verticalId: 'ai', addedAt: '2026-11-01T10:00:00Z', postsPerDay: 2, monthlyUsd: 5.25 };
const server1 = { day: '2026-11-08', track: 'server', postsSeen: 10, spentUsd: 0.875, costPerPostUsd: 0.0875 };
const server2 = { day: '2026-11-09', track: 'server', postsSeen: 10, spentUsd: 0.875, costPerPostUsd: 0.0875 };
const mac = { day: '2026-11-09', track: 'mac', postsSeen: 12, spentUsd: 0, costPerPostUsd: 0 };
const report = {
  verticalId: 'ai', from: '2026-11-01', to: '2026-11-10',
  rounds: [server1, server2, mac], serverCostPerPostUsd: 0.0875, authors: [author],
};
const ok = (o: unknown) => SocialCostsReportOutputSchema.safeParse(o).success;

describe('social_costs_report', () => {
  it('(a) input window: ordered, at most 90 days, calendar dates, strict', () => {
    expect(SocialCostsReportInputSchema.safeParse(input).success).toBe(true);
    expect(SocialCostsReportInputSchema.safeParse({ ...input, from: '2026-11-11' }).success).toBe(false);
    expect(SocialCostsReportInputSchema.safeParse({ ...input, from: '2026-08-01', to: '2026-10-29' }).success).toBe(true);
    expect(SocialCostsReportInputSchema.safeParse({ ...input, from: '2026-08-01', to: '2026-10-30' }).success).toBe(false);
    expect(SocialCostsReportInputSchema.safeParse({ ...input, from: '2026-02-30' }).success).toBe(false);
    expect(SocialCostsReportInputSchema.safeParse({ ...input, tenantId: 't' }).success).toBe(false);
  });

  it('(b) valid report with server and mac rounds and one author', () => {
    expect(ok(report)).toBe(true);
  });

  it('(c) round cost per post must follow spend over posts, null with zero posts', () => {
    expect(ok({ ...report, rounds: [{ ...server1, costPerPostUsd: 0.09 }, server2, mac] })).toBe(false);
    expect(ok({ ...report, rounds: [server1, server2, { ...mac, postsSeen: 0, costPerPostUsd: 0 }] })).toBe(false);
    expect(ok({ ...report, rounds: [server1, server2, { ...mac, postsSeen: 0, costPerPostUsd: null }] })).toBe(true);
  });

  it('(d) server cost per post must be the summed server rounds', () => {
    expect(ok({ ...report, serverCostPerPostUsd: 0.09, authors: [{ ...author, monthlyUsd: 5.4 }] })).toBe(false);
  });

  it('(e) mac only: server cost and monthly cost are null', () => {
    expect(ok({ ...report, rounds: [mac], serverCostPerPostUsd: null, authors: [{ ...author, monthlyUsd: null }] })).toBe(true);
  });

  it('(f) monthly cost must follow the rule', () => {
    expect(ok({ ...report, rounds: [mac], serverCostPerPostUsd: null })).toBe(false);
    expect(ok({ ...report, authors: [{ ...author, monthlyUsd: 5.2 }] })).toBe(false);
  });

  it('(g) rounds are unique and inside the window', () => {
    expect(ok({ ...report, rounds: [server1, server1, mac], serverCostPerPostUsd: 0.0875 })).toBe(false);
    expect(ok({ ...report, rounds: [{ ...server1, day: '2026-10-31' }, server2, mac] })).toBe(false);
  });

  it('(h) tool name, limits and errors are exported from the index', () => {
    expect(SOCIAL_COSTS_TOOLS.report).toBe('social_costs_report');
    expect(Object.values(SOCIAL_LISTENING_TOOLS)).not.toContain('social_costs_report');
    expect(SOCIAL_COSTS_REPORT_MAX_DAYS).toBe(90);
    expect(SocialCostsToolErrorSchema.options).toEqual(['invalid_request', 'not_configured', 'unknown_vertical']);
  });
});
