import { z } from 'zod';
import {
  OrganizationAdmissionRefusalCodeSchema,
  type OrganizationAdmissionRefusalCode,
} from '../../http/endpoints/internal-agent-turn.js';
import type { PaperclipDisposizioneCorpo } from '../paperclip-protocollo/wire-scritture.js';

/**
 * What stays written on Paperclip when an organization turn ends is decided here and only here: a «not now» refusal
 * (spend cap, R&D pause, infrastructure not ready) is a wait Paperclip re-checks by itself, never a failed run.
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
const MIN_CHECK_SECONDS = 60;
const MAX_CHECK_SECONDS = 86_400 * 7;

export const TURN_DISPOSITION_TEXT = {
  checkNote: (code: OrganizationAdmissionRefusalCode): string => `Non adesso: ${code}. Ricontrollo automatico.`,
  notExecutedComment: (): string => 'Non eseguito: R&D in pausa.',
  unblockAction: (code: OrganizationAdmissionRefusalCode): string =>
    `Turno rifiutato: ${code}. Correggere il legame o l'identità dell'agente, poi commentare qui per riaprire.`,
} as const;

export const TurnEndSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('succeeded') }),
  z.strictObject({
    kind: z.literal('refused'),
    code: OrganizationAdmissionRefusalCodeSchema,
    retryAfterSeconds: z.number().int().min(1).max(MAX_CHECK_SECONDS).optional(),
  }),
  z.strictObject({ kind: z.literal('failed'), failureCode: z.string().min(1) }),
  z.strictObject({ kind: z.literal('uncertain') }),
  z.strictObject({ kind: z.literal('unavailable') }),
  z.strictObject({ kind: z.literal('cancelled') }),
]);
export type TurnEnd = z.infer<typeof TurnEndSchema>;

export const TurnDispositionSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('leave'), runSucceeds: z.literal(true) }),
  z.strictObject({
    kind: z.literal('check_later'),
    runSucceeds: z.literal(true),
    afterSeconds: z.number().int().min(MIN_CHECK_SECONDS).max(MAX_CHECK_SECONDS),
    notes: z.string().min(1).max(500),
  }),
  z.strictObject({ kind: z.literal('close_not_executed'), runSucceeds: z.literal(true), comment: z.string().min(1) }),
  z.strictObject({
    kind: z.literal('block_for_owner'),
    runSucceeds: z.literal(true),
    action: z.string().min(1).max(2000),
  }),
  z.strictObject({ kind: z.literal('fail_run'), runSucceeds: z.literal(false) }),
]);
export type TurnDisposition = z.infer<typeof TurnDispositionSchema>;

/** Only failed, uncertain and unavailable ends fail the run; a refusal never does. */
export function dispositionForTurnEnd(end: TurnEnd): TurnDisposition {
  switch (end.kind) {
    case 'succeeded':
    case 'cancelled':
      return { kind: 'leave', runSucceeds: true };
    case 'refused': {
      if (ADMISSION_REFUSAL_CLASS[end.code] === 'definitive') {
        return { kind: 'block_for_owner', runSucceeds: true, action: TURN_DISPOSITION_TEXT.unblockAction(end.code) };
      }
      if (end.code === 'rd_paused') {
        return { kind: 'close_not_executed', runSucceeds: true, comment: TURN_DISPOSITION_TEXT.notExecutedComment() };
      }
      return {
        kind: 'check_later',
        runSucceeds: true,
        afterSeconds: Math.max(MIN_CHECK_SECONDS, end.retryAfterSeconds ?? NOT_NOW_DEFAULT_RETRY_SECONDS),
        notes: TURN_DISPOSITION_TEXT.checkNote(end.code),
      };
    }
    case 'failed':
    case 'uncertain':
    case 'unavailable':
      return { kind: 'fail_run', runSucceeds: false };
  }
}

/** The write to make on the Paperclip issue, or null when nothing is written. The time enters only from `ctx.now`. */
export function paperclipBodyForDisposition(
  d: TurnDisposition,
  ctx: { now: Date; agentId: string },
): PaperclipDisposizioneCorpo | null {
  switch (d.kind) {
    case 'leave':
    case 'fail_run':
      return null;
    case 'check_later':
      return {
        status: 'in_progress',
        executionPolicy: {
          monitor: {
            nextCheckAt: new Date(ctx.now.getTime() + d.afterSeconds * 1000).toISOString(),
            notes: d.notes,
          },
        },
      };
    case 'close_not_executed':
      return { status: 'done', comment: d.comment };
    case 'block_for_owner':
      return { status: 'blocked', unblockDescriptor: { owner: { agentId: ctx.agentId }, action: d.action } };
  }
}
