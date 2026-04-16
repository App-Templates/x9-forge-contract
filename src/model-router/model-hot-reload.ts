import { z } from 'zod';
import { ModelProviderSchema } from './model-provider.js';

/**
 * Hot-reload notification payload — transport-agnostic.
 *
 * Emitted (or polled) when Forge pushes a new model config and X9 must
 * refresh its in-memory routing table. The shape is stable regardless of
 * transport (polling vs SSE) so consumers pattern-match one payload.
 *
 * Mechanism decision lives in 06-RESEARCH-X9-ALIGNMENT.md §"Hot-Reload Mechanism
 * Decision" (plan 06-01 output). Selected: **polling** via
 * `GET /internal/model-config/version` returning this shape.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see CONTEXT D-17, D-18, D-19
 * @see agent-x9/.planning/ROADMAP.md §Phase 35 ROUTER-06
 */
export const ModelHotReloadNotificationSchema = z.object({
  version: z.string().min(1),
  appliedAt: z.iso.datetime(),
  providersChanged: z.array(ModelProviderSchema).optional(),
  capsChanged: z.array(z.string().min(1)).optional(),
});

export type ModelHotReloadNotification = z.infer<typeof ModelHotReloadNotificationSchema>;
