"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paperclipPrefissoAzienda = paperclipPrefissoAzienda;
exports.paperclipPercorsoIncarico = paperclipPercorsoIncarico;
exports.paperclipLinkIncarico = paperclipLinkIncarico;
exports.paperclipPercorsoCommento = paperclipPercorsoCommento;
exports.paperclipIdentificatoriNudi = paperclipIdentificatoriNudi;
const tools_js_1 = require("../paperclip/tools.cjs");
// Paperclip skills/paperclip/SKILL.md:606-657 requires company-prefixed issue links.
const IDENTIFICATORE = new RegExp(`(?<![A-Za-z0-9_])${tools_js_1.PAPERCLIP_ISSUE_IDENTIFIER_PATTERN.source.replace(/^\^|\$$/g, '')}(?![A-Za-z0-9])`, 'g');
/** Extract the company prefix from a valid issue identifier. */
function paperclipPrefissoAzienda(identificatore) {
    if (!tools_js_1.PAPERCLIP_ISSUE_IDENTIFIER_PATTERN.test(identificatore)) {
        throw new Error('Invalid Paperclip issue identifier');
    }
    return identificatore.slice(0, identificatore.lastIndexOf('-'));
}
function paperclipPercorsoIncarico(identificatore) {
    return `/${paperclipPrefissoAzienda(identificatore)}/issues/${identificatore}`;
}
function paperclipLinkIncarico(identificatore) {
    return `[${identificatore}](${paperclipPercorsoIncarico(identificatore)})`;
}
/** Point to a specific comment using Paperclip's comment anchor. */
function paperclipPercorsoCommento(identificatore, commentId) {
    return `${paperclipPercorsoIncarico(identificatore)}#comment-${commentId}`;
}
/** Find unique bare identifiers for this company, excluding Markdown links and code. */
function paperclipIdentificatoriNudi(testo, prefisso) {
    const senzaLink = testo
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`[^`\n]*`/g, ' ')
        .replace(/\[[^\]]*\]\([^)]*\)/g, ' ');
    const trovati = new Set();
    for (const [identificatore] of senzaLink.matchAll(IDENTIFICATORE)) {
        if (identificatore.startsWith(`${prefisso}-`))
            trovati.add(identificatore);
    }
    return [...trovati];
}
//# sourceMappingURL=riferimenti.js.map