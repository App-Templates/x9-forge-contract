import { describe, it, expect } from 'vitest';
import {
  GROUP_TYPES, GroupTypeSchema, PROJECT_GROUP_TYPE,
  ListProjectGroupsResponseSchema, ProjectGroupDetailResponseSchema, ProjectGroupParamsSchema,
  projectGroupPath, listProjectGroupsContract, getProjectGroupContract,
} from '../../src/http/endpoints/forge-project-groups.js';

describe('B8 — Forge «Progetto» groups, read-only', () => {
  it('group types match Forge (one level, five types) and Progetto is one of them', () => {
    expect([...GROUP_TYPES]).toEqual(['Azienda', 'BU', 'Progetto', 'Cliente', 'Altro']);
    expect(GroupTypeSchema.parse(PROJECT_GROUP_TYPE)).toBe('Progetto');
    expect(() => GroupTypeSchema.parse('progetto')).toThrow();
  });

  it('list: summaries with non-negative counts, strict (no extra fields can leak)', () => {
    const ok = { groups: [{ id: 1, name: 'Food', objective: 'Ricette', agentCount: 2 }] };
    expect(ListProjectGroupsResponseSchema.parse(ok)).toEqual(ok);
    expect(() => ListProjectGroupsResponseSchema.parse({ groups: [{ ...ok.groups[0], agentCount: -1 }] })).toThrow();
    expect(() => ListProjectGroupsResponseSchema.parse({ groups: [{ ...ok.groups[0], ownerEmail: 'x@y' }] })).toThrow();
  });

  it('detail: agents carry only id, name and enabled capability names — never keys or parameters', () => {
    const ok = { group: { id: 1, name: 'Food', objective: null }, agents: [{ agentId: 'samira', displayName: 'Samira', capabilities: ['cap-ricerca', 'cap-lab'] }] };
    expect(ProjectGroupDetailResponseSchema.parse(ok)).toEqual(ok);
    expect(() => ProjectGroupDetailResponseSchema.parse({ ...ok, agents: [{ ...ok.agents[0], credentials: { K: 'v' } }] })).toThrow();
    expect(() => ProjectGroupDetailResponseSchema.parse({ ...ok, agents: [{ ...ok.agents[0], telegramBotToken: 't' }] })).toThrow();
  });

  it('params and path: positive integer ids only', () => {
    expect(ProjectGroupParamsSchema.parse({ groupId: '7' })).toEqual({ groupId: 7 });
    expect(() => ProjectGroupParamsSchema.parse({ groupId: '0' })).toThrow();
    expect(() => ProjectGroupParamsSchema.parse({ groupId: '../1' })).toThrow();
    expect(projectGroupPath(7)).toBe('/api/internal/project-groups/7');
    expect(() => projectGroupPath(-1)).toThrow();
  });

  it('contracts are GET-only with token auth (no write route in B8)', () => {
    for (const c of [listProjectGroupsContract, getProjectGroupContract]) {
      expect(c.method).toBe('GET');
      expect(c.authType).toBe('token');
      expect(c.path.startsWith('/api/internal/project-groups')).toBe(true);
    }
  });
});
