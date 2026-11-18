import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-identity.js';
import { SocialVerticalIdSchema } from './post.js';
import { SocialCategorySlugSchema } from './topic.js';
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
