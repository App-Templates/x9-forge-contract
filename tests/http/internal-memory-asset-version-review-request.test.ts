import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { InternalMemoryAssetVersionReviewRequestSchema } from '../../src/http/endpoints/internal-memory-asset-versions.js';
import { AssetVersionLeadReviewSchema } from '../../src/organization/asset-version.js';

const root = fileURLToPath(new URL('../../', import.meta.url));

/** Compile a consumer without writing the probe or emitting build artifacts. */
function contextDiagnostics(target: 'OrganizationRunContext' | 'number') {
  const config = ts.readConfigFile(join(root, 'tsconfig.json'), ts.sys.readFile);
  expect(config.error).toBeUndefined();
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  expect(parsed.errors).toEqual([]);
  const options: ts.CompilerOptions = {
    ...parsed.options, noEmit: true, composite: false, incremental: false,
  };
  const virtualPath = join(root, 'src', 's6579-review-context-probe.ts');
  const source = `
    import type { InternalMemoryAssetVersionReviewRequest } from './http/endpoints/internal-memory-asset-versions.js';
    import type { OrganizationRunContext } from './organization/run-context.js';
    declare const context: InternalMemoryAssetVersionReviewRequest['context'];
    const consumerContext: ${target} = context;
  `;
  const host = ts.createCompilerHost(options);
  const originalFileExists = host.fileExists.bind(host);
  const originalReadFile = host.readFile.bind(host);
  const originalGetSourceFile = host.getSourceFile.bind(host);
  host.fileExists = (path) => path === virtualPath || originalFileExists(path);
  host.readFile = (path) => path === virtualPath ? source : originalReadFile(path);
  host.getSourceFile = (path, languageVersion, onError, shouldCreateNewSourceFile) =>
    path === virtualPath
      ? ts.createSourceFile(path, source, languageVersion, true)
      : originalGetSourceFile(path, languageVersion, onError, shouldCreateNewSourceFile);
  const program = ts.createProgram([virtualPath], options, host);
  return ts.getPreEmitDiagnostics(program).map((diagnostic) => ({
    code: diagnostic.code,
    file: diagnostic.file?.fileName,
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
  }));
}

const context = {
  schemaVersion: 1,
  runId: 'run-6579-tenant-1',
  organizationId: 'good-choice',
  ownerId: '1',
  identity: { managementAgentId: 'capo-orto-design', runtimeAgentId: 'capo-orto-design', vaultAgentId: 20 },
  issuer: 'x9',
  issuedAt: '2026-11-12T07:00:00.000Z',
  expiresAt: '2026-11-12T09:00:00.000Z',
};
const fields = { buSlug: 'design', key: 'design-calendario', version: 2, verdict: 'ok' };
const request = { context, projectId: 'orto-facile', ...fields };
const review = { ...fields, reviewedBy: context.identity, reviewedAt: '2026-11-12T08:00:00.000Z' };

describe('s6579 revisione-tipo-contesto', () => {
  it('preserves the organization run context type after checking the compiler probe', () => {
    const invalid = contextDiagnostics('number');
    expect(invalid).toHaveLength(1);
    expect(invalid[0]).toMatchObject({
      code: 2322,
      file: join(root, 'src', 's6579-review-context-probe.ts'),
    });
    expect(invalid[0]?.message).toContain("is not assignable to type 'number'");
    expect(contextDiagnostics('OrganizationRunContext')).toEqual([]);
  });

  it('accepts current lead requests for ok without a reason and redo with a reason', () => {
    expect(InternalMemoryAssetVersionReviewRequestSchema.parse(request)).toEqual(request);
    const redo = { ...request, verdict: 'redo', reason: 'Improve the calendar legend.' };
    expect(InternalMemoryAssetVersionReviewRequestSchema.parse(redo)).toEqual(redo);
  });

  it('rejects redo without a reason with the same issue in the request and full review', () => {
    const requestResult = InternalMemoryAssetVersionReviewRequestSchema.safeParse({ ...request, verdict: 'redo' });
    const reviewResult = AssetVersionLeadReviewSchema.safeParse({ ...review, verdict: 'redo' });
    expect(requestResult.success).toBe(false);
    expect(reviewResult.success).toBe(false);
    if (!requestResult.success && !reviewResult.success) {
      const expected = [{ code: 'custom', path: ['reason'], message: 'A redo review requires a reason' }];
      expect(requestResult.error.issues).toEqual(expected);
      expect(reviewResult.error.issues).toEqual(expected);
    }
  });

  it('rejects caller review metadata, extra fields and a missing context', () => {
    for (const extra of [
      { reviewedBy: review.reviewedBy },
      { reviewedAt: review.reviewedAt },
      { unexpected: true },
    ]) {
      expect(InternalMemoryAssetVersionReviewRequestSchema.safeParse({ ...request, ...extra }).success).toBe(false);
    }
    const { context: omittedContext, ...withoutContext } = request;
    expect(omittedContext).toBe(context);
    expect(InternalMemoryAssetVersionReviewRequestSchema.safeParse(withoutContext).success).toBe(false);
  });
});
