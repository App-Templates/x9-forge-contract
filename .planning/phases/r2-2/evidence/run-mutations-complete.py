from pathlib import Path
import json, subprocess, hashlib, os, time

root = Path(__file__).resolve().parent
out = root / 'evidence' / 'mutation-complete'
out.mkdir(parents=True, exist_ok=True)
env = {k: v for k, v in os.environ.items() if not k.startswith(('SENTRY_', 'VITE_'))}
specs = []
C = 'src/agent/agent-channel-configuration.ts'
R = 'src/agent/agent-creation-replay.ts'
A = 'src/agent/agent-channel-attestation.ts'
tests = {C: 'tests/agent/r2-channel-configuration.test.ts', R: 'tests/agent/r2-creation-replay.test.ts', A: 'tests/agent/r2-attestation.test.ts'}

def m(file, label, old, new):
    specs.append({'file': file, 'control': label, 'old': old, 'new': new})

m(C, 'birth channel subset', "ChannelTypeSchema.extract(['telegram', 'email'])", 'ChannelTypeSchema')
m(C, 'desired state vocabulary', "z.enum(['active', 'paused'])", 'z.string()')
m(C, 'failure code vocabulary', "code: AgentChannelFailureCodeSchema", 'code: z.string()')
m(C, 'failure detail excluded', "retryable: z.boolean() }).strict()", 'retryable: z.boolean() }).passthrough()')
m(C, 'fixed retryability', 'failure.retryable === RETRYABLE.has(failure.code)', 'true')
m(C, 'unknown failure sanitization', "parsed.success ? parsed.data : 'apply_failed'", 'code as AgentChannelFailureCode')
m(C, 'telegram public metadata', '.pick({ agent_id: true, bot_username: true, created_at: true }).strict()', '.pick({ agent_id: true, bot_username: true, created_at: true }).passthrough()')
m(C, 'email public metadata', 'resource: AgentEmailInboxSchema.strict()', 'resource: AgentEmailInboxSchema.passthrough()')
m(C, 'telegram resource container', 'created_at: true }).strict() }).strict()', 'created_at: true }).strict() }).passthrough()')
m(C, 'email resource container', 'AgentEmailInboxSchema.strict() }).strict()', 'AgentEmailInboxSchema.strict() }).passthrough()')
m(C, 'resource agent ownership', 'owned.resource.agent_id !== owned.scope.agentId', 'false')
m(C, 'resource runtime scope', 'owned.identity.runtimeAgentId !== owned.scope.agentId', 'false')
m(C, 'version state public shape', 'state: AgentChannelDesiredStateSchema }).strict()', 'state: AgentChannelDesiredStateSchema }).passthrough()')
m(C, 'configuration public shape', '}).strict().superRefine((config, ctx)', '}).passthrough().superRefine((config, ctx)')
m(C, 'configuration runtime scope', 'config.identity.runtimeAgentId !== config.scope.agentId', 'false')
m(C, 'full resource scope', '!sameCapabilityScope(config.resource.scope, config.scope)', 'false')
m(C, 'resource management identity', 'config.resource.identity.managementAgentId !== config.identity.managementAgentId', 'false')
m(C, 'resource channel kind', 'config.resource.kind !== config.kind', 'false')
m(C, 'applied version bounded', 'config.applied.version > config.desired.version', 'false')
m(C, 'one version one state', 'config.applied.state !== config.desired.state', 'false')
m(C, 'active application resource', "config.applied?.state === 'active' && config.resource === null", 'false')
m(C, 'observation dating', '(config.observation === null) !== (config.observedAt === null)', 'false')
m(C, 'observation channel kind', 'config.observation.kind !== config.kind', 'false')
m(C, 'observation application version', 'config.observation && config.applied === null', 'false')
m(C, 'loaded application active', "config.observation?.state === 'loaded' && config.applied?.state !== 'active'", 'false')
m(C, 'paused application paused', "config.observation?.state === 'paused' && config.applied?.state !== 'paused'", 'false')
m(C, 'application fail closed', 'AgentChannelConfigurationSchema.safeParse(raw);\n  if (!parsed.success) return false;', 'AgentChannelConfigurationSchema.safeParse(raw);\n  if (!parsed.success) return true;')
m(C, 'application no error', 'config.error === null', 'true')
m(C, 'application same version', 'config.applied?.version === config.desired.version', 'true')
m(C, 'application runtime observation', "config.observation?.state === (config.desired.state === 'active' ? 'loaded' : 'paused')", 'true')
m(C, 'both context birth channels', '.length(2).refine(', '.min(1).max(2).refine(')
m(C, 'unique context birth channels', 'new Set(configs.map((config) => config.kind)).size === configs.length', 'true')
for field in ['agentId', 'ownerId', 'tenantId']:
    m(C, 'context '+field, f'config.scope.{field} !== context.{field}', 'false')
m(C, 'admission fail closed', 'AgentContextWithChannelsSchema.safeParse(rawContext);\n  if (!parsed.success) return false;', 'AgentContextWithChannelsSchema.safeParse(rawContext);\n  if (!parsed.success) return true;')
m(C, 'legacy context compatible', 'if (parsed.data.channelConfigurations === undefined) return true;', 'if (parsed.data.channelConfigurations === undefined) return false;')
m(C, 'pause prevents admission', "config?.desired.state === 'active'", 'config !== undefined')
m(C, 'own resource for admission', '&& config.resource !== null', '&& true')

m(R, 'intent key mandatory', 'idempotencyKey: AgentManagementRequestIdSchema,', 'idempotencyKey: AgentManagementRequestIdSchema.optional(),')
m(R, 'intent runtime scope', 'intent.identity.runtimeAgentId === intent.scope.agentId', 'true')
for kind in ['telegram', 'email']:
    m(R, kind+' explicit intention', kind+': AgentChannelDesiredStateSchema', kind+': AgentChannelDesiredStateSchema.optional()')
m(R, 'intent channel public shape', 'email: AgentChannelDesiredStateSchema }).strict()', 'email: AgentChannelDesiredStateSchema }).passthrough()')
m(R, 'intent public shape', '}).strict().refine((intent)', '}).passthrough().refine((intent)')
m(R, 'request public shape', '.extend({ intent: AgentCreationIntentSchema }).strict()', '.extend({ intent: AgentCreationIntentSchema }).passthrough()')
m(R, 'slug identity consistency', 'request.slug === undefined || request.slug === request.intent.identity.managementAgentId', 'true')
for key in ['telegram_bot_token', 'ownerId', 'email_enabled', 'telegram_enabled']:
    m(R, 'request excludes '+key, key+': true,', '')
m(R, 'phase vocabulary', "z.enum(['pending', 'running', 'incomplete', 'completed'])", 'z.string()')
m(R, 'failed step vocabulary', "z.enum(['resources', 'workspace', 'context', 'runtime', 'first-check', 'save'])", 'z.string()')
m(R, 'failure public shape', 'error: AgentChannelFailureSchema,\n}).strict()', 'error: AgentChannelFailureSchema,\n}).passthrough()')
m(R, 'first check dated', 'checkedAt: z.iso.datetime({ offset: true })', 'checkedAt: z.iso.datetime({ offset: true }).optional()')
m(R, 'first check public shape', 'error: AgentChannelFailureSchema.nullable(),\n}).strict();', 'error: AgentChannelFailureSchema.nullable(),\n}).passthrough();')
m(R, 'checkpoint public shape', '}).strict().superRefine((job, ctx)', '}).passthrough().superRefine((job, ctx)')
m(R, 'unique checkpoint channels', 'kinds.has(config.kind)', 'false')
m(R, 'checkpoint full scope', '!sameCapabilityScope(config.scope, intent.scope)', 'false')
m(R, 'checkpoint management identity', 'config.identity.managementAgentId !== intent.identity.managementAgentId', 'false')
m(R, 'checkpoint desired version', 'config.desired.version !== intent.configVersion', 'false')
m(R, 'checkpoint desired state', 'config.desired.state !== intent.channels[config.kind]', 'false')
m(R, 'incomplete states failure', "(job.phase === 'incomplete') !== (job.failure !== null)", 'false')
m(R, 'completed database record', 'job.agentRecordId === null', 'false')
m(R, 'completed both channels', 'job.channels.length !== 2', 'false')
m(R, 'completed applied channels', '!job.channels.every(isChannelConfigurationApplied)', 'false')
m(R, 'completed first check exists', "job.firstCheck === null || job.firstCheck.error !== null || job.firstCheck.channel.loaded !== true\n        || job.firstCheck.channel.readiness !== 'ready'", 'false')
m(R, 'completed check without error', 'job.firstCheck.error !== null', 'false')
m(R, 'completed check loaded', 'job.firstCheck.channel.loaded !== true', 'false')
m(R, 'completed check ready', "job.firstCheck.channel.readiness !== 'ready'", 'false')
m(R, 'birth check active', "checkedBirthChannel.desired.state !== 'active'", 'false')
m(R, 'birth check channel identity', 'checkedBirthChannel.observation?.channelId !== job.firstCheck?.channel.channelId', 'false')
m(R, 'result successful shape', 'ok: z.literal(true)', 'ok: z.boolean()')
m(R, 'result replay status mandatory', 'replayed: z.boolean()', 'replayed: z.boolean().optional()')
m(R, 'result public shape', 'checkpoint: AgentCreationCheckpointSchema }).strict()', 'checkpoint: AgentCreationCheckpointSchema }).passthrough()')
m(R, 'incoming request validated', 'AgentCreationRequestSchema.parse(incoming)', 'incoming as AgentCreationRequest')
m(R, 'stored checkpoint validated', 'AgentCreationCheckpointSchema.parse(previous)', 'previous as AgentCreationCheckpoint')
m(R, 'new only without checkpoint', "if (previous === null) return { action: 'create' };", "if (previous === null) return { action: 'conflict', error: 'idempotency_conflict' };")
m(R, 'complete intention compared', 'JSON.stringify(checkpoint.request) !== JSON.stringify(request)', 'false')
m(R, 'completed replay distinguished', "checkpoint.phase === 'completed' ? 'completed' : 'resume'", "'resume'")
m(R, 'replay no second creation', "replayed: true, checkpoint };", "replayed: false, checkpoint };")

m(A, 'external handler channel subset', "ChannelTypeSchema.extract(['email', 'voice'])", 'ChannelTypeSchema')
m(A, 'attestation scoped public data', 'CapabilityAgentScopeSchema.strict()', 'CapabilityAgentScopeSchema.passthrough()')
m(A, 'attestation identity public data', 'AgentRuntimeIdentitySchema.strict()', 'AgentRuntimeIdentitySchema.passthrough()')
m(A, 'attestation requested version mandatory', 'configVersion: AgentConfigVersionSchema,', 'configVersion: AgentConfigVersionSchema.optional(),')
m(A, 'attestation request public shape', '}).strict().refine((request)', '}).passthrough().refine((request)')
m(A, 'attestation request runtime scope', 'request.identity.runtimeAgentId === request.scope.agentId', 'true')
m(A, 'attestation channel public shape', 'safeExtend({ kind: AgentExternalChannelKindSchema }).strict()', 'safeExtend({ kind: AgentExternalChannelKindSchema }).passthrough()')
m(A, 'attestation observed date mandatory', 'observedAt: z.iso.datetime({ offset: true })', 'observedAt: z.iso.datetime({ offset: true }).optional()')
m(A, 'attestation observation public shape', '}).strict().superRefine((observation, ctx)', '}).passthrough().superRefine((observation, ctx)')
m(A, 'attestation observation runtime scope', 'observation.identity.runtimeAgentId !== observation.scope.agentId', 'false')
m(A, 'handler loaded application', "observation.channel.state === 'loaded' && observation.applied?.state !== 'active'", 'false')
m(A, 'handler paused application', "observation.channel.state === 'paused' && observation.applied?.state !== 'paused'", 'false')
m(A, 'handler error fixed code', "observation.channel.state === 'error' && observation.error === null", 'false')
m(A, 'attestation malformed fail closed', 'if (!request.success || !observation.success || !Number.isFinite(maximumAgeMs)) return false;', 'if (!request.success || !observation.success || !Number.isFinite(maximumAgeMs)) return true;')
m(A, 'freshness finite limit', '|| !Number.isFinite(maximumAgeMs)', '|| false')
m(A, 'attestation binds full request scope', '!sameCapabilityScope(wanted.scope, actual.scope)', 'false')
m(A, 'attestation binds management identity', 'wanted.identity.managementAgentId !== actual.identity.managementAgentId', 'false')
m(A, 'attestation binds requested channel', 'wanted.kind !== actual.channel.kind', 'false')
m(A, 'attestation binds applied version', 'wanted.configVersion !== actual.applied?.version', 'false')
m(A, 'attestation never future', 'age >= 0', 'true')
m(A, 'attestation never stale', 'age <= maximumAgeMs', 'true')

originals = {file: (root/file).read_bytes() for file in tests}
for spec in specs:
    assert originals[spec['file']].decode().count(spec['old']) == 1, (spec['control'], 'nonunique source')

def run(label, testpaths):
    report = out/(label+'.json')
    cmd = ['node', str(root/'node_modules/vitest/vitest.mjs'), 'run', *testpaths, '--maxWorkers=1', '--testTimeout=60000', '--reporter=json', '--outputFile='+str(report)]
    with (out/(label+'.txt')).open('w') as log:
        result = subprocess.run(cmd, cwd=root, env=env, stdout=log, stderr=subprocess.STDOUT, timeout=180)
    data = json.loads(report.read_text())
    failed = [a for f in data['testResults'] for a in f['assertionResults'] if a['status']=='failed']
    return {'exit': result.returncode, 'passed': data['numPassedTests'], 'total': data['numTotalTests'], 'failures': [{'test': a['fullName'], 'messages': a.get('failureMessages', [])} for a in failed], 'report': str(report)}

results = {'candidate': json.loads((root/'provenance.json').read_text())['candidate'], 'started': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'planned': len(specs), 'mutations': []}
results['baseline'] = run('baseline', list(tests.values()))
assert results['baseline']['exit']==0 and results['baseline']['total']==118
try:
    for index, spec in enumerate(specs,1):
        path = root/spec['file']; original = originals[spec['file']]
        path.write_text(original.decode().replace(spec['old'], spec['new']))
        try:
            red = run(f'{index:03d}-red', [tests[spec['file']]])
        finally:
            path.write_bytes(original)
        assert path.read_bytes()==original
        restored = {'method': 'byte-identical restore to passing baseline', 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'finalGreenVerification': 'pending'}
        assertion_only = bool(red['failures']) and all(all('AssertionError:' in msg and 'TypeError:' not in msg and 'ReferenceError:' not in msg and 'timed out' not in msg for msg in f['messages']) for f in red['failures'])
        killed = red['exit']!=0 and assertion_only and path.read_bytes()==original
        row = {**spec, 'red': red, 'restored': restored, 'shaRestored': hashlib.sha256(original).hexdigest(), 'assertionOnly': assertion_only, 'killed': killed}
        results['mutations'].append(row)
        (out/'summary.json').write_text(json.dumps(results,indent=2)+'\n')
        if index%5==0 or not killed: print(index,len(specs),spec['control'], 'KILLED' if killed else 'NOT CREDITED',flush=True)
        if not killed: print(json.dumps(red),flush=True); raise SystemExit(2)
finally:
    for file,data in originals.items(): (root/file).write_bytes(data)
results['final'] = run('final',list(tests.values()))
results['restoredInputs'] = {file: hashlib.sha256((root/file).read_bytes()).hexdigest() for file in originals}
results['killed'] = sum(x['killed'] for x in results['mutations'])
for row in results['mutations']: row['restored']['finalGreenVerification'] = {'passed': results['final']['passed'], 'total': results['final']['total'], 'report': results['final']['report']}
assert len(results['mutations'])==len(specs) and results['killed']==len(specs)
assert results['final']['exit']==0 and results['final']['total']==118
(out/'summary.json').write_text(json.dumps(results,indent=2)+'\n')
print('FINAL',results['killed'],len(specs),'mutants; baseline/final118/118',flush=True)
