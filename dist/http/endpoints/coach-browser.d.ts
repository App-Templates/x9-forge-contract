import { z } from 'zod';
export declare const CoachBrowserProjectionSchema: z.ZodObject<{
    strategy: z.ZodObject<{
        strategyId: z.ZodString;
        strategyVersion: z.ZodString;
    }, z.core.$strict>;
    value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
}, z.core.$strict>;
export type CoachBrowserProjection = z.infer<typeof CoachBrowserProjectionSchema>;
/** Opaque refs select server-owned records. Clerk person/program/opening/proof are always resolved by the BFF. */
export declare const CoachBrowserRequestSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"person_program_read">;
    requestId: z.ZodString;
    programRef: z.ZodString;
    after: z.ZodNullable<z.ZodString>;
    limit: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"open">;
    requestId: z.ZodString;
    programRef: z.ZodString;
    channel: z.ZodEnum<{
        text: "text";
        native: "native";
    }>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"session_read">;
    requestId: z.ZodString;
    sessionRef: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    afterSequence: z.ZodNumber;
    limit: z.ZodNumber;
    requestId: z.ZodString;
    sessionRef: z.ZodString;
    expectedRevision: z.ZodNumber;
    action: z.ZodLiteral<"revisions_read">;
}, z.core.$strict>, z.ZodObject<{
    input: z.ZodObject<{
        kind: z.ZodString;
        payload: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
    }, z.core.$strict>;
    requestId: z.ZodString;
    sessionRef: z.ZodString;
    expectedRevision: z.ZodNumber;
    action: z.ZodLiteral<"conversation_input">;
}, z.core.$strict>, z.ZodObject<{
    requestId: z.ZodString;
    sessionRef: z.ZodString;
    expectedRevision: z.ZodNumber;
    action: z.ZodLiteral<"execution_start">;
}, z.core.$strict>, z.ZodObject<{
    event: z.ZodObject<{
        kind: z.ZodString;
        payload: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
    }, z.core.$strict>;
    requestId: z.ZodString;
    sessionRef: z.ZodString;
    expectedRevision: z.ZodNumber;
    action: z.ZodLiteral<"execution_event">;
}, z.core.$strict>, z.ZodObject<{
    requestId: z.ZodString;
    sessionRef: z.ZodString;
    expectedRevision: z.ZodNumber;
    action: z.ZodLiteral<"guide_end">;
}, z.core.$strict>, z.ZodObject<{
    conclusion: z.ZodNullable<z.ZodObject<{
        kind: z.ZodString;
        payload: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
    }, z.core.$strict>>;
    requestId: z.ZodString;
    sessionRef: z.ZodString;
    expectedRevision: z.ZodNumber;
    action: z.ZodLiteral<"session_close">;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"mint">;
    requestId: z.ZodString;
    sessionRef: z.ZodString;
    transport: z.ZodEnum<{
        websocket: "websocket";
        webrtc: "webrtc";
    }>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"conversation_bind">;
    requestId: z.ZodString;
    sessionRef: z.ZodString;
    providerConversationId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"execution_attach">;
    requestId: z.ZodString;
    sessionRef: z.ZodString;
}, z.core.$strict>], "action">;
export type CoachBrowserRequest = z.infer<typeof CoachBrowserRequestSchema>;
/** Public budget retains explicit unknown, never a fabricated zero or an internal person scope. */
export declare const CoachBrowserBudgetSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"known">;
    asOf: z.ZodISODateTime;
    remainingSeconds: z.ZodNumber;
    limitSeconds: z.ZodNumber;
    shareLimitSeconds: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"unknown">;
    reason: z.ZodEnum<{
        source_unavailable: "source_unavailable";
        usage_pending: "usage_pending";
        authority_unavailable: "authority_unavailable";
    }>;
}, z.core.$strict>], "status">;
export type CoachBrowserBudget = z.infer<typeof CoachBrowserBudgetSchema>;
export declare const CoachBrowserSessionSchema: z.ZodObject<{
    sessionRef: z.ZodString;
    revision: z.ZodNumber;
    lifecycle: z.ZodEnum<{
        opened: "opened";
        executing: "executing";
        execution_ended: "execution_ended";
        closed: "closed";
    }>;
    openedAt: z.ZodISODateTime;
    projection: z.ZodNullable<z.ZodObject<{
        strategy: z.ZodObject<{
            strategyId: z.ZodString;
            strategyVersion: z.ZodString;
        }, z.core.$strict>;
        value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
    }, z.core.$strict>>;
    execution: z.ZodNullable<z.ZodObject<{
        startedAt: z.ZodISODateTime;
        segments: z.ZodArray<z.ZodObject<{
            segmentId: z.ZodString;
            stepId: z.ZodOptional<z.ZodString>;
            offsetSeconds: z.ZodNumber;
            durationSeconds: z.ZodNumber;
        }, z.core.$strict>>;
        totalSeconds: z.ZodNumber;
        decisionCodes: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    latestRevision: z.ZodNullable<z.ZodObject<{
        sequence: z.ZodNumber;
        appliedAt: z.ZodISODateTime;
        effectiveFromSeconds: z.ZodNumber;
        segments: z.ZodArray<z.ZodObject<{
            segmentId: z.ZodString;
            stepId: z.ZodOptional<z.ZodString>;
            offsetSeconds: z.ZodNumber;
            durationSeconds: z.ZodNumber;
        }, z.core.$strict>>;
        totalSeconds: z.ZodNumber;
        decisionCodes: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    practice: z.ZodNullable<z.ZodObject<{
        startedAt: z.ZodISODateTime;
        endedAt: z.ZodISODateTime;
        guidedSeconds: z.ZodNumber;
        wakeSeconds: z.ZodNumber;
    }, z.core.$strict>>;
    accounting: z.ZodNullable<z.ZodObject<{
        outcome: z.ZodEnum<{
            completed: "completed";
            abandoned: "abandoned";
            interrupted: "interrupted";
        }>;
        progressionCredit: z.ZodBoolean;
    }, z.core.$strict>>;
    measureDefinitions: z.ZodArray<z.ZodObject<{
        measureId: z.ZodString;
        version: z.ZodString;
        unit: z.ZodString;
        min: z.ZodNumber;
        max: z.ZodNumber;
    }, z.core.$strict>>;
    measures: z.ZodArray<z.ZodObject<{
        measureId: z.ZodString;
        definitionVersion: z.ZodString;
        unit: z.ZodString;
        observedAt: z.ZodISODateTime;
        value: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"known">;
            value: z.ZodNumber;
            confidence: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"unknown">;
            reason: z.ZodString;
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>>;
    budget: z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"known">;
        asOf: z.ZodISODateTime;
        remainingSeconds: z.ZodNumber;
        limitSeconds: z.ZodNumber;
        shareLimitSeconds: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unknown">;
        reason: z.ZodEnum<{
            source_unavailable: "source_unavailable";
            usage_pending: "usage_pending";
            authority_unavailable: "authority_unavailable";
        }>;
    }, z.core.$strict>], "status">;
}, z.core.$strict>;
export type CoachBrowserSession = z.infer<typeof CoachBrowserSessionSchema>;
export declare const CoachBrowserResultSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"person_program_read">;
    programRef: z.ZodString;
    observedAt: z.ZodISODateTime;
    personState: z.ZodNullable<z.ZodObject<{
        strategy: z.ZodObject<{
            strategyId: z.ZodString;
            strategyVersion: z.ZodString;
        }, z.core.$strict>;
        value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
    }, z.core.$strict>>;
    budget: z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"known">;
        asOf: z.ZodISODateTime;
        remainingSeconds: z.ZodNumber;
        limitSeconds: z.ZodNumber;
        shareLimitSeconds: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unknown">;
        reason: z.ZodEnum<{
            source_unavailable: "source_unavailable";
            usage_pending: "usage_pending";
            authority_unavailable: "authority_unavailable";
        }>;
    }, z.core.$strict>], "status">;
    sessions: z.ZodArray<z.ZodObject<{
        sessionRef: z.ZodString;
        revision: z.ZodNumber;
        lifecycle: z.ZodEnum<{
            opened: "opened";
            executing: "executing";
            execution_ended: "execution_ended";
            closed: "closed";
        }>;
        openedAt: z.ZodISODateTime;
        projection: z.ZodNullable<z.ZodObject<{
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
        }, z.core.$strict>>;
        execution: z.ZodNullable<z.ZodObject<{
            startedAt: z.ZodISODateTime;
            segments: z.ZodArray<z.ZodObject<{
                segmentId: z.ZodString;
                stepId: z.ZodOptional<z.ZodString>;
                offsetSeconds: z.ZodNumber;
                durationSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            totalSeconds: z.ZodNumber;
            decisionCodes: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        latestRevision: z.ZodNullable<z.ZodObject<{
            sequence: z.ZodNumber;
            appliedAt: z.ZodISODateTime;
            effectiveFromSeconds: z.ZodNumber;
            segments: z.ZodArray<z.ZodObject<{
                segmentId: z.ZodString;
                stepId: z.ZodOptional<z.ZodString>;
                offsetSeconds: z.ZodNumber;
                durationSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            totalSeconds: z.ZodNumber;
            decisionCodes: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        practice: z.ZodNullable<z.ZodObject<{
            startedAt: z.ZodISODateTime;
            endedAt: z.ZodISODateTime;
            guidedSeconds: z.ZodNumber;
            wakeSeconds: z.ZodNumber;
        }, z.core.$strict>>;
        accounting: z.ZodNullable<z.ZodObject<{
            outcome: z.ZodEnum<{
                completed: "completed";
                abandoned: "abandoned";
                interrupted: "interrupted";
            }>;
            progressionCredit: z.ZodBoolean;
        }, z.core.$strict>>;
        measureDefinitions: z.ZodArray<z.ZodObject<{
            measureId: z.ZodString;
            version: z.ZodString;
            unit: z.ZodString;
            min: z.ZodNumber;
            max: z.ZodNumber;
        }, z.core.$strict>>;
        measures: z.ZodArray<z.ZodObject<{
            measureId: z.ZodString;
            definitionVersion: z.ZodString;
            unit: z.ZodString;
            observedAt: z.ZodISODateTime;
            value: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"known">;
                value: z.ZodNumber;
                confidence: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"unknown">;
                reason: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>>;
        budget: z.ZodDiscriminatedUnion<[z.ZodObject<{
            status: z.ZodLiteral<"known">;
            asOf: z.ZodISODateTime;
            remainingSeconds: z.ZodNumber;
            limitSeconds: z.ZodNumber;
            shareLimitSeconds: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"unknown">;
            reason: z.ZodEnum<{
                source_unavailable: "source_unavailable";
                usage_pending: "usage_pending";
                authority_unavailable: "authority_unavailable";
            }>;
        }, z.core.$strict>], "status">;
    }, z.core.$strict>>;
    nextCursor: z.ZodNullable<z.ZodString>;
    ok: z.ZodLiteral<true>;
    requestId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"open">;
    programRef: z.ZodString;
    channel: z.ZodEnum<{
        text: "text";
        native: "native";
    }>;
    session: z.ZodObject<{
        sessionRef: z.ZodString;
        revision: z.ZodNumber;
        lifecycle: z.ZodEnum<{
            opened: "opened";
            executing: "executing";
            execution_ended: "execution_ended";
            closed: "closed";
        }>;
        openedAt: z.ZodISODateTime;
        projection: z.ZodNullable<z.ZodObject<{
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
        }, z.core.$strict>>;
        execution: z.ZodNullable<z.ZodObject<{
            startedAt: z.ZodISODateTime;
            segments: z.ZodArray<z.ZodObject<{
                segmentId: z.ZodString;
                stepId: z.ZodOptional<z.ZodString>;
                offsetSeconds: z.ZodNumber;
                durationSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            totalSeconds: z.ZodNumber;
            decisionCodes: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        latestRevision: z.ZodNullable<z.ZodObject<{
            sequence: z.ZodNumber;
            appliedAt: z.ZodISODateTime;
            effectiveFromSeconds: z.ZodNumber;
            segments: z.ZodArray<z.ZodObject<{
                segmentId: z.ZodString;
                stepId: z.ZodOptional<z.ZodString>;
                offsetSeconds: z.ZodNumber;
                durationSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            totalSeconds: z.ZodNumber;
            decisionCodes: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        practice: z.ZodNullable<z.ZodObject<{
            startedAt: z.ZodISODateTime;
            endedAt: z.ZodISODateTime;
            guidedSeconds: z.ZodNumber;
            wakeSeconds: z.ZodNumber;
        }, z.core.$strict>>;
        accounting: z.ZodNullable<z.ZodObject<{
            outcome: z.ZodEnum<{
                completed: "completed";
                abandoned: "abandoned";
                interrupted: "interrupted";
            }>;
            progressionCredit: z.ZodBoolean;
        }, z.core.$strict>>;
        measureDefinitions: z.ZodArray<z.ZodObject<{
            measureId: z.ZodString;
            version: z.ZodString;
            unit: z.ZodString;
            min: z.ZodNumber;
            max: z.ZodNumber;
        }, z.core.$strict>>;
        measures: z.ZodArray<z.ZodObject<{
            measureId: z.ZodString;
            definitionVersion: z.ZodString;
            unit: z.ZodString;
            observedAt: z.ZodISODateTime;
            value: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"known">;
                value: z.ZodNumber;
                confidence: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"unknown">;
                reason: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>>;
        budget: z.ZodDiscriminatedUnion<[z.ZodObject<{
            status: z.ZodLiteral<"known">;
            asOf: z.ZodISODateTime;
            remainingSeconds: z.ZodNumber;
            limitSeconds: z.ZodNumber;
            shareLimitSeconds: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"unknown">;
            reason: z.ZodEnum<{
                source_unavailable: "source_unavailable";
                usage_pending: "usage_pending";
                authority_unavailable: "authority_unavailable";
            }>;
        }, z.core.$strict>], "status">;
    }, z.core.$strict>;
    ok: z.ZodLiteral<true>;
    requestId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodEnum<{
        session_read: "session_read";
        conversation_input: "conversation_input";
        execution_start: "execution_start";
        execution_event: "execution_event";
        session_close: "session_close";
        conversation_bind: "conversation_bind";
        execution_attach: "execution_attach";
    }>;
    session: z.ZodObject<{
        sessionRef: z.ZodString;
        revision: z.ZodNumber;
        lifecycle: z.ZodEnum<{
            opened: "opened";
            executing: "executing";
            execution_ended: "execution_ended";
            closed: "closed";
        }>;
        openedAt: z.ZodISODateTime;
        projection: z.ZodNullable<z.ZodObject<{
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
        }, z.core.$strict>>;
        execution: z.ZodNullable<z.ZodObject<{
            startedAt: z.ZodISODateTime;
            segments: z.ZodArray<z.ZodObject<{
                segmentId: z.ZodString;
                stepId: z.ZodOptional<z.ZodString>;
                offsetSeconds: z.ZodNumber;
                durationSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            totalSeconds: z.ZodNumber;
            decisionCodes: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        latestRevision: z.ZodNullable<z.ZodObject<{
            sequence: z.ZodNumber;
            appliedAt: z.ZodISODateTime;
            effectiveFromSeconds: z.ZodNumber;
            segments: z.ZodArray<z.ZodObject<{
                segmentId: z.ZodString;
                stepId: z.ZodOptional<z.ZodString>;
                offsetSeconds: z.ZodNumber;
                durationSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            totalSeconds: z.ZodNumber;
            decisionCodes: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        practice: z.ZodNullable<z.ZodObject<{
            startedAt: z.ZodISODateTime;
            endedAt: z.ZodISODateTime;
            guidedSeconds: z.ZodNumber;
            wakeSeconds: z.ZodNumber;
        }, z.core.$strict>>;
        accounting: z.ZodNullable<z.ZodObject<{
            outcome: z.ZodEnum<{
                completed: "completed";
                abandoned: "abandoned";
                interrupted: "interrupted";
            }>;
            progressionCredit: z.ZodBoolean;
        }, z.core.$strict>>;
        measureDefinitions: z.ZodArray<z.ZodObject<{
            measureId: z.ZodString;
            version: z.ZodString;
            unit: z.ZodString;
            min: z.ZodNumber;
            max: z.ZodNumber;
        }, z.core.$strict>>;
        measures: z.ZodArray<z.ZodObject<{
            measureId: z.ZodString;
            definitionVersion: z.ZodString;
            unit: z.ZodString;
            observedAt: z.ZodISODateTime;
            value: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"known">;
                value: z.ZodNumber;
                confidence: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"unknown">;
                reason: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>>;
        budget: z.ZodDiscriminatedUnion<[z.ZodObject<{
            status: z.ZodLiteral<"known">;
            asOf: z.ZodISODateTime;
            remainingSeconds: z.ZodNumber;
            limitSeconds: z.ZodNumber;
            shareLimitSeconds: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"unknown">;
            reason: z.ZodEnum<{
                source_unavailable: "source_unavailable";
                usage_pending: "usage_pending";
                authority_unavailable: "authority_unavailable";
            }>;
        }, z.core.$strict>], "status">;
    }, z.core.$strict>;
    decisionCodes: z.ZodArray<z.ZodString>;
    ok: z.ZodLiteral<true>;
    requestId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"guide_end">;
    session: z.ZodObject<{
        sessionRef: z.ZodString;
        revision: z.ZodNumber;
        lifecycle: z.ZodEnum<{
            opened: "opened";
            executing: "executing";
            execution_ended: "execution_ended";
            closed: "closed";
        }>;
        openedAt: z.ZodISODateTime;
        projection: z.ZodNullable<z.ZodObject<{
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
        }, z.core.$strict>>;
        execution: z.ZodNullable<z.ZodObject<{
            startedAt: z.ZodISODateTime;
            segments: z.ZodArray<z.ZodObject<{
                segmentId: z.ZodString;
                stepId: z.ZodOptional<z.ZodString>;
                offsetSeconds: z.ZodNumber;
                durationSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            totalSeconds: z.ZodNumber;
            decisionCodes: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        latestRevision: z.ZodNullable<z.ZodObject<{
            sequence: z.ZodNumber;
            appliedAt: z.ZodISODateTime;
            effectiveFromSeconds: z.ZodNumber;
            segments: z.ZodArray<z.ZodObject<{
                segmentId: z.ZodString;
                stepId: z.ZodOptional<z.ZodString>;
                offsetSeconds: z.ZodNumber;
                durationSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            totalSeconds: z.ZodNumber;
            decisionCodes: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        practice: z.ZodNullable<z.ZodObject<{
            startedAt: z.ZodISODateTime;
            endedAt: z.ZodISODateTime;
            guidedSeconds: z.ZodNumber;
            wakeSeconds: z.ZodNumber;
        }, z.core.$strict>>;
        accounting: z.ZodNullable<z.ZodObject<{
            outcome: z.ZodEnum<{
                completed: "completed";
                abandoned: "abandoned";
                interrupted: "interrupted";
            }>;
            progressionCredit: z.ZodBoolean;
        }, z.core.$strict>>;
        measureDefinitions: z.ZodArray<z.ZodObject<{
            measureId: z.ZodString;
            version: z.ZodString;
            unit: z.ZodString;
            min: z.ZodNumber;
            max: z.ZodNumber;
        }, z.core.$strict>>;
        measures: z.ZodArray<z.ZodObject<{
            measureId: z.ZodString;
            definitionVersion: z.ZodString;
            unit: z.ZodString;
            observedAt: z.ZodISODateTime;
            value: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"known">;
                value: z.ZodNumber;
                confidence: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"unknown">;
                reason: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>>;
        budget: z.ZodDiscriminatedUnion<[z.ZodObject<{
            status: z.ZodLiteral<"known">;
            asOf: z.ZodISODateTime;
            remainingSeconds: z.ZodNumber;
            limitSeconds: z.ZodNumber;
            shareLimitSeconds: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"unknown">;
            reason: z.ZodEnum<{
                source_unavailable: "source_unavailable";
                usage_pending: "usage_pending";
                authority_unavailable: "authority_unavailable";
            }>;
        }, z.core.$strict>], "status">;
    }, z.core.$strict>;
    done: z.ZodBoolean;
    remainingSeconds: z.ZodNumber;
    ok: z.ZodLiteral<true>;
    requestId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"revisions_read">;
    sessionRef: z.ZodString;
    asOfRevision: z.ZodNumber;
    revisions: z.ZodArray<z.ZodObject<{
        sequence: z.ZodNumber;
        appliedAt: z.ZodISODateTime;
        effectiveFromSeconds: z.ZodNumber;
        segments: z.ZodArray<z.ZodObject<{
            segmentId: z.ZodString;
            stepId: z.ZodOptional<z.ZodString>;
            offsetSeconds: z.ZodNumber;
            durationSeconds: z.ZodNumber;
        }, z.core.$strict>>;
        totalSeconds: z.ZodNumber;
        decisionCodes: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    nextAfterSequence: z.ZodNullable<z.ZodNumber>;
    ok: z.ZodLiteral<true>;
    requestId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"mint">;
    sessionRef: z.ZodString;
    issuedAt: z.ZodISODateTime;
    expiresAt: z.ZodISODateTime;
    connection: z.ZodDiscriminatedUnion<[z.ZodObject<{
        transport: z.ZodLiteral<"webrtc">;
        conversationToken: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        transport: z.ZodLiteral<"websocket">;
        signedUrl: z.ZodURL;
    }, z.core.$strict>], "transport">;
    ok: z.ZodLiteral<true>;
    requestId: z.ZodString;
}, z.core.$strict>], "action">;
export type CoachBrowserResult = z.infer<typeof CoachBrowserResultSchema>;
/** Correlation only, after trusted server access and source validation; refs do not prove ownership. */
export declare function isCoachBrowserResultForRequest(rawResult: unknown, rawRequest: unknown): boolean;
export declare function projectCoachBrowserBudget(raw: unknown): CoachBrowserBudget;
/** Resolve and authorize the ref first, then validate the full canonical read before projecting. */
export declare function projectCoachBrowserSession(raw: unknown, trustedSessionRef: unknown): CoachBrowserSession;
/** Validate the full Native reply against the server's original mint and current binding before disclosure. Never log/store/cache. */
export declare function projectCoachBrowserMint(rawRequest: unknown, rawResult: unknown, trustedNativeRequest: unknown, trustedBinding: unknown, trustedSessionRef: unknown, now: Date): CoachBrowserResult | null;
/** BFF resolves authenticated Clerk person and current program/session authority, and rechecks after awaits. */
export declare const coachBrowserContract: {
    readonly method: "POST";
    readonly path: "/api/coach";
    readonly authType: "forge_session";
    readonly cacheControl: "no-store";
    readonly bodySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        action: z.ZodLiteral<"person_program_read">;
        requestId: z.ZodString;
        programRef: z.ZodString;
        after: z.ZodNullable<z.ZodString>;
        limit: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"open">;
        requestId: z.ZodString;
        programRef: z.ZodString;
        channel: z.ZodEnum<{
            text: "text";
            native: "native";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"session_read">;
        requestId: z.ZodString;
        sessionRef: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        afterSequence: z.ZodNumber;
        limit: z.ZodNumber;
        requestId: z.ZodString;
        sessionRef: z.ZodString;
        expectedRevision: z.ZodNumber;
        action: z.ZodLiteral<"revisions_read">;
    }, z.core.$strict>, z.ZodObject<{
        input: z.ZodObject<{
            kind: z.ZodString;
            payload: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
        }, z.core.$strict>;
        requestId: z.ZodString;
        sessionRef: z.ZodString;
        expectedRevision: z.ZodNumber;
        action: z.ZodLiteral<"conversation_input">;
    }, z.core.$strict>, z.ZodObject<{
        requestId: z.ZodString;
        sessionRef: z.ZodString;
        expectedRevision: z.ZodNumber;
        action: z.ZodLiteral<"execution_start">;
    }, z.core.$strict>, z.ZodObject<{
        event: z.ZodObject<{
            kind: z.ZodString;
            payload: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
        }, z.core.$strict>;
        requestId: z.ZodString;
        sessionRef: z.ZodString;
        expectedRevision: z.ZodNumber;
        action: z.ZodLiteral<"execution_event">;
    }, z.core.$strict>, z.ZodObject<{
        requestId: z.ZodString;
        sessionRef: z.ZodString;
        expectedRevision: z.ZodNumber;
        action: z.ZodLiteral<"guide_end">;
    }, z.core.$strict>, z.ZodObject<{
        conclusion: z.ZodNullable<z.ZodObject<{
            kind: z.ZodString;
            payload: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
        }, z.core.$strict>>;
        requestId: z.ZodString;
        sessionRef: z.ZodString;
        expectedRevision: z.ZodNumber;
        action: z.ZodLiteral<"session_close">;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"mint">;
        requestId: z.ZodString;
        sessionRef: z.ZodString;
        transport: z.ZodEnum<{
            websocket: "websocket";
            webrtc: "webrtc";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"conversation_bind">;
        requestId: z.ZodString;
        sessionRef: z.ZodString;
        providerConversationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"execution_attach">;
        requestId: z.ZodString;
        sessionRef: z.ZodString;
    }, z.core.$strict>], "action">;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        action: z.ZodLiteral<"person_program_read">;
        programRef: z.ZodString;
        observedAt: z.ZodISODateTime;
        personState: z.ZodNullable<z.ZodObject<{
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
        }, z.core.$strict>>;
        budget: z.ZodDiscriminatedUnion<[z.ZodObject<{
            status: z.ZodLiteral<"known">;
            asOf: z.ZodISODateTime;
            remainingSeconds: z.ZodNumber;
            limitSeconds: z.ZodNumber;
            shareLimitSeconds: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"unknown">;
            reason: z.ZodEnum<{
                source_unavailable: "source_unavailable";
                usage_pending: "usage_pending";
                authority_unavailable: "authority_unavailable";
            }>;
        }, z.core.$strict>], "status">;
        sessions: z.ZodArray<z.ZodObject<{
            sessionRef: z.ZodString;
            revision: z.ZodNumber;
            lifecycle: z.ZodEnum<{
                opened: "opened";
                executing: "executing";
                execution_ended: "execution_ended";
                closed: "closed";
            }>;
            openedAt: z.ZodISODateTime;
            projection: z.ZodNullable<z.ZodObject<{
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
            }, z.core.$strict>>;
            execution: z.ZodNullable<z.ZodObject<{
                startedAt: z.ZodISODateTime;
                segments: z.ZodArray<z.ZodObject<{
                    segmentId: z.ZodString;
                    stepId: z.ZodOptional<z.ZodString>;
                    offsetSeconds: z.ZodNumber;
                    durationSeconds: z.ZodNumber;
                }, z.core.$strict>>;
                totalSeconds: z.ZodNumber;
                decisionCodes: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            latestRevision: z.ZodNullable<z.ZodObject<{
                sequence: z.ZodNumber;
                appliedAt: z.ZodISODateTime;
                effectiveFromSeconds: z.ZodNumber;
                segments: z.ZodArray<z.ZodObject<{
                    segmentId: z.ZodString;
                    stepId: z.ZodOptional<z.ZodString>;
                    offsetSeconds: z.ZodNumber;
                    durationSeconds: z.ZodNumber;
                }, z.core.$strict>>;
                totalSeconds: z.ZodNumber;
                decisionCodes: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            practice: z.ZodNullable<z.ZodObject<{
                startedAt: z.ZodISODateTime;
                endedAt: z.ZodISODateTime;
                guidedSeconds: z.ZodNumber;
                wakeSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            accounting: z.ZodNullable<z.ZodObject<{
                outcome: z.ZodEnum<{
                    completed: "completed";
                    abandoned: "abandoned";
                    interrupted: "interrupted";
                }>;
                progressionCredit: z.ZodBoolean;
            }, z.core.$strict>>;
            measureDefinitions: z.ZodArray<z.ZodObject<{
                measureId: z.ZodString;
                version: z.ZodString;
                unit: z.ZodString;
                min: z.ZodNumber;
                max: z.ZodNumber;
            }, z.core.$strict>>;
            measures: z.ZodArray<z.ZodObject<{
                measureId: z.ZodString;
                definitionVersion: z.ZodString;
                unit: z.ZodString;
                observedAt: z.ZodISODateTime;
                value: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"known">;
                    value: z.ZodNumber;
                    confidence: z.ZodNullable<z.ZodNumber>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"unknown">;
                    reason: z.ZodString;
                }, z.core.$strict>], "kind">;
            }, z.core.$strict>>;
            budget: z.ZodDiscriminatedUnion<[z.ZodObject<{
                status: z.ZodLiteral<"known">;
                asOf: z.ZodISODateTime;
                remainingSeconds: z.ZodNumber;
                limitSeconds: z.ZodNumber;
                shareLimitSeconds: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"unknown">;
                reason: z.ZodEnum<{
                    source_unavailable: "source_unavailable";
                    usage_pending: "usage_pending";
                    authority_unavailable: "authority_unavailable";
                }>;
            }, z.core.$strict>], "status">;
        }, z.core.$strict>>;
        nextCursor: z.ZodNullable<z.ZodString>;
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"open">;
        programRef: z.ZodString;
        channel: z.ZodEnum<{
            text: "text";
            native: "native";
        }>;
        session: z.ZodObject<{
            sessionRef: z.ZodString;
            revision: z.ZodNumber;
            lifecycle: z.ZodEnum<{
                opened: "opened";
                executing: "executing";
                execution_ended: "execution_ended";
                closed: "closed";
            }>;
            openedAt: z.ZodISODateTime;
            projection: z.ZodNullable<z.ZodObject<{
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
            }, z.core.$strict>>;
            execution: z.ZodNullable<z.ZodObject<{
                startedAt: z.ZodISODateTime;
                segments: z.ZodArray<z.ZodObject<{
                    segmentId: z.ZodString;
                    stepId: z.ZodOptional<z.ZodString>;
                    offsetSeconds: z.ZodNumber;
                    durationSeconds: z.ZodNumber;
                }, z.core.$strict>>;
                totalSeconds: z.ZodNumber;
                decisionCodes: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            latestRevision: z.ZodNullable<z.ZodObject<{
                sequence: z.ZodNumber;
                appliedAt: z.ZodISODateTime;
                effectiveFromSeconds: z.ZodNumber;
                segments: z.ZodArray<z.ZodObject<{
                    segmentId: z.ZodString;
                    stepId: z.ZodOptional<z.ZodString>;
                    offsetSeconds: z.ZodNumber;
                    durationSeconds: z.ZodNumber;
                }, z.core.$strict>>;
                totalSeconds: z.ZodNumber;
                decisionCodes: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            practice: z.ZodNullable<z.ZodObject<{
                startedAt: z.ZodISODateTime;
                endedAt: z.ZodISODateTime;
                guidedSeconds: z.ZodNumber;
                wakeSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            accounting: z.ZodNullable<z.ZodObject<{
                outcome: z.ZodEnum<{
                    completed: "completed";
                    abandoned: "abandoned";
                    interrupted: "interrupted";
                }>;
                progressionCredit: z.ZodBoolean;
            }, z.core.$strict>>;
            measureDefinitions: z.ZodArray<z.ZodObject<{
                measureId: z.ZodString;
                version: z.ZodString;
                unit: z.ZodString;
                min: z.ZodNumber;
                max: z.ZodNumber;
            }, z.core.$strict>>;
            measures: z.ZodArray<z.ZodObject<{
                measureId: z.ZodString;
                definitionVersion: z.ZodString;
                unit: z.ZodString;
                observedAt: z.ZodISODateTime;
                value: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"known">;
                    value: z.ZodNumber;
                    confidence: z.ZodNullable<z.ZodNumber>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"unknown">;
                    reason: z.ZodString;
                }, z.core.$strict>], "kind">;
            }, z.core.$strict>>;
            budget: z.ZodDiscriminatedUnion<[z.ZodObject<{
                status: z.ZodLiteral<"known">;
                asOf: z.ZodISODateTime;
                remainingSeconds: z.ZodNumber;
                limitSeconds: z.ZodNumber;
                shareLimitSeconds: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"unknown">;
                reason: z.ZodEnum<{
                    source_unavailable: "source_unavailable";
                    usage_pending: "usage_pending";
                    authority_unavailable: "authority_unavailable";
                }>;
            }, z.core.$strict>], "status">;
        }, z.core.$strict>;
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodEnum<{
            session_read: "session_read";
            conversation_input: "conversation_input";
            execution_start: "execution_start";
            execution_event: "execution_event";
            session_close: "session_close";
            conversation_bind: "conversation_bind";
            execution_attach: "execution_attach";
        }>;
        session: z.ZodObject<{
            sessionRef: z.ZodString;
            revision: z.ZodNumber;
            lifecycle: z.ZodEnum<{
                opened: "opened";
                executing: "executing";
                execution_ended: "execution_ended";
                closed: "closed";
            }>;
            openedAt: z.ZodISODateTime;
            projection: z.ZodNullable<z.ZodObject<{
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
            }, z.core.$strict>>;
            execution: z.ZodNullable<z.ZodObject<{
                startedAt: z.ZodISODateTime;
                segments: z.ZodArray<z.ZodObject<{
                    segmentId: z.ZodString;
                    stepId: z.ZodOptional<z.ZodString>;
                    offsetSeconds: z.ZodNumber;
                    durationSeconds: z.ZodNumber;
                }, z.core.$strict>>;
                totalSeconds: z.ZodNumber;
                decisionCodes: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            latestRevision: z.ZodNullable<z.ZodObject<{
                sequence: z.ZodNumber;
                appliedAt: z.ZodISODateTime;
                effectiveFromSeconds: z.ZodNumber;
                segments: z.ZodArray<z.ZodObject<{
                    segmentId: z.ZodString;
                    stepId: z.ZodOptional<z.ZodString>;
                    offsetSeconds: z.ZodNumber;
                    durationSeconds: z.ZodNumber;
                }, z.core.$strict>>;
                totalSeconds: z.ZodNumber;
                decisionCodes: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            practice: z.ZodNullable<z.ZodObject<{
                startedAt: z.ZodISODateTime;
                endedAt: z.ZodISODateTime;
                guidedSeconds: z.ZodNumber;
                wakeSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            accounting: z.ZodNullable<z.ZodObject<{
                outcome: z.ZodEnum<{
                    completed: "completed";
                    abandoned: "abandoned";
                    interrupted: "interrupted";
                }>;
                progressionCredit: z.ZodBoolean;
            }, z.core.$strict>>;
            measureDefinitions: z.ZodArray<z.ZodObject<{
                measureId: z.ZodString;
                version: z.ZodString;
                unit: z.ZodString;
                min: z.ZodNumber;
                max: z.ZodNumber;
            }, z.core.$strict>>;
            measures: z.ZodArray<z.ZodObject<{
                measureId: z.ZodString;
                definitionVersion: z.ZodString;
                unit: z.ZodString;
                observedAt: z.ZodISODateTime;
                value: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"known">;
                    value: z.ZodNumber;
                    confidence: z.ZodNullable<z.ZodNumber>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"unknown">;
                    reason: z.ZodString;
                }, z.core.$strict>], "kind">;
            }, z.core.$strict>>;
            budget: z.ZodDiscriminatedUnion<[z.ZodObject<{
                status: z.ZodLiteral<"known">;
                asOf: z.ZodISODateTime;
                remainingSeconds: z.ZodNumber;
                limitSeconds: z.ZodNumber;
                shareLimitSeconds: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"unknown">;
                reason: z.ZodEnum<{
                    source_unavailable: "source_unavailable";
                    usage_pending: "usage_pending";
                    authority_unavailable: "authority_unavailable";
                }>;
            }, z.core.$strict>], "status">;
        }, z.core.$strict>;
        decisionCodes: z.ZodArray<z.ZodString>;
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"guide_end">;
        session: z.ZodObject<{
            sessionRef: z.ZodString;
            revision: z.ZodNumber;
            lifecycle: z.ZodEnum<{
                opened: "opened";
                executing: "executing";
                execution_ended: "execution_ended";
                closed: "closed";
            }>;
            openedAt: z.ZodISODateTime;
            projection: z.ZodNullable<z.ZodObject<{
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
            }, z.core.$strict>>;
            execution: z.ZodNullable<z.ZodObject<{
                startedAt: z.ZodISODateTime;
                segments: z.ZodArray<z.ZodObject<{
                    segmentId: z.ZodString;
                    stepId: z.ZodOptional<z.ZodString>;
                    offsetSeconds: z.ZodNumber;
                    durationSeconds: z.ZodNumber;
                }, z.core.$strict>>;
                totalSeconds: z.ZodNumber;
                decisionCodes: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            latestRevision: z.ZodNullable<z.ZodObject<{
                sequence: z.ZodNumber;
                appliedAt: z.ZodISODateTime;
                effectiveFromSeconds: z.ZodNumber;
                segments: z.ZodArray<z.ZodObject<{
                    segmentId: z.ZodString;
                    stepId: z.ZodOptional<z.ZodString>;
                    offsetSeconds: z.ZodNumber;
                    durationSeconds: z.ZodNumber;
                }, z.core.$strict>>;
                totalSeconds: z.ZodNumber;
                decisionCodes: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            practice: z.ZodNullable<z.ZodObject<{
                startedAt: z.ZodISODateTime;
                endedAt: z.ZodISODateTime;
                guidedSeconds: z.ZodNumber;
                wakeSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            accounting: z.ZodNullable<z.ZodObject<{
                outcome: z.ZodEnum<{
                    completed: "completed";
                    abandoned: "abandoned";
                    interrupted: "interrupted";
                }>;
                progressionCredit: z.ZodBoolean;
            }, z.core.$strict>>;
            measureDefinitions: z.ZodArray<z.ZodObject<{
                measureId: z.ZodString;
                version: z.ZodString;
                unit: z.ZodString;
                min: z.ZodNumber;
                max: z.ZodNumber;
            }, z.core.$strict>>;
            measures: z.ZodArray<z.ZodObject<{
                measureId: z.ZodString;
                definitionVersion: z.ZodString;
                unit: z.ZodString;
                observedAt: z.ZodISODateTime;
                value: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"known">;
                    value: z.ZodNumber;
                    confidence: z.ZodNullable<z.ZodNumber>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"unknown">;
                    reason: z.ZodString;
                }, z.core.$strict>], "kind">;
            }, z.core.$strict>>;
            budget: z.ZodDiscriminatedUnion<[z.ZodObject<{
                status: z.ZodLiteral<"known">;
                asOf: z.ZodISODateTime;
                remainingSeconds: z.ZodNumber;
                limitSeconds: z.ZodNumber;
                shareLimitSeconds: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"unknown">;
                reason: z.ZodEnum<{
                    source_unavailable: "source_unavailable";
                    usage_pending: "usage_pending";
                    authority_unavailable: "authority_unavailable";
                }>;
            }, z.core.$strict>], "status">;
        }, z.core.$strict>;
        done: z.ZodBoolean;
        remainingSeconds: z.ZodNumber;
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"revisions_read">;
        sessionRef: z.ZodString;
        asOfRevision: z.ZodNumber;
        revisions: z.ZodArray<z.ZodObject<{
            sequence: z.ZodNumber;
            appliedAt: z.ZodISODateTime;
            effectiveFromSeconds: z.ZodNumber;
            segments: z.ZodArray<z.ZodObject<{
                segmentId: z.ZodString;
                stepId: z.ZodOptional<z.ZodString>;
                offsetSeconds: z.ZodNumber;
                durationSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            totalSeconds: z.ZodNumber;
            decisionCodes: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        nextAfterSequence: z.ZodNullable<z.ZodNumber>;
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"mint">;
        sessionRef: z.ZodString;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
        connection: z.ZodDiscriminatedUnion<[z.ZodObject<{
            transport: z.ZodLiteral<"webrtc">;
            conversationToken: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            transport: z.ZodLiteral<"websocket">;
            signedUrl: z.ZodURL;
        }, z.core.$strict>], "transport">;
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
    }, z.core.$strict>], "action">;
    readonly errorSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            idempotency_conflict: "idempotency_conflict";
            source_unavailable: "source_unavailable";
            budget_exhausted: "budget_exhausted";
            not_found: "not_found";
            program_not_found: "program_not_found";
            scope_mismatch: "scope_mismatch";
            authority_unavailable: "authority_unavailable";
            unauthorized: "unauthorized";
            strategy_unavailable: "strategy_unavailable";
            stale_revision: "stale_revision";
            stale_program_version: "stale_program_version";
            budget_unavailable: "budget_unavailable";
        }>;
        currentRevision: z.ZodOptional<z.ZodNumber>;
        currentProgramVersion: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    readonly errorStatus: {
        readonly invalid_request: 400;
        readonly unauthorized: 401;
        readonly scope_mismatch: 403;
        readonly not_found: 404;
        readonly program_not_found: 404;
        readonly strategy_unavailable: 422;
        readonly stale_revision: 409;
        readonly stale_program_version: 409;
        readonly idempotency_conflict: 409;
        readonly budget_exhausted: 429;
        readonly budget_unavailable: 503;
        readonly authority_unavailable: 503;
        readonly source_unavailable: 503;
    };
};
//# sourceMappingURL=coach-browser.d.ts.map