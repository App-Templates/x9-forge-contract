import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_RECIPIENT_FIELD_BY_TOOL, PAPERCLIP_RECIPIENT_REFUSALS, PAPERCLIP_ROLE_REF_FIELDS, PAPERCLIP_TOOLS,
  PaperclipAgentBindingSchema, PaperclipAgentDirectoryEntrySchema, PaperclipAgentIdSchema, PaperclipAssignAgentInputSchema,
  PaperclipAssignAgentRefInputSchema, PaperclipAssignInputSchema, PaperclipColleaguesSchema, PaperclipCreateGoalAgentInputSchema,
  PaperclipCreateGoalInputSchema, PaperclipCreateIssueAgentInputSchema, PaperclipCreateIssueInputSchema,
  paperclipColleagueById, paperclipRecipientForm,
} from '../src/capability/paperclip/index.js';

const A = '3f2b8c1e-5a4d-4e6f-8a9b-0c1d2e3f4a5b';
const B = '9a8b7c6d-1e2f-4a3b-9c4d-5e6f7a8b9c0d';
const ISSUE = '11111111-2222-4333-8444-555555555555';
const colleague = (agentId: string, role = 'capo-bu') => ({ agentId, role, unitId: 'bu-1', label: 'Capo BU' });

describe('s7405 destinatario per id', () => {
  it('s7405_agent_id_is_a_guid', () => {
    for (const ok of [A, '00000000-0000-0000-0000-000000000001']) expect(PaperclipAgentIdSchema.safeParse(ok).success).toBe(true);
    for (const bad of ['rd-lab', 'director', 'ruolo@progetto', '', A.replaceAll('-', ''), `${A} `, 42, null]) {
      expect(PaperclipAgentIdSchema.safeParse(bad).success).toBe(false);
    }
  });

  it('s7405_assign_by_id', () => {
    expect(PaperclipAssignAgentInputSchema.safeParse({ issueId: ISSUE, assigneeAgentId: A }).success).toBe(true);
    expect(PaperclipAssignAgentInputSchema.safeParse({ issueId: ISSUE, assigneeAgentId: A, comment: 'ok' }).success).toBe(true);
    expect(PaperclipAssignAgentRefInputSchema.safeParse({ issueId: 'PAP-39', assigneeAgentId: A }).success).toBe(true);
    for (const bad of [
      { issueId: ISSUE, roleRef: 'rd-lab' }, { issueId: ISSUE }, { issueId: ISSUE, assigneeAgentId: 'rd-lab' },
      { issueId: ISSUE, assigneeAgentId: A, roleRef: 'rd-lab' }, { assigneeAgentId: A },
    ]) expect(PaperclipAssignAgentInputSchema.safeParse(bad).success).toBe(false);
  });

  it('s7405_create_issue_by_id_keeps_every_other_field', () => {
    const rest = { title: 'T', description: 'd', projectId: ISSUE, goalId: ISSUE, parentIssueId: ISSUE, blockedByIssueIds: [ISSUE] };
    expect(PaperclipCreateIssueAgentInputSchema.safeParse(rest).success).toBe(true);
    expect(PaperclipCreateIssueAgentInputSchema.safeParse({ ...rest, assigneeAgentId: A }).success).toBe(true);
    expect(PaperclipCreateIssueAgentInputSchema.parse(rest)).toEqual(PaperclipCreateIssueInputSchema.parse(rest));
    for (const bad of [
      { ...rest, assigneeRoleRef: 'director' }, { ...rest, assigneeAgentId: 'director' },
      { ...rest, blockedByIssueIds: [ISSUE, ISSUE] }, { ...rest, projectId: 'progetto-1' },
    ]) expect(PaperclipCreateIssueAgentInputSchema.safeParse(bad).success).toBe(false);
  });

  it('s7405_goal_owner_by_id', () => {
    const base = { title: 'G', level: 'team' };
    expect(PaperclipCreateGoalAgentInputSchema.safeParse({ ...base, ownerAgentId: A }).success).toBe(true);
    for (const bad of [
      { ...base, ownerRoleRef: 'director' }, { ...base, ownerAgentId: 'director' }, { ...base, level: 'reparto', ownerAgentId: A },
    ]) expect(PaperclipCreateGoalAgentInputSchema.safeParse(bad).success).toBe(false);
  });

  it('s7405_the_old_forms_still_parse', () => {
    expect(PaperclipAssignInputSchema.safeParse({ issueId: ISSUE, roleRef: 'rd-lab' }).success).toBe(true);
    expect(PaperclipCreateIssueInputSchema.safeParse({ title: 'T', assigneeRoleRef: 'director' }).success).toBe(true);
    expect(PaperclipCreateGoalInputSchema.safeParse({ title: 'G', level: 'team', ownerRoleRef: 'director' }).success).toBe(true);
    expect(PaperclipAgentBindingSchema.shape.roleAgents.safeParse({ 'rd-lab': B }).success).toBe(true);
  });

  it('s7405_colleagues_is_the_only_source_of_ids', () => {
    const list = [colleague(A, 'director'), colleague(B)];
    expect(PaperclipColleaguesSchema.safeParse(list).success).toBe(true);
    for (const bad of [
      [colleague(A), colleague(A)], [colleague(A, 'manager')], [colleague('rd-lab')], [{ ...colleague(A), extra: 1 }],
    ]) expect(PaperclipColleaguesSchema.safeParse(bad).success).toBe(false);
    const parsed = PaperclipColleaguesSchema.parse(list);
    expect(paperclipColleagueById(parsed, B)).toEqual({ ok: true, colleague: parsed[1] });
    for (const id of ['11111111-2222-4333-8444-000000000000', 'rd-lab']) {
      expect(paperclipColleagueById(parsed, id)).toEqual({ ok: false, refusal: 'agent_not_listed' });
    }
    expect(paperclipColleagueById([], A)).toEqual({ ok: false, refusal: 'agent_not_listed' });
    expect([...PAPERCLIP_RECIPIENT_REFUSALS]).toEqual(['agent_not_listed']);
  });

  it('s7405_agent_list_row_is_read_with_extra_fields', () => {
    const row = { id: A, name: 'Capo', role: 'ceo', status: 'idle', reportsTo: null, capabilities: ['x'], adapterConfig: { a: 1 } };
    expect(PaperclipAgentDirectoryEntrySchema.safeParse(row).success).toBe(true);
    expect(PaperclipAgentDirectoryEntrySchema.safeParse({ ...row, id: 'rd-lab' }).success).toBe(false);
    expect(PaperclipAgentDirectoryEntrySchema.safeParse({ ...row, status: 'sleeping' }).success).toBe(false);
  });

  it('s7405_every_tool_that_names_a_recipient_has_the_id_form', () => {
    expect(Object.keys(PAPERCLIP_RECIPIENT_FIELD_BY_TOOL).sort()).toEqual(
      [PAPERCLIP_TOOLS.assign, PAPERCLIP_TOOLS.createIssue, PAPERCLIP_TOOLS.createGoal].sort());
    const shapes = {
      [PAPERCLIP_TOOLS.assign]: [PaperclipAssignInputSchema, PaperclipAssignAgentInputSchema],
      [PAPERCLIP_TOOLS.createIssue]: [PaperclipCreateIssueInputSchema, PaperclipCreateIssueAgentInputSchema],
      [PAPERCLIP_TOOLS.createGoal]: [PaperclipCreateGoalInputSchema, PaperclipCreateGoalAgentInputSchema],
    } as const;
    for (const [tool, fields] of Object.entries(PAPERCLIP_RECIPIENT_FIELD_BY_TOOL)) {
      const [oldSchema, newSchema] = shapes[tool as keyof typeof shapes];
      expect(Object.keys(oldSchema.shape)).toContain(fields.deprecated);
      expect(PAPERCLIP_ROLE_REF_FIELDS as readonly string[]).toContain(fields.deprecated);
      expect(Object.keys(newSchema.shape)).toContain(fields.current);
      expect(Object.keys(newSchema.shape)).not.toContain(fields.deprecated);
    }
  });

  it('s7405_the_form_used_is_counted', () => {
    const t = PAPERCLIP_TOOLS.createIssue;
    expect(paperclipRecipientForm(t, { assigneeAgentId: A })).toBe('agent_id');
    expect(paperclipRecipientForm(t, { assigneeRoleRef: 'director' })).toBe('role_ref');
    expect(paperclipRecipientForm(t, { assigneeAgentId: A, assigneeRoleRef: 'director' })).toBe('both');
    expect(paperclipRecipientForm(t, { title: 'x' })).toBe('none');
    expect(paperclipRecipientForm(t, null)).toBe('none');
    expect(paperclipRecipientForm(t, 'assigneeAgentId')).toBe('none');
  });

  it('s7405_the_three_free_text_fields_are_marked_deprecated', () => {
    const source = readFileSync(new URL('../src/capability/paperclip/tools.ts', import.meta.url), 'utf8');
    for (const field of ['roleRef', 'assigneeRoleRef', 'ownerRoleRef']) {
      expect(source).toMatch(new RegExp(`@deprecated[^\\n]*\\n\\s*${field}: Text`));
    }
  });
});
