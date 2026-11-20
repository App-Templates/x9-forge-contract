import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { AGENT_ROLES, type AgentRole } from '../src/organization/agent-role.js';
import { RICERCA_TOOLS } from '../src/capability/ricerca/tools.js';
import {
  PAPERCLIP_ASSIGNMENT_MATRIX,
  PAPERCLIP_ASSIGNMENT_REFUSALS,
  PAPERCLIP_BIRTH_PLAN_REFUSALS,
  PAPERCLIP_EXECUTOR_BIRTH_PLAN,
  PAPERCLIP_EXECUTOR_ROLE,
  PAPERCLIP_SESSION_ASSIGNMENT_MATRIX,
  PAPERCLIP_SESSION_ROLES,
  PaperclipBirthPlanSchema,
  decideAssignment,
  decideSessionAssignment,
  decideAssignmentBirthPlan,
  type PaperclipBirthPlan,
} from '../src/capability/paperclip/role-assignment.js';

import { decideAssignmentByPermission } from '../src/capability/paperclip/assignment-permission.js';

const EXPECTED: Record<AgentRole, readonly AgentRole[]> = {
  director: ['capo-bu', 'lab', 'ricerca'],
  'capo-bu': ['lab', 'director'],
  lab: ['capo-bu', 'director'],
  ricerca: ['lab', 'director'],
};

const pairs = AGENT_ROLES.flatMap((from) => AGENT_ROLES.map((to) => [from, to] as const));

describe('s7304 matrice-assegnazione', () => {
  it('(a) the table is exactly the agreed one: 16 pairs, nine allowed and seven refused', () => {
    expect(PAPERCLIP_ASSIGNMENT_MATRIX).toEqual(EXPECTED);
    expect(pairs).toHaveLength(16);
    const allowed = pairs.filter(([f, t]) => decideAssignment(f, t).ok);
    expect(allowed).toHaveLength(9);
    expect(pairs.length - allowed.length).toBe(7);
    expect(PAPERCLIP_ASSIGNMENT_REFUSALS).toEqual(['lab_starts_research_itself', 'assign_target_not_allowed']);
  });

  it('(b) Lab to Ricerca is refused and points at the research start tool', () => {
    expect(decideAssignment('lab', 'ricerca')).toEqual({
      ok: false,
      refusal: 'lab_starts_research_itself',
      useTool: RICERCA_TOOLS.start,
    });
  });

  it('(c) every other refused pair gives assign_target_not_allowed without a tool', () => {
    for (const [from, to] of pairs) {
      if (PAPERCLIP_ASSIGNMENT_MATRIX[from].includes(to) || (from === 'lab' && to === 'ricerca')) continue;
      const decision = decideAssignment(from, to);
      expect(decision).toEqual({ ok: false, refusal: 'assign_target_not_allowed' });
      expect('useTool' in decision).toBe(false);
    }
  });

  it('(d) an unknown role never throws and is refused', () => {
    const bad = 'intruder' as unknown as AgentRole;
    expect(decideAssignment(bad, 'lab')).toEqual({ ok: false, refusal: 'assign_target_not_allowed' });
    expect(decideAssignment('lab', bad)).toEqual({ ok: false, refusal: 'assign_target_not_allowed' });
    expect(decideAssignment('toString' as unknown as AgentRole, 'lab')).toEqual({
      ok: false,
      refusal: 'assign_target_not_allowed',
    });
  });

  it('(e) no lead-to-lead, Lab-to-Ricerca or same-seat edge', () => {
    expect(PAPERCLIP_ASSIGNMENT_MATRIX['capo-bu']).not.toContain('capo-bu');
    expect(PAPERCLIP_ASSIGNMENT_MATRIX.lab).not.toContain('ricerca');
    for (const role of AGENT_ROLES) expect(PAPERCLIP_ASSIGNMENT_MATRIX[role]).not.toContain(role);
  });

  it('(f) lead, Lab and Ricerca can assign to the Director', () => {
    for (const role of ['capo-bu', 'lab', 'ricerca'] as const) {
      expect(PAPERCLIP_ASSIGNMENT_MATRIX[role]).toContain('director');
      expect(decideAssignment(role, 'director')).toEqual({ ok: true });
    }
  });
});

type Matrix = Record<AgentRole, readonly AgentRole[]>;
const TODAY: Matrix = EXPECTED;
const WITH_LAB_RICERCA: Matrix = { ...EXPECTED, lab: ['capo-bu', 'director', 'ricerca'] };
const NOBODY_CALLS_RICERCA: Matrix = { director: ['capo-bu', 'lab'], 'capo-bu': ['lab', 'director'], lab: ['capo-bu', 'director'], ricerca: ['lab', 'director'] };
const ONLY_DIRECTOR_CALLS: Matrix = { director: ['capo-bu', 'lab', 'ricerca'], 'capo-bu': ['director'], lab: ['director'], ricerca: ['director'] };
const ROTATED: Matrix = { 'capo-bu': ['director', 'lab', 'ricerca'], director: ['capo-bu'], lab: ['capo-bu'], ricerca: ['capo-bu'] };
const MATRICES: Matrix[] = [TODAY, WITH_LAB_RICERCA, NOBODY_CALLS_RICERCA, ONLY_DIRECTOR_CALLS, ROTATED];

function plan(role: AgentRole, matrix: Matrix = TODAY): PaperclipBirthPlan {
  const result = decideAssignmentBirthPlan(role, matrix);
  if (!result.ok) throw new Error('unexpected refusal');
  return result.plan;
}
const none = { form: 'none' } as const;
const broad = { form: 'broad' } as const;

describe('s7364 piano-alla-nascita', () => {
  it('(a) the four exact plans of today, each valid for the schema', () => {
    expect(plan('director')).toEqual({ permission: broad, recipientProtection: 'open', canCreateAgents: true });
    expect(plan('capo-bu')).toEqual({ permission: none, recipientProtection: 'open', canCreateAgents: false });
    expect(plan('lab')).toEqual({ permission: none, recipientProtection: 'open', canCreateAgents: false });
    expect(plan('ricerca')).toEqual({ permission: none, recipientProtection: 'protected', canCreateAgents: false });
    for (const role of AGENT_ROLES) expect(PaperclipBirthPlanSchema.safeParse(plan(role)).success).toBe(true);
  });

  it('(b) with Lab to Ricerca added, Ricerca is open and the Director needs no broad permission', () => {
    expect(plan('ricerca', WITH_LAB_RICERCA).recipientProtection).toBe('open');
    expect(plan('director', WITH_LAB_RICERCA)).toEqual({ permission: none, recipientProtection: 'open', canCreateAgents: false });
  });

  it('(c) nobody calling Ricerca leaves it open and the Director without broad', () => {
    expect(plan('ricerca', NOBODY_CALLS_RICERCA)).toEqual({ permission: none, recipientProtection: 'open', canCreateAgents: false });
    expect(plan('director', NOBODY_CALLS_RICERCA).permission).toEqual(none);
  });

  it('(d) only the Director calling Lab and Ricerca protects both and gives the Director broad', () => {
    expect(plan('lab', ONLY_DIRECTOR_CALLS).recipientProtection).toBe('protected');
    expect(plan('ricerca', ONLY_DIRECTOR_CALLS).recipientProtection).toBe('protected');
    expect(plan('director', ONLY_DIRECTOR_CALLS)).toEqual({ permission: broad, recipientProtection: 'open', canCreateAgents: true });
  });

  it('(j) a rotated matrix follows the matrix and not the role name', () => {
    for (const role of ['director', 'lab', 'ricerca'] as const) expect(plan(role, ROTATED).recipientProtection).toBe('protected');
    expect(plan('capo-bu', ROTATED)).toEqual({ permission: broad, recipientProtection: 'open', canCreateAgents: true });
    expect(plan('director', ROTATED)).toEqual({ permission: none, recipientProtection: 'protected', canCreateAgents: false });
  });

  it('(e) canCreateAgents is true exactly when the permission is broad', () => {
    for (const matrix of MATRICES) {
      for (const role of AGENT_ROLES) {
        const p = plan(role, matrix);
        expect(p.canCreateAgents).toBe(p.permission.form === 'broad');
      }
    }
  });

  it('(f) read by decideAssignmentByPermission the matrix never gets narrower', () => {
    const organization = {
      director: { reportsTo: null },
      'capo-bu': { reportsTo: 'director' },
      lab: { reportsTo: 'director' },
      ricerca: { reportsTo: 'director' },
    };
    for (const matrix of MATRICES) {
      for (const from of AGENT_ROLES) {
        for (const to of AGENT_ROLES) {
          if (from === to) continue;
          const assigner = plan(from, matrix);
          const recipient = plan(to, matrix);
          const decision = decideAssignmentByPermission({
            permission: assigner.permission, assigner: from, recipient: to, organization,
            recipientProtection: recipient.recipientProtection,
          });
          if (matrix[from].includes(to)) expect(decision.ok).toBe(true);
          if (recipient.recipientProtection === 'open') expect(decision.ok).toBe(true);
          else expect(decision.ok).toBe(assigner.permission.form === 'broad');
        }
      }
    }
  });

  it('(g) an unknown role is refused with a closed code and never throws', () => {
    expect([...PAPERCLIP_BIRTH_PLAN_REFUSALS]).toEqual(['role_unknown']);
    for (const bad of [undefined, null, '', 'Director', 'ceo', 'constructor', '__proto__', 7, {}, ['director']]) {
      expect(decideAssignmentBirthPlan(bad)).toEqual({ ok: false, refusal: 'role_unknown' });
    }
  });

  it('(h) two calls give equal plans that are not the same object', () => {
    const a = decideAssignmentBirthPlan('director');
    const b = decideAssignmentBirthPlan('director');
    expect(a).toEqual(b);
    if (!a.ok || !b.ok) throw new Error('unexpected refusal');
    expect(a.plan).not.toBe(b.plan);
    expect(a.plan.permission).not.toBe(b.plan.permission);
  });

  it('(i) the built package exports the function and schema in Node', () => {
    const output = execFileSync(process.execPath, ['--input-type=module', '-e', `
      const m = await import('@x9-forge/contracts/capability/paperclip/role-assignment');
      process.stdout.write(JSON.stringify([
        typeof m.decideAssignmentBirthPlan,
        m.PaperclipBirthPlanSchema.safeParse({ permission: { form: 'broad' }, recipientProtection: 'open', canCreateAgents: true }).success,
        m.decideAssignmentBirthPlan('ricerca')
      ]));
    `], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8' });
    expect(JSON.parse(output)).toEqual(['function', true,
      { ok: true, plan: { permission: { form: 'none' }, recipientProtection: 'protected', canCreateAgents: false } }]);
  });
});

describe('s7372 piano-alla-nascita prove mancanti', () => {
  it('(a) a role listing itself does not count as its own caller', () => {
    const SELF_LISTED: Matrix = {
      director: ['capo-bu', 'lab', 'ricerca'],
      'capo-bu': ['director'],
      lab: ['lab', 'director'],
      ricerca: ['director'],
    };
    expect(plan('lab', SELF_LISTED).recipientProtection).toBe('protected');
    const director = plan('director', SELF_LISTED);
    expect(director.permission).toEqual(broad);
    expect(director.canCreateAgents).toBe(true);
  });

  it('(b) the schema refuses an extra key at the top level and inside permission', () => {
    const valid = { permission: { form: 'broad' }, recipientProtection: 'open', canCreateAgents: true };
    expect(PaperclipBirthPlanSchema.safeParse(valid).success).toBe(true);
    expect(PaperclipBirthPlanSchema.safeParse({ ...valid, extra: 1 }).success).toBe(false);
    expect(PaperclipBirthPlanSchema.safeParse({ ...valid, permission: { form: 'broad', extra: 1 } }).success).toBe(false);
    expect(PaperclipBirthPlanSchema.safeParse({ ...valid, permission: { form: 'none', extra: 1 } }).success).toBe(false);
  });
});

describe('s8033 esecutore', () => {
  // Hand-written table: the eleven allowed pairs (today's nine plus lead→executor and executor→lead).
  const ALLOWED: Record<string, readonly string[]> = {
    director: ['capo-bu', 'lab', 'ricerca'],
    'capo-bu': ['lab', 'director', 'esecutore'],
    lab: ['capo-bu', 'director'],
    ricerca: ['lab', 'director'],
    esecutore: ['capo-bu'],
  };

  it('s8033_matrice: 25 pairs over five roles, eleven allowed, the rest refused with the closed code', () => {
    expect(PAPERCLIP_EXECUTOR_ROLE).toBe('esecutore');
    expect([...PAPERCLIP_SESSION_ROLES]).toEqual([...AGENT_ROLES, 'esecutore']);
    const all = PAPERCLIP_SESSION_ROLES.flatMap((from) => PAPERCLIP_SESSION_ROLES.map((to) => [from, to] as const));
    expect(all).toHaveLength(25);
    let allowed = 0;
    for (const [from, to] of all) {
      const decision = decideSessionAssignment(from, to);
      if (ALLOWED[from]!.includes(to)) {
        allowed += 1;
        expect(decision).toEqual({ ok: true });
      } else if (from === 'lab' && to === 'ricerca') {
        expect(decision).toEqual({ ok: false, refusal: 'lab_starts_research_itself', useTool: RICERCA_TOOLS.start });
      } else {
        expect(decision).toEqual({ ok: false, refusal: 'assign_target_not_allowed' });
      }
    }
    expect(allowed).toBe(11);
    for (const from of ['director', 'lab', 'ricerca'] as const) {
      expect(decideSessionAssignment(from, 'esecutore')).toEqual({ ok: false, refusal: 'assign_target_not_allowed' });
    }
    for (const to of ['director', 'lab', 'ricerca', 'esecutore'] as const) {
      expect(decideSessionAssignment('esecutore', to)).toEqual({ ok: false, refusal: 'assign_target_not_allowed' });
    }
    for (const bad of ['intruder', 'toString', '__proto__'] as unknown as AgentRole[]) {
      expect(decideSessionAssignment(bad, 'capo-bu')).toEqual({ ok: false, refusal: 'assign_target_not_allowed' });
      expect(decideSessionAssignment('capo-bu', bad)).toEqual({ ok: false, refusal: 'assign_target_not_allowed' });
    }
    expect(PAPERCLIP_SESSION_ASSIGNMENT_MATRIX.esecutore).toEqual(['capo-bu']);
  });

  it('s8033_piano: the executor birth plan is none / open / cannot create agents', () => {
    expect(PaperclipBirthPlanSchema.parse(PAPERCLIP_EXECUTOR_BIRTH_PLAN)).toEqual({
      permission: { form: 'none' },
      recipientProtection: 'open',
      canCreateAgents: false,
    });
  });

  it('s8033_storico: today\'s matrix and the four birth plans are unchanged', () => {
    expect(PAPERCLIP_ASSIGNMENT_MATRIX).toEqual(EXPECTED);
    const plans = {
      director: { permission: { form: 'broad' }, recipientProtection: 'open', canCreateAgents: true },
      'capo-bu': { permission: { form: 'none' }, recipientProtection: 'open', canCreateAgents: false },
      lab: { permission: { form: 'none' }, recipientProtection: 'open', canCreateAgents: false },
      ricerca: { permission: { form: 'none' }, recipientProtection: 'protected', canCreateAgents: false },
    };
    for (const role of AGENT_ROLES) {
      expect(decideAssignmentBirthPlan(role)).toEqual({ ok: true, plan: plans[role] });
    }
    expect(decideAssignmentBirthPlan('esecutore')).toEqual({ ok: false, refusal: 'role_unknown' });
  });
});
