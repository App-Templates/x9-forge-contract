import { describe, expect, it } from 'vitest';
import { DEV_SESSION_CODE_OPENING_MOVES } from '../../../src/capability/dev/session-acceptance.js';

describe('s8285 piece-missing-source', () => {
  it('piece-missing-source: the move says where to take the piece key', () => {
    const entry = DEV_SESSION_CODE_OPENING_MOVES.piece_missing;
    expect(entry.move).toBe(
      'Prendi dal Mandato la chiave della sezione o della voce di alberatura del pezzo da costruire, scrivila nel campo pezzo di dev_session_open e ripeti la richiesta.',
    );
    expect(entry.field).toBe('piece');
    expect(entry.actor).toBe('capo');
    expect(entry.disposition).toEqual({ nature: 'missing_data', retry: 'never', nextMove: 'fix_input' });
  });
});
