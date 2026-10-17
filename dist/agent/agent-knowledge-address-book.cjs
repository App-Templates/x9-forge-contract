"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentKnowledgeAddressBookSchema = exports.AgentKnowledgePhoneNumberSchema = void 0;
exports.createAgentKnowledgeAddressBook = createAgentKnowledgeAddressBook;
exports.toAgentChannelAddressBook = toAgentChannelAddressBook;
exports.isAgentKnowledgeAddressBookCurrent = isAgentKnowledgeAddressBookCurrent;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability/capability-call-context.cjs");
const index_js_1 = require("../capability/voice-live/index.cjs");
const agent_context_identity_js_1 = require("./agent-context-identity.cjs");
const agent_channel_access_js_1 = require("./agent-channel-access.cjs");
const authority = agent_context_identity_js_1.AgentContextIdentitySchema.options[0].shape;
const KnowledgeBindingSchema = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeExtend({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema.extend({ agentId: authority.agentId, ownerId: authority.ownerId, tenantId: authority.tenantId }),
    identity: authority.identity,
});
/** Canonical international number from voice-live; never normalize an ambiguous regional contact. */
exports.AgentKnowledgePhoneNumberSchema = index_js_1.VoiceLiveCallStartRequestSchema.shape.to_number;
/** Forge Conoscenza is authoritative. An incomplete source publishes neither admission list. */
exports.AgentKnowledgeAddressBookSchema = agent_channel_access_js_1.AgentChannelAddressBookSchema.safeExtend({
    scope: KnowledgeBindingSchema.shape.scope, identity: KnowledgeBindingSchema.shape.identity,
    phoneNumbers: zod_1.z.array(exports.AgentKnowledgePhoneNumberSchema).max(2048)
        .refine(numbers => new Set(numbers).size === numbers.length, { message: 'Address-book phone numbers must be unique' }).nullable(),
}).superRefine((book, ctx) => {
    if (book.status === 'complete' && book.phoneNumbers === null) {
        ctx.addIssue({ code: 'custom', path: ['phoneNumbers'], message: 'A complete address-book requires exact phone entries' });
    }
    if (book.status !== 'complete' && book.phoneNumbers !== null) {
        ctx.addIssue({ code: 'custom', path: ['phoneNumbers'], message: 'Incomplete contact sources cannot publish phone admission lists' });
    }
});
/** Mandatory writer boundary; returns detached validated values without defaults. */
function createAgentKnowledgeAddressBook(input) {
    return exports.AgentKnowledgeAddressBookSchema.parse(input);
}
/** Validated C1 projection, preserving authority, completeness, version, time and exact email/telephone entries. */
function toAgentChannelAddressBook(rawBook) {
    const book = exports.AgentKnowledgeAddressBookSchema.parse(rawBook);
    return agent_channel_access_js_1.AgentChannelAddressBookSchema.parse({ scope: book.scope, identity: book.identity, status: book.status,
        version: book.version, observedAt: book.observedAt, emails: book.emails, phones: book.phoneNumbers });
}
/** Current complete source only. Consumers recheck remote revocations after awaits before effects. */
function isAgentKnowledgeAddressBookCurrent(rawBook, rawBinding, now, maximumAgeMs = 60_000) {
    const book = exports.AgentKnowledgeAddressBookSchema.safeParse(rawBook), binding = KnowledgeBindingSchema.safeParse(rawBinding);
    if (!book.success || !binding.success)
        return false;
    if (book.data.status !== 'complete' || !(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)({ scope: book.data.scope, identity: book.data.identity }, binding.data))
        return false;
    if (!Number.isFinite(now) || !Number.isFinite(maximumAgeMs) || maximumAgeMs < 0)
        return false;
    const age = now - Date.parse(book.data.observedAt ?? '');
    return age >= 0 && age <= maximumAgeMs;
}
//# sourceMappingURL=agent-knowledge-address-book.js.map