import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(new URL('../../package.json',import.meta.url));
const names=['AGENT_CHAT_MODEL_SLOT_ID','AGENT_CORE_MODEL_CAPABILITY_ID','AGENT_CORE_MODEL_CONSUMER','ModelConsumerSchema','ModelConsumerRegistrySchema','registeredModelConsumers','findModelConsumer'];
const expected={slotId:'agent_chat',capability:'agent-core',function:'reasoning',requirements:{tools:true,stream:false,structuredOutput:false}};
let passed=0;
for(const [loader,api] of [['CJS-root',require('@x9-forge/contracts')],['CJS-router',require('@x9-forge/contracts/model-router')],['ESM-root',await import('../../dist/index.js')],['ESM-router',await import('../../dist/model-router/index.js')]]){
 for(const name of names){assert.notEqual(Reflect.get(api,name),undefined,`${loader}: ${name}`);passed++;}
 assert.equal(api.AGENT_CHAT_MODEL_SLOT_ID,'agent_chat');passed++;
 assert.deepEqual(api.AGENT_CORE_MODEL_CONSUMER,expected);passed++;
 assert.deepEqual(api.registeredModelConsumers(),[expected]);passed++;
 assert.equal(api.findModelConsumer('unknown-consumer'),undefined);passed++;
 assert.equal(api.ModelConsumerSchema.safeParse({...expected,extra:true}).success,false);passed++;
}
console.log(JSON.stringify({passed,total:48,surfaces:4}));
