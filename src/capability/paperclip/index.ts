/** Public cap-paperclip contracts. Native Paperclip payloads remain at the adapter boundary. */
import { z } from 'zod';

const Text = z.string().min(1).max(4096).refine(value => value.trim().length > 0, 'Non-blank text required');
const Timestamp = z.iso.datetime({ offset: true });
const Email = /^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/;

export const PaperclipMaterialEventTypeSchema = z.enum([
  'moodboard_ready', 'board_ready', 'plan_verified', 'decision_needed', 'release_delivered',
]);
export const PaperclipMaterialEventSchema = z.strictObject({
  eventId: Text, unitId: Text, incrementId: Text,
  eventType: PaperclipMaterialEventTypeSchema, materialVersion: Text,
  summary: Text, materialLinks: z.array(Text), occurredAt: Timestamp,
  decisionId: Text.nullable().optional(), test: z.boolean().optional(),
});

const Channel = z.strictObject({ address: Text });
const Referent = z.strictObject({
  verified: z.boolean(),
  channels: z.record(Text, Channel).superRefine((channels, ctx) => {
    if (channels['email'] && !Email.test(channels['email'].address)) {
      ctx.addIssue({ code: 'custom', path: ['email', 'address'], message: 'Bare email address required' });
    }
  }),
});
const Role = z.strictObject({ agentRef: Text, referentRef: Text, channel: Text });
const Unit = z.strictObject({
  events: z.partialRecord(PaperclipMaterialEventTypeSchema, Text),
  roles: z.record(Text, Role), referents: z.record(Text, Referent),
});
/** Configuration is operator-owned. Parsing it does not authenticate a caller or verify a human. */
export const PaperclipRoutingConfigSchema = z.strictObject({
  schemaVersion: z.literal(1), revision: Text, units: z.record(Text, Unit),
});
export const PaperclipResolvedRouteSchema = z.strictObject({
  routingRevision: Text, roleRef: Text, agentRef: Text, referentRef: Text, channel: Text, address: Text,
}).superRefine((route, ctx) => {
  if (route.channel === 'email' && !Email.test(route.address)) {
    ctx.addIssue({ code: 'custom', path: ['address'], message: 'Bare email address required' });
  }
});
export const PaperclipHandoffSchema = z.strictObject({
  schemaVersion: z.literal(1), handoffId: z.uuid(),
  event: PaperclipMaterialEventSchema, route: PaperclipResolvedRouteSchema,
});
/** Accepted means durable spokesperson intake, never an assertion that an email was sent. */
export const PaperclipHandoffReceiptSchema = z.strictObject({
  handoffId: z.uuid(), agentRef: Text, status: z.literal('accepted'), receiptId: Text,
});
/** This audit record is an explicit human attestation and does not mutate Paperclip. */
export const PaperclipDecisionRecordSchema = z.strictObject({
  communicationId: Text, materialVersion: Text, referentId: Text,
  outcome: z.enum(['approved', 'changes_requested']), changes: z.string().max(4096),
  operatorId: Text, humanEvidence: Text, authorization: z.literal('manual_attestation'),
  paperclipUpdated: z.literal(false), recordedAt: Timestamp,
}).superRefine((record, ctx) => {
  if (record.outcome === 'changes_requested' && !record.changes.trim()) {
    ctx.addIssue({ code: 'custom', path: ['changes'], message: 'Requested changes required' });
  }
});

export type PaperclipMaterialEventType = z.infer<typeof PaperclipMaterialEventTypeSchema>;
export type PaperclipMaterialEvent = z.infer<typeof PaperclipMaterialEventSchema>;
export type PaperclipRoutingConfig = z.infer<typeof PaperclipRoutingConfigSchema>;
export type PaperclipResolvedRoute = z.infer<typeof PaperclipResolvedRouteSchema>;
export type PaperclipHandoff = z.infer<typeof PaperclipHandoffSchema>;
export type PaperclipHandoffReceipt = z.infer<typeof PaperclipHandoffReceiptSchema>;
export type PaperclipDecisionRecord = z.infer<typeof PaperclipDecisionRecordSchema>;

export * from './tools.js';

/** Provider communication references correlate an exact material version with a human reply. */
const Reference = Text.nullable().optional();
export const PaperclipCommunicationRecordSchema = z.strictObject({
  schemaVersion: z.literal(1), communicationId: Text, eventId: Text, unitId: Text, incrementId: Text,
  eventType: Text, materialVersion: Text, decisionId: Reference,
  recipientRef: Text, recipientAddress: Text.regex(Email),
  status: z.enum(['pending', 'sending', 'sent', 'unknown', 'failed']),
  providerMessageId: Reference, providerThreadId: Reference, rfcMessageId: Reference,
  createdAt: Timestamp, attemptedAt: Timestamp.nullable().optional(), sentAt: Timestamp.nullable().optional(),
  attempts: z.number().int().nonnegative().optional(), errorCode: Reference,
}).superRefine((record, ctx) => {
  if (record.status === 'sent' && (!record.providerMessageId || !record.sentAt)) {
    ctx.addIssue({ code: 'custom', path: ['status'], message: 'Sent requires provider message and timestamp' });
  }
});
/** Mailbox interpretation is performed by the reply adapter; display names remain data. */
export const PaperclipReplyRecordSchema = z.strictObject({
  replyId: Text, source: z.enum(['email', 'voice']), sourceEvidence: Text,
  receivedAt: Timestamp, text: z.string().max(262144), from: Text.optional(),
  inReplyTo: Reference, providerThreadId: Reference,
}).superRefine((record, ctx) => {
  if (record.source === 'email' && (!record.from || /[\r\n]/.test(record.from) || !record.from.includes('@'))) {
    ctx.addIssue({ code: 'custom', path: ['from'], message: 'Email sender required' });
  }
});
export const PaperclipManualConfirmationSchema = z.strictObject({
  communicationId: Text, materialVersion: Text, referentId: Text,
  outcome: z.enum(['approved', 'changes_requested']), operatorId: Text, humanEvidence: Text,
  changes: z.string().max(4096).default(''), expectedDecisionReply: Reference,
}).superRefine((record, ctx) => {
  if (record.outcome === 'changes_requested' && !record.changes.trim()) {
    ctx.addIssue({ code: 'custom', path: ['changes'], message: 'Requested changes required' });
  }
});
export const PaperclipDecisionViewSchema = z.strictObject({
  replyId: Text, source: z.enum(['email', 'voice']), sourceEvidence: Text, receivedAt: Timestamp,
  recordedDecision: PaperclipDecisionRecordSchema.nullable(), communicationId: Text.nullable(),
  status: z.enum(['ambiguous', 'approved', 'changes_requested', 'empty_reply', 'obsolete',
    'pending_manual_confirmation', 'predates_request', 'referent_changed', 'superseded_confirmation', 'unmatched', 'wrong_sender']),
  materialVersion: Text.nullable(), decision: PaperclipDecisionRecordSchema.nullable(), paperclipUpdated: z.literal(false),
  textSha256: z.string().regex(/^[a-f0-9]{64}$/), unitId: Text.optional(), incrementId: Text.optional(),
  eventType: Text.optional(), decisionId: Reference, recipientRef: Text.optional(),
});
export type PaperclipCommunicationRecord = z.infer<typeof PaperclipCommunicationRecordSchema>;
export type PaperclipReplyRecord = z.infer<typeof PaperclipReplyRecordSchema>;
export type PaperclipManualConfirmation = z.infer<typeof PaperclipManualConfirmationSchema>;
export type PaperclipDecisionView = z.infer<typeof PaperclipDecisionViewSchema>;
