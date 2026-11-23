import { z } from 'zod';
/** Limits apply to the complete document, including table headers; exceeding them fails. */
export declare const DOCUMENT_DATA_MAX_BYTES: number;
export declare const DOCUMENT_DATA_MAX_BLOCKS = 1000;
export declare const DOCUMENT_DATA_MAX_CELLS = 20000;
export declare const DocumentInlineSchema: z.ZodObject<{
    text: z.ZodString;
    bold: z.ZodOptional<z.ZodBoolean>;
    italic: z.ZodOptional<z.ZodBoolean>;
    /** A reference only: consumers must not fetch it to render the document. */
    href: z.ZodOptional<z.ZodURL>;
}, z.core.$strict>;
export type DocumentInline = z.infer<typeof DocumentInlineSchema>;
export declare const DocumentSourceSchema: z.ZodObject<{
    kind: z.ZodString;
    id: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    /** Digest of the source, distinct from the document-data digest and rendered PDF bytes. */
    sha256: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type DocumentSource = z.infer<typeof DocumentSourceSchema>;
export declare const DocumentTableSchema: z.ZodObject<{
    kind: z.ZodLiteral<"table">;
    header: z.ZodArray<z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        bold: z.ZodOptional<z.ZodBoolean>;
        italic: z.ZodOptional<z.ZodBoolean>;
        /** A reference only: consumers must not fetch it to render the document. */
        href: z.ZodOptional<z.ZodURL>;
    }, z.core.$strict>>>;
    rows: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        bold: z.ZodOptional<z.ZodBoolean>;
        italic: z.ZodOptional<z.ZodBoolean>;
        /** A reference only: consumers must not fetch it to render the document. */
        href: z.ZodOptional<z.ZodURL>;
    }, z.core.$strict>>>>;
    /** Relative column weights only; physical sizes belong to the rendering capability. */
    widths: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"*">]>>>;
}, z.core.$strict>;
export type DocumentTable = z.infer<typeof DocumentTableSchema>;
export declare const DocumentBlockSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"heading">;
    level: z.ZodNumber;
    content: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        bold: z.ZodOptional<z.ZodBoolean>;
        italic: z.ZodOptional<z.ZodBoolean>;
        /** A reference only: consumers must not fetch it to render the document. */
        href: z.ZodOptional<z.ZodURL>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"paragraph">;
    content: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        bold: z.ZodOptional<z.ZodBoolean>;
        italic: z.ZodOptional<z.ZodBoolean>;
        /** A reference only: consumers must not fetch it to render the document. */
        href: z.ZodOptional<z.ZodURL>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"list">;
    ordered: z.ZodBoolean;
    items: z.ZodArray<z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        bold: z.ZodOptional<z.ZodBoolean>;
        italic: z.ZodOptional<z.ZodBoolean>;
        /** A reference only: consumers must not fetch it to render the document. */
        href: z.ZodOptional<z.ZodURL>;
    }, z.core.$strict>>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"table">;
    header: z.ZodArray<z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        bold: z.ZodOptional<z.ZodBoolean>;
        italic: z.ZodOptional<z.ZodBoolean>;
        /** A reference only: consumers must not fetch it to render the document. */
        href: z.ZodOptional<z.ZodURL>;
    }, z.core.$strict>>>;
    rows: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        bold: z.ZodOptional<z.ZodBoolean>;
        italic: z.ZodOptional<z.ZodBoolean>;
        /** A reference only: consumers must not fetch it to render the document. */
        href: z.ZodOptional<z.ZodURL>;
    }, z.core.$strict>>>>;
    /** Relative column weights only; physical sizes belong to the rendering capability. */
    widths: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"*">]>>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"code">;
    language: z.ZodOptional<z.ZodString>;
    text: z.ZodString;
}, z.core.$strict>], "kind">;
export type DocumentBlock = z.infer<typeof DocumentBlockSchema>;
/** Portable semantic content only: no HTML, fonts, downloads, callbacks or pagination options. */
export declare const DocumentDataSchema: z.ZodObject<{
    title: z.ZodString;
    language: z.ZodString;
    source: z.ZodObject<{
        kind: z.ZodString;
        id: z.ZodString;
        version: z.ZodOptional<z.ZodString>;
        /** Digest of the source, distinct from the document-data digest and rendered PDF bytes. */
        sha256: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"heading">;
        level: z.ZodNumber;
        content: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            bold: z.ZodOptional<z.ZodBoolean>;
            italic: z.ZodOptional<z.ZodBoolean>;
            /** A reference only: consumers must not fetch it to render the document. */
            href: z.ZodOptional<z.ZodURL>;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"paragraph">;
        content: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            bold: z.ZodOptional<z.ZodBoolean>;
            italic: z.ZodOptional<z.ZodBoolean>;
            /** A reference only: consumers must not fetch it to render the document. */
            href: z.ZodOptional<z.ZodURL>;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"list">;
        ordered: z.ZodBoolean;
        items: z.ZodArray<z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            bold: z.ZodOptional<z.ZodBoolean>;
            italic: z.ZodOptional<z.ZodBoolean>;
            /** A reference only: consumers must not fetch it to render the document. */
            href: z.ZodOptional<z.ZodURL>;
        }, z.core.$strict>>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"table">;
        header: z.ZodArray<z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            bold: z.ZodOptional<z.ZodBoolean>;
            italic: z.ZodOptional<z.ZodBoolean>;
            /** A reference only: consumers must not fetch it to render the document. */
            href: z.ZodOptional<z.ZodURL>;
        }, z.core.$strict>>>;
        rows: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            bold: z.ZodOptional<z.ZodBoolean>;
            italic: z.ZodOptional<z.ZodBoolean>;
            /** A reference only: consumers must not fetch it to render the document. */
            href: z.ZodOptional<z.ZodURL>;
        }, z.core.$strict>>>>;
        /** Relative column weights only; physical sizes belong to the rendering capability. */
        widths: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"*">]>>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"code">;
        language: z.ZodOptional<z.ZodString>;
        text: z.ZodString;
    }, z.core.$strict>], "kind">>;
}, z.core.$strict>;
export type DocumentData = z.infer<typeof DocumentDataSchema>;
/** UTF-8 input for a SHA-256 of document data, separate from plan and PDF digests.
 * Validates before serializing; preserves array order and every block and cell.
 */
export declare function documentDataCanonicalJson(value: unknown): string;
//# sourceMappingURL=document-render.d.ts.map