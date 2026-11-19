import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../..');
const packageVersion = (): string =>
  (JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string }).version;

describe('capi pacchetto-1-300-0', () => {
  it('capi_version: package and first release are 1.300.0 and retain 1.244.0', () => {
    const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    expect(packageVersion()).toBe('1.300.0');
    expect(/^## v(\d+\.\d+\.\d+)/m.exec(changelog)?.[1]).toBe('1.300.0');
    expect(changelog).toContain('## v1.244.0');
  });

  it('capi_changelog: the 1.300.0 entry names the three tasks and keeps old contracts unchanged', () => {
    const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const entry = changelog.slice(changelog.indexOf('## v1.300.0'), changelog.indexOf('## v1.244.0'));
    expect(entry).toContain('8500-8502');
    expect(entry).toContain('paperclip_mcp_memory_recall');
    expect(entry).toContain('no existing contract changes');
  });
});
