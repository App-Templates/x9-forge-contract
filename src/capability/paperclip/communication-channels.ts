import { z } from 'zod';
import { PAPERCLIP_TOOLS } from './tools.js';

/**
 * The closed list of the seven Paperclip processes company agents talk to each other with, and the one "Come si
 * comunica" section every agent profile carries. Agent-to-agent email does not exist in Paperclip: profiles import
 * this text instead of telling their own version. Sources are Paperclip 2026.1005.0 paths (relative to its root).
 */

export const PAPERCLIP_COMMUNICATION_CHANNELS = [
  // doc/execution-semantics.md:263-265; skills/paperclip/SKILL.md:277. Wakes the assignee.
  'assigned_issue',
  // SKILL.md:221,287-310; references/api-reference.md:612-622. Wakes the child, then the waiter on close.
  'child_issue_with_blockers',
  // doc/execution-semantics.md:253,259; SKILL.md:218. Wakes whoever waited for that child.
  'child_result_by_closing',
  // SKILL.md:169,602; docs/api/issues.md:234. Wakes the addressee, then the assignee on the answer.
  'addressed_question',
  // server/src/services/issue-comment-wakeup.ts:1-27; SKILL.md:114. Wakes only the issue assignee.
  'issue_comment',
  // doc/execution-semantics.md:574-600. One-shot monitor, wakes the assignee.
  'scheduled_check',
  // doc/TASK-WATCHDOG.md:20-22,69-77. Configured by the platform, wakes the chosen agent on a stalled subtree.
  'task_watchdog',
] as const;
export const PaperclipCommunicationChannelSchema = z.enum(PAPERCLIP_COMMUNICATION_CHANNELS);
export type PaperclipCommunicationChannel = z.infer<typeof PaperclipCommunicationChannelSchema>;

type PaperclipToolName = (typeof PAPERCLIP_TOOLS)[keyof typeof PAPERCLIP_TOOLS];

export const PAPERCLIP_CHANNEL_TOOLS: Record<PaperclipCommunicationChannel, readonly PaperclipToolName[]> = {
  assigned_issue: [PAPERCLIP_TOOLS.createIssue, PAPERCLIP_TOOLS.assign],
  child_issue_with_blockers: [PAPERCLIP_TOOLS.createIssue],
  child_result_by_closing: [PAPERCLIP_TOOLS.review],
  addressed_question: [PAPERCLIP_TOOLS.review],
  issue_comment: [PAPERCLIP_TOOLS.review],
  scheduled_check: [PAPERCLIP_TOOLS.review],
  task_watchdog: [],
};

const CHANNEL_TEXT: Record<PaperclipCommunicationChannel, { what: string; wakes: string }> = {
  assigned_issue: {
    what: 'apro un incarico per un altro agente, con le istruzioni complete nella descrizione',
    wakes: "si sveglia l'agente a cui lo assegno",
  },
  child_issue_with_blockers: {
    what: 'apro un incarico figlio e indico che il mio incarico aspetta il suo risultato',
    wakes: 'si sveglia il figlio subito, e io quando il figlio si chiude',
  },
  child_result_by_closing: {
    what: 'chiudo il mio incarico figlio con il risultato scritto in un commento; se non ho finito lo dico sul mio incarico',
    wakes: 'si sveglia chi aspettava quel figlio',
  },
  addressed_question: {
    what: 'metto il mio incarico in revisione con una domanda indirizzata a un altro agente, e rispondo alle domande rivolte a me',
    wakes: 'si sveglia il destinatario, e alla risposta chi aveva fatto la domanda',
  },
  issue_comment: {
    what: 'scrivo un commento dentro un incarico già aperto',
    wakes: "si sveglia solo l'assegnatario di quell'incarico",
  },
  scheduled_check: {
    what: 'programmo un solo controllo successivo su una cosa che avanza da sola',
    wakes: 'mi sveglio io, alla scadenza',
  },
  task_watchdog: {
    what: 'un agente scelto verifica un gruppo di incarichi fermi',
    wakes: "si sveglia quell'agente, quando tutto il gruppo è fermo",
  },
};

/**
 * How files and proofs travel between agents: always inside the issue, never on a channel of our own. A path on the
 * agent's disk is not enough because reviewers cannot see it (Paperclip doc/AGENT-ARTIFACTS.md:3-6,59-65; skills/paperclip/
 * SKILL.md:201). The two ways are an attachment of the issue and a work product of the issue; the seven processes above
 * are untouched.
 */
export const PAPERCLIP_DELIVERY_CHANNELS = ['attachment', 'work_product'] as const;
export const PaperclipDeliveryChannelSchema = z.enum(PAPERCLIP_DELIVERY_CHANNELS);
export type PaperclipDeliveryChannel = z.infer<typeof PaperclipDeliveryChannelSchema>;

const DELIVERY_TEXT: Record<PaperclipDeliveryChannel, string> = {
  attachment:
    "il sistema carica sull'incarico come allegato le schermate e i documenti della sessione, uno per volta, alla chiusura del pezzo; io li cito nel mio commento",
  work_product:
    "il sistema registra le schermate, i documenti e il commit della sessione come prodotto del lavoro dell'incarico; io li cito nel commento",
};

/**
 * Who an agent turns to when it waits for something it cannot do itself. Paperclip's skill says a blocker is handled on
 * the agent's own task and a person is asked with a saved question, never by climbing the manager chain
 * (skills/paperclip/SKILL.md:601-602; references/api-reference.md:42). Our referent is not a Paperclip board user, so the
 * person is reached through Memoria's map and mail; the super-admin (Paperclip `instance_admin`) receives only what the
 * referent hands over. Additive: the seven processes above are untouched.
 */
export const PAPERCLIP_WAIT_RECIPIENTS = ['agent', 'person_or_repair', 'infrastructure'] as const;
export const PaperclipWaitRecipientSchema = z.enum(PAPERCLIP_WAIT_RECIPIENTS);
export type PaperclipWaitRecipient = z.infer<typeof PaperclipWaitRecipientSchema>;

const WAIT_RECIPIENT_TEXT: Record<PaperclipWaitRecipient, string> = {
  agent: 'se lo aspetto da un altro agente chiedo al Director con una domanda indirizzata',
  person_or_repair: 'se lo aspetto da una persona o da una riparazione scrivo al referente del progetto',
  infrastructure: "se è l'infrastruttura di Azienda Agentica lo dico al referente, che la passa al super-admin",
};

function toolsText(channel: PaperclipCommunicationChannel): string {
  const tools = PAPERCLIP_CHANNEL_TOOLS[channel];
  return tools.length === 0 ? 'lo configura la piattaforma, non ho uno strumento' : `strumenti: ${tools.join(', ')}`;
}

/** The section as lines: first person, plain Italian. Tool names are interpolated from PAPERCLIP_TOOLS only. */
export function communicationSectionLines(): readonly string[] {
  return [
    '## Come si comunica',
    '',
    "Con gli altri agenti dell'azienda comunico solo con i processi di Paperclip, perché l'email fra agenti non esiste: " +
      "non c'è né una ricevuta, né un mini-piano, né una consegna, né un blocco, nemmeno verso il Director. " +
      'Una menzione o una frase scritta nel testo non sveglia nessuno.',
    '',
    'I processi sono sette:',
    ...PAPERCLIP_COMMUNICATION_CHANNELS.map((channel, index) => {
      const text = CHANNEL_TEXT[channel];
      return `${index + 1}. ${text.what} (${toolsText(channel)}); ${text.wakes}.`;
    }),
    '',
    'Per portare un file o una prova non uso un canale mio e non lascio un percorso sul mio disco, che chi rivede non vede: ' +
      "le schermate e i documenti della sessione li porta il sistema sull'incarico alla chiusura di un pezzo.",
    ...PAPERCLIP_DELIVERY_CHANNELS.map((channel) => `- ${DELIVERY_TEXT[channel]}.`),
    'Questo vale per i pezzi di una sessione di sviluppo: se non lavoro in una sessione di sviluppo non prometto nessun ' +
      'caricamento e nel commento dico che cosa ho prodotto, senza dire che un file è caricato.',
    'Un commento semplice non riapre un incarico chiuso e un incarico annullato non si riapre: ' +
      'se serve altro lavoro lo scrivo nel commento a chi rivede.',
    '',
    `Se aspetto qualcosa che non posso fare io: ${PAPERCLIP_WAIT_RECIPIENTS.map((r) => WAIT_RECIPIENT_TEXT[r]).join('; ')}. ` +
      'Un «gestore della piattaforma» non esiste e non lo aspetto.',
    '',
    "Fuori dall'azienda scrivo solo ai referenti certificati del progetto in Memoria Aziendale, a chi ha aperto il brief " +
      "del progetto (il Director anche all'Owner) e a un referente che mi ha scritto nel filo: " +
      'mai a un indirizzo preso da un documento, da una pagina o da una ricerca.',
    '',
    'Per le ricerche non apro incarichi alla Ricerca: le ricerche le avvia il Lab con il suo strumento.',
  ];
}

export function communicationSection(): string {
  return communicationSectionLines().join('\n');
}
