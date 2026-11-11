"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipDisposizioneCorpoSchema = exports.PaperclipPoliticaConControlloSchema = exports.PaperclipControlloSchema = exports.PaperclipDescrittoreSbloccoSchema = exports.PaperclipInterazioneSchema = exports.PaperclipConfermaCorpoSchema = exports.PaperclipDocumentoSchema = exports.PaperclipPianoCorpoSchema = exports.PaperclipCommentoCorpoSchema = exports.PaperclipAggiornaCorpoSchema = exports.PaperclipFiglioCorpoSchema = exports.PaperclipCheckoutCorpoSchema = exports.PAPERCLIP_CHECKOUT_STATI_ATTESI = void 0;
const zod_1 = require("zod");
const wire_letture_js_1 = require("./wire-letture.cjs");
// Paperclip docs/guides/agent-developer/heartbeat-protocol.md:53.
exports.PAPERCLIP_CHECKOUT_STATI_ATTESI = ['todo', 'backlog', 'blocked', 'in_review'];
// Paperclip packages/shared/dist/validators/issue.js:752-755.
exports.PaperclipCheckoutCorpoSchema = zod_1.z.strictObject({
    agentId: zod_1.z.guid(),
    expectedStatuses: zod_1.z.array(wire_letture_js_1.PaperclipStatoIncaricoSchema).nonempty(),
});
// Paperclip validators/issue.js:684-698; server/dist/services/issues.js:6109-6125;
// doc/execution-semantics.md:243-247. Il letterale `true` aggiunge il blocco figlio→padre.
exports.PaperclipFiglioCorpoSchema = zod_1.z.strictObject({
    title: zod_1.z.string().trim().min(1).max(240),
    description: zod_1.z.string().trim().min(1),
    assigneeAgentId: zod_1.z.guid(),
    goalId: zod_1.z.guid().nullable().optional(),
    blockParentUntilDone: zod_1.z.literal(true),
});
// Paperclip validators/issue.js:714-730; docs/guides/execution-policy.md:152-161.
exports.PaperclipAggiornaCorpoSchema = zod_1.z
    .strictObject({
    status: wire_letture_js_1.PaperclipStatoIncaricoSchema.optional(),
    comment: zod_1.z.string().trim().min(1).optional(),
})
    .refine((v) => v.status !== undefined || v.comment !== undefined, {
    message: 'serve almeno uno fra status e comment',
});
// Paperclip validators/issue.js:862-873.
exports.PaperclipCommentoCorpoSchema = zod_1.z.strictObject({
    body: zod_1.z.string().trim().min(1),
});
// Paperclip validators/issue.js:1858-1866.
exports.PaperclipPianoCorpoSchema = zod_1.z.strictObject({
    format: zod_1.z.literal('markdown'),
    body: zod_1.z.string().trim().min(1).max(524288),
    changeSummary: zod_1.z.string().trim().max(500).optional(),
});
// Paperclip server/dist/routes/issues.js:6900-7032 (risposta di PUT).
exports.PaperclipDocumentoSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    key: zod_1.z.string(),
    latestRevisionId: zod_1.z.guid(),
    latestRevisionNumber: zod_1.z.number().int().optional(),
});
// Paperclip validators/issue.js:1247-1254,1291-1311,1688-1720; heartbeat-protocol.md:73.
exports.PaperclipConfermaCorpoSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('request_confirmation'),
    payload: zod_1.z.strictObject({
        version: zod_1.z.literal(1),
        prompt: zod_1.z.string().trim().min(1).max(1000),
        target: zod_1.z.strictObject({
            type: zod_1.z.literal('issue_document'),
            key: zod_1.z.literal('plan'),
            revisionId: zod_1.z.guid(),
        }),
    }),
});
// Paperclip routes/issues.js:11271-11390 (201).
exports.PaperclipInterazioneSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    kind: zod_1.z.string(),
    status: zod_1.z.string(),
});
// Paperclip validators/issue.ts:693-704: strict {owner, action}; an agent may name only itself (403).
exports.PaperclipDescrittoreSbloccoSchema = zod_1.z.strictObject({
    owner: zod_1.z.union([
        zod_1.z.strictObject({ agentId: zod_1.z.guid() }),
        zod_1.z.strictObject({ userId: zod_1.z.string().min(1) }),
        zod_1.z.literal('board'),
    ]),
    action: zod_1.z.string().trim().min(1).max(2000),
});
// One-shot monitor, consumed by an issue_monitor_due wake; valid only in in_progress or
// in_review (issue-execution-policy.ts:74,265-267); Paperclip sets no time bounds.
exports.PaperclipControlloSchema = zod_1.z.strictObject({
    nextCheckAt: zod_1.z.iso.datetime(),
    notes: zod_1.z.string().trim().min(1).max(500),
    serviceName: zod_1.z.string().trim().min(1).max(120).optional(),
});
// Paperclip replaces the whole execution policy on an update (routes/issues.ts:13103-13105),
// so the body carries the policy intact: only the monitor is ours, the rest passes through.
exports.PaperclipPoliticaConControlloSchema = zod_1.z.looseObject({ monitor: exports.PaperclipControlloSchema });
exports.PaperclipDisposizioneCorpoSchema = zod_1.z
    .strictObject({
    status: zod_1.z.enum(['done', 'in_review', 'blocked', 'in_progress']),
    comment: zod_1.z.string().trim().min(1).optional(),
    blockedByIssueIds: zod_1.z.array(zod_1.z.guid()).min(1).optional(),
    unblockDescriptor: exports.PaperclipDescrittoreSbloccoSchema.optional(),
    executionPolicy: exports.PaperclipPoliticaConControlloSchema.optional(),
})
    .superRefine((value, ctx) => {
    if (value.status === 'blocked') {
        if (value.blockedByIssueIds === undefined && value.unblockDescriptor === undefined) {
            ctx.addIssue({
                code: 'custom',
                path: ['status'],
                message: 'blocked requires blocking issues or an unblock descriptor',
            });
        }
    }
    else {
        if (value.blockedByIssueIds !== undefined) {
            ctx.addIssue({
                code: 'custom',
                path: ['blockedByIssueIds'],
                message: 'blocking issues are allowed only with blocked',
            });
        }
        if (value.unblockDescriptor !== undefined) {
            ctx.addIssue({
                code: 'custom',
                path: ['unblockDescriptor'],
                message: 'an unblock descriptor is allowed only with blocked',
            });
        }
    }
    if (value.executionPolicy !== undefined && value.status !== 'in_progress' && value.status !== 'in_review') {
        ctx.addIssue({
            code: 'custom',
            path: ['executionPolicy'],
            message: 'a scheduled check is allowed only with in_progress or in_review',
        });
    }
    if (value.status === 'in_progress' && value.executionPolicy === undefined) {
        ctx.addIssue({
            code: 'custom',
            path: ['status'],
            message: 'in_progress is a disposition only with a scheduled check',
        });
    }
});
//# sourceMappingURL=wire-scritture.js.map