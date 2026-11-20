import type { DevSessionAcceptance } from "./session-acceptance.js";
/** Reserve Paperclip's variable criteria slots for the assignment's own list. */
export declare function devSessionAcceptanceCriteriaTexts(acceptance: DevSessionAcceptance): string[];
/** The caller supplies the assignment block digest; this module never hashes it. */
export declare function devSessionAcceptanceReference(acceptance: DevSessionAcceptance, issueNumber: number, digest: string): string;
//# sourceMappingURL=session-acceptance-paperclip.d.ts.map