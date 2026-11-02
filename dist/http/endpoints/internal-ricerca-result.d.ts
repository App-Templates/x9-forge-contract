import { z } from 'zod';
export declare const INTERNAL_RICERCA_RESULT_PATH: "/internal/capability/ricerca/result";
/**
 * cap-lab reads the complete research result for `lab_ingest {researchId}`. cap-ricerca only returns research
 * from the same tenant and owner (`scope_foreign` otherwise), and only when `completed` (`not_ready` otherwise).
 * cap-lab checks that the author is the Ricerca of the calling Lab's organization (`caller`), using the existing
 * author rule for `lab_ingest {result}`.
 */
export declare const InternalRicercaResultRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    organizationId: z.ZodString;
    caller: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    researchId: z.ZodString;
}, z.core.$strict>;
export declare const InternalRicercaResultResponseSchema: z.ZodObject<{
    researchId: z.ZodString;
    agentId: z.ZodString;
    state: z.ZodEnum<{
        failed: "failed";
        completed: "completed";
        queued: "queued";
        running: "running";
        budget_exhausted: "budget_exhausted";
    }>;
    question: z.ZodString;
    parentResearchId: z.ZodOptional<z.ZodString>;
    findings: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        sourceUrls: z.ZodArray<z.ZodString>;
        origin: z.ZodLiteral<"web">;
    }, z.core.$strict>>;
    newQuestions: z.ZodArray<z.ZodString>;
    sources: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        opened: z.ZodBoolean;
    }, z.core.$strict>>;
    cost: z.ZodObject<{
        usd: z.ZodNumber;
        inputTokens: z.ZodNumber;
        outputTokens: z.ZodNumber;
        webCalls: z.ZodNumber;
        uncertain: z.ZodBoolean;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const InternalRicercaResultErrorSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        invalid_request: "invalid_request";
        unknown_research: "unknown_research";
        not_ready: "not_ready";
        scope_foreign: "scope_foreign";
    }>;
}, z.core.$strict>;
export declare const internalRicercaResultContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/ricerca/result";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        organizationId: z.ZodString;
        caller: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        researchId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        researchId: z.ZodString;
        agentId: z.ZodString;
        state: z.ZodEnum<{
            failed: "failed";
            completed: "completed";
            queued: "queued";
            running: "running";
            budget_exhausted: "budget_exhausted";
        }>;
        question: z.ZodString;
        parentResearchId: z.ZodOptional<z.ZodString>;
        findings: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            sourceUrls: z.ZodArray<z.ZodString>;
            origin: z.ZodLiteral<"web">;
        }, z.core.$strict>>;
        newQuestions: z.ZodArray<z.ZodString>;
        sources: z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            opened: z.ZodBoolean;
        }, z.core.$strict>>;
        cost: z.ZodObject<{
            usd: z.ZodNumber;
            inputTokens: z.ZodNumber;
            outputTokens: z.ZodNumber;
            webCalls: z.ZodNumber;
            uncertain: z.ZodBoolean;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            unknown_research: "unknown_research";
            not_ready: "not_ready";
            scope_foreign: "scope_foreign";
        }>;
    }, z.core.$strict>;
};
export type InternalRicercaResultRequest = z.infer<typeof InternalRicercaResultRequestSchema>;
export type InternalRicercaResultResponse = z.infer<typeof InternalRicercaResultResponseSchema>;
export type InternalRicercaResultError = z.infer<typeof InternalRicercaResultErrorSchema>;
//# sourceMappingURL=internal-ricerca-result.d.ts.map