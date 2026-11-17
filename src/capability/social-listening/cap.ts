import { z } from 'zod';
import { SocialTrackSchema } from './topic.js';

/** D24: daily pay-per-use server budget for one agent, in USD. */
export const SOCIAL_SERVER_DAILY_CAP_DEFAULT_USD = 2;

export const SocialCapCheckSchema = z.object({
  track: SocialTrackSchema,
  capUsd: z.number().positive().finite(),
  spentUsd: z.number().nonnegative().finite(),
  estimateUsd: z.number().nonnegative().finite(),
}).strict();

function microdollars(usd: number): bigint {
  const rounded = Math.round(usd * 1e6);
  // Values whose scaling overflows are already whole dollars at this magnitude.
  return Number.isFinite(rounded) ? BigInt(rounded) : BigInt(usd) * 1_000_000n;
}

/** Check the agent's day total before reserving a call; the service owns the ledger and day. */
export function socialCapDecision(input: unknown):
  | { ok: true; capped: false }
  | { ok: true; capped: true; remainingUsd: number }
  | { ok: false; reason: 'cap_reached'; remainingUsd: number }
  | { ok: false; reason: 'invalid_input' } {
  try {
    const parsed = SocialCapCheckSchema.safeParse(input);
    if (!parsed.success) return { ok: false, reason: 'invalid_input' };
    const { track, capUsd, spentUsd, estimateUsd } = parsed.data;
    if (track === 'mac') return { ok: true, capped: false };

    const cap = microdollars(capUsd);
    const spent = microdollars(spentUsd);
    const estimate = microdollars(estimateUsd);
    const remaining = cap > spent ? cap - spent : 0n;
    // Decimal conversion keeps six places without overflowing the scaled integer.
    const remainingUsd = Number(`${remaining}e-6`);
    if (spent + estimate <= cap) return { ok: true, capped: true, remainingUsd };
    return { ok: false, reason: 'cap_reached', remainingUsd };
  } catch {
    // Even malformed objects with throwing accessors must stop the call safely.
    return { ok: false, reason: 'invalid_input' };
  }
}
