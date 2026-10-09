"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipDecisionRecordSchema = exports.PaperclipHandoffReceiptSchema = exports.PaperclipHandoffSchema = exports.PaperclipResolvedRouteSchema = exports.PaperclipRoutingConfigSchema = exports.PaperclipMaterialEventSchema = exports.PaperclipMaterialEventTypeSchema = void 0;
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
//# sourceMappingURL=index.js.map