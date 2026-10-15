import { z } from 'zod';
/**
 * POST /internal/memory/experience — ingest of one organization experience event.
 * POST /internal/memory/experience/query — structured read of stored experience.
 * Direction: X9 internal (agent-core / consumers -> memory-svc)
 * Auth: internal secret (INTERNAL_SECRET_HEADER)
 *
 * Ingest is idempotent: same recordId+version+digest answers 200 `duplicate`;
 * same recordId+version with another digest answers 409 `experience_conflict`.
 */
export declare const INTERNAL_MEMORY_EXPERIENCE_PATH: "/internal/memory/experience";
export declare const INTERNAL_MEMORY_EXPERIENCE_QUERY_PATH: "/internal/memory/experience/query";
export declare const InternalMemoryExperienceRequestSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"run_outcome">;
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    attemptId: z.ZodString;
    outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    }, z.core.$strict>], "status">;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    recordId: z.ZodString;
    version: z.ZodNumber;
    occurredAt: z.ZodISODateTime;
    digest: z.ZodString;
    visibility: z.ZodLiteral<"private_to_producer">;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"authoritative_decision">;
    decisionRef: z.ZodString;
    status: z.ZodEnum<{
        approved: "approved";
        revoked: "revoked";
        superseded: "superseded";
    }>;
    approvedBy: z.ZodOptional<z.ZodObject<{
        actorType: z.ZodEnum<{
            service: "service";
            human: "human";
        }>;
        actorId: z.ZodString;
    }, z.core.$strict>>;
    approvalRef: z.ZodOptional<z.ZodString>;
    supersedes: z.ZodOptional<z.ZodNumber>;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    recordId: z.ZodString;
    version: z.ZodNumber;
    occurredAt: z.ZodISODateTime;
    digest: z.ZodString;
    visibility: z.ZodLiteral<"private_to_producer">;
}, z.core.$strict>], "kind">;
export type InternalMemoryExperienceRequest = z.infer<typeof InternalMemoryExperienceRequestSchema>;
export declare const InternalMemoryExperienceResponseSchema: z.ZodObject<{
    recordId: z.ZodString;
    version: z.ZodNumber;
    digest: z.ZodString;
    disposition: z.ZodEnum<{
        duplicate: "duplicate";
        stored: "stored";
    }>;
}, z.core.$strict>;
export type InternalMemoryExperienceResponse = z.infer<typeof InternalMemoryExperienceResponseSchema>;
/** Named failures shared by the experience and decision routes. */
export declare const ExperienceErrorCodeSchema: z.ZodEnum<{
    experience_conflict: "experience_conflict";
    unauthenticated: "unauthenticated";
    identity_uncertain: "identity_uncertain";
    invalid_event: "invalid_event";
}>;
export type ExperienceErrorCode = z.infer<typeof ExperienceErrorCodeSchema>;
export declare const ExperienceErrorResponseSchema: z.ZodObject<{
    code: z.ZodEnum<{
        experience_conflict: "experience_conflict";
        unauthenticated: "unauthenticated";
        identity_uncertain: "identity_uncertain";
        invalid_event: "invalid_event";
    }>;
    message: z.ZodString;
}, z.core.$strict>;
export type ExperienceErrorResponse = z.infer<typeof ExperienceErrorResponseSchema>;
export declare const ExperienceConflictResponseSchema: z.ZodObject<{
    code: z.ZodLiteral<"experience_conflict">;
    recordId: z.ZodString;
    version: z.ZodNumber;
}, z.core.$strict>;
export declare const ExperienceKindSchema: z.ZodEnum<{
    run_outcome: "run_outcome";
    authoritative_decision: "authoritative_decision";
}>;
export type ExperienceKind = z.infer<typeof ExperienceKindSchema>;
export declare const ExperienceRecordStateSchema: z.ZodEnum<{
    revoked: "revoked";
    superseded: "superseded";
    current: "current";
}>;
export type ExperienceRecordState = z.infer<typeof ExperienceRecordStateSchema>;
/** Provenance filter: the run that produced an outcome or the decision it refers to. */
export declare const InternalMemoryExperienceQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    recordId: z.ZodOptional<z.ZodString>;
    kind: z.ZodOptional<z.ZodEnum<{
        run_outcome: "run_outcome";
        authoritative_decision: "authoritative_decision";
    }>>;
    runId: z.ZodOptional<z.ZodString>;
    decisionRef: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
export type InternalMemoryExperienceQuery = z.infer<typeof InternalMemoryExperienceQuerySchema>;
export declare const ExperienceRecordViewSchema: z.ZodObject<{
    recordId: z.ZodString;
    kind: z.ZodEnum<{
        run_outcome: "run_outcome";
        authoritative_decision: "authoritative_decision";
    }>;
    /** Version in force for this record. */
    version: z.ZodNumber;
    state: z.ZodEnum<{
        revoked: "revoked";
        superseded: "superseded";
        current: "current";
    }>;
    digest: z.ZodString;
    occurredAt: z.ZodISODateTime;
}, z.core.$strict>;
export type ExperienceRecordView = z.infer<typeof ExperienceRecordViewSchema>;
export declare const InternalMemoryExperienceQueryResponseSchema: z.ZodObject<{
    records: z.ZodArray<z.ZodObject<{
        recordId: z.ZodString;
        kind: z.ZodEnum<{
            run_outcome: "run_outcome";
            authoritative_decision: "authoritative_decision";
        }>;
        /** Version in force for this record. */
        version: z.ZodNumber;
        state: z.ZodEnum<{
            revoked: "revoked";
            superseded: "superseded";
            current: "current";
        }>;
        digest: z.ZodString;
        occurredAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type InternalMemoryExperienceQueryResponse = z.infer<typeof InternalMemoryExperienceQueryResponseSchema>;
export declare const internalMemoryExperienceContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/experience";
    readonly authType: "secret";
    readonly bodySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"run_outcome">;
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        attemptId: z.ZodString;
        outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        }, z.core.$strict>], "status">;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        recordId: z.ZodString;
        version: z.ZodNumber;
        occurredAt: z.ZodISODateTime;
        digest: z.ZodString;
        visibility: z.ZodLiteral<"private_to_producer">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"authoritative_decision">;
        decisionRef: z.ZodString;
        status: z.ZodEnum<{
            approved: "approved";
            revoked: "revoked";
            superseded: "superseded";
        }>;
        approvedBy: z.ZodOptional<z.ZodObject<{
            actorType: z.ZodEnum<{
                service: "service";
                human: "human";
            }>;
            actorId: z.ZodString;
        }, z.core.$strict>>;
        approvalRef: z.ZodOptional<z.ZodString>;
        supersedes: z.ZodOptional<z.ZodNumber>;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        recordId: z.ZodString;
        version: z.ZodNumber;
        occurredAt: z.ZodISODateTime;
        digest: z.ZodString;
        visibility: z.ZodLiteral<"private_to_producer">;
    }, z.core.$strict>], "kind">;
    readonly responseSchema: z.ZodObject<{
        recordId: z.ZodString;
        version: z.ZodNumber;
        digest: z.ZodString;
        disposition: z.ZodEnum<{
            duplicate: "duplicate";
            stored: "stored";
        }>;
    }, z.core.$strict>;
};
export declare const internalMemoryExperienceQueryContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/experience/query";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        recordId: z.ZodOptional<z.ZodString>;
        kind: z.ZodOptional<z.ZodEnum<{
            run_outcome: "run_outcome";
            authoritative_decision: "authoritative_decision";
        }>>;
        runId: z.ZodOptional<z.ZodString>;
        decisionRef: z.ZodOptional<z.ZodString>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        records: z.ZodArray<z.ZodObject<{
            recordId: z.ZodString;
            kind: z.ZodEnum<{
                run_outcome: "run_outcome";
                authoritative_decision: "authoritative_decision";
            }>;
            /** Version in force for this record. */
            version: z.ZodNumber;
            state: z.ZodEnum<{
                revoked: "revoked";
                superseded: "superseded";
                current: "current";
            }>;
            digest: z.ZodString;
            occurredAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-memory-experience.d.ts.map