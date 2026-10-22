import { z } from 'zod';
/** Outcome of one attempt of a run, correlated by runId + attemptId. */
export declare const RunOutcomeExperienceEventSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type RunOutcomeExperienceEvent = z.infer<typeof RunOutcomeExperienceEventSchema>;
export declare const AuthoritativeDecisionStatusSchema: z.ZodEnum<{
    revoked: "revoked";
    approved: "approved";
    superseded: "superseded";
}>;
export type AuthoritativeDecisionStatus = z.infer<typeof AuthoritativeDecisionStatusSchema>;
/** Verified identity that approved a decision. */
export declare const DecisionApproverSchema: z.ZodObject<{
    actorType: z.ZodEnum<{
        service: "service";
        human: "human";
    }>;
    actorId: z.ZodString;
}, z.core.$strict>;
export type DecisionApprover = z.infer<typeof DecisionApproverSchema>;
/**
 * A decision approved by a verified identity. A complete `DecisionResponse`
 * is not an approved event: approval is a distinct, attributable act.
 */
export declare const AuthoritativeDecisionExperienceEventSchema: z.ZodObject<{
    kind: z.ZodLiteral<"authoritative_decision">;
    decisionRef: z.ZodString;
    status: z.ZodEnum<{
        revoked: "revoked";
        approved: "approved";
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
}, z.core.$strict>;
export type AuthoritativeDecisionExperienceEvent = z.infer<typeof AuthoritativeDecisionExperienceEventSchema>;
export declare const OrganizationExperienceEventSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        revoked: "revoked";
        approved: "approved";
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
export type OrganizationExperienceEvent = z.infer<typeof OrganizationExperienceEventSchema>;
export declare const ExperienceReceiptSchema: z.ZodObject<{
    recordId: z.ZodString;
    version: z.ZodNumber;
    digest: z.ZodString;
    disposition: z.ZodEnum<{
        duplicate: "duplicate";
        stored: "stored";
    }>;
}, z.core.$strict>;
export type ExperienceReceipt = z.infer<typeof ExperienceReceiptSchema>;
/**
 * Correlates a stored or duplicate receipt with the event actually sent.
 * This does not authenticate the sender: receipts carry no tenant or organization.
 * X9 adoption is pending in services/agent-core/src/core/organization-experience-delivery.ts
 * (task 169); callers must retain their existing authorization checks.
 */
export declare function isExperienceReceiptForEvent(raw: unknown, expected: unknown): boolean;
export declare const ExperienceConflictSchema: z.ZodObject<{
    code: z.ZodLiteral<"experience_conflict">;
    recordId: z.ZodString;
    version: z.ZodNumber;
}, z.core.$strict>;
export type ExperienceConflict = z.infer<typeof ExperienceConflictSchema>;
//# sourceMappingURL=experience.d.ts.map