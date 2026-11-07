import { z } from 'zod';
import { INTERNAL_SECRET_HEADER, INTERNAL_TOKEN_HEADER } from '../auth/index.js';
import { CapabilityAgentScopeSchema } from '../capability/capability-call-identity.js';
import { CapabilityModelIdSchema } from '../capability/ricerca/agent-config.js';
import { EffectiveModelsParamsSchema, EffectiveSlotRetirementReasonSchema } from './effective-models.js';
import { ModelDescriptorSchema } from './model-catalog.js';
import { ModelSlotIdSchema } from './model-slot.js';
import { NoSuccessorCauseSchema } from './model-succession.js';

/**
 * The error code each provider answers with when the model no longer exists.
 * openai: `error.code`; anthropic: `error.type`; google: `error.status` (google.rpc);
 * elevenlabs: `detail.type` of the 404 body.
 */
export const RETIRED_PROVIDER_ERROR_CODES = {
  openai: ['model_not_found'],
  anthropic: ['not_found_error'],
  google: ['NOT_FOUND'],
  elevenlabs: ['not_found'],
} as const;

export const RetiredProviderErrorSchema = z.enum(['model_not_found', 'not_found_error', 'NOT_FOUND', 'not_found']);
export type RetiredProviderError = z.infer<typeof RetiredProviderErrorSchema>;

/** True only when `code` is in the provider's own row; an unknown provider never fits. */
export function retiredProviderErrorFits(provider: string, code: string): boolean {
  if (!Object.hasOwn(RETIRED_PROVIDER_ERROR_CODES, provider)) return false;
  return (RETIRED_PROVIDER_ERROR_CODES[provider as keyof typeof RETIRED_PROVIDER_ERROR_CODES] as readonly string[]).includes(code);
}

/** `provider-error`: a call was refused; `provider-inventory`: the provider's catalog no longer lists the model. */
export const RETIREMENT_SOURCES = ['provider-error', 'provider-inventory'] as const;
export const RetirementSourceSchema = EffectiveSlotRetirementReasonSchema.extract([...RETIREMENT_SOURCES]);
export type RetirementSource = z.infer<typeof RetirementSourceSchema>;

/**
 * What a service saw when a model no longer exists: a provider refused a call
 * (`provider-error`, the default when `source` is absent, carries `providerError`) or the
 * provider's catalog stopped listing it (`provider-inventory`, no `providerError`).
 * The provider/code pair is checked by whoever recognises the error, with `retiredProviderErrorFits`.
 * Never carries the raw provider error text or any credential.
 */
export const RetiredModelObservationSchema = z.object({
  scope: CapabilityAgentScopeSchema,
  slotId: ModelSlotIdSchema,
  model: ModelDescriptorSchema,
  source: RetirementSourceSchema.optional(),
  providerError: RetiredProviderErrorSchema.optional(),
}).strict().superRefine((observation, ctx) => {
  const source = observation.source ?? 'provider-error';
  if (source === 'provider-error' && observation.providerError === undefined) {
    ctx.addIssue({ code: 'custom', path: ['providerError'], message: 'A provider-error observation needs the provider error code' });
  }
  if (source === 'provider-inventory' && observation.providerError !== undefined) {
    ctx.addIssue({ code: 'custom', path: ['providerError'], message: 'A provider-inventory observation has no provider error code' });
  }
});
export type RetiredModelObservation = z.infer<typeof RetiredModelObservationSchema>;

/** The vault writes this as the `reason` of the notice. */
export function retirementSource(observation: RetiredModelObservation): RetirementSource {
  return observation.source ?? 'provider-error';
}

/**
 * `scheduled`: the vault runs its retirement pass now. `not-in-table`: the model has no row in the
 * succession table, so only a notice is produced and never an upgrade. `duplicate`: already known.
 */
export const RetiredObservedAckSchema = z.object({
  ok: z.literal(true),
  outcome: z.enum(['scheduled', 'not-in-table', 'duplicate']),
}).strict();
export type RetiredObservedAck = z.infer<typeof RetiredObservedAckSchema>;

/** Service → agent-core: a call found its model retired. */
export const internalModelsRetiredObservedContract = {
  method: 'POST' as const, path: '/internal/models/retired-observed' as const,
  authType: 'secret' as const, authHeader: INTERNAL_SECRET_HEADER,
  bodySchema: RetiredModelObservationSchema, responseSchema: RetiredObservedAckSchema,
} as const;

/** Agent-core → vault: the same observation, for the declared Vault agent. */
export const vaultModelsRetiredObservedContract = {
  method: 'POST' as const, path: '/internal/models/retired-observed/:vaultAgentId' as const,
  authType: 'token' as const, authHeader: INTERNAL_TOKEN_HEADER,
  paramsSchema: EffectiveModelsParamsSchema,
  bodySchema: RetiredModelObservationSchema, responseSchema: RetiredObservedAckSchema,
} as const;

export function vaultModelsRetiredObservedPath(vaultAgentId: number): string {
  const params = EffectiveModelsParamsSchema.parse({ vaultAgentId: String(vaultAgentId) });
  return vaultModelsRetiredObservedContract.path.replace(':vaultAgentId', params.vaultAgentId);
}

/** Same values as the `model_upgrade_events_target` check in Forge. */
export const MODEL_UPGRADE_TARGETS = ['preset', 'agent'] as const;
export const ModelUpgradeTargetSchema = z.enum(MODEL_UPGRADE_TARGETS);
export type ModelUpgradeTarget = z.infer<typeof ModelUpgradeTargetSchema>;

const noticeCommon = {
  target: ModelUpgradeTargetSchema,
  targetId: z.number().int().positive(),
  slotId: ModelSlotIdSchema,
  previousVersion: z.number().int().positive(),
  fromModel: CapabilityModelIdSchema,
  reason: EffectiveSlotRetirementReasonSchema,
  at: z.iso.datetime({ offset: true }),
};

/** A retired model was replaced by its successor. */
export const ModelUpgradedNoticeSchema = z.object({
  kind: z.literal('upgraded'),
  ...noticeCommon,
  toModel: CapabilityModelIdSchema,
  whilePinned: z.boolean(),
}).strict().refine(notice => notice.toModel !== notice.fromModel, {
  path: ['toModel'], message: 'The successor must differ from the retired model',
});

/** A retired model has no usable successor: red row and notification, choice menu stays enabled. */
export const ModelNoSuccessorNoticeSchema = z.object({
  kind: z.literal('no-successor'),
  ...noticeCommon,
  cause: NoSuccessorCauseSchema,
}).strict();

export const ModelRetirementNoticeSchema = z.discriminatedUnion('kind', [
  ModelUpgradedNoticeSchema,
  ModelNoSuccessorNoticeSchema,
]);
export type ModelRetirementNotice = z.infer<typeof ModelRetirementNoticeSchema>;

/**
 * One notice per row and version, the same as Forge's unique
 * `(target, target_id, slot_id, previous_version)` on `model_upgrade_events`.
 */
export function retirementNoticeKey(notice: Pick<ModelRetirementNotice, 'target' | 'targetId' | 'slotId' | 'previousVersion'>): string {
  return `${notice.target}:${notice.targetId}:${notice.slotId}:${notice.previousVersion}`;
}
