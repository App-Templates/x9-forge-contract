"""Causal qualification on a private snapshot, never mutating another worktree."""
from pathlib import Path
import tempfile, shutil, subprocess, json, hashlib
root = Path(__file__).resolve().parents[3]
trial = Path(tempfile.mkdtemp(prefix='d-paperclip-contracts-', dir='/private/tmp'))
(trial/'src/capability/paperclip').mkdir(parents=True)
(trial/'tests').mkdir()
(trial/'node_modules').symlink_to(root/'node_modules', target_is_directory=True)
for name in ('package.json', 'vitest.config.ts'):
    shutil.copyfile(root/name, trial/name)
for name in ('paperclip-tools.test.ts', 'paperclip-decisions.test.ts', 'setup.ts'):
    shutil.copyfile(root/'tests'/name, trial/'tests'/name)
shutil.copytree(root/'tests/fixtures',trial/'tests/fixtures',dirs_exist_ok=True)
shutil.copyfile(root/'src/capability/paperclip/index.ts',trial/'src/capability/paperclip/index.ts')

for folder in (root/'src').iterdir():
 if folder.name!='capability':
  (trial/'src'/folder.name).symlink_to(folder,target_is_directory=folder.is_dir())
for file in (root/'src/capability').iterdir():
 if file.name!='paperclip':
  (trial/'src/capability'/file.name).symlink_to(file,target_is_directory=file.is_dir())
source = root/'src/capability/paperclip/tools.ts'
target = trial/'src/capability/paperclip/tools.ts'
original = source.read_text()
command = ['/usr/local/bin/node', str(root/'node_modules/vitest/vitest.mjs'), 'run', 'tests/paperclip-tools.test.ts', '--maxWorkers=1']
mutations = [
 ('strict-tool', 'z.strictObject(', 'z.object('),
 ('limit-zero', '.int().min(1).max(100)', '.int().min(0).max(100)'),
 ('limit-high', '.int().min(1).max(100)', '.int().min(1).max(200)'),
 ('limit-integer', '.int().min(1).max(100)', '.min(1).max(100)'),
 ('empty-statuses', 'z.array(PaperclipIssueStatusSchema).min(1)', 'z.array(PaperclipIssueStatusSchema).min(0)'),
 ('duplicate-statuses', 'new Set(values).size === values.length', 'true'),
 ('unknown-status', "const Statuses = z.array(PaperclipIssueStatusSchema)", 'const Statuses = z.array(z.string())'),
 ('uuid', 'issueId: z.uuid()', 'issueId: z.string()'),
 ('role-blank', 'roleRef: Text', 'roleRef: z.string()'),
 ('scope-required', 'scope: CapabilityAgentScopeSchema', 'scope: z.object({agentId: Text})'),
 ('positive-operation', 'statuses: Statuses.optional()', 'statuses: z.string().optional()'),
 ('positive-view', 'identifier: Text', "identifier: z.literal('wrong-identifier')"),
]

results = []
for name, before, after in mutations:
    if before not in original: raise AssertionError('Missing mutation site: '+name)
    target.write_text(original.replace(before, after))
    result = subprocess.run(command, cwd=trial, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    (trial/(name+'.log')).write_text(result.stdout)
    causal = result.returncode != 0 and 'AssertionError' in result.stdout and 'Failed Suites' not in result.stdout
    results.append(dict(name=name, assertionRed=causal, exitCode=result.returncode))
    if not causal: raise AssertionError('Not a semantic red: '+name+'; '+str(trial))
target.write_text(original)
result = subprocess.run(command, cwd=trial, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
(trial/'restored.log').write_text(result.stdout)
assert result.returncode == 0, 'Restored baseline failed'
proof = dict(sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(), snapshot=str(trial), killed=len(results), total=len(mutations), restored=True, mutations=results)
(root/'.planning/phases/filiera-cap-paperclip/TOOLS-QUALIFICATION.json').write_text(json.dumps(proof, indent=2)+'\n')
print(json.dumps(proof, indent=2))
