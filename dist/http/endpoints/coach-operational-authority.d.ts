import { z } from 'zod';
import { type CoachOperationalAuthorityProofRef } from "../../capability/coach/operational/authority.js";
/** Internal authentication identifies the producer; explicit current person/program authority is still required. */
export declare const coachOperationalAuthorityResolveContract: {
    readonly path: "/internal/capability/agents/:agentId/coach/v2/authority/resolve";
    readonly method: "POST";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
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
    readonly bodySchema: z.ZodUnion<readonly [z.ZodObject<{
        operation: z.ZodLiteral<"program">;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        opening: z.ZodNull;
        requestId: z.ZodString;
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
        phase: z.ZodEnum<{
            before: "before";
            after: "after";
        }>;
        proofRef: z.ZodObject<{
            kind: z.ZodEnum<{
                session: "session";
                admission: "admission";
            }>;
            proofId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        operation: z.ZodEnum<{
            opening: "opening";
            read: "read";
            start: "start";
            conversation: "conversation";
            event: "event";
            usage: "usage";
            "end-guide": "end-guide";
            close: "close";
        }>;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        opening: z.ZodNullable<z.ZodObject<{
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
        }, z.core.$strict>>;
        requestId: z.ZodString;
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
        phase: z.ZodEnum<{
            before: "before";
            after: "after";
        }>;
        proofRef: z.ZodObject<{
            kind: z.ZodEnum<{
                session: "session";
                admission: "admission";
            }>;
            proofId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>]>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        request: z.ZodUnion<readonly [z.ZodObject<{
            operation: z.ZodLiteral<"program">;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            opening: z.ZodNull;
            requestId: z.ZodString;
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
            phase: z.ZodEnum<{
                before: "before";
                after: "after";
            }>;
            proofRef: z.ZodObject<{
                kind: z.ZodEnum<{
                    session: "session";
                    admission: "admission";
                }>;
                proofId: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            operation: z.ZodEnum<{
                opening: "opening";
                read: "read";
                start: "start";
                conversation: "conversation";
                event: "event";
                usage: "usage";
                "end-guide": "end-guide";
                close: "close";
            }>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            opening: z.ZodNullable<z.ZodObject<{
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
            }, z.core.$strict>>;
            requestId: z.ZodString;
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
            phase: z.ZodEnum<{
                before: "before";
                after: "after";
            }>;
            proofRef: z.ZodObject<{
                kind: z.ZodEnum<{
                    session: "session";
                    admission: "admission";
                }>;
                proofId: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>]>;
        proof: z.ZodObject<{
            proofRef: z.ZodObject<{
                kind: z.ZodEnum<{
                    session: "session";
                    admission: "admission";
                }>;
                proofId: z.ZodString;
            }, z.core.$strict>;
            scope: z.ZodUnion<readonly [z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>, z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>]>;
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
            opening: z.ZodNullable<z.ZodObject<{
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
            }, z.core.$strict>>;
            issuedAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
            status: z.ZodEnum<{
                active: "active";
                revoked: "revoked";
                closed: "closed";
                draining: "draining";
            }>;
        }, z.core.$strict>;
        observedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
};
export declare const coachOperationalAuthorityRecheckContract: {
    readonly path: "/internal/capability/agents/:agentId/coach/v2/authority/recheck";
    readonly method: "POST";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
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
    readonly bodySchema: z.ZodUnion<readonly [z.ZodObject<{
        operation: z.ZodLiteral<"program">;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        opening: z.ZodNull;
        requestId: z.ZodString;
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
        phase: z.ZodEnum<{
            before: "before";
            after: "after";
        }>;
        proofRef: z.ZodObject<{
            kind: z.ZodEnum<{
                session: "session";
                admission: "admission";
            }>;
            proofId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        operation: z.ZodEnum<{
            opening: "opening";
            read: "read";
            start: "start";
            conversation: "conversation";
            event: "event";
            usage: "usage";
            "end-guide": "end-guide";
            close: "close";
        }>;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        opening: z.ZodNullable<z.ZodObject<{
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
        }, z.core.$strict>>;
        requestId: z.ZodString;
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
        phase: z.ZodEnum<{
            before: "before";
            after: "after";
        }>;
        proofRef: z.ZodObject<{
            kind: z.ZodEnum<{
                session: "session";
                admission: "admission";
            }>;
            proofId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>]>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        request: z.ZodUnion<readonly [z.ZodObject<{
            operation: z.ZodLiteral<"program">;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            opening: z.ZodNull;
            requestId: z.ZodString;
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
            phase: z.ZodEnum<{
                before: "before";
                after: "after";
            }>;
            proofRef: z.ZodObject<{
                kind: z.ZodEnum<{
                    session: "session";
                    admission: "admission";
                }>;
                proofId: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            operation: z.ZodEnum<{
                opening: "opening";
                read: "read";
                start: "start";
                conversation: "conversation";
                event: "event";
                usage: "usage";
                "end-guide": "end-guide";
                close: "close";
            }>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            opening: z.ZodNullable<z.ZodObject<{
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
            }, z.core.$strict>>;
            requestId: z.ZodString;
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
            phase: z.ZodEnum<{
                before: "before";
                after: "after";
            }>;
            proofRef: z.ZodObject<{
                kind: z.ZodEnum<{
                    session: "session";
                    admission: "admission";
                }>;
                proofId: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>]>;
        proof: z.ZodObject<{
            proofRef: z.ZodObject<{
                kind: z.ZodEnum<{
                    session: "session";
                    admission: "admission";
                }>;
                proofId: z.ZodString;
            }, z.core.$strict>;
            scope: z.ZodUnion<readonly [z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>, z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>]>;
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
            opening: z.ZodNullable<z.ZodObject<{
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
            }, z.core.$strict>>;
            issuedAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
            status: z.ZodEnum<{
                active: "active";
                revoked: "revoked";
                closed: "closed";
                draining: "draining";
            }>;
        }, z.core.$strict>;
        observedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
};
export declare function capCoachOperationalAuthorityPath(agentId: string, action: 'resolve' | 'recheck'): string;
export declare function isCoachOperationalAuthorityForRoute(rawRequest: unknown, rawParams: unknown, action: 'resolve' | 'recheck'): boolean;
/** A single opaque evidence reference, not authentication or authorization. */
export declare const COACH_OPERATIONAL_AUTHORITY_PROOF_HEADER: "X-X9-Coach-Authority-Proof";
export declare const CoachOperationalAuthorityProofHeaderSchema: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<{
    kind: string;
    proofId: string;
}, string>>, z.ZodObject<{
    kind: z.ZodEnum<{
        session: "session";
        admission: "admission";
    }>;
    proofId: z.ZodString;
}, z.core.$strict>>;
export declare function formatCoachOperationalAuthorityProofHeader(rawProofRef: unknown): string;
/** mode comes from trusted server policy, never from a caller-selected legacy flag.
 * Arrays, merged duplicate headers and malformed values must fail even in legacy mode.
 * The producer must correlate this reference with current scoped server evidence after every await. */
export declare function parseCoachOperationalAuthorityProofHeader(raw: unknown, mode: 'legacy' | 'managed'): CoachOperationalAuthorityProofRef | null;
//# sourceMappingURL=coach-operational-authority.d.ts.map