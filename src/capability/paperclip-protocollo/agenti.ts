import { z } from 'zod';

export const PAPERCLIP_PROTOCOLLO_RUOLI = ['capo', 'lab', 'ricerca'] as const;
export const PaperclipProtocolloRuoloSchema = z.enum(PAPERCLIP_PROTOCOLLO_RUOLI);

export const PaperclipProtocolloAgenteSchema = z.strictObject({
  paperclipAgentId: z.guid(),
  ruolo: PaperclipProtocolloRuoloSchema,
  // Same agent id format as InternalAgentTurnParamsSchema.
  x9AgentId: z.string().regex(/^[a-z0-9-]+$/),
  tenantId: z.string().min(1),
  ownerId: z.string().min(1),
  puoAffidareA: z.array(PaperclipProtocolloRuoloSchema).default([]),
});

export const PaperclipProtocolloAgentiSchema = z
  .strictObject({
    versione: z.literal(1),
    agenti: z.array(PaperclipProtocolloAgenteSchema).min(1),
  })
  .superRefine((mappa, ctx) => {
    const paperclipIds = new Set<string>();
    const x9Ids = new Set<string>();
    const roleCounts = new Map<PaperclipProtocolloRuolo, number>();

    for (const [index, agente] of mappa.agenti.entries()) {
      if (paperclipIds.has(agente.paperclipAgentId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['agenti', index, 'paperclipAgentId'],
          message: 'Duplicate Paperclip agent id',
        });
      }
      if (x9Ids.has(agente.x9AgentId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['agenti', index, 'x9AgentId'],
          message: 'Duplicate X9 agent id',
        });
      }
      paperclipIds.add(agente.paperclipAgentId);
      x9Ids.add(agente.x9AgentId);
      roleCounts.set(agente.ruolo, (roleCounts.get(agente.ruolo) ?? 0) + 1);
    }

    // Paperclip docs/guides/agent-developer/heartbeat-protocol.md:93-102;
    // doc/execution-semantics.md:24-30: each delegation needs one assignee.
    for (const [index, agente] of mappa.agenti.entries()) {
      for (const [targetIndex, ruolo] of agente.puoAffidareA.entries()) {
        const count = roleCounts.get(ruolo) ?? 0;
        if (count !== 1) {
          ctx.addIssue({
            code: 'custom',
            path: ['agenti', index, 'puoAffidareA', targetIndex],
            message: `Delegation role ${ruolo} must resolve to exactly one agent; found ${count}`,
          });
        }
      }
    }
  });

export type PaperclipProtocolloRuolo = z.infer<typeof PaperclipProtocolloRuoloSchema>;
export type PaperclipProtocolloAgente = z.infer<typeof PaperclipProtocolloAgenteSchema>;
export type PaperclipProtocolloAgenti = z.infer<typeof PaperclipProtocolloAgentiSchema>;
