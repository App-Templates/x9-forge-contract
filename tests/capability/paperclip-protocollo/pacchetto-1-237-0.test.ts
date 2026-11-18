import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const cleanEnv = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };
const channelExports = [
  'PAPERCLIP_DELIVERY_CHANNELS',
  'PaperclipDeliveryChannelSchema',
  'communicationSection',
  'PAPERCLIP_COMMUNICATION_CHANNELS',
];

function packageVersion(): string {
  return (JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string }).version;
}

function loadChannels(mode: 'esm' | 'cjs'): { names: string[]; delivery: unknown } {
  const script = mode === 'esm'
    ? "const m = await import('./dist/capability/paperclip/communication-channels.js'); process.stdout.write(JSON.stringify({ names: Object.keys(m), delivery: m.PAPERCLIP_DELIVERY_CHANNELS }));"
    : "const m = require('./dist/capability/paperclip/communication-channels.cjs'); process.stdout.write(JSON.stringify({ names: Object.keys(m), delivery: m.PAPERCLIP_DELIVERY_CHANNELS }));";
  const args = mode === 'esm' ? ['--input-type=module', '-e', script] : ['-e', script];
  return JSON.parse(execFileSync(process.execPath, args, {
    cwd: root,
    env: cleanEnv,
    encoding: 'utf8',
  })) as { names: string[]; delivery: unknown };
}

describe('s7422 pacchetto-1-237-0', () => {
  it('s7422_version: package and first CHANGELOG release are 1.237.0', () => {
    const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const firstRelease = /^## v(\d+\.\d+\.\d+)/m.exec(changelog)?.[1];
    expect(firstRelease).toBe('1.237.0');
    expect(packageVersion()).toBe(firstRelease);
  });

  it('s7422_esm: delivery channels are exported with a clean environment', () => {
    const { names, delivery } = loadChannels('esm');
    expect(names).toEqual(expect.arrayContaining(channelExports));
    expect(delivery).toEqual(['attachment', 'work_product']);
  });

  it('s7422_cjs: delivery channels are exported with a clean environment', () => {
    const { names, delivery } = loadChannels('cjs');
    expect(names).toEqual(expect.arrayContaining(channelExports));
    expect(delivery).toEqual(['attachment', 'work_product']);
  });

  it('s7422_map: narrow imports map matches the package version', () => {
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as { versione: string };
    expect(map.versione).toBe(packageVersion());
  });
});
