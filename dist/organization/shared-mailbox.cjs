"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHARED_MAILBOX_ROUTE_VIAS = exports.SharedMailboxThreadSchema = exports.SharedMailboxSchema = exports.SharedMailboxHolderSchema = exports.SharedMailboxLabelSchema = void 0;
exports.parseSharedMailboxSubjectLabel = parseSharedMailboxSubjectLabel;
exports.routeSharedMailboxMessage = routeSharedMailboxMessage;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const agent_email_inbox_js_1 = require("../messaging/agent-email-inbox.cjs");
const business_unit_lead_js_1 = require("./business-unit-lead.cjs");
exports.SharedMailboxLabelSchema = zod_1.z.string().min(1).max(40)
    .regex(/^[\p{L}\p{N}][\p{L}\p{N} -]*$/u);
exports.SharedMailboxHolderSchema = zod_1.z.strictObject({
    agentId: agent_identity_js_1.AgentIdSchema,
    label: exports.SharedMailboxLabelSchema,
    displayName: zod_1.z.string().min(1).max(120),
});
/** One company inbox, shared by the Director and business unit leads. */
exports.SharedMailboxSchema = zod_1.z.strictObject({
    mailboxId: zod_1.z.string().min(1).max(128),
    tenantId: business_unit_lead_js_1.BusinessUnitLeadBirthRequestSchema.shape.tenantId,
    companyId: business_unit_lead_js_1.BusinessUnitLeadBirthRequestSchema.shape.company.shape.companyId,
    providerInboxId: agent_email_inbox_js_1.AgentEmailInboxSchema.shape.provider_inbox_id,
    address: zod_1.z.email(),
    holders: zod_1.z.array(exports.SharedMailboxHolderSchema).min(2).max(50),
    defaultAgentId: agent_identity_js_1.AgentIdSchema,
}).superRefine((mailbox, ctx) => {
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
/** Preserve conversation ownership before considering a subject label. */
function routeSharedMailboxMessage(input) {
    const { mailbox, threads, providerThreadId, subject } = input;
    const thread = threads.find((candidate) => candidate.mailboxId === mailbox.mailboxId
        && candidate.providerThreadId === providerThreadId
        && mailbox.holders.some((holder) => holder.agentId === candidate.agentId));
    if (thread)
        return { agentId: thread.agentId, via: exports.SHARED_MAILBOX_ROUTE_VIAS[0] };
    const label = parseSharedMailboxSubjectLabel(subject);
    const holder = label === null ? undefined : mailbox.holders.find((candidate) => candidate.label.toLowerCase() === label.toLowerCase());
    if (holder)
        return { agentId: holder.agentId, via: exports.SHARED_MAILBOX_ROUTE_VIAS[1] };
    return { agentId: mailbox.defaultAgentId, via: exports.SHARED_MAILBOX_ROUTE_VIAS[2] };
}
//# sourceMappingURL=shared-mailbox.js.map