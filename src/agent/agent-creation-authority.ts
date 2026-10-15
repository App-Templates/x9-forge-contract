import { z } from 'zod';
import { ChannelTypeSchema } from '../messaging/channel-type.js';

const isoInstant = z.iso.datetime({ offset: true });

/** Forge-issued proof of who is asking a channel to create an agent; never names the target owner or agent. */
export const CreationActorAttestationSchema = z.object({
  tenantId: z.string().min(1),
  actorId: z.string().min(1),
  channel: ChannelTypeSchema,
  issuer: z.literal('forge'),
  issuedAt: isoInstant,
  expiresAt: isoInstant,
  nonce: z.string().min(1),
}).strict().refine((a) => Date.parse(a.expiresAt) > Date.parse(a.issuedAt), {
  path: ['expiresAt'], message: 'expiresAt must be after issuedAt',
});
export type CreationActorAttestation = z.infer<typeof CreationActorAttestationSchema>;

export const PlatformOwnerAuthorizationSchema = z.object({
  tenantId: z.string().min(1),
  actorId: z.string().min(1),
  decision: z.enum(['granted', 'denied']),
  reason: z.string().optional(),
  attestation: CreationActorAttestationSchema,
}).strict().superRefine((auth, ctx) => {
  if (auth.decision === 'denied' && (auth.reason ?? '').length < 1) {
    ctx.addIssue({ code: 'custom', path: ['reason'], message: 'A denied authorization requires a reason' });
  }
  if (auth.attestation.tenantId !== auth.tenantId || auth.attestation.actorId !== auth.actorId) {
    ctx.addIssue({ code: 'custom', path: ['attestation'], message: 'Attestation must match tenant and actor' });
  }
});
export type PlatformOwnerAuthorization = z.infer<typeof PlatformOwnerAuthorizationSchema>;

/** Validity window only; clock injected (epoch ms). Not yet valid, expired or malformed → false. */
export function isCreationAuthorityCurrent(rawAttestation: unknown, now: number): boolean {
  const parsed = CreationActorAttestationSchema.safeParse(rawAttestation);
  if (!parsed.success || !Number.isFinite(now)) return false;
  return now >= Date.parse(parsed.data.issuedAt) && now < Date.parse(parsed.data.expiresAt);
}
