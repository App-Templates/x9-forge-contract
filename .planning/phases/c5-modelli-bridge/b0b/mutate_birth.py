from pathlib import Path
import subprocess
import hashlib
import json
import time

root = Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-140-1')
phase = root / '.planning/phases/c5-modelli-bridge/b0b'
domain = 'src/vault/credential-birth.ts'
endpoint = 'src/http/endpoints/internal-credential-birth.ts'
paths = [domain, endpoint, 'src/vault/index.ts', 'src/http/endpoints/index.ts']
originals = {name: (root / name).read_bytes() for name in paths}
hashes = {name: hashlib.sha256(value).hexdigest() for name, value in originals.items()}
mutations = []
def add(name, old, new, file=domain, occurrence=0):
    mutations.append((name, file, old.replace('\n+', '\n'), new.replace('\n+', '\n'), occurrence))

identity = 'AgentContextIdentitySchema.options[0].shape.identity'
add('complete-vault-required', identity, identity + '.extend({ vaultAgentId: z.number().int().positive().optional() })')
add('complete-vault-positive', identity, identity + '.extend({ vaultAgentId: z.number().int() })')
add('complete-vault-integer', identity, identity + '.extend({ vaultAgentId: z.number().positive() })')
add('complete-management-nonblank', identity, identity + '.extend({ managementAgentId: z.string() })')
add('complete-runtime-nonblank', identity, identity + '.extend({ runtimeAgentId: z.string() })')
add('source-master-only', "kind: z.literal('master')", 'kind: z.string()')
add('source-kind-required', "kind: z.literal('master')", "kind: z.literal('master').default('master')")
add('snapshot-format', 'z.string().regex(/^[a-f0-9]{64}$/)', 'z.string()')
add('scope-nonblank', 'value.trim().length > 0', 'true')
scope_expr = "CapabilityAgentScopeSchema.refine(scope => [scope.agentId, scope.ownerId, scope.tenantId].every(value => value.trim().length > 0), 'Birth scope must not be blank')"
for field, kept in [('ownerId', 'scope.agentId, scope.tenantId'), ('tenantId', 'scope.agentId, scope.ownerId')]:
    add(f'scope-{field}-required', scope_expr, f"CapabilityAgentScopeSchema.extend({{ {field}: z.string().optional() }}).refine(scope => [{kept}].every(value => value.trim().length > 0), 'Birth scope must not be blank')")
add('request-id-format', 'requestId: AgentManagementRequestIdSchema,', 'requestId: z.string(),')
add('request-id-required', 'requestId: AgentManagementRequestIdSchema,', "requestId: AgentManagementRequestIdSchema.default('request-0001'),")
add('birth-uuid', 'birthId: z.uuid(),', 'birthId: AgentManagementRequestIdSchema,')
add('birth-required', 'birthId: z.uuid(),', "birthId: z.uuid().default('11111111-1111-4111-8111-111111111111'),")
add('target-scope-runtime', 'value.scope.agentId !== value.identity.runtimeAgentId', 'false')
add('source-not-self', 'own.has(source.managementAgentId) || own.has(source.runtimeAgentId) || source.vaultAgentId === value.identity.vaultAgentId', 'false')
add('key-canonical', 'key: CredentialKeySchema,', 'key: z.string(),')
add('key-required', 'key: CredentialKeySchema,', "key: CredentialKeySchema.default('OPENAI_API_KEY'),")
add('version-positive', 'version: CredentialVersionSchema', 'version: z.number().int()')
add('version-integer', 'version: CredentialVersionSchema', 'version: z.number().positive()')
add('version-required', 'version: CredentialVersionSchema', 'version: CredentialVersionSchema.default(3)')
add('preview-key-unique', 'new Set(value.entries.map(entry => entry.key)).size === value.entries.length', 'true')
add('reference-key-unique', 'new Set(value.references.map(entry => entry.key)).size !== value.references.length', 'false')
add('reference-source-correlated', '!sameIdentity(entry.source.identity, value.source.identity)', 'false')
add('saved-outcome-only', "outcome: z.enum(['created', 'unchanged'])", 'outcome: z.string().nullable()')
add('receipt-request-correlated', 'request.requestId !== result.requestId || ', '')
add('receipt-birth-correlated', 'request.birthId !== result.birthId || ', '')
add('receipt-scope-correlated', '!sameCapabilityScope(request.scope, result.scope)\n+      || ', '')
add('receipt-identity-correlated', '!sameIdentity(request.identity, result.identity) || ', '')
add('receipt-source-correlated', '!sameIdentity(request.source.identity, result.source.identity)\n+      || ', '')
add('receipt-snapshot-correlated', 'request.expectedSnapshot !== result.snapshot', 'false')
add('replay-entire-intent', 'JSON.stringify(receipt.request) !== JSON.stringify(request)', 'false')
add('replay-incoming-validation', 'const request = CredentialBirthBindRequestSchema.parse(incoming);', 'const request = incoming as CredentialBirthBindRequest;')
add('replay-receipt-validation', 'const receipt = CredentialBirthReceiptSchema.parse(previous);', 'const receipt = previous as CredentialBirthReceipt;')
add('writer-detached', 'return CredentialBirthBindRequestSchema.parse(input);', 'return input as CredentialBirthBindRequest;')
add('known-error-only', "error: z.enum(['invalid_request', 'identity_mismatch', 'source_unavailable', 'snapshot_conflict', 'idempotency_conflict', 'birth_not_found'])", 'error: z.string()')
strict_anchors = [
 ('source-strict', "z.object({ kind: z.literal('master'), identity: CompleteIdentity }).strict()"),
 ('entry-strict', 'z.object({ key: CredentialKeySchema, version: CredentialVersionSchema }).strict()'),
 ('reference-strict', 'CredentialBirthEntrySchema.extend({ source: CredentialBirthSourceSchema }).strict()'),
 ('preview-request-strict', 'z.object({ source: CredentialBirthSourceSchema }).strict()'),
 ('preview-result-strict', "entries: z.array(CredentialBirthEntrySchema),\n+}).strict()"),
 ('bind-request-strict', 'z.object({ ...TargetFields, expectedSnapshot: CredentialBirthSnapshotSchema }).strict()'),
 ('bind-result-strict', "outcome: z.enum(['created', 'unchanged']), references: z.array(CredentialBirthReferenceSchema),\n+}).strict()"),
 ('error-strict', "'birth_not_found']),\n+}).strict()"),
 ('receipt-strict', 'z.object({ request: CredentialBirthBindRequestSchema, result: CredentialBirthBindResultSchema }).strict()'),
]
for name, anchor in strict_anchors:
    add(name, anchor.replace('\n+', '\n'), anchor.replace('\n+', '\n').replace('.strict()', '.strip()'))
add('vault-barrel', "export * from './credential-birth.js';", '', 'src/vault/index.ts')
add('http-barrel', "export * from './internal-credential-birth.js';", '', 'src/http/endpoints/index.ts')
for which in range(2):
    for field, old, new in [
        ('method', "method: 'POST' as const", "method: 'GET' as const"),
        ('auth-type', "authType: 'token' as const", "authType: 'none' as const"),
        ('auth-header', 'authHeader: INTERNAL_TOKEN_HEADER', "authHeader: 'X-Synthetic-Other'"),
        ('auth-schema', 'authSchema: AuthInternalTokenSchema', 'authSchema: z.object({})'),
    ]:
        add(f'endpoint-{which}-{field}', old, new, endpoint, which)
for label, route in [('preview', 'preview'), ('bind', 'bind')]:
    add(f'{label}-path', f"path: '/internal/credentials/birth/{route}' as const", f"path: '/synthetic/{route}' as const", endpoint)
for label, kind in [('preview', 'Preview'), ('bind', 'Bind')]:
    body = 'CredentialBirthPreviewRequestSchema' if kind == 'Preview' else 'CredentialBirthBindRequestSchema'
    response = 'CredentialBirthPreviewResponseSchema' if kind == 'Preview' else 'CredentialBirthBindResponseSchema'
    add(f'{label}-canonical-body', f'bodySchema: {body}', 'bodySchema: z.unknown()', endpoint)
    add(f'{label}-canonical-response', f'responseSchema: {response}', 'responseSchema: z.unknown()', endpoint)

def run(label):
    report = phase / f'{label}.json'
    command = ['pnpm', 'exec', 'vitest', 'run', 'tests/vault/c5-credential-birth.test.ts', '--maxWorkers=1', '--reporter=json', f'--outputFile={report}']
    result = subprocess.run(command, cwd=root, text=True, capture_output=True)
    (phase / f'{label}.log').write_text(result.stdout + result.stderr)
    data = json.loads(report.read_text())
    failures = [a for f in data['testResults'] for a in f['assertionResults'] if a['status'] == 'failed']
    technical = [a['fullName'] for a in failures if any('AssertionError' not in m for m in a['failureMessages'])]
    return result.returncode, data, failures, technical

started = time.monotonic()
results = []
baseline_exit, baseline, _, _ = run('MUTATION-BASELINE')
assert baseline_exit == 0
total = baseline['numTotalTests']
try:
    for number, (name, file, old, new, occurrence) in enumerate(mutations, 1):
        target = root / file
        source = originals[file].decode()
        offsets = []; start = 0
        while True:
            found = source.find(old, start)
            if found < 0: break
            offsets.append(found); start = found + len(old)
        assert len(offsets) > occurrence, (name, old)
        at = offsets[occurrence]
        try:
            target.write_text(source[:at] + new + source[at + len(old):])
            exit_code, data, failures, technical = run(f'MUT-{number:02}')
            witnesses = [a['fullName'] for a in failures if all('AssertionError' in m for m in a['failureMessages'])]
            assert exit_code != 0 and witnesses and not technical and data['numTotalTests'] == total, (name, exit_code, technical)
        finally:
            target.write_bytes(originals[file])
        assert hashlib.sha256(target.read_bytes()).hexdigest() == hashes[file]
        restored_exit, restored, _, _ = run(f'RESTORED-{number:02}')
        assert restored_exit == 0 and restored['numPassedTests'] == total
        results.append({'id': number, 'control': name, 'file': file, 'failed': data['numFailedTests'], 'assertionWitnesses': witnesses, 'technical': technical, 'restored': total})
        print(f'{number}/{len(mutations)} {name}: assertion red, {total} restored', flush=True)
finally:
    for file in paths: (root / file).write_bytes(originals[file])
    proof = {'sourceBefore': hashes, 'sourceAfter': {name: hashlib.sha256((root / name).read_bytes()).hexdigest() for name in paths}, 'totalTests': total, 'planned': len(mutations), 'qualified': len(results), 'results': results, 'elapsedSeconds': round(time.monotonic() - started, 2)}
    (phase / 'MUTATION-PROOF.json').write_text(json.dumps(proof, indent=2) + '\n')
