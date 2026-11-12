import { z } from 'zod';
import { AssetRefSchema } from '../../organization/asset.js';
import { AssetVersionLeadReviewSchema, AssetVersionRecordSchema } from '../../organization/asset-version.js';
import { BusinessUnitStateScopeSchema } from '../../organization/business-unit-state.js';
import { DecisionOutcomeSchema, DecisionRequestSchema } from '../../organization/decision-request.js';
import { OrganizationRunContextSchema } from '../../organization/run-context.js';

export const INTERNAL_MEMORY_BUSINESS_UNIT_STATE_PATH = '/internal/memory/business-unit-state' as const;

/** Memory resolves the caller's role, projects and departments from the verified run identity. */
export const InternalMemoryBusinessUnitStateRequestSchema = z.strictObject({
  context: OrganizationRunContextSchema,
});
export type InternalMemoryBusinessUnitStateRequest = z.infer<typeof InternalMemoryBusinessUnitStateRequestSchema>;

/**
 * These are the facts consumed by deriveBusinessUnitStateSummary. A lead review carries no scope,
 * so the consumer pairs it with the department scope it was read in. The derivation ignores every
 * fact outside that scope. If the complete facts exceed a limit, Memory refuses with state_too_large
 * instead of truncating them before derivation, which could change the resulting state.
 */
export const InternalMemoryBusinessUnitStateResponseSchema = z.discriminatedUnion('outcome', [
  z.strictObject({
    outcome: z.literal('listed'),
    role: z.enum(['capo-bu', 'director', 'other']),
    departments: z.array(z.strictObject({
      scope: BusinessUnitStateScopeSchema,
      versions: z.array(AssetVersionRecordSchema).max(1000),
      decisions: z.array(z.strictObject({
        request: DecisionRequestSchema,
        outcome: DecisionOutcomeSchema.nullable(),
      })).max(1000),
      leadReviews: z.array(AssetVersionLeadReviewSchema).max(1000),
      assets: z.array(AssetRefSchema).max(200),
    })).max(20),
  }).refine((response) => response.role !== 'other' || response.departments.length === 0, {
    message: 'A caller with no covered role cannot read department facts',
    path: ['departments'],
  }),
  z.strictObject({ outcome: z.literal('refused'), code: z.literal('state_too_large') }),
]);
export type InternalMemoryBusinessUnitStateResponse = z.infer<typeof InternalMemoryBusinessUnitStateResponseSchema>;

export const internalMemoryBusinessUnitStateContract = {
  method: 'POST' as const,
  path: INTERNAL_MEMORY_BUSINESS_UNIT_STATE_PATH,
  authType: 'secret' as const,
  bodySchema: InternalMemoryBusinessUnitStateRequestSchema,
  responseSchema: InternalMemoryBusinessUnitStateResponseSchema,
} as const;
