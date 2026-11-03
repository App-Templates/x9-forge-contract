import {expect,it} from 'vitest';
import {forgeMasterModelAuthorityContract as contract} from '../../src/http/index.js';
import {AgentContextIdentitySchema} from '../../src/agent/index.js';
import {AgentModelSourceObservationSchema} from '../../src/model-router/index.js';
import {INTERNAL_TOKEN_HEADER} from '../../src/auth/index.js';
const identity={managementAgentId:'master-console',runtimeAgentId:'master-runtime',vaultAgentId:1};
const scope={agentId:identity.runtimeAgentId,ownerId:'1',tenantId:'tenant'};
const source={identity,scope,sourceVersion:'generation',observedAt:'2026-10-10T00:00:00Z',validUntil:'2026-10-10T00:01:00Z'};
it('uses the existing canonical schemas and internal authentication',()=>{
 expect(contract.method).toBe('POST');expect(contract.authType).toBe('token');expect(contract.authHeader).toBe(INTERNAL_TOKEN_HEADER);
 expect(contract.bodySchema).toBe(AgentModelSourceObservationSchema);expect(contract.responseSchema).toBe(AgentContextIdentitySchema);
 expect(contract.bodySchema.parse(source)).toEqual(source);expect(contract.responseSchema.parse({...scope,identity,role:'master'}).role).toBe('master');
});
it.each(['role','credentials','modelConfiguration'])('does not accept caller authority or private %s in the source',field=>{
 expect(contract.bodySchema.safeParse({...source,[field]:field==='role'?'master':{}}).success).toBe(false);
});
it('refuses an incomplete identity and mismatched runtime scope',()=>{
 expect(contract.bodySchema.safeParse({...source,identity:{...identity,vaultAgentId:undefined}}).success).toBe(false);
 expect(contract.bodySchema.safeParse({...source,scope:{...scope,agentId:'foreign'}}).success).toBe(false);
});
