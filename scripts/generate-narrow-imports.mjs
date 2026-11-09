import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative, sep } from 'node:path';
import ts from 'typescript';

const here = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.some((arg, index) => index % 2 === 0 && arg !== '--root')) throw new Error('Unknown generator option');
const rootIndex = args.indexOf('--root');
const root = rootIndex === -1 ? here : resolve(args[rootIndex + 1] ?? '');

const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const NAME = pkg.name;
const sourceByKey = pkg.zshy?.exports ?? {};
const specifier = (key) => (key === '.' ? NAME : `${NAME}/${key.slice(2)}`);

// Exact keys only: the `*` keys have no single barrel to map.
const exactKeys = Object.keys(pkg.exports).filter((k) => !k.includes('*'));
const wildcardDomains = Object.keys(pkg.exports).filter((k) => k.endsWith('/*')).map((k) => k.slice(2, -2));
const keyOfFile = new Map();
for (const key of exactKeys) {
  const source = sourceByKey[key];
  if (!source) throw new Error(`Key ${key} has no zshy source`);
  keyOfFile.set(resolve(root, source), key);
}

const configPath = resolve(root, 'tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const program = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });
const checker = program.getTypeChecker();
const srcDir = resolve(root, 'src');

function narrowSpecifier(file, name, barrelKey) {
  const known = keyOfFile.get(file);
  if (known) return specifier(known);
  const rel = relative(srcDir, file);
  if (rel.startsWith('..') || !rel.endsWith('.ts')) {
    throw new Error(`Cannot place ${name} of ${barrelKey}: declared in ${file}, outside src`);
  }
  const parts = rel.slice(0, -3).split(sep);
  if (!wildcardDomains.includes(parts[0]) || parts.length < 2) {
    throw new Error(`Cannot place ${name} of ${barrelKey}: ${rel} has no narrow subpath`);
  }
  return `${NAME}/${parts.join('/')}`;
}

const barili = {};
for (const key of exactKeys) {
  const file = resolve(root, sourceByKey[key]);
  const sourceFile = program.getSourceFile(file);
  if (!sourceFile) throw new Error(`Source ${file} is not in the program`);
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  const map = {};
  for (const exported of moduleSymbol ? checker.getExportsOfModule(moduleSymbol) : []) {
    const real = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    if (!(real.flags & ts.SymbolFlags.Value)) continue;
    // Follow the re-export chain only while the name stays the same: a renamed export is declared by the module that renames it.
    let holder = exported;
    while (holder.flags & ts.SymbolFlags.Alias) {
      const next = checker.getImmediateAliasedSymbol(holder);
      if (!next || next.name !== exported.name) break;
      holder = next;
    }
    const declaration = holder.declarations?.[0];
    if (!declaration) throw new Error(`Cannot place ${exported.name} of ${specifier(key)}: no declaration`);
    map[exported.name] = narrowSpecifier(resolve(declaration.getSourceFile().fileName), exported.name, specifier(key));
  }
  barili[specifier(key)] = Object.fromEntries(Object.entries(map).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

const output = resolve(root, 'dist/narrow-imports.json');
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify({ formato: 'x9-narrow-imports-v1', versione: pkg.version, barili }, null, 2)}\n`);
