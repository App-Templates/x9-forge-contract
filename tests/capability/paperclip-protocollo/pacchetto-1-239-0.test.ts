import { execFileSync } from 'node:child_process';
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
  it('s7516_version: package and first CHANGELOG release are 1.241.0', () => {
    const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const firstRelease = /^## v(\d+\.\d+\.\d+)/m.exec(changelog)?.[1];
    expect(firstRelease).toBe('1.241.0');
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
