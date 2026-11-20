/** Extract the company prefix from a valid issue identifier. */
export declare function paperclipPrefissoAzienda(identificatore: string): string;
export declare function paperclipPercorsoIncarico(identificatore: string): string;
export declare function paperclipLinkIncarico(identificatore: string): string;
/** Point to a specific comment using Paperclip's comment anchor. */
export declare function paperclipPercorsoCommento(identificatore: string, commentId: string): string;
/** Find unique bare identifiers for this company, excluding Markdown links and code. */
export declare function paperclipIdentificatoriNudi(testo: string, prefisso: string): string[];
//# sourceMappingURL=riferimenti.d.ts.map