import { z } from 'zod';
export declare const AGENT_REQUEST_TARGET_KINDS: readonly ["director", "lab", "business_unit"];
export declare const AgentRequestTargetKindSchema: z.ZodEnum<{
    lab: "lab";
    director: "director";
    business_unit: "business_unit";
}>;
export type AgentRequestTargetKind = z.infer<typeof AgentRequestTargetKindSchema>;
export declare const AgentRequestIdSchema: z.ZodString;
export declare const AGENT_QUESTION_TRIED_MIN = 1;
/** The asker supplies the classification and attempts; consumers must never infer them from prose. */
export declare const AgentQuestionDetailsSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        clarification: "clarification";
        scope_decision: "scope_decision";
        technical_fault: "technical_fault";
        clearance: "clearance";
    }>;
    cause: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"question">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"refusal">;
        code: z.ZodString;
        tried: z.ZodArray<z.ZodString>;
    }, z.core.$strict>], "kind">;
}, z.core.$strict>;
export type AgentQuestionDetails = z.infer<typeof AgentQuestionDetailsSchema>;
export declare const PaperclipDirectorCreateInputSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    projectId: z.ZodOptional<z.ZodUUID>;
    goalId: z.ZodOptional<z.ZodUUID>;
    parentIssueId: z.ZodOptional<z.ZodUUID>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
    assigneeAgentId: z.ZodOptional<z.ZodGUID>;
    question: z.ZodOptional<z.ZodObject<{
        kind: z.ZodEnum<{
            clarification: "clarification";
            scope_decision: "scope_decision";
            technical_fault: "technical_fault";
            clearance: "clearance";
        }>;
        cause: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"question">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"refusal">;
            code: z.ZodString;
            tried: z.ZodArray<z.ZodString>;
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const PaperclipDirectorNativeCreateInputSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    projectId: z.ZodOptional<z.ZodUUID>;
    goalId: z.ZodOptional<z.ZodUUID>;
    parentIssueId: z.ZodOptional<z.ZodUUID>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
    assigneeAgentId: z.ZodOptional<z.ZodGUID>;
    waitForChild: z.ZodOptional<z.ZodBoolean>;
    question: z.ZodOptional<z.ZodObject<{
        kind: z.ZodEnum<{
            clarification: "clarification";
            scope_decision: "scope_decision";
            technical_fault: "technical_fault";
            clearance: "clearance";
        }>;
        cause: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"question">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"refusal">;
            code: z.ZodString;
            tried: z.ZodArray<z.ZodString>;
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type PaperclipDirectorCreateInput = z.infer<typeof PaperclipDirectorCreateInputSchema>;
export type PaperclipDirectorNativeCreateInput = z.infer<typeof PaperclipDirectorNativeCreateInputSchema>;
/** A lead asks the Director, the Lab or another unit for something only they can give. */
export declare const AgentRequestSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    requestId: z.ZodString;
    from: z.ZodObject<{
        unitId: z.ZodString;
        paperclipAgentId: z.ZodUUID;
    }, z.core.$strict>;
    to: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"director">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"lab">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"business_unit">;
        unitId: z.ZodString;
    }, z.core.$strict>], "kind">;
    need: z.ZodString;
    why: z.ZodString;
    mandate: z.ZodObject<{
        issueId: z.ZodUUID;
        identifier: z.ZodString;
    }, z.core.$strict>;
    plan: z.ZodOptional<z.ZodObject<{
        planId: z.ZodString;
        version: z.ZodInt;
    }, z.core.$strict>>;
    details: z.ZodOptional<z.ZodObject<{
        kind: z.ZodEnum<{
            clarification: "clarification";
            scope_decision: "scope_decision";
            technical_fault: "technical_fault";
            clearance: "clearance";
        }>;
        cause: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"question">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"refusal">;
            code: z.ZodString;
            tried: z.ZodArray<z.ZodString>;
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>>;
    requestedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type AgentRequest = z.infer<typeof AgentRequestSchema>;
/** The record is service-owned: model prose may not impersonate its delimiter. */
export declare function agentQuestionFreeTextProblem(text: string): string | undefined;
/** Schema parsing fixes field order so equivalent requests produce the same complete record. */
export declare function agentQuestionRecord(request: AgentRequest): string;
/** A reserved marker commits the reader to strict parsing, never fallback to a historical description. */
export declare function parseAgentQuestionRecord(text: string): AgentRequest | undefined;
//# sourceMappingURL=agent-request.d.ts.map