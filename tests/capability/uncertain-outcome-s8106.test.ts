import { describe, expect, it } from 'vitest';
import { ToolErrorDispositionSchema, ToolErrorModelReasonSchema } from '../../src/capability/index.js';
import {
  UNCERTAIN_OUTCOME_TOOLS,
  UncertainOutcomeTableSchema,
  UncertainOutcomeToolSchema,
  uncertainOutcome,
  type UncertainOutcomeTool,
} from '../../src/capability/uncertain-outcome.js';

const openEntry = () => UNCERTAIN_OUTCOME_TOOLS.find((entry) => entry.tool === 'dev_session_open')!;

// GOO-380 (22/11 12:37-12:39Z): dev_session_open did not answer within the 120 s ceiling of agent-core while cap-dev kept going and created the session.
describe('s8106 esito incerto di uno strumento', () => {
  it('s8106 regressione-goo-380-esito-incerto-con-la-mossa', () => {
    const { reason, disposition } = uncertainOutcome('dev_session_open', { waitedSeconds: 120 });
    // The sentence the router of ec-x9 (8483) built by hand, now fixed here.
    expect(reason).toBe(
      'esito_incerto: dev_session_open non ha risposto entro 120 s e il suo effetto può essere già avvenuto: '
      + 'l\'incarico può essere nato lo stesso: controlla con dev_session_status (il Director con dev_project_sessions) '
      + 'e, se non c\'è, ripeti la stessa richiesta senza cambiarla: con gli stessi contenuti non ne nasce un secondo',
    );
    expect(disposition).toEqual({ nature: 'technical_failure', retry: 'after_delay', retryAfterSeconds: 60, nextMove: 'retry_same' });
    expect(ToolErrorDispositionSchema.safeParse(disposition).success).toBe(true);
    expect(ToolErrorModelReasonSchema.safeParse(reason).success).toBe(true);
    // Each role reads only its own check.
    const chief = uncertainOutcome('dev_session_open', { waitedSeconds: 120, role: 'chief' }).reason;
    const director = uncertainOutcome('dev_session_open', { waitedSeconds: 120, role: 'director' }).reason;
    expect(chief).toContain('controlla con dev_session_status e,');
    expect(chief).not.toContain('dev_project_sessions');
    expect(director).toContain('controlla con dev_project_sessions e,');
    expect(director).not.toContain('dev_session_status');
    // A tool without an entry gets the generic read-first hint and no disposition.
    const generic = uncertainOutcome('calendar_probe', { waitedSeconds: 120 });
    expect(generic.reason).toBe('esito_incerto: calendar_probe non ha risposto entro 120 s e il suo effetto può essere già avvenuto: prima di ripetere controlla con una lettura se è avvenuto');
    expect(generic.disposition).toBeUndefined();
  });

  it('s8106 a tool whose repeat is not safe says to check and not to repeat, and the form refuses a table that contradicts itself', () => {
    const unsafe: UncertainOutcomeTool = {
      tool: 'email_send', checks: { chief: 'email_inbox', director: 'email_inbox' }, effect: 'la lettera può essere partita lo stesso', repeatSafe: false,
    };
    expect(UncertainOutcomeToolSchema.safeParse(unsafe).success).toBe(true);
    const { reason, disposition } = uncertainOutcome('email_send', { waitedSeconds: 90, table: [unsafe] });
    expect(reason).toContain('entro 90 s');
    expect(reason).toContain('controlla con email_inbox e non ripetere la richiesta prima di averlo verificato');
    expect(disposition).toEqual({ nature: 'technical_failure', retry: 'never', nextMove: 'stop' });
    expect(ToolErrorDispositionSchema.safeParse(disposition).success).toBe(true);
    const open = openEntry();
    const refused: Record<string, unknown>[] = [
      { ...open, ifMissing: undefined },
      { ...unsafe, ifMissing: 'ripeti' },
      { ...open, checks: { ...open.checks, chief: 'dev_session_open' } },
      { ...open, tool: 'Dev-Session' },
      { ...open, extra: true },
      { ...open, checks: { chief: 'dev_session_status' } },
    ];
    for (const entry of refused) expect(UncertainOutcomeToolSchema.safeParse(entry).success, JSON.stringify(entry)).toBe(false);
    expect(UncertainOutcomeTableSchema.safeParse([open, open]).success).toBe(false);
  });

  it('s8106 the table in force is valid, names dev_session_open with its two checks and refuses a wait that is not whole seconds', () => {
    expect(UncertainOutcomeTableSchema.safeParse(UNCERTAIN_OUTCOME_TOOLS).success).toBe(true);
    const open = openEntry();
    expect(open.checks).toEqual({ chief: 'dev_session_status', director: 'dev_project_sessions' });
    expect(open.repeatSafe).toBe(true);
    for (const waitedSeconds of [0, 1.5, -3]) expect(() => uncertainOutcome('dev_session_open', { waitedSeconds })).toThrow();
  });
});
