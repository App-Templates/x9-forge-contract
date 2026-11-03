import { z } from 'zod';
import { DevProductionArtifactSchema } from './production-result.js';

/**
 * Transport shape and chunk coherence only, not proof of existence, ownership or
 * byte hashes. The service verifies content against the registered sha256; the
 * consumer verifies the complete file after assembly.
 */
export const DevProductionArtifactChunkSchema = z.strictObject({
  artifact: DevProductionArtifactSchema,
  offset: z.number().int().min(0),
  contentBase64: z.string().regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/),
  eof: z.boolean(),
}).superRefine((chunk, ctx) => {
  const padding = chunk.contentBase64.endsWith('==') ? 2 : chunk.contentBase64.endsWith('=') ? 1 : 0;
  const bytes = chunk.contentBase64.length / 4 * 3 - padding;
  if (bytes < 1 || bytes > 262144) {
    ctx.addIssue({ code: 'custom', path: ['contentBase64'], message: 'Chunk must contain 1..262144 decoded bytes' });
  }
  const end = chunk.offset + bytes;
  if (end > chunk.artifact.bytes) {
    ctx.addIssue({ code: 'custom', path: ['contentBase64'], message: 'Chunk exceeds artifact bytes' });
  }
  if (chunk.eof !== (end === chunk.artifact.bytes)) {
    ctx.addIssue({ code: 'custom', path: ['eof'], message: 'EOF must match the final artifact byte' });
  }
});
export type DevProductionArtifactChunk = z.infer<typeof DevProductionArtifactChunkSchema>;

/**
 * True when the chunk belongs to the expected manifest and starts exactly at the
 * expected offset. Optional labels are ignored: they do not identify the bytes.
 * The caller still authorizes the manifest and verifies the complete file hash.
 */
export function isDevProductionArtifactChunkForArtifact(
  rawChunk: unknown,
  expectedArtifact: unknown,
  expectedOffset: unknown,
): boolean {
  const chunk = DevProductionArtifactChunkSchema.safeParse(rawChunk);
  const expected = DevProductionArtifactSchema.safeParse(expectedArtifact);
  if (!chunk.success || !expected.success) return false;
  const actual = chunk.data.artifact;
  return chunk.data.offset === expectedOffset
    && actual.artifactRef === expected.data.artifactRef
    && actual.sha256 === expected.data.sha256
    && actual.bytes === expected.data.bytes
    && actual.mediaType === expected.data.mediaType;
}
