import { z } from 'zod';
export declare const CoachProgramVersionReadRequestSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type CoachProgramVersionReadRequest = z.infer<typeof CoachProgramVersionReadRequestSchema>;
export declare const CoachProgramVersionReadResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
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
    measureDefinitions: z.ZodArray<z.ZodObject<{
        measureId: z.ZodString;
        version: z.ZodString;
        unit: z.ZodString;
        min: z.ZodNumber;
        max: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CoachProgramVersionReadResult = z.infer<typeof CoachProgramVersionReadResultSchema>;
export declare const CoachOperationalSessionReadRequestSchema: z.ZodObject<{
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
    expectedRevision: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type CoachOperationalSessionReadRequest = z.infer<typeof CoachOperationalSessionReadRequestSchema>;
export declare const CoachOperationalSessionReadResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    state: z.ZodObject<{
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
        lifecycle: z.ZodEnum<{
            opened: "opened";
            executing: "executing";
            execution_ended: "execution_ended";
            closed: "closed";
        }>;
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
        measureDefinitions: z.ZodArray<z.ZodObject<{
            measureId: z.ZodString;
            version: z.ZodString;
            unit: z.ZodString;
            min: z.ZodNumber;
            max: z.ZodNumber;
        }, z.core.$strict>>;
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
        latestRevision: z.ZodNullable<z.ZodObject<{
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
        accounting: z.ZodNullable<z.ZodObject<{
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
        }, z.core.$strict>>;
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
}, z.core.$strict>;
export type CoachOperationalSessionReadResult = z.infer<typeof CoachOperationalSessionReadResultSchema>;
export declare function isCoachOperationalSessionReadForRequest(raw: unknown, expected: unknown): boolean;
export declare const CoachSessionRevisionsReadRequestSchema: z.ZodObject<{
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
    afterSequence: z.ZodNumber;
    limit: z.ZodNumber;
}, z.core.$strict>;
export type CoachSessionRevisionsReadRequest = z.infer<typeof CoachSessionRevisionsReadRequestSchema>;
export declare const CoachSessionRevisionsPageSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
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
    asOfRevision: z.ZodNumber;
    revisions: z.ZodArray<z.ZodObject<{
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
    nextAfterSequence: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type CoachSessionRevisionsPage = z.infer<typeof CoachSessionRevisionsPageSchema>;
export declare function isCoachSessionRevisionsPageForRequest(raw: unknown, expected: unknown, rawSnapshot: unknown): boolean;
export declare const CoachOperationalBudgetReadRequestSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type CoachOperationalBudgetReadRequest = z.infer<typeof CoachOperationalBudgetReadRequestSchema>;
export declare const CoachOperationalBudgetReadResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
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
export type CoachOperationalBudgetReadResult = z.infer<typeof CoachOperationalBudgetReadResultSchema>;
export declare const coachProgramVersionReadContract: {
    readonly path: "/internal/capability/agents/:agentId/coach/v2/programs/read";
    readonly bodySchema: z.ZodObject<{
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
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
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
        measureDefinitions: z.ZodArray<z.ZodObject<{
            measureId: z.ZodString;
            version: z.ZodString;
            unit: z.ZodString;
            min: z.ZodNumber;
            max: z.ZodNumber;
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
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly method: "POST";
};
export declare const coachOperationalSessionReadContract: {
    readonly path: "/internal/capability/agents/:agentId/coach/v2/sessions/read";
    readonly bodySchema: z.ZodObject<{
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
        expectedRevision: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        state: z.ZodObject<{
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
            lifecycle: z.ZodEnum<{
                opened: "opened";
                executing: "executing";
                execution_ended: "execution_ended";
                closed: "closed";
            }>;
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
            measureDefinitions: z.ZodArray<z.ZodObject<{
                measureId: z.ZodString;
                version: z.ZodString;
                unit: z.ZodString;
                min: z.ZodNumber;
                max: z.ZodNumber;
            }, z.core.$strict>>;
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
            latestRevision: z.ZodNullable<z.ZodObject<{
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
            accounting: z.ZodNullable<z.ZodObject<{
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
            }, z.core.$strict>>;
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
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly method: "POST";
};
export declare const coachSessionRevisionsReadContract: {
    readonly path: "/internal/capability/agents/:agentId/coach/v2/sessions/revisions/read";
    readonly bodySchema: z.ZodObject<{
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
        afterSequence: z.ZodNumber;
        limit: z.ZodNumber;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
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
        asOfRevision: z.ZodNumber;
        revisions: z.ZodArray<z.ZodObject<{
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
        nextAfterSequence: z.ZodNullable<z.ZodNumber>;
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
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly method: "POST";
};
export declare const coachOperationalBudgetReadContract: {
    readonly path: "/internal/capability/agents/:agentId/coach/v2/budget/read";
    readonly bodySchema: z.ZodObject<{
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
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
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
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly method: "POST";
};
export declare function capCoachProgramVersionReadPath(agentId: string): string;
export declare function capCoachOperationalSessionReadPath(agentId: string): string;
export declare function capCoachSessionRevisionsReadPath(agentId: string): string;
export declare function capCoachOperationalBudgetReadPath(agentId: string): string;
//# sourceMappingURL=coach-operational-read.d.ts.map