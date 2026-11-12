import { describe, expect, it } from 'vitest';
import { InternalAgentToolDispatchResponseSchema } from '../../src/http/endpoints/internal-agent-tool-dispatch.js';
import {
  TOOL_ERROR_NATURES,
  TOOL_ERROR_NEXT_MOVES,
  TOOL_ERROR_RETRIES,
  ToolCallResponseSchema,
  ToolErrorDispositionSchema,
  renderToolErrorDisposition,
  toolErrorDispositionOf,
  type ToolErrorDisposition,
} from '../../src/capability/index.js';

describe('s6340 esito-fisso: a tool error may carry a fixed disposition (nature, retry, nextMove); never-retry cannot be combined with retry_same, after_delay requires retryAfterSeconds, and renderToolErrorDisposition gives the same sentence for the same disposition', () => {
  it('renders the exact fixed sentences', () => {
    expect(renderToolErrorDisposition({ nature: 'permission_refused', retry: 'never', nextMove: 'ask_owner' }))
      .toBe('Rifiuto di permesso: qui questo strumento non ti è consentito. Non ripetere la stessa chiamata. Chiedi al proprietario.');
    expect(renderToolErrorDisposition({ nature: 'technical_failure', retry: 'after_delay', retryAfterSeconds: 900, nextMove: 'retry_same' }))
      .toBe('Guasto tecnico: non è un annullamento né un rifiuto. Puoi ripetere la stessa chiamata fra 900 secondi. Ripetila senza cambiare nulla.');
    expect(renderToolErrorDisposition({ nature: 'missing_data', retry: 'never', nextMove: 'fix_input' }))
      .toBe('Manca un dato necessario. Non ripetere la stessa chiamata. Correggi i dati e richiama.');
  });

  it('rejects incoherent or malformed dispositions', () => {
    const bad: unknown[] = [
      { nature: 'technical_failure', retry: 'never', nextMove: 'retry_same' },
      { nature: 'technical_failure', retry: 'next_turn', nextMove: 'stop' },
      { nature: 'technical_failure', retry: 'after_delay', nextMove: 'retry_same' },
      { nature: 'missing_data', retry: 'never', retryAfterSeconds: 5, nextMove: 'fix_input' },
      { nature: 'permission_refused', retry: 'next_turn', nextMove: 'retry_same' },
      { nature: 'missing_data', retry: 'never', nextMove: 'fix_input', extra: 1 },
      { nature: 'invented', retry: 'never', nextMove: 'stop' },
      { nature: 'limit_reached', retry: 'never', nextMove: 'invented' },
    ];
    for (const candidate of bad) expect(ToolErrorDispositionSchema.safeParse(candidate).success).toBe(false);
    expect(() => renderToolErrorDisposition(bad[0] as ToolErrorDisposition)).toThrow();
  });

  it('gives one stable single-line sentence for every valid combination', () => {
    let valid = 0;
    for (const nature of TOOL_ERROR_NATURES) for (const retry of TOOL_ERROR_RETRIES) for (const nextMove of TOOL_ERROR_NEXT_MOVES) {
      const candidate = { nature, retry, nextMove, ...(retry === 'after_delay' ? { retryAfterSeconds: 60 } : {}) };
      if (!ToolErrorDispositionSchema.safeParse(candidate).success) continue;
      valid += 1;
      const sentence = renderToolErrorDisposition(candidate);
      expect(sentence).not.toMatch(/[\u0000-\u001f\u007f]/);
      expect(sentence.length).toBeLessThanOrEqual(300);
      expect(renderToolErrorDisposition({ ...candidate })).toBe(sentence);
      if (retry === 'never') expect(sentence).not.toContain('Ripetila');
    }
    expect(valid).toBeGreaterThan(0);
  });

  it('reads the disposition only from error bodies and never throws', () => {
    const disposition = { nature: 'cancelled', retry: 'never', nextMove: 'stop' } as const;
    const base = { callId: 'c1', error: 'x', code: 'TOOL_EXEC_FAILED' };
    expect(toolErrorDispositionOf({ ...base, status: 'error', disposition })).toEqual(disposition);
    expect(toolErrorDispositionOf({ callId: 'c1', status: 'success', output: 1, disposition })).toBeUndefined();
    expect(toolErrorDispositionOf({ ...base, status: 'error', disposition: { nature: 'cancelled' } })).toBeUndefined();
    expect(toolErrorDispositionOf({ status: 'error', get disposition(): unknown { throw new Error('boom'); } })).toBeUndefined();
    expect(toolErrorDispositionOf(null)).toBeUndefined();
  });

  it('keeps today\'s stored error bodies valid and the strict dispatch schema strict', () => {
    const today = { callId: 'c1', status: 'error', error: 'director_only', code: 'TOOL_EXEC_FAILED' };
    expect(ToolCallResponseSchema.parse(today)).toEqual(today);
    const withReason = { ...today, modelReason: 'email_esito_incerto: la mail potrebbe essere partita: non rimandarla, controlla con email_read prima di riprovare' };
    expect(ToolCallResponseSchema.parse(withReason)).toEqual(withReason);
    const withDisposition = { ...today, disposition: { nature: 'permission_refused', retry: 'never', nextMove: 'ask_director' } };
    expect(InternalAgentToolDispatchResponseSchema.safeParse(withDisposition).success).toBe(true);
    expect(InternalAgentToolDispatchResponseSchema.safeParse({ ...today, unknownKey: 1 }).success).toBe(false);
  });
});
