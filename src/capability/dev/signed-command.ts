import { z } from 'zod';
import { CapabilityCallIdentitySchema } from '../capability-call-identity.js';

export const DEV_SIGNED_COMMAND_V2_DOMAIN = 'x9.cap-dev.command';

/** The complete scope is signed; omitted report digests are encoded as null. */
export const DevSignedCommandV2Schema = z.strictObject({
  version: z.literal(2),
  domain: z.literal(DEV_SIGNED_COMMAND_V2_DOMAIN),
  tenantId: CapabilityCallIdentitySchema.shape.tenantId,
  ownerId: CapabilityCallIdentitySchema.shape.ownerId,
  agentId: CapabilityCallIdentitySchema.shape.agentId,
  boardId: z.string().min(1),
  computerId: z.string().min(1),
  projectId: z.string().min(1),
  issueId: z.string().min(1),
  command: z.enum(['status', 'plan', 'start', 'stop', 'report']),
  reportDigest: z.string().regex(/^[0-9a-fA-F]{64}$/).nullable().default(null),
  configVersion: z.number().int().min(0),
  keyVersion: z.number().int().min(1),
  requestId: z.string().min(1),
  nonce: z.string().min(16),
  expiresAt: z.iso.datetime(),
});

export type DevSignedCommandV2 = z.infer<typeof DevSignedCommandV2Schema>;

/** Encode the returned compact JSON string as UTF-8 before signing/verifying. */
export function canonicalizeDevSignedCommandV2(
  msg: z.input<typeof DevSignedCommandV2Schema>,
): string {
  const parsed = DevSignedCommandV2Schema.parse(msg);
  return JSON.stringify(Object.fromEntries(
    Object.entries(parsed).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0),
  ));
}
