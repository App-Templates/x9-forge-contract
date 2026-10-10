import { expect, it } from 'vitest';
import { ElevenLabsNativeToolsSchema as Tools, ElevenLabsNativeToolSchema as Tool, ElevenLabsNativeInputSchemaSchema as Input } from '../../src/capability/index.js';
import { nativeTools } from './native-fixtures.js';
it('preserves all nine custom native descriptors and two separate builtins field-for-field', () => {
  expect(Tools.parse(nativeTools)).toEqual(nativeTools);
  expect(nativeTools.filter(t => t.type === 'client')).toHaveLength(4); expect(nativeTools.filter(t => t.type === 'webhook')).toHaveLength(5); expect(nativeTools.filter(t => t.type === 'system')).toHaveLength(2);
  for (const tool of nativeTools) {
    expect(Tool.parse(tool)).toEqual(tool);
    if (tool.type === 'client') {
      expect(Tool.safeParse({ ...tool, expects_response: undefined }).success).toBe(false);
      expect(Tool.safeParse({ ...tool, response_timeout_secs: 0 }).success).toBe(false);
    }
    if (tool.type === 'webhook') {
      expect(Tool.safeParse({ ...tool, expects_response: false }).success).toBe(false);
      expect(Tool.safeParse({ ...tool, api_schema: { ...tool.api_schema, request_headers: [{ name: 'X-Internal-Secret', value: 'not-a-locator' }] } }).success).toBe(false);
    }
    if (tool.type === 'system') expect(Tool.safeParse({ ...tool, type: 'webhook' }).success).toBe(false);
  }
  expect(Tools.safeParse([...nativeTools, nativeTools[0]]).success).toBe(false);
});
it('retains real required/enum/minimum and bounded JSON schema without admitting arbitrary settings', () => {
  const empty = { type: 'object', properties: {}, required: [] };
  expect(Input.safeParse(empty).success).toBe(true);
  for (const schema of [{ ...empty, required: ['missing'] }, { ...empty, required: ['x', 'x'], properties: { x: { type: 'boolean' } } },
    { ...empty, properties: { x: { type: 'number', minimum: 2, maximum: 1 } } }, { ...empty, arbitrary: true }]) expect(Input.safeParse(schema).success).toBe(false);
  const cycle = { ...empty } as Record<string, unknown>; cycle.properties = { x: cycle }; expect(Input.safeParse(cycle).success).toBe(false);
  const silence = nativeTools.find(t => t.name === 'silenzio'); expect(silence?.expects_response).toBe(false); expect(silence?.parameters?.properties.secondi.minimum).toBe(1);
});
