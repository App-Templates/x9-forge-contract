import { z } from 'zod';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from '../capability/capability-call-context.js';
import { AgentConfigVersionSchema } from '../capability/ricerca/agent-config.js';
import { AgentRuntimeIdentitySchema } from './agent-runtime-identity.js';
import { VoiceLiveCallStartRequestSchema } from '../capability/voice-live/index.js';

/** Explicit ownership for access control; names and credentials never confer authorization. */
export const AgentChannelAccessBindingSchema = z.object({
  scope: CapabilityAgentScopeSchema.strict(), identity: AgentRuntimeIdentitySchema.strict(),
}).strict().refine(binding => binding.identity.runtimeAgentId === binding.scope.agentId,
  { message: 'Channel access identity must match runtime scope' });
export type AgentChannelAccessBinding = z.infer<typeof AgentChannelAccessBindingSchema>;

export function sameAgentChannelAccessBinding(left: unknown, right: unknown): boolean {
  const a = AgentChannelAccessBindingSchema.safeParse(left), b = AgentChannelAccessBindingSchema.safeParse(right);
  return a.success && b.success && sameCapabilityScope(a.data.scope, b.data.scope)
    && a.data.identity.managementAgentId === b.data.identity.managementAgentId
    && a.data.identity.vaultAgentId === b.data.identity.vaultAgentId;
}

/** Telegram uses at most 52 significant bits; canonical decimal strings preserve group signs. */
export const AgentTelegramChatIdSchema = z.string().regex(/^-?[1-9]\d{0,15}$/)
  .refine(value => Number.isSafeInteger(Number(value)), { message: 'Chat id must be a safe canonical integer' });
export type AgentTelegramChatId = z.infer<typeof AgentTelegramChatIdSchema>;
export const AgentTelegramChatTypeSchema = z.enum(['private', 'group', 'supergroup']);
export const AgentChannelAccessNameSchema = z.string().min(1).max(160).regex(/^[^\u0000-\u001f\u007f]*$/);
export const AgentTelegramAdmittedChatSchema = z.object({
  chatId: AgentTelegramChatIdSchema, type: AgentTelegramChatTypeSchema, name: AgentChannelAccessNameSchema,
  admittedAt: z.iso.datetime({ offset: true }),
}).strict().refine(chat => (chat.type === 'private') === !chat.chatId.startsWith('-'),
  { message: 'Private and group chat identities must retain their sign' });
export type AgentTelegramAdmittedChat = z.infer<typeof AgentTelegramAdmittedChatSchema>;

export const AgentTelegramAccessPolicySchema = z.object({
  kind: z.literal('telegram'), mode: z.enum(['approved-chats', 'anyone']),
  /** Kept when selecting anyone so returning to approved-chats does not lose the list. */
  chats: z.array(AgentTelegramAdmittedChatSchema).max(512)
    .refine(chats => new Set(chats.map(chat => chat.chatId)).size === chats.length, { message: 'Admitted chat identities must be unique' }),
}).strict();
export type AgentTelegramAccessPolicy = z.infer<typeof AgentTelegramAccessPolicySchema>;
export const AgentEmailAccessPolicySchema = z.object({
  kind: z.literal('email'), mode: z.enum(['address-book', 'anyone']),
}).strict();
export type AgentEmailAccessPolicy = z.infer<typeof AgentEmailAccessPolicySchema>;
export const AgentChannelAccessPolicySchema = z.discriminatedUnion('kind', [AgentTelegramAccessPolicySchema, AgentEmailAccessPolicySchema]);
export type AgentChannelAccessPolicy = z.infer<typeof AgentChannelAccessPolicySchema>;

/** Versions belong to the enclosing channel configuration, not the whole agent or a copied credential. */
export const AgentChannelAccessConfigurationSchema = z.object({
  desiredPolicy: AgentChannelAccessPolicySchema, appliedPolicy: AgentChannelAccessPolicySchema.nullable(),
}).strict();
export type AgentChannelAccessConfiguration = z.infer<typeof AgentChannelAccessConfigurationSchema>;

/** Absence is handled by the consumer's legacy path; this helper never turns unknown into public access. */
export function isTelegramChatAdmitted(rawPolicy: unknown, rawChatId: unknown): boolean {
  const policy = AgentChannelAccessPolicySchema.safeParse(rawPolicy), chatId = AgentTelegramChatIdSchema.safeParse(rawChatId);
  if (!policy.success || policy.data.kind !== 'telegram' || !chatId.success) return false;
  return policy.data.mode === 'anyone' || policy.data.chats.some(chat => chat.chatId === chatId.data);
}

/** Exact normalized mailbox, never a display-name, domain wildcard or fuzzy contact match. */
export const AgentChannelEmailAddressSchema = z.email().toLowerCase();
export const AgentChannelAddressBookSchema = AgentChannelAccessBindingSchema.safeExtend({
  status: z.enum(['complete', 'partial', 'unavailable']), version: AgentConfigVersionSchema.nullable(),
  observedAt: z.iso.datetime({ offset: true }).nullable(),
  emails: z.array(AgentChannelEmailAddressSchema).max(2048)
    .refine(emails => new Set(emails).size === emails.length, { message: 'Address-book emails must be unique' }).nullable(),
  /** Legacy absence/null is not a complete telephone source. Contacts remain producer-owned. */
  phones: z.array(VoiceLiveCallStartRequestSchema.shape.to_number).max(2048)
    .refine(phones => new Set(phones).size === phones.length, { message: 'Address-book phones must be unique' }).nullable().optional(),
}).superRefine((book, ctx) => {
  if (book.status === 'complete' && (book.version === null || book.observedAt === null || book.emails === null)) {
    ctx.addIssue({ code: 'custom', message: 'A complete address-book requires version, time and exact entries' });
  }
  if (book.status !== 'complete' && book.phones != null) {
    ctx.addIssue({ code: 'custom', path: ['phones'], message: 'Incomplete contact sources cannot publish telephone entries' });
  }
  if (book.status !== 'complete' && book.emails !== null) {
    ctx.addIssue({ code: 'custom', path: ['emails'], message: 'Incomplete contact sources cannot publish an admission list' });
  }
});
export type AgentChannelAddressBook = z.infer<typeof AgentChannelAddressBookSchema>;

/** Metadata contract for the future scoped Conoscenza producer; no provider or notes file is an implicit source. */
export function isEmailSenderAdmitted(rawPolicy: unknown, rawSender: unknown, rawBook: unknown,
  rawBinding: unknown, now: number, maximumAgeMs = 60_000): boolean {
  const policy = AgentChannelAccessPolicySchema.safeParse(rawPolicy), sender = AgentChannelEmailAddressSchema.safeParse(rawSender);
  const binding = AgentChannelAccessBindingSchema.safeParse(rawBinding);
  if (!policy.success || policy.data.kind !== 'email' || !sender.success || !binding.success) return false;
  if (policy.data.mode === 'anyone') return true;
  const book = AgentChannelAddressBookSchema.safeParse(rawBook);
  if (!book.success || book.data.emails === null
    || !sameAgentChannelAccessBinding({ scope: book.data.scope, identity: book.data.identity }, binding.data)) return false;
  if (!Number.isFinite(maximumAgeMs)) return false;
  const age = now - Date.parse(book.data.observedAt ?? '');
  return age >= 0 && age <= maximumAgeMs && book.data.emails.includes(sender.data);
}
