import { CapabilityOrdinaryConfigurationSchema, } from "../ordinary-configuration.js";
import { AgentTimeZoneSchema } from "../ricerca/agent-config.js";
import { SOCIAL_LISTENING_PARAMETER_KEYS, SocialListeningAgentConfigSchema, } from "./config.js";
export const SOCIAL_LISTENING_CAPABILITY_NAME = 'social-listening';
/** Read saved values, including platform defaults, without choosing anything for the owner. */
export function socialListeningConfigFromOrdinary(configuration, timezone) {
    const ordinary = CapabilityOrdinaryConfigurationSchema.safeParse(configuration);
    if (!ordinary.success)
        return { ok: false, reason: 'invalid_configuration' };
    if (ordinary.data.capability !== SOCIAL_LISTENING_CAPABILITY_NAME) {
        return { ok: false, reason: 'wrong_capability' };
    }
    const zone = AgentTimeZoneSchema.safeParse(timezone);
    if (!zone.success)
        return { ok: false, reason: 'invalid_timezone' };
    const entries = new Map(ordinary.data.parameters.map(entry => [entry.parameter.key, entry]));
    const keys = SOCIAL_LISTENING_PARAMETER_KEYS.filter(key => {
        const entry = entries.get(key);
        return !entry || entry.origin.kind === 'needs_choice' || entry.value === undefined;
    });
    if (keys.length > 0)
        return { ok: false, reason: 'needs_choice', keys };
    const config = SocialListeningAgentConfigSchema.safeParse({
        agentId: ordinary.data.scope.agentId,
        version: ordinary.data.version,
        round: {
            runsOn: entries.get('round.runsOn')?.value,
            fallbackToServer: entries.get('round.fallbackToServer')?.value,
            localTime: entries.get('round.localTime')?.value,
            fallbackTime: entries.get('round.fallbackTime')?.value,
            serverDailyCapUsd: entries.get('round.serverDailyCapUsd')?.value,
            timezone: zone.data,
        },
        research: {
            maxUsdPerResearch: entries.get('research.maxUsdPerResearch')?.value,
            dailyCapUsd: entries.get('research.dailyCapUsd')?.value,
        },
    });
    if (!config.success) {
        return {
            ok: false,
            reason: 'invalid_values',
            paths: [...new Set(config.error.issues.map(issue => issue.path.join('.')))],
        };
    }
    return { ok: true, scope: ordinary.data.scope, config: config.data };
}
/** Apply after generic ordinary-v2 write validation; incomplete pairs have no cross-field conflict. */
export function socialListeningOrdinaryWriteIssues(configuration) {
    const values = new Map(configuration.parameters
        .filter(entry => entry.origin.kind !== 'needs_choice')
        .map(entry => [entry.parameter.key, entry.value]));
    const issues = [];
    const localTime = values.get('round.localTime');
    const fallbackTime = values.get('round.fallbackTime');
    if (typeof localTime === 'string' && typeof fallbackTime === 'string' && fallbackTime <= localTime) {
        issues.push('round.fallbackTime');
    }
    const maxUsdPerResearch = values.get('research.maxUsdPerResearch');
    const dailyCapUsd = values.get('research.dailyCapUsd');
    if (typeof maxUsdPerResearch === 'number' && typeof dailyCapUsd === 'number' && maxUsdPerResearch > dailyCapUsd) {
        issues.push('research.maxUsdPerResearch');
    }
    return issues;
}
//# sourceMappingURL=config-ordinary.js.map