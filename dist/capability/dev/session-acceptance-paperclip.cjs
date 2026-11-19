"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devSessionAcceptanceCriteriaTexts = devSessionAcceptanceCriteriaTexts;
exports.devSessionAcceptanceReference = devSessionAcceptanceReference;
const session_assignment_js_1 = require("./session-assignment.cjs");
const session_acceptance_templates_js_1 = require("./session-acceptance-templates.cjs");
/** Reserve Paperclip's variable criteria slots for the assignment's own list. */
function devSessionAcceptanceCriteriaTexts(acceptance) {
    return acceptance.criteria.map(({ text }) => text);
}
/** The caller supplies the assignment block digest; this module never hashes it. */
function devSessionAcceptanceReference(acceptance, issueNumber, digest) {
    (0, session_assignment_js_1.devSessionBranch)(issueNumber);
    if (digest.length !== 64 || !/^[0-9a-f]{64}$/.test(digest))
        throw new Error('digest must be 64 lowercase hexadecimal characters');
    const resolved = (0, session_acceptance_templates_js_1.devSessionRequirements)(acceptance);
    if (!resolved.ok)
        throw new Error(resolved.code);
    return [
        `Contratto di accettazione dell'incarico di sessione #${issueNumber}, impronta ${digest}`,
        `Modello: ${acceptance.template.id} versione ${acceptance.template.version}`,
        'Criteri di forma:',
        ...resolved.requirements.filter(({ origin }) => origin === 'modello').map(({ id, attestor, text }) => `- ${id} (${attestor}): ${text}`),
    ].join('\n');
}
//# sourceMappingURL=session-acceptance-paperclip.js.map