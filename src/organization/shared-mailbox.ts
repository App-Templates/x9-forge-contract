import { z } from 'zod';
import { AgentIdSchema, type AgentId } from '../agent/agent-identity.js';
import { AgentEmailInboxSchema } from '../messaging/agent-email-inbox.js';
import { BusinessUnitLeadBirthRequestSchema } from './business-unit-lead.js';
import { DECISION_REQUEST_SUBJECT_LABEL, DecisionRequestIdSchema } from './decision-request.js';

export const SharedMailboxLabelSchema = z.string().min(1).max(40)
  .regex(/^[\p{L}\p{N}][\p{L}\p{N} -]*$/u);
export type SharedMailboxLabel = z.infer<typeof SharedMailboxLabelSchema>;

export const SharedMailboxHolderSchema = z.strictObject({
  agentId: AgentIdSchema,
  label: SharedMailboxLabelSchema,
  displayName: z.string().min(1).max(120),
});
export type SharedMailboxHolder = z.infer<typeof SharedMailboxHolderSchema>;

/** Audience of the company mailbox shared by the business unit leads, also what an absent `audience` means. */
export const BUSINESS_UNIT_LEADS_MAILBOX_AUDIENCE = 'business_unit_leads';
/** Audience of the company mailbox shared by the project Directors. */
export const DIRECTORS_MAILBOX_AUDIENCE = 'directors';

export const SHARED_MAILBOX_AUDIENCES = [BUSINESS_UNIT_LEADS_MAILBOX_AUDIENCE, DIRECTORS_MAILBOX_AUDIENCE] as const;
export const SharedMailboxAudienceSchema = z.enum(SHARED_MAILBOX_AUDIENCES);
export type SharedMailboxAudience = z.infer<typeof SharedMailboxAudienceSchema>;

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
  if (mailbox.audience !== DIRECTORS_MAILBOX_AUDIENCE && mailbox.holders.length < 2) {
    ctx.addIssue({ code: 'custom', path: ['holders'], message: 'A business unit leads mailbox needs at least 2 holders' });
  }
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

export function sharedMailboxAudience(mailbox: Pick<SharedMailbox, 'audience'>): SharedMailboxAudience {
  return mailbox.audience ?? BUSINESS_UNIT_LEADS_MAILBOX_AUDIENCE;
}

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

export const SHARED_MAILBOX_REFUSAL_REASONS = ['label_unknown'] as const;
export type SharedMailboxRouteRefusal = { via: 'refused'; reason: 'label_unknown'; label: string };

type SharedMailboxRouteInput = {
  mailbox: SharedMailbox;
  threads: readonly SharedMailboxThread[];
  providerThreadId?: string | null;
  subject: string;
};

const REFUSED_LABEL_MAX_LENGTH = 80;

/** prefix of the request id the stack generates for a decision (X9 email-request-decision) */
export const GENERATED_DECISION_REQUEST_ID_PREFIX = 'dec_';

/** shape of the request id the stack generates for a decision, `dec_` + lowercase UUID; stored ids are read with the wider DecisionRequestIdSchema */
export const GeneratedDecisionRequestIdSchema = DecisionRequestIdSchema.regex(
  new RegExp(`^${GENERATED_DECISION_REQUEST_ID_PREFIX}[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`),
);

/** a bracket group written by the stack itself (decision request tag): never a holder label */
export function isStackSubjectTag(group: string): boolean {
  const match = /^(\S+)\s+(\S+)$/u.exec(group.trim());
  return match !== null
    && match[1]!.toLowerCase() === DECISION_REQUEST_SUBJECT_LABEL.toLowerCase()
    && GeneratedDecisionRequestIdSchema.safeParse(match[2]).success;
}

/** Thread first, then leading holders or stack tags; directors refuse an unknown group. */
export function decideSharedMailboxRoute(input: SharedMailboxRouteInput): SharedMailboxRoute | SharedMailboxRouteRefusal {
  const { mailbox, threads, providerThreadId, subject } = input;
  const thread = threads.find((candidate) =>
    candidate.mailboxId === mailbox.mailboxId
    && candidate.providerThreadId === providerThreadId
    && mailbox.holders.some((holder) => holder.agentId === candidate.agentId));
  if (thread) return { agentId: thread.agentId, via: SHARED_MAILBOX_ROUTE_VIAS[0] };

  let remaining = subject.replace(/^(?:\s*(?:re|r|fwd|i):\s*)*/i, '').trimStart();
  for (let group = /^\[([^\]]*)\]/u.exec(remaining); group; group = /^\[([^\]]*)\]/u.exec(remaining)) {
    const text = group[1]!;
    const label = SharedMailboxLabelSchema.safeParse(text);
    const holder = label.success ? mailbox.holders.find((candidate) =>
      candidate.label.toLowerCase() === label.data.toLowerCase()) : undefined;
    if (holder) return { agentId: holder.agentId, via: SHARED_MAILBOX_ROUTE_VIAS[1] };
    if (isStackSubjectTag(text)) {
      remaining = remaining.slice(group[0].length).trimStart();
      continue;
    }
    if (sharedMailboxAudience(mailbox) === DIRECTORS_MAILBOX_AUDIENCE) {
      return { via: 'refused', reason: SHARED_MAILBOX_REFUSAL_REASONS[0], label: text.slice(0, REFUSED_LABEL_MAX_LENGTH) };
    }
    break;
  }
  return { agentId: mailbox.defaultAgentId, via: SHARED_MAILBOX_ROUTE_VIAS[2] };
}

/** Same shape as ever; throws on a refusal so a caller that ignores refusals never delivers to the default. */
export function routeSharedMailboxMessage(input: SharedMailboxRouteInput): SharedMailboxRoute {
  const decision = decideSharedMailboxRoute(input);
  if (decision.via === 'refused') {
    throw new Error(`Shared mailbox message refused: ${decision.reason} (${decision.label})`);
  }
  return decision;
}

/** `[label]` as written in a subject; the label must be valid and read back unchanged. */
export function formatSharedMailboxSubjectLabel(label: string): string {
  const valid = SharedMailboxLabelSchema.parse(label);
  const subject = `[${valid}]`;
  if (parseSharedMailboxSubjectLabel(subject) !== valid) {
    throw new Error('Shared mailbox label does not read back from its subject');
  }
  return subject;
}

/** A valid label from a project name: collapse spaces, drop characters a label refuses, cap at 40. */
export function sharedMailboxLabelFromName(name: string): string {
  const cleaned = name.replace(/[^\p{L}\p{N} -]/gu, '').replace(/ {2,}/g, ' ')
    .replace(/^[^\p{L}\p{N}]+/u, '').slice(0, 40).trimEnd();
  const label = SharedMailboxLabelSchema.safeParse(cleaned);
  if (!label.success) throw new Error('Project name has no characters usable as a mailbox label');
  return label.data;
}
