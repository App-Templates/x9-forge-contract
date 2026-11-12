import { z } from 'zod';
import { AgentIdSchema } from "../agent/agent-identity.js";
import { AgentEmailInboxSchema } from "../messaging/agent-email-inbox.js";
import { BusinessUnitLeadBirthRequestSchema } from "./business-unit-lead.js";
export const SharedMailboxLabelSchema = z.string().min(1).max(40)
    .regex(/^[\p{L}\p{N}][\p{L}\p{N} -]*$/u);
export const SharedMailboxHolderSchema = z.strictObject({
    agentId: AgentIdSchema,
    label: SharedMailboxLabelSchema,
    displayName: z.string().min(1).max(120),
});
export const SHARED_MAILBOX_AUDIENCES = ['business_unit_leads', 'directors'];
export const SharedMailboxAudienceSchema = z.enum(SHARED_MAILBOX_AUDIENCES);
/** One company inbox, shared by the Director and business unit leads, or by the project Directors. */
export const SharedMailboxSchema = z.strictObject({
    mailboxId: z.string().min(1).max(128),
    tenantId: BusinessUnitLeadBirthRequestSchema.shape.tenantId,
    companyId: BusinessUnitLeadBirthRequestSchema.shape.company.shape.companyId,
    providerInboxId: AgentEmailInboxSchema.shape.provider_inbox_id,
    address: z.email(),
    holders: z.array(SharedMailboxHolderSchema).min(1).max(50),
    defaultAgentId: AgentIdSchema,
    /** Absent means `business_unit_leads`. */
    audience: SharedMailboxAudienceSchema.optional(),
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
export function sharedMailboxAudience(mailbox) {
    return mailbox.audience ?? SHARED_MAILBOX_AUDIENCES[0];
}
/** Relative to the contexts directory shared by Forge and cap-email. */
export const SHARED_MAILBOXES_FILE = 'companies/shared-mailboxes.json';
export const SharedMailboxFileEntrySchema = z.strictObject({
    companyName: z.string().min(1).max(120),
    mailbox: SharedMailboxSchema,
});
export const SharedMailboxesFileSchema = z.array(SharedMailboxFileEntrySchema).max(500)
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
export function parseSharedMailboxesFile(json) {
    return SharedMailboxesFileSchema.parse(json).map((entry) => entry.mailbox);
}
/** Provider conversation ownership, scoped to one mailbox. */
export const SharedMailboxThreadSchema = z.strictObject({
    mailboxId: SharedMailboxSchema.shape.mailboxId,
    providerThreadId: z.string().min(1).max(512),
    agentId: AgentIdSchema,
    openedAt: z.iso.datetime({ offset: true }),
});
export const SHARED_MAILBOX_ROUTE_VIAS = ['thread', 'label', 'default'];
export function parseSharedMailboxSubjectLabel(subject) {
    const unprefixed = subject.replace(/^(?:\s*(?:re|r|fwd|i):\s*)*/i, '').trimStart();
    const match = /^\[([^\]]+)\]/u.exec(unprefixed);
    if (!match)
        return null;
    const label = SharedMailboxLabelSchema.safeParse(match[1]);
    return label.success ? label.data : null;
}
export const SHARED_MAILBOX_REFUSAL_REASONS = ['label_unknown'];
const REFUSED_LABEL_MAX_LENGTH = 80;
/** Thread first, then subject label; a directors mailbox refuses an unknown leading label. */
export function decideSharedMailboxRoute(input) {
    const { mailbox, threads, providerThreadId, subject } = input;
    const thread = threads.find((candidate) => candidate.mailboxId === mailbox.mailboxId
        && candidate.providerThreadId === providerThreadId
        && mailbox.holders.some((holder) => holder.agentId === candidate.agentId));
    if (thread)
        return { agentId: thread.agentId, via: SHARED_MAILBOX_ROUTE_VIAS[0] };
    const label = parseSharedMailboxSubjectLabel(subject);
    const holder = label === null ? undefined : mailbox.holders.find((candidate) => candidate.label.toLowerCase() === label.toLowerCase());
    if (holder)
        return { agentId: holder.agentId, via: SHARED_MAILBOX_ROUTE_VIAS[1] };
    if (sharedMailboxAudience(mailbox) === 'directors') {
        const unprefixed = subject.replace(/^(?:\s*(?:re|r|fwd|i):\s*)*/i, '').trimStart();
        const group = /^\[([^\]]*)\]/u.exec(unprefixed);
        if (group) {
            return { via: 'refused', reason: SHARED_MAILBOX_REFUSAL_REASONS[0], label: group[1].slice(0, REFUSED_LABEL_MAX_LENGTH) };
        }
    }
    return { agentId: mailbox.defaultAgentId, via: SHARED_MAILBOX_ROUTE_VIAS[2] };
}
/** Same shape as ever; throws on a refusal so a caller that ignores refusals never delivers to the default. */
export function routeSharedMailboxMessage(input) {
    const decision = decideSharedMailboxRoute(input);
    if (decision.via === 'refused') {
        throw new Error(`Shared mailbox message refused: ${decision.reason} (${decision.label})`);
    }
    return decision;
}
/** `[label]` as written in a subject; the label must be valid and read back unchanged. */
export function formatSharedMailboxSubjectLabel(label) {
    const valid = SharedMailboxLabelSchema.parse(label);
    const subject = `[${valid}]`;
    if (parseSharedMailboxSubjectLabel(subject) !== valid) {
        throw new Error('Shared mailbox label does not read back from its subject');
    }
    return subject;
}
/** A valid label from a project name: collapse spaces, drop characters a label refuses, cap at 40. */
export function sharedMailboxLabelFromName(name) {
    const cleaned = name.replace(/[^\p{L}\p{N} -]/gu, '').replace(/ {2,}/g, ' ')
        .replace(/^[^\p{L}\p{N}]+/u, '').slice(0, 40).trimEnd();
    const label = SharedMailboxLabelSchema.safeParse(cleaned);
    if (!label.success)
        throw new Error('Project name has no characters usable as a mailbox label');
    return label.data;
}
//# sourceMappingURL=shared-mailbox.js.map