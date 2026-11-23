import { z } from 'zod';
export declare const DOCUMENT_PDF_TOOL = "document_pdf";
/** Cumulative UTF-8 limit, including source, presentation and delivery metadata. */
export declare const DOCUMENT_PDF_MAX_BYTES: number;
/** A deliberately small Markdown subset: text, headings, lists, code and reference links.
 * Rendering must never fetch resources, interpret HTML, or execute directives.
 */
export declare const DocumentPdfMarkdownSchema: z.ZodString;
/** Structured sources cannot be replaced by caller-authored blocks or Markdown.
 * The service authorizes scope and uses one common local pdfmake conversion for all variants.
 * No model credential, rendering option, filename or byte payload is accepted here.
 */
export declare const DocumentPdfInputSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"action_plan">;
    plan: z.ZodObject<{
        planId: z.ZodString;
        version: z.ZodNumber;
        digest: z.ZodString;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodString;
        projectId: z.ZodString;
        dossier: z.ZodOptional<z.ZodArray<z.ZodObject<{
            slug: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>>>;
        objective: z.ZodObject<{
            request: z.ZodString;
            expectedResult: z.ZodString;
            measure: z.ZodString;
        }, z.core.$strict>;
        deliveryShape: z.ZodOptional<z.ZodEnum<{
            product: "product";
            study: "study";
        }>>;
        analysis: z.ZodObject<{
            startingPoint: z.ZodString;
            marketAndAlternatives: z.ZodObject<{
                text: z.ZodString;
                sources: z.ZodArray<z.ZodURL>;
            }, z.core.$strict>;
            recommendedMethod: z.ZodObject<{
                method: z.ZodString;
                why: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>;
        strategy: z.ZodObject<{
            approach: z.ZodString;
            choices: z.ZodArray<z.ZodString>;
            discardedAlternatives: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        objectiveTree: z.ZodObject<{
            project: z.ZodObject<{
                expectedResult: z.ZodString;
                deliveryCriteria: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            businessUnits: z.ZodArray<z.ZodObject<{
                buSlug: z.ZodString;
                expectedResult: z.ZodString;
                deliveryCriteria: z.ZodArray<z.ZodString>;
                indicators: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    source: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        workBreakdown: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            parentId: z.ZodOptional<z.ZodString>;
            title: z.ZodString;
            expectedGoal: z.ZodString;
            deliveryCriteria: z.ZodArray<z.ZodString>;
            requirements: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                text: z.ZodString;
                attestor: z.ZodEnum<{
                    sessione: "sessione";
                    esecutore: "esecutore";
                    revisore: "revisore";
                    referente: "referente";
                }>;
                proof: z.ZodString;
                origin: z.ZodEnum<{
                    capo: "capo";
                    mandato: "mandato";
                    ritorno: "ritorno";
                }>;
                reference: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"requirement">;
                    id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"decision">;
                    requestId: z.ZodString;
                }, z.core.$strict>], "kind">]>>;
                unit: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>>;
            specifications: z.ZodOptional<z.ZodObject<{
                inputData: z.ZodArray<z.ZodString>;
                technicalConstraints: z.ZodArray<z.ZodString>;
                outOfScope: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            outputForm: z.ZodOptional<z.ZodString>;
            milestone: z.ZodNumber;
            owners: z.ZodArray<z.ZodObject<{
                buSlug: z.ZodString;
                does: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>>;
        milestones: z.ZodArray<z.ZodObject<{
            number: z.ZodNumber;
            delivery: z.ZodString;
            buSlug: z.ZodString;
            dueDate: z.ZodOptional<z.ZodISODate>;
            closeCriterion: z.ZodString;
            blockedBy: z.ZodArray<z.ZodNumber>;
        }, z.core.$strict>>;
        criticalPath: z.ZodArray<z.ZodNumber>;
        businessUnits: z.ZodArray<z.ZodObject<{
            buSlug: z.ZodString;
            typeId: z.ZodEnum<{
                dati: "dati";
                design: "design";
                sviluppo: "sviluppo";
                finanza: "finanza";
                marketing: "marketing";
            }>;
            mandate: z.ZodString;
            competencies: z.ZodArray<z.ZodString>;
            lead: z.ZodObject<{
                role: z.ZodLiteral<"capo-bu">;
            }, z.core.$strict>;
            reviewer: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                buSlug: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                role: z.ZodLiteral<"director">;
            }, z.core.$strict>]>>;
            executor: z.ZodEnum<{
                agent: "agent";
                dev_session: "dev_session";
                night: "night";
            }>;
            referent: z.ZodObject<{
                personRef: z.ZodString;
                entryVersion: z.ZodNumber;
            }, z.core.$strict>;
            firstActivities: z.ZodArray<z.ZodString>;
            sections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                expectedGoal: z.ZodString;
                deliveryCriteria: z.ZodArray<z.ZodString>;
                requirements: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    text: z.ZodString;
                    attestor: z.ZodEnum<{
                        sessione: "sessione";
                        esecutore: "esecutore";
                        revisore: "revisore";
                        referente: "referente";
                    }>;
                    proof: z.ZodString;
                    origin: z.ZodEnum<{
                        capo: "capo";
                        mandato: "mandato";
                        ritorno: "ritorno";
                    }>;
                    reference: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"requirement">;
                        id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"decision">;
                        requestId: z.ZodString;
                    }, z.core.$strict>], "kind">]>>;
                    unit: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
                specifications: z.ZodOptional<z.ZodObject<{
                    inputData: z.ZodArray<z.ZodString>;
                    technicalConstraints: z.ZodArray<z.ZodString>;
                    outOfScope: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
                outputForm: z.ZodOptional<z.ZodString>;
                milestone: z.ZodNumber;
                needsFrom: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    buSlug: z.ZodString;
                    what: z.ZodString;
                }, z.core.$strict>>>;
                documentFormat: z.ZodOptional<z.ZodObject<{
                    mediaType: z.ZodString;
                    parts: z.ZodArray<z.ZodString>;
                    length: z.ZodObject<{
                        unit: z.ZodEnum<{
                            pages: "pages";
                            words: "words";
                        }>;
                        min: z.ZodNumber;
                        max: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>>;
                documentSources: z.ZodOptional<z.ZodObject<{
                    pages: z.ZodArray<z.ZodObject<{
                        slug: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>;
                    materials: z.ZodArray<z.ZodObject<{
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
                }, z.core.$strict>>;
            }, z.core.$strict>>>;
            roleAgents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                role: z.ZodString;
                competencies: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>>;
            start: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"now">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"planned">;
                unlockedBy: z.ZodObject<{
                    milestone: z.ZodNumber;
                    delivery: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">;
            gapRule: z.ZodOptional<z.ZodEnum<{
                mark_and_proceed: "mark_and_proceed";
                stop_and_ask: "stop_and_ask";
            }>>;
            signOffs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                signer: z.ZodEnum<{
                    owner: "owner";
                    director: "director";
                    referent: "referent";
                }>;
                form: z.ZodLiteral<"decision_request">;
            }, z.core.$strict>>>;
        }, z.core.$strict>>;
        exchanges: z.ZodArray<z.ZodObject<{
            fromBu: z.ZodString;
            toBu: z.ZodString;
            what: z.ZodString;
            format: z.ZodString;
            key: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        budget: z.ZodObject<{
            currency: z.ZodString;
            total: z.ZodNumber;
            perBu: z.ZodArray<z.ZodObject<{
                buSlug: z.ZodString;
                cap: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        risks: z.ZodArray<z.ZodString>;
        assumptions: z.ZodArray<z.ZodString>;
        missingMaterials: z.ZodArray<z.ZodObject<{
            what: z.ZodString;
            kind: z.ZodEnum<{
                access: "access";
                asset: "asset";
                data: "data";
            }>;
            owner: z.ZodOptional<z.ZodString>;
            blocks: z.ZodOptional<z.ZodObject<{
                buSlug: z.ZodString;
                milestone: z.ZodNumber;
            }, z.core.$strict>>;
            neededBy: z.ZodOptional<z.ZodISODate>;
        }, z.core.$strict>>;
        questions: z.ZodArray<z.ZodObject<{
            question: z.ZodString;
            unlocks: z.ZodString;
            askTo: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                personRef: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"director">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"business_unit">;
                buSlug: z.ZodString;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>>;
        sourceCoverage: z.ZodOptional<z.ZodArray<z.ZodObject<{
            topic: z.ZodString;
            status: z.ZodEnum<{
                partial: "partial";
                covered: "covered";
                missing: "missing";
            }>;
            pages: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>>;
        ifApproved: z.ZodObject<{
            startNow: z.ZodArray<z.ZodString>;
            startLater: z.ZodArray<z.ZodObject<{
                buSlug: z.ZodString;
                after: z.ZodString;
            }, z.core.$strict>>;
            verticalPlanDueBy: z.ZodArray<z.ZodObject<{
                buSlug: z.ZodString;
                dueDate: z.ZodISODate;
            }, z.core.$strict>>;
            updates: z.ZodObject<{
                how: z.ZodString;
                every: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>;
        opportunities: z.ZodOptional<z.ZodArray<z.ZodString>>;
        referentProposals: z.ZodOptional<z.ZodArray<z.ZodObject<{
            personRef: z.ZodString;
            name: z.ZodString;
            role: z.ZodString;
            email: z.ZodEmail;
            level: z.ZodEnum<{
                client: "client";
                project: "project";
                business_unit: "business_unit";
            }>;
            buSlug: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    language: z.ZodString;
    referents: z.ZodOptional<z.ZodArray<z.ZodObject<{
        personRef: z.ZodString;
        entryVersion: z.ZodNumber;
        name: z.ZodString;
    }, z.core.$strict>>>;
    deliveryContext: z.ZodObject<{
        planId: z.ZodLazy<z.ZodString>;
        planVersion: z.ZodNumber;
        planDigest: z.ZodString;
        dossierSnapshotId: z.ZodString;
        dossierDigest: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"lab_dossier">;
    snapshot: z.ZodObject<{
        pages: z.ZodArray<z.ZodObject<{
            notebookAgentId: z.ZodString;
            slug: z.ZodString;
            version: z.ZodNumber;
            role: z.ZodEnum<{
                current: "current";
                cited_by_plan: "cited_by_plan";
            }>;
            title: z.ZodString;
            body: z.ZodString;
            digest: z.ZodString;
            contradicts: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                target: z.ZodLiteral<"decision">;
                requestId: z.ZodString;
                planVersion: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                target: z.ZodLiteral<"map_entry">;
                kind: z.ZodEnum<{
                    access: "access";
                    asset: "asset";
                    referent: "referent";
                    person: "person";
                    responsibility: "responsibility";
                }>;
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>], "target">]>>>;
        }, z.core.$strict>>;
        citations: z.ZodArray<z.ZodObject<{
            notebookAgentId: z.ZodString;
            slug: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>>;
        sources: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            notebookAgentId: z.ZodString;
            url: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            contentSha256: z.ZodString;
            origin: z.ZodEnum<{
                web: "web";
                model: "model";
                dataset: "dataset";
                human: "human";
            }>;
        }, z.core.$strict>>;
        currentPageCount: z.ZodNumber;
        citedExtraPageCount: z.ZodNumber;
        totalPages: z.ZodNumber;
        complete: z.ZodLiteral<true>;
        manifestDigest: z.ZodString;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodString;
        projectId: z.ZodString;
        snapshotId: z.ZodString;
        cutoff: z.ZodISODateTime;
        scope: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"client">;
            clientId: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"project">;
            clientId: z.ZodString;
            projectId: z.ZodString;
        }, z.core.$strict>], "kind">;
        schemaVersion: z.ZodLiteral<1>;
    }, z.core.$strict>;
    language: z.ZodString;
    deliveryContext: z.ZodObject<{
        planId: z.ZodLazy<z.ZodString>;
        planVersion: z.ZodNumber;
        planDigest: z.ZodString;
        dossierSnapshotId: z.ZodString;
        dossierDigest: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"document">;
    document: z.ZodOptional<z.ZodObject<{
        title: z.ZodString;
        language: z.ZodString;
        source: z.ZodObject<{
            kind: z.ZodString;
            id: z.ZodString;
            version: z.ZodOptional<z.ZodString>;
            sha256: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"heading">;
            level: z.ZodNumber;
            content: z.ZodArray<z.ZodObject<{
                text: z.ZodString;
                bold: z.ZodOptional<z.ZodBoolean>;
                italic: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodURL>;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"paragraph">;
            content: z.ZodArray<z.ZodObject<{
                text: z.ZodString;
                bold: z.ZodOptional<z.ZodBoolean>;
                italic: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodURL>;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"list">;
            ordered: z.ZodBoolean;
            items: z.ZodArray<z.ZodArray<z.ZodObject<{
                text: z.ZodString;
                bold: z.ZodOptional<z.ZodBoolean>;
                italic: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodURL>;
            }, z.core.$strict>>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"table">;
            header: z.ZodArray<z.ZodArray<z.ZodObject<{
                text: z.ZodString;
                bold: z.ZodOptional<z.ZodBoolean>;
                italic: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodURL>;
            }, z.core.$strict>>>;
            rows: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodObject<{
                text: z.ZodString;
                bold: z.ZodOptional<z.ZodBoolean>;
                italic: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodURL>;
            }, z.core.$strict>>>>;
            widths: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"*">]>>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"code">;
            language: z.ZodOptional<z.ZodString>;
            text: z.ZodString;
        }, z.core.$strict>], "kind">>;
    }, z.core.$strict>>;
    markdown: z.ZodOptional<z.ZodString>;
    language: z.ZodString;
}, z.core.$strict>], "kind">;
export type DocumentPdfInput = z.infer<typeof DocumentPdfInputSchema>;
/** Success is emitted only after the service persists and reads back the PDF asset.
 * This shape validates the receipt; storage/readability are enforced by the issuing service.
 */
export declare const DocumentPdfOutputSchema: z.ZodObject<{
    receipt: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        role: z.ZodEnum<{
            document: "document";
            action_plan: "action_plan";
            lab_dossier: "lab_dossier";
        }>;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodString;
        projectId: z.ZodString;
        source: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"action_plan">;
            planId: z.ZodLazy<z.ZodString>;
            version: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"lab_dossier">;
            snapshotId: z.ZodString;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"document">;
            sha256: z.ZodString;
        }, z.core.$strict>], "kind">;
        documentDigest: z.ZodString;
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
        renderer: z.ZodObject<{
            name: z.ZodLiteral<"pdfmake">;
            version: z.ZodString;
        }, z.core.$strict>;
        fontSet: z.ZodObject<{
            name: z.ZodString;
            version: z.ZodString;
        }, z.core.$strict>;
        pageCount: z.ZodNumber;
        createdAt: z.ZodISODateTime;
        producedBy: z.ZodObject<{
            agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        }, z.core.$strict>;
        deliveryContext: z.ZodOptional<z.ZodObject<{
            planId: z.ZodLazy<z.ZodString>;
            planVersion: z.ZodNumber;
            planDigest: z.ZodString;
            dossierSnapshotId: z.ZodString;
            dossierDigest: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type DocumentPdfOutput = z.infer<typeof DocumentPdfOutputSchema>;
//# sourceMappingURL=document-tools.d.ts.map