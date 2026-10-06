"""B1/B7 guard mutations run only in a temporary shadow; production source/dist never changes."""
from pathlib import Path
import hashlib
import json
import os
import signal
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / '.planning/phases/54-05-bridge-129'
P = 'src/capability/parameters.ts'
B = 'src/capability/presentation.ts'
MAN = 'src/capability/capability-manifest.ts'
REG = 'src/capability/capability-registry-entry.ts'
H = 'src/http/endpoints/internal-capability-agent.ts'
M = []

def edit(file, before, after):
    return {'file': file, 'before': before, 'after': after}

def add(name, file, before, after):
    M.append({'id': name, 'edits': [edit(file, before, after)]})

add('B1-key', P, 'z.string().regex(/^[a-z][a-zA-Z0-9_.-]*$/)', 'z.string()')
add('B1-labels', P, 'const TextSchema = z.string().trim().min(1);', 'const TextSchema = z.string().trim();')
add('B1-value-type', P, 'z.union([z.number().finite(), z.string(), z.boolean()])', 'z.any()')
add('B1-status', P, "z.enum(['decided', 'proposed'])", 'z.string()')
add('B1-application', P, "z.enum(['immediate', 'next_apply'])", 'z.string()')
add('B1-reference-required', P, '  reference: TextSchema,', '  reference: TextSchema.optional(),')
add('B1-consumes-required', P, '  consumes: z.boolean(),\n};', '  consumes: z.boolean().optional(),\n};')
for name, before, after in [
    ('number', 'platformDefault: z.number().finite().optional() }).strict()', 'platformDefault: z.number().finite().optional() })'),
    ('integer', 'platformDefault: z.number().int().optional() }).strict()', 'platformDefault: z.number().int().optional() })'),
    ('string', 'maxLength: z.number().int().nonnegative().optional(), platformDefault: z.string().optional() }).strict()', 'maxLength: z.number().int().nonnegative().optional(), platformDefault: z.string().optional() })'),
    ('boolean', "z.object({ ...metadata, type: z.literal('boolean'), platformDefault: z.boolean().optional() }).strict()", "z.object({ ...metadata, type: z.literal('boolean'), platformDefault: z.boolean().optional() })"),
    ('enum', "platformDefault: z.string().optional() }).strict(),\n]);", "platformDefault: z.string().optional() }),\n]);"),
]:
    add('B1-strict-' + name, P, before, after)
add('B1-number-min-finite', P, "type: z.literal('number'), min: z.number().finite().optional(),", "type: z.literal('number'), min: z.any().optional(),")
add('B1-number-max-finite', P, 'max: z.number().finite().optional(), platformDefault:', 'max: z.any().optional(), platformDefault:')
add('B1-integer-default', P, 'platformDefault: z.number().int().optional()', 'platformDefault: z.number().optional()')
add('B1-integer-bound', P, "type: z.literal('integer'), min: z.number().int().optional(),", "type: z.literal('integer'), min: z.number().optional(),")
add('B1-string-bound-integer', P, 'minLength: z.number().int().nonnegative().optional()', 'minLength: z.number().nonnegative().optional()')
add('B1-string-bound-positive', P, 'maxLength: z.number().int().nonnegative().optional()', 'maxLength: z.number().int().optional()')
add('B1-boolean-default', P, "type: z.literal('boolean'), platformDefault: z.boolean().optional()", "type: z.literal('boolean'), platformDefault: z.any().optional()")
add('B1-option-count', P, 'options: z.array(CapabilityParameterOptionSchema).min(1)', 'options: z.array(CapabilityParameterOptionSchema)')
add('B1-option-strict', P, 'z.object({ value: TextSchema, label: TextSchema }).strict()', 'z.object({ value: TextSchema, label: TextSchema })')
add('B1-minimum', P, 'value >= parameter.min', 'true')
add('B1-maximum', P, 'value <= parameter.max', 'true')
add('B1-chosen-integer', P, 'Number.isInteger(value)', 'true')
add('B1-string-type', P, "return typeof value === 'string'\n", 'return true\n')
add('B1-string-minimum', P, 'value.length >= parameter.minLength', 'true')
add('B1-string-maximum', P, 'value.length <= parameter.maxLength', 'true')
add('B1-boolean-type', P, "return typeof value === 'boolean';", 'return true;')
add('B1-enum-membership', P, 'parameter.options.some(option => option.value === value)', 'true')
add('B1-ordered-number-bounds', P, 'parameter.min > parameter.max', 'false')
add('B1-ordered-string-bounds', P, 'parameter.minLength > parameter.maxLength', 'false')
add('B1-unique-options', P, 'new Set(parameter.options.map(option => option.value)).size !== parameter.options.length', 'false')
add('B1-default-validity', P, 'parameter.platformDefault !== undefined && !accepts(parameter, parameter.platformDefault)', 'false')
add('B1-origin', P, "z.enum(['platform_default', 'agent_override', 'needs_choice'])", 'z.string()')
add('B1-resolved-strict', P, '}).strict().superRefine((resolved, ctx)', '}).superRefine((resolved, ctx)')
add('B1-choice-has-value', P, 'value !== undefined || parameter.platformDefault !== undefined', 'parameter.platformDefault !== undefined')
add('B1-choice-has-default', P, 'value !== undefined || parameter.platformDefault !== undefined', 'value !== undefined')
add('B1-chosen-value-required', P, 'value === undefined || !accepts(parameter, value)', 'value !== undefined && !accepts(parameter, value)')
add('B1-chosen-value-valid', P, 'value === undefined || !accepts(parameter, value)', 'value === undefined')
add('B1-default-source', P, 'parameter.platformDefault === undefined || value !== parameter.platformDefault', 'parameter.platformDefault !== undefined && value !== parameter.platformDefault')
add('B1-default-match', P, 'parameter.platformDefault === undefined || value !== parameter.platformDefault', 'parameter.platformDefault === undefined')
add('B1-declaration-consumes', P, '  consumes: z.boolean(),\n  spendLedger:', '  consumes: z.boolean().optional(),\n  spendLedger:')
add('B1-declaration-ledger', P, '  spendLedger: z.boolean(),', '  spendLedger: z.boolean().optional(),')
add('B1-declaration-strict', P, '}).strict().refine(declaration =>', '}).refine(declaration =>')
add('B1-declaration-unique', P, 'new Set(declaration.parameters.map(parameter => parameter.key)).size === declaration.parameters.length', 'true')
add('B1-agent-id', P, '  agentId: CapabilityAgentIdSchema,', '  agentId: z.string().optional(),')
add('B1-capability', P, '  capability: TextSchema,', '  capability: z.string(),')
add('B1-version', P, '  version: AgentConfigVersionSchema,', '  version: z.number(),')
add('B1-agent-strict', P, '}).strict().refine(agent =>', '}).refine(agent =>')
add('B1-agent-unique', P, 'new Set(agent.parameters.map(resolved => resolved.parameter.key)).size === agent.parameters.length', 'true')
add('B7-labels', B, 'const TextSchema = z.string().trim().min(1);', 'const TextSchema = z.string().trim();')
add('B7-agent-id', B, 'agentId: CapabilityAgentIdSchema, capability: TextSchema', 'agentId: z.string(), capability: TextSchema')
add('B7-capability-required', B, 'agentId: CapabilityAgentIdSchema, capability: TextSchema', 'agentId: CapabilityAgentIdSchema, capability: TextSchema.optional()')
add('B7-source-kind', B, "z.enum(['project_view', 'domain_app'])", 'z.string()')
add('B7-source-strict', B, '  id: TextSchema,\n}).strict();', '  id: TextSchema,\n});')
add('B7-kind-strict', B, '  key: CapabilityParameterKeySchema, label: TextSchema, description: TextSchema,\n}).strict();', '  key: CapabilityParameterKeySchema, label: TextSchema, description: TextSchema,\n});')
add('B7-field-type', B, "z.enum(['text', 'number', 'boolean', 'json'])", 'z.string()')
add('B7-field-strict', B, "  type: z.enum(['text', 'number', 'boolean', 'json']),\n}).strict();", "  type: z.enum(['text', 'number', 'boolean', 'json']),\n});")
add('B7-metric-strict', B, '  key: CapabilityParameterKeySchema, label: TextSchema, unit: TextSchema,\n}).strict();', '  key: CapabilityParameterKeySchema, label: TextSchema, unit: TextSchema,\n});')
add('B7-kinds-required', B, 'z.array(CapabilityOutputKindSchema).min(1)', 'z.array(CapabilityOutputKindSchema)')
add('B7-output-declaration-strict', B, '  fields: z.array(CapabilityOutputFieldSchema),\n}).strict()', '  fields: z.array(CapabilityOutputFieldSchema),\n})')
add('B7-kinds-unique', B, 'new Set(outputs.kinds.map(kind => kind.key)).size === outputs.kinds.length', 'true')
add('B7-fields-unique', B, 'new Set(outputs.fields.map(field => field.key)).size === outputs.fields.length', 'true')
add('B7-feedback-kind', B, "kind: z.literal('rating')", 'kind: z.string()')
add('B7-sources-required', B, 'z.array(CapabilityFeedbackSourceKindSchema).min(1)', 'z.array(CapabilityFeedbackSourceKindSchema)')
add('B7-feedback-declaration-strict', B, '}).strict().refine(feedback =>', '}).refine(feedback =>')
add('B7-sources-unique', B, 'new Set(feedback.sources).size === feedback.sources.length', 'true')
add('B7-presentation-strict', B, '}).strict().refine(presentation =>', '}).refine(presentation =>')
add('B7-metrics-unique', B, 'new Set(presentation.trends.map(metric => metric.key)).size === presentation.trends.length', 'true')
add('B7-summary-required', B, '  summary: z.string(),', '  summary: z.string().optional(),')
add('B7-content-json', B, 'z.record(z.string(), z.json())', 'z.record(z.string(), z.any())')
add('B7-output-strict', B, '  content: z.record(z.string(), z.json()),\n}).strict();', '  content: z.record(z.string(), z.json()),\n});')
add('B7-source-required', B, '  source: CapabilityFeedbackSourceSchema,', '  source: CapabilityFeedbackSourceSchema.optional(),')
add('B7-reviewer-required', B, '  reviewerId: TextSchema,', '  reviewerId: TextSchema.optional(),')
add('B7-output-id-required', B, '  outputId: TextSchema,', '  outputId: TextSchema.optional(),')
add('B7-rating-integer', B, 'rating: z.number().int().min(1).max(10)', 'rating: z.number().min(1).max(10)')
add('B7-rating-min', B, 'rating: z.number().int().min(1).max(10)', 'rating: z.number().int().max(10)')
add('B7-rating-max', B, 'rating: z.number().int().min(1).max(10)', 'rating: z.number().int().min(1)')
add('B7-feedback-strict', B, '  comment: z.string().optional(),\n  createdAt: z.iso.datetime(),\n}).strict();', '  comment: z.string().optional(),\n  createdAt: z.iso.datetime(),\n});')
# Each timestamp occurrence is a separate wire field.
add('B7-output-time', B, '  summary: z.string(),\n  createdAt: z.iso.datetime(),', '  summary: z.string(),\n  createdAt: z.string(),')
add('B7-feedback-time', B, '  comment: z.string().optional(),\n  createdAt: z.iso.datetime(),', '  comment: z.string().optional(),\n  createdAt: z.string(),')
add('B7-point-day', B, '  day: AgentDaySchema,', '  day: z.string(),')
add('B7-point-finite', B, '  value: z.number().finite(),', '  value: z.any(),')
add('B7-point-strict', B, '  value: z.number().finite(),\n}).strict();', '  value: z.number().finite(),\n});')
add('B7-series-strict', B, '}).strict().refine(series =>', '}).refine(series =>')
add('B7-day-order', B, "index === 0 || series.points[index - 1]!.day < point.day", 'true')
for plural, item in [('outputs', 'output'), ('feedback', 'feedback'), ('series', 'series')]:
    add('B7-scope-agent-' + plural, B, f'{item}.agentId === collection.agentId && {item}.capability === collection.capability', f'{item}.capability === collection.capability')
    add('B7-scope-capability-' + plural, B, f'{item}.agentId === collection.agentId && {item}.capability === collection.capability', f'{item}.agentId === collection.agentId')
    suffix = 'id' if plural != 'series' else 'metric.key'
    add('B7-unique-' + plural, B, f'new Set(collection.{plural}.map({item} => {item}.{suffix})).size === collection.{plural}.length', 'true')
    schema = {'outputs': 'CapabilityOutputSchema', 'feedback': 'CapabilityFeedbackSchema', 'series': 'CapabilityTrendSeriesSchema'}[plural]
    add('B7-strict-' + plural, B, f'  ...scope, {plural}: z.array({schema}),\n}}).strict()', f'  ...scope, {plural}: z.array({schema}),\n}})')
for file, label in [(MAN, 'manifest'), (REG, 'registry')]:
    add('declaration-' + label + '-parameters', file, 'parameters: CapabilityParametersDeclarationSchema.optional()', 'parameters: z.unknown().optional()')
    add('declaration-' + label + '-presentation', file, 'presentation: CapabilityPresentationDeclarationSchema.optional()', 'presentation: z.unknown().optional()')
    add('legacy-' + label, file, 'parameters: CapabilityParametersDeclarationSchema.optional()', 'parameters: CapabilityParametersDeclarationSchema.default({ parameters: [], consumes: false, spendLedger: false })')
add('existing-manifest-auth', 'src/http/endpoints/cap-manifest.ts', "authType: 'none' as const", "authType: 'secret' as const")
# Only the contract field used by the new compatibility check; no new route is implemented.
add('existing-config-auth', H, "export const ricercaAgentConfigPutContract = {\n  method: 'PUT' as const,\n  path: '/internal/capability/agents/:agentId/config' as const,\n  authType: 'secret' as const,", "export const ricercaAgentConfigPutContract = {\n  method: 'PUT' as const,\n  path: '/internal/capability/agents/:agentId/config' as const,\n  authType: 'none' as const,")

# Remove both independent checks when the same default invariant is guarded at the wire type and semantic layer.
for mutation in M:
    if mutation['id'] == 'B1-integer-default':
        mutation['edits'].append(edit(P, 'Number.isInteger(value)', 'true'))
    if mutation['id'] == 'B1-boolean-default':
        mutation['edits'].append(edit(P, "return typeof value === 'boolean';", 'return true;'))
add('B1-false-default-source', P, 'parameter.platformDefault === undefined || value !== parameter.platformDefault', '!parameter.platformDefault || value !== parameter.platformDefault')
add('B1-zero-choice-value', P, 'value !== undefined || parameter.platformDefault !== undefined', 'Boolean(value) || parameter.platformDefault !== undefined')
add('B1-false-choice-default', P, 'value !== undefined || parameter.platformDefault !== undefined', 'value !== undefined || Boolean(parameter.platformDefault)')
M.append({'id': 'B1-number-default-type', 'edits': [
    edit(P, 'platformDefault: z.number().finite().optional()', 'platformDefault: z.any().optional()'),
    edit(P, 'parameter.platformDefault !== undefined && !accepts(parameter, parameter.platformDefault)', 'false'),
]})

TESTS = ['tests/capability/parameters.test.ts', 'tests/capability/presentation.test.ts',
         'tests/capability/declarations.test.ts', 'tests/capability/bridge-129-package.test.ts']
# Real package export faults, independent from source schemas.
pkg = json.loads((ROOT / 'package.json').read_text())
base_exports = json.loads((ROOT / 'tests/capability/bridge-128-exports.json').read_text())
for subpath in ['parameters', 'presentation']:
    for system in ['import', 'require']:
        key = './capability/' + subpath
        mutated = json.loads(json.dumps(pkg))
        mutated['exports'][key][system] = './dist/missing-' + subpath + '.js'
        add('new-export-' + subpath + '-' + system, 'package.json', (ROOT / 'package.json').read_text(), json.dumps(mutated, indent=2) + '\n')
    mutated = json.loads(json.dumps(pkg))
    mutated['zshy']['exports']['./capability/' + subpath] = './src/missing-' + subpath + '.ts'
    add('new-build-' + subpath, 'package.json', (ROOT / 'package.json').read_text(), json.dumps(mutated, indent=2) + '\n')
for key, previous in base_exports.items():
    file = previous['targets']['require'].removeprefix('./')
    symbol = previous['symbols'][0]
    original = (ROOT / file).read_text()
    after = original + '\nmodule.exports = Object.fromEntries(Object.entries(module.exports).filter(([name]) => name !== ' + json.dumps(symbol) + '));\n'
    add('old-symbol-' + key.replace('/', '_'), file, original, after)
add('version', 'package.json', '"version": "1.29.0"', '"version": "1.28.0"')

def hashes():
    paths = [ROOT / 'package.json', *ROOT.joinpath('src').rglob('*'), *ROOT.joinpath('dist').rglob('*')]
    return {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths if p.is_file()}

def run(shadow, report, tests=None):
    command = ['pnpm', '-C', str(shadow), 'exec', 'vitest', 'run', '--maxWorkers=1', '--testTimeout=60000',
               '--reporter=json', '--outputFile=' + str(report), *(TESTS if tests is None else tests)]
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, start_new_session=True)
    try:
        stdout, stderr = process.communicate(timeout=300)
    except subprocess.TimeoutExpired:
        # Stop only this runner-owned process group; a startup timeout never counts as a killed mutation.
        os.killpg(process.pid, signal.SIGTERM)
        try:
            process.communicate(timeout=5)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            process.communicate()
        raise
    outcome = subprocess.CompletedProcess(command, process.returncode, stdout, stderr)
    if not report.exists():
        raise RuntimeError('missing assertion report: ' + outcome.stdout[-1000:] + outcome.stderr[-1000:])
    data = json.loads(report.read_text())
    failures = [test for suite in data['testResults'] for test in suite['assertionResults'] if test['status'] == 'failed']
    return outcome.returncode, data, failures

def main():
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    original_hashes = hashes()
    selected = [mutation for mutation in M if not sys.argv[1:] or mutation['id'] in sys.argv[1:]]
    if not selected:
        raise RuntimeError('no selected mutations')
    records = []
    with tempfile.TemporaryDirectory(prefix='bridge-129-mutations-') as dirname:
        shadow = Path(dirname)
        for name in ['src', 'dist']:
            shutil.copytree(ROOT / name, shadow / name)
        for name in ['package.json', 'vitest.config.ts']:
            shutil.copy2(ROOT / name, shadow / name)
        (shadow / 'node_modules').symlink_to(ROOT / 'node_modules', target_is_directory=True)
        (shadow / 'tests/capability').mkdir(parents=True)
        shutil.copy2(ROOT / 'tests/setup.ts', shadow / 'tests/setup.ts')
        for name in [*TESTS, 'tests/capability/bridge-128-exports.json']:
            shutil.copy2(ROOT / name, shadow / name)
        baseline_report = shadow / 'baseline.json'
        code, baseline, failures = run(shadow, baseline_report)
        if code or failures or baseline['numTotalTests'] < 173:
            raise RuntimeError('baseline must be green and include all intended tests')
        (EVIDENCE / 'task5-baseline.json').write_text(json.dumps(baseline, indent=2) + '\n')
        for mutation in selected:
            originals = {}
            try:
                for change in mutation['edits']:
                    path = shadow / change['file']
                    source = path.read_text()
                    if source.count(change['before']) != 1:
                        raise RuntimeError(mutation['id'] + ': anchor not unique in ' + change['file'])
                    originals.setdefault(path, source)
                    path.write_text(source.replace(change['before'], change['after']))
                identifier = mutation['id']
                if identifier.startswith('B1-'):
                    tests = [TESTS[0]]
                elif identifier.startswith('B7-'):
                    tests = [TESTS[1]]
                elif identifier.startswith(('declaration-', 'legacy-', 'existing-')):
                    tests = [TESTS[2]]
                elif identifier.startswith('new-export-'):
                    tests = [TESTS[2], TESTS[3]]
                else:
                    tests = [TESTS[3]]
                code, data, failures = run(shadow, shadow / 'fault.json', tests)
                assertions = [test for test in failures if any('AssertionError' in message for message in test['failureMessages'])]
                killed = code != 0 and bool(assertions) and not data.get('numRuntimeErrorTestSuites', 0)
                record = {'id': mutation['id'], 'killed': killed, 'failedTests': [test['fullName'] for test in failures],
                          'assertionFailures': len(assertions), 'runtimeErrors': data.get('numRuntimeErrorTestSuites', 0)}
                records.append(record)
                print(mutation['id'], 'RED assertion' if killed else 'SURVIVED/ERROR', flush=True)
                (EVIDENCE / 'task5-fault-current.json').write_text(json.dumps(data, indent=2) + '\n')
            finally:
                for path, source in originals.items():
                    path.write_text(source)
            proof = {'mutations': records, 'killed': sum(row['killed'] for row in records), 'total': len(records),
                     'sourceAndDistUnchanged': original_hashes == hashes()}
            (EVIDENCE / 'task5-mutations.json').write_text(json.dumps(proof, indent=2) + '\n')
        code, final, failures = run(shadow, shadow / 'final.json')
        proof['greenAfter'] = code == 0 and not failures
        proof['finalPassedTests'] = final['numPassedTests']
        proof['finalTotalTests'] = final['numTotalTests']
        proof['sourceAndDistUnchanged'] = original_hashes == hashes()
        (EVIDENCE / 'task5-mutations.json').write_text(json.dumps(proof, indent=2) + '\n')
        (EVIDENCE / 'task5-green.json').write_text(json.dumps(final, indent=2) + '\n')
    print(json.dumps({key: value for key, value in proof.items() if key != 'mutations'}), flush=True)
    return 0 if all(row['killed'] for row in records) and proof['greenAfter'] and proof['sourceAndDistUnchanged'] else 1

if __name__ == '__main__':
    raise SystemExit(main())
