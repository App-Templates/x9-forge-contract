import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ENV = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };

function node(script: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: root,
    env: ENV,
    encoding: 'utf8',
  }).trim();
}

const CHECK = `
import assert from 'node:assert/strict';
const sl = SOCIAL_LISTENING;
const endpoints = ENDPOINTS;
assert.deepEqual(sl.SOCIAL_RESEARCH_NARROW_PARAMS, {
  maxToolCalls: 1,
  searchContextSize: 'low',
  reasoningEffort: 'low',
});
assert.equal(sl.SOCIAL_TOPIC_VIDEO_TOOLS.text, 'social_topic_brief_text');
assert.equal(sl.SOCIAL_TOPIC_VIDEO_TOOLS.link, 'social_topic_video_link');
assert.equal(endpoints.socialAdoptionDecideContract.path, '/internal/capability/agents/:agentId/adoption-decisions');
console.log('OK');
`;

describe('s9763 narrow research, adoption decision and video brief in package 1.287.0', () => {
  it('s9763 (a) package.json has version 1.291.0', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(287|288|289|290|291)\.0$/);
  });

  it('s9763 (b) the research parameters, adoption route and video tools work from ESM', () => {
    const script = CHECK
      .replace('SOCIAL_LISTENING', `(await import('@x9-forge/contracts/capability/social-listening'))`)
      .replace('ENDPOINTS', `(await import('@x9-forge/contracts/http/endpoints/index'))`);
    expect(node(script)).toBe('OK');
  });

  it('s9763 (b) the research parameters, adoption route and video tools work from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK
  .replace('SOCIAL_LISTENING', `require('@x9-forge/contracts/capability/social-listening')`)
  .replace('ENDPOINTS', `require('@x9-forge/contracts/http/endpoints/index')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s9763 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s9763 (d) the CHANGELOG has v1.287.0 once above v1.285.0, naming 9760, 9761 and 9762', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const unreleased = text.indexOf('## Non rilasciato');
    const title = '## v1.287.0';
    const first = text.indexOf(title);
    expect(unreleased).toBeGreaterThanOrEqual(0);
    expect(first).toBeGreaterThan(unreleased);
    expect(text.indexOf(title, first + 1)).toBe(-1);
    const previous = text.indexOf('## v1.285.0');
    expect(previous).toBeGreaterThan(first);
    const block = text.slice(first, previous);
    for (const task of ['9760', '9761', '9762']) expect(block).toContain(task);
  });
});
