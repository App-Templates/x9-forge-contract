import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  DEV_SESSION_AUTONOMOUS_LABEL,
  DEV_SESSION_BRANCH_PREFIX,
  DEV_SESSION_MAX_FILES,
  DevSessionAssignmentSchema,
  DevSessionDeliverySchema,
  DevSessionGitHubLinkSchema,
  DevSessionMaterialSchema,
  DevSessionResultSchema,
  devSessionAssignmentCanonicalJson,
  devSessionBranch,
  devSessionId,
  parseDevSessionBlock,
  parseDevSessionDelivery,
  renderDevSessionBlock,
  renderDevSessionDelivery,
} from '../../../src/capability/dev/session-assignment.js';
import type { AssetRef } from '../../../src/organization/asset.js';

const sha = (text: string) => createHash('sha256').update(text).digest('hex');
const COMMIT = 'c'.repeat(40);

const asset: AssetRef = {
  assetId: 'asset-design-1',
  sha256: 'a'.repeat(64),
  name: 'home.png',
  mediaType: 'image/png',
  sizeBytes: 2048,
  origin: { kind: 'email', messageId: 'msg-1', attachmentName: 'home.png' },
  tenantId: 'tenant-1',
  companyId: 'good-choice',
  projectId: 'good-choice-app',
  createdAt: '2026-10-27T10:00:00+01:00',
};

const assignment = {
  version: 1 as const,
  tenantId: 'tenant-1',
  ownerId: '7',
  organizationId: 'good-choice',
  companyId: 'good-choice',
  projectId: 'good-choice-app',
  businessUnit: { slug: 'sviluppo' },
  requestedBy: { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 },
  productKind: 'code' as const,
  title: 'Modulo A: scansione prodotto',
  task: 'Costruisci il Modulo A come PWA con test.',
  miniPlan: '1. Struttura. 2. Scansione. 3. Test.',
  materials: [
    { kind: 'asset' as const, asset },
    { kind: 'github_link' as const, url: 'https://github.com/App-Templates/gz-mockups/tree/main/home', note: 'prototipi' },
  ],
  destination: { repo: 'App-Templates/goodchoice-backtest' },
  createdAt: '2026-10-27T15:00:00+01:00',
};

describe('constants and helpers', () => {
  it('names the board label, the delivery branch and the session id', () => {
    expect(DEV_SESSION_AUTONOMOUS_LABEL).toBe('sessione:autonoma');
    expect(DEV_SESSION_BRANCH_PREFIX).toBe('consegna/');
    expect(devSessionBranch(12)).toBe('consegna/12');
    expect(devSessionId(12)).toBe('R12');
  });

  it.each([0, -1, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 2])('refuses issue number %s', (n) => {
    expect(() => devSessionBranch(n)).toThrow();
    expect(() => devSessionId(n)).toThrow();
  });
});

describe('DevSessionGitHubLinkSchema', () => {
  it.each([
    'https://github.com/App-Templates/gz-mockups',
    'https://github.com/App-Templates/gz-mockups.git',
    'https://github.com/App-Templates/gz-mockups/tree/main/home',
    'https://github.com/App-Templates/gz-mockups/blob/abc123/src/index.html',
  ])('accepts %s', (url) => {
    expect(DevSessionGitHubLinkSchema.safeParse(url).success).toBe(true);
  });

  it.each([
    ['http, not https', 'http://github.com/App-Templates/gz-mockups'],
    ['another host', 'https://gitlab.com/App-Templates/gz-mockups'],
    ['look-alike host', 'https://github.com.evil.example/App-Templates/gz-mockups'],
    ['userinfo trick', 'https://github.com@evil.example/App-Templates/gz-mockups'],
    ['credentials in the address', 'https://user:token@github.com/App-Templates/gz-mockups'],
    ['query string', 'https://github.com/App-Templates/gz-mockups?token=abc'],
    ['fragment', 'https://github.com/App-Templates/gz-mockups#readme'],
    ['explicit port', 'https://github.com:8443/App-Templates/gz-mockups'],
    ['only the owner', 'https://github.com/App-Templates'],
    ['parent segment', 'https://github.com/App-Templates/gz-mockups/tree/main/../../secret'],
    ['encoded parent segment', 'https://github.com/App-Templates/gz-mockups/tree/main/%2e%2e/%2E%2E/secret'],
    ['backslash', 'https://github.com/App-Templates/gz-mockups/tree/main\\..\\secret'],
    ['not a url', 'github.com/App-Templates/gz-mockups'],
    ['empty', ''],
    ['repo named with a dot segment', 'https://github.com/App-Templates/..'],
  ])('rejects %s', (_label, url) => {
    expect(DevSessionGitHubLinkSchema.safeParse(url).success).toBe(false);
  });

  it('mutation: without the host check a foreign host is accepted', () => {
    const mutant = z.string().max(512).refine((value) => {
      const url = new URL(value);
      return url.protocol === 'https:';
    });
    expect(mutant.safeParse('https://gitlab.com/App-Templates/gz-mockups').success).toBe(true);
    expect(DevSessionGitHubLinkSchema.safeParse('https://gitlab.com/App-Templates/gz-mockups').success).toBe(false);
  });
});

describe('DevSessionMaterialSchema', () => {
  it('accepts an asset and a GitHub link, and nothing else', () => {
    expect(DevSessionMaterialSchema.safeParse({ kind: 'asset', asset }).success).toBe(true);
    expect(DevSessionMaterialSchema.safeParse({ kind: 'github_link', url: 'https://github.com/a/b' }).success).toBe(true);
    expect(DevSessionMaterialSchema.safeParse({ kind: 'url', url: 'https://example.com/x' }).success).toBe(false);
    expect(DevSessionMaterialSchema.safeParse({ kind: 'github_link', url: 'https://github.com/a/b', extra: 1 }).success).toBe(false);
  });
});

describe('DevSessionAssignmentSchema', () => {
  it('accepts a complete assignment', () => {
    expect(DevSessionAssignmentSchema.parse(assignment)).toEqual(assignment);
  });

  it('accepts a design session without materials', () => {
    expect(DevSessionAssignmentSchema.safeParse({ ...assignment, productKind: 'design', materials: [] }).success).toBe(true);
  });

  it('rejects the other production kinds: only code and design pass through here', () => {
    for (const productKind of ['automation', 'presentation', 'deck', '']) {
      expect(DevSessionAssignmentSchema.safeParse({ ...assignment, productKind }).success).toBe(false);
    }
  });

  it('rejects a destination that is not owner/repo', () => {
    for (const repo of ['goodchoice-backtest', 'a/b/c', 'https://github.com/a/b', '../x', '']) {
      expect(DevSessionAssignmentSchema.safeParse({ ...assignment, destination: { repo } }).success).toBe(false);
    }
  });

  it('rejects unknown keys (no secrets or extra fields can ride along)', () => {
    expect(DevSessionAssignmentSchema.safeParse({ ...assignment, token: 'x' }).success).toBe(false);
    expect(DevSessionAssignmentSchema.safeParse({ ...assignment, businessUnit: { slug: 'sviluppo', extra: 1 } }).success).toBe(false);
  });

  it('rejects more materials than the limit', () => {
    const many = Array.from({ length: 21 }, () => ({ kind: 'github_link' as const, url: 'https://github.com/a/b' }));
    expect(DevSessionAssignmentSchema.safeParse({ ...assignment, materials: many }).success).toBe(false);
  });

  describe('materials of somebody else', () => {
    const reasonOf = (override: Partial<AssetRef>) => {
      const result = DevSessionAssignmentSchema.safeParse({
        ...assignment, materials: [{ kind: 'asset', asset: { ...asset, ...override } }],
      });
      return result.success ? 'accepted' : result.error.issues.map((issue) => issue.message).join(',');
    };

    it('accepts an asset of the same tenant, company and project, with no BU or with the same BU', () => {
      expect(reasonOf({})).toBe('accepted');
      expect(reasonOf({ buSlug: 'sviluppo' })).toBe('accepted');
    });

    it('rejects a foreign tenant', () => expect(reasonOf({ tenantId: 'tenant-2' })).toBe('material_foreign_tenant'));
    it('rejects a foreign company', () => expect(reasonOf({ companyId: 'altra-azienda' })).toBe('material_foreign_company'));
    it('rejects a foreign project', () => expect(reasonOf({ projectId: 'altro-progetto' })).toBe('material_foreign_project'));
    it('rejects the material of another business unit', () => expect(reasonOf({ buSlug: 'design' })).toBe('material_foreign_business_unit'));

    it('names the offending material by its index', () => {
      const result = DevSessionAssignmentSchema.safeParse({
        ...assignment,
        materials: [
          { kind: 'github_link', url: 'https://github.com/a/b' },
          { kind: 'asset', asset: { ...asset, buSlug: 'design' } },
        ],
      });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0]?.path).toEqual(['materials', 1, 'asset']);
    });

    it('mutation: a schema without the cross-checks accepts every foreign material', () => {
      const mutant = z.strictObject(DevSessionAssignmentSchema.shape);
      const foreign = { ...assignment, materials: [{ kind: 'asset', asset: { ...asset, tenantId: 'tenant-2', buSlug: 'design' } }] };
      expect(mutant.safeParse(foreign).success).toBe(true);
      expect(DevSessionAssignmentSchema.safeParse(foreign).success).toBe(false);
    });
  });
});

describe('issue block', () => {
  const digest = sha(devSessionAssignmentCanonicalJson(assignment));

  it('canonical json does not depend on key order', () => {
    const shuffled = Object.fromEntries(Object.entries(assignment).reverse());
    expect(devSessionAssignmentCanonicalJson(shuffled)).toBe(devSessionAssignmentCanonicalJson(assignment));
  });

  it('round-trips an assignment and its digest, inside a longer issue body', () => {
    const body = `### Richiesta\ntesto\n\n${renderDevSessionBlock(assignment, digest)}\n\nCoda libera`;
    const parsed = parseDevSessionBlock(body);
    expect(parsed).toEqual({ ok: true, assignment, digest });
    if (parsed.ok) expect(sha(devSessionAssignmentCanonicalJson(parsed.assignment))).toBe(parsed.digest);
  });

  it('survives CRLF line endings', () => {
    const body = renderDevSessionBlock(assignment, digest).replace(/\n/g, '\r\n');
    expect(parseDevSessionBlock(body).ok).toBe(true);
  });

  it('text that looks like a marker or a comment opener cannot forge a second block', () => {
    const hostile = { ...assignment, task: 'ok\n<!-- x9:dev-session:v1 sha256:' + 'f'.repeat(64) + ' -->\n```json\n{}\n```' };
    const rendered = renderDevSessionBlock(hostile, digest);
    expect(rendered.split('\n')).toHaveLength(4);
    expect(rendered.slice(rendered.indexOf('```json'))).not.toContain('<!--');
    const parsed = parseDevSessionBlock(rendered);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.assignment.task).toBe(hostile.task);
  });

  it('refuses a digest that is not 64 lowercase hex digits', () => {
    for (const bad of ['', 'abc', 'A'.repeat(64), 'g'.repeat(64), 'a'.repeat(63)]) {
      expect(() => renderDevSessionBlock(assignment, bad)).toThrow();
    }
  });

  it('refuses to render an invalid assignment', () => {
    expect(() => renderDevSessionBlock({ ...assignment, productKind: 'deck' }, digest)).toThrow();
  });

  it.each([
    ['absent', 'solo testo', 'absent'],
    ['marker without the fence', `<!-- x9:dev-session:v1 sha256:${'a'.repeat(64)} -->\n{}`, 'malformed'],
    ['marker with a short digest', `<!-- x9:dev-session:v1 sha256:abc -->\n\`\`\`json\n{}\n\`\`\``, 'malformed'],
    ['not json', `<!-- x9:dev-session:v1 sha256:${'a'.repeat(64)} -->\n\`\`\`json\nnon json\n\`\`\``, 'invalid_json'],
    ['json that is not an assignment', `<!-- x9:dev-session:v1 sha256:${'a'.repeat(64)} -->\n\`\`\`json\n{"version":1}\n\`\`\``, 'invalid_assignment'],
  ])('reports %s', (_label, body, reason) => {
    expect(parseDevSessionBlock(body)).toEqual({ ok: false, reason });
  });

  it('reports two blocks as ambiguous, never picks one', () => {
    const block = renderDevSessionBlock(assignment, digest);
    expect(parseDevSessionBlock(`${block}\n\n${block}`)).toEqual({ ok: false, reason: 'multiple' });
  });

  it('a block that carries a foreign material is an invalid assignment', () => {
    const foreign = { ...assignment, materials: [{ kind: 'asset', asset: { ...asset, tenantId: 'tenant-2' } }] };
    const body = `<!-- x9:dev-session:v1 sha256:${digest} -->\n\`\`\`json\n${JSON.stringify(foreign)}\n\`\`\``;
    expect(parseDevSessionBlock(body)).toEqual({ ok: false, reason: 'invalid_assignment' });
  });

  it('the digest changes when any field changes', () => {
    expect(sha(devSessionAssignmentCanonicalJson({ ...assignment, task: 'altro compito' }))).not.toBe(digest);
    expect(sha(devSessionAssignmentCanonicalJson({ ...assignment, projectId: 'altro' , materials: [] }))).not.toBe(digest);
  });
});

describe('delivery comment', () => {
  const a = { path: 'app/index.html', sha256: 'a'.repeat(64), sizeBytes: 120 };
  const b = { path: 'docs/readme.md', sha256: 'b'.repeat(64), sizeBytes: 0 };

  it('round-trips summary, commit and files', () => {
    const delivery = { summary: 'Fatto il Modulo A.\nTest verdi.', commit: COMMIT, files: [a, b] };
    expect(parseDevSessionDelivery(renderDevSessionDelivery(delivery))).toEqual({ ok: true, delivery });
  });

  it('a delivery without the commit line has a null commit', () => {
    const parsed = parseDevSessionDelivery(renderDevSessionDelivery({ summary: 'ok', commit: null, files: [a] }));
    expect(parsed).toEqual({ ok: true, delivery: { summary: 'ok', commit: null, files: [a] } });
  });

  it('a comment with no file list is a delivery of zero files, not an error', () => {
    expect(parseDevSessionDelivery('Fatto.')).toEqual({ ok: true, delivery: { summary: 'Fatto.', commit: null, files: [] } });
  });

  it('reads both bullet styles and ignores the case of the labels', () => {
    const body = `Riepilogo\n\ncommit: ${COMMIT}\nfile consegnati:\n* ${a.path} sha256:${a.sha256} ${a.sizeBytes} byte\n- ${b.path} sha256:${b.sha256} ${b.sizeBytes} byte`;
    expect(parseDevSessionDelivery(body)).toEqual({ ok: true, delivery: { summary: 'Riepilogo', commit: COMMIT, files: [a, b] } });
  });

  it('stops the list at the first line that is not an item', () => {
    const body = `x\nFile consegnati:\n- ${a.path} sha256:${a.sha256} ${a.sizeBytes} byte\n\n- ${b.path} sha256:${b.sha256} ${b.sizeBytes} byte`;
    const parsed = parseDevSessionDelivery(body);
    expect(parsed.ok && parsed.delivery.files).toEqual([a]);
  });

  it.each([
    ['a malformed item', 'File consegnati:\n- app/index.html sha256:abc 1 byte', 'invalid_line'],
    ['an item without the size', `File consegnati:\n- app/index.html sha256:${'a'.repeat(64)}`, 'invalid_line'],
    ['an uppercase digest', `File consegnati:\n- app/index.html sha256:${'A'.repeat(64)} 1 byte`, 'invalid_line'],
    ['an absolute path', `File consegnati:\n- /etc/passwd sha256:${'a'.repeat(64)} 1 byte`, 'unsafe_path'],
    ['a parent segment', `File consegnati:\n- ../x sha256:${'a'.repeat(64)} 1 byte`, 'unsafe_path'],
    ['a dot segment', `File consegnati:\n- a/./x sha256:${'a'.repeat(64)} 1 byte`, 'unsafe_path'],
    ['a backslash', `File consegnati:\n- a\\x sha256:${'a'.repeat(64)} 1 byte`, 'unsafe_path'],
    ['an empty segment', `File consegnati:\n- a//x sha256:${'a'.repeat(64)} 1 byte`, 'unsafe_path'],
    ['a size beyond the safe integers', `File consegnati:\n- a sha256:${'a'.repeat(64)} 99999999999999999999 byte`, 'invalid_line'],
    ['a repeated path', `File consegnati:\n- a sha256:${'a'.repeat(64)} 1 byte\n- a sha256:${'b'.repeat(64)} 2 byte`, 'duplicate_path'],
    ['a short commit', 'Commit: abc123\nFile consegnati:', 'invalid_commit'],
    ['an uppercase commit', `Commit: ${'C'.repeat(40)}\nFile consegnati:`, 'invalid_commit'],
    ['two commit lines', `Commit: ${COMMIT}\nCommit: ${'d'.repeat(40)}\nFile consegnati:`, 'multiple_commits'],
  ])('rejects %s', (_label, body, reason) => {
    expect(parseDevSessionDelivery(body)).toEqual({ ok: false, reason });
  });

  it('rejects more files than the limit', () => {
    const lines = Array.from({ length: DEV_SESSION_MAX_FILES + 1 }, (_, i) => `- f${i} sha256:${'a'.repeat(64)} 1 byte`);
    expect(parseDevSessionDelivery(`x\nFile consegnati:\n${lines.join('\n')}`)).toEqual({ ok: false, reason: 'too_many_files' });
  });

  it('refuses to render a duplicate path or a bad commit', () => {
    expect(() => renderDevSessionDelivery({ summary: 's', commit: null, files: [a, { ...a, sha256: 'c'.repeat(64) }] })).toThrow();
    expect(() => renderDevSessionDelivery({ summary: 's', commit: 'abc', files: [] })).toThrow();
    expect(DevSessionDeliverySchema.safeParse({ summary: 's', commit: null, files: [{ ...a, path: '/abs' }] }).success).toBe(false);
  });

  it('a commit-looking line inside the summary is not mistaken for the commit of another delivery', () => {
    const parsed = parseDevSessionDelivery(`Riepilogo\nCommit: ${COMMIT}\nFile consegnati:`);
    expect(parsed).toEqual({ ok: true, delivery: { summary: 'Riepilogo', commit: COMMIT, files: [] } });
  });
});

describe('DevSessionResultSchema', () => {
  const scope = { tenantId: 'tenant-1', ownerId: '7', agentId: 'capo-sviluppo' };
  const sessionAsset: AssetRef = {
    ...asset,
    assetId: 'R12-aaaaaaaaaaaaaaaaaaaaaaaa',
    name: 'index.html',
    mediaType: 'text/html',
    origin: { kind: 'session', sessionId: 'R12', repo: 'App-Templates/goodchoice-backtest', commit: COMMIT, path: 'app/index.html' },
  };
  const result = {
    sessionId: 'R12',
    issue: 12,
    scope,
    repo: 'App-Templates/goodchoice-backtest',
    branch: 'consegna/12',
    commit: COMMIT,
    link: `https://github.com/App-Templates/goodchoice-backtest/tree/${COMMIT}`,
    summary: 'Fatto.',
    files: [{
      path: 'app/index.html', name: 'index.html', sha256: 'a'.repeat(64), sizeBytes: 120, mediaType: 'text/html',
      link: `https://github.com/App-Templates/goodchoice-backtest/blob/${COMMIT}/app/index.html`,
    }],
    assets: [sessionAsset],
  };

  it('accepts a verified result', () => {
    expect(DevSessionResultSchema.parse(result)).toEqual(result);
  });

  it('a result with no commit, no files or no assets is not a result', () => {
    expect(DevSessionResultSchema.safeParse({ ...result, commit: 'abc' }).success).toBe(false);
    expect(DevSessionResultSchema.safeParse({ ...result, files: [] }).success).toBe(false);
    expect(DevSessionResultSchema.safeParse({ ...result, assets: [] }).success).toBe(false);
    const { commit: _commit, ...withoutCommit } = result;
    expect(DevSessionResultSchema.safeParse(withoutCommit).success).toBe(false);
  });
});
