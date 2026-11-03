import { describe, it, expect } from 'vitest';
import type { z } from 'zod';
import * as API from '../../src/model-router/index.js';
const identity={managementAgentId:'synthetic-master',runtimeAgentId:'synthetic-runtime',vaultAgentId:71};
const scope={agentId:identity.runtimeAgentId,ownerId:'synthetic-owner',tenantId:'synthetic-tenant'};
const descriptor={provider:'openai',modelId:'synthetic-model',protocol:'chat-completions',adapterId:'synthetic-adapter'};
const settings={capability:'agent-core',function:'reasoning',catalogVersion:'synthetic-catalog',requirements:{tools:false,stream:false,structuredOutput:false},mode:'single',descriptor};
const saved={schemaVersion:1,identity,configVersion:2,selections:[{slotId:'agent_classifier',settings}],provenance:{scope,bindings:[{slotId:'agent_classifier',origin:'custom'}]}};
const observation={identity,scope,sourceVersion:'synthetic-generation-1',observedAt:'2026-10-09T07:07:00Z',validUntil:'2026-10-09T07:07:30Z'};
const state={identity,versions:{desired:2,applied:null,failed:null},saved,runtime:null,sourceObservation:observation};
const expected={identity,scope,sourceVersion:observation.sourceVersion};
const now=new Date('2026-10-09T07:07:01Z');
function schema():z.ZodType{const x=Reflect.get(API,'AgentModelSourceObservationSchema');expect(x).toBeDefined();return x as z.ZodType;}
function current(input:unknown,target:unknown=expected,clock:Date=now):boolean{const x=Reflect.get(API,'isAgentModelSourceObservationCurrent');expect(x).toBeTypeOf('function');return (x as (input:unknown,target:unknown,now:Date)=>boolean)(input,target,clock);}
describe('Modern model source generation observation',()=>{
 it('O01 carries the actual modern runtime generation on the existing state',()=>{expect(schema().parse(observation)).toEqual(observation);expect(API.AgentModelsStateSchema.parse(state)).toEqual(state);expect(current(observation)).toBe(true);expect(API.AgentModelsStateSchema.safeParse({...state,sourceObservation:null}).success).toBe(true);const legacy={...state};Reflect.deleteProperty(legacy,'sourceObservation');expect(API.AgentModelsStateSchema.safeParse(legacy).success).toBe(true);});
 it.each(['identity','scope','sourceVersion','observedAt','validUntil'])('O02 requires %s',key=>{const value={...observation};Reflect.deleteProperty(value,key);expect(schema().safeParse(value).success).toBe(false);});
 it.each([{identity:{...identity,vaultAgentId:undefined}},{scope:{...scope,agentId:'other'}},{scope:{...scope,ownerId:' '}},{sourceVersion:' '},{observedAt:'invalid'},{validUntil:'2026-10-09T07:07:00Z'},{validUntil:'2026-10-09T07:06:59Z'},{privateContext:{}},{extra:true}])('O03 rejects invalid observation %j',patch=>expect(schema().safeParse({...observation,...patch}).success).toBe(false));
 it.each([{identity:{...identity,managementAgentId:'other'}},{identity:{...identity,vaultAgentId:72}},{scope:{...scope,ownerId:'other'}},{scope:{...scope,tenantId:'other'}},{sourceVersion:'changed'}])('O04 changed authority is not current %j',patch=>expect(current(observation,{...expected,...patch})).toBe(false));
 it.each(['2026-10-09T07:07:30Z','2026-10-09T07:06:54Z','invalid'])('O05 expired/future/invalid clock %s is not current',time=>expect(current(observation,expected,new Date(time))).toBe(false));
 it('O06 an old observation with a long expiry is still stale',()=>expect(current({...observation,observedAt:'2026-10-09T07:05:00Z',validUntil:'2026-10-09T07:08:00Z'})).toBe(false));
 it.each([{identity:{...identity,managementAgentId:'other'}},{identity:{...identity,vaultAgentId:72}},{scope:{...scope,ownerId:'other'}},{scope:{...scope,tenantId:'other'}}])('O07 state does not claim another observed authority %j',patch=>expect(API.AgentModelsStateSchema.safeParse({...state,sourceObservation:{...observation,...patch}}).success).toBe(false));
 it.each([{saved:null,versions:null},{saved:{...saved,provenance:undefined}}])('O08 observation requires saved scoped authority %j',patch=>expect(API.AgentModelsStateSchema.safeParse({...state,...patch}).success).toBe(false));
 it('O09 explicit command consumes a fresh HTTP observation as well as a trusted direct generation',()=>{const command={action:'apply-config',requestId:'synthetic-request-0001',desiredVersion:2,modelConfiguration:saved,modelExpectedSourceVersion:observation.sourceVersion};const helper=API.isAgentModelCommandSourceCurrent as (command:unknown,source:unknown,now?:Date)=>boolean;expect(helper(command,observation,now)).toBe(true);expect(helper(command,observation,new Date('2026-10-09T07:07:31Z'))).toBe(false);expect(helper(command,{...observation,sourceVersion:'changed'},now)).toBe(false);expect(helper(command,expected,now)).toBe(true);});
});
