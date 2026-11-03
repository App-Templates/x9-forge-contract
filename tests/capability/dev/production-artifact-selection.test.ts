import { describe, expect, it } from 'vitest';
import { isDevProductionArtifactChunkForArtifact as isForArtifact } from '../../../src/capability/dev/index.js';

const artifact = { artifactRef: 'artifact-1', mediaType: 'application/octet-stream', bytes: 6, sha256: 'a'.repeat(64) };
const first = { artifact, offset: 0, contentBase64: 'AP8A', eof: false };
const second = { artifact, offset: 4, contentBase64: 'AP8=', eof: true };
const last = { artifact: { ...artifact, bytes: 7 }, offset: 4, contentBase64: 'AP8A', eof: true };

describe('bridge227', () => {
  it('accepts two consecutive chunks at requested offsets', () => {
    const wide = { ...artifact, bytes: 7 };
    const one = { artifact: wide, offset: 0, contentBase64: 'AP8A', eof: false };
    expect(isForArtifact(one, wide, 0)).toBe(true);
    expect(isForArtifact(last, wide, 4)).toBe(true);
    expect(isForArtifact({ ...one, artifact: { ...wide, fileName: 'a.bin', displayName: 'A' } }, wide, 0)).toBe(true);
    expect(isForArtifact(one, { ...wide, fileName: 'b.bin' }, 0)).toBe(true);
  });

  it('rejects replayed or out of order chunk', () => {
    const wide = { ...artifact, bytes: 7 };
    const one = { artifact: wide, offset: 0, contentBase64: 'AP8A', eof: false };
    expect(isForArtifact(one, wide, 4)).toBe(false);
    expect(isForArtifact(last, wide, 0)).toBe(false);
    expect(isForArtifact(last, wide, 3)).toBe(false);
  });

  it('rejects each mismatched manifest identity field', () => {
    expect(isForArtifact(first, { ...artifact, artifactRef: 'artifact-2' }, 0)).toBe(false);
    expect(isForArtifact(first, { ...artifact, sha256: 'b'.repeat(64) }, 0)).toBe(false);
    expect(isForArtifact(first, { ...artifact, bytes: 7 }, 0)).toBe(false);
    expect(isForArtifact(first, { ...artifact, mediaType: 'text/plain' }, 0)).toBe(false);
  });

  it('rejects malformed chunk and expected artifact', () => {
    expect(isForArtifact({ ...first, extra: true }, artifact, 0)).toBe(false);
    expect(isForArtifact(first, { ...artifact, extra: true }, 0)).toBe(false);
    expect(isForArtifact({ ...first, eof: true }, artifact, 0)).toBe(false);
    expect(isForArtifact(null, artifact, 0)).toBe(false);
    expect(isForArtifact(first, undefined, 0)).toBe(false);
    expect(isForArtifact(first, { ...artifact, bytes: 0 }, 0)).toBe(false);
  });

  it('rejects unsafe or invalid expected offsets', () => {
    for (const offset of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1, '0', null, undefined, {}, 0n]) {
      expect(isForArtifact(first, artifact, offset)).toBe(false);
    }
    expect(isForArtifact(second, artifact, 4)).toBe(true);
  });

  it('does not mutate either input', () => {
    const chunkInput = structuredClone({ ...first, artifact: { ...artifact, fileName: 'a.bin' } });
    const expectedInput = structuredClone({ ...artifact, displayName: 'A' });
    const chunkBefore = structuredClone(chunkInput);
    const expectedBefore = structuredClone(expectedInput);
    expect(isForArtifact(chunkInput, expectedInput, 0)).toBe(true);
    expect(chunkInput).toEqual(chunkBefore);
    expect(expectedInput).toEqual(expectedBefore);
  });
});
