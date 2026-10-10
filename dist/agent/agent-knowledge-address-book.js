import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability/capability-call-context.js";
import { VoiceLiveCallStartRequestSchema } from "../capability/voice-live/index.js";
import { AgentContextIdentitySchema } from "./agent-context-identity.js";
import { AgentChannelAccessBindingSchema, AgentChannelAddressBookSchema, sameAgentChannelAccessBinding } from "./agent-channel-access.js";
const authority = AgentContextIdentitySchema.options[0].shape;
const KnowledgeBindingSchema = AgentChannelAccessBindingSchema.safeExtend({
    scope: CapabilityAgentScopeSchema.extend({ agentId: authority.agentId, ownerId: authority.ownerId, tenantId: authority.tenantId }),
    identity: authority.identity,
});
/** Canonical international number from voice-live; never normalize an ambiguous regional contact. */
export const AgentKnowledgePhoneNumberSchema = VoiceLiveCallStartRequestSchema.shape.to_number;
/** Forge Conoscenza is authoritative. An incomplete source publishes neither admission list. */
export const AgentKnowledgeAddressBookSchema = AgentChannelAddressBookSchema.safeExtend({
    scope: KnowledgeBindingSchema.shape.scope, identity: KnowledgeBindingSchema.shape.identity,
    phoneNumbers: z.array(AgentKnowledgePhoneNumberSchema).max(2048)
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
export function createAgentKnowledgeAddressBook(input) {
    return AgentKnowledgeAddressBookSchema.parse(input);
}
/** Validated C1 projection, preserving authority, completeness, version, time and exact email/telephone entries. */
export function toAgentChannelAddressBook(rawBook) {
    const book = AgentKnowledgeAddressBookSchema.parse(rawBook);
    return AgentChannelAddressBookSchema.parse({ scope: book.scope, identity: book.identity, status: book.status,
        version: book.version, observedAt: book.observedAt, emails: book.emails, phones: book.phoneNumbers });
}
/** Current complete source only. Consumers recheck remote revocations after awaits before effects. */
export function isAgentKnowledgeAddressBookCurrent(rawBook, rawBinding, now, maximumAgeMs = 60_000) {
    const book = AgentKnowledgeAddressBookSchema.safeParse(rawBook), binding = KnowledgeBindingSchema.safeParse(rawBinding);
    if (!book.success || !binding.success)
        return false;
    if (book.data.status !== 'complete' || !sameAgentChannelAccessBinding({ scope: book.data.scope, identity: book.data.identity }, binding.data))
        return false;
    if (!Number.isFinite(now) || !Number.isFinite(maximumAgeMs) || maximumAgeMs < 0)
        return false;
    const age = now - Date.parse(book.data.observedAt ?? '');
    return age >= 0 && age <= maximumAgeMs;
}
//# sourceMappingURL=agent-knowledge-address-book.js.map