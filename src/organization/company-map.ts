import { z } from 'zod';
import { AssetRefSchema, AssetSha256Schema } from './asset.js';
import { DecisionRequestIdSchema } from './decision-request.js';

const SlugSchema = (min: number, max: number) => z.string().min(min).max(max).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

/** Levels of the client company map: client company → project → business unit. */
export const COMPANY_MAP_LEVELS = ['client', 'project', 'business_unit'] as const;
export const CompanyMapLevelSchema = z.enum(COMPANY_MAP_LEVELS);
export type CompanyMapLevel = z.infer<typeof CompanyMapLevelSchema>;

/** Entry kinds of the map; only the referent exists for now. */
export const COMPANY_MAP_ENTRY_KINDS = ['referent'] as const;
export const CompanyMapEntryKindSchema = z.enum(COMPANY_MAP_ENTRY_KINDS);
export type CompanyMapEntryKind = z.infer<typeof CompanyMapEntryKindSchema>;

/** An entry comes only from a seed or from an approved decision, never from a model. */
export const CompanyMapSourceSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('seed') }),
  z.strictObject({
    kind: z.literal('decision'),
    requestId: DecisionRequestIdSchema,
    planVersion: z.number().int().min(1),
  }),
]);
export type CompanyMapSource = z.infer<typeof CompanyMapSourceSchema>;

/** Versioned «referent» entry of the client company map. */
export const CompanyMapEntrySchema = z
  .strictObject({
    tenantId: AssetRefSchema.shape.tenantId,
    organizationId: z.string().min(1).max(64),
    clientId: AssetRefSchema.shape.companyId,
    projectId: z.string().min(1).max(64).optional(),
    buSlug: SlugSchema(1, 30).optional(),
    level: CompanyMapLevelSchema,
    kind: z.literal('referent'),
    personRef: SlugSchema(1, 40),
    name: z.string().min(1).max(120),
    role: z.string().min(1).max(120),
    email: z.email(),
    source: CompanyMapSourceSchema,
    confirmedAt: z.iso.datetime({ offset: true }),
    supersedes: z.number().int().min(1).optional(),
    version: z.number().int().min(1),
    digest: AssetSha256Schema,
  })
  .superRefine((entry, ctx) => {
    const wantsProject = entry.level !== 'client';
    const wantsBu = entry.level === 'business_unit';
    if (wantsProject !== (entry.projectId !== undefined)) {
      ctx.addIssue({
        code: 'custom',
        message: wantsProject ? 'projectId is required for this level' : 'projectId is not allowed at client level',
        path: ['projectId'],
      });
    }
    if (wantsBu !== (entry.buSlug !== undefined)) {
      ctx.addIssue({
        code: 'custom',
        message: wantsBu ? 'buSlug is required at business_unit level' : 'buSlug is only allowed at business_unit level',
        path: ['buSlug'],
      });
    }
    if (entry.supersedes !== undefined && entry.supersedes >= entry.version) {
      ctx.addIssue({ code: 'custom', message: 'supersedes must be lower than version', path: ['supersedes'] });
    }
  });
export type CompanyMapEntry = z.infer<typeof CompanyMapEntrySchema>;
