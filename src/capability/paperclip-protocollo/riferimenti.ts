import { PAPERCLIP_ISSUE_IDENTIFIER_PATTERN } from '../paperclip/tools.js';

// Paperclip skills/paperclip/SKILL.md:606-657 requires company-prefixed issue links.
const IDENTIFICATORE = new RegExp(
  `(?<![A-Za-z0-9_])${PAPERCLIP_ISSUE_IDENTIFIER_PATTERN.source.replace(/^\^|\$$/g, '')}(?![A-Za-z0-9])`,
  'g',
);

/** Extract the company prefix from a valid issue identifier. */
export function paperclipPrefissoAzienda(identificatore: string): string {
  if (!PAPERCLIP_ISSUE_IDENTIFIER_PATTERN.test(identificatore)) {
    throw new Error('Invalid Paperclip issue identifier');
  }
  return identificatore.slice(0, identificatore.lastIndexOf('-'));
}

export function paperclipPercorsoIncarico(identificatore: string): string {
  return `/${paperclipPrefissoAzienda(identificatore)}/issues/${identificatore}`;
}

export function paperclipLinkIncarico(identificatore: string): string {
  return `[${identificatore}](${paperclipPercorsoIncarico(identificatore)})`;
}

/** Point to a specific comment using Paperclip's comment anchor. */
export function paperclipPercorsoCommento(identificatore: string, commentId: string): string {
  return `${paperclipPercorsoIncarico(identificatore)}#comment-${commentId}`;
}

/** Find unique bare identifiers for this company, excluding Markdown links and code. */
export function paperclipIdentificatoriNudi(testo: string, prefisso: string): string[] {
  const senzaLink = testo
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ');
  const trovati = new Set<string>();
  for (const [identificatore] of senzaLink.matchAll(IDENTIFICATORE)) {
    if (identificatore.startsWith(`${prefisso}-`)) trovati.add(identificatore);
  }
  return [...trovati];
}
