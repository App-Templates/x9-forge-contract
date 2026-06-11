import { z } from 'zod';
/**
 * LLM configuration — provider + model pair.
 * Forge configures this per-agent, X9 reads it at boot.
 */
export declare const LlmConfigSchema: z.ZodObject<{
    provider: z.ZodString;
    model: z.ZodString;
}, z.core.$strip>;
export type LlmConfig = z.infer<typeof LlmConfigSchema>;
/**
 * AgentContextCore — the cross-repo contract for context.json.
 *
 * Forge writes this shape (plus additional Runtime fields).
 * X9 reads and validates it, then extends with Runtime fields locally.
 *
 * Uses `.passthrough()` so existing context.json files with Runtime fields
 * (`workspacePath`, `registryPath`, `telegramBotToken`, `displayName`)
 * parse successfully without stripping data.
 *
 * @see AGNT-02
 */
export declare const AgentContextCoreSchema: z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    credentials: z.ZodObject<{
        OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
        ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
        GOOGLE_API_KEY: z.ZodOptional<z.ZodString>;
        AGENT_CHAT_MODEL: z.ZodOptional<z.ZodString>;
        TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
        ELEVENLABS_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_VOICE_ID: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MODEL_ID: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MINDFULNESS_AGENT_ID: z.ZodOptional<z.ZodString>;
        FORGE_VOICE_REGISTER_TOKEN: z.ZodOptional<z.ZodString>;
        AGENTMAIL_API_KEY: z.ZodOptional<z.ZodString>;
        AGENTMAIL_INBOX_ID: z.ZodOptional<z.ZodString>;
        AGENT_EMAIL: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
        X9_INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodString>>;
    llmConfig: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>;
    telegramAllowFrom: z.ZodArray<z.ZodString>;
    inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tenantId: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
export type AgentContextCore = z.infer<typeof AgentContextCoreSchema>;
//# sourceMappingURL=agent-context-core.d.ts.map