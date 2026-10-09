import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(new URL('../../package.json', import.meta.url));
let passed=0;
const identity={managementAgentId:'synthetic-master',runtimeAgentId:'synthetic-runtime',vaultAgentId:71};
const scope={agentId:identity.runtimeAgentId,ownerId:'synthetic-owner',tenantId:'synthetic-tenant'};
const descriptor={provider:'openai',modelId:'synthetic-model',protocol:'chat-completions',adapterId:'synthetic-adapter'};
const settings={capability:'agent-core',function:'reasoning',catalogVersion:'synthetic-catalog',requirements:{tools:false,stream:false,structuredOutput:false},mode:'single',descriptor};
for(const [label,api] of [['CJS-root',require('@x9-forge/contracts')],['CJS-router',require('@x9-forge/contracts/model-router')],['ESM-root',await import('../../dist/index.js')],['ESM-router',await import('../../dist/model-router/index.js')]]){
 for(const name of ['registeredModelConsumerDefinitions','findModelConsumerDefinition','ModelConsumerInstallRequestSchema','ModelConsumerRuntimeStateSchema','ModelConsumerInstallReceiptSchema','isModelConsumerInstallConfirmed','isModelConsumerInstallRequestCurrent','isModelConsumerRouteRequestMatching','isAgentModelRuntimeConfigurationMatching','modelSettingsSelections','sameCapabilityModelSettings','AgentModelBootstrapSourceSchema','AgentModelBootstrapPreconditionSchema','modelConsumerTransportJsonSchemas']){assert.notEqual(Reflect.get(api,name),undefined,`${label}: ${name}`);passed++;}
 assert.equal(api.registeredModelConsumerDefinitions().length,34);passed++;
 assert.equal(api.findModelConsumerDefinition('qa_vision').requirements.vision,true);passed++;
 assert.equal(api.findModelConsumerDefinition('research_search').requirements.webSearch,true);passed++;
 assert.equal(api.findModelConsumerDefinition('voice_phone_live').requirements.stream,true);passed++;
 assert.deepEqual(api.modelSettingsSelections(settings),[{tier:'primary',descriptor}]);passed++;
 const request={schemaVersion:1,identity,scope,slotId:'agent_classifier',configVersion:1,requestId:'synthetic-request-0001',expectedSourceVersion:'synthetic-source-1',settings};
 assert.equal(api.ModelConsumerInstallRequestSchema.safeParse(request).success,true);passed++;
 assert.equal(api.ModelConsumerInstallRequestSchema.safeParse({...request,credentials:{}}).success,false);passed++;
 assert.equal(api.isModelConsumerInstallRequestCurrent(request,{identity,scope,sourceVersion:'synthetic-source-1'}),true);passed++;
 assert.equal(api.isModelConsumerInstallRequestCurrent(request,{identity,scope,sourceVersion:'changed'}),false);passed++;
 assert.equal(api.modelConsumerTransportJsonSchemas().install.additionalProperties,false);passed++;
}
for(const [label,api] of [['CJS-http',require('@x9-forge/contracts/http')],['ESM-http',await import('../../dist/http/index.js')]]){
 assert.equal(api.internalModelConsumerInstallContract.path,'/internal/models/consumers/:slotId/install',label);passed++;
 assert.equal(api.internalModelConsumerStateContract.path,'/internal/models/consumers/:slotId/state',label);passed++;
}
for(const [label,api] of [['CJS-agent',require('@x9-forge/contracts/agent')],['ESM-agent',await import('../../dist/agent/index.js')]]){
 const base={action:'apply-config',desiredVersion:1,requestId:'synthetic-request-0001'};
 const command={...base,modelBootstrap:{expectedSourceVersion:'synthetic-source-1',expectedAbsent:true}};
 assert.equal(api.AgentManagementCommandSchema.safeParse(command).success,true,label);passed++;
 assert.equal(api.sameAgentCommand(command,base),false,label);passed++;
}
console.log(JSON.stringify({passed,total:104,surfaces:8}));
