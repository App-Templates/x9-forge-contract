import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const env = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };
const subpath = './capability/social-listening';
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
  version: string;
  exports: Record<string, { types: string; import: string; require: string }>;
  zshy: { exports: Record<string, string> };
};

describe('s3604 social listening public distribution', () => {
  it('s3604 declares the reserved version and public entry points', () => {
    expect(packageJson.version).toBe('1.230.0');
    expect(packageJson.version).toMatch(/^1\.23[0-9]\.0$/);
    expect(packageJson.zshy.exports[subpath]).toBe('./src/capability/social-listening/index.ts');
    expect(packageJson.exports[subpath]).toEqual({
      types: './dist/capability/social-listening/index.d.cts',
      import: './dist/capability/social-listening/index.js',
      require: './dist/capability/social-listening/index.cjs',
    });
  });

  for (const system of ['ESM', 'CommonJS']) {
    const loader = system === 'ESM'
      ? 'const load = (specifier) => import(specifier);'
      : "import { createRequire } from 'node:module'; const load = createRequire(import.meta.url);";

    it(`s3604 imports social listening through ${system} in a clean environment`, () => {
      const output = execFileSync(process.execPath, ['--input-type=module', '-e', `
        import assert from 'node:assert/strict';
        ${loader}
        const social = await load('@x9-forge/contracts/capability/social-listening');
        assert.equal(social.SOCIAL_LISTENING_TOOLS.recap, 'social_recap');
        assert.equal(typeof social.SocialTopicSchema.safeParse, 'function');
        assert.ok(social.SOCIAL_LISTENING_PARAMETERS.parameters.length > 0);
        process.stdout.write('ok');
      `], { cwd: root, env, encoding: 'utf8' });
      expect(output).toBe('ok');
    });

    it(`s3604 imports caller research parameters and social spend through ${system}`, () => {
      const output = execFileSync(process.execPath, ['--input-type=module', '-e', `
        import assert from 'node:assert/strict';
        ${loader}
        const research = await load('@x9-forge/contracts/capability/ricerca');
        assert.equal(typeof research.resolveResearchParams, 'function');
        assert.equal(typeof research.ResearchCallerParamsSchema.safeParse, 'function');
        assert.equal(research.ResearchCallerParamsSchema.safeParse({}).success, true);
        assert.ok(research.SpendingCapabilitySchema.options.includes('social'));
        process.stdout.write('ok');
      `], { cwd: root, env, encoding: 'utf8' });
      expect(output).toBe('ok');
    });
  }

  it('s3604 keeps the narrow imports map at the package version', () => {
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as {
      versione: string;
    };
    expect(map.versione).toBe(packageJson.version);
    expect(map.versione).toBe('1.230.0');
  });

  it('s3604 documents the release above v1.223.0', () => {
    const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const release = changelog.indexOf('## v1.230.0');
    const previous = changelog.indexOf('## v1.223.0');
    expect(release).toBeGreaterThan(changelog.indexOf('## Non rilasciato'));
    expect(previous).toBeGreaterThan(release);
  });
});
