"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPhoneOutboundAuthoritySchema = exports.AgentPhoneOutboundRequestSchema = void 0;
exports.isPhoneNumberInAddressBook = isPhoneNumberInAddressBook;
exports.isAgentPhoneInboundAdmitted = isAgentPhoneInboundAdmitted;
exports.isAgentPhoneOutboundAdmitted = isAgentPhoneOutboundAdmitted;
const zod_1 = require("zod");
const agent_channel_access_js_1 = require("./agent-channel-access.cjs");
const agent_management_js_1 = require("./agent-management.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const agent_phone_channel_js_1 = require("./agent-phone-channel.cjs");
const index_js_1 = require("../capability/voice-live/index.cjs");
const agent_phone_commands_js_1 = require("./agent-phone-commands.cjs");
const agent_voice_settings_js_1 = require("../capability/voice/agent-voice-settings.cjs");
/** Correlation only. Authentication and explicit request authority belong to the producer. */
exports.AgentPhoneOutboundRequestSchema = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeExtend({
    requestId: agent_management_js_1.AgentManagementRequestIdSchema, callId: index_js_1.VoiceLiveCallStartRequestSchema.shape.call_id,
    toNumber: index_js_1.VoiceLiveCallStartRequestSchema.shape.to_number, requestedAt: zod_1.z.iso.datetime({ offset: true }),
    expectedPhoneVersion: agent_config_js_1.AgentConfigVersionSchema, expectedNumberVersion: agent_config_js_1.AgentConfigVersionSchema,
    expectedRoutingIdentity: agent_phone_channel_js_1.AgentPhoneRoutingBindingSchema.shape.routingIdentity,
}).strict();
/** Must be reconstructed from the server-owned explicit request, never accepted from a browser or model. */
exports.AgentPhoneOutboundAuthoritySchema = exports.AgentPhoneOutboundRequestSchema.safeExtend({
    explicitlyRequested: zod_1.z.boolean(), observedAt: zod_1.z.iso.datetime({ offset: true }), expiresAt: zod_1.z.iso.datetime({ offset: true }),
}).strict().superRefine((authority, ctx) => {
    const duration = Date.parse(authority.expiresAt) - Date.parse(authority.observedAt);
    if (duration <= 0 || duration > 60_000)
        ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Explicit request authority lasts at most sixty seconds' }); // guard:authority-ttl
    if (Date.parse(authority.requestedAt) > Date.parse(authority.observedAt))
        ctx.addIssue({ code: 'custom', path: ['requestedAt'], message: 'Explicit request must precede authority observation' }); // guard:authority-order
});
function fresh(time, now, maximumAgeMs) {
    const age = now - Date.parse(time);
    return Number.isFinite(maximumAgeMs) && age >= 0 && age <= maximumAgeMs; // guard:fresh
}
/** Exact Conoscenza entries only. An email-only legacy source never attests telephone admission. */
function isPhoneNumberInAddressBook(rawNumber, rawBook, rawBinding, now, maximumAgeMs = 60_000) {
    const number = index_js_1.VoiceLiveCallStartRequestSchema.shape.to_number.safeParse(rawNumber);
    const book = agent_channel_access_js_1.AgentChannelAddressBookSchema.safeParse(rawBook), binding = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeParse(rawBinding);
    if (!number.success || !book.success || !binding.success)
        return false; // guard:book-parse
    if (binding.data.identity.vaultAgentId === undefined || book.data.status !== 'complete' || book.data.phones == null || book.data.observedAt === null)
        return false; // guard:book-complete
    if (!(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)({ scope: book.data.scope, identity: book.data.identity }, binding.data))
        return false; // guard:book-binding
    return fresh(book.data.observedAt, now, maximumAgeMs) && book.data.phones.includes(number.data); // guard:book-match
}
/** Read actual applied state. A pending desired edit does not replace a still active applied policy or voice. */
function activePhone(rawSnapshot, rawBinding, rawVoice, now, maximumAgeMs) {
    const snapshot = agent_phone_commands_js_1.AgentPhoneSnapshotSchema.safeParse(rawSnapshot), voice = agent_voice_settings_js_1.AgentVoiceConfigSchema.strict().safeParse(rawVoice);
    if (!snapshot.success || !voice.success || !(0, agent_phone_commands_js_1.isAgentPhoneSnapshotCurrent)(snapshot.data, rawBinding, now, maximumAgeMs))
        return null; // guard:active-parse
    const current = snapshot.data, config = current.configuration, attestation = config.attestation;
    if (current.agentArchived || current.runtimeLoadState !== 'loaded')
        return null; // guard:active-lifecycle
    if (config.applied?.state !== 'active' || config.access.appliedPolicy === null || config.routing === null || config.sharedNumber.status !== 'available')
        return null; // guard:active-application
    if (config.desired.version === config.applied.version && config.error !== null)
        return null; // guard:active-error
    if (attestation === null || attestation.error !== null || attestation.channel.state !== 'loaded' || !attestation.channel.loaded || attestation.channel.readiness !== 'ready')
        return null; // guard:active-handler
    if (!fresh(attestation.observedAt, now, maximumAgeMs) || !fresh(config.sharedNumber.observedAt, now, maximumAgeMs))
        return null; // guard:active-observation
    if (voice.data.agentId !== config.identity.managementAgentId || voice.data.applied?.mode !== 'voice' || !voice.data.applied.transports.includes('phone'))
        return null; // guard:active-voice
    return current;
}
/** Verified event only: producer verifies provider signature and resolves a unique route before this gate.
 * This pure helper is not authentication, provider support validation, or permission to perform an effect.
 * The producer reloads and rechecks all authoritative inputs after each await and before media/turn effects.
 */
function isAgentPhoneInboundAdmitted(rawEvent, rawSnapshot, rawBook, rawBinding, rawVoice, now, maximumAgeMs = 60_000) {
    const event = agent_phone_commands_js_1.AgentPhoneInboundRouteEventSchema.safeParse(rawEvent), snapshot = activePhone(rawSnapshot, rawBinding, rawVoice, now, maximumAgeMs);
    if (!event.success || snapshot === null)
        return false; // guard:inbound-parse
    const config = snapshot.configuration;
    if (event.data.fromNumber === null || !fresh(event.data.receivedAt, now, maximumAgeMs))
        return false; // guard:inbound-caller
    if (event.data.toNumber !== config.routing.number || event.data.routingIdentity !== config.routing.routingIdentity)
        return false; // guard:inbound-route
    return config.access.appliedPolicy.inbound === 'anyone'
        || isPhoneNumberInAddressBook(event.data.fromNumber, rawBook, rawBinding, now, maximumAgeMs); // guard:inbound-policy
}
/** Outbound never inherits public inbound access. It requires an exact Rubrica destination and a matching
 * server-owned explicit request, plus current applied phone/voice state. Idempotency and effects remain producer-owned.
 */
function isAgentPhoneOutboundAdmitted(rawRequest, rawSnapshot, rawBook, rawBinding, rawVoice, rawAuthority, now, maximumAgeMs = 60_000) {
    const request = exports.AgentPhoneOutboundRequestSchema.safeParse(rawRequest), authority = exports.AgentPhoneOutboundAuthoritySchema.safeParse(rawAuthority);
    const snapshot = activePhone(rawSnapshot, rawBinding, rawVoice, now, maximumAgeMs);
    if (!request.success || !authority.success || snapshot === null)
        return false; // guard:outbound-parse
    const config = snapshot.configuration;
    const { explicitlyRequested, observedAt, expiresAt, ...authorizedRequest } = authority.data;
    if (!explicitlyRequested || !fresh(observedAt, now, maximumAgeMs) || Date.parse(expiresAt) <= now)
        return false; // guard:outbound-authority
    if (!(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)({ scope: request.data.scope, identity: request.data.identity }, rawBinding)
        || JSON.stringify(request.data) !== JSON.stringify(authorizedRequest))
        return false; // guard:outbound-correlation
    if (!fresh(request.data.requestedAt, now, maximumAgeMs) || !config.access.appliedPolicy.outboundEnabled)
        return false; // guard:outbound-request
    if (request.data.expectedPhoneVersion !== config.applied.version || request.data.expectedNumberVersion !== config.sharedNumber.version
        || request.data.expectedRoutingIdentity !== config.routing.routingIdentity)
        return false; // guard:outbound-generation
    return isPhoneNumberInAddressBook(request.data.toNumber, rawBook, rawBinding, now, maximumAgeMs); // guard:outbound-book
}
//# sourceMappingURL=agent-phone-admission.js.map