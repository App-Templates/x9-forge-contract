import { z } from 'zod';
import { AgentDaySchema } from '../ricerca/spend.js';
import { socialCostPerPost } from './fact-memory.js';
import { socialCostVsEstimate } from './optimized-estimate.js';
import { SocialTrackSchema } from './topic.js';

/** What the optimized round did: filter outcome, topics, facts reused vs paid, cost against the estimate (D19). */
export const SocialRoundOptimizationSchema = z
  .strictObject({
    day: AgentDaySchema,
    track: SocialTrackSchema,
    postsSeen: z.int().min(0),
    postsKept: z.int().min(0),
    postsDiscarded: z.int().min(0),
    /** Posts that never went through the filter (rounds saved before the filter existed). */
    postsUnfiltered: z.int().min(0),
    /** Kept / (kept + discarded), 6 decimals; null when no post was filtered. */
    keepRatio: z.number().min(0).max(1).nullable(),
    topics: z.int().min(0),
    factsReused: z.int().min(0),
    factsNew: z.int().min(0),
    spentUsd: z.number().nonnegative().finite(),
    costPerPostUsd: z.number().nonnegative().finite().nullable(),
    /** Server track only (the Mac consumes subscription quota, D8). */
    vsEstimate: z
      .strictObject({
        estimateUsd: z.number().positive().finite(),
        ratio: z.number().nonnegative().finite(),
        near: z.boolean(),
      })
      .nullable(),
  })
  .refine((r) => r.postsKept + r.postsDiscarded + r.postsUnfiltered === r.postsSeen, {
    message: 'posts_sum_mismatch',
    path: ['postsSeen'],
  });
export type SocialRoundOptimization = z.infer<typeof SocialRoundOptimizationSchema>;

/** Builds the optimization report of one round; throws `filtered_posts_exceed_seen` when kept + discarded > seen. */
export function socialRoundOptimization(input: {
  day: string;
  track: z.infer<typeof SocialTrackSchema>;
  postsSeen: number;
  postsKept: number;
  postsDiscarded: number;
  topics: number;
  factsReused: number;
  factsNew: number;
  spentUsd: number;
  estimateUsd?: number;
}): SocialRoundOptimization {
  const postsUnfiltered = input.postsSeen - input.postsKept - input.postsDiscarded;
  if (postsUnfiltered < 0) throw new Error('filtered_posts_exceed_seen');
  const filtered = input.postsKept + input.postsDiscarded;
  const keepRatio = filtered > 0 ? Math.round((input.postsKept / filtered) * 1e6) / 1e6 : null;
  const costPerPostUsd = socialCostPerPost({ spentUsd: input.spentUsd, postsSeen: input.postsSeen });
  const compared =
    input.track === 'server' && costPerPostUsd !== null
      ? socialCostVsEstimate({
          costPerPostUsd,
          ...(input.estimateUsd === undefined ? {} : { estimateUsd: input.estimateUsd }),
        })
      : null;
  return SocialRoundOptimizationSchema.parse({
    day: input.day,
    track: input.track,
    postsSeen: input.postsSeen,
    postsKept: input.postsKept,
    postsDiscarded: input.postsDiscarded,
    postsUnfiltered,
    keepRatio,
    topics: input.topics,
    factsReused: input.factsReused,
    factsNew: input.factsNew,
    spentUsd: input.spentUsd,
    costPerPostUsd,
    vsEstimate: compared && { estimateUsd: compared.estimateUsd, ratio: compared.ratio, near: compared.near },
  });
}
