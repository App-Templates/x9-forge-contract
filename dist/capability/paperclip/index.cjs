"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipDecisionViewSchema = exports.PaperclipManualConfirmationSchema = exports.PaperclipReplyRecordSchema = exports.PaperclipCommunicationRecordSchema = exports.PaperclipDecisionRecordSchema = exports.PaperclipHandoffReceiptSchema = exports.PaperclipHandoffSchema = exports.PaperclipResolvedRouteSchema = exports.PaperclipRoutingConfigSchema = exports.PaperclipMaterialEventSchema = exports.PaperclipMaterialEventTypeSchema = void 0;
/** Public cap-paperclip contracts. Native Paperclip payloads remain at the adapter boundary. */
const zod_1 = require("zod");
const Text = zod_1.z.string().min(1).max(4096).refine(value => value.trim().length > 0, 'Non-blank text required');
const Timestamp = zod_1.z.iso.datetime({ offset: true });
const Email = /^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/;
exports.PaperclipMaterialEventTypeSchema = zod_1.z.enum([
    'moodboard_ready', 'board_ready', 'plan_verified', 'decision_needed', 'release_delivered',
]);
exports.PaperclipMaterialEventSchema = zod_1.z.strictObject({
    eventId: Text, unitId: Text, incrementId: Text,
    eventType: exports.PaperclipMaterialEventTypeSchema, materialVersion: Text,
    summary: Text, materialLinks: zod_1.z.array(Text), occurredAt: Timestamp,
    decisionId: Text.nullable().optional(), test: zod_1.z.boolean().optional(),
});
const Channel = zod_1.z.strictObject({ address: Text });
const Referent = zod_1.z.strictObject({
    verified: zod_1.z.boolean(),
    channels: zod_1.z.record(Text, Channel).superRefine((channels, ctx) => {
        if (channels['email'] && !Email.test(channels['email'].address)) {
            ctx.addIssue({ code: 'custom', path: ['email', 'address'], message: 'Bare email address required' });
        }
    }),
});
const Role = zod_1.z.strictObject({ agentRef: Text, referentRef: Text, channel: Text });
const Unit = zod_1.z.strictObject({
    events: zod_1.z.partialRecord(exports.PaperclipMaterialEventTypeSchema, Text),
    roles: zod_1.z.record(Text, Role), referents: zod_1.z.record(Text, Referent),
});
/** Configuration is operator-owned. Parsing it does not authenticate a caller or verify a human. */
exports.PaperclipRoutingConfigSchema = zod_1.z.strictObject({
    schemaVersion: zod_1.z.literal(1), revision: Text, units: zod_1.z.record(Text, Unit),
});
exports.PaperclipResolvedRouteSchema = zod_1.z.strictObject({
    routingRevision: Text, roleRef: Text, agentRef: Text, referentRef: Text, channel: Text, address: Text,
}).superRefine((route, ctx) => {
    if (route.channel === 'email' && !Email.test(route.address)) {
        ctx.addIssue({ code: 'custom', path: ['address'], message: 'Bare email address required' });
    }
});
exports.PaperclipHandoffSchema = zod_1.z.strictObject({
    schemaVersion: zod_1.z.literal(1), handoffId: zod_1.z.uuid(),
    event: exports.PaperclipMaterialEventSchema, route: exports.PaperclipResolvedRouteSchema,
});
/** Accepted means durable spokesperson intake, never an assertion that an email was sent. */
exports.PaperclipHandoffReceiptSchema = zod_1.z.strictObject({
    handoffId: zod_1.z.uuid(), agentRef: Text, status: zod_1.z.literal('accepted'), receiptId: Text,
});
/** This audit record is an explicit human attestation and does not mutate Paperclip. */
exports.PaperclipDecisionRecordSchema = zod_1.z.strictObject({
    communicationId: Text, materialVersion: Text, referentId: Text,
    outcome: zod_1.z.enum(['approved', 'changes_requested']), changes: zod_1.z.string().max(4096),
    operatorId: Text, humanEvidence: Text, authorization: zod_1.z.literal('manual_attestation'),
    paperclipUpdated: zod_1.z.literal(false), recordedAt: Timestamp,
}).superRefine((record, ctx) => {
    if (record.outcome === 'changes_requested' && !record.changes.trim()) {
        ctx.addIssue({ code: 'custom', path: ['changes'], message: 'Requested changes required' });
    }
});
__exportStar(require("./tools.cjs"), exports);
/** Provider communication references correlate an exact material version with a human reply. */
const Reference = Text.nullable().optional();
exports.PaperclipCommunicationRecordSchema = zod_1.z.strictObject({
    schemaVersion: zod_1.z.literal(1), communicationId: Text, eventId: Text, unitId: Text, incrementId: Text,
    eventType: Text, materialVersion: Text, decisionId: Reference,
    recipientRef: Text, recipientAddress: Text.regex(Email),
    status: zod_1.z.enum(['pending', 'sending', 'sent', 'unknown', 'failed']),
    providerMessageId: Reference, providerThreadId: Reference, rfcMessageId: Reference,
    createdAt: Timestamp, attemptedAt: Timestamp.nullable().optional(), sentAt: Timestamp.nullable().optional(),
    attempts: zod_1.z.number().int().nonnegative().optional(), errorCode: Reference,
}).superRefine((record, ctx) => {
    if (record.status === 'sent' && (!record.providerMessageId || !record.sentAt)) {
        ctx.addIssue({ code: 'custom', path: ['status'], message: 'Sent requires provider message and timestamp' });
    }
});
/** Mailbox interpretation is performed by the reply adapter; display names remain data. */
exports.PaperclipReplyRecordSchema = zod_1.z.strictObject({
    replyId: Text, source: zod_1.z.enum(['email', 'voice']), sourceEvidence: Text,
    receivedAt: Timestamp, text: zod_1.z.string().max(262144), from: Text.optional(),
    inReplyTo: Reference, providerThreadId: Reference,
}).superRefine((record, ctx) => {
    if (record.source === 'email' && (!record.from || /[\r\n]/.test(record.from) || !record.from.includes('@'))) {
        ctx.addIssue({ code: 'custom', path: ['from'], message: 'Email sender required' });
    }
});
exports.PaperclipManualConfirmationSchema = zod_1.z.strictObject({
    communicationId: Text, materialVersion: Text, referentId: Text,
    outcome: zod_1.z.enum(['approved', 'changes_requested']), operatorId: Text, humanEvidence: Text,
    changes: zod_1.z.string().max(4096).default(''), expectedDecisionReply: Reference,
}).superRefine((record, ctx) => {
    if (record.outcome === 'changes_requested' && !record.changes.trim()) {
        ctx.addIssue({ code: 'custom', path: ['changes'], message: 'Requested changes required' });
    }
});
exports.PaperclipDecisionViewSchema = zod_1.z.strictObject({
    replyId: Text, source: zod_1.z.enum(['email', 'voice']), sourceEvidence: Text, receivedAt: Timestamp,
    recordedDecision: exports.PaperclipDecisionRecordSchema.nullable(), communicationId: Text.nullable(),
    status: zod_1.z.enum(['ambiguous', 'approved', 'changes_requested', 'empty_reply', 'obsolete',
        'pending_manual_confirmation', 'predates_request', 'referent_changed', 'superseded_confirmation', 'unmatched', 'wrong_sender']),
    materialVersion: Text.nullable(), decision: exports.PaperclipDecisionRecordSchema.nullable(), paperclipUpdated: zod_1.z.literal(false),
    textSha256: zod_1.z.string().regex(/^[a-f0-9]{64}$/), unitId: Text.optional(), incrementId: Text.optional(),
    eventType: Text.optional(), decisionId: Reference, recipientRef: Text.optional(),
});
__exportStar(require("./agent-config.cjs"), exports);
__exportStar(require("./execution-context.cjs"), exports);
__exportStar(require("./native-admission.cjs"), exports);
//# sourceMappingURL=index.js.map