import { describe, expect, it } from 'vitest';
import * as capability from '../../../src/capability/index.js';
import { paperclipPercorsi } from '../../../src/capability/paperclip-protocollo/percorsi.js';
import {
  PAPERCLIP_ALLEGATI_MASSIMI_PER_COMMENTO,
  PaperclipCommentoCorpoEstesoSchema,
} from '../../../src/capability/paperclip-protocollo/wire-commento.js';
import {
  PAPERCLIP_ATTACHMENT_ALLOWED_TYPES_ENV,
  PAPERCLIP_ATTACHMENT_DEFAULT_ALLOWED_TYPES,
  PAPERCLIP_ATTACHMENT_FORM_FIELD,
  PAPERCLIP_ATTACHMENT_GENERIC_TYPES,
  PAPERCLIP_ATTACHMENT_INLINE_TYPES,
  PAPERCLIP_ATTACHMENT_MAX_BYTES_DEFAULT,
  PAPERCLIP_ATTACHMENT_MAX_BYTES_ENV,
  PaperclipAllegatiSchema,
  PaperclipAllegatoCaricaSchema,
  PaperclipAllegatoContestoSchema,
  PaperclipAllegatoRimossoSchema,
  PaperclipAllegatoSchema,
  PaperclipContestoConAllegatiSchema,
  isPaperclipAttachmentTypeInDefaultList,
  paperclipAllegatoCaricaSchema,
  paperclipAttachmentTypeEssence,
} from '../../../src/capability/paperclip-protocollo/wire-allegati.js';

const companyId = '11111111-1111-4111-8111-111111111111';
const issueId = '22222222-2222-4222-8222-222222222222';
const attachmentId = '33333333-3333-4333-8333-333333333333';
const otherId = '44444444-4444-4444-8444-444444444444';
const upload = { filename: 'desktop.png', contentType: 'image/png', byteSize: 1 };
const row = {
  id: attachmentId, companyId, issueId, issueCommentId: null,
  assetId: otherId, provider: 'local_disk', objectKey: `${companyId}/desktop.png`,
  contentType: 'image/png', byteSize: 182340, sha256: 'a1'.repeat(32),
  originalFilename: 'desktop.png', createdByAgentId: otherId, createdByUserId: null,
  createdAt: '2026-11-18T10:00:00.000Z', updatedAt: '2026-11-18T10:00:00.000Z',
  contentPath: `/api/attachments/${attachmentId}/content`,
  openPath: `/api/attachments/${attachmentId}/content`,
  downloadPath: `/api/attachments/${attachmentId}/content?download=1`,
};
const compact = {
  id: row.id, filename: row.originalFilename, contentType: row.contentType,
  byteSize: row.byteSize, contentPath: row.contentPath, createdAt: row.createdAt,
};

describe('Issue attachments', () => {
  it('s7416_percorsi_esatti', () => {
    expect(paperclipPercorsi.allegati(companyId, issueId))
      .toBe(`/api/companies/${companyId}/issues/${issueId}/attachments`);
    expect(paperclipPercorsi.allegatiIncarico(issueId)).toBe(`/api/issues/${issueId}/attachments`);
    expect(paperclipPercorsi.allegatoContenuto(attachmentId))
      .toBe(`/api/attachments/${attachmentId}/content`);
    expect(paperclipPercorsi.allegatoContenuto(attachmentId, true))
      .toBe(`/api/attachments/${attachmentId}/content?download=1`);
    expect(paperclipPercorsi.allegato(attachmentId)).toBe(`/api/attachments/${attachmentId}`);
    for (const invalid of [`${issueId}/extra`, '..', '', 'not-a-guid']) {
      expect(() => paperclipPercorsi.allegati(invalid, issueId)).toThrow();
      expect(() => paperclipPercorsi.allegati(companyId, invalid)).toThrow();
      expect(() => paperclipPercorsi.allegatiIncarico(invalid)).toThrow();
      expect(() => paperclipPercorsi.allegatoContenuto(invalid)).toThrow();
      expect(() => paperclipPercorsi.allegatoContenuto(invalid, true)).toThrow();
      expect(() => paperclipPercorsi.allegato(invalid)).toThrow();
    }
  });

  it('s7416_descrittore_dell_upload', () => {
    expect(PaperclipAllegatoCaricaSchema.parse(upload)).toEqual(upload);
    expect(PaperclipAllegatoCaricaSchema.safeParse({
      ...upload, byteSize: 10485760, issueCommentId: null,
    }).success).toBe(true);
    expect(PaperclipAllegatoCaricaSchema.safeParse({ ...upload, issueCommentId: otherId }).success).toBe(true);
    for (const invalid of [
      { byteSize: 0 }, { byteSize: 10485761 }, { byteSize: 1.5 },
      { file: 'extra' }, { issueCommentId: 'not-a-guid' },
      { contentType: undefined }, { filename: '' }, { contentType: '' },
    ]) {
      expect(PaperclipAllegatoCaricaSchema.safeParse({ ...upload, ...invalid }).success).toBe(false);
    }
    const larger = paperclipAllegatoCaricaSchema(20 * 1024 * 1024);
    expect(larger.safeParse({ ...upload, byteSize: 15 * 1024 * 1024 }).success).toBe(true);
    expect(larger.safeParse({ ...upload, byteSize: 20 * 1024 * 1024 + 1 }).success).toBe(false);
    // Issue uploads do not enforce the company/chat MIME allowlist.
    expect(PaperclipAllegatoCaricaSchema.safeParse({
      ...upload, contentType: 'application/octet-stream',
    }).success).toBe(true);
  });

  it('s7416_costanti', () => {
    expect(PAPERCLIP_ATTACHMENT_FORM_FIELD).toBe('file');
    expect(PAPERCLIP_ATTACHMENT_MAX_BYTES_DEFAULT).toBe(10485760);
    expect(PAPERCLIP_ATTACHMENT_MAX_BYTES_ENV).toBe('PAPERCLIP_ATTACHMENT_MAX_BYTES');
    expect(PAPERCLIP_ATTACHMENT_ALLOWED_TYPES_ENV).toBe('PAPERCLIP_ALLOWED_ATTACHMENT_TYPES');
  });

  it('s7416_riga_letta', () => {
    expect(PaperclipAllegatoSchema.parse(row)).toEqual(row);
    expect(PaperclipAllegatoSchema.parse({ ...row, futureField: true }).futureField).toBe(true);
    for (const invalid of [
      { downloadPath: `${row.contentPath}?download=true` },
      { contentPath: `/api/attachments/${otherId}/content` },
      { openPath: `/api/attachments/${otherId}/content` },
      { sha256: 'g'.repeat(64) }, { sha256: 'a'.repeat(63) },
      { issueCommentId: undefined },
    ]) {
      expect(PaperclipAllegatoSchema.safeParse({ ...row, ...invalid }).success).toBe(false);
    }
    expect(PaperclipAllegatiSchema.parse([row, { ...row, originatingRunId: null }])).toHaveLength(2);
    expect(PaperclipAllegatiSchema.safeParse([row, { ...row, sha256: 'bad' }]).success).toBe(false);
    expect(PaperclipAllegatoRimossoSchema.parse({ ok: true })).toEqual({ ok: true });
    for (const invalid of [{ ok: false }, {}, { ok: true, extra: true }]) {
      expect(PaperclipAllegatoRimossoSchema.safeParse(invalid).success).toBe(false);
    }
  });

  it('s7416_tipi', () => {
    expect(PAPERCLIP_ATTACHMENT_DEFAULT_ALLOWED_TYPES).toEqual([
      'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
      'image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence',
      'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/webm',
      'application/pdf', 'application/zip',
      'text/markdown', 'text/plain', 'application/json', 'text/csv', 'text/html',
      'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v',
    ]);
    expect(PAPERCLIP_ATTACHMENT_DEFAULT_ALLOWED_TYPES).toHaveLength(31);
    expect(new Set(PAPERCLIP_ATTACHMENT_DEFAULT_ALLOWED_TYPES).size).toBe(31);
    for (const allowed of ['image/png', 'image/jpeg', 'IMAGE/PNG; charset=x']) {
      expect(isPaperclipAttachmentTypeInDefaultList(allowed)).toBe(true);
    }
    for (const rejected of ['image/svg+xml', 'application/octet-stream', '']) {
      expect(isPaperclipAttachmentTypeInDefaultList(rejected)).toBe(false);
    }
    expect(paperclipAttachmentTypeEssence('')).toBe('');
    expect(paperclipAttachmentTypeEssence(' IMAGE/PNG ; charset=x')).toBe('image/png');
    expect(PAPERCLIP_ATTACHMENT_GENERIC_TYPES).toEqual([
      'application/octet-stream', 'binary/octet-stream', 'application/x-binary',
    ]);
    expect(PAPERCLIP_ATTACHMENT_INLINE_TYPES).toEqual([
      'image/*', 'application/pdf', 'text/plain', 'text/markdown', 'application/json', 'text/csv',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v',
    ]);
  });

  it('s7416_contesto_con_allegati', () => {
    const base = { issue: { id: issueId, title: 'Delivery', status: 'in_progress' }, ancestors: [] };
    const context = {
      ...base, attachments: [compact, { ...compact, filename: null, futureField: true }],
      planReviewContext: { revisionId: otherId },
    };
    expect(PaperclipContestoConAllegatiSchema.parse(context)).toEqual(context);
    expect(PaperclipContestoConAllegatiSchema.parse(base)).toEqual(base);
    for (const invalid of [{ contentPath: undefined }, { byteSize: -1 }]) {
      const attachment = { ...compact, ...invalid };
      expect(PaperclipAllegatoContestoSchema.safeParse(attachment).success).toBe(false);
      expect(PaperclipContestoConAllegatiSchema.safeParse({
        ...context, attachments: [compact, attachment],
      }).success).toBe(false);
    }
  });

  it('s7416_esportazioni', () => {
    expect(capability.PaperclipAllegatoSchema).toBe(PaperclipAllegatoSchema);
    expect(capability.paperclipPercorsi.allegati).toBe(paperclipPercorsi.allegati);
    expect(capability.PaperclipAllegatoSchema).toBeDefined();
    expect(capability.paperclipPercorsi.allegati).toBeDefined();
  });

  it('s7416_percorso_intero_del_caso_vero_2', () => {
    const ids = [attachmentId, otherId, '55555555-5555-4555-8555-555555555555'];
    const attachmentIds = ids.map((id, index) => {
      const filename = `screenshot-${index + 1}.png`;
      expect(PaperclipAllegatoCaricaSchema.safeParse({ ...upload, filename }).success).toBe(true);
      return PaperclipAllegatoSchema.parse({
        ...row, id, originalFilename: filename,
        contentPath: paperclipPercorsi.allegatoContenuto(id),
        openPath: paperclipPercorsi.allegatoContenuto(id),
        downloadPath: paperclipPercorsi.allegatoContenuto(id, true),
      }).id;
    });
    expect(PaperclipCommentoCorpoEstesoSchema.parse({ body: 'Evidence attached.', attachmentIds })
      .attachmentIds).toEqual(ids);
    expect(PAPERCLIP_ALLEGATI_MASSIMI_PER_COMMENTO).toBe(20);
    const maximum = Array.from({ length: PAPERCLIP_ALLEGATI_MASSIMI_PER_COMMENTO }, (_, i) =>
      `${String(i + 1).padStart(8, '0')}-1111-4111-8111-111111111111`);
    expect(PaperclipCommentoCorpoEstesoSchema.safeParse({
      body: 'Evidence attached.', attachmentIds: maximum,
    }).success).toBe(true);
    expect(PaperclipCommentoCorpoEstesoSchema.safeParse({
      body: 'Evidence attached.', attachmentIds: [...maximum, otherId],
    }).success).toBe(false);
  });

  it('s7416_nessuna_voce_di_asset_o_chat', () => {
    for (const name of Object.keys(paperclipPercorsi) as (keyof typeof paperclipPercorsi)[]) {
      const path = name === 'documento'
        ? paperclipPercorsi[name](issueId, 'plan')
        : name === 'allegati' || name === 'commento'
          ? paperclipPercorsi[name](companyId, issueId)
          : paperclipPercorsi[name](issueId);
      expect(path, name).not.toMatch(/\/(?:assets|chat)(?:\/|\?|$)/);
    }
  });
});
