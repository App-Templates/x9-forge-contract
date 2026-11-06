export type ConsumerAcceptIssue = 'unknown-slot' | 'invalid-choice' | 'capability-mismatch' | 'function-mismatch' | 'routing-mismatch' | 'adapter-not-allowed' | 'embedding-dimensions-missing';
/** Local execution compatibility only; no catalog, credentials, clock or network. */
export declare function consumerAccepts(slotId: unknown, choice: unknown): ConsumerAcceptIssue[];
/** Conflicting registered members of a shared selection; invalid choices are checked separately. */
export declare function linkedChoiceConflicts(choices: Record<string, unknown>): string[];
//# sourceMappingURL=consumer-accepts.d.ts.map