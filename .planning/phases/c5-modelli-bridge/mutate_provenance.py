from pathlib import Path
import hashlib
import json
import os
import subprocess
import time

root = Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-140-1')
phase = root / '.planning/phases/c5-modelli-bridge'
target = root / 'src/model-router/agent-model-configuration.ts'
original = target.read_text()
original_hash = hashlib.sha256(target.read_bytes()).hexdigest()
environment = os.environ.copy()
environment['PATH'] = '/Users/admintemp/.nvm/versions/node/v24.14.1/bin:' + environment['PATH']
mutations = [
    ('public-source-export', 'export const AgentModelSourceSchema', 'const AgentModelSourceSchema'),
    ('source-strict', "sourceVersion: AgentConfigVersionSchema,\n}).strict();", "sourceVersion: AgentConfigVersionSchema,\n}).strip();"),
    ('source-positive-version', 'sourceVersion: AgentConfigVersionSchema,', 'sourceVersion: z.number().int(),'),
    ('source-integer-version', 'sourceVersion: AgentConfigVersionSchema,', 'sourceVersion: z.number().positive(),'),
    ('source-version-required', 'sourceVersion: AgentConfigVersionSchema,', 'sourceVersion: AgentConfigVersionSchema.optional(),'),
    ('complete-vault-required', 'vaultAgentId: z.number().int().positive(),', 'vaultAgentId: z.number().int().positive().optional(),'),
    ('complete-management-nonblank', "managementAgentId: AgentRuntimeIdentitySchema.shape.managementAgentId.refine(value => value.trim().length > 0,", "managementAgentId: AgentRuntimeIdentitySchema.shape.managementAgentId.refine(_value => true,"),
    ('complete-runtime-nonblank', "runtimeAgentId: AgentRuntimeIdentitySchema.shape.runtimeAgentId.refine(value => value.trim().length > 0,", "runtimeAgentId: AgentRuntimeIdentitySchema.shape.runtimeAgentId.refine(_value => true,"),
    ('master-source-required', "source: AgentModelSourceSchema }).strict()", "source: AgentModelSourceSchema.default({ identity: { managementAgentId: 'forge-master', runtimeAgentId: 'runtime-master', vaultAgentId: 31 }, sourceVersion: 19 }) }).strict()"),
    ('custom-source-forbidden', "source: z.never().optional()", "source: AgentModelSourceSchema.nullable().optional()"),
    ('binding-strict', "origin: z.literal('master'), source: AgentModelSourceSchema }).strict()", "origin: z.literal('master'), source: AgentModelSourceSchema }).strip()"),
    ('scope-nonblank', '[scope.agentId, scope.ownerId, scope.tenantId].every(value => value.trim().length > 0)', '[scope.agentId, scope.ownerId, scope.tenantId].every(_value => true)'),
    ('provenance-strict', "bindings: z.array(AgentModelBindingSchema).min(1).max(64),\n}).strict()", "bindings: z.array(AgentModelBindingSchema).min(1).max(64),\n}).strip()"),
    ('bindings-minimum', 'bindings: z.array(AgentModelBindingSchema).min(1).max(64)', 'bindings: z.array(AgentModelBindingSchema).min(0).max(64)'),
    ('bindings-maximum', 'bindings: z.array(AgentModelBindingSchema).min(1).max(64)', 'bindings: z.array(AgentModelBindingSchema).min(1).max(65)'),
    ('bindings-unique', 'if (new Set(value.bindings.map(binding => binding.slotId)).size !== value.bindings.length)', 'if (false && new Set(value.bindings.map(binding => binding.slotId)).size !== value.bindings.length)'),
    ('legacy-explicit-complete-identity', 'if (!CompleteModelIdentitySchema.safeParse(config.identity).success)', 'if (false && !CompleteModelIdentitySchema.safeParse(config.identity).success)'),
    ('scope-runtime-match', 'if (provenance.scope.agentId !== config.identity.runtimeAgentId)', 'if (false && provenance.scope.agentId !== config.identity.runtimeAgentId)'),
    ('binding-cardinality', 'provenance.bindings.length !== config.selections.length || ', ''),
    ('binding-membership', 'config.selections.some(selection => !provenance.bindings.some(binding => binding.slotId === selection.slotId))', 'false'),
    ('source-self-management', 'ownIds.has(source.managementAgentId) || ', ''),
    ('source-self-runtime', 'ownIds.has(source.runtimeAgentId) || ', ''),
    ('source-self-vault', ' || source.vaultAgentId === config.identity.vaultAgentId', ''),
    ('source-mapping-consistency', 'if (sources.some(previous =>', 'if (false && sources.some(previous =>'),
    ('detached-constructor', 'return AgentModelsConfigurationWithProvenanceSchema.parse(input);', 'return input as AgentModelsConfigurationWithProvenance;'),
    ('context-identity-match', 'if (!sameModelAgentIdentity(config.identity, declared.identity))', 'if (false && !sameModelAgentIdentity(config.identity, declared.identity))'),
    ('context-scope-match', 'if (!sameCapabilityScope(config.provenance.scope, { agentId: declared.agentId, ownerId: declared.ownerId, tenantId: declared.tenantId }))', 'if (false && !sameCapabilityScope(config.provenance.scope, { agentId: declared.agentId, ownerId: declared.ownerId, tenantId: declared.tenantId }))'),
    ('context-parent-match', "if (binding.origin === 'master' && (declared.role !== 'erede' || binding.source.identity.runtimeAgentId !== declared.masterAgentId))", "if (false && binding.origin === 'master' && (declared.role !== 'erede' || binding.source.identity.runtimeAgentId !== declared.masterAgentId))"),
    ('modern-required-provenance', 'AgentContextWithModelsSchema.safeExtend({ modelConfiguration: AgentModelsConfigurationWithProvenanceSchema })', 'AgentContextWithModelsSchema.safeExtend({ modelConfiguration: AgentModelsConfigurationSchema })'),
    ('writer-credential-guards', "export const AgentContextWithModelProvenanceWriteSchema = AgentContextWithIdentityWriteSchema.and(\n  AgentContextWithModelsWriteSchema.safeExtend({ modelConfiguration: AgentModelsConfigurationWithProvenanceSchema }),\n);", 'export const AgentContextWithModelProvenanceWriteSchema = AgentContextWithModelProvenanceSchema;'),
]

def run(label):
    report = phase / f'{label}.json'
    log = phase / f'{label}.log'
    with log.open('w') as output:
        result = subprocess.run(['pnpm', 'exec', 'vitest', 'run', 'tests/model-router/c5-model-provenance.test.ts', '--maxWorkers=1', '--reporter=json', f'--outputFile={report}'], cwd=root, env=environment, stdout=output, stderr=subprocess.STDOUT, timeout=40)
    data = json.loads(report.read_text())
    assertions = [a for suite in data['testResults'] for a in suite['assertionResults']]
    failures = [a for a in assertions if a['status'] == 'failed']
    witnesses = [a['fullName'] for a in failures if any('AssertionError' in message for message in a.get('failureMessages', []))]
    technical = [a['fullName'] for a in failures if any('TypeError' in message or 'ReferenceError' in message for message in a.get('failureMessages', []))]
    return {'exit': result.returncode, 'tests': len(assertions), 'passed': data['numPassedTests'], 'failed': len(failures), 'assertionWitnesses': witnesses, 'technicalErrors': technical}

proof = {'sourceBefore': original_hash, 'results': []}
started = time.time()
try:
    baseline = run('MUT-BASELINE')
    assert baseline['exit'] == 0 and baseline['tests'] == 171
    for index, (name, needle, replacement) in enumerate(mutations, 1):
        assert original.count(needle) == 1, (name, original.count(needle))
        target.write_text(original.replace(needle, replacement))
        try:
            result = run(f'MUT-{index:02}')
            assert result['exit'] != 0 and result['assertionWitnesses'] and not result['technicalErrors'], (name, result)
        finally:
            target.write_text(original)
        restored = run(f'RESTORE-{index:02}')
        assert restored['exit'] == 0 and restored['passed'] == 171
        assert hashlib.sha256(target.read_bytes()).hexdigest() == original_hash
        proof['results'].append({'id': index, 'control': name, **result, 'restored': restored['passed']})
        (phase / 'PROVENANCE-MUTATION-PROOF.json').write_text(json.dumps(proof, indent=2))
        print(f'{index}/{len(mutations)} {name}: assertion red, restored {restored["passed"]}', flush=True)
finally:
    target.write_text(original)
    proof['sourceAfter'] = hashlib.sha256(target.read_bytes()).hexdigest()
    proof['elapsedSeconds'] = round(time.time() - started, 3)
    (phase / 'PROVENANCE-MUTATION-PROOF.json').write_text(json.dumps(proof, indent=2))
