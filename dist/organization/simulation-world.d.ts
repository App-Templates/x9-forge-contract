import { z } from 'zod';
/** Typed initial state of a simulated world (never opaque JSON). */
export declare const SimulationInitialStateSchema: z.ZodObject<{
    agents: z.ZodArray<z.ZodObject<{
        agentId: z.ZodString;
        role: z.ZodString;
    }, z.core.$strict>>;
    jobs: z.ZodArray<z.ZodObject<{
        jobId: z.ZodString;
        agentId: z.ZodString;
        intervalSeconds: z.ZodNumber;
        destination: z.ZodString;
    }, z.core.$strict>>;
    caps: z.ZodArray<z.ZodObject<{
        unit: z.ZodEnum<{
            usd_micros: "usd_micros";
            tokens: "tokens";
            seconds: "seconds";
        }>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type SimulationInitialState = z.infer<typeof SimulationInitialStateSchema>;
/**
 * An isolated simulated world pinned to a fixed scenario. `organizationId` is
 * explicit and is NOT assumed equal to `tenantId`.
 */
export declare const SimulationWorldSchema: z.ZodObject<{
    worldId: z.ZodString;
    schemaVersion: z.ZodLiteral<1>;
    scenarioRef: z.ZodObject<{
        scenarioId: z.ZodString;
        version: z.ZodNumber;
        contentSha256: z.ZodString;
    }, z.core.$strict>;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    ownerId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>;
    clock: z.ZodObject<{
        startAt: z.ZodISODateTime;
    }, z.core.$strict>;
    initialState: z.ZodObject<{
        agents: z.ZodArray<z.ZodObject<{
            agentId: z.ZodString;
            role: z.ZodString;
        }, z.core.$strict>>;
        jobs: z.ZodArray<z.ZodObject<{
            jobId: z.ZodString;
            agentId: z.ZodString;
            intervalSeconds: z.ZodNumber;
            destination: z.ZodString;
        }, z.core.$strict>>;
        caps: z.ZodArray<z.ZodObject<{
            unit: z.ZodEnum<{
                usd_micros: "usd_micros";
                tokens: "tokens";
                seconds: "seconds";
            }>;
            limit: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    allowedDestinations: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type SimulationWorld = z.infer<typeof SimulationWorldSchema>;
/** One step of the world; `seq` is the semantic order, `effectId` the effect identity. */
export declare const SimulationActionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"turn">;
    agentId: z.ZodString;
    input: z.ZodString;
    destination: z.ZodOptional<z.ZodString>;
    seq: z.ZodNumber;
    effectId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"job_occurrence">;
    jobId: z.ZodString;
    occurrenceAt: z.ZodISODateTime;
    seq: z.ZodNumber;
    effectId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"stop">;
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    seq: z.ZodNumber;
    effectId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"advance_clock">;
    seconds: z.ZodNumber;
    seq: z.ZodNumber;
    effectId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"inject_fault">;
    fault: z.ZodEnum<{
        response_lost: "response_lost";
        timeout: "timeout";
        provider_unknown: "provider_unknown";
        worker_crashed: "worker_crashed";
    }>;
    target: z.ZodString;
    seq: z.ZodNumber;
    effectId: z.ZodString;
}, z.core.$strict>], "type">;
export type SimulationAction = z.infer<typeof SimulationActionSchema>;
/** A world plus its ordered actions: unique `seq`, destinations inside the world list. */
export declare const SimulationScriptSchema: z.ZodObject<{
    world: z.ZodObject<{
        worldId: z.ZodString;
        schemaVersion: z.ZodLiteral<1>;
        scenarioRef: z.ZodObject<{
            scenarioId: z.ZodString;
            version: z.ZodNumber;
            contentSha256: z.ZodString;
        }, z.core.$strict>;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        ownerId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>;
        clock: z.ZodObject<{
            startAt: z.ZodISODateTime;
        }, z.core.$strict>;
        initialState: z.ZodObject<{
            agents: z.ZodArray<z.ZodObject<{
                agentId: z.ZodString;
                role: z.ZodString;
            }, z.core.$strict>>;
            jobs: z.ZodArray<z.ZodObject<{
                jobId: z.ZodString;
                agentId: z.ZodString;
                intervalSeconds: z.ZodNumber;
                destination: z.ZodString;
            }, z.core.$strict>>;
            caps: z.ZodArray<z.ZodObject<{
                unit: z.ZodEnum<{
                    usd_micros: "usd_micros";
                    tokens: "tokens";
                    seconds: "seconds";
                }>;
                limit: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        allowedDestinations: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    actions: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"turn">;
        agentId: z.ZodString;
        input: z.ZodString;
        destination: z.ZodOptional<z.ZodString>;
        seq: z.ZodNumber;
        effectId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"job_occurrence">;
        jobId: z.ZodString;
        occurrenceAt: z.ZodISODateTime;
        seq: z.ZodNumber;
        effectId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"stop">;
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        seq: z.ZodNumber;
        effectId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"advance_clock">;
        seconds: z.ZodNumber;
        seq: z.ZodNumber;
        effectId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"inject_fault">;
        fault: z.ZodEnum<{
            response_lost: "response_lost";
            timeout: "timeout";
            provider_unknown: "provider_unknown";
            worker_crashed: "worker_crashed";
        }>;
        target: z.ZodString;
        seq: z.ZodNumber;
        effectId: z.ZodString;
    }, z.core.$strict>], "type">>;
}, z.core.$strict>;
export type SimulationScript = z.infer<typeof SimulationScriptSchema>;
/** Correlated result of a simulation: every outcome is tied to its run and attempt. */
export declare const SimulationResultSchema: z.ZodObject<{
    worldId: z.ZodString;
    scenarioRef: z.ZodObject<{
        scenarioId: z.ZodString;
        version: z.ZodNumber;
        contentSha256: z.ZodString;
    }, z.core.$strict>;
    runs: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>;
    receipts: z.ZodArray<z.ZodObject<{
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        state: z.ZodEnum<{
            settled: "settled";
            stopped: "stopped";
            running: "running";
            stop_requested: "stop_requested";
        }>;
        consumption: z.ZodObject<{
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
        stopReason: z.ZodOptional<z.ZodEnum<{
            error: "error";
            policy: "policy";
            budget: "budget";
            owner: "owner";
        }>>;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    coverage: z.ZodObject<{
        numerator: z.ZodNumber;
        denominator: z.ZodNumber;
        limits: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    canonicalHash: z.ZodString;
}, z.core.$strict>;
export type SimulationResult = z.infer<typeof SimulationResultSchema>;
/** SHA-256 (lowercase hex) of the world with object keys sorted; array order is kept. */
export declare function canonicalWorldHash(world: SimulationWorld): string;
//# sourceMappingURL=simulation-world.d.ts.map