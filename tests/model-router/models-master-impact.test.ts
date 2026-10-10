import {describe, expect, it} from 'vitest';
import {AgentModelsMasterImpactSchema, AgentModelsBatchPreviewSchema, isAgentModelsMasterImpactCurrent} from '../../src/model-router/index.js';

const master = {managementAgentId:'master', runtimeAgentId:'runtime-master', vaultAgentId:1};
const recipient = () => ({identity:{managementAgentId:'child',runtimeAgentId:'runtime-child',vaultAgentId:2},ownerId:'owner',tenantId:'tenant',displayName:'Meditation',slots:[{slotId:'agent_chat',binding:'master',effect:'changes',currentVersion:3,nextVersion:4},{slotId:'agent_classifier',binding:'custom',effect:'preserved',currentVersion:3,nextVersion:3}]});
const impact = () => ({token:{version:'preview-1',sourceVersion:'source-1',relationVersion:'relations-1'},masterIdentity:{...master},ownerId:'owner',tenantId:'tenant',recipients:[recipient()]});
const descriptor = {provider:'openai',modelId:'synthetic',protocol:'responses',adapterId:'synthetic'};
const settings = {capability:'agent-core',function:'reasoning',catalogVersion:'catalog-1',requirements:{tools:true,stream:true,structuredOutput:false},mode:'pin',pin:descriptor,tiers:{standard:descriptor,advanced:descriptor,reasoning:descriptor},fallback:descriptor};
const preview = () => ({previewId:'preview-1',request:{requestId:'request-1',overviewVersion:'overview-1',agents:[{identity:master,expectedVersion:3,changes:[{action:'set',slotId:'agent_chat',settings}]}]},expiresAt:'2026-10-10T00:00:00Z',agents:[{identity:master,expectedVersion:3,next:{schemaVersion:1,identity:master,configVersion:4,selections:[{slotId:'agent_chat',settings}]},impact:[]}]});

describe('complete server-produced Master impact', () => {
  it('accepts a complete snapshot and preserves custom slots', () => {
    expect(AgentModelsMasterImpactSchema.parse(impact())).toEqual(impact());
    expect(isAgentModelsMasterImpactCurrent(impact(),impact())).toBe(true);
  });
  it('keeps legacy previews compatible and exposes the additive structured snapshot', () => {
    expect(AgentModelsBatchPreviewSchema.safeParse(preview()).success).toBe(true);
    expect(AgentModelsBatchPreviewSchema.parse({...preview(),fanoutImpact:impact()}).fanoutImpact).toEqual(impact());
  });
  it('accepts an explicitly complete empty recipient set without inventing a count', () => {
    expect(AgentModelsMasterImpactSchema.safeParse({...impact(),recipients:[]}).success).toBe(true);
  });
  it('requires the impact Master to be a requested preview agent', () => {
    const value=impact();value.masterIdentity={managementAgentId:'other',runtimeAgentId:'runtime-other',vaultAgentId:3};
    expect(AgentModelsBatchPreviewSchema.safeParse({...preview(),fanoutImpact:value}).success).toBe(false);
  });
  it.each(['ownerId','tenantId'] as const)('rejects recipient %s outside the declared scope', field => {
    const value=impact();value.recipients[0]![field]='foreign';
    expect(AgentModelsMasterImpactSchema.safeParse(value).success).toBe(false);
  });
  it.each(['managementAgentId','runtimeAgentId','vaultAgentId'] as const)('rejects duplicate recipient %s', field => {
    const value=impact(),other=recipient();other.identity={managementAgentId:'other',runtimeAgentId:'runtime-other',vaultAgentId:3};
    Object.assign(other.identity,{[field]:value.recipients[0]!.identity[field]});value.recipients.push(other);
    expect(AgentModelsMasterImpactSchema.safeParse(value).success).toBe(false);
  });
  it('rejects a recipient alias that collides with the Master', () => {
    const value=impact();value.recipients[0]!.identity.runtimeAgentId=master.managementAgentId;
    expect(AgentModelsMasterImpactSchema.safeParse(value).success).toBe(false);
  });
  it('requires all three identity components for every recipient', () => {
    const value=impact();Reflect.deleteProperty(value.recipients[0]!.identity,'vaultAgentId');
    expect(AgentModelsMasterImpactSchema.safeParse(value).success).toBe(false);
  });
  it('rejects duplicate slots and custom selections declared changed', () => {
    const value=impact();value.recipients[0]!.slots.push({...value.recipients[0]!.slots[0]!});
    expect(AgentModelsMasterImpactSchema.safeParse(value).success).toBe(false);
    const custom=impact();Object.assign(custom.recipients[0]!.slots[1]!,{effect:'changes',nextVersion:4});
    expect(AgentModelsMasterImpactSchema.safeParse(custom).success).toBe(false);
  });
  it.each([0,3,2])('rejects changed next version %s without a forward advance', nextVersion => {
    const value=impact();value.recipients[0]!.slots[0]!.nextVersion=nextVersion;
    expect(AgentModelsMasterImpactSchema.safeParse(value).success).toBe(false);
  });
  it('rejects advancing a preserved selection', () => {
    const value=impact();value.recipients[0]!.slots[1]!.nextVersion=4;
    expect(AgentModelsMasterImpactSchema.safeParse(value).success).toBe(false);
  });
  it.each(['version','sourceVersion','relationVersion'] as const)('invalidates a changed %s token', field => {
    const value=impact();value.token[field]='new-generation';
    expect(isAgentModelsMasterImpactCurrent(value,impact())).toBe(false);
  });
  it('invalidates an omitted recipient, omitted slot or changed displayed name', () => {
    const value=impact();value.recipients=[];expect(isAgentModelsMasterImpactCurrent(value,impact())).toBe(false);
    const slot=impact();slot.recipients[0]!.slots.pop();expect(isAgentModelsMasterImpactCurrent(slot,impact())).toBe(false);
    const name=impact();name.recipients[0]!.displayName='Changed';expect(isAgentModelsMasterImpactCurrent(name,impact())).toBe(false);
  });
  it('rejects control characters, markup and undeclared private fields', () => {
    for(const displayName of ['bad\nname','<b>name</b>','   ']){const value=impact();value.recipients[0]!.displayName=displayName;expect(AgentModelsMasterImpactSchema.safeParse(value).success).toBe(false);}
    expect(AgentModelsMasterImpactSchema.safeParse({...impact(),credentials:{secret:'synthetic'}}).success).toBe(false);
    const value=impact();Object.assign(value.recipients[0]!,{endpoint:'synthetic'});expect(AgentModelsMasterImpactSchema.safeParse(value).success).toBe(false);
    expect(isAgentModelsMasterImpactCurrent({},impact())).toBe(false);
    expect(isAgentModelsMasterImpactCurrent(impact(),{})).toBe(false);
  });
});
