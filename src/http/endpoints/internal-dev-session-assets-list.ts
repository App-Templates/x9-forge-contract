import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../../capability/capability-call-context.js';
import { DEV_SESSION_MAX_FILES, DevSessionKindSchema } from '../../capability/dev/session-assignment.js';
import { AssetRefSchema } from '../../organization/asset.js';
import { readDevSessionAssetContract } from './internal-dev-session-asset-content.js';

/** Delivered files (at most DEV_SESSION_MAX_FILES) plus the images of the manifest (at most 40). */
export const DEV_SESSION_ASSETS_LIST_MAX = DEV_SESSION_MAX_FILES + 40;

/** Transport request only; session authorization and delivery verification belong to the service. */
export const DevSessionAssetsListRequestSchema = z.strictObject({
  scope: CapabilityAgentScopeSchema,
  // Opt-in keeps responses readable by older strict consumers.
  include: z.array(z.literal('reading')).max(1).optional(),
});
export type DevSessionAssetsListRequest = z.infer<typeof DevSessionAssetsListRequestSchema>;

/** The list is complete and verified, or the call is refused: never a truncated list. */
export const DevSessionAssetsListResponseSchema = z.strictObject({
  assets: z.array(AssetRefSchema).min(1).max(DEV_SESSION_ASSETS_LIST_MAX),
  reading: z.strictObject({
    // Older assignments do not declare a product kind.
    productKind: DevSessionKindSchema.optional(),
    complete: z.boolean(),
    notMet: z.array(z.strictObject({
      id: z.string().min(1).max(40),
      attestor: z.enum(['sessione', 'esecutore']),
      reason: z.string().min(1).max(400).optional(),
    })).max(50),
    // D-08 points to the deviations proof, including an explicitly empty list.
    deviationsPath: z.string().min(1).max(512).optional(),
  }).optional(),
}).superRefine((response, ctx) => {
  // Unmet criteria contradict a complete session verdict.
  if (response.reading !== undefined && response.reading.complete && response.reading.notMet.length > 0) {
    ctx.addIssue({ code: 'custom', path: ['reading', 'notMet'], message: 'A complete session cannot have unmet criteria' });
  }
  const ids = new Set<string>();
  const paths = new Set<string>();
  let sessionId: string | undefined;
  let commit: string | undefined;
  response.assets.forEach((asset, index) => {
    const origin = asset.origin;
    if (origin.kind !== 'session' || origin.repo === undefined || origin.commit === undefined || origin.path === undefined) {
      ctx.addIssue({ code: 'custom', path: ['assets', index, 'origin'], message: 'Asset must be a session delivery with repo, commit and path' });
      return;
    }
    sessionId ??= origin.sessionId;
    commit ??= origin.commit;
    if (origin.sessionId !== sessionId) {
      ctx.addIssue({ code: 'custom', path: ['assets', index, 'origin', 'sessionId'], message: 'All assets must belong to one session' });
    }
    if (origin.commit !== commit) {
      ctx.addIssue({ code: 'custom', path: ['assets', index, 'origin', 'commit'], message: 'All assets must come from one commit' });
    }
    if (ids.has(asset.assetId)) {
      ctx.addIssue({ code: 'custom', path: ['assets', index, 'assetId'], message: 'Duplicate assetId' });
    }
    ids.add(asset.assetId);
    if (paths.has(origin.path)) {
      ctx.addIssue({ code: 'custom', path: ['assets', index, 'origin', 'path'], message: 'Duplicate path' });
    }
    paths.add(origin.path);
  });
});
export type DevSessionAssetsListResponse = z.infer<typeof DevSessionAssetsListResponseSchema>;

export const DEV_SESSION_ASSETS_LIST_REFUSALS = [
  'session_not_found',
  'session_foreign',
  'session_not_closed',
  'delivery_not_verified',
  'identity_source_unavailable',
] as const;
export const DevSessionAssetsListRefusalSchema = z.strictObject({
  error: z.enum(DEV_SESSION_ASSETS_LIST_REFUSALS),
});
export type DevSessionAssetsListRefusal = z.infer<typeof DevSessionAssetsListRefusalSchema>;

/**
 * POST that lists the verified files and proof images of a closed session; it serves no bytes (those use
 * readDevSessionAssetContract on the same family of routes). The list is complete or it is a refusal
 * (`delivery_not_verified`), never truncated. Authorization and verification belong to the service, as for bytes.
 */
export const listDevSessionAssetsContract = {
  method: 'POST' as const,
  path: '/internal/capability/agents/:agentId/dev/sessions/:sessionId/assets/list' as const,
  authType: 'secret' as const,
  paramsSchema: readDevSessionAssetContract.paramsSchema,
  bodySchema: DevSessionAssetsListRequestSchema,
  responseSchema: DevSessionAssetsListResponseSchema,
} as const;
