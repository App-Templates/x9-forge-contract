import { z } from 'zod';
import type { VaultCascadeTier } from './vault-tier.js';

/** Identity of the source that owns a credential version counter. */
export const CredentialSourceIdSchema = z.string().regex(/^(platform|(owner|agent|preset):[1-9][0-9]*)$/);
export type CredentialSourceId = z.infer<typeof CredentialSourceIdSchema>;

/** Reject missing or invalid identities instead of constructing an uncertain source. */
export function credentialSourceOf(row: {
  tier: VaultCascadeTier;
  agentId: number | null;
  ownerId: number | null;
  presetId?: number | null;
}): CredentialSourceId {
  switch (row.tier) {
    case 'platform':
      return 'platform';
    case 'owner':
      return CredentialSourceIdSchema.parse(`owner:${row.ownerId}`);
    case 'agent':
      return CredentialSourceIdSchema.parse(`agent:${row.agentId}`);
    case 'preset':
      return CredentialSourceIdSchema.parse(`preset:${row.presetId}`);
  }
}

/** A version of a key within its source; never carries a threshold of its own. */
export const CredentialVersionThresholdSchema = z.object({
  source: CredentialSourceIdSchema,
  counter: z.number().int().positive(),
  revoked: z.boolean().default(false),
}).strict();
export type CredentialVersionThreshold = z.infer<typeof CredentialVersionThresholdSchema>;

/** A version of a key; `revokedThrough` is the revocation threshold and is absent when nothing was revoked. */
export const CredentialVersionRefSchema = CredentialVersionThresholdSchema.extend({
  revokedThrough: CredentialVersionThresholdSchema.optional(),
}).strict();
export type CredentialVersionRef = z.infer<typeof CredentialVersionRefSchema>;

/** Counters are comparable only within their source; revocation does not affect ordering. */
export function compareCredentialVersions(
  a: CredentialVersionThreshold,
  b: CredentialVersionThreshold,
): 'same' | 'newer' | 'older' | 'incomparable' {
  if (a.source !== b.source) return 'incomparable';
  if (a.counter > b.counter) return 'newer';
  if (a.counter < b.counter) return 'older';
  return 'same';
}

/**
 * True when `version` is revoked by `threshold`: the threshold is present, comes from the same source,
 * and the version is at or below it. A threshold from another source never applies.
 */
export function withinRevocationThreshold(
  version: CredentialVersionThreshold,
  threshold: CredentialVersionThreshold | undefined,
): boolean {
  if (threshold === undefined) return false;
  const order = compareCredentialVersions(version, threshold);
  return order === 'older' || order === 'same';
}

/**
 * Whether the version a session was opened with is revoked, given the current version of the key.
 * A revocation closes the session even when an ordinary rotation followed it (the threshold covers the opened
 * version); a plain rotation or a key from another source lets the session continue. When the current version is
 * revoked, anything not strictly newer from the same source closes, including another source (prudent).
 */
export function credentialVersionRevoked(
  opened: CredentialVersionRef | null | undefined,
  current: CredentialVersionRef | null | undefined,
): boolean {
  if (current === null || current === undefined) return false;
  if (opened === null || opened === undefined) return current.revoked === true;
  if (withinRevocationThreshold(opened, current.revokedThrough)) return true;
  return current.revoked === true && compareCredentialVersions(opened, current) !== 'newer';
}
