"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevSessionMaterialLinkSchema = exports.DevSessionMaterialKeySchema = exports.DEV_SESSION_MATERIAL_PATH = void 0;
exports.devSessionMaterialKey = devSessionMaterialKey;
exports.devSessionMaterialSignedMessage = devSessionMaterialSignedMessage;
exports.renderDevSessionMaterialLinks = renderDevSessionMaterialLinks;
exports.parseDevSessionMaterialLinks = parseDevSessionMaterialLinks;
const node_crypto_1 = require("node:crypto");
const zod_1 = require("zod");
const asset_js_1 = require("../../organization/asset.cjs");
exports.DEV_SESSION_MATERIAL_PATH = '/dev/materiali/:chiave';
exports.DevSessionMaterialKeySchema = zod_1.z.string().regex(/^[0-9a-f]{64}$/);
exports.DevSessionMaterialLinkSchema = zod_1.z.strictObject({
    assetId: asset_js_1.AssetRefSchema.shape.assetId,
    sha256: asset_js_1.AssetRefSchema.shape.sha256,
    sizeBytes: asset_js_1.AssetRefSchema.shape.sizeBytes,
    url: zod_1.z.url().refine((url) => url.startsWith('https://'), 'https only'),
    expiresAt: zod_1.z.iso.datetime(),
});
/** Stable key for a memory asset within the complete agent scope. */
function devSessionMaterialKey({ tenantId, ownerId, agentId, assetId, sha256 }) {
    return (0, node_crypto_1.createHash)('sha256').update(JSON.stringify([tenantId, ownerId, agentId, assetId, sha256])).digest('hex');
}
/** UTF-8 message signed and verified by cap-dev; the bridge holds no signing key. */
function devSessionMaterialSignedMessage({ chiave, sha256, expiresAt }) {
    return `materiale|${chiave}|${sha256}|${expiresAt}`;
}
const START = '<!-- x9-dev-materiali v1 -->';
const END = '<!-- /x9-dev-materiali -->';
const LinksSchema = zod_1.z.array(exports.DevSessionMaterialLinkSchema).refine((links) => new Set(links.map((link) => link.assetId)).size === links.length, 'duplicate assetId');
/** Independent section outside the assignment digest. */
function renderDevSessionMaterialLinks(links) {
    const parsed = LinksSchema.parse(links);
    if (parsed.length === 0)
        return '';
    const json = JSON.stringify(parsed).replace(/</g, '\\u003c');
    return [START, '```json', json, '```', END].join('\n');
}
function parseDevSessionMaterialLinks(body) {
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