import { z } from 'zod';
import {
  OrganizationAdmissionRefusalCodeSchema,
  type OrganizationAdmissionRefusalCode,
} from '../../http/endpoints/internal-agent-turn.js';
import {
  PaperclipControlloSchema,
  PaperclipDisposizioneCorpoSchema,
  type PaperclipDisposizioneCorpo,
} from '../paperclip-protocollo/wire-scritture.js';

/**
 * What stays written on Paperclip when an organization turn ends is decided here and only here: a «not now» refusal
 * (spend cap, R&D pause, infrastructure not ready) is a wait Paperclip re-checks by itself, never a failed run.
 * A turn stopped by a limit while working also schedules a re-check and succeeds, preserving work already done.
 * An unavailable service schedules a cautious re-check; only failed and uncertain ends fail the run.
 */

export type AdmissionRefusalClass = 'definitive' | 'not_now';

/** A code added to ORGANIZATION_ADMISSION_REFUSAL_CODES without a class here does not compile. */
export const ADMISSION_REFUSAL_CLASS = {
  organization_context_missing: 'definitive',
  organization_context_invalid: 'definitive',
  organization_attempt_invalid: 'definitive',
  run_correlation_mismatch: 'definitive',
  issuer_not_authorized: 'definitive',
  context_expired: 'definitive',
  organization_binding_unavailable: 'not_now',
  organization_binding_missing: 'definitive',
  organization_binding_ambiguous: 'definitive',
  tenant_mismatch: 'definitive',
  owner_mismatch: 'definitive',
  agent_identity_mismatch: 'definitive',
  agent_target_mismatch: 'definitive',
  organization_admission_unavailable: 'not_now',
  organization_tenant_unknown: 'definitive',
  budget_exhausted: 'not_now',
  rd_paused: 'not_now',
} as const satisfies Record<OrganizationAdmissionRefusalCode, AdmissionRefusalClass>;

export const NOT_NOW_DEFAULT_RETRY_SECONDS = 3600;
export const INTERRUPTED_RETRY_SECONDS = 1800;
export const LIMIT_WAIT_SERVICE_NAME = 'X9 company spend cap';
const MIN_CHECK_SECONDS = 60;
const CHECK_NOTE_MAX = 500;
const MAX_CHECK_SECONDS = 86_400 * 7;

export const TURN_STOP_CODES = ['budget_exhausted', 'run_expired'] as const;
export const TurnStopCodeSchema = z.enum(TURN_STOP_CODES);
export type TurnStopCode = z.infer<typeof TurnStopCodeSchema>;

export const TURN_FAILURE_CAUSES = [
  'turn_failed',
  'outcome_uncertain',
  'restart_count_unreadable',
  // 1.288.0: a refused or restart-exhausted turn fails the run so Paperclip owns the recovery.
  'admission_refused',
  'restarts_exhausted',
] as const;
export const TurnFailureCauseSchema = z.enum(TURN_FAILURE_CAUSES);
export type TurnFailureCause = z.infer<typeof TurnFailureCauseSchema>;

export const TURN_UNAVAILABLE_CAUSES = [
  'no_response',
  'response_not_conforming',
  'error_without_body',
  'unknown_error_code',
  'status_mismatch',
] as const;
export const TurnUnavailableCauseSchema = z.enum(TURN_UNAVAILABLE_CAUSES);
export type TurnUnavailableCause = z.infer<typeof TurnUnavailableCauseSchema>;

const FAILURE_CODE_NOTE_MAX = 200;
const FAIL_DETAIL_MAX = 2000;

export const TURN_DISPOSITION_TEXT = {
  failedNote: (failureCode: string): string => `Turno fallito: ${failureCode.slice(0, FAILURE_CODE_NOTE_MAX)}.`,
  uncertainNote: (): string =>
    'Esito del turno incerto: non è chiaro se il lavoro è stato fatto. Guarda cosa c\'è già su questo incarico (commenti, file, incarichi aperti) prima di rifare qualcosa.',
  restartCountNote: (): string =>
    'Turno fallito: il conteggio dei riavvii non si legge, quindi non si sa se la corsa è già stata ritentata.',
  unavailableCause: {
    no_response: 'rete, tempo scaduto, redirect o risposta illeggibile o troppo grande',
    response_not_conforming: 'risposta non conforme o di un\'altra corsa',
    error_without_body: 'errore senza corpo leggibile',
    unknown_error_code: 'codice d\'errore sconosciuto',
    status_mismatch: 'stato della risposta incoerente con il suo codice',
  } satisfies Record<TurnUnavailableCause, string>,
  checkNote: (code: OrganizationAdmissionRefusalCode): string => `Non adesso: ${code}. Ricontrollo automatico.`,
  checkNoteWithReason: (code: OrganizationAdmissionRefusalCode, message: string, afterSeconds: number): string =>
    `Non adesso: ${code}. ${message} Ricontrollo automatico tra ${Math.round(afterSeconds / 60)} minuti.`,
  stoppedNote: (code: TurnStopCode): string =>
    `Fermato a metà turno: ${code}. Il lavoro già fatto resta. Ricontrollo automatico.`,
  interruptedNote: (afterSeconds: number, cause?: TurnUnavailableCause): string =>
    `Turno interrotto: il servizio non ha risposto${cause === undefined ? '' : ` (${TURN_DISPOSITION_TEXT.unavailableCause[cause]})`}. Prima di rifare qualcosa guarda cosa è già stato fatto su questo incarico (commenti, file, incarichi aperti) e non ripeterlo. Ricontrollo automatico tra ${Math.round(afterSeconds / 60)} minuti.`,
  notExecutedComment: (): string => 'Non eseguito: R&D in pausa.',
  admissionRefusedNote: (code: OrganizationAdmissionRefusalCode): string =>
    `Turno rifiutato: ${code}. L'agente non può partire: il legame o l'identità vanno corretti; l'incarico resta suo e il recupero è di Paperclip.`,
  // Must start with "Turno interrotto troppe volte": cap-paperclip restarts its restart count from that comment.
  restartsExhaustedNote: (): string =>
    'Turno interrotto troppe volte: le ripartenze sono finite e non riprogrammo più il controllo. Il recupero è di Paperclip, che lo mostra al board se serve.',
  /** No longer produced since 1.288.0; kept so stored `block_for_owner` dispositions stay readable. */
  unblockAction: (code: OrganizationAdmissionRefusalCode): string =>
    `Turno rifiutato: ${code}. Correggere il legame o l'identità dell'agente, poi commentare qui per riaprire.`,
} as const;

export const TurnEndSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('succeeded') }),
  z.strictObject({
    kind: z.literal('refused'),
    code: OrganizationAdmissionRefusalCodeSchema,
    message: z.string().min(1).max(2000).optional(),
    retryAfterSeconds: z.number().int().min(1).max(MAX_CHECK_SECONDS).optional(),
  }),
  z.strictObject({ kind: z.literal('failed'), failureCode: z.string().min(1) }),
  z.strictObject({ kind: z.literal('uncertain') }),
  z.strictObject({ kind: z.literal('unavailable'), cause: TurnUnavailableCauseSchema.optional() }),
  z.strictObject({ kind: z.literal('cancelled') }),
  z.strictObject({
    kind: z.literal('stopped'),
    code: TurnStopCodeSchema,
    retryAfterSeconds: z.number().int().min(1).max(MAX_CHECK_SECONDS).optional(),
  }),
]);
export type TurnEnd = z.infer<typeof TurnEndSchema>;

export const TurnDispositionSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('leave'), runSucceeds: z.literal(true) }),
  z.strictObject({
    kind: z.literal('check_later'),
    runSucceeds: z.literal(true),
    afterSeconds: z.number().int().min(MIN_CHECK_SECONDS).max(MAX_CHECK_SECONDS),
    notes: z.string().min(1).max(CHECK_NOTE_MAX),
    serviceName: PaperclipControlloSchema.shape.serviceName,
  }),
  z.strictObject({ kind: z.literal('close_not_executed'), runSucceeds: z.literal(true), comment: z.string().min(1) }),
  z.strictObject({
    kind: z.literal('block_for_owner'),
    runSucceeds: z.literal(true),
    action: z.string().min(1).max(2000),
  }),
  z.strictObject({
    kind: z.literal('fail_run'),
    runSucceeds: z.literal(false),
    cause: TurnFailureCauseSchema,
    detail: z.string().min(1).max(FAIL_DETAIL_MAX),
  }),
]);
export type TurnDisposition = z.infer<typeof TurnDispositionSchema>;

/** The only way to build a valid `fail_run`: the cause and its text travel together. */
export function turnFailRun(cause: TurnFailureCause, failureCode?: string): Extract<TurnDisposition, { kind: 'fail_run' }> {
  const parsed = TurnFailureCauseSchema.parse(cause);
  let detail: string;
  switch (parsed) {
    case 'turn_failed':
      detail = TURN_DISPOSITION_TEXT.failedNote(failureCode ?? 'sconosciuto');
      break;
    case 'outcome_uncertain':
      detail = TURN_DISPOSITION_TEXT.uncertainNote();
      break;
    case 'restart_count_unreadable':
      detail = TURN_DISPOSITION_TEXT.restartCountNote();
      break;
    case 'admission_refused':
      // The refusal code is mandatory: a text without it would not say why the turn cannot start.
      detail = TURN_DISPOSITION_TEXT.admissionRefusedNote(OrganizationAdmissionRefusalCodeSchema.parse(failureCode));
      break;
    case 'restarts_exhausted':
      detail = TURN_DISPOSITION_TEXT.restartsExhaustedNote();
      break;
  }
  return { kind: 'fail_run', runSucceeds: false, cause: parsed, detail };
}

/** Failed, uncertain and definitively refused ends fail the run; not-now refusals, limit stops and unavailable services never do. */
export function dispositionForTurnEnd(end: TurnEnd): TurnDisposition {
  switch (end.kind) {
    case 'succeeded':
    case 'cancelled':
      return { kind: 'leave', runSucceeds: true };
    case 'refused': {
      if (ADMISSION_REFUSAL_CLASS[end.code] === 'definitive') {
        // A definitive refusal fails the run: a `blocked` issue with only a self-owned descriptor is never woken by Paperclip.
        return turnFailRun('admission_refused', end.code);
      }
      if (end.code === 'rd_paused') {
        return { kind: 'close_not_executed', runSucceeds: true, comment: TURN_DISPOSITION_TEXT.notExecutedComment() };
      }
      const afterSeconds = Math.max(MIN_CHECK_SECONDS, end.retryAfterSeconds ?? NOT_NOW_DEFAULT_RETRY_SECONDS);
      const withReason = end.code === 'budget_exhausted' && end.message !== undefined
        ? TURN_DISPOSITION_TEXT.checkNoteWithReason(end.code, end.message, afterSeconds)
        : undefined;
      return {
        kind: 'check_later',
        runSucceeds: true,
        afterSeconds,
        notes: withReason !== undefined && withReason.length <= CHECK_NOTE_MAX ? withReason : TURN_DISPOSITION_TEXT.checkNote(end.code),
        ...(end.code === 'budget_exhausted' ? { serviceName: LIMIT_WAIT_SERVICE_NAME } : {}),
      };
    }
    case 'stopped':
      return {
        kind: 'check_later',
        runSucceeds: true,
        afterSeconds: Math.max(MIN_CHECK_SECONDS, end.retryAfterSeconds ?? NOT_NOW_DEFAULT_RETRY_SECONDS),
        notes: TURN_DISPOSITION_TEXT.stoppedNote(end.code),
        ...(end.code === 'budget_exhausted' ? { serviceName: LIMIT_WAIT_SERVICE_NAME } : {}),
      };
    case 'unavailable':
      return {
        kind: 'check_later',
        runSucceeds: true,
        afterSeconds: INTERRUPTED_RETRY_SECONDS,
        notes: TURN_DISPOSITION_TEXT.interruptedNote(INTERRUPTED_RETRY_SECONDS, end.cause),
      };
    case 'failed':
      return turnFailRun('turn_failed', end.failureCode);
    case 'uncertain':
      return turnFailRun('outcome_uncertain');
  }
}

/** Read the stored monitor tolerantly: Paperclip adds fields and nullable values to its policy. */
export function waitsOnLimit(policy: unknown): boolean {
  return typeof policy === 'object' && policy !== null && 'monitor' in policy
    && typeof policy.monitor === 'object' && policy.monitor !== null && 'serviceName' in policy.monitor
    && policy.monitor.serviceName === LIMIT_WAIT_SERVICE_NAME;
}

/** The write to make on the Paperclip issue, or null when nothing is written. The time enters only from `ctx.now`. */
export function paperclipBodyForDisposition(
  d: TurnDisposition,
  ctx: { now: Date; agentId: string; currentExecutionPolicy?: Record<string, unknown> | null },
): PaperclipDisposizioneCorpo | null {
  let body: PaperclipDisposizioneCorpo;
  switch (d.kind) {
    case 'leave':
    case 'fail_run':
      return null;
    case 'check_later':
      body = {
        status: 'in_progress',
        executionPolicy: {
          ...(ctx.currentExecutionPolicy ?? {}),
          monitor: {
            nextCheckAt: new Date(ctx.now.getTime() + d.afterSeconds * 1000).toISOString(),
            notes: d.notes,
            ...(d.serviceName !== undefined ? { serviceName: d.serviceName } : {}),
          },
        },
      };
      break;
    case 'close_not_executed':
      body = { status: 'done', comment: d.comment };
      break;
    case 'block_for_owner':
      body = { status: 'blocked', unblockDescriptor: { owner: { agentId: ctx.agentId }, action: d.action } };
      break;
  }
  return PaperclipDisposizioneCorpoSchema.parse(body);
}
