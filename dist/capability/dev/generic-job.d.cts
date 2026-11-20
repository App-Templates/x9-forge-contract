import { z } from 'zod';
/** Names only: executors map each tool to a fixed command using their subscription. */
export declare const DEV_GENERIC_JOB_TOOLS: readonly ["mlx_whisper", "claude_p"];
export declare const DevGenericToolSchema: z.ZodEnum<{
    mlx_whisper: "mlx_whisper";
    claude_p: "claude_p";
}>;
export type DevGenericTool = z.infer<typeof DevGenericToolSchema>;
export declare const DEV_GENERIC_EXECUTORS: readonly ["laptop", "server"];
export declare const DevGenericExecutorSchema: z.ZodEnum<{
    laptop: "laptop";
    server: "server";
}>;
export type DevGenericExecutor = z.infer<typeof DevGenericExecutorSchema>;
export declare const DEV_GENERIC_INPUT_MAX_BYTES = 32768;
export declare const DEV_GENERIC_OUTPUT_MAX_BYTES = 131072;
/** Large documents must travel through a file channel, outside this job contract. */
export declare const DevGenericInputSchema: z.ZodRecord<z.ZodString, z.ZodJSONSchema>;
export type DevGenericInput = z.infer<typeof DevGenericInputSchema>;
/** Output is untrusted data, never an instruction for the executor or consumer. */
export declare const DevGenericOutputSchema: z.ZodRecord<z.ZodString, z.ZodJSONSchema>;
export type DevGenericOutput = z.infer<typeof DevGenericOutputSchema>;
/** The service binds scope from the authenticated call, never from the executor. */
export declare const DevGenericJobSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    jobId: z.ZodString;
    capability: z.ZodString;
    kind: z.ZodString;
    tool: z.ZodEnum<{
        mlx_whisper: "mlx_whisper";
        claude_p: "claude_p";
    }>;
    executor: z.ZodEnum<{
        laptop: "laptop";
        server: "server";
    }>;
    input: z.ZodRecord<z.ZodString, z.ZodJSONSchema>;
    configVersion: z.ZodNumber;
    limits: z.ZodObject<{
        maxDurationSeconds: z.ZodNumber;
        maxAttempts: z.ZodNumber;
    }, z.core.$strict>;
    createdAt: z.ZodISODateTime;
}, z.core.$strict>;
export type DevGenericJob = z.infer<typeof DevGenericJobSchema>;
export declare const DevGenericJobResultSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    jobId: z.ZodString;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    tool: z.ZodEnum<{
        mlx_whisper: "mlx_whisper";
        claude_p: "claude_p";
    }>;
    state: z.ZodEnum<{
        failed: "failed";
        done: "done";
    }>;
    output: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
    error: z.ZodOptional<z.ZodString>;
    durationSeconds: z.ZodNumber;
    finishedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type DevGenericJobResult = z.infer<typeof DevGenericJobResultSchema>;
/** Correlation of validated contracts only; it does not authorize execution. */
export declare function devGenericResultMatchesJob(job: DevGenericJob, result: DevGenericJobResult): {
    ok: true;
} | {
    ok: false;
    error: 'job_mismatch' | 'scope_mismatch' | 'tool_mismatch';
};
//# sourceMappingURL=generic-job.d.ts.map