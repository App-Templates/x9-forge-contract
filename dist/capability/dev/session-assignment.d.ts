import { z } from 'zod';
/**
 * Incarico di sessione di una business unit (F4): il contratto fra chi lo apre (cap-dev di X9, per conto del capo
 * BU) e chi lo esegue (l'esecutore sul laptop del proprietario). L'incarico vive nel corpo di una issue della
 * bacheca di sessione; il risultato vive nel ramo `consegna/<n>` e nel commento finale della stessa issue.
 *
 * Nessuna credenziale e nessun contenuto di file: solo identità, testo dell'incarico e riferimenti ai materiali.
 */
/** Etichetta con cui cap-dev marca una issue come incarico di sessione autonoma. */
export declare const DEV_SESSION_AUTONOMOUS_LABEL: "sessione:autonoma";
/** Il lavoro prodotto si committa sul ramo `consegna/<numero della issue>` del repository di destinazione. */
export declare const DEV_SESSION_BRANCH_PREFIX: "consegna/";
/** Riga che apre l'elenco dei file consegnati nel commento finale. */
export declare const DEV_SESSION_DELIVERED_FILES_LABEL: "File consegnati:";
/** Riga facoltativa del commento finale: il commit esatto della consegna (40 cifre esadecimali). */
export declare const DEV_SESSION_COMMIT_LABEL: "Commit:";
export declare const DEV_SESSION_MAX_FILES = 20;
export declare const DEV_SESSION_MAX_MATERIALS = 20;
/** Marcatore del blocco leggibile da macchina dentro il corpo della issue. */
export declare const DEV_SESSION_BLOCK_MARKER: "x9:dev-session:v1";
/** Una sessione produce codice o design; gli altri tipi di produzione non passano da qui. */
export declare const DevSessionKindSchema: z.ZodEnum<{
    code: "code";
    design: "design";
}>;
export type DevSessionKind = z.infer<typeof DevSessionKindSchema>;
/** `owner/repo` su GitHub. */
export declare const DevSessionRepoSchema: z.ZodString;
/**
 * Link a un repository GitHub (o a un suo ramo, cartella o file): solo https, solo github.com, nessuna credenziale
 * nell'indirizzo, nessun parametro. Chi esegue clona o legge da qui: l'insieme dei proprietari ammessi lo decide chi
 * apre l'incarico, qui si garantisce solo la forma.
 */
export declare const DevSessionGitHubLinkSchema: z.ZodString;
export type DevSessionGitHubLink = z.infer<typeof DevSessionGitHubLinkSchema>;
/** Un materiale ricevuto dal referente: un allegato già registrato come asset, oppure un link a GitHub. */
export declare const DevSessionMaterialSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"asset">;
    asset: z.ZodObject<{
        assetId: z.ZodString;
        sha256: z.ZodString;
        name: z.ZodString;
        mediaType: z.ZodString;
        sizeBytes: z.ZodNumber;
        origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"email">;
            messageId: z.ZodString;
            attachmentName: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"archive">;
            archiveSha256: z.ZodString;
            entryPath: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"session">;
            sessionId: z.ZodString;
            repo: z.ZodOptional<z.ZodString>;
            commit: z.ZodOptional<z.ZodString>;
            path: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"link">;
            url: z.ZodURL;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"generated">;
            agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            sourceAssetIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>], "kind">;
        tenantId: z.ZodString;
        companyId: z.ZodString;
        projectId: z.ZodString;
        assetType: z.ZodOptional<z.ZodString>;
        buSlug: z.ZodOptional<z.ZodString>;
        providedBy: z.ZodOptional<z.ZodObject<{
            personRef: z.ZodString;
        }, z.core.$strict>>;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"github_link">;
    url: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strict>], "kind">;
export type DevSessionMaterial = z.infer<typeof DevSessionMaterialSchema>;
/**
 * L'incarico. Tutto ciò che identifica chi lo apre (tenant, owner, organizzazione, agente, business unit) è messo da
 * cap-dev dall'identità verificata della chiamata, mai dal modello. I materiali devono essere della stessa azienda,
 * dello stesso progetto e dello stesso tenant dell'incarico, e di nessun'altra business unit: se non lo sono,
 * l'incarico non è valido, sia in apertura sia in lettura.
 */
export declare const DevSessionAssignmentSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    organizationId: z.ZodString;
    companyId: z.ZodString;
    projectId: z.ZodString;
    businessUnit: z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strict>;
    requestedBy: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    productKind: z.ZodEnum<{
        code: "code";
        design: "design";
    }>;
    title: z.ZodString;
    /** L'incarico, con le parole della business unit. */
    task: z.ZodString;
    /** Il mini piano della business unit per questo incarico. */
    miniPlan: z.ZodString;
    materials: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"asset">;
        asset: z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
            name: z.ZodString;
            mediaType: z.ZodString;
            sizeBytes: z.ZodNumber;
            origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                messageId: z.ZodString;
                attachmentName: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"archive">;
                archiveSha256: z.ZodString;
                entryPath: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"session">;
                sessionId: z.ZodString;
                repo: z.ZodOptional<z.ZodString>;
                commit: z.ZodOptional<z.ZodString>;
                path: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"link">;
                url: z.ZodURL;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"generated">;
                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                sourceAssetIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>], "kind">;
            tenantId: z.ZodString;
            companyId: z.ZodString;
            projectId: z.ZodString;
            assetType: z.ZodOptional<z.ZodString>;
            buSlug: z.ZodOptional<z.ZodString>;
            providedBy: z.ZodOptional<z.ZodObject<{
                personRef: z.ZodString;
            }, z.core.$strict>>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        note: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"github_link">;
        url: z.ZodString;
        note: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>], "kind">>;
    destination: z.ZodObject<{
        repo: z.ZodString;
    }, z.core.$strict>;
    createdAt: z.ZodISODateTime;
}, z.core.$strict>;
export type DevSessionAssignment = z.infer<typeof DevSessionAssignmentSchema>;
/** Ramo di consegna dell'incarico aperto come issue `issueNumber`. */
export declare function devSessionBranch(issueNumber: number): string;
/** Identificativo di sessione negli asset di origine `session`: `R<numero della issue>`. */
export declare function devSessionId(issueNumber: number): string;
/**
 * Testo canonico dell'incarico (chiavi ordinate, nessuno spazio): chi apre ne calcola lo SHA-256 e lo scrive nel
 * blocco; chi legge lo ricalcola. Il ponte non calcola l'impronta: la calcola il servizio.
 */
export declare function devSessionAssignmentCanonicalJson(raw: unknown): string;
/**
 * Blocco da mettere in fondo al corpo della issue: una riga di marcatore con l'impronta, poi un blocco di codice
 * `json` di una sola riga. Il `<` è scritto `<` perché nessun testo possa aprire un commento HTML.
 */
export declare function renderDevSessionBlock(raw: unknown, digest: string): string;
export type DevSessionBlockFailure = 'absent' | 'multiple' | 'malformed' | 'invalid_json' | 'invalid_assignment';
/**
 * Legge il blocco dal corpo di una issue. Restituisce l'incarico validato e l'impronta dichiarata: confrontarla con
 * `devSessionAssignmentCanonicalJson` è compito di chi legge. Un blocco assente, doppio o illeggibile è un errore,
 * mai un incarico vuoto.
 */
export declare function parseDevSessionBlock(body: string): {
    ok: true;
    assignment: DevSessionAssignment;
    digest: string;
} | {
    ok: false;
    reason: DevSessionBlockFailure;
};
export declare const DevSessionCommitSchema: z.ZodString;
export declare const DevSessionDeliveredFileSchema: z.ZodObject<{
    path: z.ZodString;
    sha256: z.ZodString;
    sizeBytes: z.ZodNumber;
}, z.core.$strict>;
export type DevSessionDeliveredFile = z.infer<typeof DevSessionDeliveredFileSchema>;
/** Commento finale dell'esecutore: riepilogo libero, riga `Commit:` facoltativa, poi l'elenco dei file. */
export declare const DevSessionDeliverySchema: z.ZodObject<{
    summary: z.ZodString;
    commit: z.ZodNullable<z.ZodString>;
    files: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        sha256: z.ZodString;
        sizeBytes: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DevSessionDelivery = z.infer<typeof DevSessionDeliverySchema>;
export declare function renderDevSessionDelivery(raw: z.input<typeof DevSessionDeliverySchema>): string;
export type DevSessionDeliveryFailure = 'invalid_line' | 'unsafe_path' | 'duplicate_path' | 'too_many_files' | 'invalid_commit' | 'multiple_commits';
/**
 * Legge il commento finale. Senza l'elenco dei file la consegna ha zero file (spetta a chi legge decidere se basta);
 * una riga dell'elenco malformata è un errore, mai una riga saltata.
 */
export declare function parseDevSessionDelivery(body: string): {
    ok: true;
    delivery: DevSessionDelivery;
} | {
    ok: false;
    reason: DevSessionDeliveryFailure;
};
/**
 * Un file della consegna dopo la verifica: cap-dev ha riletto i byte al commit indicato e ne ha confrontato impronta
 * e dimensione con quelle dichiarate dall'esecutore.
 */
export declare const DevSessionResultFileSchema: z.ZodObject<{
    path: z.ZodString;
    name: z.ZodString;
    sha256: z.ZodString;
    sizeBytes: z.ZodNumber;
    mediaType: z.ZodString;
    link: z.ZodString;
}, z.core.$strict>;
/** Risultato di una sessione consegnata e verificata: nessuna consegna «fatta» senza commit e file verificati. */
export declare const DevSessionResultSchema: z.ZodObject<{
    sessionId: z.ZodString;
    issue: z.ZodNumber;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    repo: z.ZodString;
    branch: z.ZodString;
    commit: z.ZodString;
    link: z.ZodString;
    summary: z.ZodString;
    files: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        name: z.ZodString;
        sha256: z.ZodString;
        sizeBytes: z.ZodNumber;
        mediaType: z.ZodString;
        link: z.ZodString;
    }, z.core.$strict>>;
    assets: z.ZodArray<z.ZodObject<{
        assetId: z.ZodString;
        sha256: z.ZodString;
        name: z.ZodString;
        mediaType: z.ZodString;
        sizeBytes: z.ZodNumber;
        origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"email">;
            messageId: z.ZodString;
            attachmentName: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"archive">;
            archiveSha256: z.ZodString;
            entryPath: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"session">;
            sessionId: z.ZodString;
            repo: z.ZodOptional<z.ZodString>;
            commit: z.ZodOptional<z.ZodString>;
            path: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"link">;
            url: z.ZodURL;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"generated">;
            agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            sourceAssetIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>], "kind">;
        tenantId: z.ZodString;
        companyId: z.ZodString;
        projectId: z.ZodString;
        assetType: z.ZodOptional<z.ZodString>;
        buSlug: z.ZodOptional<z.ZodString>;
        providedBy: z.ZodOptional<z.ZodObject<{
            personRef: z.ZodString;
        }, z.core.$strict>>;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DevSessionResult = z.infer<typeof DevSessionResultSchema>;
//# sourceMappingURL=session-assignment.d.ts.map