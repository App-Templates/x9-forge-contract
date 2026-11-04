import { createHash } from 'node:crypto';
import { z } from 'zod';
import { AssetRefSchema } from "../../organization/asset.js";
export const DEV_SESSION_MATERIAL_PATH = '/dev/materiali/:chiave';
export const DevSessionMaterialKeySchema = z.string().regex(/^[0-9a-f]{64}$/);
export const DevSessionMaterialLinkSchema = z.strictObject({
    assetId: AssetRefSchema.shape.assetId,
    sha256: AssetRefSchema.shape.sha256,
    sizeBytes: AssetRefSchema.shape.sizeBytes,
    url: z.url().refine((url) => url.startsWith('https://'), 'https only'),
    expiresAt: z.iso.datetime(),
});
/** Stable key for a memory asset within the complete agent scope. */
export function devSessionMaterialKey({ tenantId, ownerId, agentId, assetId, sha256 }) {
    return createHash('sha256').update(JSON.stringify([tenantId, ownerId, agentId, assetId, sha256])).digest('hex');
}
/** UTF-8 message signed and verified by cap-dev; the bridge holds no signing key. */
export function devSessionMaterialSignedMessage({ chiave, sha256, expiresAt }) {
    return `materiale|${chiave}|${sha256}|${expiresAt}`;
}
const START = '<!-- x9-dev-materiali v1 -->';
const END = '<!-- /x9-dev-materiali -->';
const LinksSchema = z.array(DevSessionMaterialLinkSchema).refine((links) => new Set(links.map((link) => link.assetId)).size === links.length, 'duplicate assetId');
/** Independent section outside the assignment digest. */
export function renderDevSessionMaterialLinks(links) {
    const parsed = LinksSchema.parse(links);
    if (parsed.length === 0)
        return '';
    const json = JSON.stringify(parsed).replace(/</g, '\\u003c');
    return [START, '```json', json, '```', END].join('\n');
}
export function parseDevSessionMaterialLinks(body) {
    const lines = body.replace(/\r\n/g, '\n').split('\n');
    const starts = lines.flatMap((line, index) => line === START ? [index] : []);
    const ends = lines.flatMap((line, index) => line === END ? [index] : []);
    if (starts.length > 1 || ends.length > 1)
        return { ok: false, reason: 'multiple' };
    if (starts.length === 0 && ends.length === 0)
        return { ok: true, links: [] };
    const start = starts[0];
    const end = ends[0];
    if (start === undefined || end === undefined || end < start + 4
        || lines[start + 1] !== '```json' || lines[end - 1] !== '```') {
        return { ok: false, reason: 'malformed' };
    }
    let value;
    try {
        value = JSON.parse(lines.slice(start + 2, end - 1).join('\n'));
    }
    catch {
        return { ok: false, reason: 'invalid_json' };
    }
    const parsed = LinksSchema.safeParse(value);
    if (!parsed.success)
        return { ok: false, reason: 'invalid_links' };
    return { ok: true, links: parsed.data };
}
//# sourceMappingURL=session-material-link.js.map