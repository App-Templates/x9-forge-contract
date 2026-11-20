"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailRecipientFactsSchema = exports.EMAIL_REFUSAL_CHANNELS = exports.EMAIL_RECIPIENT_REFUSALS = exports.EMAIL_RECIPIENT_ROLE_BASES = exports.EMAIL_RECIPIENT_BASES = void 0;
exports.decideEmailRecipient = decideEmailRecipient;
const zod_1 = require("zod");
const agent_role_js_1 = require("./agent-role.cjs");
const company_map_js_1 = require("./company-map.cjs");
/**
 * The caller scopes referents and the brief opener to the correct tenant, client and
 * project, and keeps responsibility for those checks. The brief opener comes from
 * the actual incoming email sender, never from a model or a document.
 * This policy trusts the supplied scope and only decides recipient admission.
 */
exports.EMAIL_RECIPIENT_BASES = [
    'certified_referent', 'brief_opener', 'thread_referent_sender', 'owner',
];
exports.EMAIL_RECIPIENT_ROLE_BASES = {
    [agent_role_js_1.DIRECTOR_ROLE]: exports.EMAIL_RECIPIENT_BASES,
    [agent_role_js_1.BUSINESS_UNIT_LEAD_ROLE]: ['certified_referent', 'brief_opener', 'thread_referent_sender'],
    [agent_role_js_1.LAB_ROLE]: ['thread_referent_sender'],
    [agent_role_js_1.RICERCA_ROLE]: ['thread_referent_sender'],
};
exports.EMAIL_RECIPIENT_REFUSALS = [
    'recipient_is_company_agent', 'recipient_not_certified', 'role_not_admitted', 'recipient_check_unavailable',
];
exports.EMAIL_REFUSAL_CHANNELS = {
    recipient_is_company_agent: ['addressed_question', 'assigned_issue', 'child_issue_with_blockers'],
    recipient_not_certified: [],
    role_not_admitted: [],
    recipient_check_unavailable: [],
};
const AddressSchema = zod_1.z.string().transform((value) => {
    const trimmed = value.trim();
    const named = /^[^<>]*<([^<>]+)>$/.exec(trimmed);
    return (0, company_map_js_1.referentAddressKey)(named?.[1] ?? trimmed);
}).pipe(zod_1.z.email());
exports.EmailRecipientFactsSchema = zod_1.z.strictObject({
    role: agent_role_js_1.AgentRoleSchema,
    recipient: AddressSchema,
    referents: zod_1.z.array(company_map_js_1.CompanyMapEntrySchema),
    ownerAddresses: zod_1.z.array(AddressSchema),
    companyAgentAddresses: zod_1.z.array(AddressSchema),
    briefOpener: zod_1.z.strictObject({ address: AddressSchema }).optional(),
    threadSender: zod_1.z.strictObject({
        address: AddressSchema,
        isCertifiedReferent: zod_1.z.boolean(),
    }).optional(),
});
/** Pure admission rule; refusals contain only closed codes and communication channels. */
function decideEmailRecipient(facts) {
    const parsed = exports.EmailRecipientFactsSchema.safeParse(facts);
    if (!parsed.success) {
        return { ok: false, refusal: 'recipient_check_unavailable', channels: exports.EMAIL_REFUSAL_CHANNELS.recipient_check_unavailable };
    }
    const { role, recipient, referents, ownerAddresses, companyAgentAddresses, briefOpener, threadSender } = parsed.data;
    const bases = exports.EMAIL_RECIPIENT_ROLE_BASES[role];
    if (bases.length === 0) {
        return { ok: false, refusal: 'role_not_admitted', channels: exports.EMAIL_REFUSAL_CHANNELS.role_not_admitted };
    }
    if (bases.includes('owner') && ownerAddresses.includes(recipient)) {
        return { ok: true, basis: 'owner' };
    }
    if (bases.includes('certified_referent') && referents.some((entry) => (0, company_map_js_1.referentAddressKey)(entry.email) === recipient)) {
        return { ok: true, basis: 'certified_referent' };
    }
    if (bases.includes('brief_opener') && briefOpener?.address === recipient) {
        return { ok: true, basis: 'brief_opener' };
    }
    if (bases.includes('thread_referent_sender') && threadSender?.isCertifiedReferent && threadSender.address === recipient) {
        return { ok: true, basis: 'thread_referent_sender' };
    }
    if (companyAgentAddresses.includes(recipient)) {
        return { ok: false, refusal: 'recipient_is_company_agent', channels: exports.EMAIL_REFUSAL_CHANNELS.recipient_is_company_agent };
    }
    return { ok: false, refusal: 'recipient_not_certified', channels: exports.EMAIL_REFUSAL_CHANNELS.recipient_not_certified };
}
//# sourceMappingURL=email-recipient-policy.js.map