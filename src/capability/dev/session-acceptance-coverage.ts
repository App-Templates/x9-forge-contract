import { z } from 'zod';
import type { DevSessionAcceptanceInput } from './session-acceptance.js';
import { DevSessionDeliveredFileSchema } from './session-assignment.js';

export const DEV_SESSION_COVERAGE_IDENTITY = ['ingresso', 'navigazione', 'risultato'] as const;

/** Coverage follows requested inputs, not the email's preview quota. */
export function devSessionCoverageSlots(input: DevSessionAcceptanceInput): string[] {
  return [
    ...(input.screens ?? []).map(({ name }) => `screen:${name}`),
    ...(input.behaviors ?? []).map((name) => `behavior:${name}`),
    ...(input.states ?? []).map((state) => `state:${state}`),
    ...(input.formats ?? []).map((format) => `format:${format}`),
    ...((input.screens?.length ?? 0) > 0 ? DEV_SESSION_COVERAGE_IDENTITY.map((name) => `identity:${name}`) : []),
  ];
}

export const DevSessionCoverageImageSchema = z.strictObject({
  path: DevSessionDeliveredFileSchema.shape.path,
  sha256: DevSessionDeliveredFileSchema.shape.sha256,
  // Require the absolute end of the key, including when it ends in a newline.
  covers: z.array(z.string().regex(/^(screen|behavior|state|format|identity):[a-z0-9][a-z0-9_-]{0,39}$(?![\s\S])/)).min(1).max(10),
}).superRefine((image, ctx) => {
  const seen = new Set<string>();
  image.covers.forEach((key, index) => {
    const kind = key.split(':')[0]!;
    if (kind === 'identity') return;
    if (seen.has(kind)) ctx.addIssue({ code: 'custom', path: ['covers', index], message: 'cover_kind_repeated' });
    seen.add(kind);
  });
});

/** Extra declarations cannot satisfy a different requested slot. */
export function devSessionCoverageMissing(slots: readonly string[], images: readonly z.infer<typeof DevSessionCoverageImageSchema>[]): string[] {
  const covered = new Set(images.flatMap(({ covers }) => covers));
  return slots.filter((slot) => !covered.has(slot));
}
