import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  VIDEO_FOOTAGE_MAX_PER_PERSON,
  VideoFootageRejectionReasonSchema,
  VideoFootageSyncReasonSchema,
  VideoFootageSyncResponseSchema,
  VideoFootageSyncToolInputSchema,
} from '../../../src/capability/video/index.js';

const folderUrl = 'https://drive.google.com/drive/folders/18Mq8g9pJfX0mBoYG_g0X7rPMNSN7er08';
const folderId = '18Mq8g9pJfX0mBoYG_g0X7rPMNSN7er08';
const file = (name: string, n: number, extra: Record<string, unknown>) => ({ driveFileId: `drive-file-id-${n}00`, name, ...extra });
const files = [
  file('ufficio.mp4', 1, { status: 'gia_nell_archivio' }),
  file('piscina-largo.mp4', 2, { status: 'gia_nell_archivio' }),
  file('piante.mp4', 3, { status: 'gia_nell_archivio' }),
  file('piscina-stretto.mp4', 4, { status: 'gia_nell_archivio' }),
  file('piscina-5.mp4', 5, { status: 'aggiunta', footageId: 'piscina-05' }),
  file('buio.mp4', 6, { status: 'rifiutata', reason: 'senza_volto' }),
  file('enorme.mp4', 7, { status: 'rifiutata', reason: 'troppo_grande' }),
  file('nuova.mp4', 8, { status: 'in_coda' }),
];
const base = { outcome: 'sincronizzata', person: 'stefano', folderId, limit: 20, counted: 5, files };
const withFile = (f: Record<string, unknown>) => ({ ...base, files: [file('x.mp4', 9, f)] });

describe('video_footage_sync input', () => {
  it('accepts person alone or with a folder', () => {
    expect(VideoFootageSyncToolInputSchema.safeParse({ person: 'stefano' }).success).toBe(true);
    expect(VideoFootageSyncToolInputSchema.safeParse({ person: 'stefano', folder: folderUrl }).success).toBe(true);
  });
  it.each([
    ['extra tenantId', { person: 'stefano', tenantId: 't' }],
    ['uppercase person', { person: 'Stefano' }],
    ['path person', { person: '../x' }],
    ['short folder', { person: 'stefano', folder: '123456789' }],
  ])('rejects %s', (_n, input) => {
    expect(VideoFootageSyncToolInputSchema.safeParse(input).success).toBe(false);
  });
  it('describes person and folder in the JSON schema', () => {
    const js = z.toJSONSchema(VideoFootageSyncToolInputSchema) as { properties: Record<string, { description?: string }> };
    expect(js.properties.person?.description).toContain('Chi è ripreso');
    expect(js.properties.folder?.description).toContain('Google Drive');
  });
});

describe('video_footage_sync response', () => {
  it('accepts a synced folder with one status per file', () => {
    expect(VideoFootageSyncResponseSchema.safeParse(base).success).toBe(true);
  });
  it.each([
    ['aggiunta without footageId', withFile({ status: 'aggiunta' })],
    ['rifiutata without reason', withFile({ status: 'rifiutata' })],
    ['in_coda with reason', withFile({ status: 'in_coda', reason: 'doppione' })],
    ['gia_nell_archivio with footageId', withFile({ status: 'gia_nell_archivio', footageId: 'piscina-05' })],
    ['limit 21', { ...base, limit: 21 }],
    ['counted 21', { ...base, counted: 21 }],
    ['unknown reason', withFile({ status: 'rifiutata', reason: 'altro' })],
    ['extra field', { ...base, extra: 1 }],
  ])('rejects %s', (_n, input) => {
    expect(VideoFootageSyncResponseSchema.safeParse(input).success).toBe(false);
  });
  it('covers over-the-cap, Google and unreadable folder outcomes', () => {
    const ok = (v: unknown) => VideoFootageSyncResponseSchema.safeParse(v).success;
    expect(ok({ outcome: 'oltre_il_tetto', person: 'stefano', folderId, limit: 20, counted: 18, newFiles: 3 })).toBe(true);
    expect(ok({ outcome: 'serve_google', permission: 'drive_read', reason: 'scope_missing' })).toBe(true);
    expect(ok({ outcome: 'serve_google', permission: 'drive_read', reason: 'person_not_determinable' })).toBe(true);
    expect(ok({ outcome: 'serve_google', permission: 'calendar_events', reason: 'scope_missing' })).toBe(false);
    expect(ok({ outcome: 'cartella_illeggibile', reason: 'non_trovata' })).toBe(true);
  });
  it('pins reasons and the cap', () => {
    expect(VideoFootageSyncReasonSchema.options).toEqual([...VideoFootageRejectionReasonSchema.options, 'troppo_grande', 'non_video']);
    expect(VideoFootageRejectionReasonSchema.options).toHaveLength(6);
    expect(VIDEO_FOOTAGE_MAX_PER_PERSON).toBe(20);
  });
});
