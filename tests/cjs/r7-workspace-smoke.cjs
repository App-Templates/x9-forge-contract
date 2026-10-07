'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { ZodError } = require('zod');
const agent = require('@x9-forge/contracts/agent');
const { PLATFORM_INTERNAL_CREDENTIAL_KEYS } = require('@x9-forge/contracts/vault');
const hash = 'a'.repeat(64), updatedAt = '2026-10-07T00:00:00Z';
function workspace() {
  return { agentId:'agent-1',ownerId:'owner-1',tenantId:'tenant-1',version:7,
    files:agent.AGENT_WORKSPACE_HUMAN_FILES.map(name=>({name,load:'always',versions:{desired:2,applied:1,failed:null},
      history:[1,2].map(version=>({version,origin:{kind:'agent'},hash,bytes:100,updatedAt}))})),
    tools:{name:'TOOLS.md',origin:'generated',editable:false,load:'always',version:7,hash,bytes:100,updatedAt},
    registry:{capabilities:[{name:'cap-calendar',enabled:true,host:'fixture',port:3001,version:'1.0.0'}]},
    skills:[{capability:'cap-calendar',description:'Calendar operations',procedure:{path:'skills/cap-calendar/SKILL.md',load:'on-demand',editable:false,version:7,hash,bytes:100}}] };
}
function context() {return {agentId:'agent-1',ownerId:'owner-1',tenantId:'tenant-1',credentials:{},llmConfig:{provider:'openai',model:'fixture'},telegramAllowFrom:[],telegramBotToken:'',workspacePath:'/fixture/workspace',registryPath:'/fixture/registry.json',displayName:'Fixture'};}
const probes = [];
const probe = (name, run) => probes.push({name,run});
probe('public CJS exports',()=>{assert.equal(typeof agent.AgentWorkspaceDescriptorSchema.parse,'function');assert.equal(typeof agent.AgentContextWithWorkspaceWriteSchema.parse,'function');assert.equal(typeof agent.parseAgentWorkspaceRollbackRequest,'function');});
probe('canonical root files',()=>{assert.deepEqual(agent.AGENT_WORKSPACE_HUMAN_FILES,['IDENTITY.md','SOUL.md','POLICIES.md','USER.md']);assert.equal(agent.AGENT_WORKSPACE_TOOLS_FILE,'TOOLS.md');});
probe('complete applied metadata',()=>assert.deepEqual(agent.AgentWorkspaceDescriptorSchema.parse(workspace()),workspace()));
probe('generated TOOLS read-only',()=>{const w=workspace();w.tools.editable=true;assert.equal(agent.AgentWorkspaceDescriptorSchema.safeParse(w).success,false);});
probe('saved/applied file versions',()=>{const w=workspace();w.files[0].versions.applied=3;assert.equal(agent.AgentWorkspaceDescriptorSchema.safeParse(w).success,false);});
probe('rollback preserves desired and applied',()=>{const w=workspace(),before=structuredClone(w),request={file:'SOUL.md',expectedVersion:2,targetVersion:1};assert.deepEqual(agent.parseAgentWorkspaceRollbackRequest(request,w),request);assert.deepEqual(w,before);});
probe('rollback CAS',()=>assert.throws(()=>agent.parseAgentWorkspaceRollbackRequest({file:'SOUL.md',expectedVersion:3,targetVersion:1},workspace()),ZodError));
probe('rollback authoritative history',()=>{const w=workspace();w.files[1].history=w.files[1].history.slice(1);w.files[1].versions.applied=null;assert.throws(()=>agent.parseAgentWorkspaceRollbackRequest({file:'SOUL.md',expectedVersion:2,targetVersion:1},w),ZodError);});
probe('progressive path ownership',()=>{const w=workspace();w.skills[0].procedure.path='skills/cap-other/SKILL.md';assert.equal(agent.AgentWorkspaceDescriptorSchema.safeParse(w).success,false);});
probe('enabled capability admission',()=>{const w=workspace();w.registry.capabilities[0].enabled=false;assert.equal(agent.AgentWorkspaceDescriptorSchema.safeParse(w).success,false);});
probe('applied bundle helper',()=>{assert.equal(agent.appliedWorkspaceVersion(agent.AgentContextWithWorkspaceSchema.parse({...context(),configVersion:99})),null);assert.equal(agent.appliedWorkspaceVersion(agent.AgentContextWithWorkspaceSchema.parse({...context(),workspace:workspace()})),7);});
probe('context owner binding',()=>{const w=workspace();w.ownerId='another-owner';assert.equal(agent.AgentContextWithWorkspaceSchema.safeParse({...context(),workspace:w}).success,false);});
probe('canonical 1.34 policy and writer protection',()=>{const scopePolicy=agent.AgentScopePolicySchema.parse({version:11,defaultWebSearch:true,scopeLimited:false,defaults:{read:'allow',write:'ask'},rules:[]});const raw={...context(),workspace:workspace(),scopePolicy};assert.deepEqual(agent.AgentContextWithWorkspaceWriteSchema.parse(raw).scopePolicy,scopePolicy);const forbidden={...raw,credentials:{[PLATFORM_INTERNAL_CREDENTIAL_KEYS[0]]:'synthetic'}};assert.equal(agent.AgentContextWithWorkspaceWriteSchema.safeParse(forbidden).success,false);assert.equal(agent.AgentContextWithWorkspaceSchema.safeParse(forbidden).success,true);});
probe('safe procedure segment',()=>assert.throws(()=>agent.agentWorkspaceSkillPath('../USER.md'),ZodError));
probe('compiled subpath resolution',()=>assert.ok(require.resolve('@x9-forge/contracts/agent').endsWith(path.join('dist','agent','index.cjs'))));
for(const entry of probes) { try {entry.run();} catch(error) {console.error(`R7 CJS probe failed: ${entry.name}`);throw error;} }
console.log(`R7 CJS public package: ${probes.length}/${probes.length} probes passed`);
