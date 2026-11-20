import { z } from 'zod';
import type { PaperclipCommunicationChannel } from '../capability/paperclip/communication-channels.js';
import {
  AgentRoleSchema,
  BUSINESS_UNIT_LEAD_ROLE,
  DIRECTOR_ROLE,
  LAB_ROLE,
  RICERCA_ROLE,
  type AgentRole,
} from './agent-role.js';
import { CompanyMapEntrySchema, referentAddressKey } from './company-map.js';

/**
 * The caller scopes referents and the brief opener to the correct tenant, client and
 * project, and keeps responsibility for those checks. The brief opener comes from
 * the actual incoming email sender, never from a model or a document.
 * This policy trusts the supplied scope and only decides recipient admission.
 */
export const EMAIL_RECIPIENT_BASES = [
  'certified_referent', 'brief_opener', 'thread_referent_sender', 'owner',
] as const;
export type EmailRecipientBasis = (typeof EMAIL_RECIPIENT_BASES)[number];

export const EMAIL_RECIPIENT_ROLE_BASES: Record<AgentRole, readonly EmailRecipientBasis[]> = {
  [DIRECTOR_ROLE]: EMAIL_RECIPIENT_BASES,
  [BUSINESS_UNIT_LEAD_ROLE]: ['certified_referent', 'brief_opener', 'thread_referent_sender'],
  [LAB_ROLE]: ['thread_referent_sender'],
  [RICERCA_ROLE]: ['thread_referent_sender'],
};

export const EMAIL_RECIPIENT_REFUSALS = [
  'recipient_is_company_agent', 'recipient_not_certified', 'role_not_admitted', 'recipient_check_unavailable',
] as const;
export type EmailRecipientRefusal = (typeof EMAIL_RECIPIENT_REFUSALS)[number];

export const EMAIL_REFUSAL_CHANNELS: Record<EmailRecipientRefusal, readonly PaperclipCommunicationChannel[]> = {
  recipient_is_company_agent: ['addressed_question', 'assigned_issue', 'child_issue_with_blockers'],
  recipient_not_certified: [],
  role_not_admitted: [],
  recipient_check_unavailable: [],
};

const AddressSchema = z.string().transform((value) => {
  const trimmed = value.trim();
  const named = /^[^<>]*<([^<>]+)>$/.exec(trimmed);
  return referentAddressKey(named?.[1] ?? trimmed);
}).pipe(z.email());

export const EmailRecipientFactsSchema = z.strictObject({
  role: AgentRoleSchema,
  recipient: AddressSchema,
  referents: z.array(CompanyMapEntrySchema),
  ownerAddresses: z.array(AddressSchema),
  companyAgentAddresses: z.array(AddressSchema),
  briefOpener: z.strictObject({ address: AddressSchema }).optional(),
  threadSender: z.strictObject({
    address: AddressSchema,
    isCertifiedReferent: z.boolean(),
  }).optional(),
});
export type EmailRecipientFacts = z.infer<typeof EmailRecipientFactsSchema>;

export type EmailRecipientDecision =
  | { ok: true; basis: EmailRecipientBasis }
  | { ok: false; refusal: EmailRecipientRefusal; channels: readonly PaperclipCommunicationChannel[] };

/** Pure admission rule; refusals contain only closed codes and communication channels. */
export function decideEmailRecipient(facts: unknown): EmailRecipientDecision {
  const parsed = EmailRecipientFactsSchema.safeParse(facts);
  if (!parsed.success) {
    return { ok: false, refusal: 'recipient_check_unavailable', channels: EMAIL_REFUSAL_CHANNELS.recipient_check_unavailable };
  }
  const { role, recipient, referents, ownerAddresses, companyAgentAddresses, briefOpener, threadSender } = parsed.data;
  const bases = EMAIL_RECIPIENT_ROLE_BASES[role];
  if (bases.length === 0) {
    return { ok: false, refusal: 'role_not_admitted', channels: EMAIL_REFUSAL_CHANNELS.role_not_admitted };
  }
  if (bases.includes('owner') && ownerAddresses.includes(recipient)) {
    return { ok: true, basis: 'owner' };
  }
  if (bases.includes('certified_referent') && referents.some((entry) => referentAddressKey(entry.email) === recipient)) {
    return { ok: true, basis: 'certified_referent' };
  }
  if (bases.includes('brief_opener') && briefOpener?.address === recipient) {
    return { ok: true, basis: 'brief_opener' };
  }
  if (bases.includes('thread_referent_sender') && threadSender?.isCertifiedReferent && threadSender.address === recipient) {
    return { ok: true, basis: 'thread_referent_sender' };
  }
  if (companyAgentAddresses.includes(recipient)) {
    return { ok: false, refusal: 'recipient_is_company_agent', channels: EMAIL_REFUSAL_CHANNELS.recipient_is_company_agent };
  }
  return { ok: false, refusal: 'recipient_not_certified', channels: EMAIL_REFUSAL_CHANNELS.recipient_not_certified };
}
