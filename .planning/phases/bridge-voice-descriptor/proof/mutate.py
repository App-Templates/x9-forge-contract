from pathlib import Path
import subprocess,json,hashlib,os,time
root=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-119-1')
out=Path('/private/tmp/codex-e-bridge-voice-20261008'); source=root/'src/capability/voice/model-descriptor-voice.ts'; original=source.read_text(); sha=lambda b:hashlib.sha256(b).hexdigest()
cases=[
('input-strict', '}).strict();', '}).passthrough();', 'rejects malformed input'),
('descriptor-schema', 'descriptor: ModelDescriptorSchema,','descriptor: ModelDescriptorSchema.passthrough(),','rejects malformed descriptor'),
('choices-schema', "choices: EnabledSettingsSchema.omit({ mode: true, provider: true, model: true }),", "choices: EnabledSettingsSchema.omit({ mode: true, provider: true, model: true }).passthrough(),", 'rejects malformed or overriding choices'),
('catalog-schema', 'catalog: VoiceProviderCatalogSchema,', 'catalog: z.unknown(),', 'rejects malformed catalog'),
('role-voice', "if (role !== 'voice')", "if (false)", 'rejects non-voice role'),
('unknown-provider', 'const row = PROVIDER_ROWS.find(candidate => candidate.modelProvider === descriptor.provider);', 'const row = PROVIDER_ROWS.find(candidate => candidate.modelProvider === descriptor.provider) ?? PROVIDER_ROWS[0];','rejects unsupported provider'),
('api-protocol', 'if (!row || !row.apiProtocols.includes(descriptor.protocol))','if (!row)', 'rejects incompatible'),
('openai-row', "voiceProvider: 'openai_live'", "voiceProvider: 'elevenlabs'", 'maps openai'),
('elevenlabs-row', "apiProtocols: ['speech', 'realtime'], voiceProvider: 'elevenlabs'", "apiProtocols: ['speech', 'realtime'], voiceProvider: 'openai_live'", 'maps elevenlabs'),
('openai-realtime', "apiProtocols: ['realtime']", "apiProtocols: []", 'maps openai'),
('elevenlabs-speech', "apiProtocols: ['speech', 'realtime']", "apiProtocols: ['realtime']", 'maps elevenlabs/speech'),
('elevenlabs-realtime', "apiProtocols: ['speech', 'realtime']", "apiProtocols: ['speech']", 'maps elevenlabs/realtime'),
('model-exact', 'model: descriptor.modelId,', "model: 'first-model',", 'maps'),
('explicit-choices', '    ...choices,', "    ...choices, voiceId: 'first-voice', protocol: 'websocket',", 'maps'),
('optional-choices', '    ...choices,', "    ...choices, locale: undefined, params: undefined,", 'maps'),
('catalog-validation', 'if (validateAgentVoiceSettings(settings, catalog).length > 0)', 'if (false)', 'rejects catalog|accepts matching ElevenLabs'),
('output-independent', 'return { ok: true, settings };', 'settings.transports.reverse(); return { ok: true, settings };', 'maps'),
]
env={'PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin','HOME':'/Users/admintemp'}
def run(name,pattern=None):
 cmd=['pnpm','exec','vitest','run','tests/capability/voice/model-descriptor-voice.test.ts','--maxWorkers=1','--reporter=json','--outputFile='+str(out/(name+'.json'))]
 if pattern: cmd+=['-t',pattern]
 with (out/(name+'.log.txt')).open('w') as log: p=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT)
 data=json.loads((out/(name+'.json')).read_text())
 failures=[a for t in data['testResults'] for a in t['assertionResults'] if a['status']=='failed']
 return p.returncode,data,failures
results=[]
try:
 for name,old,new,pattern in cases:
  assert original.count(old)==1,(name,original.count(old));source.write_text(original.replace(old,new));started=time.time();rc,red,failures=run(name+'-red',pattern)
  native=[a for a in failures if any('AssertionError:' in m for m in a['failureMessages'])]
  source.write_text(original);grc,green,gfails=run(name+'-green')
  item={'name':name,'old':old,'new':new,'pattern':pattern,'nativeAssertionFailures':len(native),'redExit':rc,'greenExit':grc,'greenPassed':green['numPassedTests'],'greenTotal':green['numTotalTests'],'restoredSha256':sha(source.read_bytes()),'testSha256':sha((root/'tests/capability/voice/model-descriptor-voice.test.ts').read_bytes()),'durationSeconds':time.time()-started}
  results.append(item);(out/'MUTATIONS.json').write_text(json.dumps({'sourceSha256':sha(original.encode()),'cases':results},indent=2)+'\n');print(name,len(native),'red;',green['numPassedTests'],'/',green['numTotalTests'],'green',flush=True)
  assert rc!=0 and native and grc==0 and green['numPassedTests']==green['numTotalTests'],name
finally: source.write_text(original)
print('DONE',len(results),flush=True)
