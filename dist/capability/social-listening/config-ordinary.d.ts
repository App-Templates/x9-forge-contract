import type { CapabilityAgentScope } from "../capability-call-context.js";
import { type CapabilityOrdinaryConfiguration } from "../ordinary-configuration.js";
import { type SocialListeningAgentConfig } from "./config.js";
export declare const SOCIAL_LISTENING_CAPABILITY_NAME: "social-listening";
/** Read saved values, including platform defaults, without choosing anything for the owner. */
export declare function socialListeningConfigFromOrdinary(configuration: unknown, timezone: unknown): {
    ok: true;
    scope: CapabilityAgentScope;
    config: SocialListeningAgentConfig;
} | {
    ok: false;
    reason: 'invalid_configuration' | 'wrong_capability' | 'invalid_timezone';
} | {
    ok: false;
    reason: 'needs_choice';
    keys: string[];
} | {
    ok: false;
    reason: 'invalid_values';
    paths: string[];
};
/** Apply after generic ordinary-v2 write validation; incomplete pairs have no cross-field conflict. */
export declare function socialListeningOrdinaryWriteIssues(configuration: CapabilityOrdinaryConfiguration): string[];
//# sourceMappingURL=config-ordinary.d.ts.map