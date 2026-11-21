import type { DevSessionAcceptance } from "./session-acceptance.js";
import { type DevSessionBase } from "./session-assignment.js";
/** Reserve Paperclip's variable criteria slots for the assignment's own list. */
export declare function devSessionAcceptanceCriteriaTexts(acceptance: DevSessionAcceptance): string[];
/** The caller supplies the assignment block digest; this module never hashes it. */
export declare function devSessionAcceptanceReference(acceptance: DevSessionAcceptance, issueNumber: number, digest: string): string;
/** A stable issue-document key lets consumers create revisions of the same contract. */
export declare function devSessionContractDocumentKey(issueNumber: number): string;
/** Render the shared human contract; the sealed machine block stays on the session board. */
export declare function devSessionContractDocumentBody(input: {
    acceptance: DevSessionAcceptance;
    issueNumber: number;
    digest: string;
    base?: DevSessionBase;
    deliverableKey?: string;
}): {
    key: string;
    title: string;
    body: string;
    changeSummary: string;
};
//# sourceMappingURL=session-acceptance-paperclip.d.ts.map