import { devSessionBranch } from "./session-assignment.js";
import { devSessionRequirements } from "./session-acceptance-templates.js";
import { PaperclipDocumentoChiaveSchema, PaperclipDocumentoScriviCorpoSchema, } from "../paperclip-protocollo/wire-documenti.js";
/** Reserve Paperclip's variable criteria slots for the assignment's own list. */
export function devSessionAcceptanceCriteriaTexts(acceptance) {
    return acceptance.criteria.map(({ text }) => text);
}
/** The caller supplies the assignment block digest; this module never hashes it. */
export function devSessionAcceptanceReference(acceptance, issueNumber, digest) {
    devSessionBranch(issueNumber);
    if (digest.length !== 64 || !/^[0-9a-f]{64}$/.test(digest))
        throw new Error('digest must be 64 lowercase hexadecimal characters');
    const resolved = devSessionRequirements(acceptance);
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
export function devSessionContractDocumentKey(issueNumber) {
    devSessionBranch(issueNumber);
    return PaperclipDocumentoChiaveSchema.parse(`contratto-r${issueNumber}`);
}
/** Render the shared human contract; the sealed machine block stays on the session board. */
export function devSessionContractDocumentBody(input) {
    const { acceptance, issueNumber, digest, base, deliverableKey } = input;
    const key = devSessionContractDocumentKey(issueNumber);
    if (digest.length !== 64 || !/^[0-9a-f]{64}$/.test(digest))
        throw new Error('digest must be 64 lowercase hexadecimal characters');
    const resolved = devSessionRequirements(acceptance);
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
    PaperclipDocumentoScriviCorpoSchema.parse({ title, body, changeSummary, format: 'markdown' });
    return { key, title, body, changeSummary };
}
//# sourceMappingURL=session-acceptance-paperclip.js.map