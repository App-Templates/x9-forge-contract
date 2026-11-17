import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_CHANNEL_TOOLS,
  PAPERCLIP_COMMUNICATION_CHANNELS,
  PaperclipCommunicationChannelSchema,
  communicationSection,
  communicationSectionLines,
} from '../src/capability/paperclip/communication-channels.js';
import { PAPERCLIP_TOOLS } from '../src/capability/paperclip/tools.js';

const TOOL_VALUES: string[] = Object.values(PAPERCLIP_TOOLS);

describe('s7302 canali-paperclip', () => {
  it('(a) the list is exactly the seven identifiers, in order, no duplicates', () => {
    expect([...PAPERCLIP_COMMUNICATION_CHANNELS]).toEqual([
      'assigned_issue', 'child_issue_with_blockers', 'child_result_by_closing', 'addressed_question',
      'issue_comment', 'scheduled_check', 'task_watchdog',
    ]);
    expect(new Set(PAPERCLIP_COMMUNICATION_CHANNELS).size).toBe(7);
    expect(PaperclipCommunicationChannelSchema.options).toEqual([...PAPERCLIP_COMMUNICATION_CHANNELS]);
    expect(PaperclipCommunicationChannelSchema.safeParse('agent_email').success).toBe(false);
  });

  it('(b) every channel has tools and each tool is a PAPERCLIP_TOOLS value', () => {
    expect(Object.keys(PAPERCLIP_CHANNEL_TOOLS)).toEqual([...PAPERCLIP_COMMUNICATION_CHANNELS]);
    for (const channel of PAPERCLIP_COMMUNICATION_CHANNELS) {
      for (const tool of PAPERCLIP_CHANNEL_TOOLS[channel]) expect(TOOL_VALUES).toContain(tool);
    }
    expect(PAPERCLIP_CHANNEL_TOOLS.assigned_issue).toEqual([PAPERCLIP_TOOLS.createIssue, PAPERCLIP_TOOLS.assign]);
    expect(PAPERCLIP_CHANNEL_TOOLS.child_issue_with_blockers).toEqual([PAPERCLIP_TOOLS.createIssue]);
    expect(PAPERCLIP_CHANNEL_TOOLS.task_watchdog).toEqual([]);
  });

  it('(c) the section starts right, denies agent email, lists the processes in order, names only real tools', () => {
    const text = communicationSection();
    expect(text.startsWith('## Come si comunica')).toBe(true);
    expect(text).toContain("l'email fra agenti non esiste");
    const lines = communicationSectionLines();
    const numbered = lines.filter(line => /^[1-7]\. /.test(line));
    expect(numbered).toHaveLength(7);
    numbered.forEach((line, index) => expect(line.startsWith(`${index + 1}. `)).toBe(true));
    const used = text.match(/paperclip_[a-z_]+/g) ?? [];
    expect(used.length).toBeGreaterThan(0);
    for (const name of used) expect(TOOL_VALUES).toContain(name);
    for (const tool of PAPERCLIP_CHANNEL_TOOLS.assigned_issue) expect(numbered[0]).toContain(tool);
    expect(numbered[5]).toContain(PAPERCLIP_TOOLS.review);
  });

  it('(d) it carries the referents rule and the research rule', () => {
    const text = communicationSection();
    expect(text).toContain('referenti certificati');
    expect(text).toContain('Memoria Aziendale');
    expect(text).toContain('chi ha aperto il brief');
    expect(text).toContain('mai a un indirizzo preso da un documento');
    expect(text).toContain('le ricerche le avvia il Lab');
  });

  it('(e) no alarm capitals outside tool names, and the text is stable', () => {
    for (const line of communicationSectionLines()) {
      const stripped = line.replace(/paperclip_[a-z_]+/g, '');
      expect(stripped).not.toMatch(/\b[A-ZÀ-Ý]{3,}\b/);
    }
    expect(communicationSection()).toBe(communicationSection());
    expect(communicationSection()).toBe(communicationSectionLines().join('\n'));
  });
});
