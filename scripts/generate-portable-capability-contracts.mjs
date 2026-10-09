import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`Missing ${name} argument`);
  return resolve(args[index + 1]);
}
if (args.some((arg, index) => index % 2 === 0 && !['--catalog', '--output'].includes(arg))) throw new Error('Unknown generator option');
const catalogPath = option('--catalog', null);
const output = option('--output', resolve(root, 'dist/python'));
// Production mode imports compiled canonical exports. --catalog is an explicit test/build injection.
const catalog = catalogPath ? JSON.parse(await readFile(catalogPath, 'utf8'))
  : (await import(pathToFileURL(resolve(root, 'dist/capability/portable-contracts.js')).href)).getPortableCapabilityContracts();
if (catalog.format !== 'x9-capability-portable-v1' || !catalog.contracts) throw new Error('Unsupported portable catalog');
const serialized = JSON.stringify(catalog);
const digest = createHash('sha256').update(serialized).digest('hex');
const template = await readFile(resolve(root, 'scripts/templates/capability-python-runtime.py.tpl'), 'utf8');
const python = template.replace('__CATALOG_BASE64__', Buffer.from(serialized).toString('base64')).replace('__CATALOG_SHA256__', digest);
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'capabilities.contracts.json'), `${serialized}\n`);
await writeFile(resolve(output, 'x9_forge_contracts_capabilities.py'), python);
const check = spawnSync('python3', ['-B', '-c', 'import importlib.util,sys; s=importlib.util.spec_from_file_location("bridge_generated_check",sys.argv[1]); m=importlib.util.module_from_spec(s); s.loader.exec_module(m)', resolve(output, 'x9_forge_contracts_capabilities.py')], { encoding: 'utf8' });
if (check.error || check.status !== 0) throw new Error(`Portable runtime qualification failed: ${check.error?.message ?? check.stderr}`);
