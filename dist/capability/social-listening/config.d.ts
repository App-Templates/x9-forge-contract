import { z } from 'zod';
import type { CapabilityParametersDeclaration } from "../parameters.js";
/** Local time of day, HH:MM, 24 hours. */
export declare const SocialClockTimeSchema: z.ZodString;
export type SocialClockTime = z.infer<typeof SocialClockTimeSchema>;
/**
 * Social listening configuration for ONE agent, written with the existing per-agent config PUT (B1 adds no route).
 * No default here: where the round runs and the hand-over to the server are the owner's choices (D9).
 */
export declare const SocialListeningAgentConfigSchema: z.ZodObject<{
    agentId: z.ZodString;
    version: z.ZodNumber;
    round: z.ZodObject<{
        runsOn: z.ZodEnum<{
            server: "server";
            mac: "mac";
        }>;
        localTime: z.ZodString;
        timezone: z.ZodString;
        fallbackToServer: z.ZodBoolean;
        fallbackTime: z.ZodString;
        serverDailyCapUsd: z.ZodNumber;
    }, z.core.$strict>;
    research: z.ZodObject<{
        maxUsdPerResearch: z.ZodNumber;
        dailyCapUsd: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export type SocialListeningAgentConfig = z.infer<typeof SocialListeningAgentConfigSchema>;
/** Dotted paths of the configuration (B1 keys). */
export declare const SOCIAL_LISTENING_PARAMETER_KEYS: readonly ["round.runsOn", "round.fallbackToServer", "round.localTime", "round.fallbackTime", "round.serverDailyCapUsd", "research.maxUsdPerResearch", "research.dailyCapUsd"];
export declare const SOCIAL_LISTENING_PARAMETERS: CapabilityParametersDeclaration;
//# sourceMappingURL=config.d.ts.map