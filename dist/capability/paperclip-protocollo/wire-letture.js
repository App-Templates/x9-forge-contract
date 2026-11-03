import { z } from 'zod';
// Paperclip packages/shared/dist/constants.js:165-173.
export const PAPERCLIP_STATI_INCARICO = [
    'backlog',
    'todo',
    'in_progress',
    'in_review',
    'done',
    'blocked',
    'cancelled',
];
export const PaperclipStatoIncaricoSchema = z.enum(PAPERCLIP_STATI_INCARICO);
// Paperclip server/dist/routes/issues.js:5806-5807.
export const PaperclipBloccoSchema = z.looseObject({
    id: z.guid(),
    status: PaperclipStatoIncaricoSchema,
    title: z.string().optional(),
    identifier: z.string().nullable().optional(),
    assigneeAgentId: z.guid().nullable().optional(),
});
// Paperclip server/dist/routes/issues.js:5790-5810.
export const PaperclipIncaricoSchema = z.looseObject({
    id: z.guid(),
    title: z.string(),
    description: z.string().nullable().optional(),
    status: PaperclipStatoIncaricoSchema,
    parentId: z.guid().nullable().optional(),
    goalId: z.guid().nullable().optional(),
    assigneeAgentId: z.guid().nullable().optional(),
    blockedBy: z.array(PaperclipBloccoSchema).optional(),
});
// Paperclip server/dist/routes/issues.js:10826-10855.
export const PaperclipCommentoSchema = z.looseObject({
    id: z.guid(),
    body: z.string(),
    authorAgentId: z.guid().nullable().optional(),
    authorUserId: z.string().nullable().optional(),
    createdAt: z.string().optional(),
});
export const PaperclipCommentiSchema = z.array(PaperclipCommentoSchema);
// Paperclip server/dist/routes/issues.js:5728-5870.
export const PaperclipContestoTurnoSchema = z.looseObject({
    issue: PaperclipIncaricoSchema,
    ancestors: z.array(z.looseObject({
        id: z.guid(),
        title: z.string().optional(),
        status: PaperclipStatoIncaricoSchema.optional(),
    })),
    wakeComment: PaperclipCommentoSchema.nullable().optional(),
});
// Paperclip docs/guides/agent-developer/heartbeat-protocol.md:12-18;
// server/dist/routes/agents.js:3368.
export const PaperclipAgenteMeSchema = z.looseObject({
    id: z.guid(),
    companyId: z.guid(),
});
// Paperclip server/dist/routes/issues.js:3290,10654-10659.
export const PaperclipErroreRispostaSchema = z.looseObject({
    error: z.string(),
});
//# sourceMappingURL=wire-letture.js.map