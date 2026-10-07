from pathlib import Path
import json,subprocess,hashlib,shutil
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-68-1');p=r/'.planning/phases/bridge-135-voice-catalog';b=Path('/private/tmp/codex-a-bridge135-build-current').read_text().strip();b=Path(b);probe=b/'bridge135-probe.cjs'
probe.write_text('''const assert = require('node:assert/strict');
const http = require('@x9-forge/contracts/http');
const voice = require('@x9-forge/contracts/voice');
const auth = require('@x9-forge/contracts/auth');
const c = http.internalVoiceCatalogContract;
const value = {version:'synthetic-version',providers:[{provider:'synthetic_voice',label:'Synthetic',protocols:['sip'],transports:['phone'],models:[{id:'synthetic-model',label:'Synthetic'}],voices:{kind:'id',pattern:'^[a-z]+$'}}]};
const results=[];
for(const [name,check] of [
 ['exported-canonical-schema',()=>{assert.ok(c);assert.equal(c.responseSchema,voice.VoiceProviderCatalogSchema);} ],
 ['read-only-method',()=>assert.equal(c?.method,'GET')],
 ['canonical-path',()=>assert.equal(c?.path,'/internal/voice/catalog')],
 ['secret-authentication',()=>assert.equal(c?.authType,'secret')],
 ['canonical-header',()=>assert.equal(c?.authHeader,auth.INTERNAL_SECRET_HEADER)],
 ['no-request-body',()=>{assert.ok(c);assert.equal(c.bodySchema,undefined);} ],
 ['valid-versioned-response',()=>{const parsed=c?.responseSchema.safeParse(value);assert.equal(parsed?.success,true);assert.deepEqual(parsed.data,value);} ],
 ['invalid-and-private-response',()=>{assert.equal(c?.responseSchema.safeParse({providers:[]}).success,false);const parsed=c?.responseSchema.safeParse({...value,synthetic_private_marker:'do-not-forward'});assert.equal(parsed?.success,true);assert.deepEqual(parsed.data,value);} ],
]){try{check();results.push({name,passed:true});}catch(error){results.push({name,passed:false,errorName:error.name,message:error.message});}}
console.log(JSON.stringify({total:results.length,passed:results.filter(v=>v.passed).length,results}));process.exitCode=results.every(v=>v.passed)?0:1;
''');shutil.copyfile(probe,p/'04-cjs-probe.cjs');f=b/'dist/http/endpoints/voice-catalog.cjs';original=f.read_bytes();text=original.decode();done=[];names=set()
def replace(old,new):assert text.count(old)==1,(old,text.count(old));return text.replace(old,new)
recipes=[('export',replace('exports.internalVoiceCatalogContract = {','exports.wrongCatalog = {')),('method',replace("method: 'GET'","method: 'POST'")),('path',replace("path: '/internal/voice/catalog'","path: '/wrong/catalog'")),('auth',replace("authType: 'secret'","authType: 'none'")),('header',replace('authHeader: index_js_1.INTERNAL_SECRET_HEADER','authHeader: index_js_1.INTERNAL_SECRET_HEADER + "-wrong"')),('body',replace('    responseSchema:','    bodySchema: true,\n    responseSchema:')),('permissive',replace('responseSchema: agent_voice_settings_js_1.VoiceProviderCatalogSchema','responseSchema: require("zod").z.unknown()')),('reject-valid',replace('responseSchema: agent_voice_settings_js_1.VoiceProviderCatalogSchema','responseSchema: require("zod").z.never()'))]
def run(label):
 result=subprocess.run(['node',str(probe)],cwd=b,capture_output=True,text=True,timeout=30);data=json.loads(result.stdout);(p/(label+'.txt')).write_text(result.stdout+result.stderr);(p/(label+'.json')).write_text(json.dumps({'exit':result.returncode,**data},indent=2)+'\n');return result.returncode,data
try:
 code,baseline=run('04-baseline');assert code==0 and baseline['passed']==8
 for label,mutated in recipes:
  f.write_text(mutated);code,red=run('04-'+label+'-red');assert code==1
  hits=[v['name']for v in red['results']if not v['passed']and v['errorName']=='AssertionError'];assert hits
  f.write_bytes(original);assert f.read_bytes()==original;code,green=run('04-'+label+'-restore');assert code==0 and green['passed']==8
  done.append({'name':label,'redPassed':red['passed'],'total':8,'assertions':hits,'restorePassed':8});names.update(hits)
 code,final=run('04-final');assert code==0 and final['passed']==8 and len(done)==8 and len(names)==8
finally:
 f.write_bytes(original);(p/'04-cjs-mutations.json').write_text(json.dumps({'qualified':len(done),'total':8,'probes':8,'completed':done,'namesHit':sorted(names),'sourceRestored':f.read_bytes()==original,'sourceSha256':hashlib.sha256(original).hexdigest()},indent=2)+'\n')
print('actual CJS8/8,compiled8/8,names8/8,SHA1/1',flush=True)
consumer=b/'bridge135-consumer.cts';consumer.write_text('''import { internalVoiceCatalogContract } from '@x9-forge/contracts/http';
import type { AuthForEndpoint } from '@x9-forge/contracts/http';
import { INTERNAL_SECRET_HEADER } from '@x9-forge/contracts/auth';
import type { VoiceProviderCatalog } from '@x9-forge/contracts/voice';
const method: 'GET' = internalVoiceCatalogContract.method;
const auth: AuthForEndpoint<typeof internalVoiceCatalogContract.authType> = { [INTERNAL_SECRET_HEADER]: 'synthetic-internal-value' };
const catalog: VoiceProviderCatalog = internalVoiceCatalogContract.responseSchema.parse({version:'synthetic',providers:[]});
// @ts-expect-error Read-only catalog has no request body.
void internalVoiceCatalogContract.bodySchema;
void method; void auth; void catalog.version;
''');shutil.copyfile(consumer,p/'04-consumer.cts');ctOriginal=consumer.read_bytes();cmd=['pnpm','-C',str(b),'exec','tsc','--ignoreConfig','--noEmit','--strict','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2023',str(consumer)]
def types(label):
 result=subprocess.run(cmd,cwd=b,capture_output=True,text=True,timeout=60);(p/(label+'.txt')).write_text(result.stdout+result.stderr);(p/(label+'-exit.json')).write_text(json.dumps({'command':cmd,'exit':result.returncode},indent=2)+'\n');return result
try:
 baseline=types('04-types-baseline');assert baseline.returncode==0,baseline.stdout
 consumer.write_text(ctOriginal.decode().replace("const method: 'GET'","const method: 'POST'"));red=types('04-types-red');assert red.returncode!=0 and 'TS2322' in red.stdout
finally:consumer.write_bytes(ctOriginal)
green=types('04-types-green');assert green.returncode==0 and consumer.read_bytes()==ctOriginal
(p/'04-types-proof.json').write_text(json.dumps({'baselineExit':0,'redExit':red.returncode,'redDiagnostic':'TS2322','greenExit':0,'restored':True,'sha256':hashlib.sha256(ctOriginal).hexdigest()},indent=2)+'\n');print('CTS0,TS2322red,restore0',flush=True)
