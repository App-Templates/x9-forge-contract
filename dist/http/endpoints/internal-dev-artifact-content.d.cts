import { z } from 'zod';
/** Transport request only; authorization and persisted record lookup belong to the service. */
export declare const DevProductionArtifactReadSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    requestId: z.ZodString;
    artifactRef: z.ZodString;
    offset: z.ZodNumber;
    length: z.ZodNumber;
}, z.core.$strict>;
export type DevProductionArtifactRead = z.infer<typeof DevProductionArtifactReadSchema>;
/**
 * Read-only POST keeps the opaque artifact reference out of the URL. The backend
 * authenticates the owner, correlates agent/job/request/scope with the persisted
 * record and resolves artifactRef only among artifacts of an authorized succeeded
 * result. Verify the source file, requested chunk and registered sha256; return
 * bytes without creating files or starting production retries. Missing or foreign
 * artifacts produce a service error, never an empty file. No public or signed URL
 * is returned. Signing, storage and assembly remain with services and consumers;
 * the backend delivers the authenticated download to the browser.
 */
export declare const readDevProductionArtifactContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/dev/jobs/:jobId/artifacts/read";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        jobId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        requestId: z.ZodString;
        artifactRef: z.ZodString;
        offset: z.ZodNumber;
        length: z.ZodNumber;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        artifact: z.ZodObject<{
            artifactRef: z.ZodString;
            mediaType: z.ZodString;
            bytes: z.ZodNumber;
            sha256: z.ZodString;
            fileName: z.ZodOptional<z.ZodString>;
            displayName: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        offset: z.ZodNumber;
        contentBase64: z.ZodString;
        eof: z.ZodBoolean;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-dev-artifact-content.d.ts.map