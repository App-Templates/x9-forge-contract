import { z } from 'zod';
import { AgentIdSchema, type AgentId } from '../agent/agent-identity.js';
import { AgentEmailInboxSchema } from '../messaging/agent-email-inbox.js';
import { BusinessUnitLeadBirthRequestSchema } from './business-unit-lead.js';

export const SharedMailboxLabelSchema = z.string().min(1).max(40)
  .regex(/^[\p{L}\p{N}][\p{L}\p{N} -]*$/u);
export type SharedMailboxLabel = z.infer<typeof SharedMailboxLabelSchema>;

export const SharedMailboxHolderSchema = z.strictObject({
  agentId: AgentIdSchema,
  label: SharedMailboxLabelSchema,
  displayName: z.string().min(1).max(120),
});
export type SharedMailboxHolder = z.infer<typeof SharedMailboxHolderSchema>;

/** One company inbox, shared by the Director and business unit leads. */
export const SharedMailboxSchema = z.strictObject({
  mailboxId: z.string().min(1).max(128),
  tenantId: BusinessUnitLeadBirthRequestSchema.shape.tenantId,
  companyId: BusinessUnitLeadBirthRequestSchema.shape.company.shape.companyId,
  providerInboxId: AgentEmailInboxSchema.shape.provider_inbox_id,
  address: z.email(),
  holders: z.array(SharedMailboxHolderSchema).min(2).max(50),
  defaultAgentId: AgentIdSchema,
}).superRefine((mailbox, ctx) => {
  const agentIds = new Set<AgentId>();
  const labels = new Set<string>();
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
export type SharedMailbox = z.infer<typeof SharedMailboxSchema>;

/** Relative to the contexts directory shared by Forge and cap-email. */
export const SHARED_MAILBOXES_FILE = 'companies/shared-mailboxes.json';

export const SharedMailboxFileEntrySchema = z.strictObject({
  companyName: z.string().min(1).max(120),
  mailbox: SharedMailboxSchema,
});
export type SharedMailboxFileEntry = z.infer<typeof SharedMailboxFileEntrySchema>;

export const SharedMailboxesFileSchema = z.array(SharedMailboxFileEntrySchema).max(500)
  .superRefine((entries, ctx) => {
    const mailboxIds = new Set<string>();
    const providerInboxIds = new Set<string>();
    const holderAgentIds = new Set<AgentId>();
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
export type SharedMailboxesFile = z.infer<typeof SharedMailboxesFileSchema>;

/** Reject malformed files before exposing any mailbox to consumers. */
export function parseSharedMailboxesFile(json: unknown): SharedMailbox[] {
  return SharedMailboxesFileSchema.parse(json).map((entry) => entry.mailbox);
}

/** Provider conversation ownership, scoped to one mailbox. */
export const SharedMailboxThreadSchema = z.strictObject({
  mailboxId: SharedMailboxSchema.shape.mailboxId,
  providerThreadId: z.string().min(1).max(512),
  agentId: AgentIdSchema,
  openedAt: z.iso.datetime({ offset: true }),
});
export type SharedMailboxThread = z.infer<typeof SharedMailboxThreadSchema>;

export const SHARED_MAILBOX_ROUTE_VIAS = ['thread', 'label', 'default'] as const;
export type SharedMailboxRouteVia = (typeof SHARED_MAILBOX_ROUTE_VIAS)[number];
export type SharedMailboxRoute = { agentId: AgentId; via: SharedMailboxRouteVia };

export function parseSharedMailboxSubjectLabel(subject: string): string | null {
  const unprefixed = subject.replace(/^(?:\s*(?:re|r|fwd|i):\s*)*/i, '').trimStart();
  const match = /^\[([^\]]+)\]/u.exec(unprefixed);
  if (!match) return null;
  const label = SharedMailboxLabelSchema.safeParse(match[1]);
  return label.success ? label.data : null;
}

/** Preserve conversation ownership before considering a subject label. */
export function routeSharedMailboxMessage(input: {
  mailbox: SharedMailbox;
  threads: readonly SharedMailboxThread[];
  providerThreadId?: string | null;
  subject: string;
}): SharedMailboxRoute {
  const { mailbox, threads, providerThreadId, subject } = input;
  const thread = threads.find((candidate) =>
    candidate.mailboxId === mailbox.mailboxId
    && candidate.providerThreadId === providerThreadId
    && mailbox.holders.some((holder) => holder.agentId === candidate.agentId));
  if (thread) return { agentId: thread.agentId, via: SHARED_MAILBOX_ROUTE_VIAS[0] };

  const label = parseSharedMailboxSubjectLabel(subject);
  const holder = label === null ? undefined : mailbox.holders.find((candidate) =>
    candidate.label.toLowerCase() === label.toLowerCase());
  if (holder) return { agentId: holder.agentId, via: SHARED_MAILBOX_ROUTE_VIAS[1] };

  return { agentId: mailbox.defaultAgentId, via: SHARED_MAILBOX_ROUTE_VIAS[2] };
}
