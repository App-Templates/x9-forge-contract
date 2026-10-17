import { describe, expect, it } from 'vitest';
import { DevProductionArtifactChunkSchema as schema, DevProductionArtifactSchema } from '../../../src/capability/dev/index.js';
import type { DevProductionArtifactChunk } from '../../../src/capability/dev/index.js';

const artifact = { artifactRef: 'artifact-1', mediaType: 'application/octet-stream', bytes: 6, sha256: 'a'.repeat(64) };
const chunk: DevProductionArtifactChunk = { artifact, offset: 0, contentBase64: 'AP8A', eof: false };
const sized = (bytes: number) => ({ ...chunk, artifact: { ...artifact, bytes }, contentBase64: Buffer.alloc(bytes, 255).toString('base64'), eof: true });

describe('dev production artifact content', () => {
  it('reuses artifact schema', () => {
    expect(schema.shape.artifact === DevProductionArtifactSchema).toBe(true);
  });

  it('accepts first chunk', () => {
    expect(schema.safeParse(chunk).success).toBe(true);
  });

  it('accepts last chunk', () => {
    expect(schema.safeParse({ ...chunk, offset: 3, eof: true }).success).toBe(true);
  });

  it('accepts exact limit', () => {
    expect(schema.safeParse(sized(262144)).success).toBe(true);
  });

  it('accepts two padding characters', () => {
    expect(schema.safeParse({ ...chunk, artifact: { ...artifact, bytes: 1 }, contentBase64: 'AA==', eof: true }).success).toBe(true);
  });

  it('accepts one padding character', () => {
    expect(schema.safeParse({ ...chunk, artifact: { ...artifact, bytes: 2 }, contentBase64: 'AP8=', eof: true }).success).toBe(true);
  });

  it('accepts no padding', () => {
    expect(schema.safeParse({ ...chunk, artifact: { ...artifact, bytes: 3 }, eof: true }).success).toBe(true);
  });

  it('rejects empty content', () => {
    expect(!schema.safeParse({ ...chunk, contentBase64: '' }).success).toBe(true);
  });

  it('rejects invalid alphabet', () => {
    expect(!schema.safeParse({ ...chunk, artifact: { ...artifact, bytes: 3 }, contentBase64: 'AA-/', eof: true }).success).toBe(true);
  });

  it('rejects invalid padding', () => {
    expect(!schema.safeParse({ ...chunk, artifact: { ...artifact, bytes: 1 }, contentBase64: 'A===', eof: true }).success).toBe(true);
  });

  it('rejects missing padding', () => {
    expect(!schema.safeParse({ ...chunk, contentBase64: 'AP8' }).success).toBe(true);
  });

  it('rejects whitespace', () => {
    expect(!schema.safeParse({ ...chunk, contentBase64: 'AP8A\n' }).success).toBe(true);
  });

  it('rejects over limit', () => {
    expect(!schema.safeParse(sized(262145)).success).toBe(true);
  });

  it('rejects negative offset', () => {
    expect(!schema.safeParse({ ...chunk, offset: -1 }).success).toBe(true);
  });

  it('rejects fractional offset', () => {
    expect(!schema.safeParse({ ...chunk, offset: 0.5 }).success).toBe(true);
  });

  it('rejects overflow', () => {
    expect(!schema.safeParse({ ...chunk, offset: 4 }).success).toBe(true);
  });

  it('rejects premature eof', () => {
    expect(!schema.safeParse({ ...chunk, eof: true }).success).toBe(true);
  });

  it('rejects missing final eof', () => {
    expect(!schema.safeParse({ ...chunk, offset: 3 }).success).toBe(true);
  });

  it('rejects extras', () => {
    expect(!schema.safeParse({ ...chunk, extra: true }).success).toBe(true);
  });

  it('rejects nonstring content', () => {
    expect(!schema.safeParse({ ...chunk, contentBase64: 1234 }).success).toBe(true);
  });

  it('rejects nonboolean eof', () => {
    expect(!schema.safeParse({ ...chunk, eof: 0 }).success).toBe(true);
  });

  it('rejects artifact extras', () => {
    expect(!schema.safeParse({ ...chunk, artifact: { ...artifact, extra: true } }).success).toBe(true);
  });

  it('reassembles known binary with every padding length', () => {
    const expected = Buffer.from([0, 255, 0, 255, 255, 0]);
    const pieces = [expected.subarray(0, 1), expected.subarray(1, 3), expected.subarray(3)];
    let offset = 0;
    const decoded = pieces.map((piece) => {
      const parsed = schema.parse({ artifact, offset, contentBase64: piece.toString('base64'), eof: offset + piece.length === artifact.bytes });
      offset += piece.length;
      return Buffer.from(parsed.contentBase64, 'base64');
    });
    expect(Buffer.concat(decoded)).toEqual(expected);
  });
});
