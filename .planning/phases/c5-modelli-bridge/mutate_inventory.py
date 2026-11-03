from pathlib import Path
import hashlib
import json
import os
import subprocess

root = Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-140-1')
phase = root / '.planning/phases/c5-modelli-bridge'
target = root / 'src/model-router/model-catalog.ts'
original = target.read_text()
sha = hashlib.sha256(target.read_bytes()).hexdigest()
env = os.environ.copy()
env['PATH'] = '/Users/admintemp/.nvm/versions/node/v24.14.1/bin:' + env['PATH']
mutations = [
    ('inventory-export', 'export const ModelCatalogInventoryEntrySchema', 'const ModelCatalogInventoryEntrySchema'),
    ('canonical-provider', 'provider: ModelCatalogProviderIdSchema,\n  modelId: CapabilityModelIdSchema,\n  access: ModelCatalogEntrySchema.shape.access,', 'provider: z.string(),\n  modelId: CapabilityModelIdSchema,\n  access: ModelCatalogEntrySchema.shape.access,'),
    ('canonical-model-id', 'modelId: CapabilityModelIdSchema,\n  access: ModelCatalogEntrySchema.shape.access,', 'modelId: z.string(),\n  access: ModelCatalogEntrySchema.shape.access,'),
    ('canonical-access', 'access: ModelCatalogEntrySchema.shape.access,', 'access: z.string(),'),
    ('compatibility-unqualified', "compatibility: z.literal('unqualified'),", 'compatibility: z.string(),'),
    ('inventory-strict-fields', "compatibility: z.literal('unqualified'),\n}).strict();", "compatibility: z.literal('unqualified'),\n}).strip();"),
    ('inventory-null-rejected', 'inventory: z.array(ModelCatalogInventoryEntrySchema).optional(),', 'inventory: z.array(ModelCatalogInventoryEntrySchema).nullable().optional(),'),
    ('observation-required', 'if (catalog.observedAt === null) {', 'if (false && catalog.observedAt === null) {'),
    ('partial-state', "if (catalog.inventory.length > 0 && catalog.state !== 'partial')", "if (false && catalog.inventory.length > 0 && catalog.state !== 'partial')"),
    ('exact-deduplication', 'if (inventoryIds.has(key))', 'if (false && inventoryIds.has(key))'),
    ('qualified-overlap', 'if (catalog.entries.some(qualified =>', 'if (false && catalog.entries.some(qualified =>'),
]
def run(name):
    report = phase / (name + '.json')
    with (phase / (name + '.log')).open('w') as output:
        code = subprocess.run(['pnpm', 'exec', 'vitest', 'run', 'tests/model-router/c5-model-inventory.test.ts', '--maxWorkers=1', '--reporter=json', f'--outputFile={report}'], cwd=root, env=env, stdout=output, stderr=subprocess.STDOUT, timeout=40).returncode
    data = json.loads(report.read_text())
    failures = [a for s in data['testResults'] for a in s['assertionResults'] if a['status'] == 'failed']
    witnesses = [a['fullName'] for a in failures if any('AssertionError' in m for m in a.get('failureMessages', []))]
    technical = [a['fullName'] for a in failures if any('TypeError' in m or 'ReferenceError' in m for m in a.get('failureMessages', []))]
    return {'exit': code, 'passed': data['numPassedTests'], 'failed': data['numFailedTests'], 'assertionWitnesses': witnesses, 'technicalErrors': technical}

proof = {'sourceBefore': sha, 'results': []}
try:
    baseline = run('INVENTORY-MUT-BASELINE')
    assert baseline['exit'] == 0 and baseline['passed'] == 45
    for index, (name, needle, replacement) in enumerate(mutations, 1):
        assert original.count(needle) == 1, (name, original.count(needle))
        candidate = original.replace(needle, replacement)
        # Allowing null requires safe iteration too; otherwise it is a TypeError, not a valid witness.
        if name == 'inventory-null-rejected':
            candidate = candidate.replace('if (catalog.inventory !== undefined)', 'if (catalog.inventory !== undefined && catalog.inventory !== null)')
        target.write_text(candidate)
        try:
            result = run(f'INVENTORY-MUT-{index:02}')
            assert result['exit'] != 0 and result['assertionWitnesses'] and not result['technicalErrors'], (name, result)
        finally:
            target.write_text(original)
        restored = run(f'INVENTORY-RESTORE-{index:02}')
        assert restored['exit'] == 0 and restored['passed'] == 45
        proof['results'].append({'control': name, **result, 'restored': restored['passed']})
        (phase / 'INVENTORY-MUTATION-PROOF.json').write_text(json.dumps(proof, indent=2))
        print(f'{index}/{len(mutations)} {name}: assertion red, restored45', flush=True)
finally:
    target.write_text(original)
    proof['sourceAfter'] = hashlib.sha256(target.read_bytes()).hexdigest()
    assert proof['sourceAfter'] == sha
    (phase / 'INVENTORY-MUTATION-PROOF.json').write_text(json.dumps(proof, indent=2))
