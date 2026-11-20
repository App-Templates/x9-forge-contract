import { describe, expect, it } from 'vitest';
import {
  SOCIAL_TOPIC_TITLE_MAX,
  shortenSocialTopicTitle,
} from '../../../src/capability/social-listening/index';

const REAL: Array<[string, string]> = [
  ['Skill di Claude Code e Claude Desktop per creator', 'Skill di Claude Code e Claude'],
  ['MCP: Code Mode e registri/app per agenti', 'MCP: Code Mode e registri/app'],
  ['Mac sveglio e controllato da remoto con Claude', 'Mac sveglio e controllato'],
  ['Pulizia Android TV da pubblicità con coding agent', 'Pulizia Android TV'],
  ['Skill /watch: Claude guarda i video al posto tuo', 'Skill /watch: Claude guarda'],
  ['Weight-space programming (MIT CSAIL) per modelli', 'Weight-space programming'],
  ['Voce clonata e diretta con Fish Audio Drama 3', 'Voce clonata e diretta con Fish'],
  ['Modelli piccoli a risposta immediata su telefono', 'Modelli piccoli a risposta'],
  ['Claude Duet, agente proattivo di coppia per lavoro', 'Claude Duet, agente proattivo'],
  ['Kimi K3.1 Pro: sorprendentemente veloce', 'Kimi K3.1 Pro'],
  ['Claude for Legal con integrazioni complete', 'Claude for Legal'],
  ['Genie 4 di Google DeepMind (world model interattivo)', 'Genie 4 di Google DeepMind'],
  ['Gemini 4 Carbon (Google) con ragionamento esteso', 'Gemini 4 Carbon (Google)'],
];
const LINKING = /(^|\s)(a|ad|al|allo|alla|ai|agli|alle|con|da|dal|dallo|dalla|dai|dagli|dalle|di|del|dello|della|dei|degli|delle|e|ed|il|lo|la|i|gli|le|in|nel|nello|nella|nei|negli|nelle|o|per|su|sul|sullo|sulla|sui|sugli|sulle|tra|fra|un|uno|una|che|come|non)$/i;

describe('shortenSocialTopicTitle closes on a full word', () => {
  it('(a) real MVP titles', () => {
    for (const [input, expected] of REAL) expect(shortenSocialTopicTitle(input)).toBe(expected);
  });

  it('(b) no title is empty, too long, or ends dangling', () => {
    for (const [input] of REAL) {
      const title = shortenSocialTopicTitle(input);
      expect(title.length).toBeGreaterThan(0);
      expect(title.length).toBeLessThanOrEqual(SOCIAL_TOPIC_TITLE_MAX);
      expect(title).not.toMatch(/[:,;.\-–(]$/);
      expect(title).not.toMatch(LINKING);
      expect(title.split('(').length).toBe(title.split(')').length);
    }
  });

  it('(c) titles within the maximum are unchanged', () => {
    expect(shortenSocialTopicTitle('Gemini 4 Carbon (Google)')).toBe('Gemini 4 Carbon (Google)');
  });

  it('(d) capitalised linking words are dropped too', () => {
    expect(shortenSocialTopicTitle('Pulizia Android TV Da pubblicità con coding agent')).toBe('Pulizia Android TV');
    expect(shortenSocialTopicTitle('Pulizia Android TV DI pubblicità con coding agent')).toBe('Pulizia Android TV');
  });

  it('(e) degenerate inputs never throw, never empty, never over the maximum', () => {
    for (const text of ['a'.repeat(40), ':'.repeat(40), 'di da e', '   ', '', 'di da e per con su in tra fra un uno una che']) {
      const title = shortenSocialTopicTitle(text);
      expect(title.length).toBeGreaterThan(0);
      expect(title.length).toBeLessThanOrEqual(SOCIAL_TOPIC_TITLE_MAX);
    }
  });
});
