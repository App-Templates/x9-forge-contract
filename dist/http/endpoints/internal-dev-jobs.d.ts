import { z } from 'zod';
export declare const DevProductionJobsPageSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>;
    nextCursor: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type DevProductionJobsPage = z.infer<typeof DevProductionJobsPageSchema>;
/**
 * Read persisted assignments in a stable service-owned order with an opaque cursor.
 * The service must authenticate the owner and compare path agentId and query scope
 * with its registry, isolating both pagination and data between owners. Uniform page
 * scope alone does not authenticate or correlate a response with the request.
 * Reading never enqueues, retries or creates jobs. Use the existing progress detail
 * route and, when available, the result route; this list does not depend on results.
 */
export declare const listDevProductionJobsContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/dev/jobs";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        cursor: z.ZodOptional<z.ZodString>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        items: z.ZodArray<z.ZodObject<{
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
        }, z.core.$strict>>;
        nextCursor: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
};
export type ListDevProductionJobsQueryInput = z.input<typeof listDevProductionJobsContract.querySchema>;
/**
 * Accept a jobs page only when it is valid, within the requested limit and entirely in the requested
 * scope. Returns a detached parsed copy (order, cursor and content intact) or null; foreign rows are
 * never filtered out and errors never become an empty page. The authenticated owner and the cursor stay
 * the server's responsibility: this check proves neither ownership, freshness nor global ordering.
 */
export declare function selectDevProductionJobsPage(rawPage: unknown, expectedQuery: ListDevProductionJobsQueryInput): DevProductionJobsPage | null;
//# sourceMappingURL=internal-dev-jobs.d.ts.map