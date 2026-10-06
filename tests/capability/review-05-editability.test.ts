import { describe, expect, it } from 'vitest';
import { parameter, schema } from './review-fixtures.js';

const definition = { ...parameter, editableBy: ['superadmin'] };
describe('R5 explicit parameter editors', () => {
  it.each(['superadmin', 'owner'])('exports the %s editor role', role => {
    expect(schema('CapabilityParameterEditorRoleSchema').safeParse(role)).toMatchObject({ success: true, data: role });
  });
  it.each(['admin', '', 'user', null])('rejects unknown editor role %#', role => {
    expect(schema('CapabilityParameterEditorRoleSchema').safeParse(role).success).toBe(false);
  });
  it.each([
    ['superadmin'], ['owner'], ['superadmin', 'owner'],
  ].map(roles => [roles]))('retains declared editors %#', editableBy => {
    const value = { ...definition, editableBy };
    expect(schema('CapabilityParameterSchema').safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it.each([
    ['missing', undefined], ['empty', []], ['unknown', ['admin']],
    ['duplicate', ['owner', 'owner']], ['too many', ['owner', 'superadmin', 'owner']],
    ['scalar', 'superadmin'], ['null', null],
  ])('rejects %s editors', (_name, editableBy) => {
    expect(schema('CapabilityParameterSchema').safeParse({ ...definition, editableBy }).success).toBe(false);
  });
  it.each(['number', 'integer', 'string', 'boolean', 'enum', 'string_list'])('requires editors for %s', type => {
    const { editableBy: _editors, ...withoutEditors } = parameter;
    const value = { ...withoutEditors, type, ...(type === 'enum' ? { options: [{ value: 'a', label: 'A' }] } : {}) };
    expect(schema('CapabilityParameterSchema').safeParse(value).success).toBe(false);
  });
  it('carries editors in resolved agent configuration', () => {
    const value = { parameter: definition, origin: 'agent_override', value: 3 };
    expect(schema('CapabilityAgentParameterSchema').safeParse(value)).toMatchObject({ success: true, data: value });
  });
});
