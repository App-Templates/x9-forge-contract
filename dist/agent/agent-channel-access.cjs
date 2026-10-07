"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentChannelAddressBookSchema = exports.AgentChannelEmailAddressSchema = exports.AgentChannelAccessConfigurationSchema = exports.AgentChannelAccessPolicySchema = exports.AgentEmailAccessPolicySchema = exports.AgentTelegramAccessPolicySchema = exports.AgentTelegramAdmittedChatSchema = exports.AgentChannelAccessNameSchema = exports.AgentTelegramChatTypeSchema = exports.AgentTelegramChatIdSchema = exports.AgentChannelAccessBindingSchema = void 0;
exports.sameAgentChannelAccessBinding = sameAgentChannelAccessBinding;
exports.isTelegramChatAdmitted = isTelegramChatAdmitted;
exports.isEmailSenderAdmitted = isEmailSenderAdmitted;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability/capability-call-context.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const agent_runtime_identity_js_1 = require("./agent-runtime-identity.cjs");
/** Explicit ownership for access control; names and credentials never confer authorization. */
exports.AgentChannelAccessBindingSchema = zod_1.z.object({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema.strict(), identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict(),
}).strict().refine(binding => binding.identity.runtimeAgentId === binding.scope.agentId, { message: 'Channel access identity must match runtime scope' });
function sameAgentChannelAccessBinding(left, right) {
    const a = exports.AgentChannelAccessBindingSchema.safeParse(left), b = exports.AgentChannelAccessBindingSchema.safeParse(right);
    return a.success && b.success && (0, capability_call_context_js_1.sameCapabilityScope)(a.data.scope, b.data.scope)
        && a.data.identity.managementAgentId === b.data.identity.managementAgentId
        && a.data.identity.vaultAgentId === b.data.identity.vaultAgentId;
}
/** Telegram uses at most 52 significant bits; canonical decimal strings preserve group signs. */
exports.AgentTelegramChatIdSchema = zod_1.z.string().regex(/^-?[1-9]\d{0,15}$/)
    .refine(value => Number.isSafeInteger(Number(value)), { message: 'Chat id must be a safe canonical integer' });
exports.AgentTelegramChatTypeSchema = zod_1.z.enum(['private', 'group', 'supergroup']);
exports.AgentChannelAccessNameSchema = zod_1.z.string().min(1).max(160).regex(/^[^\u0000-\u001f\u007f]*$/);
exports.AgentTelegramAdmittedChatSchema = zod_1.z.object({
    chatId: exports.AgentTelegramChatIdSchema, type: exports.AgentTelegramChatTypeSchema, name: exports.AgentChannelAccessNameSchema,
    admittedAt: zod_1.z.iso.datetime({ offset: true }),
}).strict().refine(chat => (chat.type === 'private') === !chat.chatId.startsWith('-'), { message: 'Private and group chat identities must retain their sign' });
exports.AgentTelegramAccessPolicySchema = zod_1.z.object({
    kind: zod_1.z.literal('telegram'), mode: zod_1.z.enum(['approved-chats', 'anyone']),
    /** Kept when selecting anyone so returning to approved-chats does not lose the list. */
    chats: zod_1.z.array(exports.AgentTelegramAdmittedChatSchema).max(512)
        .refine(chats => new Set(chats.map(chat => chat.chatId)).size === chats.length, { message: 'Admitted chat identities must be unique' }),
}).strict();
exports.AgentEmailAccessPolicySchema = zod_1.z.object({
    kind: zod_1.z.literal('email'), mode: zod_1.z.enum(['address-book', 'anyone']),
}).strict();
exports.AgentChannelAccessPolicySchema = zod_1.z.discriminatedUnion('kind', [exports.AgentTelegramAccessPolicySchema, exports.AgentEmailAccessPolicySchema]);
/** Versions belong to the enclosing channel configuration, not the whole agent or a copied credential. */
exports.AgentChannelAccessConfigurationSchema = zod_1.z.object({
    desiredPolicy: exports.AgentChannelAccessPolicySchema, appliedPolicy: exports.AgentChannelAccessPolicySchema.nullable(),
}).strict();
/** Absence is handled by the consumer's legacy path; this helper never turns unknown into public access. */
function isTelegramChatAdmitted(rawPolicy, rawChatId) {
    const policy = exports.AgentChannelAccessPolicySchema.safeParse(rawPolicy), chatId = exports.AgentTelegramChatIdSchema.safeParse(rawChatId);
    if (!policy.success || policy.data.kind !== 'telegram' || !chatId.success)
        return false;
    return policy.data.mode === 'anyone' || policy.data.chats.some(chat => chat.chatId === chatId.data);
}
/** Exact normalized mailbox, never a display-name, domain wildcard or fuzzy contact match. */
exports.AgentChannelEmailAddressSchema = zod_1.z.email().toLowerCase();
exports.AgentChannelAddressBookSchema = exports.AgentChannelAccessBindingSchema.safeExtend({
    status: zod_1.z.enum(['complete', 'partial', 'unavailable']), version: agent_config_js_1.AgentConfigVersionSchema.nullable(),
    observedAt: zod_1.z.iso.datetime({ offset: true }).nullable(),
    emails: zod_1.z.array(exports.AgentChannelEmailAddressSchema).max(2048)
        .refine(emails => new Set(emails).size === emails.length, { message: 'Address-book emails must be unique' }).nullable(),
}).superRefine((book, ctx) => {
    if (book.status === 'complete' && (book.version === null || book.observedAt === null || book.emails === null)) {
        ctx.addIssue({ code: 'custom', message: 'A complete address-book requires version, time and exact entries' });
    }
    if (book.status !== 'complete' && book.emails !== null) {
        ctx.addIssue({ code: 'custom', path: ['emails'], message: 'Incomplete contact sources cannot publish an admission list' });
    }
});
/** Metadata contract for the future scoped Conoscenza producer; no provider or notes file is an implicit source. */
function isEmailSenderAdmitted(rawPolicy, rawSender, rawBook, rawBinding, now, maximumAgeMs = 60_000) {
    const policy = exports.AgentChannelAccessPolicySchema.safeParse(rawPolicy), sender = exports.AgentChannelEmailAddressSchema.safeParse(rawSender);
    const binding = exports.AgentChannelAccessBindingSchema.safeParse(rawBinding);
    if (!policy.success || policy.data.kind !== 'email' || !sender.success || !binding.success)
        return false;
    if (policy.data.mode === 'anyone')
        return true;
    const book = exports.AgentChannelAddressBookSchema.safeParse(rawBook);
    if (!book.success || book.data.emails === null
        || !sameAgentChannelAccessBinding({ scope: book.data.scope, identity: book.data.identity }, binding.data))
        return false;
    if (!Number.isFinite(maximumAgeMs))
        return false;
    const age = now - Date.parse(book.data.observedAt ?? '');
    return age >= 0 && age <= maximumAgeMs && book.data.emails.includes(sender.data);
}
//# sourceMappingURL=agent-channel-access.js.map