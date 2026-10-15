"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevAgentConfigStateSchema = exports.DevAgentStateSchema = exports.DevAgentStatusSchema = exports.DevAgentConfigSchema = exports.DevBindingSchema = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
/** A project path label: relative, never escaping upward. */
const PathLabelSchema = zod_1.z
    .string()
    .min(1)
    .refine((v) => !v.startsWith('/'), { message: 'pathLabel must not start with /' })
    .refine((v) => !v.split(/[\\/]/).includes('..'), { message: "pathLabel must not contain '..'" });
exports.DevBindingSchema = zod_1.z.strictObject({
    computerId: zod_1.z.string().min(1),
    projectId: zod_1.z.string().min(1),
    pathLabel: PathLabelSchema,
    addedAt: zod_1.z.iso.datetime(),
});
/**
 * Agent-scoped cap-dev configuration. It carries no secret or key material,
 * only the key version; unknown keys (e.g. `token`) are rejected.
 */
exports.DevAgentConfigSchema = zod_1.z
    .strictObject({
    tenantId: capability_call_identity_js_1.CapabilityCallIdentitySchema.shape.tenantId,
    ownerId: capability_call_identity_js_1.CapabilityCallIdentitySchema.shape.ownerId,
    agentId: capability_call_identity_js_1.CapabilityCallIdentitySchema.shape.agentId,
    boardId: zod_1.z.string().min(1),
    enabled: zod_1.z.boolean(),
    configVersion: zod_1.z.number().int().min(0),
    keyVersion: zod_1.z.number().int().min(1),
    bindings: zod_1.z.array(exports.DevBindingSchema),
    /**
     * Private Telegram chats (canonical ids, no sign) the owner chose in Forge
     * as «theirs»: only these may command cap-dev for this agent. The regex is
     * repeated here on purpose (importing agent-channel-access would create an
     * agent → capability cycle).
     */
    ownerChatIds: zod_1.z
        .array(zod_1.z.string().regex(/^[1-9]\d{0,15}$/))
        .max(8)
        .default([]),
})
    .superRefine((cfg, ctx) => {
    const seenChats = new Set();
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
    const seen = new Set();
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
exports.DevAgentStatusSchema = zod_1.z.enum(['ready', 'applied', 'pending', 'offline', 'revoked']);
exports.DevAgentStateSchema = zod_1.z.strictObject({
    status: exports.DevAgentStatusSchema,
    appliedConfigVersion: zod_1.z.number().int().min(0),
    lastSeenAt: zod_1.z.iso.datetime().nullable(),
    reason: zod_1.z.string().nullable(),
});
/** Config plus its reported state: the applied version can never be ahead of the config. */
exports.DevAgentConfigStateSchema = zod_1.z
    .strictObject({
    config: exports.DevAgentConfigSchema,
    state: exports.DevAgentStateSchema,
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
//# sourceMappingURL=config-state.js.map