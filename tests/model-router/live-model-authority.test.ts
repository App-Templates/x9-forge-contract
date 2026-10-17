import {expect,it} from 'vitest';
import {ModelDescriptorSchema,ModelApiProtocolSchema,AgentModelSourceObservationSchema,findModelConsumerDefinition} from '../../src/model-router/index.js';
import {internalPrimaryModelSourceObservationContract,internalPhoneBackendModelSourceContract} from '../../src/http/index.js';
import {INTERNAL_SECRET_HEADER} from '../../src/auth/index.js';
it('declares GPT-Live as a distinct additive protocol',()=>{
 expect(ModelDescriptorSchema.parse({provider:'openai',modelId:'gpt-live-1',protocol:'live',adapterId:'openai-live'}).protocol).toBe('live');
 expect(ModelApiProtocolSchema.parse('realtime')).toBe('realtime');
 expect(ModelApiProtocolSchema.safeParse('live-session-url').success).toBe(false);
});
it('resolves personal primary source with canonical internal auth and no client-selected identity',()=>{
 expect(internalPrimaryModelSourceObservationContract).toMatchObject({method:'GET',path:'/internal/models/primary/local-source',authType:'secret',authHeader:INTERNAL_SECRET_HEADER});
 expect(internalPrimaryModelSourceObservationContract.responseSchema).toBe(AgentModelSourceObservationSchema);
});
it.each(['voice_phone_live','voice_web_live'])('preserves the single live audio consumer %s',slot=>{
 expect(findModelConsumerDefinition(slot)).toMatchObject({function:'voice',routing:'single',changeBoundary:'next-session',linkedSelectionGroup:'voice_live_audio',requirements:{stream:true}});
});
it.each(['voice_phone_delegation','voice_web_delegation'])('preserves the distinct backend consumer %s',slot=>{
 expect(findModelConsumerDefinition(slot)).toMatchObject({function:'reasoning',routing:'single',changeBoundary:'next-session',linkedSelectionGroup:'voice_live_backend',requirements:{tools:true}});
});
it('observes only the scoped phone backend without granting an installation',()=>{
 const body={identity:{managementAgentId:'synthetic-management',runtimeAgentId:'synthetic-runtime',vaultAgentId:42},scope:{agentId:'synthetic-runtime',ownerId:'1',tenantId:'synthetic-tenant'},slotId:'voice_phone_delegation'};
 expect(internalPhoneBackendModelSourceContract.requestSchema.parse(body)).toEqual(body);
 expect(internalPhoneBackendModelSourceContract.requestSchema.safeParse({...body,slotId:'voice_web_delegation'}).success).toBe(false);
 expect(internalPhoneBackendModelSourceContract).toMatchObject({method:'POST',authType:'secret',authHeader:INTERNAL_SECRET_HEADER});
});
