import { z } from 'zod';

// -- Fixed disposition of a tool error ---------------------------------------
// Words are not a contract: the tool says what happened, whether the same call may be
// repeated and what to do next; the runtime renders one fixed sentence per value.

export const TOOL_ERROR_NATURES = ['technical_failure', 'permission_refused', 'limit_reached', 'cancelled', 'missing_data', 'invalid_request'] as const;
export const TOOL_ERROR_RETRIES = ['never', 'next_turn', 'after_delay'] as const;
export const TOOL_ERROR_NEXT_MOVES = ['retry_same', 'fix_input', 'ask_director', 'ask_referent', 'ask_owner', 'wait_event', 'stop'] as const;

export const ToolErrorNatureSchema = z.enum(TOOL_ERROR_NATURES);
export const ToolErrorRetrySchema = z.enum(TOOL_ERROR_RETRIES);
export const ToolErrorNextMoveSchema = z.enum(TOOL_ERROR_NEXT_MOVES);

export type ToolErrorNature = z.infer<typeof ToolErrorNatureSchema>;
export type ToolErrorRetry = z.infer<typeof ToolErrorRetrySchema>;
export type ToolErrorNextMove = z.infer<typeof ToolErrorNextMoveSchema>;

export const ToolErrorDispositionSchema = z.strictObject({
  nature: ToolErrorNatureSchema,
  retry: ToolErrorRetrySchema,
  retryAfterSeconds: z.number().int().min(1).max(604800).optional(),
  nextMove: ToolErrorNextMoveSchema,
}).superRefine((disposition, ctx) => {
  if ((disposition.retry === 'after_delay') !== (disposition.retryAfterSeconds !== undefined)) {
    ctx.addIssue({ code: 'custom', path: ['retryAfterSeconds'], message: 'retryAfterSeconds is required if and only if retry is after_delay' });
  }
  if ((disposition.retry === 'never') !== (disposition.nextMove !== 'retry_same')) {
    ctx.addIssue({ code: 'custom', path: ['retry'], message: 'retry is never if and only if the next move is not retry_same' });
  }
  if (disposition.nature === 'permission_refused' && disposition.retry !== 'never') {
    ctx.addIssue({ code: 'custom', path: ['retry'], message: 'A refused permission is never retried' });
  }
});

export type ToolErrorDisposition = z.infer<typeof ToolErrorDispositionSchema>;

const TOOL_ERROR_NATURE_SENTENCES: Record<ToolErrorNature, string> = {
  technical_failure: 'Guasto tecnico: non è un annullamento né un rifiuto.',
  permission_refused: 'Rifiuto di permesso: qui questo strumento non ti è consentito.',
  limit_reached: 'Limite raggiunto.',
  cancelled: 'Annullato da chi ne ha l\'autorità: non è un guasto.',
  missing_data: 'Manca un dato necessario.',
  invalid_request: 'Richiesta non valida così com\'è scritta.',
};

const TOOL_ERROR_NEXT_MOVE_SENTENCES: Record<ToolErrorNextMove, string> = {
  retry_same: 'Ripetila senza cambiare nulla.',
  fix_input: 'Correggi i dati e richiama.',
  ask_director: 'Passa la questione al Director.',
  ask_referent: 'Chiedi al referente.',
  ask_owner: 'Chiedi al proprietario.',
  wait_event: 'Aspetta l\'evento che sblocca: sarai svegliato.',
  stop: 'Fermati qui e lascia scritto l\'esito.',
};

const TOOL_ERROR_RETRY_SENTENCES: Record<ToolErrorRetry, (retryAfterSeconds: number | undefined) => string> = {
  never: () => 'Non ripetere la stessa chiamata.',
  next_turn: () => 'Puoi ripetere la stessa chiamata al prossimo turno.',
  after_delay: (seconds) => `Puoi ripetere la stessa chiamata fra ${seconds} secondi.`,
};

/** One fixed line (nature, repeatability, next move) for a valid disposition; throws on an invalid one. */
export function renderToolErrorDisposition(disposition: ToolErrorDisposition): string {
  const valid = ToolErrorDispositionSchema.parse(disposition);
  return [
    TOOL_ERROR_NATURE_SENTENCES[valid.nature],
    TOOL_ERROR_RETRY_SENTENCES[valid.retry](valid.retryAfterSeconds),
    TOOL_ERROR_NEXT_MOVE_SENTENCES[valid.nextMove],
  ].join(' ');
}

export function toolErrorDispositionOf(body: unknown): ToolErrorDisposition | undefined {
  try {
    if (typeof body !== 'object' || body === null
      || !('status' in body) || body.status !== 'error'
      || !('disposition' in body)) return undefined;

    const parsed = ToolErrorDispositionSchema.safeParse(body.disposition);
    return parsed.success ? parsed.data : undefined;
  } catch {
    // Untrusted objects may throw when their properties are read.
    return undefined;
  }
}
