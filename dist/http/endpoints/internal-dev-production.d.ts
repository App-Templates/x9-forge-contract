import { z } from 'zod';
export declare const DevProductionSubmissionSchema: z.ZodObject<{
    job: z.ZodObject<{
        version: z.ZodLiteral<1>;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        jobId: z.ZodString;
        requestId: z.ZodString;
        projectId: z.ZodString;
        session: z.ZodObject<{
            scope: z.ZodLazy<z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>>;
            sessionId: z.ZodString;
            target: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"local">;
                deviceId: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"cloud">;
                connectionRef: z.ZodString;
            }, z.core.$strict>], "kind">;
            engines: z.ZodArray<z.ZodEnum<{
                claude: "claude";
                codex: "codex";
            }>>;
        }, z.core.$strict>;
        productKind: z.ZodEnum<{
            code: "code";
            presentation: "presentation";
            design: "design";
            automation: "automation";
        }>;
        instruction: z.ZodString;
        roleModels: z.ZodOptional<z.ZodObject<{
            coordination: z.ZodObject<{
                engine: z.ZodEnum<{
                    claude: "claude";
                    codex: "codex";
                }>;
                modelId: z.ZodString;
                reasoningEffort: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            planning: z.ZodObject<{
                engine: z.ZodEnum<{
                    claude: "claude";
                    codex: "codex";
                }>;
                modelId: z.ZodString;
                reasoningEffort: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            unblocking: z.ZodObject<{
                engine: z.ZodEnum<{
                    claude: "claude";
                    codex: "codex";
                }>;
                modelId: z.ZodString;
                reasoningEffort: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            code: z.ZodObject<{
                engine: z.ZodEnum<{
                    claude: "claude";
                    codex: "codex";
                }>;
                modelId: z.ZodString;
                reasoningEffort: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            design: z.ZodObject<{
                engine: z.ZodEnum<{
                    claude: "claude";
                    codex: "codex";
                }>;
                modelId: z.ZodString;
                reasoningEffort: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            presentation: z.ZodObject<{
                engine: z.ZodEnum<{
                    claude: "claude";
                    codex: "codex";
                }>;
                modelId: z.ZodString;
                reasoningEffort: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        reportVersion: z.ZodNumber;
        reportDigest: z.ZodString;
        configVersion: z.ZodNumber;
        keyVersion: z.ZodNumber;
        limits: z.ZodObject<{
            maxDurationSeconds: z.ZodNumber;
            maxAttempts: z.ZodNumber;
            maxTasks: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>;
    approval: z.ZodObject<{
        permit: z.ZodObject<{
            v: z.ZodLiteral<1>;
            type: z.ZodString;
            client: z.ZodString;
            tenantId: z.ZodString;
            ownerId: z.ZodString;
            agentId: z.ZodString;
            requestId: z.ZodString;
            textSha256: z.ZodString;
            bindings: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
            issuedAt: z.ZodString;
            expiresAt: z.ZodString;
            nonce: z.ZodString;
        }, z.core.$strict>;
        keyId: z.ZodString;
        signature: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type DevProductionSubmission = z.infer<typeof DevProductionSubmissionSchema>;
/** Queued acknowledges submission only; it does not attest execution or artifacts. */
export declare const submitDevProductionContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/dev/jobs";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        job: z.ZodObject<{
            version: z.ZodLiteral<1>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            jobId: z.ZodString;
            requestId: z.ZodString;
            projectId: z.ZodString;
            session: z.ZodObject<{
                scope: z.ZodLazy<z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>>;
                sessionId: z.ZodString;
                target: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    deviceId: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"cloud">;
                    connectionRef: z.ZodString;
                }, z.core.$strict>], "kind">;
                engines: z.ZodArray<z.ZodEnum<{
                    claude: "claude";
                    codex: "codex";
                }>>;
            }, z.core.$strict>;
            productKind: z.ZodEnum<{
                code: "code";
                presentation: "presentation";
                design: "design";
                automation: "automation";
            }>;
            instruction: z.ZodString;
            roleModels: z.ZodOptional<z.ZodObject<{
                coordination: z.ZodObject<{
                    engine: z.ZodEnum<{
                        claude: "claude";
                        codex: "codex";
                    }>;
                    modelId: z.ZodString;
                    reasoningEffort: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
                planning: z.ZodObject<{
                    engine: z.ZodEnum<{
                        claude: "claude";
                        codex: "codex";
                    }>;
                    modelId: z.ZodString;
                    reasoningEffort: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
                unblocking: z.ZodObject<{
                    engine: z.ZodEnum<{
                        claude: "claude";
                        codex: "codex";
                    }>;
                    modelId: z.ZodString;
                    reasoningEffort: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
                code: z.ZodObject<{
                    engine: z.ZodEnum<{
                        claude: "claude";
                        codex: "codex";
                    }>;
                    modelId: z.ZodString;
                    reasoningEffort: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
                design: z.ZodObject<{
                    engine: z.ZodEnum<{
                        claude: "claude";
                        codex: "codex";
                    }>;
                    modelId: z.ZodString;
                    reasoningEffort: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
                presentation: z.ZodObject<{
                    engine: z.ZodEnum<{
                        claude: "claude";
                        codex: "codex";
                    }>;
                    modelId: z.ZodString;
                    reasoningEffort: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
            reportVersion: z.ZodNumber;
            reportDigest: z.ZodString;
            configVersion: z.ZodNumber;
            keyVersion: z.ZodNumber;
            limits: z.ZodObject<{
                maxDurationSeconds: z.ZodNumber;
                maxAttempts: z.ZodNumber;
                maxTasks: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
        approval: z.ZodObject<{
            permit: z.ZodObject<{
                v: z.ZodLiteral<1>;
                type: z.ZodString;
                client: z.ZodString;
                tenantId: z.ZodString;
                ownerId: z.ZodString;
                agentId: z.ZodString;
                requestId: z.ZodString;
                textSha256: z.ZodString;
                bindings: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                issuedAt: z.ZodString;
                expiresAt: z.ZodString;
                nonce: z.ZodString;
            }, z.core.$strict>;
            keyId: z.ZodString;
            signature: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        jobId: z.ZodString;
        requestId: z.ZodString;
        status: z.ZodLiteral<"queued">;
    }, z.core.$strict>;
};
/** The service must authorize the scope and correlate the path with its persisted job. */
export declare const getDevProductionResultContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/dev/jobs/:jobId";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        jobId: z.ZodString;
    }, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"pending">;
        jobId: z.ZodString;
        requestId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"finished">;
        result: z.ZodDiscriminatedUnion<[z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            jobId: z.ZodString;
            requestId: z.ZodString;
            projectId: z.ZodString;
            sessionId: z.ZodString;
            productKind: z.ZodEnum<{
                code: "code";
                presentation: "presentation";
                design: "design";
                automation: "automation";
            }>;
            reportVersion: z.ZodNumber;
            reportDigest: z.ZodString;
            finishedAt: z.ZodISODateTime;
            status: z.ZodLiteral<"succeeded">;
            artifacts: z.ZodArray<z.ZodObject<{
                artifactRef: z.ZodString;
                mediaType: z.ZodString;
                bytes: z.ZodNumber;
                sha256: z.ZodString;
                fileName: z.ZodOptional<z.ZodString>;
                displayName: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            delivery: z.ZodOptional<z.ZodObject<{
                summary: z.ZodString;
                instructions: z.ZodString;
                primaryArtifactRef: z.ZodString;
            }, z.core.$strict>>;
            verification: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"tests">;
                passed: z.ZodNumber;
                total: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"visual_review">;
                previewRef: z.ZodString;
                reviewRef: z.ZodString;
                ownerAcceptanceRef: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>, z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            jobId: z.ZodString;
            requestId: z.ZodString;
            projectId: z.ZodString;
            sessionId: z.ZodString;
            productKind: z.ZodEnum<{
                code: "code";
                presentation: "presentation";
                design: "design";
                automation: "automation";
            }>;
            reportVersion: z.ZodNumber;
            reportDigest: z.ZodString;
            finishedAt: z.ZodISODateTime;
            status: z.ZodEnum<{
                failed: "failed";
                cancelled: "cancelled";
                uncertain: "uncertain";
                blocked: "blocked";
            }>;
            reason: z.ZodString;
        }, z.core.$strict>], "status">;
    }, z.core.$strict>], "status">;
};
/**
 * Correlation only, using the job and text digest from the service's persisted expectation.
 * This does not verify cryptographic signatures, one-time nonces, owner/passkey identity,
 * cap-dev installation/APPLIED state or a fresh lease. Before effects, S3 must use the
 * existing A11 signature verifier, consume the nonce and re-read those preconditions.
 * A boolean approved flag cannot replace that verification.
 */
export declare function isDevProductionApprovalForJob(rawSignedPermit: unknown, expectedJob: unknown, expectedTextSha256: unknown, nowMs: number): boolean;
/**
 * Correlation only: true means the response belongs to the expected job, never that the work
 * succeeded. Callers must keep the original status of a finished result (failed, blocked,
 * cancelled and uncertain stay what they are) and must never retry an uncertain result
 * automatically. A pending response carries no scope, so this helper cannot attribute it to an
 * owner or agent: the server must authenticate the owner and the scope/path before answering.
 */
export declare function isDevProductionResultResponseForJob(rawResponse: unknown, expectedJob: unknown): boolean;
//# sourceMappingURL=internal-dev-production.d.ts.map