"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRequestSchema = exports.AgentRequestIdSchema = exports.AgentRequestTargetKindSchema = exports.AGENT_REQUEST_TARGET_KINDS = void 0;
const zod_1 = require("zod");
const decision_request_js_1 = require("./decision-request.cjs");
exports.AGENT_REQUEST_TARGET_KINDS = ['director', 'lab', 'business_unit'];
exports.AgentRequestTargetKindSchema = zod_1.z.enum(exports.AGENT_REQUEST_TARGET_KINDS);
exports.AgentRequestIdSchema = zod_1.z.string().regex(/^areq_[A-Za-z0-9_-]{8,64}$/)
    .describe('Identificativo della richiesta: areq_ più 8-64 caratteri');
const TextSchema = zod_1.z.string().trim().min(1).max(2000);
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
    requestedAt: zod_1.z.iso.datetime({ offset: true }),
}).superRefine((value, ctx) => {
    if (value.to.kind === 'business_unit' && value.to.unitId === value.from.unitId) {
        ctx.addIssue({ code: 'custom', message: 'a unit cannot ask itself', path: ['to', 'unitId'] });
    }
});
//# sourceMappingURL=agent-request.js.map