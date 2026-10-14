import { z } from 'zod';
import { CapabilityCallIdentitySchema } from '../capability-call-identity.js';

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
  })
  .superRefine((cfg, ctx) => {
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
