import { z } from 'zod';
export declare const InternalFactoryDeployRequestSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    ownerId: z.ZodOptional<z.ZodString>;
    selectedCapabilities: z.ZodDefault<z.ZodArray<z.ZodString>>;
    inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    objective: z.ZodOptional<z.ZodString>;
    creature: z.ZodOptional<z.ZodString>;
    vibe: z.ZodOptional<z.ZodString>;
    emoji: z.ZodOptional<z.ZodString>;
    llmProvider: z.ZodOptional<z.ZodString>;
    llmModel: z.ZodOptional<z.ZodString>;
    telegram_allow_from: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type InternalFactoryDeployRequest = z.infer<typeof InternalFactoryDeployRequestSchema>;
export declare const InternalFactoryDeployResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    slug: z.ZodString;
    agentId: z.ZodString;
    email: z.ZodNullable<z.ZodString>;
    telegramBotUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type InternalFactoryDeployResponse = z.infer<typeof InternalFactoryDeployResponseSchema>;
export declare const InternalFactoryDeployErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strip>;
export type InternalFactoryDeployErrorResponse = z.infer<typeof InternalFactoryDeployErrorResponseSchema>;
export declare const internalFactoryDeployContract: {
    readonly method: "POST";
    readonly path: "/api/internal/factory/deploy";
    readonly authType: "token";
    readonly bodySchema: z.ZodObject<{
        name: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        ownerId: z.ZodOptional<z.ZodString>;
        selectedCapabilities: z.ZodDefault<z.ZodArray<z.ZodString>>;
        inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        objective: z.ZodOptional<z.ZodString>;
        creature: z.ZodOptional<z.ZodString>;
        vibe: z.ZodOptional<z.ZodString>;
        emoji: z.ZodOptional<z.ZodString>;
        llmProvider: z.ZodOptional<z.ZodString>;
        llmModel: z.ZodOptional<z.ZodString>;
        telegram_allow_from: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        slug: z.ZodString;
        agentId: z.ZodString;
        email: z.ZodNullable<z.ZodString>;
        telegramBotUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-factory-deploy.d.ts.map