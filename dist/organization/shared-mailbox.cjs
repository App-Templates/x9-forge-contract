"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHARED_MAILBOX_REFUSAL_REASONS = exports.SHARED_MAILBOX_ROUTE_VIAS = exports.SharedMailboxThreadSchema = exports.SharedMailboxesFileSchema = exports.SharedMailboxFileEntrySchema = exports.SHARED_MAILBOXES_FILE = exports.SharedMailboxSchema = exports.SharedMailboxAudienceSchema = exports.SHARED_MAILBOX_AUDIENCES = exports.SharedMailboxHolderSchema = exports.SharedMailboxLabelSchema = void 0;
exports.sharedMailboxAudience = sharedMailboxAudience;
exports.parseSharedMailboxesFile = parseSharedMailboxesFile;
exports.parseSharedMailboxSubjectLabel = parseSharedMailboxSubjectLabel;
exports.isStackSubjectTag = isStackSubjectTag;
exports.decideSharedMailboxRoute = decideSharedMailboxRoute;
exports.routeSharedMailboxMessage = routeSharedMailboxMessage;
exports.formatSharedMailboxSubjectLabel = formatSharedMailboxSubjectLabel;
exports.sharedMailboxLabelFromName = sharedMailboxLabelFromName;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const agent_email_inbox_js_1 = require("../messaging/agent-email-inbox.cjs");
const business_unit_lead_js_1 = require("./business-unit-lead.cjs");
const decision_request_js_1 = require("./decision-request.cjs");
exports.SharedMailboxLabelSchema = zod_1.z.string().min(1).max(40)
    .regex(/^[\p{L}\p{N}][\p{L}\p{N} -]*$/u);
exports.SharedMailboxHolderSchema = zod_1.z.strictObject({
    agentId: agent_identity_js_1.AgentIdSchema,
    label: exports.SharedMailboxLabelSchema,
    displayName: zod_1.z.string().min(1).max(120),
});
exports.SHARED_MAILBOX_AUDIENCES = ['business_unit_leads', 'directors'];
exports.SharedMailboxAudienceSchema = zod_1.z.enum(exports.SHARED_MAILBOX_AUDIENCES);
/** One company inbox, shared by the Director and business unit leads, or by the project Directors. */
exports.SharedMailboxSchema = zod_1.z.strictObject({
    mailboxId: zod_1.z.string().min(1).max(128),
    tenantId: business_unit_lead_js_1.BusinessUnitLeadBirthRequestSchema.shape.tenantId,
    companyId: business_unit_lead_js_1.BusinessUnitLeadBirthRequestSchema.shape.company.shape.companyId,
    providerInboxId: agent_email_inbox_js_1.AgentEmailInboxSchema.shape.provider_inbox_id,
    address: zod_1.z.email(),
    holders: zod_1.z.array(exports.SharedMailboxHolderSchema).min(1).max(50),
    defaultAgentId: agent_identity_js_1.AgentIdSchema,
    /** Absent means `business_unit_leads`. */
    audience: exports.SharedMailboxAudienceSchema.optional(),
}).superRefine((mailbox, ctx) => {
    if (mailbox.audience !== 'directors' && mailbox.holders.length < 2) {
        ctx.addIssue({ code: 'custom', path: ['holders'], message: 'A business unit leads mailbox needs at least 2 holders' });
    }
    const agentIds = new Set();
    const labels = new Set();
    mailbox.holders.forEach((holder, index) => {
        if (agentIds.has(holder.agentId)) {
            ctx.addIssue({ code: 'custom', path: ['holders', index, 'agentId'], message: 'Holder agent IDs must be unique' });
        }
        agentIds.add(holder.agentId);
        const label = holder.label.toLowerCase();
        if (labels.has(label)) {
            ctx.addIssue({ code: 'custom', path: ['holders', index, 'label'], message: 'Holder labels must be unique ignoring case' });
        }
        labels.add(label);
    });
    if (!agentIds.has(mailbox.defaultAgentId)) {
        ctx.addIssue({ code: 'custom', path: ['defaultAgentId'], message: 'Default agent must be a mailbox holder' });
    }
});
function sharedMailboxAudience(mailbox) {
    return mailbox.audience ?? exports.SHARED_MAILBOX_AUDIENCES[0];
}
/** Relative to the contexts directory shared by Forge and cap-email. */
exports.SHARED_MAILBOXES_FILE = 'companies/shared-mailboxes.json';
exports.SharedMailboxFileEntrySchema = zod_1.z.strictObject({
    companyName: zod_1.z.string().min(1).max(120),
    mailbox: exports.SharedMailboxSchema,
});
exports.SharedMailboxesFileSchema = zod_1.z.array(exports.SharedMailboxFileEntrySchema).max(500)
    .superRefine((entries, ctx) => {
    const mailboxIds = new Set();
    const providerInboxIds = new Set();
    const holderAgentIds = new Set();
    entries.forEach(({ mailbox }, index) => {
        if (mailboxIds.has(mailbox.mailboxId)) {
            ctx.addIssue({ code: 'custom', path: [index, 'mailbox', 'mailboxId'], message: 'Mailbox IDs must be unique' });
        }
        mailboxIds.add(mailbox.mailboxId);
        if (providerInboxIds.has(mailbox.providerInboxId)) {
            ctx.addIssue({ code: 'custom', path: [index, 'mailbox', 'providerInboxId'], message: 'Provider inbox IDs must be unique' });
        }
        providerInboxIds.add(mailbox.providerInboxId);
        mailbox.holders.forEach((holder, holderIndex) => {
            if (holderAgentIds.has(holder.agentId)) {
                ctx.addIssue({
                    code: 'custom', path: [index, 'mailbox', 'holders', holderIndex, 'agentId'],
                    message: 'Agent holds more than one shared mailbox',
                });
            }
            holderAgentIds.add(holder.agentId);
        });
    });
});
/** Reject malformed files before exposing any mailbox to consumers. */
function parseSharedMailboxesFile(json) {
    return exports.SharedMailboxesFileSchema.parse(json).map((entry) => entry.mailbox);
}
/** Provider conversation ownership, scoped to one mailbox. */
exports.SharedMailboxThreadSchema = zod_1.z.strictObject({
    mailboxId: exports.SharedMailboxSchema.shape.mailboxId,
    providerThreadId: zod_1.z.string().min(1).max(512),
    agentId: agent_identity_js_1.AgentIdSchema,
    openedAt: zod_1.z.iso.datetime({ offset: true }),
});
exports.SHARED_MAILBOX_ROUTE_VIAS = ['thread', 'label', 'default'];
function parseSharedMailboxSubjectLabel(subject) {
    const unprefixed = subject.replace(/^(?:\s*(?:re|r|fwd|i):\s*)*/i, '').trimStart();
    const match = /^\[([^\]]+)\]/u.exec(unprefixed);
    if (!match)
        return null;
    const label = exports.SharedMailboxLabelSchema.safeParse(match[1]);
    return label.success ? label.data : null;
}
exports.SHARED_MAILBOX_REFUSAL_REASONS = ['label_unknown'];
const REFUSED_LABEL_MAX_LENGTH = 80;
/** a bracket group written by the stack itself (decision request tag): never a holder label */
function isStackSubjectTag(group) {
    const match = /^(\S+)\s+(\S+)$/u.exec(group.trim());
    return match !== null
        && match[1].toLowerCase() === decision_request_js_1.DECISION_REQUEST_SUBJECT_LABEL.toLowerCase()
        && decision_request_js_1.DecisionRequestIdSchema.safeParse(match[2]).success;
}
/** Thread first, then leading holders or stack tags; directors refuse an unknown group. */
function decideSharedMailboxRoute(input) {
    const { mailbox, threads, providerThreadId, subject } = input;
    const thread = threads.find((candidate) => candidate.mailboxId === mailbox.mailboxId
        && candidate.providerThreadId === providerThreadId
        && mailbox.holders.some((holder) => holder.agentId === candidate.agentId));
    if (thread)
        return { agentId: thread.agentId, via: exports.SHARED_MAILBOX_ROUTE_VIAS[0] };
    let remaining = subject.replace(/^(?:\s*(?:re|r|fwd|i):\s*)*/i, '').trimStart();
    for (let group = /^\[([^\]]*)\]/u.exec(remaining); group; group = /^\[([^\]]*)\]/u.exec(remaining)) {
        const text = group[1];
        const label = exports.SharedMailboxLabelSchema.safeParse(text);
        const holder = label.success ? mailbox.holders.find((candidate) => candidate.label.toLowerCase() === label.data.toLowerCase()) : undefined;
        if (holder)
            return { agentId: holder.agentId, via: exports.SHARED_MAILBOX_ROUTE_VIAS[1] };
        if (isStackSubjectTag(text)) {
            remaining = remaining.slice(group[0].length).trimStart();
            continue;
        }
        if (sharedMailboxAudience(mailbox) === 'directors') {
            return { via: 'refused', reason: exports.SHARED_MAILBOX_REFUSAL_REASONS[0], label: text.slice(0, REFUSED_LABEL_MAX_LENGTH) };
        }
        break;
    }
    return { agentId: mailbox.defaultAgentId, via: exports.SHARED_MAILBOX_ROUTE_VIAS[2] };
}
/** Same shape as ever; throws on a refusal so a caller that ignores refusals never delivers to the default. */
function routeSharedMailboxMessage(input) {
    const decision = decideSharedMailboxRoute(input);
    if (decision.via === 'refused') {
        throw new Error(`Shared mailbox message refused: ${decision.reason} (${decision.label})`);
    }
    return decision;
}
/** `[label]` as written in a subject; the label must be valid and read back unchanged. */
function formatSharedMailboxSubjectLabel(label) {
    const valid = exports.SharedMailboxLabelSchema.parse(label);
    const subject = `[${valid}]`;
    if (parseSharedMailboxSubjectLabel(subject) !== valid) {
        throw new Error('Shared mailbox label does not read back from its subject');
    }
    return subject;
}
/** A valid label from a project name: collapse spaces, drop characters a label refuses, cap at 40. */
function sharedMailboxLabelFromName(name) {
    const cleaned = name.replace(/[^\p{L}\p{N} -]/gu, '').replace(/ {2,}/g, ' ')
        .replace(/^[^\p{L}\p{N}]+/u, '').slice(0, 40).trimEnd();
    const label = exports.SharedMailboxLabelSchema.safeParse(cleaned);
    if (!label.success)
        throw new Error('Project name has no characters usable as a mailbox label');
    return label.data;
}
//# sourceMappingURL=shared-mailbox.js.map