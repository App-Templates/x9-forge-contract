from pathlib import Path
import tempfile,subprocess,tarfile,json,hashlib,shutil
root=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-171-1')
proof=root/'.planning/phases/60-paperclip-contracts/proofs/package'
proof.mkdir(parents=True,exist_ok=True)
tmp=Path(tempfile.mkdtemp(prefix='d60-package-',dir='/private/tmp'))
report={'directory':str(tmp),'checks':[]}
def run(name,cmd,cwd):
 r=subprocess.run(cmd,cwd=cwd,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=60)
 (proof/(name+'.log')).write_text(r.stdout)
 report['checks'].append({'name':name,'exitCode':r.returncode,'logSha256':hashlib.sha256(r.stdout.encode()).hexdigest()})
 print(name+': '+str(r.returncode),flush=True)
 if r.returncode: print(r.stdout);raise RuntimeError(name)
run('pack',['pnpm','pack','--pack-destination',str(tmp)],root)
archive=next(tmp.glob('*.tgz'))
report['archive']={'path':str(archive),'sha256':hashlib.sha256(archive.read_bytes()).hexdigest()}
with tarfile.open(archive) as tar:
 report['archive']['entries']=len(tar.getmembers())
 tar.extractall(tmp/'unpacked',filter='data')
consumer=tmp/'consumer';consumer.mkdir()
modules=consumer/'node_modules';(modules/'@x9-forge').mkdir(parents=True)
shutil.copytree(tmp/'unpacked/package',modules/'@x9-forge/contracts')
(modules/'zod').symlink_to((root/'node_modules/zod').resolve(),target_is_directory=True)
(consumer/'package.json').write_text('{"type":"module"}\n')
script=r'''import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const mode = process.argv[2];
const name = '@x9-forge/contracts';
const load = async subpath => mode === 'cjs' ? require(name + subpath) : import(name + subpath);
const pkg = JSON.parse(fs.readFileSync(new URL('./node_modules/@x9-forge/contracts/package.json', import.meta.url), 'utf8'));
let available = 0;
for (const key of Object.keys(pkg.exports)) { const mod = await load(key === '.' ? '' : key.slice(1)); assert.ok(Object.keys(mod).length); available++; }
const p = await load('/capability/paperclip');
const c = await load('/capability');
const h = await load('/http');
const a = await load('/agent');
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const ids = { companyId: id(1), paperclipAgentId: id(2), runId: id(3), issueId: id(4) };
const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'agent-a' };
const metadata = { ...ids, admissionId: id(5), challenge: 'a'.repeat(64), hostIssuedAt: '2026-10-09T17:00:00.000Z', hostDeadlineAt: '2026-10-09T17:01:00.000Z' };
const prepared = { phase: 'prepared', ...metadata };
const receipt = { kind: 'paperclip.x9-run-binding', schemaVersion: 1, ...metadata };
const execution = { capability: 'paperclip', source: 'x9_native_admission', scope, configVersion: 2, provisioningRevision: 3, sessionId: 'host-session', ...metadata };
const readback = { scope, appliedVersion: 2, enabled: true, provisioningRevision: 3, unitId: 'unit-a', callerRoleRef: 'developer', ...{companyId:ids.companyId,paperclipAgentId:ids.paperclipAgentId}, roleAgents: {}, provenance: { source: 'native_operator_inventory', inventoryFingerprint: 'b'.repeat(64) }, registryFingerprint: 'c'.repeat(64), configFingerprint: 'd'.repeat(64) };
const call = { callId: 'call-a', tool: 'paperclip_queue', input: {}, ...scope, sessionId: 'host-session', configVersion: 2, executionContext: execution, credentials: { PAPERCLIP_API_KEY: 'synthetic-native-value' } };
let cases = 0;
const check = fn => { fn(); cases++; };
check(() => assert.equal(p.PAPERCLIP_API_KEY, 'PAPERCLIP_API_KEY'));
check(() => assert.equal(p.PAPERCLIP_X9_ADAPTER_SECRET, 'PAPERCLIP_X9_ADAPTER_SECRET'));
check(() => assert.deepEqual(p.PaperclipNativeRunReceiptSchema.parse(receipt), receipt));
check(() => assert.equal(p.matchesPaperclipReceipt(prepared, receipt), true));
check(() => assert.equal(p.matchesPaperclipReceipt(prepared, { ...receipt, challenge: 'f'.repeat(64) }), false));
check(() => assert.equal(p.PaperclipNativeRunReceiptSchema.safeParse({ ...receipt, challenge: undefined }).success, false));
check(() => assert.equal(p.matchesPaperclipExecution(readback, execution), true));
check(() => assert.equal(p.matchesPaperclipExecution(readback, { ...execution, provisioningRevision: 4 }), false));
check(() => assert.equal(p.isPaperclipHostWindowOpen(execution, Date.parse(metadata.hostDeadlineAt)), false));
check(() => assert.deepEqual(c.PaperclipToolCallRequestSchema.parse(call), call));
check(() => assert.equal(c.PaperclipToolCallRequestSchema.safeParse({ ...call, executionContext: undefined }).success, false));
check(() => assert.equal(c.PaperclipToolCallRequestSchema.safeParse({ ...call, credentials: { ...call.credentials, PAPERCLIP_RUN_ID: ids.runId } }).success, false));
check(() => assert.equal(c.PaperclipToolCallRequestSchema.safeParse({ ...call, tenantId: 'other' }).success, false));
check(() => assert.deepEqual(c.toPaperclipToolCallScope(readback, execution), { ...scope, sessionId: execution.sessionId, configVersion: 2, executionContext: execution }));
const turn = { channelId: 'paperclip', sessionId: 'correlation', message: 'Synthetic work' };
check(() => assert.deepEqual(h.InternalAgentTurnRequestSchema.parse({ ...turn, paperclipAdmission: { phase: 'prepare', native: ids } }).paperclipAdmission, { phase: 'prepare', native: ids }));
check(() => assert.deepEqual(h.InternalAgentTurnResponseSchema.parse({ ok: true, reply: '', updatedHistory: [], paperclipAdmission: prepared }).paperclipAdmission, prepared));
check(() => assert.equal(h.InternalAgentTurnResponseSchema.safeParse({ ok: true, reply: 'model work', updatedHistory: [], paperclipAdmission: prepared }).success, false));
check(() => assert.deepEqual(h.InternalAgentTurnRequestSchema.parse(turn), turn));
check(() => assert.equal(h.paperclipAgentInstallPath('agent-a'), '/internal/capability/agents/agent-a/install'));
check(() => assert.equal(a.AgentContextCoreSchema.safeParse({ agentId: 'agent-a', ownerId: 'owner-a', credentials: {}, llmConfig: { provider: 'test', model: 'test' }, telegramAllowFrom: [] }).success, true));
console.log(JSON.stringify({ mode, availableSubpaths: available, semanticCases: cases }));
'''
(consumer/'probe.mjs').write_text(script)
(proof/'probe.mjs').write_text(script)
for mode in ['esm','cjs']:run(mode,['node','probe.mjs',mode],consumer)
# Resolve the packaged declarations through actual package names in both consumer modes.
probe='''import { PaperclipExecutionContextSchema, PaperclipNativeRunReceiptSchema, type PaperclipExecutionContext } from '@x9-forge/contracts/capability/paperclip';
import { PaperclipToolCallRequestSchema, toPaperclipToolCallScope } from '@x9-forge/contracts/capability';
import { InternalAgentTurnRequestSchema, type InternalAgentTurnRequest } from '@x9-forge/contracts/http';
const context: PaperclipExecutionContext = PaperclipExecutionContextSchema.parse({});
const request: InternalAgentTurnRequest = InternalAgentTurnRequestSchema.parse({});
void [context, request, PaperclipNativeRunReceiptSchema, PaperclipToolCallRequestSchema, toPaperclipToolCallScope];
'''
for ext in ['mts','cts']:(consumer/('probe.'+ext)).write_text(probe)
for label,mode,resolution,filename in [('types-esm-node16','Node16','Node16','probe.mts'),('types-cjs-node16','Node16','Node16','probe.cts'),('types-esm-bundler','ESNext','Bundler','probe.mts')]:
 run(label,[str(root/'node_modules/.bin/tsc'),'--noEmit','--strict','--module',mode,'--moduleResolution',resolution,'--target','ES2022',filename],consumer)
# Same two representative compiled guards are deliberately broken in each format.
for mode,extension in [('esm','js'),('cjs','cjs')]:
 for name,file,old,new in [('challenge','capability/paperclip/native-admission','wanted.challenge === actual.challenge','true'),('execution-required','capability/tool-call',"ctx.addIssue({ code: 'custom', path: ['executionContext'], message: 'Native admission required' });",'')]:
  path=modules/'@x9-forge/contracts/dist'/(file+'.'+extension)
  original=path.read_text();assert old in original
  try:
   path.write_text(original.replace(old,new,1))
   result=subprocess.run(['node','probe.mjs',mode],cwd=consumer,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=30)
   semantic=result.returncode!=0 and 'AssertionError' in result.stdout and 'TypeError:' not in result.stdout
   (proof/(mode+'-'+name+'-fault.log')).write_text(result.stdout)
   assert semantic,(mode,name,result.stdout)
   report['checks'].append({'name':mode+'-'+name+'-fault','semanticRed':semantic,'exitCode':result.returncode,'logSha256':hashlib.sha256(result.stdout.encode()).hexdigest()})
   print(mode+'-'+name+': ASSERTION_RED',flush=True)
  finally:path.write_text(original)
 run(mode+'-restored',['node','probe.mjs',mode],consumer)
report['exactPackageRestore']=all(hashlib.sha256(f.read_bytes()).hexdigest()==hashlib.sha256((tmp/'unpacked/package'/f.relative_to(modules/'@x9-forge/contracts')).read_bytes()).hexdigest() for f in (modules/'@x9-forge/contracts').rglob('*') if f.is_file())
(proof/'qualification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'archive':report['archive'],'exactPackageRestore':report['exactPackageRestore']}),flush=True)
