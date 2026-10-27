import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AssetOriginSchema, AssetRefSchema } from '../../src/organization/asset.js';

const COMMIT = 'c'.repeat(40);
const pointer = { repo: 'App-Templates/goodchoice-backtest', commit: COMMIT, path: 'app/index.html' };

describe('session origin with a delivery pointer (1.74.0)', () => {
  it('still accepts the older session origin with only the session id', () => {
    expect(AssetOriginSchema.safeParse({ kind: 'session', sessionId: 'R12' }).success).toBe(true);
  });

  it('accepts the pointer with repo, commit and path together', () => {
    const origin = { kind: 'session', sessionId: 'R12', ...pointer };
    expect(AssetOriginSchema.parse(origin)).toEqual(origin);
  });

  it.each([
    ['only the repo', { repo: pointer.repo }],
    ['only the commit', { commit: pointer.commit }],
    ['only the path', { path: pointer.path }],
    ['repo and commit without the path', { repo: pointer.repo, commit: pointer.commit }],
  ])('rejects %s', (_label, part) => {
    expect(AssetOriginSchema.safeParse({ kind: 'session', sessionId: 'R12', ...part }).success).toBe(false);
  });

  it.each([
    ['a repo that is not owner/repo', { ...pointer, repo: 'goodchoice-backtest' }],
    ['a short commit', { ...pointer, commit: 'abc123' }],
    ['an uppercase commit', { ...pointer, commit: 'C'.repeat(40) }],
    ['an absolute path', { ...pointer, path: '/etc/passwd' }],
    ['a parent segment', { ...pointer, path: '../secret' }],
    ['a backslash', { ...pointer, path: 'a\\b' }],
    ['an empty segment', { ...pointer, path: 'a//b' }],
  ])('rejects %s', (_label, bad) => {
    expect(AssetOriginSchema.safeParse({ kind: 'session', sessionId: 'R12', ...bad }).success).toBe(false);
  });

  it('keeps the other origins strict: the pointer fields do not leak into them', () => {
    expect(AssetOriginSchema.safeParse({ kind: 'email', messageId: 'm', ...pointer }).success).toBe(false);
    expect(AssetOriginSchema.safeParse({ kind: 'link', url: 'https://example.com/x', ...pointer }).success).toBe(false);
  });

  it('works inside an asset ref', () => {
    const ref = {
      assetId: 'R12-aaaaaaaaaaaaaaaaaaaaaaaa', sha256: 'a'.repeat(64), name: 'index.html', mediaType: 'text/html', sizeBytes: 12,
      origin: { kind: 'session', sessionId: 'R12', ...pointer },
      tenantId: 't', companyId: 'c', projectId: 'p', createdAt: '2026-10-27T15:00:00+01:00',
    };
    expect(AssetRefSchema.parse(ref)).toEqual(ref);
  });

  it('mutation: an origin without the all-or-none rule accepts a half pointer', () => {
    const mutant = z.strictObject({ ...AssetOriginSchema.options[2].shape });
    expect(mutant.safeParse({ kind: 'session', sessionId: 'R12', repo: pointer.repo }).success).toBe(true);
    expect(AssetOriginSchema.safeParse({ kind: 'session', sessionId: 'R12', repo: pointer.repo }).success).toBe(false);
  });
});
