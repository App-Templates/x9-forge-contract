"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipProtocolloAgentiSchema = exports.PaperclipProtocolloAgenteSchema = exports.PaperclipProtocolloRuoloSchema = exports.PAPERCLIP_PROTOCOLLO_RUOLI = void 0;
const zod_1 = require("zod");
exports.PAPERCLIP_PROTOCOLLO_RUOLI = ['capo', 'lab', 'ricerca'];
exports.PaperclipProtocolloRuoloSchema = zod_1.z.enum(exports.PAPERCLIP_PROTOCOLLO_RUOLI);
exports.PaperclipProtocolloAgenteSchema = zod_1.z.strictObject({
    paperclipAgentId: zod_1.z.guid(),
    ruolo: exports.PaperclipProtocolloRuoloSchema,
    // Same agent id format as InternalAgentTurnParamsSchema.
    x9AgentId: zod_1.z.string().regex(/^[a-z0-9-]+$/),
    tenantId: zod_1.z.string().min(1),
    ownerId: zod_1.z.string().min(1),
    puoAffidareA: zod_1.z.array(exports.PaperclipProtocolloRuoloSchema).default([]),
});
exports.PaperclipProtocolloAgentiSchema = zod_1.z
    .strictObject({
    versione: zod_1.z.literal(1),
    agenti: zod_1.z.array(exports.PaperclipProtocolloAgenteSchema).min(1),
})
    .superRefine((mappa, ctx) => {
    const paperclipIds = new Set();
    const x9Ids = new Set();
    const roleCounts = new Map();
    for (const [index, agente] of mappa.agenti.entries()) {
        if (paperclipIds.has(agente.paperclipAgentId)) {
            ctx.addIssue({
                code: 'custom',
                path: ['agenti', index, 'paperclipAgentId'],
                message: 'Duplicate Paperclip agent id',
            });
        }
        if (x9Ids.has(agente.x9AgentId)) {
            ctx.addIssue({
                code: 'custom',
                path: ['agenti', index, 'x9AgentId'],
                message: 'Duplicate X9 agent id',
            });
        }
        paperclipIds.add(agente.paperclipAgentId);
        x9Ids.add(agente.x9AgentId);
        roleCounts.set(agente.ruolo, (roleCounts.get(agente.ruolo) ?? 0) + 1);
    }
    // Paperclip docs/guides/agent-developer/heartbeat-protocol.md:93-102;
    // doc/execution-semantics.md:24-30: each delegation needs one assignee.
    for (const [index, agente] of mappa.agenti.entries()) {
        for (const [targetIndex, ruolo] of agente.puoAffidareA.entries()) {
            const count = roleCounts.get(ruolo) ?? 0;
            if (count !== 1) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['agenti', index, 'puoAffidareA', targetIndex],
                    message: `Delegation role ${ruolo} must resolve to exactly one agent; found ${count}`,
                });
            }
        }
    }
});
//# sourceMappingURL=agenti.js.map