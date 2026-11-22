"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devSessionAcceptanceCriteriaTexts = devSessionAcceptanceCriteriaTexts;
exports.devSessionAcceptanceReference = devSessionAcceptanceReference;
exports.devSessionContractDocumentKey = devSessionContractDocumentKey;
exports.devSessionContractDocumentBody = devSessionContractDocumentBody;
const session_assignment_js_1 = require("./session-assignment.cjs");
const session_acceptance_templates_js_1 = require("./session-acceptance-templates.cjs");
const wire_documenti_js_1 = require("../paperclip-protocollo/wire-documenti.cjs");
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
/** A stable issue-document key lets consumers create revisions of the same contract. */
function devSessionContractDocumentKey(issueNumber) {
    (0, session_assignment_js_1.devSessionBranch)(issueNumber);
    return wire_documenti_js_1.PaperclipDocumentoChiaveSchema.parse(`contratto-r${issueNumber}`);
}
/** Render the shared human contract; the sealed machine block stays on the session board. */
function devSessionContractDocumentBody(input) {
    const { acceptance, issueNumber, digest, base, deliverableKey } = input;
    const key = devSessionContractDocumentKey(issueNumber);
    if (digest.length !== 64 || !/^[0-9a-f]{64}$/.test(digest))
        throw new Error('digest must be 64 lowercase hexadecimal characters');
    const resolved = (0, session_acceptance_templates_js_1.devSessionRequirements)(acceptance);
    if (!resolved.ok)
        throw new Error(resolved.code);
    // Paperclip expands literal backslash-letter sequences, so normalize every rendered line once.
    const noBackslash = (text) => text.replaceAll('\\', '/');
    const lines = [
        `Impronta: ${digest}`,
        `Modello: ${acceptance.template.id} versione ${acceptance.template.version}`,
        ...(deliverableKey === undefined ? [] : [`Pezzo: ${deliverableKey}`]),
        base === undefined ? 'Base di partenza: ramo principale' : `Base di partenza: ${base.ramo} (commit ${base.commit})`,
    ];
    const thresholds = (0, session_acceptance_templates_js_1.devSessionScoreThresholds)(acceptance);
    if (thresholds !== undefined) {
        // Render selected model data so the human contract and executor cannot disagree on thresholds.
        lines.push(`Soglie dei punteggi: minimo per dimensione ${thresholds.dimensionMin}/4; audit almeno ${thresholds.auditTotalMin}/20; critique almeno ${thresholds.critiqueMin}/${thresholds.critiqueOutOf} in proporzione, con almeno ${thresholds.critiqueMinScored} voci valutate; scarto massimo per dimensione ${thresholds.gapMax}/4.`);
    }
    const taste = (0, session_acceptance_templates_js_1.devSessionTasteThresholds)(acceptance);
    if (taste !== undefined) {
        lines.push(`Soglie del gusto: ogni voce almeno ${taste.itemMin}/4; totale almeno ${taste.totalMin}/24; una voce con un FAIL di Taste al massimo ${taste.itemMaxWithFail}/4.`);
    }
    const shots = (0, session_acceptance_templates_js_1.devSessionDribbbleShotsMin)(acceptance);
    if (shots !== undefined) {
        lines.push(`Giro su Dribbble: almeno ${shots} lavori del dominio aperti prima di Taste e del primo file di interfaccia, in design/riferimenti/DRIBBBLE.md.`);
    }
    const look = acceptance.input.look;
    if (look !== undefined) {
        lines.push(`Da guardare: ${look.kind}`, ...(look.tryPath ?? []).map((step) => `- ${step}`));
    }
    // Filtering preserves contract order within each attestor group, including template criteria.
    for (const group of [
        { title: 'Sessione', attestors: ['sessione'] },
        { title: 'Esecutore', attestors: ['esecutore'] },
        { title: 'Referente/revisore', attestors: ['referente', 'revisore'] },
    ]) {
        lines.push('', `### ${group.title}`);
        for (const criterion of resolved.requirements.filter(({ attestor }) => group.attestors.includes(attestor))) {
            const origin = criterion.reference === undefined ? criterion.origin : `${criterion.origin} (${criterion.reference})`;
            // The final group has two roles: name the actual attestor on each criterion as well.
            lines.push(`- ${criterion.id} — ${criterion.text} — prova: ${criterion.proof} — origine: ${origin} — attesta: ${criterion.attestor}`);
        }
    }
    const title = `Contratto della sessione R${issueNumber}`;
    const body = lines.map(noBackslash).join('\n');
    const changeSummary = `Apertura della sessione R${issueNumber}: contratto con impronta ${digest.slice(0, 12)}`;
    // Reject an oversized document at the shared boundary before any consumer attempts a write.
    wire_documenti_js_1.PaperclipDocumentoScriviCorpoSchema.parse({ title, body, changeSummary, format: 'markdown' });
    return { key, title, body, changeSummary };
}
//# sourceMappingURL=session-acceptance-paperclip.js.map