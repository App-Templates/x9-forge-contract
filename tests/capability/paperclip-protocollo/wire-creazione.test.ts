import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_BLOCCHI_CREAZIONE_MASSIMI,
  PAPERCLIP_CORRIERE_DESCRIZIONE_MIN,
  PAPERCLIP_CREAZIONE_STATI,
  PAPERCLIP_CRITERI_MASSIMI,
  PAPERCLIP_CRITERIO_MAX,
  PAPERCLIP_DEDUP_MOTIVI,
  PAPERCLIP_DEDUP_TITOLO_ORE,
  PAPERCLIP_DESCRIZIONE_MAX,
  PAPERCLIP_FIGLI_MASSIMI_PER_PADRE,
  PAPERCLIP_IDEMPOTENZA_CHIAVE_MAX,
  PAPERCLIP_IDEMPOTENZA_GIORNI,
  PAPERCLIP_TITOLO_MAX,
  PaperclipCorriereCorpoSchema,
  PaperclipCreazioneRispostaSchema,
  PaperclipCreazioneStatoSchema,
  PaperclipFiglioCreaCampiSchema,
  PaperclipFiglioCreaCorpoSchema,
  PaperclipIncaricoCampiSchema,
  PaperclipIncaricoCorpoSchema,
  paperclipEsitoCreazione,
  paperclipFiglioAncoraAmmesso,
  paperclipStatoCreazionePredefinito,
} from '../../../src/capability/paperclip-protocollo/wire-creazione.js';
import {
  PAPERCLIP_PRIORITA,
  PAPERCLIP_PRIORITA_PREDEFINITA,
  PaperclipPrioritaSchema,
} from '../../../src/capability/paperclip-protocollo/wire-letture.js';
import { PaperclipFiglioCorpoSchema } from '../../../src/capability/paperclip-protocollo/wire-scritture.js';

const agentId = '33333333-3333-4333-8333-333333333333';
const issueId = '11111111-1111-4111-8111-111111111111';
const goalId = '22222222-2222-4222-8222-222222222222';
const projectId = '44444444-4444-4444-8444-444444444444';
const parentId = '55555555-5555-4555-8555-555555555555';
const title = 'Verify the business unit plan';
const minimal = { title, assigneeAgentId: agentId };
const response = { id: issueId, title, status: 'todo', projectId, identifier: 'BU-12' };
const unblockDescriptor = { owner: { agentId }, action: 'Publish the missing evidence' };
const blockerIds = Array.from({ length: 21 }, (_, index) =>
  `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`);

describe('s7402 creazione-incarico-per-id', () => {
  it('s7402_corpo_azienda_minimo_e_pieno', () => {
    expect(PaperclipIncaricoCorpoSchema.parse(minimal)).toEqual(minimal);
    const full = {
      ...minimal,
      description: 'Review the evidence before approving the plan.',
      projectId,
      goalId: null,
      parentId,
      priority: 'high',
      status: 'backlog',
      idempotencyKey: 'business-unit-plan-1',
      allowDuplicate: true,
    };
    expect(PaperclipIncaricoCorpoSchema.parse(full)).toEqual(full);
    expect(PaperclipIncaricoCampiSchema.parse(full)).toEqual(full);
    expect(PaperclipIncaricoCorpoSchema.parse({ ...minimal, parentId: null }))
      .toEqual({ ...minimal, parentId: null });
    expect(PAPERCLIP_TITOLO_MAX).toBe(240);
    expect(PAPERCLIP_DESCRIZIONE_MAX).toBe(20000);
  });

  it('s7402_destinatario_solo_id', () => {
    for (const schema of [PaperclipIncaricoCorpoSchema, PaperclipFiglioCreaCorpoSchema]) {
      for (const body of [
        { title, assigneeRoleRef: 'rd-lab' },
        { ...minimal, assigneeRoleRef: 'rd-lab' },
        { title, assigneeAgentId: 'director' },
        { title, assigneeAgentId: `${agentId}a` },
      ]) {
        expect(schema.safeParse(body).success).toBe(false);
      }
      const nonVersionedGuid = { title, assigneeAgentId: '12345678-1234-1234-1234-123456789abc' };
      expect(schema.parse(nonVersionedGuid)).toEqual(nonVersionedGuid);
    }
  });

  it('s7402_titolo_o_descrizione', () => {
    for (const schema of [PaperclipIncaricoCorpoSchema, PaperclipFiglioCreaCorpoSchema]) {
      expect(schema.safeParse({ assigneeAgentId: agentId }).success).toBe(false);
      const descriptionOnly = { description: 'Review the evidence.', assigneeAgentId: agentId };
      expect(schema.parse(descriptionOnly)).toEqual(descriptionOnly);
      expect(schema.parse({ title: 't'.repeat(240) })).toEqual({ title: 't'.repeat(240) });
      expect(schema.parse({ description: 'd'.repeat(20000) }))
        .toEqual({ description: 'd'.repeat(20000) });
      for (const body of [
        { title: 't'.repeat(241) },
        { title: '   ' },
        { description: '   ' },
        { description: 'd'.repeat(20001) },
      ]) {
        expect(schema.safeParse(body).success).toBe(false);
      }
    }
  });

  it('s7402_stati_di_creazione_chiusi', () => {
    expect(PAPERCLIP_CREAZIONE_STATI).toEqual(['backlog', 'todo', 'blocked']);
    for (const status of ['backlog', 'todo']) {
      expect(PaperclipCreazioneStatoSchema.parse(status)).toBe(status);
      for (const schema of [PaperclipIncaricoCorpoSchema, PaperclipFiglioCreaCorpoSchema]) {
        expect(schema.parse({ ...minimal, status })).toEqual({ ...minimal, status });
      }
    }
    for (const status of ['in_progress', 'in_review', 'done', 'cancelled', 'fatto']) {
      expect(PaperclipCreazioneStatoSchema.safeParse(status).success).toBe(false);
      for (const schema of [PaperclipIncaricoCorpoSchema, PaperclipFiglioCreaCorpoSchema]) {
        expect(schema.safeParse({ ...minimal, status }).success).toBe(false);
      }
    }
  });

  it('s7402_blocked_richiede_percorso', () => {
    expect(PAPERCLIP_BLOCCHI_CREAZIONE_MASSIMI).toBe(20);
    for (const schema of [PaperclipIncaricoCorpoSchema, PaperclipFiglioCreaCorpoSchema]) {
      expect(schema.safeParse({ ...minimal, status: 'blocked' }).success).toBe(false);
      for (const path of [
        { blockedByIssueIds: [issueId] },
        { unblockDescriptor },
        { blockedByIssueIds: blockerIds.slice(0, 20), unblockDescriptor },
      ]) {
        const body = { ...minimal, status: 'blocked', ...path };
        expect(schema.parse(body)).toEqual(body);
      }
      for (const status of [undefined, 'todo', 'backlog']) {
        expect(schema.safeParse({ ...minimal, status, unblockDescriptor }).success).toBe(false);
      }
      for (const blockedByIssueIds of [[], blockerIds, [issueId, issueId], ['director']]) {
        expect(schema.safeParse({ ...minimal, status: 'blocked', blockedByIssueIds }).success)
          .toBe(false);
      }
    }
  });

  it('s7402_priorita_chiusa', () => {
    expect(PAPERCLIP_PRIORITA).toEqual(['critical', 'high', 'medium', 'low']);
    expect(PAPERCLIP_PRIORITA_PREDEFINITA).toBe('medium');
    const courier = { ...minimal, description: 'd'.repeat(40) };
    for (const priority of ['critical', 'high', 'medium', 'low']) {
      expect(PaperclipPrioritaSchema.parse(priority)).toBe(priority);
      expect(PaperclipIncaricoCorpoSchema.parse({ ...minimal, priority }))
        .toEqual({ ...minimal, priority });
      expect(PaperclipFiglioCreaCorpoSchema.parse({ ...minimal, priority }))
        .toEqual({ ...minimal, priority });
      expect(PaperclipCorriereCorpoSchema.parse({ ...courier, priority }))
        .toEqual({ ...courier, priority });
    }
    for (const priority of ['urgent', 'P1', 1]) {
      expect(PaperclipPrioritaSchema.safeParse(priority).success).toBe(false);
      expect(PaperclipIncaricoCorpoSchema.safeParse({ ...minimal, priority }).success).toBe(false);
      expect(PaperclipFiglioCreaCorpoSchema.safeParse({ ...minimal, priority }).success).toBe(false);
      expect(PaperclipCorriereCorpoSchema.safeParse({ ...courier, priority }).success).toBe(false);
    }
  });

  it('s7402_campi_del_server_rifiutati', () => {
    for (const field of [
      'responsibleUserId', 'createdByUserId', 'createdByAgentId',
      'requestDepth', 'onBehalfOfUserId', 'assigneeUserId',
    ]) {
      const body = { ...minimal, [field]: field === 'requestDepth' ? 1 : agentId };
      expect(PaperclipIncaricoCorpoSchema.safeParse(body).success, field).toBe(false);
      expect(PaperclipFiglioCreaCorpoSchema.safeParse(body).success, field).toBe(false);
      expect(PaperclipCorriereCorpoSchema.safeParse({ ...body, description: 'd'.repeat(40) }).success, field)
        .toBe(false);
    }
  });

  it('s7402_idempotenza', () => {
    expect(PAPERCLIP_IDEMPOTENZA_CHIAVE_MAX).toBe(255);
    expect(PAPERCLIP_IDEMPOTENZA_GIORNI).toBe(7);
    expect(PAPERCLIP_DEDUP_TITOLO_ORE).toBe(48);
    expect(PAPERCLIP_DEDUP_MOTIVI).toEqual(['idempotency_key', 'recent_open_title']);
    for (const schema of [PaperclipIncaricoCorpoSchema, PaperclipFiglioCreaCorpoSchema]) {
      const body = { ...minimal, idempotencyKey: 'k'.repeat(255), allowDuplicate: false };
      expect(schema.parse(body)).toEqual(body);
      for (const idempotencyKey of ['k'.repeat(256), '', '   ']) {
        expect(schema.safeParse({ ...minimal, idempotencyKey }).success).toBe(false);
      }
      expect(schema.safeParse({ ...minimal, allowDuplicate: 'si' }).success).toBe(false);
    }
  });

  it('s7402_figlio', () => {
    expect(PAPERCLIP_CRITERI_MASSIMI).toBe(20);
    expect(PAPERCLIP_CRITERIO_MAX).toBe(500);
    for (const blockParentUntilDone of [true, false]) {
      const child = { ...minimal, acceptanceCriteria: ['a'], blockParentUntilDone };
      expect(PaperclipFiglioCreaCampiSchema.parse(child)).toEqual(child);
      expect(PaperclipFiglioCreaCorpoSchema.parse(child)).toEqual(child);
    }
    expect(PaperclipFiglioCreaCorpoSchema.parse(minimal)).toEqual(minimal);
    const maximum = { ...minimal, acceptanceCriteria: Array.from({ length: 20 }, () => 'a'.repeat(500)) };
    expect(PaperclipFiglioCreaCorpoSchema.parse(maximum)).toEqual(maximum);
    for (const extra of [
      { parentId },
      { parentId: null },
      { acceptanceCriteria: Array.from({ length: 21 }, () => 'a') },
      { acceptanceCriteria: ['a'.repeat(501)] },
      { acceptanceCriteria: [''] },
      { acceptanceCriteria: ['   '] },
      { blockParentUntilDone: 'true' },
    ]) {
      expect(PaperclipFiglioCreaCorpoSchema.safeParse({ ...minimal, ...extra }).success).toBe(false);
    }
  });

  it('s7402_tetto_figli', () => {
    expect(PAPERCLIP_FIGLI_MASSIMI_PER_PADRE).toBe(25);
    expect(paperclipFiglioAncoraAmmesso(0)).toBe(true);
    expect(paperclipFiglioAncoraAmmesso(24)).toBe(true);
    for (const count of [25, 26, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(paperclipFiglioAncoraAmmesso(count)).toBe(false);
    }
  });

  it('s7402_corriere', () => {
    expect(PAPERCLIP_CORRIERE_DESCRIZIONE_MIN).toBe(40);
    const courier = { ...minimal, description: 'd'.repeat(40) };
    expect(PaperclipCorriereCorpoSchema.parse(courier)).toEqual(courier);
    const full = {
      ...courier, status: 'todo', priority: 'high', projectId, goalId: null,
      idempotencyKey: 'lateral-request-1', allowDuplicate: true,
    };
    expect(PaperclipCorriereCorpoSchema.parse(full)).toEqual(full);
    for (const body of [
      { ...courier, description: 'd'.repeat(39) },
      { ...courier, description: ` ${'d'.repeat(39)} ` },
      { ...courier, description: 'd'.repeat(20001) },
      { title, description: courier.description },
      { description: courier.description, assigneeAgentId: agentId },
      { ...courier, assigneeAgentId: 'director' },
      { ...courier, assigneeRoleRef: 'rd-lab' },
      { ...courier, status: 'blocked' },
      { ...courier, status: 'backlog' },
      { ...courier, parentId },
      { ...courier, blockedByIssueIds: [issueId] },
      { ...courier, idempotencyKey: '' },
      { ...courier, idempotencyKey: 'k'.repeat(256) },
      { ...courier, allowDuplicate: 'si' },
    ]) {
      expect(PaperclipCorriereCorpoSchema.safeParse(body).success).toBe(false);
    }
  });

  it('s7402_stato_predefinito', () => {
    expect(paperclipStatoCreazionePredefinito(true)).toBe('todo');
    expect(paperclipStatoCreazionePredefinito(false)).toBe('backlog');
  });

  it('s7402_esito_creazione', () => {
    expect(paperclipEsitoCreazione(201, response))
      .toEqual({ ok: true, nuovo: true, incarico: response });
    for (const reason of ['idempotency_key', 'recent_open_title']) {
      const deduplicated = { ...response, deduplicated: true, deduplicationReason: reason };
      expect(paperclipEsitoCreazione(200, deduplicated))
        .toEqual({ ok: true, nuovo: false, motivo: reason, incarico: deduplicated });
      expect(paperclipEsitoCreazione(201, deduplicated))
        .toEqual({ ok: false, motivo: 'deduplica_incoerente' });
      expect(paperclipEsitoCreazione(500, deduplicated))
        .toEqual({ ok: false, motivo: 'stato_http_inatteso' });
    }
    expect(paperclipEsitoCreazione(200, response))
      .toEqual({ ok: false, motivo: 'deduplica_incoerente' });
    for (const status of [202, 204, 400, 409, 500]) {
      expect(paperclipEsitoCreazione(status, response))
        .toEqual({ ok: false, motivo: 'stato_http_inatteso' });
    }
    for (const invalid of [
      { ...response, deduplicated: true, deduplicationReason: 'same_title' },
      { id: issueId, status: 'todo' },
      null,
    ]) {
      for (const status of [200, 201]) {
        expect(paperclipEsitoCreazione(status, invalid))
          .toEqual({ ok: false, motivo: 'risposta_non_valida' });
      }
    }
  });

  it('s7402_casi_veri', () => {
    const createEventIssue = {
      title, description: 'Review the incoming event and report the outcome.',
      assigneeAgentId: agentId, status: 'todo', parentId, projectId,
    };
    expect(PaperclipIncaricoCorpoSchema.parse(createEventIssue)).toEqual(createEventIssue);
    const createIssue = {
      ...createEventIssue, goalId, blockedByIssueIds: [issueId], status: 'backlog',
    };
    expect(PaperclipIncaricoCorpoSchema.parse(createIssue)).toEqual(createIssue);
    const createChildWaiting = {
      title, description: 'Review the evidence and unblock the parent.',
      assigneeAgentId: agentId, projectId, goalId, blockParentUntilDone: true,
    };
    expect(PaperclipFiglioCreaCorpoSchema.parse(createChildWaiting)).toEqual(createChildWaiting);
    const delegate = {
      title, description: 'Gather the missing evidence for the business unit.',
      assigneeAgentId: agentId, goalId, blockParentUntilDone: true,
    };
    expect(PaperclipFiglioCorpoSchema.parse(delegate)).toEqual(delegate);
    expect(PaperclipFiglioCreaCorpoSchema.parse(delegate)).toEqual(delegate);
  });

  it('s7402_coerenza_figlio_esistente', () => {
    for (const goal of [{}, { goalId: null }, { goalId }]) {
      for (const content of [
        { title, description: 'Complete the delegated work.' },
        { title: '  Delegated work  ', description: '  Gather evidence.  ' },
        { title: 't'.repeat(240), description: 'd'.repeat(20000) },
      ]) {
        const body = { ...content, assigneeAgentId: agentId, blockParentUntilDone: true, ...goal };
        const existing = PaperclipFiglioCorpoSchema.parse(body);
        expect(PaperclipFiglioCreaCorpoSchema.parse(body)).toEqual(existing);
      }
    }
  });

  it('s7402_flag_e_motivo_di_deduplica_insieme', () => {
    expect(PaperclipCreazioneRispostaSchema.parse(response)).toEqual(response);
    for (const reason of ['idempotency_key', 'recent_open_title']) {
      const body = { ...response, deduplicated: true, deduplicationReason: reason };
      expect(PaperclipCreazioneRispostaSchema.parse(body)).toEqual(body);
    }
    for (const flags of [
      { deduplicated: true },
      { deduplicationReason: 'idempotency_key' },
      { deduplicated: false },
      { deduplicated: false, deduplicationReason: 'recent_open_title' },
      { deduplicated: true, deduplicationReason: 'same_title' },
    ]) {
      const body = { ...response, ...flags };
      expect(PaperclipCreazioneRispostaSchema.safeParse(body).success).toBe(false);
      expect(paperclipEsitoCreazione(200, body))
        .toEqual({ ok: false, motivo: 'risposta_non_valida' });
    }
  });
});
