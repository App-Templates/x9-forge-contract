import { z } from 'zod';
/**
 * Transport shape and chunk coherence only, not proof of existence, ownership or
 * byte hashes. The service verifies content against the registered sha256; the
 * consumer verifies the complete file after assembly.
 */
export declare const DevProductionArtifactChunkSchema: z.ZodObject<{
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
export type DevProductionArtifactChunk = z.infer<typeof DevProductionArtifactChunkSchema>;
/**
 * True when the chunk belongs to the expected manifest and starts exactly at the
 * expected offset. Optional labels are ignored: they do not identify the bytes.
 * The caller still authorizes the manifest and verifies the complete file hash.
 */
export declare function isDevProductionArtifactChunkForArtifact(rawChunk: unknown, expectedArtifact: unknown, expectedOffset: unknown): boolean;
//# sourceMappingURL=production-artifact-content.d.ts.map