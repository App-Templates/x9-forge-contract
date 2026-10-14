import { z } from 'zod';
/** One attempt of a run: the unit that retries and idempotency refer to. */
export declare const RunAttemptSchema: z.ZodObject<{
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    attemptId: z.ZodString;
    attemptNumber: z.ZodNumber;
    startedAt: z.ZodISODateTime;
    idempotencyKey: z.ZodString;
}, z.core.$strict>;
export type RunAttempt = z.infer<typeof RunAttemptSchema>;
/**
 * Reference to evidence. A reference never grants read access to the
 * referenced (possibly private) data: `grantsRead` is always false.
 */
export declare const EvidenceRefSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;
/** Consumption of one unit; an unknown amount must be flagged as estimated. */
export declare const ConsumptionSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type Consumption = z.infer<typeof ConsumptionSchema>;
/** Outcome of an attempt. An uncertain outcome is never reported as succeeded. */
export declare const RunOutcomeSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type RunOutcome = z.infer<typeof RunOutcomeSchema>;
//# sourceMappingURL=run-outcome.d.ts.map