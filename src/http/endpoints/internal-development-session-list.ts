import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../../capability/capability-call-identity.js';
import { DevelopmentSessionLeaseSchema } from '../../capability/connect/development-session-state.js';

export const DevelopmentSessionListQuerySchema = z.object({
  scope: CapabilityAgentScopeSchema,
  cursor: z.string().trim().min(1).max(512).optional(),
  limit: z.number().int().min(1).max(50).default(20),
}).strict();

export const DevelopmentSessionListSchema = z.object({
  items: z.array(DevelopmentSessionLeaseSchema).max(50),
  nextCursor: z.string().trim().min(1).max(512).nullable(),
}).strict()
  .refine(({ items }) => new Set(items.map(({ binding }) => binding.sessionId)).size === items.length, {
    message: 'Session IDs must be unique', path: ['items'],
  })
  .refine(({ items }) => {
    const first = items[0];
    if (!first) return true;
    return items.every(({ binding }) =>
      binding.scope.tenantId === first.binding.scope.tenantId
      && binding.scope.ownerId === first.binding.scope.ownerId
      && binding.scope.agentId === first.binding.scope.agentId);
  }, {
    message: 'Session scopes must match within a page', path: ['items'],
  });
export type DevelopmentSessionList = z.infer<typeof DevelopmentSessionListSchema>;
export type DevelopmentSessionListQuery = z.infer<typeof DevelopmentSessionListQuerySchema>;

/**
 * The service authenticates the owner, filters by scope and correlates the cursor
 * with the authenticated tenant, owner and agent. The query alone authenticates nobody.
 * Include offline and revoked sessions so the selector shows their real state.
 * An empty page is valid; invalid registry data must propagate as an error, never an empty list.
 * This contract provides neither a registry nor an HTTP handler.
 */
export const listDevelopmentSessionsContract = {
  method: 'GET' as const,
  path: '/internal/connect/development-sessions' as const,
  authType: 'secret' as const,
  querySchema: DevelopmentSessionListQuerySchema,
  responseSchema: DevelopmentSessionListSchema,
} as const;
