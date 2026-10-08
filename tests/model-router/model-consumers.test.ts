import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as Router from '../../src/model-router/index.js';
import * as Root from '../../src/index.js';
function exported(name: string): unknown { const value: unknown=Reflect.get(Router,name);expect(value,name).toBeDefined();return value; }
function schema(name='ModelConsumerSchema'): z.ZodType { return exported(name) as z.ZodType; }
function call(name:string,...args:unknown[]): unknown { const fn=exported(name);expect(fn,name).toBeTypeOf('function');return (fn as (...args:unknown[])=>unknown)(...args); }
const row={slotId:'agent_chat',capability:'agent-core',function:'reasoning',requirements:{tools:true,stream:false,structuredOutput:false}};

describe('M3-B canonical consumer metadata',()=>{
 it('B01 publishes the approved stable slot and capability',()=>{expect(exported('AGENT_CHAT_MODEL_SLOT_ID')).toBe('agent_chat');expect(exported('AGENT_CORE_MODEL_CAPABILITY_ID')).toBe('agent-core');expect(exported('AGENT_CORE_MODEL_CONSUMER')).toEqual(row);});
 it('B02 publishes requirements without pretending token streaming or structured output',()=>{expect(schema().parse(row)).toEqual(row);expect(call('registeredModelConsumers')).toEqual([row]);expect(call('findModelConsumer','agent_chat')).toEqual(row);});
 it.each(['AGENT_CHAT_MODEL_SLOT_ID','AGENT_CORE_MODEL_CAPABILITY_ID','AGENT_CORE_MODEL_CONSUMER','ModelConsumerSchema','ModelConsumerRegistrySchema','registeredModelConsumers','findModelConsumer'])('B03 exposes %s through root and model-router',name=>{expect(Reflect.get(Root,name),name).toBe(exported(name));});
 it.each([null,{}, {...row,slotId:'../other'}, {...row,slotId:'UPPER'}, {...row,capability:''}, {...row,function:'unknown'}, {...row,extra:true}, {...row,requirements:{...row.requirements,extra:true}}, {...row,requirements:{...row.requirements,stream:'true'}}, {...row,requirements:{tools:true,stream:false}}, {...row,requirements:null}])('B04 rejects unknown, malformed or incomplete metadata %j',input=>{expect(schema().safeParse(input).success).toBe(false);});
 it.each(['slotId','capability','function','requirements'])('B05 requires %s without inferring it',field=>{const input={...row};Reflect.deleteProperty(input,field);expect(schema().safeParse(input).success).toBe(false);});
 it('B06 generic metadata preserves valid future consumers without claiming them registered',()=>{const other={...row,slotId:'synthetic_memory',capability:'synthetic-memory',function:'memory-extraction',requirements:{tools:false,stream:false,structuredOutput:true}};expect(schema().parse(other)).toEqual(other);expect(call('findModelConsumer',other.slotId)).toBeUndefined();});
 it.each([[],[row,row],[row,{...row,function:'embedding'}],Array.from({length:65},(_,i)=>({...row,slotId:'synthetic-'+i}))].map(rows=>[rows]))('B07 registry refuses empty, duplicate or excessive rows %j',rows=>{expect(schema('ModelConsumerRegistrySchema').safeParse(rows).success).toBe(false);});
 it('B08 registry allows distinct slots and its exact upper boundary',()=>{const rows=Array.from({length:64},(_,i)=>({...row,slotId:'synthetic-'+i}));expect(schema('ModelConsumerRegistrySchema').parse(rows)).toEqual(rows);});
 it.each([undefined,null,{},'agent_chat-other','agent_chat ','AGENT_CHAT','../agent_chat','mem0_unknown'])('B09 invalid or unknown slot %j grants no consumer binding',slot=>{expect(call('findModelConsumer',slot)).toBeUndefined();});
 it('B10 detached registry reads cannot rewrite consumer authority',()=>{const result=call('registeredModelConsumers') as typeof row[];result[0]!.capability='changed';result[0]!.requirements.tools=false;result.push({...row,slotId:'injected'});expect(call('registeredModelConsumers')).toEqual([row]);expect(call('findModelConsumer','agent_chat')).toEqual(row);});
 it('B11 detached lookup reads cannot rewrite consumer requirements',()=>{const result=call('findModelConsumer','agent_chat') as typeof row;result.requirements.stream=true;result.slotId='changed';expect(call('findModelConsumer','agent_chat')).toEqual(row);});
 it('B12 exported native consumer and nested requirements are frozen',()=>{const constant=exported('AGENT_CORE_MODEL_CONSUMER') as typeof row;expect(Object.isFrozen(constant)).toBe(true);expect(Object.isFrozen(constant.requirements)).toBe(true);expect(Reflect.set(constant,'slotId','changed')).toBe(false);expect(Reflect.set(constant.requirements,'tools',false)).toBe(false);expect(constant).toEqual(row);});
 it('B13 slot schema remains generic and accepts legacy custom names',()=>{const s=exported('ModelSlotIdSchema') as z.ZodType;expect(s.parse('legacy-custom-slot')).toBe('legacy-custom-slot');});
});
