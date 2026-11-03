"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipErroreRispostaSchema = exports.PaperclipAgenteMeSchema = exports.PaperclipContestoTurnoSchema = exports.PaperclipCommentiSchema = exports.PaperclipCommentoSchema = exports.PaperclipIncaricoSchema = exports.PaperclipBloccoSchema = exports.PaperclipStatoIncaricoSchema = exports.PAPERCLIP_STATI_INCARICO = void 0;
const zod_1 = require("zod");
// Paperclip packages/shared/dist/constants.js:165-173.
exports.PAPERCLIP_STATI_INCARICO = [
    'backlog',
    'todo',
    'in_progress',
    'in_review',
    'done',
    'blocked',
    'cancelled',
];
exports.PaperclipStatoIncaricoSchema = zod_1.z.enum(exports.PAPERCLIP_STATI_INCARICO);
// Paperclip server/dist/routes/issues.js:5806-5807.
exports.PaperclipBloccoSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    status: exports.PaperclipStatoIncaricoSchema,
    title: zod_1.z.string().optional(),
    identifier: zod_1.z.string().nullable().optional(),
    assigneeAgentId: zod_1.z.guid().nullable().optional(),
});
// Paperclip server/dist/routes/issues.js:5790-5810.
exports.PaperclipIncaricoSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable().optional(),
    status: exports.PaperclipStatoIncaricoSchema,
    parentId: zod_1.z.guid().nullable().optional(),
    goalId: zod_1.z.guid().nullable().optional(),
    assigneeAgentId: zod_1.z.guid().nullable().optional(),
    blockedBy: zod_1.z.array(exports.PaperclipBloccoSchema).optional(),
});
// Paperclip server/dist/routes/issues.js:10826-10855.
exports.PaperclipCommentoSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    body: zod_1.z.string(),
    authorAgentId: zod_1.z.guid().nullable().optional(),
    authorUserId: zod_1.z.string().nullable().optional(),
    createdAt: zod_1.z.string().optional(),
});
exports.PaperclipCommentiSchema = zod_1.z.array(exports.PaperclipCommentoSchema);
// Paperclip server/dist/routes/issues.js:5728-5870.
exports.PaperclipContestoTurnoSchema = zod_1.z.looseObject({
    issue: exports.PaperclipIncaricoSchema,
    ancestors: zod_1.z.array(zod_1.z.looseObject({
        id: zod_1.z.guid(),
        title: zod_1.z.string().optional(),
        status: exports.PaperclipStatoIncaricoSchema.optional(),
    })),
    wakeComment: exports.PaperclipCommentoSchema.nullable().optional(),
});
// Paperclip docs/guides/agent-developer/heartbeat-protocol.md:12-18;
// server/dist/routes/agents.js:3368.
exports.PaperclipAgenteMeSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    companyId: zod_1.z.guid(),
});
// Paperclip server/dist/routes/issues.js:3290,10654-10659.
exports.PaperclipErroreRispostaSchema = zod_1.z.looseObject({
    error: zod_1.z.string(),
});
//# sourceMappingURL=wire-letture.js.map