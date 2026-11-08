import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  OWNER_ACTION_ERRORS,
  OWNER_ACTION_FAILED_TEXT,
  OwnerActionKindSchema,
  OwnerActionResultSchema,
  internalCompanyBoardActionContract as action,
  internalPaperclipOwnerActionContract as paperclip,
  ownerActionConfirmation,
} from '../../../src/http/endpoints/internal-company-board-actions.js';
import { CompanyBoardUnitActionsSchema } from '../../../src/organization/company-board.js';

const uuid = '11111111-1111-4111-8111-111111111111';
const at = '2026-11-08T17:12:00Z';
const common = { tenantId: 't1', ownerId: 'owner-1', projectId: 'p1', buSlug: 'ricerca', clientRequestId: uuid };
const forge = { ...common, directorAgentId: 'dir-1' };
const pc = { ...common, organizationId: 'org1' };
const withKind = (base: object, kind: string, text?: string) => ({ ...base, kind, ...(text === undefined ? {} : { text }) });
const entry = (kind: string, mine = true) => ({ at, kind, text: 'ok', mine });

describe('company board owner actions', () => {
  it('(a1) accepts the four valid requests on both contracts', () => {
    for (const [base, c] of [[forge, action], [pc, paperclip]] as const) {
      expect(c.bodySchema.safeParse(withKind(base, 'sveglia', 'Guarda il report')).success).toBe(true);
      for (const kind of ['via', 'ferma', 'riprendi']) expect(c.bodySchema.safeParse(withKind(base, kind)).success).toBe(true);
    }
  });

  it('(a2) enforces the text rule', () => {
    for (const [base, c] of [[forge, action], [pc, paperclip]] as const) {
      expect(c.bodySchema.safeParse(withKind(base, 'sveglia')).success).toBe(false);
      expect(c.bodySchema.safeParse(withKind(base, 'sveglia', 'x'.repeat(4001))).success).toBe(false);
      expect(c.bodySchema.safeParse(withKind(base, 'sveglia', 'x'.repeat(4000))).success).toBe(true);
      expect(c.bodySchema.safeParse(withKind(base, 'ferma', 'ciao')).success).toBe(false);
    }
  });

  it('(a3) kinds are exactly the keys of the unit actions', () => {
    expect(OwnerActionKindSchema.options).toEqual(Object.keys(CompanyBoardUnitActionsSchema.shape));
    expect(action.bodySchema.safeParse(withKind(forge, 'aggiungi_informazione', 'x')).success).toBe(false);
  });

  it('(a4) is strict about fields and ids', () => {
    const { ownerId: _o, ...noOwner } = forge;
    expect(action.bodySchema.safeParse(withKind(noOwner, 'via')).success).toBe(false);
    expect(action.bodySchema.safeParse(withKind({ ...forge, extra: 1 }, 'via')).success).toBe(false);
    expect(paperclip.bodySchema.safeParse(withKind({ ...pc, extra: 1 }, 'via')).success).toBe(false);
    expect(action.bodySchema.safeParse(withKind({ ...forge, clientRequestId: 'nope' }, 'via')).success).toBe(false);
  });

  it('(a5) closes the error list', () => {
    const err = (error: string, reason: string | null = null) => ({ ok: false, error, reason });
    for (const c of [action, paperclip]) {
      expect(c.responseSchema.safeParse(err('boom')).success).toBe(false);
      expect(c.responseSchema.safeParse(err('not_available', 'Il capo è già fermo')).success).toBe(true);
      for (const e of OWNER_ACTION_ERRORS) expect(c.responseSchema.safeParse(err(e)).success).toBe(true);
    }
  });

  it('(a6) history entry uses the existing types', () => {
    const result = (kind: string, h: string) => ({ ok: true, kind, at, confirmation: 'Fatto', historyEntry: entry(h) });
    expect(OwnerActionResultSchema.safeParse(result('sveglia', 'tipo_nuovo')).success).toBe(false);
    expect(OwnerActionResultSchema.safeParse(result('sveglia', 'passo')).success).toBe(false);
    expect(OwnerActionResultSchema.safeParse({ ...result('via', 'approvazione'), historyEntry: entry('approvazione', false) }).success).toBe(false);
    const pairs = [['sveglia', 'messaggio'], ['via', 'approvazione'], ['ferma', 'passo'], ['riprendi', 'passo']];
    for (const [k, h] of pairs) expect(OwnerActionResultSchema.safeParse(result(k, h)).success).toBe(true);
  });

  it('(a7) confirmations use Rome time and cut long text', () => {
    expect(ownerActionConfirmation('via', '2026-11-08T17:12:00Z')).toBe('Hai dato il via alle 18:12: il reparto riparte');
    expect(ownerActionConfirmation('ferma', '2026-11-08T08:49:00Z')).toBe('Hai fermato il capo alle 9:49');
    expect(ownerActionConfirmation('riprendi', '2026-11-08T08:52:00Z')).toBe('Hai ripreso il capo alle 9:52');
    const long = ownerActionConfirmation('sveglia', at, 'a'.repeat(100));
    expect(long).toBe(`Fatto alle 18:12. Hai svegliato il reparto: ${'a'.repeat(80)}`);
    expect(OWNER_ACTION_FAILED_TEXT).toBe('Non è partito: il reparto non risponde. Riprova.');
  });

  it('(a8) is exported from the CommonJS dist', () => {
    const cjs = createRequire(import.meta.url)('../../../dist/http/endpoints/internal-company-board-actions.cjs');
    expect(cjs.internalCompanyBoardActionContract.path).toBe('/internal/company-board/action');
    expect(cjs.internalPaperclipOwnerActionContract.path).toBe('/internal/paperclip/owner-action');
    expect(typeof cjs.ownerActionConfirmation).toBe('function');
  });
});
