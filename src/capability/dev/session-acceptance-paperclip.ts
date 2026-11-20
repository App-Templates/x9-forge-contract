import type { DevSessionAcceptance } from './session-acceptance.js';
import { devSessionBranch } from './session-assignment.js';
import { devSessionRequirements } from './session-acceptance-templates.js';

/** Reserve Paperclip's variable criteria slots for the assignment's own list. */
export function devSessionAcceptanceCriteriaTexts(acceptance: DevSessionAcceptance): string[] {
  return acceptance.criteria.map(({ text }) => text);
}

/** The caller supplies the assignment block digest; this module never hashes it. */
export function devSessionAcceptanceReference(acceptance: DevSessionAcceptance, issueNumber: number, digest: string): string {
  devSessionBranch(issueNumber);
  if (digest.length !== 64 || !/^[0-9a-f]{64}$/.test(digest)) throw new Error('digest must be 64 lowercase hexadecimal characters');
  const resolved = devSessionRequirements(acceptance);
  if (!resolved.ok) throw new Error(resolved.code);
  return [
    `Contratto di accettazione dell'incarico di sessione #${issueNumber}, impronta ${digest}`,
    `Modello: ${acceptance.template.id} versione ${acceptance.template.version}`,
    'Criteri di forma:',
    ...resolved.requirements.filter(({ origin }) => origin === 'modello').map(({ id, attestor, text }) => `- ${id} (${attestor}): ${text}`),
  ].join('\n');
}
