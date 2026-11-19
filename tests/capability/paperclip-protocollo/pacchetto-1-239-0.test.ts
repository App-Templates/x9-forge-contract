import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_MONITOR_MAX_ATTEMPTS_CAP, PaperclipFollowUpSchema, paperclipMonitorBounds,
} from '../../../src/capability/paperclip/native-wait.js';
import {
  ASSET_MISMATCH_FIELDS, AssetMismatchFieldSchema, INTERNAL_MEMORY_ASSET_REFUSAL_CODES,
  InternalMemoryAssetMismatchRefusalSchema, InternalMemoryAssetRefusalCodeSchema, assetMismatchFieldOf,
} from '../../../src/http/endpoints/internal-memory-assets.js';
import { AssetRefSchema } from '../../../src/organization/asset.js';
import {
  DevSessionBaseSchema, devSessionAssignmentCanonicalJson, parseDevSessionBlock, renderDevSessionBlock,
} from '../../../src/capability/dev/session-assignment.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const cleanEnv = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };

function packageVersion(): string {
  return (JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string }).version;
}

function loadSection(mode: 'esm' | 'cjs'): string {
  const body = 'process.stdout.write(m.communicationSection());';
  const script = mode === 'esm'
    ? `const m = await import('./dist/capability/paperclip/communication-channels.js'); ${body}`
    : `const m = require('./dist/capability/paperclip/communication-channels.cjs'); ${body}`;
  const args = mode === 'esm' ? ['--input-type=module', '-e', script] : ['-e', script];
  return execFileSync(process.execPath, args, {
    cwd: root,
    env: cleanEnv,
    encoding: 'utf8',
  });
}

describe('s7427 pacchetto-1-239-0', () => {
  it('s7427_version: the CHANGELOG contains the 1.239.0 release and package matches the first one', () => {
    const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const firstRelease = /^## v(\d+\.\d+\.\d+)/m.exec(changelog)?.[1];
    expect(changelog).toContain('## v1.239.0');
    expect(packageVersion()).toBe(firstRelease);
  });

  for (const mode of ['esm', 'cjs'] as const) {
    it(`s7427_${mode}: built channels describe system delivery with a clean environment`, () => {
      const section = loadSection(mode);
      expect(section).toContain("li porta il sistema sull'incarico alla chiusura");
      expect(section).toContain('sessione di sviluppo');
      expect(section).not.toContain('lo lego al mio commento');
      expect(section).not.toContain('reopen');
    });
  }

  it('s7427_map: narrow imports map matches the package version', () => {
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as { versione: string };
    expect(map.versione).toBe(packageVersion());
  });
});

function builtFollowUp(mode: 'esm' | 'cjs'): unknown {
  const body = `process.stdout.write(JSON.stringify({
    bounds: m.paperclipMonitorBounds({ attempts: 3 }, 11),
    cap: m.PAPERCLIP_MONITOR_MAX_ATTEMPTS_CAP,
    description: m.PaperclipFollowUpSchema.description,
  }));`;
  const script = mode === 'esm'
    ? `const m = await import('./dist/capability/paperclip/native-wait.js'); ${body}`
    : `const m = require('./dist/capability/paperclip/native-wait.cjs'); ${body}`;
  const args = mode === 'esm' ? ['--input-type=module', '-e', script] : ['-e', script];
  return JSON.parse(execFileSync(process.execPath, args, { cwd: root, env: cleanEnv, encoding: 'utf8' }));
}

describe('s7502 pacchetto-1-240-0', () => {
  it('s7502_version: the CHANGELOG contains the 1.240.0 release and package matches the first one', () => {
    const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const firstRelease = /^## v(\d+\.\d+\.\d+)/m.exec(changelog)?.[1];
    expect(changelog).toContain('## v1.240.0');
    expect(packageVersion()).toBe(firstRelease);
  });

  it('s7502_conto: maxAttempts is the live count plus attempts', () => {
    expect(paperclipMonitorBounds({ attempts: 3 }, 11)).toEqual({ maxAttempts: 14, recoveryPolicy: 'wake_owner' });
    expect(paperclipMonitorBounds({ attempts: 3 })?.maxAttempts).toBe(3);
    expect(paperclipMonitorBounds({ attempts: 3 }, 0)?.maxAttempts).toBe(3);
    expect(paperclipMonitorBounds(undefined, 11)).toBeUndefined();
  });

  it('s7502_tetto: the sum is capped at 100', () => {
    expect(PAPERCLIP_MONITOR_MAX_ATTEMPTS_CAP).toBe(100);
    expect(paperclipMonitorBounds({ attempts: 5 }, 98)?.maxAttempts).toBe(100);
    expect(paperclipMonitorBounds({ attempts: 3 }, 100)?.maxAttempts).toBe(100);
    expect(paperclipMonitorBounds({ attempts: 3 }, 250)?.maxAttempts).toBe(100);
  });

  it('s7502_conto_illeggibile: negative, fractional and NaN counts are 0', () => {
    for (const bad of [-1, 2.5, Number.NaN]) expect(paperclipMonitorBounds({ attempts: 3 }, bad)?.maxAttempts).toBe(3);
  });

  it('s7502_testo: the field text says from now, names the cap and the schema is unchanged', () => {
    const text = PaperclipFollowUpSchema.description ?? '';
    expect(text).toContain('from now');
    expect(text).not.toContain('in total');
    expect(text).toContain(String(PAPERCLIP_MONITOR_MAX_ATTEMPTS_CAP));
    expect(text).toContain('refused');
    expect(PaperclipFollowUpSchema.safeParse({ attempts: 1 }).success).toBe(true);
    expect(PaperclipFollowUpSchema.safeParse({ attempts: 5 }).success).toBe(true);
    for (const bad of [{ attempts: 0 }, { attempts: 6 }, { attempts: 1.5 }, {}, { attempts: 1, extra: 1 }]) {
      expect(PaperclipFollowUpSchema.safeParse(bad).success).toBe(false);
    }
  });

  for (const mode of ['esm', 'cjs'] as const) {
    it(`s7502_dist_${mode}: the built package has the builder, the cap and the text`, () => {
      const built = builtFollowUp(mode) as { bounds: { maxAttempts: number }; cap: number; description: string };
      expect(built.bounds.maxAttempts).toBe(14);
      expect(built.cap).toBe(100);
      expect(built.description).toBe(PaperclipFollowUpSchema.description);
      expect(built.description).toContain('from now');
      expect(built.description).not.toContain('in total');
      expect(built.description).toContain('100');
      expect(built.description).toContain('refused');
    });
  }

  it('s7502_map: narrow imports map matches the package version', () => {
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as { versione: string };
    expect(map.versione).toBe(packageVersion());
  });
});

const NINE = ['tenantId', 'companyId', 'projectId', 'buSlug', 'origin', 'name', 'mediaType', 'sha256', 'sizeBytes'];

function builtMismatch(mode: 'esm' | 'cjs'): unknown {
  const body = `process.stdout.write(JSON.stringify({
    fields: m.ASSET_MISMATCH_FIELDS,
    read: m.assetMismatchFieldOf({ code: 'asset_mismatch', details: { field: 'sizeBytes' } }),
    codes: m.INTERNAL_MEMORY_ASSET_REFUSAL_CODES,
  }));`;
  const script = mode === 'esm'
    ? `const m = await import('./dist/http/endpoints/internal-memory-assets.js'); ${body}`
    : `const m = require('./dist/http/endpoints/internal-memory-assets.cjs'); ${body}`;
  const args = mode === 'esm' ? ['--input-type=module', '-e', script] : ['-e', script];
  return JSON.parse(execFileSync(process.execPath, args, { cwd: root, env: cleanEnv, encoding: 'utf8' }));
}

describe('s7516 pacchetto-1-241-0', () => {
  it('s7516_version: the CHANGELOG contains the 1.241.0 release and package matches the first one', () => {
    const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const firstRelease = /^## v(\d+\.\d+\.\d+)/m.exec(changelog)?.[1];
    expect(changelog).toContain('## v1.241.0');
    expect(packageVersion()).toBe(firstRelease);
  });

  it('s7516_codici: the two refusal codes', () => {
    expect([...INTERNAL_MEMORY_ASSET_REFUSAL_CODES]).toEqual(['asset_foreign_business_unit', 'asset_mismatch']);
    expect(InternalMemoryAssetRefusalCodeSchema.enum.asset_mismatch).toBe('asset_mismatch');
  });

  it('s7516_campi: the nine names in the order of the checks, each a key of the asset reference', () => {
    expect([...ASSET_MISMATCH_FIELDS]).toEqual(NINE);
    for (const name of ASSET_MISMATCH_FIELDS) expect(Object.keys(AssetRefSchema.shape)).toContain(name);
    expect(AssetMismatchFieldSchema.safeParse('sha256').success).toBe(true);
  });

  it('s7516_rifiuto: with or without details; unknown field, wrong type and other code refused', () => {
    const S = InternalMemoryAssetMismatchRefusalSchema;
    expect(S.safeParse({ code: 'asset_mismatch', message: 'm' }).success).toBe(true);
    expect(S.safeParse({ code: 'asset_mismatch', message: 'm', details: { field: 'name' } }).success).toBe(true);
    expect(S.safeParse({ code: 'asset_mismatch', message: 'm', details: { field: 'password' } }).success).toBe(false);
    expect(S.safeParse({ code: 'asset_mismatch', message: 'm', details: { field: 7 } }).success).toBe(false);
    expect(S.safeParse({ code: 'content_not_found', message: 'm' }).success).toBe(false);
  });

  it('s7516_lettore: the reader gives the name or undefined, never throws', () => {
    for (const field of NINE) {
      expect(assetMismatchFieldOf({ code: 'asset_mismatch', details: { field } })).toBe(field);
    }
    expect(assetMismatchFieldOf({ code: 'content_not_found', details: { field: 'sha256' } })).toBeUndefined();
    for (const details of [undefined, null, ['sha256'], 'sha256', { field: 'password' }, { field: ['sha256'] }]) {
      expect(assetMismatchFieldOf({ code: 'asset_mismatch', details })).toBeUndefined();
    }
    expect(assetMismatchFieldOf({ code: 'asset_mismatch' })).toBeUndefined();
  });

  for (const mode of ['esm', 'cjs'] as const) {
    it(`s7516_dist_${mode}: the built package has the names, the reader and the codes`, () => {
      const built = builtMismatch(mode) as { fields: string[]; read: string; codes: string[] };
      expect(built.fields).toEqual(NINE);
      expect(built.read).toBe('sizeBytes');
      expect(built.codes).toEqual(['asset_foreign_business_unit', 'asset_mismatch']);
    });
  }

  it('s7516_map: narrow imports map matches the package version', () => {
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as { versione: string };
    expect(map.versione).toBe(packageVersion());
  });
});

const sha = (text: string) => createHash('sha256').update(text).digest('hex');
const STORICO_DIGEST = 'ef2cee93f58924724cca6a0825213e34266596cc93dc97e6b72b7169261b47e7';
// Block rendered by 1.241.0 (before `base` existed) for `storico`; frozen here, never regenerated from new code.
const STORICO_BLOCK = "<!-- x9:dev-session:v1 sha256:ef2cee93f58924724cca6a0825213e34266596cc93dc97e6b72b7169261b47e7 -->\n```json\n{\"businessUnit\":{\"slug\":\"sviluppo\"},\"companyId\":\"good-choice\",\"createdAt\":\"2026-10-27T15:00:00+01:00\",\"destination\":{\"repo\":\"App-Templates/goodchoice-backtest\"},\"materials\":[{\"asset\":{\"assetId\":\"asset-design-1\",\"companyId\":\"good-choice\",\"createdAt\":\"2026-10-27T10:00:00+01:00\",\"mediaType\":\"image/png\",\"name\":\"home.png\",\"origin\":{\"attachmentName\":\"home.png\",\"kind\":\"email\",\"messageId\":\"msg-1\"},\"projectId\":\"good-choice-app\",\"sha256\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sizeBytes\":2048,\"tenantId\":\"tenant-1\"},\"kind\":\"asset\"},{\"kind\":\"github_link\",\"note\":\"prototipi\",\"url\":\"https://github.com/App-Templates/gz-mockups/tree/main/home\"}],\"miniPlan\":\"1. Struttura. 2. Scansione. 3. Test.\",\"organizationId\":\"good-choice\",\"ownerId\":\"7\",\"productKind\":\"code\",\"projectId\":\"good-choice-app\",\"requestedBy\":{\"managementAgentId\":\"capo-sviluppo\",\"runtimeAgentId\":\"capo-sviluppo\",\"vaultAgentId\":62},\"task\":\"Costruisci il Modulo A come PWA con test.\",\"tenantId\":\"tenant-1\",\"title\":\"Modulo A: scansione prodotto\",\"version\":1}\n```";

const storicoAsset = {
  assetId: 'asset-design-1', sha256: 'a'.repeat(64), name: 'home.png', mediaType: 'image/png', sizeBytes: 2048,
  origin: { kind: 'email', messageId: 'msg-1', attachmentName: 'home.png' },
  tenantId: 'tenant-1', companyId: 'good-choice', projectId: 'good-choice-app', createdAt: '2026-10-27T10:00:00+01:00',
};
const storico = {
  version: 1 as const, tenantId: 'tenant-1', ownerId: '7', organizationId: 'good-choice', companyId: 'good-choice',
  projectId: 'good-choice-app', businessUnit: { slug: 'sviluppo' },
  requestedBy: { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 },
  productKind: 'code' as const, title: 'Modulo A: scansione prodotto',
  task: 'Costruisci il Modulo A come PWA con test.', miniPlan: '1. Struttura. 2. Scansione. 3. Test.',
  materials: [
    { kind: 'asset' as const, asset: storicoAsset },
    { kind: 'github_link' as const, url: 'https://github.com/App-Templates/gz-mockups/tree/main/home', note: 'prototipi' },
  ],
  destination: { repo: 'App-Templates/goodchoice-backtest' },
  createdAt: '2026-10-27T15:00:00+01:00',
};
const withBase = { ...storico, base: { ramo: 'consegna/49', commit: 'a'.repeat(40) } };

function builtBase(mode: 'esm' | 'cjs'): { storico: string; base: string } {
  const body = `const sha = (t) => require_('node:crypto').createHash('sha256').update(t).digest('hex');
    process.stdout.write(JSON.stringify({
      storico: sha(m.devSessionAssignmentCanonicalJson(${JSON.stringify(storico)})),
      base: sha(m.devSessionAssignmentCanonicalJson(${JSON.stringify(withBase)})),
    }));`;
  const script = mode === 'esm'
    ? `import { createHash } from 'node:crypto'; const require_ = () => ({ createHash }); const m = await import('./dist/capability/dev/session-assignment.js'); ${body}`
    : `const require_ = require; const m = require('./dist/capability/dev/session-assignment.cjs'); ${body}`;
  const args = mode === 'esm' ? ['--input-type=module', '-e', script] : ['-e', script];
  return JSON.parse(execFileSync(process.execPath, args, { cwd: root, env: cleanEnv, encoding: 'utf8' }));
}

describe('s7571 pacchetto-1-242-0', () => {
  it('s7571_version: the CHANGELOG contains 1.242.0 and package matches the first release', () => {
    const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const firstRelease = /^## v(\d+\.\d+\.\d+)/m.exec(changelog)?.[1];
    expect(changelog).toContain('## v1.242.0');
    expect(packageVersion()).toBe(firstRelease);
  });

  it('s7571_storico: an assignment without base keeps its digest, form and block byte for byte', () => {
    expect(sha(devSessionAssignmentCanonicalJson(storico))).toBe(STORICO_DIGEST);
    expect(devSessionAssignmentCanonicalJson(storico)).not.toContain('"base"');
    const parsed = parseDevSessionBlock(`Corpo\n\n${STORICO_BLOCK}\n`);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.assignment.base).toBeUndefined();
      expect(sha(devSessionAssignmentCanonicalJson(parsed.assignment))).toBe(STORICO_DIGEST);
    }
    expect(renderDevSessionBlock(storico, STORICO_DIGEST)).toBe(STORICO_BLOCK);
  });

  it('s7571_base: accepted, in the canonical json, in the block, and part of the digest', () => {
    const canonical = devSessionAssignmentCanonicalJson(withBase);
    expect(canonical).toContain(`"base":{"commit":"${'a'.repeat(40)}","ramo":"consegna/49"}`);
    const digest = sha(canonical);
    expect(digest).not.toBe(STORICO_DIGEST);
    const parsed = parseDevSessionBlock(renderDevSessionBlock(withBase, digest));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.assignment.base).toEqual({ ramo: 'consegna/49', commit: 'a'.repeat(40) });
      expect(sha(devSessionAssignmentCanonicalJson(parsed.assignment))).toBe(parsed.digest);
    }
    const otherBranch = { ...storico, base: { ramo: 'consegna/50', commit: 'a'.repeat(40) } };
    const otherCommit = { ...storico, base: { ramo: 'consegna/49', commit: 'b'.repeat(40) } };
    expect(sha(devSessionAssignmentCanonicalJson(otherBranch))).not.toBe(digest);
    expect(sha(devSessionAssignmentCanonicalJson(otherCommit))).not.toBe(digest);
    expect(DevSessionBaseSchema.safeParse({ ramo: 'main', commit: 'a'.repeat(40) }).success).toBe(true);
  });

  it('s7571_ramo: refuses what looks like a path or an option, accepts real branch names', () => {
    const ok = (ramo: string) => DevSessionBaseSchema.safeParse({ ramo, commit: 'a'.repeat(40) }).success;
    for (const bad of ['', 'a..b', 'a//b', 'a/', 'a.', 'x.lock', 'a/x.lock/b', '-f', 'a b', 'a@{1}', 'x'.repeat(201), '/abs']) {
      expect(ok(bad), JSON.stringify(bad)).toBe(false);
    }
    for (const good of ['main', 'consegna/49', 'release/1.2.3']) expect(ok(good), good).toBe(true);
  });

  it('s7571_commit: refuses short, long, uppercase, non-hex and null commits', () => {
    const ok = (commit: unknown) => DevSessionBaseSchema.safeParse({ ramo: 'main', commit }).success;
    for (const bad of ['a'.repeat(39), 'a'.repeat(41), 'A'.repeat(40), 'g'.repeat(40), null]) expect(ok(bad)).toBe(false);
    expect(ok('0123456789abcdef0123456789abcdef01234567')).toBe(true);
  });

  it('s7571_stretto: an extra field, a missing branch or a missing commit is refused', () => {
    const commit = 'a'.repeat(40);
    expect(DevSessionBaseSchema.safeParse({ ramo: 'main', commit, extra: 1 }).success).toBe(false);
    expect(DevSessionBaseSchema.safeParse({ commit }).success).toBe(false);
    expect(DevSessionBaseSchema.safeParse({ ramo: 'main' }).success).toBe(false);
    expect(parseDevSessionBlock(renderDevSessionBlock(withBase, STORICO_DIGEST)).ok).toBe(true);
  });

  for (const mode of ['esm', 'cjs'] as const) {
    it(`s7571_dist_${mode}: the built package gives the same digests with a clean environment`, () => {
      const built = builtBase(mode);
      expect(built.storico).toBe(STORICO_DIGEST);
      expect(built.base).toBe(sha(devSessionAssignmentCanonicalJson(withBase)));
    });
  }

  it('s7571_map: narrow imports map matches the package version', () => {
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as { versione: string };
    expect(map.versione).toBe(packageVersion());
  });
});


function builtSession(mode: 'esm' | 'cjs', body: string): unknown {
  const script = mode === 'esm'
    ? `const m = await import('@x9-forge/contracts/capability/dev'); ${body}`
    : `const m = require('@x9-forge/contracts/capability/dev'); ${body}`;
  const args = mode === 'esm' ? ['--input-type=module', '-e', script] : ['-e', script];
  return JSON.parse(execFileSync(process.execPath, args, { cwd: root, env: cleanEnv, encoding: 'utf8' }));
}

const acceptanceFunctions = [
  'devSessionRequirements', 'devSessionCoverageSlots', 'devSessionAcceptanceVerdict',
  'devSessionMandateAcceptanceProblem',
];

describe('s7564 pacchetto-1-243-0', () => {
  it('s7564_version: package and first CHANGELOG release are 1.243.0', () => {
    const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    expect(packageVersion()).toBe('1.243.0');
    expect(/^## v(\d+\.\d+\.\d+)/m.exec(changelog)?.[1]).toBe('1.243.0');
  });

  for (const mode of ['esm', 'cjs'] as const) {
    it(`s7564_${mode}: the built acceptance contract is available with a clean environment`, () => {
      const built = builtSession(mode, `process.stdout.write(JSON.stringify({
        safeParse: typeof m.DevSessionAcceptanceSchema.safeParse,
        functions: ${JSON.stringify(acceptanceFunctions)}.map((name) => typeof m[name]),
        templateIds: m.DEV_SESSION_TEMPLATE_IDS,
        attestationFile: m.DEV_SESSION_ATTESTATION_FILE,
        invalidAccepted: m.DevSessionAcceptanceSchema.safeParse({}).success,
      }));`);
      expect(built).toEqual({
        safeParse: 'function', functions: acceptanceFunctions.map(() => 'function'),
        templateIds: ['sviluppo-pezzo-app', 'design-sito', 'design-schermata-app', 'design-ritocco'],
        attestationFile: 'ATTESTAZIONE.json', invalidAccepted: false,
      });
    });
  }

  it('s7564_map: the built map has the current version and every new public name', () => {
    const text = readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8');
    expect((JSON.parse(text) as { versione: string }).versione).toBe(packageVersion());
    for (const name of [
      'DevSessionAcceptanceSchema', ...acceptanceFunctions,
      'DEV_SESSION_TEMPLATE_IDS', 'DEV_SESSION_ATTESTATION_FILE',
    ]) expect(text).toContain(`"${name}"`);
  });

  it('s7564_blocco_vecchio: ESM and CJS preserve literal digests, old blocks and optional base', () => {
    const body = `const crypto = REQUIRE_CRYPTO;
      const hash = (text) => crypto.createHash('sha256').update(text).digest('hex');
      const oldCanonical = m.devSessionAssignmentCanonicalJson(${JSON.stringify(storico)});
      const baseCanonical = m.devSessionAssignmentCanonicalJson(${JSON.stringify(withBase)});
      const oldParsed = m.parseDevSessionBlock(${JSON.stringify(STORICO_BLOCK)});
      const baseParsed = m.parseDevSessionBlock(m.renderDevSessionBlock(
        ${JSON.stringify(withBase)}, 'b2bf777bd73b189de75b2f9c9afe4d3efe3e54bb27e70b505042d81641bd2bf0'));
      process.stdout.write(JSON.stringify({
        oldDigest: hash(oldCanonical), baseDigest: hash(baseCanonical),
        oldParsed, baseParsed,
        oldHasAcceptance: Object.hasOwn(JSON.parse(oldCanonical), 'acceptance'),
        baseHasAcceptance: Object.hasOwn(JSON.parse(baseCanonical), 'acceptance'),
      }));`;
    for (const mode of ['esm', 'cjs'] as const) {
      const built = builtSession(mode, body.replace('REQUIRE_CRYPTO', mode === 'esm'
        ? "await import('node:crypto')" : "require('node:crypto')")) as {
        oldDigest: string; baseDigest: string;
        oldParsed: { ok: boolean; assignment?: typeof storico & { acceptance?: unknown } };
        baseParsed: { ok: boolean; assignment?: typeof withBase & { acceptance?: unknown } };
        oldHasAcceptance: boolean; baseHasAcceptance: boolean;
      };
      expect(built.oldDigest, mode).toBe(STORICO_DIGEST);
      expect(built.baseDigest, mode).toBe('b2bf777bd73b189de75b2f9c9afe4d3efe3e54bb27e70b505042d81641bd2bf0');
      expect(built.oldParsed.ok, mode).toBe(true);
      expect(built.oldParsed.assignment, mode).toEqual(storico);
      expect(built.oldParsed.assignment?.acceptance, mode).toBeUndefined();
      expect(built.baseParsed.ok, mode).toBe(true);
      expect(built.baseParsed.assignment, mode).toEqual(withBase);
      expect(built.baseParsed.assignment?.acceptance, mode).toBeUndefined();
      expect(built.oldHasAcceptance, mode).toBe(false);
      expect(built.baseHasAcceptance, mode).toBe(false);
    }
  });

  it('s7564_peso: the measured dev import fits a justified, bounded budget', () => {
    const measured = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', `
      import { misuraSottopercorsi } from './scripts/import-heap.mjs';
      process.stdout.write(JSON.stringify(await misuraSottopercorsi({
        radice: process.cwd(), chiavi: ['./capability/dev'],
      })));
    `], { cwd: root, env: cleanEnv, encoding: 'utf8' })) as {
      chiave: string; heapMb: number; moduli: number;
    }[];
    const budgets = JSON.parse(readFileSync(resolve(root, 'tests/memory/import-heap-budgets.json'), 'utf8')) as {
      voci: Record<string, { heap_mb: number; moduli: number; motivo: string }>;
    };
    expect(measured).toHaveLength(1);
    const measure = measured[0]!;
    const budget = budgets.voci['./capability/dev']!;
    expect(measure.chiave).toBe('./capability/dev');
    expect(measure.heapMb).toBeGreaterThan(0);
    expect(measure.moduli).toBeGreaterThan(0);
    expect(budget.motivo).toContain('7564');
    expect(budget.heap_mb).toBeGreaterThan(0);
    expect(measure.heapMb).toBeLessThanOrEqual(budget.heap_mb);
    expect(measure.moduli).toBeLessThanOrEqual(budget.moduli);
    expect(budget.heap_mb).toBeLessThanOrEqual(measure.heapMb * 1.25 + 1);
  });
});
