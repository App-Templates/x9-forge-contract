import { z } from 'zod';
export declare const InternalAgentTurnJobStatusSchema: z.ZodEnum<{
    failed: "failed";
    uncertain: "uncertain";
    completed: "completed";
    queued: "queued";
    running: "running";
}>;
export type InternalAgentTurnJobStatus = z.infer<typeof InternalAgentTurnJobStatusSchema>;
export declare const InternalAgentTurnJobParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
    jobId: z.ZodString;
}, z.core.$strip>;
export type InternalAgentTurnJobParams = z.infer<typeof InternalAgentTurnJobParamsSchema>;
export declare const InternalAgentTurnJobSubmitRequestSchema: z.ZodObject<{
    channelId: z.ZodString;
    sessionId: z.ZodString;
    message: z.ZodString;
    history: z.ZodOptional<z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<{
            system: "system";
            user: "user";
            assistant: "assistant";
            tool: "tool";
        }>;
        content: z.ZodString;
        toolCallId: z.ZodOptional<z.ZodString>;
        toolName: z.ZodOptional<z.ZodString>;
        toolCalls: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
    attachment: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<{
            document: "document";
            photo: "photo";
            video: "video";
        }>;
        fileUrl: z.ZodString;
        mimeType: z.ZodOptional<z.ZodString>;
        filename: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    turn: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"opening">;
        turnId: z.ZodString;
        text: z.ZodLiteral<"">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"answer">;
        turnId: z.ZodString;
        text: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"incomplete">;
        turnId: z.ZodString;
        text: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"delivery">;
        turnId: z.ZodString;
        text: z.ZodLiteral<"">;
        moveId: z.ZodString;
        spokenText: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"prepare">;
        turnId: z.ZodString;
        text: z.ZodLiteral<"">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"exchange">;
        turnId: z.ZodString;
        text: z.ZodString;
        spokenText: z.ZodString;
        ended: z.ZodBoolean;
    }, z.core.$strict>], "kind">>;
    identity: z.ZodOptional<z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    userId: z.ZodOptional<z.ZodString>;
    organizationRun: z.ZodOptional<z.ZodObject<{
        context: z.ZodObject<{
            schemaVersion: z.ZodLiteral<1>;
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            organizationId: z.ZodString;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            personRef: z.ZodOptional<z.ZodString>;
            issuer: z.ZodEnum<{
                x9: "x9";
                forge: "forge";
                paperclip: "paperclip";
            }>;
            issuedAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strict>;
        attempt: z.ZodObject<{
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            attemptId: z.ZodString;
            attemptNumber: z.ZodNumber;
            startedAt: z.ZodISODateTime;
            idempotencyKey: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    idempotencyKey: z.ZodString;
    origin: z.ZodOptional<z.ZodObject<{
        channel: z.ZodLiteral<"email">;
        messageId: z.ZodString;
        inboxId: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type InternalAgentTurnJobSubmitRequest = z.infer<typeof InternalAgentTurnJobSubmitRequestSchema>;
/** HTTP 202, including a replay of an already persisted job. */
export declare const InternalAgentTurnJobSubmitResponseSchema: z.ZodObject<{
    jobId: z.ZodString;
    status: z.ZodEnum<{
        failed: "failed";
        uncertain: "uncertain";
        completed: "completed";
        queued: "queued";
        running: "running";
    }>;
    replayed: z.ZodBoolean;
}, z.core.$strip>;
export type InternalAgentTurnJobSubmitResponse = z.infer<typeof InternalAgentTurnJobSubmitResponseSchema>;
export declare const INTERNAL_AGENT_TURN_JOB_CONFLICT: "INTERNAL_AGENT_TURN_JOB_CONFLICT";
/** HTTP 409 when the same scoped idempotency key carries different content. */
export declare const InternalAgentTurnJobConflictResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    message: z.ZodString;
    details: z.ZodOptional<z.ZodUnknown>;
    code: z.ZodLiteral<"INTERNAL_AGENT_TURN_JOB_CONFLICT">;
}, z.core.$strip>;
export type InternalAgentTurnJobConflictResponse = z.infer<typeof InternalAgentTurnJobConflictResponseSchema>;
export declare const InternalAgentTurnJobReadResponseSchema: z.ZodObject<{
    jobId: z.ZodString;
    status: z.ZodEnum<{
        failed: "failed";
        uncertain: "uncertain";
        completed: "completed";
        queued: "queued";
        running: "running";
    }>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
    }, z.core.$strip>>;
    result: z.ZodOptional<z.ZodObject<{
        ok: z.ZodLiteral<true>;
        reply: z.ZodString;
        updatedHistory: z.ZodArray<z.ZodObject<{
            role: z.ZodEnum<{
                system: "system";
                user: "user";
                assistant: "assistant";
                tool: "tool";
            }>;
            content: z.ZodString;
            toolCallId: z.ZodOptional<z.ZodString>;
            toolName: z.ZodOptional<z.ZodString>;
            toolCalls: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        moveId: z.ZodOptional<z.ZodString>;
        lead: z.ZodOptional<z.ZodString>;
        note: z.ZodOptional<z.ZodString>;
        connectionCards: z.ZodOptional<z.ZodArray<z.ZodObject<{
            cardId: z.ZodString;
            provider: z.ZodEnum<{
                google: "google";
            }>;
            permissions: z.ZodArray<z.ZodEnum<{
                calendar_events: "calendar_events";
                contacts_read: "contacts_read";
                mail_send: "mail_send";
                mail_draft: "mail_draft";
                mail_read: "mail_read";
                drive_read: "drive_read";
            }>>;
            url: z.ZodString;
            expiresAt: z.ZodNumber;
            state: z.ZodEnum<{
                connected: "connected";
                revoked: "revoked";
                pending: "pending";
                denied: "denied";
                expired: "expired";
            }>;
            reason: z.ZodString;
        }, z.core.$strict>>>;
        outcome: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            status: z.ZodLiteral<"succeeded">;
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            attemptId: z.ZodString;
            evidence: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    log: "log";
                    artifact: "artifact";
                    commit: "commit";
                    document: "document";
                    metric: "metric";
                }>;
                ref: z.ZodString;
                sha256: z.ZodOptional<z.ZodString>;
                grantsRead: z.ZodLiteral<false>;
            }, z.core.$strict>>;
            consumption: z.ZodArray<z.ZodObject<{
                unit: z.ZodEnum<{
                    usd_micros: "usd_micros";
                    tokens: "tokens";
                    seconds: "seconds";
                }>;
                quantity: z.ZodNumber;
                state: z.ZodEnum<{
                    unknown: "unknown";
                    reserved: "reserved";
                    settled: "settled";
                }>;
                estimated: z.ZodBoolean;
            }, z.core.$strict>>;
            recordedAt: z.ZodISODateTime;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"failed">;
            failureCode: z.ZodString;
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            attemptId: z.ZodString;
            evidence: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    log: "log";
                    artifact: "artifact";
                    commit: "commit";
                    document: "document";
                    metric: "metric";
                }>;
                ref: z.ZodString;
                sha256: z.ZodOptional<z.ZodString>;
                grantsRead: z.ZodLiteral<false>;
            }, z.core.$strict>>;
            consumption: z.ZodArray<z.ZodObject<{
                unit: z.ZodEnum<{
                    usd_micros: "usd_micros";
                    tokens: "tokens";
                    seconds: "seconds";
                }>;
                quantity: z.ZodNumber;
                state: z.ZodEnum<{
                    unknown: "unknown";
                    reserved: "reserved";
                    settled: "settled";
                }>;
                estimated: z.ZodBoolean;
            }, z.core.$strict>>;
            recordedAt: z.ZodISODateTime;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"cancelled">;
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            attemptId: z.ZodString;
            evidence: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    log: "log";
                    artifact: "artifact";
                    commit: "commit";
                    document: "document";
                    metric: "metric";
                }>;
                ref: z.ZodString;
                sha256: z.ZodOptional<z.ZodString>;
                grantsRead: z.ZodLiteral<false>;
            }, z.core.$strict>>;
            consumption: z.ZodArray<z.ZodObject<{
                unit: z.ZodEnum<{
                    usd_micros: "usd_micros";
                    tokens: "tokens";
                    seconds: "seconds";
                }>;
                quantity: z.ZodNumber;
                state: z.ZodEnum<{
                    unknown: "unknown";
                    reserved: "reserved";
                    settled: "settled";
                }>;
                estimated: z.ZodBoolean;
            }, z.core.$strict>>;
            recordedAt: z.ZodISODateTime;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"uncertain">;
            reason: z.ZodEnum<{
                response_lost: "response_lost";
                timeout: "timeout";
                provider_unknown: "provider_unknown";
                worker_crashed: "worker_crashed";
            }>;
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            attemptId: z.ZodString;
            evidence: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    log: "log";
                    artifact: "artifact";
                    commit: "commit";
                    document: "document";
                    metric: "metric";
                }>;
                ref: z.ZodString;
                sha256: z.ZodOptional<z.ZodString>;
                grantsRead: z.ZodLiteral<false>;
            }, z.core.$strict>>;
            consumption: z.ZodArray<z.ZodObject<{
                unit: z.ZodEnum<{
                    usd_micros: "usd_micros";
                    tokens: "tokens";
                    seconds: "seconds";
                }>;
                quantity: z.ZodNumber;
                state: z.ZodEnum<{
                    unknown: "unknown";
                    reserved: "reserved";
                    settled: "settled";
                }>;
                estimated: z.ZodBoolean;
            }, z.core.$strict>>;
            recordedAt: z.ZodISODateTime;
        }, z.core.$strict>], "status">>;
        duplicate: z.ZodOptional<z.ZodLiteral<true>>;
    }, z.core.$strip>>;
    resultDigest: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type InternalAgentTurnJobReadResponse = z.infer<typeof InternalAgentTurnJobReadResponseSchema>;
/** Opaque digest supplied by the read response, echoed without transformation. */
export declare const InternalAgentTurnJobResultAckRequestSchema: z.ZodObject<{
    resultDigest: z.ZodString;
}, z.core.$strip>;
export type InternalAgentTurnJobResultAckRequest = z.infer<typeof InternalAgentTurnJobResultAckRequestSchema>;
export declare const InternalAgentTurnJobResultAckResponseSchema: z.ZodObject<{
    jobId: z.ZodString;
    acknowledged: z.ZodLiteral<true>;
}, z.core.$strip>;
export type InternalAgentTurnJobResultAckResponse = z.infer<typeof InternalAgentTurnJobResultAckResponseSchema>;
export declare function internalAgentTurnJobsPath(agentId: string): string;
export declare function internalAgentTurnJobPath(agentId: string, jobId: string): string;
export declare function internalAgentTurnJobResultAckPath(agentId: string, jobId: string): string;
/**
 * HTTP 202. The service persists the turn before accepting it. Within the authenticated
 * agent scope, the same key and content return the same jobId with replayed: true;
 * different content returns HTTP 409 InternalAgentTurnJobConflictResponseSchema.
 * The service authenticates and verifies ownership before looking up the key or job.
 * This contract does not implement persistence, deduplication or turn execution.
 */
export declare const internalAgentTurnJobSubmitContract: {
    readonly method: "POST";
    readonly path: "/internal/agents/:agentId/turn-jobs";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        channelId: z.ZodString;
        sessionId: z.ZodString;
        message: z.ZodString;
        history: z.ZodOptional<z.ZodArray<z.ZodObject<{
            role: z.ZodEnum<{
                system: "system";
                user: "user";
                assistant: "assistant";
                tool: "tool";
            }>;
            content: z.ZodString;
            toolCallId: z.ZodOptional<z.ZodString>;
            toolName: z.ZodOptional<z.ZodString>;
            toolCalls: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>>;
        attachment: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<{
                document: "document";
                photo: "photo";
                video: "video";
            }>;
            fileUrl: z.ZodString;
            mimeType: z.ZodOptional<z.ZodString>;
            filename: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        turn: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"opening">;
            turnId: z.ZodString;
            text: z.ZodLiteral<"">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"answer">;
            turnId: z.ZodString;
            text: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"incomplete">;
            turnId: z.ZodString;
            text: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            turnId: z.ZodString;
            text: z.ZodLiteral<"">;
            moveId: z.ZodString;
            spokenText: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"prepare">;
            turnId: z.ZodString;
            text: z.ZodLiteral<"">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"exchange">;
            turnId: z.ZodString;
            text: z.ZodString;
            spokenText: z.ZodString;
            ended: z.ZodBoolean;
        }, z.core.$strict>], "kind">>;
        identity: z.ZodOptional<z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        userId: z.ZodOptional<z.ZodString>;
        organizationRun: z.ZodOptional<z.ZodObject<{
            context: z.ZodObject<{
                schemaVersion: z.ZodLiteral<1>;
                runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
                organizationId: z.ZodString;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                identity: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>;
                personRef: z.ZodOptional<z.ZodString>;
                issuer: z.ZodEnum<{
                    x9: "x9";
                    forge: "forge";
                    paperclip: "paperclip";
                }>;
                issuedAt: z.ZodISODateTime;
                expiresAt: z.ZodISODateTime;
            }, z.core.$strict>;
            attempt: z.ZodObject<{
                runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
                attemptId: z.ZodString;
                attemptNumber: z.ZodNumber;
                startedAt: z.ZodISODateTime;
                idempotencyKey: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        idempotencyKey: z.ZodString;
        origin: z.ZodOptional<z.ZodObject<{
            channel: z.ZodLiteral<"email">;
            messageId: z.ZodString;
            inboxId: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        jobId: z.ZodString;
        status: z.ZodEnum<{
            failed: "failed";
            uncertain: "uncertain";
            completed: "completed";
            queued: "queued";
            running: "running";
        }>;
        replayed: z.ZodBoolean;
    }, z.core.$strip>;
};
/** Reading the durable job never starts or retries a turn, including uncertain work. */
export declare const internalAgentTurnJobReadContract: {
    readonly method: "GET";
    readonly path: "/internal/agents/:agentId/turn-jobs/:jobId";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        jobId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        jobId: z.ZodString;
        status: z.ZodEnum<{
            failed: "failed";
            uncertain: "uncertain";
            completed: "completed";
            queued: "queued";
            running: "running";
        }>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
        }, z.core.$strip>>;
        result: z.ZodOptional<z.ZodObject<{
            ok: z.ZodLiteral<true>;
            reply: z.ZodString;
            updatedHistory: z.ZodArray<z.ZodObject<{
                role: z.ZodEnum<{
                    system: "system";
                    user: "user";
                    assistant: "assistant";
                    tool: "tool";
                }>;
                content: z.ZodString;
                toolCallId: z.ZodOptional<z.ZodString>;
                toolName: z.ZodOptional<z.ZodString>;
                toolCalls: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>;
            moveId: z.ZodOptional<z.ZodString>;
            lead: z.ZodOptional<z.ZodString>;
            note: z.ZodOptional<z.ZodString>;
            connectionCards: z.ZodOptional<z.ZodArray<z.ZodObject<{
                cardId: z.ZodString;
                provider: z.ZodEnum<{
                    google: "google";
                }>;
                permissions: z.ZodArray<z.ZodEnum<{
                    calendar_events: "calendar_events";
                    contacts_read: "contacts_read";
                    mail_send: "mail_send";
                    mail_draft: "mail_draft";
                    mail_read: "mail_read";
                    drive_read: "drive_read";
                }>>;
                url: z.ZodString;
                expiresAt: z.ZodNumber;
                state: z.ZodEnum<{
                    connected: "connected";
                    revoked: "revoked";
                    pending: "pending";
                    denied: "denied";
                    expired: "expired";
                }>;
                reason: z.ZodString;
            }, z.core.$strict>>>;
            outcome: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                status: z.ZodLiteral<"succeeded">;
                runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
                attemptId: z.ZodString;
                evidence: z.ZodArray<z.ZodObject<{
                    kind: z.ZodEnum<{
                        log: "log";
                        artifact: "artifact";
                        commit: "commit";
                        document: "document";
                        metric: "metric";
                    }>;
                    ref: z.ZodString;
                    sha256: z.ZodOptional<z.ZodString>;
                    grantsRead: z.ZodLiteral<false>;
                }, z.core.$strict>>;
                consumption: z.ZodArray<z.ZodObject<{
                    unit: z.ZodEnum<{
                        usd_micros: "usd_micros";
                        tokens: "tokens";
                        seconds: "seconds";
                    }>;
                    quantity: z.ZodNumber;
                    state: z.ZodEnum<{
                        unknown: "unknown";
                        reserved: "reserved";
                        settled: "settled";
                    }>;
                    estimated: z.ZodBoolean;
                }, z.core.$strict>>;
                recordedAt: z.ZodISODateTime;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"failed">;
                failureCode: z.ZodString;
                runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
                attemptId: z.ZodString;
                evidence: z.ZodArray<z.ZodObject<{
                    kind: z.ZodEnum<{
                        log: "log";
                        artifact: "artifact";
                        commit: "commit";
                        document: "document";
                        metric: "metric";
                    }>;
                    ref: z.ZodString;
                    sha256: z.ZodOptional<z.ZodString>;
                    grantsRead: z.ZodLiteral<false>;
                }, z.core.$strict>>;
                consumption: z.ZodArray<z.ZodObject<{
                    unit: z.ZodEnum<{
                        usd_micros: "usd_micros";
                        tokens: "tokens";
                        seconds: "seconds";
                    }>;
                    quantity: z.ZodNumber;
                    state: z.ZodEnum<{
                        unknown: "unknown";
                        reserved: "reserved";
                        settled: "settled";
                    }>;
                    estimated: z.ZodBoolean;
                }, z.core.$strict>>;
                recordedAt: z.ZodISODateTime;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"cancelled">;
                runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
                attemptId: z.ZodString;
                evidence: z.ZodArray<z.ZodObject<{
                    kind: z.ZodEnum<{
                        log: "log";
                        artifact: "artifact";
                        commit: "commit";
                        document: "document";
                        metric: "metric";
                    }>;
                    ref: z.ZodString;
                    sha256: z.ZodOptional<z.ZodString>;
                    grantsRead: z.ZodLiteral<false>;
                }, z.core.$strict>>;
                consumption: z.ZodArray<z.ZodObject<{
                    unit: z.ZodEnum<{
                        usd_micros: "usd_micros";
                        tokens: "tokens";
                        seconds: "seconds";
                    }>;
                    quantity: z.ZodNumber;
                    state: z.ZodEnum<{
                        unknown: "unknown";
                        reserved: "reserved";
                        settled: "settled";
                    }>;
                    estimated: z.ZodBoolean;
                }, z.core.$strict>>;
                recordedAt: z.ZodISODateTime;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"uncertain">;
                reason: z.ZodEnum<{
                    response_lost: "response_lost";
                    timeout: "timeout";
                    provider_unknown: "provider_unknown";
                    worker_crashed: "worker_crashed";
                }>;
                runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
                attemptId: z.ZodString;
                evidence: z.ZodArray<z.ZodObject<{
                    kind: z.ZodEnum<{
                        log: "log";
                        artifact: "artifact";
                        commit: "commit";
                        document: "document";
                        metric: "metric";
                    }>;
                    ref: z.ZodString;
                    sha256: z.ZodOptional<z.ZodString>;
                    grantsRead: z.ZodLiteral<false>;
                }, z.core.$strict>>;
                consumption: z.ZodArray<z.ZodObject<{
                    unit: z.ZodEnum<{
                        usd_micros: "usd_micros";
                        tokens: "tokens";
                        seconds: "seconds";
                    }>;
                    quantity: z.ZodNumber;
                    state: z.ZodEnum<{
                        unknown: "unknown";
                        reserved: "reserved";
                        settled: "settled";
                    }>;
                    estimated: z.ZodBoolean;
                }, z.core.$strict>>;
                recordedAt: z.ZodISODateTime;
            }, z.core.$strict>], "status">>;
            duplicate: z.ZodOptional<z.ZodLiteral<true>>;
        }, z.core.$strip>>;
        resultDigest: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
/**
 * Idempotent acknowledgement after delivery. The service checks the digest against
 * the stored result; repeating the same acknowledgement returns acknowledged: true.
 * A mismatched digest must be refused without acknowledging a different result.
 */
export declare const internalAgentTurnJobResultAckContract: {
    readonly method: "POST";
    readonly path: "/internal/agents/:agentId/turn-jobs/:jobId/result-ack";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        jobId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        resultDigest: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        jobId: z.ZodString;
        acknowledged: z.ZodLiteral<true>;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-agent-turn-jobs.d.ts.map