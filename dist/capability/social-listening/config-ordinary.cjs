"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCIAL_LISTENING_CAPABILITY_NAME = void 0;
exports.socialListeningConfigFromOrdinary = socialListeningConfigFromOrdinary;
exports.socialListeningOrdinaryWriteIssues = socialListeningOrdinaryWriteIssues;
const ordinary_configuration_js_1 = require("../ordinary-configuration.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const config_js_1 = require("./config.cjs");
exports.SOCIAL_LISTENING_CAPABILITY_NAME = 'social-listening';
/** Read saved values, including platform defaults, without choosing anything for the owner. */
function socialListeningConfigFromOrdinary(configuration, timezone) {
    const ordinary = ordinary_configuration_js_1.CapabilityOrdinaryConfigurationSchema.safeParse(configuration);
    if (!ordinary.success)
        return { ok: false, reason: 'invalid_configuration' };
    if (ordinary.data.capability !== exports.SOCIAL_LISTENING_CAPABILITY_NAME) {
        return { ok: false, reason: 'wrong_capability' };
    }
    const zone = agent_config_js_1.AgentTimeZoneSchema.safeParse(timezone);
    if (!zone.success)
        return { ok: false, reason: 'invalid_timezone' };
    const entries = new Map(ordinary.data.parameters.map(entry => [entry.parameter.key, entry]));
    const keys = config_js_1.SOCIAL_LISTENING_PARAMETER_KEYS.filter(key => {
        const entry = entries.get(key);
        return !entry || entry.origin.kind === 'needs_choice' || entry.value === undefined;
    });
    if (keys.length > 0)
        return { ok: false, reason: 'needs_choice', keys };
    const config = config_js_1.SocialListeningAgentConfigSchema.safeParse({
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
function socialListeningOrdinaryWriteIssues(configuration) {
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