import { expect, it } from 'vitest';
import { ListAgentsAgentSchema as Row, ListAgentsResponseSchema as Response,getListAgentsAuthority } from '../../src/http/index.js';
const identity = { managementAgentId: 'synthetic-management', runtimeAgentId: 'synthetic-runtime', vaultAgentId: 101 };
const authority = { agentId: identity.runtimeAgentId, ownerId: 'synthetic-owner', tenantId: 'synthetic-tenant', role: 'master', identity };
const row = { agentId: identity.runtimeAgentId, ownerId: authority.ownerId, displayName: 'Synthetic', identity, authority };
it('preserves full declared authority as optional metadata without inventing legacy roles', () => {
 expect(Row.parse(row)).toEqual(row);
 expect(Row.safeParse({ agentId: row.agentId, ownerId: row.ownerId, displayName: row.displayName }).success).toBe(true);
 expect(Row.parse({ ...row, authority: null }).authority).toBeNull();
 const legacy = Row.parse({ ...row, authority: undefined }); expect(legacy.authority).toBeUndefined();
});
it('rejects mismatched public owner/runtime/triplet and collisions before selecting any authority', () => {
 for (const foreign of [{ ...authority, ownerId: 'foreign' }, { ...authority, identity: { ...identity, vaultAgentId: 102 } },
  { ...authority, identity: { ...identity, managementAgentId: 'foreign' } }]) expect(Row.safeParse({ ...row, authority: foreign }).success).toBe(false);
 expect(Row.safeParse({ ...row, identity: undefined }).success).toBe(false);
 expect(Response.safeParse({ agents: [row, row] }).success).toBe(false);
});

it('requires fresh available evidence and never invents legacy authority',()=>{
 const now=new Date('2026-10-10T01:00:00Z');
 const source={authority:'x9',availability:'available',completeness:'complete',observedAt:now.toISOString()};
 const payload={agents:[row],source};
 expect(getListAgentsAuthority(payload,identity.managementAgentId,now)).toEqual(authority);
 expect(getListAgentsAuthority(payload,identity.runtimeAgentId,now)).toEqual(authority);
 expect(getListAgentsAuthority(payload,'foreign',now)).toBeNull();
 expect(getListAgentsAuthority({...payload,agents:[{...row,authority:undefined}]},row.agentId,now)).toBeNull();
 expect(getListAgentsAuthority({...payload,agents:[{...row,authority:null}]},row.agentId,now)).toBeNull();
 expect(getListAgentsAuthority({...payload,source:undefined},row.agentId,now)).toBeNull();
 for(const instant of ['2026-10-10T00:58:59Z','2026-10-10T01:00:01Z'])
 expect(getListAgentsAuthority({...payload,source:{...source,observedAt:instant}},row.agentId,now)).toBeNull();
 for(const limit of [0,61,NaN,Infinity])expect(getListAgentsAuthority(payload,row.agentId,now,limit)).toBeNull();
 expect(getListAgentsAuthority(payload,row.agentId,new Date(NaN))).toBeNull();
 expect(getListAgentsAuthority({...payload,agents:[row,row]},row.agentId,now)).toBeNull();
 expect(getListAgentsAuthority({...payload,source:{...source,availability:'unavailable',completeness:'unknown',observedAt:null}},row.agentId,now)).toBeNull();
 expect(getListAgentsAuthority({...payload,source:{...source,availability:'unavailable',completeness:'partial'}},row.agentId,now)).toBeNull();
});
