import { z } from 'zod';
/**
 * cap-coach (R6, v1.31.0) — generic coaching engine: programs, sessions, progress and minute budget.
 *
 * - Programs (meditation, training, …) are PROJECT content stored in the coach format, one set per agent.
 * - Person data (profile, sessions, progress, budget) is isolated by tenant/owner/agent/person; a payload that mixes
 *   scopes is rejected. Conversational memory stays in X9 memory; cap-coach holds the structured data only.
 * - Session writes are idempotent by `idempotencyKey` (replayed callbacks are recorded once).
 * - UI and web apps belong to the project, not to this engine.
 */
export declare const CoachAgentScopeSchema: z.ZodObject<{
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
}, z.core.$strict>;
export declare const CoachPersonScopeSchema: z.ZodObject<{
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strict>;
export type CoachPersonScope = z.infer<typeof CoachPersonScopeSchema>;
export declare const CoachProgramIdSchema: z.ZodString;
/** Kind of program: meditation, training, … (open slug). */
export declare const CoachProgramKindSchema: z.ZodString;
export declare const CoachStepIdSchema: z.ZodString;
export declare const CoachStepSchema: z.ZodObject<{
    stepId: z.ZodString;
    order: z.ZodNumber;
    title: z.ZodString;
    durationMinutes: z.ZodOptional<z.ZodNumber>;
    technique: z.ZodOptional<z.ZodString>;
    instructions: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type CoachStep = z.infer<typeof CoachStepSchema>;
export declare const CoachProgramSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    programId: z.ZodString;
    kind: z.ZodString;
    title: z.ZodString;
    locale: z.ZodString;
    version: z.ZodNumber;
    steps: z.ZodArray<z.ZodObject<{
        stepId: z.ZodString;
        order: z.ZodNumber;
        title: z.ZodString;
        durationMinutes: z.ZodOptional<z.ZodNumber>;
        technique: z.ZodOptional<z.ZodString>;
        instructions: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CoachProgram = z.infer<typeof CoachProgramSchema>;
export declare const CoachPersonProfileSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strict>;
    displayName: z.ZodOptional<z.ZodString>;
    locale: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    preferences: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>;
    version: z.ZodNumber;
    updatedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type CoachPersonProfile = z.infer<typeof CoachPersonProfileSchema>;
export declare const CoachSessionStatusSchema: z.ZodEnum<{
    "in-progress": "in-progress";
    completed: "completed";
    scheduled: "scheduled";
    abandoned: "abandoned";
}>;
export type CoachSessionStatus = z.infer<typeof CoachSessionStatusSchema>;
export declare const CoachSessionSchema: z.ZodObject<{
    sessionId: z.ZodString;
    idempotencyKey: z.ZodString;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strict>;
    programId: z.ZodOptional<z.ZodString>;
    stepId: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        "in-progress": "in-progress";
        completed: "completed";
        scheduled: "scheduled";
        abandoned: "abandoned";
    }>;
    plannedMinutes: z.ZodNumber;
    startedAt: z.ZodNullable<z.ZodISODateTime>;
    endedAt: z.ZodNullable<z.ZodISODateTime>;
    actualMinutes: z.ZodNullable<z.ZodNumber>;
    channel: z.ZodOptional<z.ZodUnion<[z.ZodEnum<{
        email: "email";
        voice: "voice";
        telegram: "telegram";
        whatsapp: "whatsapp";
    }>, z.ZodLiteral<"web">]>>;
}, z.core.$strict>;
export type CoachSession = z.infer<typeof CoachSessionSchema>;
/** Usage scores 0–100 over a short and a long window (definition owned by cap-coach, versioned with it). */
export declare const CoachUsageScoresSchema: z.ZodObject<{
    shortTerm: z.ZodNumber;
    longTerm: z.ZodNumber;
}, z.core.$strict>;
export type CoachUsageScores = z.infer<typeof CoachUsageScoresSchema>;
export declare const CoachProgressSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strict>;
    programId: z.ZodString;
    completedStepIds: z.ZodArray<z.ZodString>;
    sessionsCompleted: z.ZodNumber;
    minutesTotal: z.ZodNumber;
    streakDays: z.ZodNumber;
    lastSessionAt: z.ZodNullable<z.ZodISODateTime>;
    usageScores: z.ZodOptional<z.ZodObject<{
        shortTerm: z.ZodNumber;
        longTerm: z.ZodNumber;
    }, z.core.$strict>>;
    updatedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type CoachProgress = z.infer<typeof CoachProgressSchema>;
export declare const CoachBudgetPeriodSchema: z.ZodEnum<{
    day: "day";
    week: "week";
    month: "month";
}>;
export type CoachBudgetPeriod = z.infer<typeof CoachBudgetPeriodSchema>;
export declare const CoachMinuteBudgetSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strict>;
    period: z.ZodEnum<{
        day: "day";
        week: "week";
        month: "month";
    }>;
    periodStart: z.ZodISODateTime;
    timezone: z.ZodString;
    limitMinutes: z.ZodNumber;
    usedMinutes: z.ZodNumber;
}, z.core.$strict>;
export type CoachMinuteBudget = z.infer<typeof CoachMinuteBudgetSchema>;
export declare function coachRemainingMinutes(budget: CoachMinuteBudget): number;
/** Everything cap-coach holds about ONE person of ONE agent. */
export declare const CoachPersonSnapshotSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strict>;
    profile: z.ZodNullable<z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        displayName: z.ZodOptional<z.ZodString>;
        locale: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
        preferences: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>;
        version: z.ZodNumber;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    progress: z.ZodArray<z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        programId: z.ZodString;
        completedStepIds: z.ZodArray<z.ZodString>;
        sessionsCompleted: z.ZodNumber;
        minutesTotal: z.ZodNumber;
        streakDays: z.ZodNumber;
        lastSessionAt: z.ZodNullable<z.ZodISODateTime>;
        usageScores: z.ZodOptional<z.ZodObject<{
            shortTerm: z.ZodNumber;
            longTerm: z.ZodNumber;
        }, z.core.$strict>>;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    budget: z.ZodNullable<z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        period: z.ZodEnum<{
            day: "day";
            week: "week";
            month: "month";
        }>;
        periodStart: z.ZodISODateTime;
        timezone: z.ZodString;
        limitMinutes: z.ZodNumber;
        usedMinutes: z.ZodNumber;
    }, z.core.$strict>>;
    recentSessions: z.ZodArray<z.ZodObject<{
        sessionId: z.ZodString;
        idempotencyKey: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        programId: z.ZodOptional<z.ZodString>;
        stepId: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<{
            "in-progress": "in-progress";
            completed: "completed";
            scheduled: "scheduled";
            abandoned: "abandoned";
        }>;
        plannedMinutes: z.ZodNumber;
        startedAt: z.ZodNullable<z.ZodISODateTime>;
        endedAt: z.ZodNullable<z.ZodISODateTime>;
        actualMinutes: z.ZodNullable<z.ZodNumber>;
        channel: z.ZodOptional<z.ZodUnion<[z.ZodEnum<{
            email: "email";
            voice: "voice";
            telegram: "telegram";
            whatsapp: "whatsapp";
        }>, z.ZodLiteral<"web">]>>;
    }, z.core.$strict>>;
}, z.core.$strip>;
export type CoachPersonSnapshot = z.infer<typeof CoachPersonSnapshotSchema>;
export declare const CoachSessionRecordResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    replayed: z.ZodBoolean;
    session: z.ZodObject<{
        sessionId: z.ZodString;
        idempotencyKey: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        programId: z.ZodOptional<z.ZodString>;
        stepId: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<{
            "in-progress": "in-progress";
            completed: "completed";
            scheduled: "scheduled";
            abandoned: "abandoned";
        }>;
        plannedMinutes: z.ZodNumber;
        startedAt: z.ZodNullable<z.ZodISODateTime>;
        endedAt: z.ZodNullable<z.ZodISODateTime>;
        actualMinutes: z.ZodNullable<z.ZodNumber>;
        channel: z.ZodOptional<z.ZodUnion<[z.ZodEnum<{
            email: "email";
            voice: "voice";
            telegram: "telegram";
            whatsapp: "whatsapp";
        }>, z.ZodLiteral<"web">]>>;
    }, z.core.$strict>;
    progress: z.ZodOptional<z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        programId: z.ZodString;
        completedStepIds: z.ZodArray<z.ZodString>;
        sessionsCompleted: z.ZodNumber;
        minutesTotal: z.ZodNumber;
        streakDays: z.ZodNumber;
        lastSessionAt: z.ZodNullable<z.ZodISODateTime>;
        usageScores: z.ZodOptional<z.ZodObject<{
            shortTerm: z.ZodNumber;
            longTerm: z.ZodNumber;
        }, z.core.$strict>>;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    budget: z.ZodOptional<z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        period: z.ZodEnum<{
            day: "day";
            week: "week";
            month: "month";
        }>;
        periodStart: z.ZodISODateTime;
        timezone: z.ZodString;
        limitMinutes: z.ZodNumber;
        usedMinutes: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strip>;
export type CoachSessionRecordResult = z.infer<typeof CoachSessionRecordResultSchema>;
export declare const CoachRouteErrorCodeSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    idempotency_conflict: "idempotency_conflict";
    budget_exhausted: "budget_exhausted";
    stale_version: "stale_version";
    agent_mismatch: "agent_mismatch";
    person_mismatch: "person_mismatch";
    not_found: "not_found";
    program_not_found: "program_not_found";
}>;
export type CoachRouteErrorCode = z.infer<typeof CoachRouteErrorCodeSchema>;
export declare const CoachRouteErrorSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        invalid_request: "invalid_request";
        idempotency_conflict: "idempotency_conflict";
        budget_exhausted: "budget_exhausted";
        stale_version: "stale_version";
        agent_mismatch: "agent_mismatch";
        person_mismatch: "person_mismatch";
        not_found: "not_found";
        program_not_found: "program_not_found";
    }>;
    currentVersion: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type CoachRouteError = z.infer<typeof CoachRouteErrorSchema>;
//# sourceMappingURL=index.d.ts.map