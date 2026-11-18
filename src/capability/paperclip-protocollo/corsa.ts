import { z } from 'zod';

// Paperclip packages/shared/src/constants.ts:919-929 (HEARTBEAT_RUN_STATUSES).
export const PAPERCLIP_CORSA_STATI = [
  'queued', 'scheduled_retry', 'running', 'succeeded', 'interrupted', 'failed', 'cancelled', 'timed_out',
] as const;
export const PaperclipCorsaStatoSchema = z.enum(PAPERCLIP_CORSA_STATI);
export type PaperclipCorsaStato = z.infer<typeof PaperclipCorsaStatoSchema>;

// Paperclip doc/execution-semantics.md:178 defines these four terminal run states.
export const PAPERCLIP_CORSA_STATI_FINALI = ['succeeded', 'failed', 'cancelled', 'timed_out'] as const;

// server/src/agent-run-cancellation.ts:6-13: cancellation is requested before the run becomes cancelled.
export const PAPERCLIP_ANNULLO_STATO_RICHIESTO = 'requested' as const;

/** GET /api/heartbeat-runs/:runId (server/src/routes/agents.ts:6969): preserves fields the bridge does not read. */
export const PaperclipCorsaSchema = z.looseObject({
  id: z.guid(),
  agentId: z.guid(),
  companyId: z.guid(),
  status: PaperclipCorsaStatoSchema,
  resultJson: z.looseObject({
    executionCancellation: z.looseObject({ state: z.string() }).optional(),
  }).nullable().optional(),
});
export type PaperclipCorsa = z.infer<typeof PaperclipCorsaSchema>;

/**
 * Issue writes require a running run without a cancellation request. Paperclip revokes writes as soon as
 * cancellation is requested (agent-run-cancellation.ts:6-13: agent_run_cancelled, HTTP 403 on methods other than
 * GET/HEAD/OPTIONS). Agent writes also require a persistent run bound to that agent (doc/SPEC-implementation.md:631-634).
 * Reads remain allowed.
 */
export function paperclipCorsaPuoScrivere(corsa: Pick<PaperclipCorsa, 'status' | 'resultJson'>): boolean {
  return corsa.status === 'running'
    && corsa.resultJson?.executionCancellation?.state !== PAPERCLIP_ANNULLO_STATO_RICHIESTO;
}

/** Run cancellation requires a board actor (assertBoard, routes/agents.ts:6986-7014). */
export const PAPERCLIP_ANNULLO_CORSA_ATTORI = ['board'] as const;
export function paperclipAnnulloCorsaAmmesso(attore: 'board' | 'agent' | 'user'): { ok: true } | { ok: false; motivo: 'solo_board' } {
  return attore === 'board' ? { ok: true } : { ok: false, motivo: 'solo_board' };
}

/**
 * Cancellation returns the run itself (routes/agents.ts:7014; public API 467125f returns { id, status }).
 * Only the requested run in the cancelled state confirms cancellation. Additional fields are preserved.
 */
export const PaperclipCorsaAnnullataSchema = z.looseObject({ id: z.guid(), status: z.literal('cancelled') });
export function paperclipAnnulloCorsaConfermato(runIdChiesto: string, risposta: unknown): boolean {
  const letto = PaperclipCorsaAnnullataSchema.safeParse(risposta);
  return letto.success && letto.data.id === runIdChiesto;
}
