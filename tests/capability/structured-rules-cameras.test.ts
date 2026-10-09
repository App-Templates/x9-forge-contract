import { describe, expect, it } from 'vitest';
import { ConditionSchema } from '../../src/capability/configuration/conditions.js';
import { BriefingActionSchema, NewsRulesSchema, NetatmoRulesSchema, SecurityRulesSchema, parseCapabilityRulesWrite, detectSecurityRuleConflicts } from '../../src/capability/configuration/rules.js';
import { CameraPoliciesSchema, parseCameraPoliciesWrite } from '../../src/capability/configuration/camera-policy.js';

const rule = { id: '00000000-0000-4000-8000-000000000001', skill: 'news', condition: { type: 'always' },
  action: { type: 'set_hours_back', hours: 24 }, priority: 1, created_by: 'user',
  created_at: '2026-10-09T00:00:00Z', description: 'Read recent news' };
const camera = { uid: 'camera-1', name: 'Entrance', role: 'primary', enabled: true,
  ptz_presets: { left: 1, center: 2, right: 3 }, siren: false, battery: true };
const authority = { current: [rule], authorizedResourceIds: new Set<string>() };
const cameraAuthority = { current: [camera], authorizedResourceIds: new Set(['camera-1']),
  editableFieldsByUid: new Map([['camera-1', new Set(['role', 'enabled', 'ptz_presets'] as const)]]) };

describe('typed rules and camera policies from existing consumers', () => {
  it('accepts recursive conditions and rejects unknown actions/fields', () => {
    const condition = { type: 'and', conditions: [{ type: 'always' }, { type: 'not', condition: { type: 'is_dark', value: true } }] };
    expect(ConditionSchema.parse(condition)).toEqual(condition);
    expect(ConditionSchema.safeParse({ type: 'always', code: 'arbitrary' }).success).toBe(false);
    expect(NewsRulesSchema.parse([rule])).toEqual([rule]);
    expect(NewsRulesSchema.safeParse([{ ...rule, action: { type: 'set_ir', mode: 'on' } }]).success).toBe(false);
    expect(NewsRulesSchema.safeParse([{ ...rule, skill: 'security' }]).success).toBe(false);
    expect(BriefingActionSchema.safeParse({ type: 'add_section', section: 'weather', config: { arbitrary: true } }).success).toBe(false);
    expect(BriefingActionSchema.parse({ type: 'add_section', section: 'weather' })).toEqual({ type: 'add_section', section: 'weather' });
  });
  it('applies ordinary rule changes against authoritative current records', () => {
    const changed = { ...rule, action: { type: 'set_hours_back', hours: 12 } };
    expect(parseCapabilityRulesWrite('news', [changed], authority)).toEqual([changed]);
    for (const changed of [{ ...rule, created_by: 'operator' }, { ...rule, locked: true }, { ...rule, priority: 100 }]) {
      expect(() => parseCapabilityRulesWrite('news', [changed], authority)).toThrow();
    }
    expect(() => parseCapabilityRulesWrite('news', [rule], { ...authority, current: [] })).toThrow();
    expect(() => parseCapabilityRulesWrite('news', [], { ...authority, current: [{ ...rule, locked: true }] })).toThrow();
    expect(() => parseCapabilityRulesWrite('news', [{ ...rule, action: { type: 'set_hours_back', hours: 12 } }],
      { ...authority, current: [{ ...rule, created_by: 'operator' }] })).toThrow();
  });
  it('rejects foreign hardware resources in netatmo rules', () => {
    const hardwareRule = { ...rule, skill: 'netatmo', action: { type: 'auto_light_on', module_id: 'module-1' } };
    expect(() => parseCapabilityRulesWrite('netatmo', [hardwareRule], { current: [hardwareRule], authorizedResourceIds: new Set() })).toThrow();
    expect(parseCapabilityRulesWrite('netatmo', [hardwareRule], { current: [hardwareRule], authorizedResourceIds: new Set(['module-1']) })).toEqual([hardwareRule]);
  });
  it('keeps bounded existing settings and rejects duplicate rule records', () => {
    expect(NewsRulesSchema.safeParse([rule, rule]).success).toBe(false);
    expect(NewsRulesSchema.safeParse([{ ...rule, action: { type: 'set_hours_back', hours: 169 } }]).success).toBe(false);
    const offset = { ...rule, skill: 'netatmo', action: { type: 'set_is_dark_offset', offset_minutes: -120 } };
    expect(NetatmoRulesSchema.parse([offset])).toEqual([offset]);
    expect(NetatmoRulesSchema.safeParse([{ ...offset, action: { ...offset.action, offset_minutes: -121 } }]).success).toBe(false);
    const ir = { ...rule, skill: 'security', action: { type: 'set_ir', mode: 'auto' } };
    expect(SecurityRulesSchema.parse([ir])).toEqual([ir]);
    expect(SecurityRulesSchema.safeParse([{ ...ir, action: { type: 'arbitrary' } }]).success).toBe(false);
    expect(ConditionSchema.safeParse({ type: 'and', conditions: [] }).success).toBe(false);
    expect(ConditionSchema.safeParse({ type: 'calendar_count', operator: '>', value: -1 }).success).toBe(false);
  });
  it('preserves the existing security conflict detector behavior', () => {
    const a = { ...rule, skill: 'security', action: { type: 'set_pir', enabled: true } };
    const b = { ...a, id: '00000000-0000-4000-8000-000000000002', action: { type: 'set_pir', enabled: false } };
    expect(detectSecurityRuleConflicts(a, [b])).toEqual([b]);
  });
  it('validates all cameras before any enabled filter', () => {
    expect(CameraPoliciesSchema.parse([camera])).toEqual([camera]);
    expect(CameraPoliciesSchema.safeParse([camera, { ...camera, enabled: false }]).success).toBe(false);
    expect(CameraPoliciesSchema.safeParse([camera, { ...camera, uid: 'camera-2', enabled: false }]).success).toBe(false);
    expect(CameraPoliciesSchema.safeParse([{ ...camera, ptz_presets: { ...camera.ptz_presets, left: 33 } }]).success).toBe(false);
    expect(CameraPoliciesSchema.parse([])).toEqual([]);
  });
  it('requires owner resource and producer field authority for camera writes', () => {
    const changed = { ...camera, enabled: false };
    expect(parseCameraPoliciesWrite([changed], cameraAuthority)).toEqual([changed]);
    expect(() => parseCameraPoliciesWrite([changed], { ...cameraAuthority, authorizedResourceIds: new Set() })).toThrow();
    expect(() => parseCameraPoliciesWrite([{ ...camera, battery: false }], cameraAuthority)).toThrow();
    expect(() => parseCameraPoliciesWrite([{ ...camera, name: 'Forged' }], cameraAuthority)).toThrow();
    expect(() => parseCameraPoliciesWrite([{ ...camera, uid: 'camera-2' }], cameraAuthority)).toThrow();
    expect(() => parseCameraPoliciesWrite([], cameraAuthority)).toThrow();
    expect(() => parseCameraPoliciesWrite([changed], { ...cameraAuthority, editableFieldsByUid: new Map() })).toThrow();
  });
});
