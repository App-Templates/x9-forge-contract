import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  DEV_SESSION_MATERIAL_PATH,
  DevSessionMaterialKeySchema,
  DevSessionMaterialLinkSchema,
  devSessionMaterialKey,
  devSessionMaterialSignedMessage,
  parseDevSessionMaterialLinks,
  renderDevSessionMaterialLinks,
} from '../../../src/capability/dev/session-material-link.js';
import {
  devSessionAssignmentCanonicalJson,
  parseDevSessionBlock,
  renderDevSessionBlock,
} from '../../../src/capability/dev/session-assignment.js';

const link = {
  assetId: 'asset-design-1',
  sha256: 'a'.repeat(64),
  sizeBytes: 2048,
  url: `https://dev.example/dev/materiali/${'b'.repeat(64)}?firma=signed`,
  expiresAt: '2026-11-03T18:00:00Z',
};
const section = (value: unknown) => [
  '<!-- x9-dev-materiali v1 -->', '```json', JSON.stringify(value), '```', '<!-- /x9-dev-materiali -->',
].join('\n');

describe('session material links', () => {
  it('round-trips validated links inside the issue body', () => {
    const links = [link, { ...link, assetId: 'asset-design-2' }];
    const rendered = renderDevSessionMaterialLinks(links);
    expect(rendered).toBe(section(links));
    expect(parseDevSessionMaterialLinks(`Task\n\n${rendered}\n\nNotes`)).toEqual({ ok: true, links });
    expect(parseDevSessionMaterialLinks(rendered.replace(/\n/g, '\r\n'))).toEqual({ ok: true, links });
  });

  it('returns no links for existing issue bodies without a section', () => {
    expect(parseDevSessionMaterialLinks('### Incarico\nCostruisci il modulo.')).toEqual({ ok: true, links: [] });
    expect(renderDevSessionMaterialLinks([])).toBe('');
    expect(parseDevSessionMaterialLinks('')).toEqual({ ok: true, links: [] });
    expect(parseDevSessionMaterialLinks(section([]))).toEqual({ ok: true, links: [] });
  });

  it('rejects duplicate sections instead of selecting one', () => {
    const rendered = renderDevSessionMaterialLinks([link]);
    expect(parseDevSessionMaterialLinks(`${rendered}\n\n${rendered}`)).toEqual({ ok: false, reason: 'multiple' });
  });

  it('rejects broken JSON', () => {
    expect(parseDevSessionMaterialLinks(section([link]).replace(JSON.stringify([link]), '[broken')))
      .toEqual({ ok: false, reason: 'invalid_json' });
  });

  it.each([
    ['http URL', { ...link, url: 'http://dev.example/material' }],
    ['short sha256', { ...link, sha256: 'abc' }],
    ['extra field', { ...link, origin: 'email' }],
    ['invalid assetId', { ...link, assetId: 'bad' }],
    ['negative size', { ...link, sizeBytes: -1 }],
    ['fractional size', { ...link, sizeBytes: 1.5 }],
    ['invalid expiry', { ...link, expiresAt: 'tomorrow' }],
  ])('rejects %s in both reading and rendering', (_label, invalid) => {
    expect(DevSessionMaterialLinkSchema.safeParse(invalid).success).toBe(false);
    expect(parseDevSessionMaterialLinks(section([invalid]))).toEqual({ ok: false, reason: 'invalid_links' });
    expect(() => renderDevSessionMaterialLinks([invalid])).toThrow();
  });

  it('rejects duplicate assetId even when the URLs differ', () => {
    const links = [link, { ...link, url: 'https://dev.example/other' }];
    expect(parseDevSessionMaterialLinks(section(links))).toEqual({ ok: false, reason: 'invalid_links' });
    expect(() => renderDevSessionMaterialLinks(links)).toThrow();
  });

  it.each([
    section([link]).replace('```json', '```text'),
    section([link]).replace('\n```\n', '\n'),
    section([link]).replace('<!-- /x9-dev-materiali -->', ''),
    '<!-- /x9-dev-materiali -->',
  ])('rejects a malformed section: %s', (body) => {
    expect(parseDevSessionMaterialLinks(body)).toEqual({ ok: false, reason: 'malformed' });
  });

  it('rejects JSON that is not an array', () => {
    expect(parseDevSessionMaterialLinks(section(link))).toEqual({ ok: false, reason: 'invalid_links' });
  });

  it('keeps material sections outside the verified assignment digest', () => {
    const assignment = {
      version: 1,
      tenantId: 'tenant-1',
      ownerId: '7',
      organizationId: 'good-choice',
      companyId: 'good-choice',
      projectId: 'good-choice-app',
      businessUnit: { slug: 'sviluppo' },
      requestedBy: { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 },
      productKind: 'code',
      title: 'Modulo A: scansione prodotto',
      task: 'Costruisci il Modulo A come PWA con test.',
      miniPlan: '1. Struttura. 2. Scansione. 3. Test.',
      materials: [{
        kind: 'asset',
        asset: {
          assetId: link.assetId, sha256: link.sha256, sizeBytes: link.sizeBytes,
          name: 'home.png', mediaType: 'image/png',
          origin: { kind: 'email', messageId: 'msg-1', attachmentName: 'home.png' },
          tenantId: 'tenant-1', companyId: 'good-choice', projectId: 'good-choice-app',
          createdAt: '2026-11-03T10:00:00Z',
        },
      }],
      destination: { repo: 'App-Templates/goodchoice-backtest' },
      createdAt: '2026-11-03T10:00:00Z',
    };
    const digest = createHash('sha256').update(devSessionAssignmentCanonicalJson(assignment)).digest('hex');
    const block = renderDevSessionBlock(assignment, digest);
    const body = `${block}\n\n${renderDevSessionMaterialLinks([link])}`;
    expect(parseDevSessionBlock(body)).toEqual({ ok: true, assignment, digest });
    expect(parseDevSessionBlock(body)).toEqual(parseDevSessionBlock(block));
    expect(parseDevSessionMaterialLinks(body)).toEqual({ ok: true, links: [link] });
  });
});

describe('material identity and signing message', () => {
  const identity = { tenantId: 'tenant-1', ownerId: '7', agentId: 'capo-sviluppo', assetId: link.assetId, sha256: link.sha256 };

  it('uses the specified route and hashes the ordered JSON tuple', () => {
    expect(DEV_SESSION_MATERIAL_PATH).toBe('/dev/materiali/:chiave');
    const expected = createHash('sha256').update(JSON.stringify([
      identity.tenantId, identity.ownerId, identity.agentId, identity.assetId, identity.sha256,
    ])).digest('hex');
    expect(devSessionMaterialKey(identity)).toBe(expected);
    expect(DevSessionMaterialKeySchema.safeParse(expected).success).toBe(true);
  });

  it.each(['tenantId', 'ownerId', 'agentId', 'assetId', 'sha256'] as const)('changes the key when %s changes', (field) => {
    const changed = { ...identity, [field]: field === 'sha256' ? 'b'.repeat(64) : `${identity[field]}-other` };
    expect(devSessionMaterialKey(changed)).not.toBe(devSessionMaterialKey(identity));
  });

  it.each(['', 'abc', 'a'.repeat(63), 'a'.repeat(65), 'A'.repeat(64), 'g'.repeat(64)])('rejects invalid material key %s', (key) => {
    expect(DevSessionMaterialKeySchema.safeParse(key).success).toBe(false);
  });

  it('signs exactly the material key, digest and expiry in order', () => {
    const chiave = devSessionMaterialKey(identity);
    expect(devSessionMaterialSignedMessage({ chiave, sha256: link.sha256, expiresAt: link.expiresAt }))
      .toBe(`materiale|${chiave}|${link.sha256}|${link.expiresAt}`);
  });
});
