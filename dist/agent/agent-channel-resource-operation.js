import { z } from 'zod';
import { AgentConfigVersionSchema } from "../capability/ricerca/agent-config.js";
import { AgentManagementRequestIdSchema } from "./agent-management.js";
import { AgentChannelAccessBindingSchema, sameAgentChannelAccessBinding } from "./agent-channel-access.js";
import { AgentBirthChannelKindSchema, AgentChannelConfigurationSchema, AgentChannelFailureSchema, AgentOwnedChannelResourceSchema, isChannelConfigurationApplied } from "./agent-channel-configuration.js";
/** Browser intent only. Resource, identity, provider endpoints and credentials are resolved by the producer. */
export const AgentChannelResourceCommandSchema = z.object({
    action: z.enum(['create-resource', 'rotate-token']), requestId: AgentManagementRequestIdSchema,
    expectedDesiredVersion: AgentConfigVersionSchema, expectedAppliedVersion: AgentConfigVersionSchema.nullable(),
}).strict().refine(command => command.expectedAppliedVersion === null || command.expectedAppliedVersion <= command.expectedDesiredVersion, { message: 'Expected applied version cannot exceed the saved desired version' });
const bindingOf = (value) => ({ scope: value.scope, identity: value.identity });
const sameResource = (left, right) => JSON.stringify(left) === JSON.stringify(right);
/** Persist the immutable resolved intent before provider effects. Null requires authoritative absence,
 * not an unavailable legacy source. Rotation never means deleting and recreating a bot.
 * The producer owns authorization, freshness, locking and durable replay; this schema installs none of them.
 */
export const AgentChannelResourceIntentSchema = AgentChannelAccessBindingSchema.safeExtend({
    kind: AgentBirthChannelKindSchema, command: AgentChannelResourceCommandSchema,
    previousResource: AgentOwnedChannelResourceSchema.nullable(),
}).superRefine((intent, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (intent.identity.vaultAgentId === undefined)
        issue('identity', 'Resource operations need an explicit own Vault identity');
    if (intent.previousResource !== null && (!sameAgentChannelAccessBinding(bindingOf(intent.previousResource), bindingOf(intent))
        || intent.previousResource.kind !== intent.kind))
        issue('previousResource', 'Previous resource must belong to this agent and door');
    if (intent.command.action === 'create-resource' && intent.previousResource !== null)
        issue('previousResource', 'Creation cannot replace an existing resource');
    if (intent.command.action === 'rotate-token' && (intent.kind !== 'telegram' || intent.previousResource === null))
        issue('command', 'Rotation needs this existing Telegram bot');
});
/** Compare with the latest server-resolved configuration before EVERY effect, including after awaits.
 * A true result checks correlation only, not ownership authorization or provider absence/freshness.
 */
export function isAgentChannelResourceIntentReady(rawIntent, rawConfiguration) {
    const intent = AgentChannelResourceIntentSchema.safeParse(rawIntent);
    const current = AgentChannelConfigurationSchema.safeParse(rawConfiguration);
    if (!intent.success || !current.success)
        return false;
    const expected = intent.data, actual = current.data;
    return sameAgentChannelAccessBinding(bindingOf(expected), bindingOf(actual)) && expected.kind === actual.kind
        && expected.command.expectedDesiredVersion === actual.desired.version
        && expected.command.expectedAppliedVersion === (actual.applied?.version ?? null)
        && sameResource(expected.previousResource, actual.resource);
}
/** Public progress is metadata only. Applied means this resource version is loaded (or deliberately paused),
 * NEVER that an owner received a real LLM reply. Ambiguous effects retain known metadata for reconciliation.
 */
export const AgentChannelResourceResultSchema = z.object({
    intent: AgentChannelResourceIntentSchema, outcome: z.enum(['pending', 'applied', 'failed', 'reconcile_pending']),
    replayed: z.boolean(), startedAt: z.iso.datetime({ offset: true }), updatedAt: z.iso.datetime({ offset: true }),
    configuration: AgentChannelConfigurationSchema, error: AgentChannelFailureSchema.nullable(),
}).strict().superRefine((result, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    const intent = result.intent, config = result.configuration;
    if (!sameAgentChannelAccessBinding(bindingOf(intent), bindingOf(config)) || intent.kind !== config.kind)
        issue('configuration', 'Result belongs to another agent or door');
    if (config.resource !== null && !sameAgentChannelAccessBinding(bindingOf(config.resource), bindingOf(intent)))
        issue('configuration', 'Resource belongs to another Vault or scope');
    if (Date.parse(result.updatedAt) < Date.parse(result.startedAt))
        issue('updatedAt', 'Progress cannot predate the operation');
    if (config.observedAt !== null && Date.parse(config.observedAt) > Date.parse(result.updatedAt))
        issue('updatedAt', 'Progress cannot predate its runtime observation');
    if (config.desired.version < intent.command.expectedDesiredVersion || config.desired.version > intent.command.expectedDesiredVersion + 1)
        issue('configuration', 'An operation cannot claim an unrelated channel version');
    if (intent.command.action === 'rotate-token' && !sameResource(config.resource, intent.previousResource))
        issue('configuration', 'Rotation preserves the same bot identity and creation metadata');
    if (result.outcome === 'failed' && !sameResource(config.resource, intent.previousResource))
        issue('outcome', 'A resource acquired before failure requires reconciliation');
    if ((result.outcome === 'failed' || result.outcome === 'reconcile_pending') !== (result.error !== null))
        issue('error', 'Error presence must match the operation outcome');
    if ((result.outcome === 'reconcile_pending') !== (result.error?.code === 'reconcile_pending'))
        issue('error', 'Ambiguous effects require an explicit reconciliation code');
    if (result.outcome === 'applied' && (config.desired.version !== intent.command.expectedDesiredVersion + 1
        || config.resource === null || !isChannelConfigurationApplied(config) || config.observedAt === null
        || Date.parse(config.observedAt) < Date.parse(result.startedAt)))
        issue('outcome', 'Applied requires the new resource version and dated runtime evidence');
});
/** A replay is valid only for the complete original intent, including its prior resource and all three identities. */
export function isAgentChannelResourceResultForIntent(rawIntent, rawResult) {
    const intent = AgentChannelResourceIntentSchema.safeParse(rawIntent);
    const result = AgentChannelResourceResultSchema.safeParse(rawResult);
    if (!intent.success || !result.success)
        return false;
    return JSON.stringify(intent.data) === JSON.stringify(result.data.intent);
}
//# sourceMappingURL=agent-channel-resource-operation.js.map