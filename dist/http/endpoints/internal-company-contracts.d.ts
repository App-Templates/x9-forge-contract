import { z } from 'zod';
/**
 * Read-only catalog of the eight company contracts and their applied instances (task 8258).
 * Every method, path, query, answer and refusal lives here. Nothing here judges a contract: the services keep their
 * own authorizations and verdicts. No credential crosses these shapes (strict objects everywhere).
 */
/** The package that publishes the catalog; the test compares it with package.json. */
export declare const COMPANY_CONTRACTS_PACKAGE: {
    readonly name: "@x9-forge/contracts";
    readonly version: "1.306.0";
};
export declare const COMPANY_CONTRACT_TYPES: readonly ["mandate", "code_session", "design_session", "referent_email", "lab_request", "chief_question", "unit_exchange", "document_unit"];
export declare const CompanyContractTypeSchema: z.ZodEnum<{
    mandate: "mandate";
    code_session: "code_session";
    design_session: "design_session";
    referent_email: "referent_email";
    lab_request: "lab_request";
    chief_question: "chief_question";
    unit_exchange: "unit_exchange";
    document_unit: "document_unit";
}>;
export type CompanyContractType = z.infer<typeof CompanyContractTypeSchema>;
export declare const CompanyContractCatalogEntrySchema: z.ZodObject<{
    type: z.ZodEnum<{
        mandate: "mandate";
        code_session: "code_session";
        design_session: "design_session";
        referent_email: "referent_email";
        lab_request: "lab_request";
        chief_question: "chief_question";
        unit_exchange: "unit_exchange";
        document_unit: "document_unit";
    }>;
    variant: z.ZodOptional<z.ZodEnum<{
        "sviluppo-pezzo-app": "sviluppo-pezzo-app";
        "design-sito": "design-sito";
        "design-schermata-app": "design-schermata-app";
        "design-ritocco": "design-ritocco";
    }>>;
    label: z.ZodString;
    origin: z.ZodObject<{
        schema: z.ZodString;
        file: z.ZodString;
    }, z.core.$strict>;
    published: z.ZodObject<{
        package: z.ZodLiteral<"@x9-forge/contracts">;
        version: z.ZodString;
        commit: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    version: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"numeric">;
        value: z.ZodInt;
        from: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"absent">;
        reason: z.ZodString;
    }, z.core.$strict>], "kind">;
    fields: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        required: z.ZodBoolean;
    }, z.core.$strict>>;
    models: z.ZodArray<z.ZodObject<{
        version: z.ZodInt;
        productKind: z.ZodEnum<{
            code: "code";
            design: "design";
        }>;
        supportedEngines: z.ZodArray<z.ZodString>;
        requiredInput: z.ZodArray<z.ZodString>;
        materials: z.ZodArray<z.ZodString>;
        requirements: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
            attestor: z.ZodEnum<{
                sessione: "sessione";
                esecutore: "esecutore";
                revisore: "revisore";
                referente: "referente";
            }>;
            proof: z.ZodString;
            origin: z.ZodLiteral<"modello">;
            needs: z.ZodArray<z.ZodString>;
            optional: z.ZodBoolean;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    historicalSnapshot: z.ZodObject<{
        state: z.ZodLiteral<"non_noto">;
        reason: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type CompanyContractCatalogEntry = z.infer<typeof CompanyContractCatalogEntrySchema>;
/** The eight contracts (design in three models) as the current package publishes them; pure. */
export declare function companyContractCatalog(options?: {
    commit?: string;
}): CompanyContractCatalogEntry[];
export declare const CompanyContractScopeSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodString;
    unitId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type CompanyContractScope = z.infer<typeof CompanyContractScopeSchema>;
export declare const CompanyContractRequirementSchema: z.ZodObject<{
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
        modello: "modello";
    }>;
    unit: z.ZodOptional<z.ZodString>;
    status: z.ZodUnion<readonly [z.ZodObject<{
        state: z.ZodLiteral<"noto">;
        value: z.ZodLiteral<"soddisfatto">;
        proof: z.ZodObject<{
            path: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>;
        proofOrigin: z.ZodEnum<{
            sessione: "sessione";
            esecutore: "esecutore";
            base: "base";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"noto">;
        value: z.ZodLiteral<"non_soddisfatto">;
        reason: z.ZodString;
        responsible: z.ZodEnum<{
            director: "director";
            capo: "capo";
            sessione: "sessione";
            referente: "referente";
        }>;
        nextAction: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"noto">;
        value: z.ZodLiteral<"da_revisionare">;
        reason: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"noto">;
        value: z.ZodLiteral<"in_attesa">;
        observed: z.ZodLiteral<"attestation_absent">;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"non_noto">;
        reason: z.ZodString;
    }, z.core.$strict>]>;
}, z.core.$strict>;
export type CompanyContractRequirement = z.infer<typeof CompanyContractRequirementSchema>;
export declare const CompanyContractInstanceSchema: z.ZodObject<{
    type: z.ZodEnum<{
        mandate: "mandate";
        code_session: "code_session";
        design_session: "design_session";
        referent_email: "referent_email";
        lab_request: "lab_request";
        chief_question: "chief_question";
        unit_exchange: "unit_exchange";
        document_unit: "document_unit";
    }>;
    variant: z.ZodOptional<z.ZodEnum<{
        "sviluppo-pezzo-app": "sviluppo-pezzo-app";
        "design-sito": "design-sito";
        "design-schermata-app": "design-schermata-app";
        "design-ritocco": "design-ritocco";
    }>>;
    scope: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodOptional<z.ZodString>;
        projectId: z.ZodString;
        unitId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    reference: z.ZodDiscriminatedUnion<[z.ZodObject<{
        state: z.ZodLiteral<"noto">;
        value: z.ZodObject<{
            kind: z.ZodEnum<{
                document: "document";
                session: "session";
                decision: "decision";
                request: "request";
                assignment: "assignment";
            }>;
            id: z.ZodString;
        }, z.core.$strict>;
        source: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"non_noto">;
        reason: z.ZodString;
    }, z.core.$strict>], "state">;
    digest: z.ZodDiscriminatedUnion<[z.ZodObject<{
        state: z.ZodLiteral<"noto">;
        value: z.ZodString;
        source: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"non_noto">;
        reason: z.ZodString;
    }, z.core.$strict>], "state">;
    model: z.ZodDiscriminatedUnion<[z.ZodObject<{
        state: z.ZodLiteral<"noto">;
        value: z.ZodObject<{
            templateId: z.ZodOptional<z.ZodString>;
            version: z.ZodInt;
        }, z.core.$strict>;
        source: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"non_noto">;
        reason: z.ZodString;
    }, z.core.$strict>], "state">;
    nativeRevision: z.ZodDiscriminatedUnion<[z.ZodObject<{
        state: z.ZodLiteral<"noto">;
        value: z.ZodString;
        source: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"non_noto">;
        reason: z.ZodString;
    }, z.core.$strict>], "state">;
    author: z.ZodDiscriminatedUnion<[z.ZodObject<{
        state: z.ZodLiteral<"noto">;
        value: z.ZodString;
        source: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"non_noto">;
        reason: z.ZodString;
    }, z.core.$strict>], "state">;
    writtenAt: z.ZodDiscriminatedUnion<[z.ZodObject<{
        state: z.ZodLiteral<"noto">;
        value: z.ZodISODateTime;
        source: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"non_noto">;
        reason: z.ZodString;
    }, z.core.$strict>], "state">;
    requirements: z.ZodDiscriminatedUnion<[z.ZodObject<{
        state: z.ZodLiteral<"noto">;
        value: z.ZodArray<z.ZodObject<{
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
                modello: "modello";
            }>;
            unit: z.ZodOptional<z.ZodString>;
            status: z.ZodUnion<readonly [z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodLiteral<"soddisfatto">;
                proof: z.ZodObject<{
                    path: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                proofOrigin: z.ZodEnum<{
                    sessione: "sessione";
                    esecutore: "esecutore";
                    base: "base";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodLiteral<"non_soddisfatto">;
                reason: z.ZodString;
                responsible: z.ZodEnum<{
                    director: "director";
                    capo: "capo";
                    sessione: "sessione";
                    referente: "referente";
                }>;
                nextAction: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodLiteral<"da_revisionare">;
                reason: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodLiteral<"in_attesa">;
                observed: z.ZodLiteral<"attestation_absent">;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>]>;
        }, z.core.$strict>>;
        source: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"non_noto">;
        reason: z.ZodString;
    }, z.core.$strict>], "state">;
}, z.core.$strict>;
export type CompanyContractInstance = z.infer<typeof CompanyContractInstanceSchema>;
/** A break names the assignment, the code or the requirement, the proof and the origin; never deduced from `blocked`. */
export declare const CompanyContractBreakSchema: z.ZodObject<{
    assignment: z.ZodString;
    code: z.ZodOptional<z.ZodEnum<{
        requirements_unresolved: "requirements_unresolved";
        criterion_unknown: "criterion_unknown";
        attestor_not_session: "attestor_not_session";
        attestor_not_executor: "attestor_not_executor";
        entry_duplicate: "entry_duplicate";
        attempt_stale: "attempt_stale";
        template_version_mismatch: "template_version_mismatch";
        contract_digest_mismatch: "contract_digest_mismatch";
        proof_missing: "proof_missing";
        proof_modified: "proof_modified";
        proof_origin_session: "proof_origin_session";
        entry_missing: "entry_missing";
        executor_result_missing: "executor_result_missing";
    }>>;
    requirementId: z.ZodOptional<z.ZodString>;
    proof: z.ZodString;
    origin: z.ZodEnum<{
        capo: "capo";
        mandato: "mandato";
        ritorno: "ritorno";
        modello: "modello";
    }>;
    source: z.ZodEnum<{
        paperclip: "paperclip";
        dev: "dev";
        agent_core: "agent_core";
    }>;
}, z.core.$strict>;
export type CompanyContractBreak = z.infer<typeof CompanyContractBreakSchema>;
export declare const CompanyContractSourceReadSchema: z.ZodObject<{
    source: z.ZodEnum<{
        paperclip: "paperclip";
        dev: "dev";
        agent_core: "agent_core";
    }>;
    complete: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
    readAt: z.ZodNullable<z.ZodISODateTime>;
    sampledAt: z.ZodNullable<z.ZodISODateTime>;
}, z.core.$strict>;
export declare const CompanyContractsReadSchema: z.ZodObject<{
    scope: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodOptional<z.ZodString>;
        projectId: z.ZodString;
        unitId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    published: z.ZodObject<{
        package: z.ZodLiteral<"@x9-forge/contracts">;
        version: z.ZodString;
        commit: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    applied: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            mandate: "mandate";
            code_session: "code_session";
            design_session: "design_session";
            referent_email: "referent_email";
            lab_request: "lab_request";
            chief_question: "chief_question";
            unit_exchange: "unit_exchange";
            document_unit: "document_unit";
        }>;
        variant: z.ZodOptional<z.ZodEnum<{
            "sviluppo-pezzo-app": "sviluppo-pezzo-app";
            "design-sito": "design-sito";
            "design-schermata-app": "design-schermata-app";
            "design-ritocco": "design-ritocco";
        }>>;
        scope: z.ZodObject<{
            tenantId: z.ZodString;
            ownerId: z.ZodString;
            organizationId: z.ZodString;
            clientId: z.ZodOptional<z.ZodString>;
            projectId: z.ZodString;
            unitId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        reference: z.ZodDiscriminatedUnion<[z.ZodObject<{
            state: z.ZodLiteral<"noto">;
            value: z.ZodObject<{
                kind: z.ZodEnum<{
                    document: "document";
                    session: "session";
                    decision: "decision";
                    request: "request";
                    assignment: "assignment";
                }>;
                id: z.ZodString;
            }, z.core.$strict>;
            source: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            state: z.ZodLiteral<"non_noto">;
            reason: z.ZodString;
        }, z.core.$strict>], "state">;
        digest: z.ZodDiscriminatedUnion<[z.ZodObject<{
            state: z.ZodLiteral<"noto">;
            value: z.ZodString;
            source: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            state: z.ZodLiteral<"non_noto">;
            reason: z.ZodString;
        }, z.core.$strict>], "state">;
        model: z.ZodDiscriminatedUnion<[z.ZodObject<{
            state: z.ZodLiteral<"noto">;
            value: z.ZodObject<{
                templateId: z.ZodOptional<z.ZodString>;
                version: z.ZodInt;
            }, z.core.$strict>;
            source: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            state: z.ZodLiteral<"non_noto">;
            reason: z.ZodString;
        }, z.core.$strict>], "state">;
        nativeRevision: z.ZodDiscriminatedUnion<[z.ZodObject<{
            state: z.ZodLiteral<"noto">;
            value: z.ZodString;
            source: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            state: z.ZodLiteral<"non_noto">;
            reason: z.ZodString;
        }, z.core.$strict>], "state">;
        author: z.ZodDiscriminatedUnion<[z.ZodObject<{
            state: z.ZodLiteral<"noto">;
            value: z.ZodString;
            source: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            state: z.ZodLiteral<"non_noto">;
            reason: z.ZodString;
        }, z.core.$strict>], "state">;
        writtenAt: z.ZodDiscriminatedUnion<[z.ZodObject<{
            state: z.ZodLiteral<"noto">;
            value: z.ZodISODateTime;
            source: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            state: z.ZodLiteral<"non_noto">;
            reason: z.ZodString;
        }, z.core.$strict>], "state">;
        requirements: z.ZodDiscriminatedUnion<[z.ZodObject<{
            state: z.ZodLiteral<"noto">;
            value: z.ZodArray<z.ZodObject<{
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
                    modello: "modello";
                }>;
                unit: z.ZodOptional<z.ZodString>;
                status: z.ZodUnion<readonly [z.ZodObject<{
                    state: z.ZodLiteral<"noto">;
                    value: z.ZodLiteral<"soddisfatto">;
                    proof: z.ZodObject<{
                        path: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                    proofOrigin: z.ZodEnum<{
                        sessione: "sessione";
                        esecutore: "esecutore";
                        base: "base";
                    }>;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"noto">;
                    value: z.ZodLiteral<"non_soddisfatto">;
                    reason: z.ZodString;
                    responsible: z.ZodEnum<{
                        director: "director";
                        capo: "capo";
                        sessione: "sessione";
                        referente: "referente";
                    }>;
                    nextAction: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"noto">;
                    value: z.ZodLiteral<"da_revisionare">;
                    reason: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"noto">;
                    value: z.ZodLiteral<"in_attesa">;
                    observed: z.ZodLiteral<"attestation_absent">;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"non_noto">;
                    reason: z.ZodString;
                }, z.core.$strict>]>;
            }, z.core.$strict>>;
            source: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            state: z.ZodLiteral<"non_noto">;
            reason: z.ZodString;
        }, z.core.$strict>], "state">;
    }, z.core.$strict>>;
    breaks: z.ZodArray<z.ZodObject<{
        assignment: z.ZodString;
        code: z.ZodOptional<z.ZodEnum<{
            requirements_unresolved: "requirements_unresolved";
            criterion_unknown: "criterion_unknown";
            attestor_not_session: "attestor_not_session";
            attestor_not_executor: "attestor_not_executor";
            entry_duplicate: "entry_duplicate";
            attempt_stale: "attempt_stale";
            template_version_mismatch: "template_version_mismatch";
            contract_digest_mismatch: "contract_digest_mismatch";
            proof_missing: "proof_missing";
            proof_modified: "proof_modified";
            proof_origin_session: "proof_origin_session";
            entry_missing: "entry_missing";
            executor_result_missing: "executor_result_missing";
        }>>;
        requirementId: z.ZodOptional<z.ZodString>;
        proof: z.ZodString;
        origin: z.ZodEnum<{
            capo: "capo";
            mandato: "mandato";
            ritorno: "ritorno";
            modello: "modello";
        }>;
        source: z.ZodEnum<{
            paperclip: "paperclip";
            dev: "dev";
            agent_core: "agent_core";
        }>;
    }, z.core.$strict>>;
    sources: z.ZodArray<z.ZodObject<{
        source: z.ZodEnum<{
            paperclip: "paperclip";
            dev: "dev";
            agent_core: "agent_core";
        }>;
        complete: z.ZodBoolean;
        reason: z.ZodOptional<z.ZodString>;
        readAt: z.ZodNullable<z.ZodISODateTime>;
        sampledAt: z.ZodNullable<z.ZodISODateTime>;
    }, z.core.$strict>>;
    page: z.ZodObject<{
        complete: z.ZodBoolean;
        nextCursor: z.ZodNullable<z.ZodString>;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type CompanyContractsRead = z.infer<typeof CompanyContractsReadSchema>;
/** First scope key on which the read differs from the scope requested, or undefined. */
export declare function companyContractsScopeProblem(requested: CompanyContractScope, read: CompanyContractsRead): keyof CompanyContractScope | undefined;
/** «No broken contract» is proven only by a complete read: a partial one proves nothing. */
export declare function companyContractsNoBreakProven(read: CompanyContractsRead): boolean;
export declare const COMPANY_CONTRACTS_REFUSALS: readonly ["scope_foreign", "scope_unresolved", "source_unavailable", "cursor_invalid"];
export declare const CompanyContractsRefusalSchema: z.ZodObject<{
    error: z.ZodEnum<{
        source_unavailable: "source_unavailable";
        scope_foreign: "scope_foreign";
        scope_unresolved: "scope_unresolved";
        cursor_invalid: "cursor_invalid";
    }>;
}, z.core.$strict>;
export type CompanyContractsRefusal = z.infer<typeof CompanyContractsRefusalSchema>;
export declare const INTERNAL_PAPERCLIP_COMPANY_CONTRACTS_PATH: "/internal/paperclip/company-contracts";
export declare const INTERNAL_DEV_COMPANY_CONTRACTS_PATH: "/internal/dev/company-contracts";
export declare const INTERNAL_COMPANY_CONTRACTS_PATH: "/internal/company-board/contracts";
export declare const InternalPaperclipCompanyContractsQuerySchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    cursor: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodString;
    unitId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const InternalDevCompanyContractsQuerySchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    cursor: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodString;
    unitId: z.ZodOptional<z.ZodString>;
    agentId: z.ZodString;
}, z.core.$strict>;
export declare const InternalCompanyContractsQuerySchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    cursor: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodString;
    unitId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
/** cap-paperclip: contracts written in Paperclip (mandates, requests, Lab) of one project. Service-only. */
export declare const internalPaperclipCompanyContractsContract: {
    readonly method: "GET";
    readonly path: "/internal/paperclip/company-contracts";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        cursor: z.ZodOptional<z.ZodString>;
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodOptional<z.ZodString>;
        projectId: z.ZodString;
        unitId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        scope: z.ZodObject<{
            tenantId: z.ZodString;
            ownerId: z.ZodString;
            organizationId: z.ZodString;
            clientId: z.ZodOptional<z.ZodString>;
            projectId: z.ZodString;
            unitId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        published: z.ZodObject<{
            package: z.ZodLiteral<"@x9-forge/contracts">;
            version: z.ZodString;
            commit: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        applied: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                mandate: "mandate";
                code_session: "code_session";
                design_session: "design_session";
                referent_email: "referent_email";
                lab_request: "lab_request";
                chief_question: "chief_question";
                unit_exchange: "unit_exchange";
                document_unit: "document_unit";
            }>;
            variant: z.ZodOptional<z.ZodEnum<{
                "sviluppo-pezzo-app": "sviluppo-pezzo-app";
                "design-sito": "design-sito";
                "design-schermata-app": "design-schermata-app";
                "design-ritocco": "design-ritocco";
            }>>;
            scope: z.ZodObject<{
                tenantId: z.ZodString;
                ownerId: z.ZodString;
                organizationId: z.ZodString;
                clientId: z.ZodOptional<z.ZodString>;
                projectId: z.ZodString;
                unitId: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            reference: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodObject<{
                    kind: z.ZodEnum<{
                        document: "document";
                        session: "session";
                        decision: "decision";
                        request: "request";
                        assignment: "assignment";
                    }>;
                    id: z.ZodString;
                }, z.core.$strict>;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            digest: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodString;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            model: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodObject<{
                    templateId: z.ZodOptional<z.ZodString>;
                    version: z.ZodInt;
                }, z.core.$strict>;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            nativeRevision: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodString;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            author: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodString;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            writtenAt: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodISODateTime;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            requirements: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodArray<z.ZodObject<{
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
                        modello: "modello";
                    }>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodUnion<readonly [z.ZodObject<{
                        state: z.ZodLiteral<"noto">;
                        value: z.ZodLiteral<"soddisfatto">;
                        proof: z.ZodObject<{
                            path: z.ZodString;
                            sha256: z.ZodString;
                        }, z.core.$strict>;
                        proofOrigin: z.ZodEnum<{
                            sessione: "sessione";
                            esecutore: "esecutore";
                            base: "base";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        state: z.ZodLiteral<"noto">;
                        value: z.ZodLiteral<"non_soddisfatto">;
                        reason: z.ZodString;
                        responsible: z.ZodEnum<{
                            director: "director";
                            capo: "capo";
                            sessione: "sessione";
                            referente: "referente";
                        }>;
                        nextAction: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        state: z.ZodLiteral<"noto">;
                        value: z.ZodLiteral<"da_revisionare">;
                        reason: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        state: z.ZodLiteral<"noto">;
                        value: z.ZodLiteral<"in_attesa">;
                        observed: z.ZodLiteral<"attestation_absent">;
                    }, z.core.$strict>, z.ZodObject<{
                        state: z.ZodLiteral<"non_noto">;
                        reason: z.ZodString;
                    }, z.core.$strict>]>;
                }, z.core.$strict>>;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
        }, z.core.$strict>>;
        breaks: z.ZodArray<z.ZodObject<{
            assignment: z.ZodString;
            code: z.ZodOptional<z.ZodEnum<{
                requirements_unresolved: "requirements_unresolved";
                criterion_unknown: "criterion_unknown";
                attestor_not_session: "attestor_not_session";
                attestor_not_executor: "attestor_not_executor";
                entry_duplicate: "entry_duplicate";
                attempt_stale: "attempt_stale";
                template_version_mismatch: "template_version_mismatch";
                contract_digest_mismatch: "contract_digest_mismatch";
                proof_missing: "proof_missing";
                proof_modified: "proof_modified";
                proof_origin_session: "proof_origin_session";
                entry_missing: "entry_missing";
                executor_result_missing: "executor_result_missing";
            }>>;
            requirementId: z.ZodOptional<z.ZodString>;
            proof: z.ZodString;
            origin: z.ZodEnum<{
                capo: "capo";
                mandato: "mandato";
                ritorno: "ritorno";
                modello: "modello";
            }>;
            source: z.ZodEnum<{
                paperclip: "paperclip";
                dev: "dev";
                agent_core: "agent_core";
            }>;
        }, z.core.$strict>>;
        sources: z.ZodArray<z.ZodObject<{
            source: z.ZodEnum<{
                paperclip: "paperclip";
                dev: "dev";
                agent_core: "agent_core";
            }>;
            complete: z.ZodBoolean;
            reason: z.ZodOptional<z.ZodString>;
            readAt: z.ZodNullable<z.ZodISODateTime>;
            sampledAt: z.ZodNullable<z.ZodISODateTime>;
        }, z.core.$strict>>;
        page: z.ZodObject<{
            complete: z.ZodBoolean;
            nextCursor: z.ZodNullable<z.ZodString>;
            reason: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly refusalSchema: z.ZodObject<{
        error: z.ZodEnum<{
            source_unavailable: "source_unavailable";
            scope_foreign: "scope_foreign";
            scope_unresolved: "scope_unresolved";
            cursor_invalid: "cursor_invalid";
        }>;
    }, z.core.$strict>;
};
/** cap-dev: session contracts and their attestations on behalf of an agent. Service-only. */
export declare const internalDevCompanyContractsContract: {
    readonly method: "GET";
    readonly path: "/internal/dev/company-contracts";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        cursor: z.ZodOptional<z.ZodString>;
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodOptional<z.ZodString>;
        projectId: z.ZodString;
        unitId: z.ZodOptional<z.ZodString>;
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        scope: z.ZodObject<{
            tenantId: z.ZodString;
            ownerId: z.ZodString;
            organizationId: z.ZodString;
            clientId: z.ZodOptional<z.ZodString>;
            projectId: z.ZodString;
            unitId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        published: z.ZodObject<{
            package: z.ZodLiteral<"@x9-forge/contracts">;
            version: z.ZodString;
            commit: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        applied: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                mandate: "mandate";
                code_session: "code_session";
                design_session: "design_session";
                referent_email: "referent_email";
                lab_request: "lab_request";
                chief_question: "chief_question";
                unit_exchange: "unit_exchange";
                document_unit: "document_unit";
            }>;
            variant: z.ZodOptional<z.ZodEnum<{
                "sviluppo-pezzo-app": "sviluppo-pezzo-app";
                "design-sito": "design-sito";
                "design-schermata-app": "design-schermata-app";
                "design-ritocco": "design-ritocco";
            }>>;
            scope: z.ZodObject<{
                tenantId: z.ZodString;
                ownerId: z.ZodString;
                organizationId: z.ZodString;
                clientId: z.ZodOptional<z.ZodString>;
                projectId: z.ZodString;
                unitId: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            reference: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodObject<{
                    kind: z.ZodEnum<{
                        document: "document";
                        session: "session";
                        decision: "decision";
                        request: "request";
                        assignment: "assignment";
                    }>;
                    id: z.ZodString;
                }, z.core.$strict>;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            digest: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodString;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            model: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodObject<{
                    templateId: z.ZodOptional<z.ZodString>;
                    version: z.ZodInt;
                }, z.core.$strict>;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            nativeRevision: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodString;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            author: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodString;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            writtenAt: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodISODateTime;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            requirements: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodArray<z.ZodObject<{
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
                        modello: "modello";
                    }>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodUnion<readonly [z.ZodObject<{
                        state: z.ZodLiteral<"noto">;
                        value: z.ZodLiteral<"soddisfatto">;
                        proof: z.ZodObject<{
                            path: z.ZodString;
                            sha256: z.ZodString;
                        }, z.core.$strict>;
                        proofOrigin: z.ZodEnum<{
                            sessione: "sessione";
                            esecutore: "esecutore";
                            base: "base";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        state: z.ZodLiteral<"noto">;
                        value: z.ZodLiteral<"non_soddisfatto">;
                        reason: z.ZodString;
                        responsible: z.ZodEnum<{
                            director: "director";
                            capo: "capo";
                            sessione: "sessione";
                            referente: "referente";
                        }>;
                        nextAction: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        state: z.ZodLiteral<"noto">;
                        value: z.ZodLiteral<"da_revisionare">;
                        reason: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        state: z.ZodLiteral<"noto">;
                        value: z.ZodLiteral<"in_attesa">;
                        observed: z.ZodLiteral<"attestation_absent">;
                    }, z.core.$strict>, z.ZodObject<{
                        state: z.ZodLiteral<"non_noto">;
                        reason: z.ZodString;
                    }, z.core.$strict>]>;
                }, z.core.$strict>>;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
        }, z.core.$strict>>;
        breaks: z.ZodArray<z.ZodObject<{
            assignment: z.ZodString;
            code: z.ZodOptional<z.ZodEnum<{
                requirements_unresolved: "requirements_unresolved";
                criterion_unknown: "criterion_unknown";
                attestor_not_session: "attestor_not_session";
                attestor_not_executor: "attestor_not_executor";
                entry_duplicate: "entry_duplicate";
                attempt_stale: "attempt_stale";
                template_version_mismatch: "template_version_mismatch";
                contract_digest_mismatch: "contract_digest_mismatch";
                proof_missing: "proof_missing";
                proof_modified: "proof_modified";
                proof_origin_session: "proof_origin_session";
                entry_missing: "entry_missing";
                executor_result_missing: "executor_result_missing";
            }>>;
            requirementId: z.ZodOptional<z.ZodString>;
            proof: z.ZodString;
            origin: z.ZodEnum<{
                capo: "capo";
                mandato: "mandato";
                ritorno: "ritorno";
                modello: "modello";
            }>;
            source: z.ZodEnum<{
                paperclip: "paperclip";
                dev: "dev";
                agent_core: "agent_core";
            }>;
        }, z.core.$strict>>;
        sources: z.ZodArray<z.ZodObject<{
            source: z.ZodEnum<{
                paperclip: "paperclip";
                dev: "dev";
                agent_core: "agent_core";
            }>;
            complete: z.ZodBoolean;
            reason: z.ZodOptional<z.ZodString>;
            readAt: z.ZodNullable<z.ZodISODateTime>;
            sampledAt: z.ZodNullable<z.ZodISODateTime>;
        }, z.core.$strict>>;
        page: z.ZodObject<{
            complete: z.ZodBoolean;
            nextCursor: z.ZodNullable<z.ZodString>;
            reason: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly refusalSchema: z.ZodObject<{
        error: z.ZodEnum<{
            source_unavailable: "source_unavailable";
            scope_foreign: "scope_foreign";
            scope_unresolved: "scope_unresolved";
            cursor_invalid: "cursor_invalid";
        }>;
    }, z.core.$strict>;
};
/** agent-core: the board read that Forge uses; it merges the two sources and reports which one it could not read. */
export declare const internalCompanyContractsContract: {
    readonly method: "GET";
    readonly path: "/internal/company-board/contracts";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        cursor: z.ZodOptional<z.ZodString>;
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodOptional<z.ZodString>;
        projectId: z.ZodString;
        unitId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        scope: z.ZodObject<{
            tenantId: z.ZodString;
            ownerId: z.ZodString;
            organizationId: z.ZodString;
            clientId: z.ZodOptional<z.ZodString>;
            projectId: z.ZodString;
            unitId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        published: z.ZodObject<{
            package: z.ZodLiteral<"@x9-forge/contracts">;
            version: z.ZodString;
            commit: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        applied: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                mandate: "mandate";
                code_session: "code_session";
                design_session: "design_session";
                referent_email: "referent_email";
                lab_request: "lab_request";
                chief_question: "chief_question";
                unit_exchange: "unit_exchange";
                document_unit: "document_unit";
            }>;
            variant: z.ZodOptional<z.ZodEnum<{
                "sviluppo-pezzo-app": "sviluppo-pezzo-app";
                "design-sito": "design-sito";
                "design-schermata-app": "design-schermata-app";
                "design-ritocco": "design-ritocco";
            }>>;
            scope: z.ZodObject<{
                tenantId: z.ZodString;
                ownerId: z.ZodString;
                organizationId: z.ZodString;
                clientId: z.ZodOptional<z.ZodString>;
                projectId: z.ZodString;
                unitId: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            reference: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodObject<{
                    kind: z.ZodEnum<{
                        document: "document";
                        session: "session";
                        decision: "decision";
                        request: "request";
                        assignment: "assignment";
                    }>;
                    id: z.ZodString;
                }, z.core.$strict>;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            digest: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodString;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            model: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodObject<{
                    templateId: z.ZodOptional<z.ZodString>;
                    version: z.ZodInt;
                }, z.core.$strict>;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            nativeRevision: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodString;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            author: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodString;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            writtenAt: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodISODateTime;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
            requirements: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"noto">;
                value: z.ZodArray<z.ZodObject<{
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
                        modello: "modello";
                    }>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodUnion<readonly [z.ZodObject<{
                        state: z.ZodLiteral<"noto">;
                        value: z.ZodLiteral<"soddisfatto">;
                        proof: z.ZodObject<{
                            path: z.ZodString;
                            sha256: z.ZodString;
                        }, z.core.$strict>;
                        proofOrigin: z.ZodEnum<{
                            sessione: "sessione";
                            esecutore: "esecutore";
                            base: "base";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        state: z.ZodLiteral<"noto">;
                        value: z.ZodLiteral<"non_soddisfatto">;
                        reason: z.ZodString;
                        responsible: z.ZodEnum<{
                            director: "director";
                            capo: "capo";
                            sessione: "sessione";
                            referente: "referente";
                        }>;
                        nextAction: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        state: z.ZodLiteral<"noto">;
                        value: z.ZodLiteral<"da_revisionare">;
                        reason: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        state: z.ZodLiteral<"noto">;
                        value: z.ZodLiteral<"in_attesa">;
                        observed: z.ZodLiteral<"attestation_absent">;
                    }, z.core.$strict>, z.ZodObject<{
                        state: z.ZodLiteral<"non_noto">;
                        reason: z.ZodString;
                    }, z.core.$strict>]>;
                }, z.core.$strict>>;
                source: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"non_noto">;
                reason: z.ZodString;
            }, z.core.$strict>], "state">;
        }, z.core.$strict>>;
        breaks: z.ZodArray<z.ZodObject<{
            assignment: z.ZodString;
            code: z.ZodOptional<z.ZodEnum<{
                requirements_unresolved: "requirements_unresolved";
                criterion_unknown: "criterion_unknown";
                attestor_not_session: "attestor_not_session";
                attestor_not_executor: "attestor_not_executor";
                entry_duplicate: "entry_duplicate";
                attempt_stale: "attempt_stale";
                template_version_mismatch: "template_version_mismatch";
                contract_digest_mismatch: "contract_digest_mismatch";
                proof_missing: "proof_missing";
                proof_modified: "proof_modified";
                proof_origin_session: "proof_origin_session";
                entry_missing: "entry_missing";
                executor_result_missing: "executor_result_missing";
            }>>;
            requirementId: z.ZodOptional<z.ZodString>;
            proof: z.ZodString;
            origin: z.ZodEnum<{
                capo: "capo";
                mandato: "mandato";
                ritorno: "ritorno";
                modello: "modello";
            }>;
            source: z.ZodEnum<{
                paperclip: "paperclip";
                dev: "dev";
                agent_core: "agent_core";
            }>;
        }, z.core.$strict>>;
        sources: z.ZodArray<z.ZodObject<{
            source: z.ZodEnum<{
                paperclip: "paperclip";
                dev: "dev";
                agent_core: "agent_core";
            }>;
            complete: z.ZodBoolean;
            reason: z.ZodOptional<z.ZodString>;
            readAt: z.ZodNullable<z.ZodISODateTime>;
            sampledAt: z.ZodNullable<z.ZodISODateTime>;
        }, z.core.$strict>>;
        page: z.ZodObject<{
            complete: z.ZodBoolean;
            nextCursor: z.ZodNullable<z.ZodString>;
            reason: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly refusalSchema: z.ZodObject<{
        error: z.ZodEnum<{
            source_unavailable: "source_unavailable";
            scope_foreign: "scope_foreign";
            scope_unresolved: "scope_unresolved";
            cursor_invalid: "cursor_invalid";
        }>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-company-contracts.d.ts.map