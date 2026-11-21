"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRequestSchema = exports.PaperclipDirectorNativeCreateInputSchema = exports.PaperclipDirectorCreateInputSchema = exports.AgentQuestionDetailsSchema = exports.AGENT_QUESTION_TRIED_MIN = exports.AgentRequestIdSchema = exports.AgentRequestTargetKindSchema = exports.AGENT_REQUEST_TARGET_KINDS = void 0;
exports.agentQuestionFreeTextProblem = agentQuestionFreeTextProblem;
exports.agentQuestionRecord = agentQuestionRecord;
exports.parseAgentQuestionRecord = parseAgentQuestionRecord;
const zod_1 = require("zod");
const decision_request_js_1 = require("./decision-request.cjs");
const tools_js_1 = require("../capability/paperclip/tools.cjs");
const native_wait_js_1 = require("../capability/paperclip/native-wait.cjs");
exports.AGENT_REQUEST_TARGET_KINDS = ['director', 'lab', 'business_unit'];
exports.AgentRequestTargetKindSchema = zod_1.z.enum(exports.AGENT_REQUEST_TARGET_KINDS);
exports.AgentRequestIdSchema = zod_1.z.string().regex(/^areq_[A-Za-z0-9_-]{8,64}$/)
    .describe('Identificativo della richiesta: areq_ più 8-64 caratteri');
const TextSchema = zod_1.z.string().trim().min(1).max(2000);
exports.AGENT_QUESTION_TRIED_MIN = 1;
/** The asker supplies the classification and attempts; consumers must never infer them from prose. */
exports.AgentQuestionDetailsSchema = zod_1.z.strictObject({
    kind: zod_1.z.enum(['clarification', 'scope_decision', 'technical_fault', 'clearance']),
    cause: zod_1.z.discriminatedUnion('kind', [
        zod_1.z.strictObject({ kind: zod_1.z.literal('question') }),
        zod_1.z.strictObject({
            kind: zod_1.z.literal('refusal'),
            code: zod_1.z.string().trim().min(1).max(120),
            tried: zod_1.z.array(zod_1.z.string().trim().min(1).max(500)).min(exports.AGENT_QUESTION_TRIED_MIN).max(10),
        }),
    ]),
});
// Keep general creation additive; the service requires question when the resolved recipient is the Director.
exports.PaperclipDirectorCreateInputSchema = tools_js_1.PaperclipCreateIssueAgentInputSchema.extend({
    question: exports.AgentQuestionDetailsSchema.optional(),
});
exports.PaperclipDirectorNativeCreateInputSchema = native_wait_js_1.PaperclipNativeCreateIssueAgentInputSchema.safeExtend({
    question: exports.AgentQuestionDetailsSchema.optional(),
});
/** A lead asks the Director, the Lab or another unit for something only they can give. */
exports.AgentRequestSchema = zod_1.z.strictObject({
    schemaVersion: zod_1.z.literal(1),
    requestId: exports.AgentRequestIdSchema,
    from: zod_1.z.strictObject({
        unitId: zod_1.z.string().min(1).max(200).describe('Reparto di chi chiede'),
        paperclipAgentId: zod_1.z.uuid().describe('Agente Paperclip di chi chiede'),
    }),
    to: zod_1.z.discriminatedUnion('kind', [
        zod_1.z.strictObject({ kind: zod_1.z.literal(exports.AGENT_REQUEST_TARGET_KINDS[0]) }),
        zod_1.z.strictObject({ kind: zod_1.z.literal(exports.AGENT_REQUEST_TARGET_KINDS[1]) }),
        zod_1.z.strictObject({
            kind: zod_1.z.literal(exports.AGENT_REQUEST_TARGET_KINDS[2]),
            unitId: zod_1.z.string().min(1).max(200).describe('Reparto a cui si chiede'),
        }),
    ]),
    need: TextSchema.describe('Cosa serve'),
    why: TextSchema.describe('Perché serve'),
    mandate: zod_1.z.strictObject({
        issueId: zod_1.z.uuid(),
        identifier: zod_1.z.string().min(1).max(40),
    }).describe('Il Mandato di origine'),
    plan: zod_1.z.strictObject({
        planId: decision_request_js_1.DecisionRequestIdSchema,
        version: zod_1.z.int().min(1),
    }).optional().describe('Il piano del Mandato; assente se il Mandato non ha intestazione di piano'),
    details: exports.AgentQuestionDetailsSchema.optional(),
    requestedAt: zod_1.z.iso.datetime({ offset: true }),
}).superRefine((value, ctx) => {
    // Historical requests stay readable; only new detailed questions require the exact source plan.
    if (value.details !== undefined && value.plan === undefined) {
        ctx.addIssue({ code: 'custom', message: 'A detailed question requires its source plan', path: ['plan'] });
    }
    if (value.to.kind === 'business_unit' && value.to.unitId === value.from.unitId) {
        ctx.addIssue({ code: 'custom', message: 'a unit cannot ask itself', path: ['to', 'unitId'] });
    }
});
const QUESTION_MARKER = 'x9-agent-question:v1';
const QUESTION_OPEN = '```' + QUESTION_MARKER;
/** The record is service-owned: model prose may not impersonate its delimiter. */
function agentQuestionFreeTextProblem(text) {
    return text.includes(QUESTION_MARKER) ? 'Reserved agent question marker in free text' : undefined;
}
/** Schema parsing fixes field order so equivalent requests produce the same complete record. */
function agentQuestionRecord(request) {
    const json = JSON.stringify(exports.AgentRequestSchema.parse(request));
    const problem = agentQuestionFreeTextProblem(json);
    if (problem !== undefined)
        throw new Error(problem);
    return `${QUESTION_OPEN}\n${json}\n\`\`\``;
}
/** A reserved marker commits the reader to strict parsing, never fallback to a historical description. */
function parseAgentQuestionRecord(text) {
    const count = text.split(QUESTION_MARKER).length - 1;
    if (count === 0)
        return undefined;
    if (count !== 1)
        throw new Error('Expected exactly one agent question record');
    const match = /(?:^|\r?\n)```x9-agent-question:v1\r?\n([\s\S]*?)\r?\n```(?=\r?\n|$)/.exec(text);
    if (match === null)
        throw new Error('Malformed agent question record');
    return exports.AgentRequestSchema.parse(JSON.parse(match[1]));
}
//# sourceMappingURL=agent-request.js.map