import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_ASSIGNMENT_BASES,
  PAPERCLIP_ASSIGNMENT_PERMISSION_REFUSALS,
  PAPERCLIP_RECIPIENT_PROTECTIONS,
  PaperclipAssignmentFactsSchema,
  PaperclipAssignmentOrganizationSchema,
  PaperclipAssignmentPermissionSchema,
  decideAssignmentByPermission,
  type PaperclipAssignmentFacts,
  type PaperclipAssignmentPermission,
} from '../src/capability/paperclip/assignment-permission.js';

const organization = {
  a: { reportsTo: null },
  b: { reportsTo: 'a' },
  c: { reportsTo: 'b' },
  d: { reportsTo: null },
};
const permissions: PaperclipAssignmentPermission[] = [
  { form: 'none' },
  { form: 'broad' },
  { form: 'list', agentIds: ['c'] },
  { form: 'branch', rootAgentIds: ['a'] },
  { form: 'list_and_branch', agentIds: ['c'], rootAgentIds: ['a'] },
];

function facts(overrides: Partial<PaperclipAssignmentFacts> = {}): PaperclipAssignmentFacts {
  return { permission: { form: 'none' }, assigner: 'a', recipient: 'c', organization,
    recipientProtection: 'protected', ...overrides };
}

function refused(input: unknown, refusal: string): void {
  const result = decideAssignmentByPermission(input);
  expect(result).toEqual({ ok: false, refusal });
  expect(PAPERCLIP_ASSIGNMENT_PERMISSION_REFUSALS).toContain(refusal);
}

describe('s7355 permission-based assignment', () => {
  it('(a) schemas accept exactly the five forms and bounded identifiers', () => {
    for (const permission of permissions) expect(PaperclipAssignmentPermissionSchema.safeParse(permission).success).toBe(true);
    for (const key of ['agentIds', 'rootAgentIds'] as const) {
      const form = key === 'agentIds' ? 'list' : 'branch';
      for (const ids of [[], Array.from({ length: 257 }, (_, i) => `id-${i}`), [''], ['x'.repeat(129)], [1]]) {
        expect(PaperclipAssignmentPermissionSchema.safeParse({ form, [key]: ids }).success).toBe(false);
      }
      expect(PaperclipAssignmentPermissionSchema.safeParse({ form, [key]: ['x'.repeat(128)] }).success).toBe(true);
      expect(PaperclipAssignmentPermissionSchema.safeParse({ form, [key]: Array.from({ length: 256 }, (_, i) => `id-${i}`) }).success).toBe(true);
    }
    for (const permission of permissions) {
      expect(PaperclipAssignmentPermissionSchema.safeParse({ ...permission, projectId: 'p' }).success).toBe(false);
      refused({ ...facts(), permission: { ...permission, projectId: 'p' } }, 'permission_malformed');
    }
    expect(PaperclipAssignmentPermissionSchema.safeParse({ form: 'other' }).success).toBe(false);
    expect(PaperclipAssignmentPermissionSchema.safeParse({ form: 'list_and_branch', agentIds: ['c'] }).success).toBe(false);
    expect(PaperclipAssignmentPermissionSchema.safeParse({ form: 'list_and_branch', agentIds: [], rootAgentIds: ['a'] }).success).toBe(false);
    expect(PaperclipAssignmentOrganizationSchema.safeParse(organization).success).toBe(true);
    expect(PaperclipAssignmentFactsSchema.safeParse(facts()).success).toBe(true);
    expect(PAPERCLIP_RECIPIENT_PROTECTIONS).toEqual(['open', 'protected', 'blocked']);
    expect(PAPERCLIP_ASSIGNMENT_BASES).toEqual(['recipient_open', 'broad_permission', 'listed', 'in_branch', 'listed_and_in_branch']);
    expect(PAPERCLIP_ASSIGNMENT_PERMISSION_REFUSALS).toEqual([
      'facts_malformed', 'permission_malformed', 'organization_malformed', 'protection_malformed',
      'organization_cycle', 'unknown_agent', 'recipient_blocked', 'no_permission',
      'recipient_not_in_list', 'recipient_not_in_branch',
    ]);
  });

  it('(b) open recipients pass with every permission, including unrelated scopes', () => {
    for (const permission of [...permissions, { form: 'list_and_branch', agentIds: ['d'], rootAgentIds: ['d'] }]) {
      expect(decideAssignmentByPermission({ ...facts(), permission, recipientProtection: 'open' }))
        .toEqual({ ok: true, basis: 'recipient_open' });
    }
  });

  it('(c) protected recipients require a permission', () => {
    refused(facts(), 'no_permission');
    expect(decideAssignmentByPermission(facts({ permission: { form: 'broad' } })))
      .toEqual({ ok: true, basis: 'broad_permission' });
  });

  it('(d) blocked recipients refuse every permission including broad', () => {
    for (const permission of permissions) refused(facts({ permission, recipientProtection: 'blocked' }), 'recipient_blocked');
  });

  it('(e) lists admit only named recipients', () => {
    expect(decideAssignmentByPermission(facts({ permission: { form: 'list', agentIds: ['c'] } })))
      .toEqual({ ok: true, basis: 'listed' });
    refused(facts({ permission: { form: 'list', agentIds: ['b'] } }), 'recipient_not_in_list');
  });

  it('(f) branches include roots, descendants and any matching root, without a self exception', () => {
    for (const recipient of ['a', 'b', 'c']) {
      expect(decideAssignmentByPermission(facts({ recipient, permission: { form: 'branch', rootAgentIds: ['a'] } })))
        .toEqual({ ok: true, basis: 'in_branch' });
    }
    expect(decideAssignmentByPermission(facts({ permission: { form: 'branch', rootAgentIds: ['missing', 'd', 'b'] } })))
      .toEqual({ ok: true, basis: 'in_branch' });
    for (const rootAgentIds of [['d'], ['missing']]) {
      refused(facts({ permission: { form: 'branch', rootAgentIds } }), 'recipient_not_in_branch');
    }
    expect(decideAssignmentByPermission(facts({ assigner: 'b', recipient: 'b', permission: { form: 'branch', rootAgentIds: ['b'] } })))
      .toEqual({ ok: true, basis: 'in_branch' });
    refused(facts({ assigner: 'b', recipient: 'b', permission: { form: 'branch', rootAgentIds: ['c'] } }), 'recipient_not_in_branch');
  });

  it('(f) branches allow exactly 50 parent edges', () => {
    const chain: PaperclipAssignmentFacts['organization'] = { n0: { reportsTo: null } };
    for (let i = 1; i <= 51; i++) chain[`n${i}`] = { reportsTo: `n${i - 1}` };
    const input = facts({ organization: chain, assigner: 'n0', permission: { form: 'branch', rootAgentIds: ['n0'] } });
    expect(decideAssignmentByPermission({ ...input, recipient: 'n50' })).toEqual({ ok: true, basis: 'in_branch' });
    refused({ ...input, recipient: 'n51' }, 'recipient_not_in_branch');
  });

  it('(g) combined scopes require the list and then the branch', () => {
    for (const listed of [false, true]) for (const inBranch of [false, true]) {
      const input = facts({ permission: { form: 'list_and_branch', agentIds: [listed ? 'c' : 'd'], rootAgentIds: [inBranch ? 'a' : 'd'] } });
      if (listed && inBranch) expect(decideAssignmentByPermission(input)).toEqual({ ok: true, basis: 'listed_and_in_branch' });
      else refused(input, listed ? 'recipient_not_in_branch' : 'recipient_not_in_list');
    }
  });

  it('(h) cycles anywhere precede protection and permission decisions', () => {
    const cycles = [
      { ...organization, a: { reportsTo: 'b' } },
      { ...organization, c: { reportsTo: 'c' } },
      { ...organization, x: { reportsTo: 'y' }, y: { reportsTo: 'x' } },
    ];
    for (const org of cycles) for (const recipientProtection of PAPERCLIP_RECIPIENT_PROTECTIONS) {
      refused(facts({ organization: org, permission: { form: 'broad' }, recipientProtection }), 'organization_cycle');
    }
  });

  it('(h) unknown agents and missing ancestors precede protection', () => {
    for (const recipientProtection of PAPERCLIP_RECIPIENT_PROTECTIONS) {
      refused(facts({ assigner: 'missing', recipientProtection }), 'unknown_agent');
      refused(facts({ recipient: 'missing', recipientProtection }), 'unknown_agent');
      refused(facts({ organization: { ...organization, a: { reportsTo: 'missing' } }, recipientProtection }), 'unknown_agent');
    }
    refused(facts({ assigner: 'toString' }), 'unknown_agent');
    refused(facts({ recipient: 'constructor' }), 'unknown_agent');
    for (const org of [null, [], { a: {} }, { a: { reportsTo: 1 } }, { a: { reportsTo: null, extra: true } }, { '': { reportsTo: null } }]) {
      refused({ ...facts(), organization: org }, 'organization_malformed');
    }
    expect(decideAssignmentByPermission(facts({ recipientProtection: 'open', organization: { ...organization, x: { reportsTo: 'missing' } } })))
      .toEqual({ ok: true, basis: 'recipient_open' });
  });

  it('(i) source and input contain no assignment rules by role', () => {
    const source = readFileSync(new URL('../src/capability/paperclip/assignment-permission.ts', import.meta.url), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    expect(source).not.toMatch(/\b(director|capo|lab|ricerca|role)\b/i);
    expect(source).not.toContain('agent-role');
    refused({ ...facts(), role: 'director' }, 'facts_malformed');
  });

  it('(j) arbitrary identifiers follow native open and protected semantics', () => {
    const input = facts({ assigner: 'opaque-17', recipient: 'opaque-92', organization: {
      'opaque-17': { reportsTo: null }, 'opaque-92': { reportsTo: null },
    } });
    expect(decideAssignmentByPermission({ ...input, permission: { form: 'broad' } })).toEqual({ ok: true, basis: 'broad_permission' });
    refused(input, 'no_permission');
    expect(decideAssignmentByPermission({ ...input, recipientProtection: 'open' })).toEqual({ ok: true, basis: 'recipient_open' });
  });

  it('(k) malformed inputs never throw and return the closed refusal for their field', () => {
    for (const input of [undefined, null, 'text', [], { ...facts(), assigner: 1 }, { ...facts(), recipient: '' }]) {
      refused(input, 'facts_malformed');
    }
    for (const permission of [undefined, null, 'broad', { form: 'other' }, { form: 'broad', projectId: 'p' }]) {
      refused({ ...facts(), permission }, 'permission_malformed');
    }
    refused({ ...facts(), recipientProtection: 'private' }, 'protection_malformed');
    refused({ ...facts(), recipientProtection: undefined }, 'protection_malformed');
    const { permission, ...missingPermission } = facts();
    expect(permission).toEqual({ form: 'none' });
    refused(missingPermission, 'permission_malformed');
  });

  it('(l) frozen inputs remain unchanged and decisions are deterministic', () => {
    const input = Object.freeze({ ...facts(), permission: Object.freeze({ form: 'branch', rootAgentIds: Object.freeze(['a']) }),
      organization: Object.freeze(Object.fromEntries(Object.entries(organization).map(([id, entry]) => [id, Object.freeze({ ...entry })]))),
    });
    const before = JSON.stringify(input);
    for (let i = 0; i < 3; i++) expect(decideAssignmentByPermission(input)).toEqual({ ok: true, basis: 'in_branch' });
    expect(JSON.stringify(input)).toBe(before);
  });

  it('(m) the built package exports the narrow ESM subpath in Node', () => {
    const output = execFileSync(process.execPath, ['--input-type=module', '-e', `
      const m = await import('@x9-forge/contracts/capability/paperclip/assignment-permission');
      process.stdout.write(JSON.stringify([
        typeof m.decideAssignmentByPermission,
        m.PaperclipAssignmentPermissionSchema.safeParse({ form: 'broad' }).success,
        m.decideAssignmentByPermission(${JSON.stringify(facts({ permission: { form: 'broad' } }))})
      ]));
    `], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8' });
    expect(JSON.parse(output)).toEqual(['function', true, { ok: true, basis: 'broad_permission' }]);
  });
});
