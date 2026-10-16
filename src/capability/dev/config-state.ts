import { z } from 'zod';
import { CapabilityCallIdentitySchema } from '../capability-call-identity.js';
import { DevelopmentSessionBindingSchema } from '../connect/development-session.js';
import { DevProductionRoleModelsSchema } from '../../http/endpoints/development-session-models.js';

/** A project path label: relative, never escaping upward. */
const PathLabelSchema = z
  .string()
  .min(1)
  .refine((v) => !v.startsWith('/'), { message: 'pathLabel must not start with /' })
  .refine((v) => !v.split(/[\\/]/).includes('..'), { message: "pathLabel must not contain '..'" });

export const DevBindingSchema = z.strictObject({
  computerId: z.string().min(1),
  projectId: z.string().min(1),
  pathLabel: PathLabelSchema,
  addedAt: z.iso.datetime(),
});
export type DevBinding = z.infer<typeof DevBindingSchema>;

/**
 * Agent-scoped cap-dev configuration. It carries no secret or key material,
 * only the key version; unknown keys (e.g. `token`) are rejected.
 */
export const DevAgentConfigSchema = z
  .strictObject({
    tenantId: CapabilityCallIdentitySchema.shape.tenantId,
    ownerId: CapabilityCallIdentitySchema.shape.ownerId,
    agentId: CapabilityCallIdentitySchema.shape.agentId,
    boardId: z.string().min(1),
    enabled: z.boolean(),
    configVersion: z.number().int().min(0),
    keyVersion: z.number().int().min(1),
    bindings: z.array(DevBindingSchema),
    /** A saved choice only; presence, consent and an execution lease are separate facts. */
    production: z.strictObject({
      session: DevelopmentSessionBindingSchema,
      roleModels: DevProductionRoleModelsSchema.optional(),
      allowedProjectIds: z.array(z.string().min(1)).min(1)
        .refine((ids) => new Set(ids).size === ids.length, {
          message: 'allowedProjectIds must be unique',
        }),
    }).optional(),
    /**
     * Private Telegram chats (canonical ids, no sign) the owner chose in Forge
     * as «theirs»: only these may command cap-dev for this agent. The regex is
     * repeated here on purpose (importing agent-channel-access would create an
     * agent → capability cycle).
     */
    ownerChatIds: z
      .array(z.string().regex(/^[1-9]\d{0,15}$/))
      .max(8)
      .default([]),
  })
  .superRefine((cfg, ctx) => {
    if (cfg.production) {
      if (cfg.production.roleModels) {
        for (const [role, choice] of Object.entries(cfg.production.roleModels)) {
          if (!cfg.production.session.engines.includes(choice.engine)) {
            ctx.addIssue({ code: 'custom', path: ['production', 'roleModels', role, 'engine'], message: 'Role model engine must be selected in the session' });
          }
        }
      }
      const scope = cfg.production.session.scope;
      if (scope.tenantId !== cfg.tenantId) {
        ctx.addIssue({ code: 'custom', path: ['production', 'session', 'scope', 'tenantId'], message: 'Session tenantId must match config' });
      }
      if (scope.ownerId !== cfg.ownerId) {
        ctx.addIssue({ code: 'custom', path: ['production', 'session', 'scope', 'ownerId'], message: 'Session ownerId must match config' });
      }
      if (scope.agentId !== cfg.agentId) {
        ctx.addIssue({ code: 'custom', path: ['production', 'session', 'scope', 'agentId'], message: 'Session agentId must match config' });
      }
    }
    const seenChats = new Set<string>();
    cfg.ownerChatIds.forEach((c, i) => {
      if (seenChats.has(c)) {
        ctx.addIssue({
          code: 'custom',
          path: ['ownerChatIds', i],
          message: 'duplicate ownerChatId',
        });
      }
      seenChats.add(c);
    });
    const seen = new Set<string>();
    cfg.bindings.forEach((b, i) => {
      const key = JSON.stringify([b.computerId, b.projectId]);
      if (seen.has(key)) {
        ctx.addIssue({
          code: 'custom',
          path: ['bindings', i],
          message: 'duplicate binding for computerId + projectId',
        });
      }
      seen.add(key);
    });
  });
export type DevAgentConfig = z.infer<typeof DevAgentConfigSchema>;

export const DevAgentStatusSchema = z.enum(['ready', 'applied', 'pending', 'offline', 'revoked']);
export type DevAgentStatus = z.infer<typeof DevAgentStatusSchema>;

export const DevAgentStateSchema = z.strictObject({
  status: DevAgentStatusSchema,
  appliedConfigVersion: z.number().int().min(0),
  lastSeenAt: z.iso.datetime().nullable(),
  reason: z.string().nullable(),
});
export type DevAgentState = z.infer<typeof DevAgentStateSchema>;

/** Config plus its reported state: the applied version can never be ahead of the config. */
export const DevAgentConfigStateSchema = z
  .strictObject({
    config: DevAgentConfigSchema,
    state: DevAgentStateSchema,
  })
  .superRefine((v, ctx) => {
    if (v.state.appliedConfigVersion > v.config.configVersion) {
      ctx.addIssue({
        code: 'custom',
        path: ['state', 'appliedConfigVersion'],
        message: 'appliedConfigVersion must not exceed configVersion',
      });
    }
  });
export type DevAgentConfigState = z.infer<typeof DevAgentConfigStateSchema>;
