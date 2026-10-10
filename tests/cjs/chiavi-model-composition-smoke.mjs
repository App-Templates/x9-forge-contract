import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let assertions = 0;
const check = (actual, expected, message) => { assertions++; assert.deepEqual(actual, expected, message); };
const identity = { managementAgentId: 'composition-agent', runtimeAgentId: 'composition-runtime', vaultAgentId: 71 };
const scope = { agentId: identity.runtimeAgentId, ownerId: 'composition-owner', tenantId: 'composition-tenant' };
const descriptor = { provider: 'openai', modelId: 'synthetic-model', protocol: 'chat-completions', adapterId: 'synthetic-adapter' };
const observation = { identity, scope, sourceVersion: 'composition-generation', observedAt: '2026-10-09T06:20:00Z', validUntil: '2026-10-09T06:20:30Z' };
const now = new Date('2026-10-09T06:20:01Z');
const names = ['AgentModelInitialSourceSchema','AgentModelSourceObservationSchema','ModelConsumerRuntimeStateSchema','ModelConsumerInstallRequestSchema','ModelConsumerInstallReceiptSchema','isAgentModelInitialSourceCurrent','registeredModelConsumerDefinitions'];
for (const mode of ['esm', 'cjs']) {
 const load = specifier => mode === 'esm' ? import(specifier) : Promise.resolve(require(specifier));
 const [root, api, http, agent, vault, voice, research] = await Promise.all(['@x9-forge/contracts','@x9-forge/contracts/model-router','@x9-forge/contracts/http','@x9-forge/contracts/agent','@x9-forge/contracts/vault','@x9-forge/contracts/capability/voice-live','@x9-forge/contracts/capability/ricerca'].map(load));
 for (const name of names) { check(typeof root[name], name.startsWith('is') || name.startsWith('registered') ? 'function' : 'object', mode+' root export '+name); check(typeof api[name], typeof root[name], mode+' router export '+name); }
 const definitions = api.registeredModelConsumerDefinitions();
 check(definitions.length, 35, mode+' canonical inventory');
 const source = { schemaVersion: 1, ...observation, authority:'runtime-loaded', coverage:'complete', missingSlots:[], selections:definitions.map(d => {
  const common={capability:d.capability,function:d.function,requirements:d.requirements,catalogVersion:'synthetic-catalog'};
  const settings=d.routing==='tiered'?{...common,mode:'automatic',tiers:{standard:descriptor,advanced:descriptor,reasoning:descriptor},fallback:descriptor}:d.routing==='failover'?{...common,mode:'failover',primary:descriptor,fallback:descriptor}:{...common,mode:'single',descriptor,...(d.function==='embedding'?{embeddingDimensions:1536}:{})};
  return {slotId:d.slotId,settings};
 }) };
 check(api.AgentModelInitialSourceSchema.safeParse(source).success,true,mode+' roleless Initial');
 check(api.AgentModelInitialSourceSchema.safeParse({...source,role:'master'}).success,false,mode+' no assigned role');
 check(api.AgentModelBootstrapSourceSchema.safeParse({...source,role:'master'}).success,true,mode+' explicit Master bootstrap retained');
 check(api.isAgentModelInitialSourceCurrent(source,{identity,scope,sourceVersion:observation.sourceVersion},now),true,mode+' fresh Initial');
 for(const expected of [{identity:{...identity,vaultAgentId:72},scope,sourceVersion:observation.sourceVersion},{identity,scope:{...scope,ownerId:'other'},sourceVersion:observation.sourceVersion},{identity,scope,sourceVersion:'other'}]) check(api.isAgentModelInitialSourceCurrent(source,expected,now),false,mode+' exact authority');
 check(api.isAgentModelInitialSourceCurrent(source,{identity,scope,sourceVersion:observation.sourceVersion},new Date(observation.validUntil)),false,mode+' expiry');
 check(api.AgentModelInitialSourceSchema.safeParse({...source,selections:source.selections.slice(1)}).success,false,mode+' complete coverage');
 const state={identity,versions:null,saved:null,runtime:null,initialSource:source};
 check(api.AgentModelsStateSchema.safeParse(state).success,true,mode+' initial state');
 check(api.AgentModelsStateSchema.safeParse({...state,bootstrapSource:{...source,role:'master'}}).success,false,mode+' no competing authority');
 const settings=source.selections.find(s=>s.slotId==='agent_classifier').settings;
 const observed={schemaVersion:1,...observation,slotId:'agent_classifier',status:'observed',configVersion:null,requestId:null,settings,reason:'Synthetic observation',embedding:null};
 check(api.ModelConsumerRuntimeStateSchema.safeParse(observed).success,true,mode+' honest observed');
 for(const patch of [{configVersion:1},{requestId:'synthetic-install-0001'},{settings:null}])check(api.ModelConsumerRuntimeStateSchema.safeParse({...observed,...patch}).success,false,mode+' no fabricated installation');
 const request={schemaVersion:1,identity,scope,slotId:'agent_classifier',configVersion:1,requestId:'synthetic-install-0001',expectedSourceVersion:observation.sourceVersion,settings};
 check(api.ModelConsumerInstallRequestSchema.safeParse(request).success,true,mode+' canonical install request');
 check(api.isModelConsumerInstallConfirmed(request,{requestId:request.requestId,outcome:'installed',state:observed},now),false,mode+' observed not installed');
 check(api.isModelConsumerInstallConfirmed(request,{requestId:request.requestId,outcome:'installed',state:{...observed,status:'installed',configVersion:1,requestId:request.requestId,reason:null}},now),true,mode+' real installed receipt');
 for(const name of ['internalAgentModelSourceObservationContract','internalModelConsumerStateContract','internalModelConsumerInstallContract'])check(http[name]?.authType,'secret',mode+' canonical HTTP '+name);
 check(http.isAgentModelsOverviewWithinAccess({version:'composition-overview',observedAt:observation.observedAt,rows:[],coverage:[{identity,ownerId:scope.ownerId,status:'unavailable',missingSlots:['agent_chat'],reason:'Synthetic unavailable'}]},{role:'owner',ownerId:'foreign'}),false,mode+' coverage owner');
 check(agent.getAgentCredentialServiceMetadata('NETATMO_EMAIL')?.secret,false,mode+' retained02 public account credential');
 const keys=[...new Set([...agent.AGENT_CREDENTIAL_SERVICE_KEYS.filter(k=>agent.getAgentCredentialServiceMetadata(k)?.kind==='credential'),...vault.PLATFORM_INTERNAL_CREDENTIAL_KEYS])];
 check(keys.includes('INTERNAL_TOKEN'),true,mode+' complete credential catalog');
 for(const key of keys) {const result={callId:'composition-call',status:'success',output:{}};check(http.InternalAgentToolDispatchResponseSchema.safeParse({...result,[key]:'synthetic-value'}).success,false,mode+' root credential '+key);check(http.InternalAgentToolDispatchResponseSchema.safeParse({...result,output:{nested:[{[key]:'synthetic-value'}]}}).success,false,mode+' nested credential '+key);}
 check(Object.keys(http.INTERNAL_AGENT_EXECUTIONS).length,13,mode+' bounded internal target inventory');
 for(const entry of Object.values(http.INTERNAL_AGENT_EXECUTIONS)){check(entry.modelVisible,false,mode+' private execution');for(const field of ['credentialKeys','identifierKeys','settingKeys'])check(Object.isFrozen(entry[field]),true,mode+' immutable '+field);}
 const glasses=http.INTERNAL_AGENT_EXECUTIONS.glasses_session_admit;
 check(glasses.credentialKeys,['ELEVENLABS_API_KEY'],mode+' minimal credential');check(glasses.identifierKeys,['ELEVENLABS_VOICE_ID'],mode+' required identifier');check(glasses.settingKeys,['ELEVENLABS_MODEL_ID'],mode+' required setting');
 check(typeof voice.ManagedVoiceLiveCallStartRequestSchema,'object',mode+' managed voice');check(typeof voice.StandaloneVoiceLiveCallStartRequestSchema,'object',mode+' explicit standalone voice');check(voice.ManagedVoiceLiveCredentialsSchema.safeParse({INTERNAL_TOKEN:'synthetic'}).success,false,mode+' no infrastructure auth');
 check(research.ResearchExecuteInputSchema.safeParse({researchId:'composition-research',leaseToken:'00000000-0000-4000-8000-000000000001'}).success,true,mode+' internal job lease');check(Object.values(research.RICERCA_TOOLS).includes(research.RICERCA_INTERNAL_TOOLS.execute),false,mode+' no public job executor');
}
console.log(JSON.stringify({marker:'CHIAVI_MODEL_COMPOSITION',surfaces:14,assertions,passed:assertions}));
