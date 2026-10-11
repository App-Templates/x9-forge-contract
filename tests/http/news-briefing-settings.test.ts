import { describe, expect, it } from 'vitest';
import { capNewsBriefingSettingsPath, NewsBriefingQuerySchema, parseNewsBriefingCommand, newsBriefingSettingsGetContract, newsBriefingSettingsPostContract, newsBriefingPropagationContract } from '../../src/http/endpoints/internal-capability-news-briefing.js';

const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'runtime-a' };
const authority = { scope, family: 'news' as const, currentVersion: 1 };
const input = { scope, family: 'news', requestId: 'request-1', expectedVersion: 1, changes: [{ type: 'settings.patch', settings: { hoursBack: 12 } }] };
describe('Scoped News/Briefing settings boundary', () => {
  it('builds the producer route using its canonical agent identifier', () => {
    expect(capNewsBriefingSettingsPath(scope.agentId)).toBe('/internal/capability/agents/runtime-a/settings');
    expect(newsBriefingSettingsGetContract.authType).toBe('secret');
    expect(newsBriefingSettingsPostContract.authType).toBe('secret');
  });
  it('accepts the exact trusted target and revision', () => {
    expect(parseNewsBriefingCommand(input, authority)).toEqual(input);
  });
  it.each(['tenantId', 'ownerId', 'agentId'] as const)('rejects another %s before a producer write', key => {
    expect(() => parseNewsBriefingCommand({ ...input, scope: { ...scope, [key]: 'foreign' } }, authority)).toThrow('target mismatch');
  });
  it('rejects another family', () => {
    expect(() => parseNewsBriefingCommand(input, { ...authority, family: 'briefing' })).toThrow('target mismatch');
  });
  it('rejects stale revisions', () => {
    expect(() => parseNewsBriefingCommand(input, { ...authority, currentVersion: 2 })).toThrow('CAS conflict');
  });
  it('allows only explicit first adoption with no current revision', () => {
    expect(() => parseNewsBriefingCommand(input, { ...authority, currentVersion: null })).toThrow('CAS conflict');
    expect(parseNewsBriefingCommand({ ...input, expectedVersion: null }, { ...authority, currentVersion: null }).expectedVersion).toBeNull();
  });
  it.each(['../other', 'a/b', 'a?ownerId=foreign', 'a#fragment'])('rejects unsafe path %s', agentId => {
    expect(() => capNewsBriefingSettingsPath(agentId)).toThrow();
  });
  it('requires owner and tenant on a read and rejects unsupported families', () => {
    expect(NewsBriefingQuerySchema.safeParse({ tenantId: scope.tenantId, family: 'news' }).success).toBe(false);
    expect(NewsBriefingQuerySchema.safeParse({ ...scope, family: 'security' }).success).toBe(false);
    expect(NewsBriefingQuerySchema.parse({ tenantId: scope.tenantId, ownerId: scope.ownerId, family: 'briefing' })).toEqual({ tenantId: scope.tenantId, ownerId: scope.ownerId, family: 'briefing' });
  });
});

it('reports partial Master propagation in the same Save receipt',()=>{
 const settings={feeds:[],hoursBack:12,cronSchedule:'0 6 * * *',rules:[]};
 const propagation={sourceVersion:2,status:'pending',targets:[{scope:{...scope,agentId:'follower'},identity:{managementAgentId:'follower-ui',runtimeAgentId:'follower'},outcome:'failed'}]};
 const receipt={requestId:'request-1',replayed:false,state:{family:'news',scope,version:2,settings,effective:null,execution:'running'},propagation};
 expect(newsBriefingSettingsPostContract.responseSchema.parse(receipt)).toEqual(receipt);
 expect(newsBriefingSettingsPostContract.responseSchema.safeParse({...receipt,propagation:{...propagation,status:'complete'}}).success).toBe(false);
 expect(newsBriefingSettingsPostContract.responseSchema.safeParse({...receipt,propagation:{...propagation,sourceVersion:3}}).success).toBe(false);
});
it('defines an authenticated producer-to-Core propagation boundary with server-resolved identity',()=>{
 expect(newsBriefingPropagationContract.authType).toBe('secret');
 const command={scope,family:'news',requestId:'request-1',version:2};
 expect(newsBriefingPropagationContract.bodySchema.parse(command)).toEqual(command);
 expect(newsBriefingPropagationContract.bodySchema.safeParse({...command,endpoint:'http://forged'}).success).toBe(false);
});
