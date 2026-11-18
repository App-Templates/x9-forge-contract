import { z } from 'zod';
export declare const PAPERCLIP_TURNO_SEGRETO_HEADER: "X-X9-Paperclip-Turno-Segreto";
export declare const paperclipProtocolloTurnoContract: {
    readonly method: "POST";
    readonly path: "/webhook/paperclip/turno";
    readonly authType: "external_provider";
    readonly bodySchema: z.ZodObject<{
        runId: z.ZodGUID;
        agentId: z.ZodGUID;
        context: z.ZodObject<{
            taskId: z.ZodOptional<z.ZodGUID>;
            issueId: z.ZodOptional<z.ZodGUID>;
            wakeReason: z.ZodOptional<z.ZodString>;
            wakeCommentId: z.ZodOptional<z.ZodGUID>;
            commentId: z.ZodOptional<z.ZodGUID>;
            recoveryIntent: z.ZodCatch<z.ZodOptional<z.ZodEnum<{
                status_only: "status_only";
            }>>>;
            allowDeliverableWork: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
            allowDocumentUpdates: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
            resumeRequiresNormalModel: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
            source: z.ZodCatch<z.ZodOptional<z.ZodString>>;
            wakeSource: z.ZodCatch<z.ZodOptional<z.ZodEnum<{
                timer: "timer";
                assignment: "assignment";
                on_demand: "on_demand";
                automation: "automation";
            }>>>;
            wakeTriggerDetail: z.ZodCatch<z.ZodOptional<z.ZodEnum<{
                system: "system";
                callback: "callback";
                manual: "manual";
                ping: "ping";
            }>>>;
            resolvedBlockerIssueId: z.ZodCatch<z.ZodOptional<z.ZodGUID>>;
            blockerIssueIds: z.ZodCatch<z.ZodOptional<z.ZodArray<z.ZodGUID>>>;
            completedChildIssueId: z.ZodCatch<z.ZodOptional<z.ZodGUID>>;
            childIssueIds: z.ZodCatch<z.ZodOptional<z.ZodArray<z.ZodGUID>>>;
            childIssueSummaries: z.ZodCatch<z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodGUID;
                identifier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                title: z.ZodString;
                status: z.ZodEnum<{
                    cancelled: "cancelled";
                    done: "done";
                    blocked: "blocked";
                    backlog: "backlog";
                    todo: "todo";
                    in_progress: "in_progress";
                    in_review: "in_review";
                }>;
                assigneeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
                summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$loose>>>>;
            childIssueSummaryTruncated: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
            onboardingCompletion: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
            dependencyBlockedInteraction: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
            unresolvedBlockerIssueIds: z.ZodCatch<z.ZodOptional<z.ZodArray<z.ZodGUID>>>;
            unresolvedBlockerCount: z.ZodCatch<z.ZodOptional<z.ZodNumber>>;
            unresolvedBlockerSummaries: z.ZodCatch<z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodGUID;
                identifier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                title: z.ZodString;
                status: z.ZodEnum<{
                    cancelled: "cancelled";
                    done: "done";
                    blocked: "blocked";
                    backlog: "backlog";
                    todo: "todo";
                    in_progress: "in_progress";
                    in_review: "in_review";
                }>;
                assigneeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
                summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$loose>>>>;
            interactionId: z.ZodCatch<z.ZodOptional<z.ZodGUID>>;
            interactionKind: z.ZodCatch<z.ZodOptional<z.ZodString>>;
            interactionStatus: z.ZodCatch<z.ZodOptional<z.ZodString>>;
            taskWatchdog: z.ZodCatch<z.ZodOptional<z.ZodObject<{
                watchedIssueId: z.ZodGUID;
                stopFingerprint: z.ZodString;
            }, z.core.$loose>>>;
        }, z.core.$loose>;
    }, z.core.$loose>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        runId: z.ZodGUID;
    }, z.core.$strict>;
};
//# sourceMappingURL=paperclip-protocollo-turno.d.ts.map