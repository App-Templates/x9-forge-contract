import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-identity.js';
import { SocialVerticalIdSchema } from './post.js';
import { SOCIAL_TRACKS, SocialCategorySlugSchema, SocialTrackSchema, type SocialTrack } from './topic.js';
import { SocialFactSchema } from './verdict.js';

/** Normalised fact text: lowercase, no accents, no punctuation, single spaces. */
export function socialFactKey(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const SocialFactKeySchema = z.string().min(1).max(300);

export const SocialVerifiedFactSchema = z.object({
  identity: CapabilityAgentScopeSchema,
  verticalId: SocialVerticalIdSchema,
  category: SocialCategorySlugSchema,
  factKey: SocialFactKeySchema,
  fact: SocialFactSchema,
  topicId: z.string().min(1).max(100),
  verifiedAt: z.iso.datetime({ offset: true }),
}).strict();
export type SocialVerifiedFact = z.infer<typeof SocialVerifiedFactSchema>;

export const SOCIAL_FACT_MEMORY_MAX_AGE_DAYS = 30;
const DAY_MS = 86_400_000;

/** True when `verifiedAt` is at most `maxAgeDays` before `nowIso` and not after it. */
export function socialFactFresh(
  row: Pick<SocialVerifiedFact, 'verifiedAt'>,
  nowIso: string,
  maxAgeDays: number = SOCIAL_FACT_MEMORY_MAX_AGE_DAYS,
): boolean {
  try {
    const at = z.iso.datetime({ offset: true }).safeParse(row?.verifiedAt);
    const now = z.iso.datetime({ offset: true }).safeParse(nowIso);
    if (!at.success || !now.success || !Number.isFinite(maxAgeDays) || maxAgeDays < 0) return false;
    const age = Date.parse(now.data) - Date.parse(at.data);
    return age >= 0 && age <= maxAgeDays * DAY_MS;
  } catch {
    return false;
  }
}

/** Cost of one post in USD, 6 decimals (microdollars); `null` when no post was seen. */
export function socialCostPerPost({ spentUsd, postsSeen }: { spentUsd: number; postsSeen: number }): number | null {
  if (!Number.isFinite(spentUsd) || spentUsd < 0 || !Number.isInteger(postsSeen) || postsSeen <= 0) return null;
  return Math.round((Math.round(spentUsd * 1e6) / postsSeen)) / 1e6;
}

export const SOCIAL_MEASUREMENT_KINDS = ['post_analysis', 'extended_research'] as const;

/** One P0 observation; Mac work consumes subscription quota rather than dollars. */
export const SocialCostMeasurementSchema = z.strictObject({
  measurementId: z.string().min(1).max(100),
  track: SocialTrackSchema,
  kind: z.enum(SOCIAL_MEASUREMENT_KINDS),
  postId: z.string().min(1).max(100).optional(),
  usd: z.number().nonnegative().finite(),
  durationSec: z.number().nonnegative().finite(),
  quality: z.number().int().min(1).max(5).optional(),
  measuredAt: z.iso.datetime({ offset: true }),
  note: z.string().max(500).optional(),
}).superRefine((row, ctx) => {
  if (row.track === 'mac' && row.usd !== 0) {
    ctx.addIssue({ code: 'custom', path: ['usd'], message: 'Mac measurements must cost zero dollars' });
  }
  if (row.kind === 'post_analysis' && row.postId === undefined) {
    ctx.addIssue({ code: 'custom', path: ['postId'], message: 'Post analysis requires a post id' });
  }
});

export const SOCIAL_DAYS_PER_MONTH = 30;

/** D8: monthly cost per followed author, calculated in microdollars. */
export function socialMonthlyCostPerAuthor({ postsPerDay, costPerPostUsd }: {
  postsPerDay: number;
  costPerPostUsd: number;
}): number | null {
  if (!Number.isFinite(postsPerDay) || postsPerDay < 0) return null;
  const cost = socialCostPerPost({ spentUsd: costPerPostUsd, postsSeen: 1 });
  if (cost === null) return null;
  const monthlyMicrodollars = Math.round(cost * 1e6) * postsPerDay * SOCIAL_DAYS_PER_MONTH;
  return Number.isFinite(monthlyMicrodollars) ? Math.round(monthlyMicrodollars) / 1e6 : null;
}

/** Valid observations only, ordered by track and then measurement kind. */
export function socialMeasurementSummary(rows: unknown[]): {
  track: SocialTrack;
  kind: (typeof SOCIAL_MEASUREMENT_KINDS)[number];
  count: number;
  avgUsd: number;
  avgDurationSec: number;
}[] {
  const valid = rows.flatMap(row => {
    const parsed = SocialCostMeasurementSchema.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });
  return SOCIAL_TRACKS.flatMap(track => SOCIAL_MEASUREMENT_KINDS.flatMap(kind => {
    const group = valid.filter(row => row.track === track && row.kind === kind);
    const count = group.length;
    if (count === 0) return [];
    const avgUsd = socialCostPerPost({
      spentUsd: group.reduce((sum, row) => sum + row.usd, 0), postsSeen: count,
    });
    // A nonempty group of validated observations satisfies the cost helper's inputs.
    if (avgUsd === null) return [];
    const avgDurationSec = Math.round((group.reduce((sum, row) => sum + row.durationSec, 0) / count) * 1e6) / 1e6;
    return [{ track, kind, count, avgUsd, avgDurationSec }];
  }));
}
