import { z } from 'zod';
/**
 * cap-coach per-agent routes (R6, v1.31.0). Direction: Forge / project apps via X9 -> cap-coach.
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), like the other `/internal/capability/agents/:agentId/*` routes.
 *
 * - `PUT  .../coach/programs/:programId` — save a program (project content); 200 `AgentConfigSavedSchema`,
 *   409 stale_version when the version does not move forward.
 * - `POST .../coach/sessions` — record a session, idempotent by `idempotencyKey`.
 * - `GET  .../coach/people/:userId` — one person's profile, progress, budget and recent sessions.
 *
 * Errors: `CoachRouteErrorSchema` (400 invalid_request / agent_mismatch / person_mismatch, 404 not_found /
 * program_not_found, 409 idempotency_conflict / stale_version, 429 budget_exhausted).
 */
export declare const CoachProgramParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
    programId: z.ZodString;
}, z.core.$strip>;
export declare const CoachPersonParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const coachProgramPutContract: {
    readonly method: "PUT";
    readonly path: "/internal/capability/agents/:agentId/coach/programs/:programId";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        programId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
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
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        version: z.ZodNumber;
    }, z.core.$strict>;
};
export declare const coachProgramGetContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/coach/programs/:programId";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        programId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
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
};
export declare const coachSessionRecordContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/coach/sessions";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
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
            telegram: "telegram";
            voice: "voice";
            whatsapp: "whatsapp";
        }>, z.ZodLiteral<"web">]>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
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
                telegram: "telegram";
                voice: "voice";
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
};
export declare const coachPersonSnapshotContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/coach/people/:userId";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
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
                telegram: "telegram";
                voice: "voice";
                whatsapp: "whatsapp";
            }>, z.ZodLiteral<"web">]>>;
        }, z.core.$strict>>;
    }, z.core.$strip>;
};
export declare function capCoachProgramPath(agentId: string, programId: string): string;
export declare function capCoachSessionsPath(agentId: string): string;
export declare function capCoachPersonPath(agentId: string, userId: string): string;
//# sourceMappingURL=internal-capability-coach.d.ts.map