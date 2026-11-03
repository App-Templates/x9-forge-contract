import { z } from 'zod';
import { VoiceLiveCallStartRequestSchema } from "../capability/voice-live/index.js";
import { AgentConfigVersionSchema } from "../capability/ricerca/agent-config.js";
import { AgentIdSchema } from "./agent-identity.js";
import { AgentChannelAccessBindingSchema, sameAgentChannelAccessBinding } from "./agent-channel-access.js";
import { AgentChannelVersionedStateSchema, AgentChannelFailureSchema, AgentContextWithChannelsSchema, AgentContextWithChannelsWriteSchema } from "./agent-channel-configuration.js";
import { AgentChannelAttestationSchema } from "./agent-channel-attestation.js";
/** One producer-owned shared line; availability does not attest any agent's handler. */
export const AgentPhoneSharedNumberSchema = z.object({
    status: z.enum(['unknown', 'unavailable', 'available']),
    number: VoiceLiveCallStartRequestSchema.shape.to_number.nullable(),
    resourceId: z.string().min(1).max(128).nullable(),
    version: AgentConfigVersionSchema.nullable(), observedAt: z.iso.datetime({ offset: true }).nullable(),
}).strict().superRefine((number, ctx) => {
    const complete = number.number !== null && number.resourceId !== null && number.version !== null && number.observedAt !== null;
    const empty = number.number === null && number.resourceId === null && number.version === null && number.observedAt === null;
    if (number.status === 'available' ? !complete : !empty)
        ctx.addIssue({ code: 'custom', message: 'Only an available shared line publishes complete dated metadata' }); // guard:number-evidence
});
/** Selector is producer-resolved routing metadata, never a browser-supplied authorization. */
export const AgentPhoneRoutingBindingSchema = AgentChannelAccessBindingSchema.safeExtend({
    number: VoiceLiveCallStartRequestSchema.shape.to_number,
    resourceId: z.string().min(1).max(128), routingIdentity: AgentIdSchema,
}).strict();
/** Contacts remain in the canonical Conoscenza source. No inline list or permissive default. */
export const AgentPhoneAccessPolicySchema = z.object({
    kind: z.literal('phone'), inbound: z.enum(['address-book', 'anyone']), outboundEnabled: z.boolean(),
}).strict();
const AccessSchema = z.object({ desiredPolicy: AgentPhoneAccessPolicySchema, appliedPolicy: AgentPhoneAccessPolicySchema.nullable() }).strict();
function samePhoneBinding(a, b) {
    return sameAgentChannelAccessBinding({ scope: a.scope, identity: a.identity }, b);
}
/** Logical phone door maps to canonical VOICE runtime evidence; birth Telegram/email remain unchanged. */
export const AgentPhoneChannelConfigurationSchema = AgentChannelAccessBindingSchema.safeExtend({
    kind: z.literal('phone'), desired: AgentChannelVersionedStateSchema, applied: AgentChannelVersionedStateSchema.nullable(),
    access: AccessSchema, sharedNumber: AgentPhoneSharedNumberSchema, routing: AgentPhoneRoutingBindingSchema.nullable(),
    attestation: AgentChannelAttestationSchema.nullable(), error: AgentChannelFailureSchema.nullable(),
}).strict().superRefine((config, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (config.identity.vaultAgentId === undefined)
        issue('identity', 'Phone requires an explicit Vault identity'); // guard:vault-identity
    if (config.routing && !samePhoneBinding(config, { scope: config.routing.scope, identity: config.routing.identity }))
        issue('routing', 'Routing belongs to another scope or identity'); // guard:routing-owner
    if (config.routing && config.sharedNumber.status === 'available' && (config.routing.number !== config.sharedNumber.number || config.routing.resourceId !== config.sharedNumber.resourceId))
        issue('routing', 'Routing belongs to another shared line'); // guard:routing-line
    if (config.applied && config.applied.version > config.desired.version)
        issue('applied', 'Applied version cannot exceed desired'); // guard:version-order
    if (config.applied?.version === config.desired.version && config.applied.state !== config.desired.state)
        issue('applied', 'One version cannot describe two states'); // guard:version-state
    if (config.applied?.state === 'active' && config.routing === null)
        issue('routing', 'Active application requires scoped routing'); // guard:active-route
    if (config.applied === null && config.access.appliedPolicy !== null)
        issue('access', 'Applied policy requires an applied version'); // guard:policy-applied
    if (config.applied?.version === config.desired.version && config.access.appliedPolicy !== null && JSON.stringify(config.access.desiredPolicy) !== JSON.stringify(config.access.appliedPolicy))
        issue('access', 'One version cannot describe two policies'); // guard:policy-version
    if (config.attestation && !samePhoneBinding(config, { scope: config.attestation.scope, identity: config.attestation.identity }))
        issue('attestation', 'Runtime evidence belongs to another scope or identity'); // guard:evidence-owner
    if (config.attestation && config.attestation.channel.kind !== 'voice')
        issue('attestation', 'Phone requires VOICE runtime evidence'); // guard:evidence-kind
    if (config.attestation && (config.applied === null || config.attestation.applied?.version !== config.applied.version || config.attestation.applied.state !== config.applied.state))
        issue('attestation', 'Runtime evidence must attest the same applied version and state'); // guard:evidence-version
});
function checkPhoneContext(context, ctx) {
    const phone = context.phoneConfiguration;
    if (phone === undefined)
        return;
    const issue = (message) => ctx.addIssue({ code: 'custom', path: ['phoneConfiguration'], message });
    if (!context.identity || !samePhoneBinding(phone, { scope: { agentId: context.agentId, ownerId: context.ownerId, tenantId: context.tenantId }, identity: context.identity }))
        issue('Phone requires the authoritative context scope and root identity'); // guard:context-owner
    if ((context.channelConfigurations ?? []).some(channel => !samePhoneBinding(phone, { scope: channel.scope, identity: channel.identity })))
        issue('Phone and birth channel identities must agree'); // guard:context-birth
}
export const AgentContextWithPhoneSchema = AgentContextWithChannelsSchema.safeExtend({ phoneConfiguration: AgentPhoneChannelConfigurationSchema.optional() }).superRefine(checkPhoneContext);
export const AgentContextWithPhoneWriteSchema = AgentContextWithChannelsWriteSchema.safeExtend({ phoneConfiguration: AgentPhoneChannelConfigurationSchema.optional() }).superRefine(checkPhoneContext);
/** Convergence only, not call admission: voice, authorized contacts and requested action have further gates. */
export function isPhoneChannelConfigurationApplied(raw, now, maximumAgeMs = 60_000) {
    const parsed = AgentPhoneChannelConfigurationSchema.safeParse(raw);
    if (!parsed.success)
        return false;
    const config = parsed.data;
    if (!Number.isFinite(now) || !Number.isFinite(maximumAgeMs) || maximumAgeMs < 0)
        return false; // guard:clock
    if (config.error !== null)
        return false; // guard:config-error
    if (config.applied?.version !== config.desired.version)
        return false; // guard:current-version
    if (config.access.appliedPolicy === null)
        return false; // guard:current-policy
    if (config.attestation === null)
        return false;
    if (config.attestation.error !== null)
        return false; // guard:runtime-error
    if (config.attestation.channel.state !== (config.desired.state === 'active' ? 'loaded' : 'paused'))
        return false; // guard:runtime-state
    const runtimeAge = now - Date.parse(config.attestation.observedAt);
    if (runtimeAge < 0 || runtimeAge > maximumAgeMs)
        return false; // guard:runtime-age
    if (config.desired.state === 'paused')
        return true;
    if (config.attestation.channel.readiness !== 'ready')
        return false; // guard:runtime-readiness
    if (config.sharedNumber.status !== 'available')
        return false; // guard:line-available
    const numberAge = now - Date.parse(config.sharedNumber.observedAt ?? '');
    if (numberAge < 0 || numberAge > maximumAgeMs)
        return false; // guard:line-age
    return true;
}
//# sourceMappingURL=agent-phone-channel.js.map