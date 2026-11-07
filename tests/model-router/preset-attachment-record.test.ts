import { describe, expect, it } from 'vitest';
import {
  AgentPresetAttachmentRecordSchema,
  presetAttachmentAuthorityOf,
  presetAttachmentRecordFromBirth,
  type AgentPresetAttachment,
} from '../../src/model-router/index.js';

const identity = { managementAgentId: 'bu-7', runtimeAgentId: 'bu-7', vaultAgentId: 7 };
const scope = { agentId: 'bu-7', ownerId: '1', tenantId: '1' };
const agent = { id: 7, slug: 'bu-7', ownerId: 1 };

function record(): Record<string, unknown> {
  return { schemaVersion: 1, identity: { ...identity }, scope: { ...scope }, source: 'nascita' };
}

function birth(): AgentPresetAttachment {
  return {
    identity: { ...identity }, tenantId: '1',
    preset: { presetId: 1, kind: 'platform', tenantId: '1', companyId: null },
    resolvedBy: 'platform-fallback', note: 'nessun preset aziendale',
  };
}

describe('presetAttachmentAuthorityOf', () => {
  it('returns identity and scope of a valid record', () => {
    expect(presetAttachmentAuthorityOf(record(), agent)).toEqual({ identity, scope });
  });

  const bad: Array<[string, unknown, typeof agent]> = [
    ['different vault id', record(), { ...agent, id: 8 }],
    ['different slug', record(), { ...agent, slug: 'bu-8' }],
    ['different owner', record(), { ...agent, ownerId: 2 }],
    ['null owner', record(), { ...agent, ownerId: null }],
    ['scope agent differs from runtime', { ...record(), scope: { ...scope, agentId: 'bu-8' } }, agent],
    ['blank tenant', { ...record(), scope: { ...scope, tenantId: ' ' } }, agent],
    ['unknown source', { ...record(), source: 'altro' }, agent],
    ['extra key', { ...record(), extra: true }, agent],
    ['null record', null, agent],
    ['empty object', {}, agent],
    ['string record', 'bu-7', agent],
  ];
  it.each(bad)('returns null for %s without throwing', (_name, input, who) => {
    expect(presetAttachmentAuthorityOf(input, who)).toBeNull();
  });

  it('does not match approximately', () => {
    expect(presetAttachmentAuthorityOf(record(), { ...agent, slug: 'BU-7' })).toBeNull();
    expect(presetAttachmentAuthorityOf(record(), { ...agent, slug: 'bu-7 ' })).toBeNull();
  });
});

describe('presetAttachmentRecordFromBirth', () => {
  it('builds a birth record that the authority rule accepts', () => {
    const built = presetAttachmentRecordFromBirth(birth(), '1');
    expect(built).toEqual(record());
    expect(AgentPresetAttachmentRecordSchema.parse(built)).toEqual(built);
    expect(presetAttachmentAuthorityOf(built, agent)).toEqual({ identity, scope });
  });

  it('throws when the preset belongs to another tenant', () => {
    const input = birth();
    input.preset = { ...input.preset, tenantId: '2' };
    expect(() => presetAttachmentRecordFromBirth(input, '1')).toThrow();
  });

  it('throws on a blank owner', () => {
    expect(() => presetAttachmentRecordFromBirth(birth(), ' ')).toThrow();
  });
});
