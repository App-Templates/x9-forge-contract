import { describe, expect, it } from 'vitest';
import { AGENT_ROLES, type AgentRole } from '../src/organization/agent-role.js';
import { RICERCA_TOOLS } from '../src/capability/ricerca/tools.js';
import {
  PAPERCLIP_ASSIGNMENT_MATRIX,
  PAPERCLIP_ASSIGNMENT_REFUSALS,
  decideAssignment,
} from '../src/capability/paperclip/role-assignment.js';

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
