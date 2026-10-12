import { z } from 'zod';
export declare const coachProgramApplyContract: {
    readonly method: "PUT";
    readonly path: "/internal/capability/agents/:agentId/coach/v2/programs/:programId/revisions/:programVersion";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        programId: z.ZodString;
        programVersion: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        expectedProgramVersion: z.ZodNullable<z.ZodNumber>;
        program: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            programId: z.ZodString;
            programVersion: z.ZodNumber;
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            catalogRevision: z.ZodString;
            policyRevision: z.ZodString;
            progressionRevision: z.ZodString;
            measureDefinitionRevision: z.ZodString;
        }, z.core.$strict>;
        definition: z.ZodObject<{
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
        requestId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        program: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            programId: z.ZodString;
            programVersion: z.ZodNumber;
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            catalogRevision: z.ZodString;
            policyRevision: z.ZodString;
            progressionRevision: z.ZodString;
            measureDefinitionRevision: z.ZodString;
        }, z.core.$strict>;
        definition: z.ZodObject<{
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
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        replayed: z.ZodBoolean;
    }, z.core.$strict>;
    readonly authType: "secret";
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
export declare const coachOpeningContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/coach/v2/openings";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        program: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            programId: z.ZodString;
            programVersion: z.ZodNumber;
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            catalogRevision: z.ZodString;
            policyRevision: z.ZodString;
            progressionRevision: z.ZodString;
            measureDefinitionRevision: z.ZodString;
        }, z.core.$strict>;
        appliedConfigVersion: z.ZodNumber;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        replayed: z.ZodBoolean;
        opening: z.ZodObject<{
            openingId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            appliedConfigVersion: z.ZodNumber;
            openedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        revision: z.ZodNumber;
        budget: z.ZodDiscriminatedUnion<[z.ZodObject<{
            status: z.ZodLiteral<"known">;
            budget: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                windowSeconds: z.ZodNumber;
                asOf: z.ZodISODateTime;
                windowStart: z.ZodISODateTime;
                limitSeconds: z.ZodNumber;
                usedSeconds: z.ZodNumber;
            }, z.core.$strict>;
            quota: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                budgetAsOf: z.ZodISODateTime;
                remainingSeconds: z.ZodNumber;
                shareLimitSeconds: z.ZodNumber;
                limitSeconds: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"unknown">;
            reason: z.ZodEnum<{
                source_unavailable: "source_unavailable";
                usage_pending: "usage_pending";
                authority_unavailable: "authority_unavailable";
            }>;
        }, z.core.$strict>], "status">;
        reservation: z.ZodObject<{
            reservationId: z.ZodString;
            openingId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            version: z.ZodNumber;
            status: z.ZodEnum<{
                uncertain: "uncertain";
                held: "held";
                consumed: "consumed";
                released: "released";
            }>;
            limitSeconds: z.ZodNumber;
            createdAt: z.ZodISODateTime;
            updatedAt: z.ZodISODateTime;
            expiresAt: z.ZodNullable<z.ZodISODateTime>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly authType: "secret";
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
export declare const coachConversationInputContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/coach/v2/sessions/:sessionId/inputs";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        sessionId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        opening: z.ZodObject<{
            openingId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            appliedConfigVersion: z.ZodNumber;
            openedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        expectedRevision: z.ZodNumber;
        input: z.ZodObject<{
            kind: z.ZodString;
            payload: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        draft: z.ZodNullable<z.ZodObject<{
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
        }, z.core.$strict>>;
        decisionCodes: z.ZodArray<z.ZodString>;
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        replayed: z.ZodBoolean;
        opening: z.ZodObject<{
            openingId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            appliedConfigVersion: z.ZodNumber;
            openedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        revision: z.ZodNumber;
    }, z.core.$strict>;
    readonly authType: "secret";
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
export declare const coachExecutionStartContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/coach/v2/sessions/:sessionId/start";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        sessionId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        opening: z.ZodObject<{
            openingId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            appliedConfigVersion: z.ZodNumber;
            openedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        expectedRevision: z.ZodNumber;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        replayed: z.ZodBoolean;
        snapshot: z.ZodObject<{
            startedAt: z.ZodISODateTime;
            segments: z.ZodArray<z.ZodObject<{
                segmentId: z.ZodString;
                stepId: z.ZodOptional<z.ZodString>;
                offsetSeconds: z.ZodNumber;
                durationSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            totalSeconds: z.ZodNumber;
            decisionCodes: z.ZodArray<z.ZodString>;
            snapshotId: z.ZodString;
            opening: z.ZodObject<{
                openingId: z.ZodString;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                sessionId: z.ZodString;
                program: z.ZodObject<{
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    programId: z.ZodString;
                    programVersion: z.ZodNumber;
                    strategy: z.ZodObject<{
                        strategyId: z.ZodString;
                        strategyVersion: z.ZodString;
                    }, z.core.$strict>;
                    catalogRevision: z.ZodString;
                    policyRevision: z.ZodString;
                    progressionRevision: z.ZodString;
                    measureDefinitionRevision: z.ZodString;
                }, z.core.$strict>;
                appliedConfigVersion: z.ZodNumber;
                openedAt: z.ZodISODateTime;
            }, z.core.$strict>;
        }, z.core.$strict>;
        revision: z.ZodNumber;
        projection: z.ZodObject<{
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly authType: "secret";
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
export declare const coachExecutionEventContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/coach/v2/sessions/:sessionId/events";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        sessionId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        opening: z.ZodObject<{
            openingId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            appliedConfigVersion: z.ZodNumber;
            openedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        expectedRevision: z.ZodNumber;
        event: z.ZodObject<{
            kind: z.ZodString;
            payload: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        initialSnapshot: z.ZodNullable<z.ZodObject<{
            startedAt: z.ZodISODateTime;
            segments: z.ZodArray<z.ZodObject<{
                segmentId: z.ZodString;
                stepId: z.ZodOptional<z.ZodString>;
                offsetSeconds: z.ZodNumber;
                durationSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            totalSeconds: z.ZodNumber;
            decisionCodes: z.ZodArray<z.ZodString>;
            snapshotId: z.ZodString;
            opening: z.ZodObject<{
                openingId: z.ZodString;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                sessionId: z.ZodString;
                program: z.ZodObject<{
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    programId: z.ZodString;
                    programVersion: z.ZodNumber;
                    strategy: z.ZodObject<{
                        strategyId: z.ZodString;
                        strategyVersion: z.ZodString;
                    }, z.core.$strict>;
                    catalogRevision: z.ZodString;
                    policyRevision: z.ZodString;
                    progressionRevision: z.ZodString;
                    measureDefinitionRevision: z.ZodString;
                }, z.core.$strict>;
                appliedConfigVersion: z.ZodNumber;
                openedAt: z.ZodISODateTime;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        appliedRevision: z.ZodNullable<z.ZodObject<{
            segments: z.ZodArray<z.ZodObject<{
                segmentId: z.ZodString;
                stepId: z.ZodOptional<z.ZodString>;
                offsetSeconds: z.ZodNumber;
                durationSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            totalSeconds: z.ZodNumber;
            decisionCodes: z.ZodArray<z.ZodString>;
            revisionId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            snapshotId: z.ZodString;
            sequence: z.ZodNumber;
            appliedAt: z.ZodISODateTime;
            effectiveFromSeconds: z.ZodNumber;
        }, z.core.$strict>>;
        projection: z.ZodNullable<z.ZodObject<{
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
        }, z.core.$strict>>;
        decisionCodes: z.ZodArray<z.ZodString>;
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        replayed: z.ZodBoolean;
        opening: z.ZodObject<{
            openingId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            appliedConfigVersion: z.ZodNumber;
            openedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        revision: z.ZodNumber;
    }, z.core.$strict>;
    readonly authType: "secret";
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
export declare const coachGuideEndContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/coach/v2/sessions/:sessionId/end-guide";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        sessionId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        opening: z.ZodObject<{
            openingId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            appliedConfigVersion: z.ZodNumber;
            openedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        expectedRevision: z.ZodNumber;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        done: z.ZodBoolean;
        remainingSeconds: z.ZodNumber;
        practice: z.ZodNullable<z.ZodObject<{
            snapshotId: z.ZodString;
            startedAt: z.ZodISODateTime;
            endedAt: z.ZodISODateTime;
            guidedSeconds: z.ZodNumber;
            wakeSeconds: z.ZodNumber;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            openingId: z.ZodString;
            observationId: z.ZodString;
        }, z.core.$strict>>;
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        replayed: z.ZodBoolean;
        opening: z.ZodObject<{
            openingId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            appliedConfigVersion: z.ZodNumber;
            openedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        revision: z.ZodNumber;
    }, z.core.$strict>;
    readonly authType: "secret";
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
export declare const coachSessionCloseContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/coach/v2/sessions/:sessionId/close";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        sessionId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        opening: z.ZodObject<{
            openingId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            appliedConfigVersion: z.ZodNumber;
            openedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        expectedRevision: z.ZodNumber;
        conclusion: z.ZodNullable<z.ZodObject<{
            kind: z.ZodString;
            payload: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        accounting: z.ZodObject<{
            usage: z.ZodNullable<z.ZodObject<{
                providerConversationId: z.ZodString;
                callStartedAt: z.ZodISODateTime;
                callEndedAt: z.ZodISODateTime;
                billableSeconds: z.ZodNullable<z.ZodNumber>;
                durationSeconds: z.ZodNullable<z.ZodNumber>;
                source: z.ZodEnum<{
                    unavailable: "unavailable";
                    pending: "pending";
                    "provider-report": "provider-report";
                    "transcript-lower-bound": "transcript-lower-bound";
                    estimate: "estimate";
                }>;
                sourceRef: z.ZodNullable<z.ZodString>;
                confidence: z.ZodNullable<z.ZodNumber>;
                observedAt: z.ZodISODateTime;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                sessionId: z.ZodString;
                openingId: z.ZodString;
                snapshotId: z.ZodNullable<z.ZodString>;
                usageId: z.ZodString;
            }, z.core.$strict>>;
            practice: z.ZodNullable<z.ZodObject<{
                snapshotId: z.ZodString;
                startedAt: z.ZodISODateTime;
                endedAt: z.ZodISODateTime;
                guidedSeconds: z.ZodNumber;
                wakeSeconds: z.ZodNumber;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                sessionId: z.ZodString;
                openingId: z.ZodString;
                observationId: z.ZodString;
            }, z.core.$strict>>;
            outcome: z.ZodEnum<{
                completed: "completed";
                abandoned: "abandoned";
                interrupted: "interrupted";
            }>;
            progressionCredit: z.ZodBoolean;
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            openingId: z.ZodString;
            snapshotId: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        measures: z.ZodArray<z.ZodObject<{
            observationId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            openingId: z.ZodString;
            snapshotId: z.ZodNullable<z.ZodString>;
            measureId: z.ZodString;
            definitionVersion: z.ZodString;
            unit: z.ZodString;
            observedAt: z.ZodISODateTime;
            provenance: z.ZodDiscriminatedUnion<[z.ZodObject<{
                sourceRef: z.ZodString;
                source: z.ZodLiteral<"server-clock">;
            }, z.core.$strict>, z.ZodObject<{
                sourceRef: z.ZodString;
                source: z.ZodLiteral<"self-report">;
            }, z.core.$strict>, z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
                sourceRef: z.ZodString;
                source: z.ZodLiteral<"strategy">;
            }, z.core.$strict>], "source">;
            value: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"known">;
                value: z.ZodNumber;
                confidence: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"unknown">;
                reason: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>>;
        projection: z.ZodNullable<z.ZodObject<{
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
        }, z.core.$strict>>;
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        replayed: z.ZodBoolean;
        opening: z.ZodObject<{
            openingId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            appliedConfigVersion: z.ZodNumber;
            openedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        revision: z.ZodNumber;
    }, z.core.$strict>;
    readonly authType: "secret";
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
export declare const coachUsageObserveContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/coach/v2/sessions/:sessionId/usage";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        sessionId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        opening: z.ZodObject<{
            openingId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            appliedConfigVersion: z.ZodNumber;
            openedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        expectedUsageRevision: z.ZodNullable<z.ZodNumber>;
        observation: z.ZodObject<{
            providerConversationId: z.ZodString;
            callStartedAt: z.ZodISODateTime;
            callEndedAt: z.ZodISODateTime;
            billableSeconds: z.ZodNullable<z.ZodNumber>;
            durationSeconds: z.ZodNullable<z.ZodNumber>;
            source: z.ZodEnum<{
                unavailable: "unavailable";
                pending: "pending";
                "provider-report": "provider-report";
                "transcript-lower-bound": "transcript-lower-bound";
                estimate: "estimate";
            }>;
            sourceRef: z.ZodNullable<z.ZodString>;
            confidence: z.ZodNullable<z.ZodNumber>;
            observedAt: z.ZodISODateTime;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            openingId: z.ZodString;
            snapshotId: z.ZodNullable<z.ZodString>;
            usageId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        replayed: z.ZodBoolean;
        usage: z.ZodObject<{
            providerConversationId: z.ZodString;
            callStartedAt: z.ZodISODateTime;
            callEndedAt: z.ZodISODateTime;
            billableSeconds: z.ZodNullable<z.ZodNumber>;
            durationSeconds: z.ZodNullable<z.ZodNumber>;
            source: z.ZodEnum<{
                unavailable: "unavailable";
                pending: "pending";
                "provider-report": "provider-report";
                "transcript-lower-bound": "transcript-lower-bound";
                estimate: "estimate";
            }>;
            sourceRef: z.ZodNullable<z.ZodString>;
            confidence: z.ZodNullable<z.ZodNumber>;
            observedAt: z.ZodISODateTime;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            openingId: z.ZodString;
            snapshotId: z.ZodNullable<z.ZodString>;
            usageId: z.ZodString;
        }, z.core.$strict>;
        usageRevision: z.ZodNumber;
        budget: z.ZodDiscriminatedUnion<[z.ZodObject<{
            status: z.ZodLiteral<"known">;
            budget: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                windowSeconds: z.ZodNumber;
                asOf: z.ZodISODateTime;
                windowStart: z.ZodISODateTime;
                limitSeconds: z.ZodNumber;
                usedSeconds: z.ZodNumber;
            }, z.core.$strict>;
            quota: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                budgetAsOf: z.ZodISODateTime;
                remainingSeconds: z.ZodNumber;
                shareLimitSeconds: z.ZodNumber;
                limitSeconds: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"unknown">;
            reason: z.ZodEnum<{
                source_unavailable: "source_unavailable";
                usage_pending: "usage_pending";
                authority_unavailable: "authority_unavailable";
            }>;
        }, z.core.$strict>], "status">;
        reservation: z.ZodNullable<z.ZodObject<{
            reservationId: z.ZodString;
            openingId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            version: z.ZodNumber;
            status: z.ZodEnum<{
                uncertain: "uncertain";
                held: "held";
                consumed: "consumed";
                released: "released";
            }>;
            limitSeconds: z.ZodNumber;
            createdAt: z.ZodISODateTime;
            updatedAt: z.ZodISODateTime;
            expiresAt: z.ZodNullable<z.ZodISODateTime>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly authType: "secret";
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
export declare function capCoachOperationalProgramRevisionPath(agentId: string, programId: string, programVersion: number): string;
export declare function capCoachOpeningPath(agentId: string): string;
export declare function capCoachSessionInputPath(agentId: string, sessionId: string): string;
export declare function capCoachExecutionStartPath(agentId: string, sessionId: string): string;
export declare function capCoachExecutionEventPath(agentId: string, sessionId: string): string;
export declare function capCoachGuideEndPath(agentId: string, sessionId: string): string;
export declare function capCoachSessionClosePath(agentId: string, sessionId: string): string;
export declare function capCoachUsageObservePath(agentId: string, sessionId: string): string;
//# sourceMappingURL=coach-operational-write.d.ts.map