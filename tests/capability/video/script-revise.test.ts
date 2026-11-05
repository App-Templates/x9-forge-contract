import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  VideoScriptReviseResponseSchema,
  VideoScriptReviseToolInputSchema,
} from '../../../src/capability/video/index.js';

const base = {
  projectId: 'vp_abc123',
  basedOnRevision: 1,
  scenes: [{ text: 'Prima scena corretta.', tags: ['calm'] }, { text: 'Seconda scena.' }],
};

describe('video_script_revise input', () => {
  it('accepts input with and without outro', () => {
    expect(VideoScriptReviseToolInputSchema.safeParse(base).success).toBe(true);
    const withOutro = { ...base, outro: { title: 'In pratica', line: 'La riga chiave.' } };
    expect(VideoScriptReviseToolInputSchema.safeParse(withOutro).success).toBe(true);
  });

  it.each([
    ['identity', { identity: { tenantId: 't' } }],
    ['footage', { footage: [] }],
    ['graphicHtml', { graphicHtml: '<html></html>' }],
    ['revision 0', { basedOnRevision: 0 }],
    ['13 scenes', { scenes: Array.from({ length: 13 }, () => ({ text: 'x' })) }],
    ['empty scene', { scenes: [{ text: '   ' }] }],
    ['bracketed tag', { scenes: [{ text: 'x', tags: ['[calm]'] }] }],
  ])('rejects %s', (_name, patch) => {
    expect(VideoScriptReviseToolInputSchema.safeParse({ ...base, ...patch }).success).toBe(false);
  });

  it('JSON schema requires projectId, basedOnRevision, scenes and has no identity', () => {
    const js = z.toJSONSchema(VideoScriptReviseToolInputSchema) as { required: string[]; properties: Record<string, unknown> };
    expect(js.required).toEqual(expect.arrayContaining(['projectId', 'basedOnRevision', 'scenes']));
    expect(js.properties).not.toHaveProperty('identity');
  });
});

describe('video_script_revise response', () => {
  const ok = { projectId: 'vp_abc123', state: 'awaiting_approval', step: 'story', scriptRevision: 2 };
  it('accepts a valid response and rejects a wrong state', () => {
    expect(VideoScriptReviseResponseSchema.safeParse(ok).success).toBe(true);
    expect(VideoScriptReviseResponseSchema.safeParse({ ...ok, state: 'other' }).success).toBe(false);
  });
});
