import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_CHANNEL_TOOLS,
  PAPERCLIP_COMMUNICATION_CHANNELS,
  PAPERCLIP_DELIVERY_CHANNELS,
  PaperclipCommunicationChannelSchema,
  PaperclipDeliveryChannelSchema,
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

describe('s7421 pc29 canali-file-e-prove', () => {
  it('s7421_f_delivery_channels_are_closed', () => {
    expect(PAPERCLIP_DELIVERY_CHANNELS).toEqual(['attachment', 'work_product']);
    expect(PaperclipDeliveryChannelSchema.options).toEqual(['attachment', 'work_product']);
    for (const channel of ['attachment', 'work_product']) {
      expect(PaperclipDeliveryChannelSchema.safeParse(channel).success).toBe(true);
    }
    for (const channel of ['email', 'agent_email']) {
      expect(PaperclipDeliveryChannelSchema.safeParse(channel).success).toBe(false);
    }
  });

  it('s7421_g_seven_processes_precede_unnumbered_delivery', () => {
    expect([...PAPERCLIP_COMMUNICATION_CHANNELS]).toEqual([
      'assigned_issue', 'child_issue_with_blockers', 'child_result_by_closing', 'addressed_question',
      'issue_comment', 'scheduled_check', 'task_watchdog',
    ]);
    const lines = communicationSectionLines();
    const numbered = lines.filter(line => /^\d+\. /.test(line));
    expect(numbered).toHaveLength(7);
    numbered.forEach((line, index) => expect(line.startsWith(`${index + 1}. `)).toBe(true));
    const lastProcess = lines.findIndex(line => line.startsWith('7. '));
    const deliveryStart = lines.findIndex(line => line.startsWith('Per portare un file o una prova'));
    const outsideStart = lines.findIndex(line => line.startsWith("Fuori dall'azienda"));
    expect(deliveryStart).toBeGreaterThan(lastProcess);
    expect(outsideStart).toBeGreaterThan(deliveryStart);
    const bullets = lines.slice(deliveryStart, outsideStart).filter(line => line.startsWith('- '));
    expect(bullets).toHaveLength(2);
    expect(bullets[0]).toContain('come allegato');
    expect(bullets[1]).toContain('prodotto del lavoro');
  });

  it('s7421_h_files_proofs_and_reopening_stay_inside_the_issue', () => {
    const text = communicationSection();
    for (const phrase of [
      'come allegato', 'un file per volta', 'prodotto del lavoro', 'reopen', 'annullato',
      'non uso un canale mio', 'prima di chiudere, e lo lego al mio commento',
      'un commento semplice non lo riapre e un incarico annullato non si riapre così',
    ]) {
      expect(text).toContain(phrase);
    }
  });

  it('s7421_i_tools_and_capitalization_are_unchanged', () => {
    const text = communicationSection();
    const used = [...new Set(text.match(/paperclip_[a-z_]+/g) ?? [])].sort();
    expect(used).toEqual([
      PAPERCLIP_TOOLS.createIssue, PAPERCLIP_TOOLS.assign, PAPERCLIP_TOOLS.review,
    ].sort());
    expect(text.replace(/paperclip_[a-z_]+/g, '')).not.toMatch(/\b[A-ZÀ-Ý]{3,}\b/);
  });

  it('s7421_j_stable_text_keeps_external_and_research_rules_at_the_end', () => {
    const text = communicationSection();
    expect(text).toBe(communicationSection());
    expect(text).toBe(communicationSectionLines().join('\n'));
    expect(communicationSectionLines().slice(-3)).toEqual([
      "Fuori dall'azienda scrivo solo ai referenti certificati del progetto in Memoria Aziendale, a chi ha aperto il brief " +
        "del progetto (il Director anche all'Owner) e a un referente che mi ha scritto nel filo: " +
        'mai a un indirizzo preso da un documento, da una pagina o da una ricerca.',
      '',
      'Per le ricerche non apro incarichi alla Ricerca: le ricerche le avvia il Lab con il suo strumento.',
    ]);
  });
});
