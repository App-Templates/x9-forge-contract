import { z } from 'zod';
import { AgentChannelAccessBindingSchema, AgentChannelAddressBookSchema, sameAgentChannelAccessBinding } from "./agent-channel-access.js";
import { AgentManagementRequestIdSchema } from "./agent-management.js";
import { AgentConfigVersionSchema } from "../capability/ricerca/agent-config.js";
import { AgentPhoneRoutingBindingSchema } from "./agent-phone-channel.js";
import { VoiceLiveCallStartRequestSchema } from "../capability/voice-live/index.js";
import { AgentPhoneSnapshotSchema, AgentPhoneInboundRouteEventSchema, isAgentPhoneSnapshotCurrent } from "./agent-phone-commands.js";
import { AgentVoiceConfigSchema } from "../capability/voice/agent-voice-settings.js";
/** Correlation only. Authentication and explicit request authority belong to the producer. */
export const AgentPhoneOutboundRequestSchema = AgentChannelAccessBindingSchema.safeExtend({
    requestId: AgentManagementRequestIdSchema, callId: VoiceLiveCallStartRequestSchema.shape.call_id,
    toNumber: VoiceLiveCallStartRequestSchema.shape.to_number, requestedAt: z.iso.datetime({ offset: true }),
    expectedPhoneVersion: AgentConfigVersionSchema, expectedNumberVersion: AgentConfigVersionSchema,
    expectedRoutingIdentity: AgentPhoneRoutingBindingSchema.shape.routingIdentity,
}).strict();
/** Must be reconstructed from the server-owned explicit request, never accepted from a browser or model. */
export const AgentPhoneOutboundAuthoritySchema = AgentPhoneOutboundRequestSchema.safeExtend({
    explicitlyRequested: z.boolean(), observedAt: z.iso.datetime({ offset: true }), expiresAt: z.iso.datetime({ offset: true }),
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
export function isPhoneNumberInAddressBook(rawNumber, rawBook, rawBinding, now, maximumAgeMs = 60_000) {
    const number = VoiceLiveCallStartRequestSchema.shape.to_number.safeParse(rawNumber);
    const book = AgentChannelAddressBookSchema.safeParse(rawBook), binding = AgentChannelAccessBindingSchema.safeParse(rawBinding);
    if (!number.success || !book.success || !binding.success)
        return false; // guard:book-parse
    if (binding.data.identity.vaultAgentId === undefined || book.data.status !== 'complete' || book.data.phones == null || book.data.observedAt === null)
        return false; // guard:book-complete
    if (!sameAgentChannelAccessBinding({ scope: book.data.scope, identity: book.data.identity }, binding.data))
        return false; // guard:book-binding
    return fresh(book.data.observedAt, now, maximumAgeMs) && book.data.phones.includes(number.data); // guard:book-match
}
/** Read actual applied state. A pending desired edit does not replace a still active applied policy or voice. */
function activePhone(rawSnapshot, rawBinding, rawVoice, now, maximumAgeMs) {
    const snapshot = AgentPhoneSnapshotSchema.safeParse(rawSnapshot), voice = AgentVoiceConfigSchema.strict().safeParse(rawVoice);
    if (!snapshot.success || !voice.success || !isAgentPhoneSnapshotCurrent(snapshot.data, rawBinding, now, maximumAgeMs))
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
export function isAgentPhoneInboundAdmitted(rawEvent, rawSnapshot, rawBook, rawBinding, rawVoice, now, maximumAgeMs = 60_000) {
    const event = AgentPhoneInboundRouteEventSchema.safeParse(rawEvent), snapshot = activePhone(rawSnapshot, rawBinding, rawVoice, now, maximumAgeMs);
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
export function isAgentPhoneOutboundAdmitted(rawRequest, rawSnapshot, rawBook, rawBinding, rawVoice, rawAuthority, now, maximumAgeMs = 60_000) {
    const request = AgentPhoneOutboundRequestSchema.safeParse(rawRequest), authority = AgentPhoneOutboundAuthoritySchema.safeParse(rawAuthority);
    const snapshot = activePhone(rawSnapshot, rawBinding, rawVoice, now, maximumAgeMs);
    if (!request.success || !authority.success || snapshot === null)
        return false; // guard:outbound-parse
    const config = snapshot.configuration;
    const { explicitlyRequested, observedAt, expiresAt, ...authorizedRequest } = authority.data;
    if (!explicitlyRequested || !fresh(observedAt, now, maximumAgeMs) || Date.parse(expiresAt) <= now)
        return false; // guard:outbound-authority
    if (!sameAgentChannelAccessBinding({ scope: request.data.scope, identity: request.data.identity }, rawBinding)
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