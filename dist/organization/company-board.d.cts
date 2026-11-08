import { z } from 'zod';
export declare const COMPANY_BOARD_UNIT_STATES: readonly ["al_lavoro", "fermo", "non_partito", "aspetta_referente", "aspetta_proprietario", "aspetta_director", "aspetta_reparto", "attesa_del_via", "approvato_non_ripartito", "errore", "in_pausa", "non_iniziato", "finito", "non_noto"];
export declare const CompanyBoardUnitStateSchema: z.ZodEnum<{
    errore: "errore";
    al_lavoro: "al_lavoro";
    fermo: "fermo";
    non_partito: "non_partito";
    aspetta_referente: "aspetta_referente";
    aspetta_proprietario: "aspetta_proprietario";
    aspetta_director: "aspetta_director";
    aspetta_reparto: "aspetta_reparto";
    attesa_del_via: "attesa_del_via";
    approvato_non_ripartito: "approvato_non_ripartito";
    in_pausa: "in_pausa";
    non_iniziato: "non_iniziato";
    finito: "finito";
    non_noto: "non_noto";
}>;
export type CompanyBoardUnitState = z.infer<typeof CompanyBoardUnitStateSchema>;
export declare const COMPANY_BOARD_PART_STATES: readonly ["fatto", "in_corso", "da_fare", "non_noto"];
export declare const CompanyBoardPartStateSchema: z.ZodEnum<{
    in_corso: "in_corso";
    non_noto: "non_noto";
    fatto: "fatto";
    da_fare: "da_fare";
}>;
export type CompanyBoardPartState = z.infer<typeof CompanyBoardPartStateSchema>;
export declare const COMPANY_BOARD_WAIT_KINDS: readonly ["referente", "proprietario", "director", "reparto", "guasto"];
export declare const CompanyBoardWaitKindSchema: z.ZodEnum<{
    director: "director";
    referente: "referente";
    proprietario: "proprietario";
    reparto: "reparto";
    guasto: "guasto";
}>;
export type CompanyBoardWaitKind = z.infer<typeof CompanyBoardWaitKindSchema>;
export declare const COMPANY_BOARD_HISTORY_KINDS: readonly ["passo", "messaggio", "materiale", "ricerca", "mandato", "approvazione", "richiesta_modifica", "tentativo_fallito"];
export declare const CompanyBoardHistoryKindSchema: z.ZodEnum<{
    ricerca: "ricerca";
    approvazione: "approvazione";
    passo: "passo";
    messaggio: "messaggio";
    materiale: "materiale";
    mandato: "mandato";
    richiesta_modifica: "richiesta_modifica";
    tentativo_fallito: "tentativo_fallito";
}>;
export type CompanyBoardHistoryKind = z.infer<typeof CompanyBoardHistoryKindSchema>;
export declare const COMPANY_BOARD_SOURCES: readonly ["piano", "decisioni", "materiali", "incarichi", "sessioni", "mappa", "spesa"];
export declare const CompanyBoardSourceNameSchema: z.ZodEnum<{
    piano: "piano";
    decisioni: "decisioni";
    materiali: "materiali";
    incarichi: "incarichi";
    sessioni: "sessioni";
    mappa: "mappa";
    spesa: "spesa";
}>;
export declare const CompanyBoardSourceSchema: z.ZodObject<{
    source: z.ZodEnum<{
        piano: "piano";
        decisioni: "decisioni";
        materiali: "materiali";
        incarichi: "incarichi";
        sessioni: "sessioni";
        mappa: "mappa";
        spesa: "spesa";
    }>;
    status: z.ZodEnum<{
        ok: "ok";
        non_disponibile: "non_disponibile";
        tagliata: "tagliata";
    }>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type CompanyBoardSource = z.infer<typeof CompanyBoardSourceSchema>;
export declare const COMPANY_BOARD_WAIT_ACTIONS: readonly ["rispondi", "sveglia", "dai_il_via", "apri_reparto"];
export declare const CompanyBoardWaitActionSchema: z.ZodEnum<{
    rispondi: "rispondi";
    sveglia: "sveglia";
    dai_il_via: "dai_il_via";
    apri_reparto: "apri_reparto";
}>;
export declare const CompanyBoardPersonSchema: z.ZodObject<{
    name: z.ZodString;
    initials: z.ZodString;
    role: z.ZodString;
}, z.core.$strict>;
export declare const CompanyBoardUnblockHintSchema: z.ZodObject<{
    channel: z.ZodEnum<{
        paperclip: "paperclip";
        persona: "persona";
        mail: "mail";
    }>;
    text: z.ZodString;
    /** Only for the link; never shown. */
    ref: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export declare const CompanyBoardWaitSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        director: "director";
        referente: "referente";
        proprietario: "proprietario";
        reparto: "reparto";
        guasto: "guasto";
    }>;
    who: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        initials: z.ZodString;
        role: z.ZodString;
    }, z.core.$strict>>;
    /** Every unit touched by the wait. */
    buSlugs: z.ZodArray<z.ZodString>;
    partIndex: z.ZodNullable<z.ZodNumber>;
    since: z.ZodNullable<z.ZodISODateTime>;
    what: z.ZodString;
    action: z.ZodNullable<z.ZodEnum<{
        rispondi: "rispondi";
        sveglia: "sveglia";
        dai_il_via: "dai_il_via";
        apri_reparto: "apri_reparto";
    }>>;
    unblockHint: z.ZodNullable<z.ZodObject<{
        channel: z.ZodEnum<{
            paperclip: "paperclip";
            persona: "persona";
            mail: "mail";
        }>;
        text: z.ZodString;
        /** Only for the link; never shown. */
        ref: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
    openIn: z.ZodNullable<z.ZodObject<{
        issueIdentifier: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CompanyBoardWait = z.infer<typeof CompanyBoardWaitSchema>;
export declare const CompanyBoardPartSchema: z.ZodObject<{
    index: z.ZodNumber;
    title: z.ZodString;
    state: z.ZodEnum<{
        in_corso: "in_corso";
        non_noto: "non_noto";
        fatto: "fatto";
        da_fare: "da_fare";
    }>;
    note: z.ZodNullable<z.ZodString>;
    at: z.ZodNullable<z.ZodISODateTime>;
    after: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
}, z.core.$strict>;
export declare const CompanyBoardComputerSessionSchema: z.ZodObject<{
    state: z.ZodEnum<{
        adesso: "adesso";
        oggi_finita: "oggi_finita";
    }>;
    at: z.ZodISODateTime;
    computerName: z.ZodNullable<z.ZodString>;
    what: z.ZodNullable<z.ZodString>;
    /** Null until the 5734 proof says whether stopping the lead stops this session. */
    stopsOnPause: z.ZodNullable<z.ZodBoolean>;
}, z.core.$strict>;
export declare const CompanyBoardHistoryEntrySchema: z.ZodObject<{
    at: z.ZodISODateTime;
    kind: z.ZodEnum<{
        ricerca: "ricerca";
        approvazione: "approvazione";
        passo: "passo";
        messaggio: "messaggio";
        materiale: "materiale";
        mandato: "mandato";
        richiesta_modifica: "richiesta_modifica";
        tentativo_fallito: "tentativo_fallito";
    }>;
    text: z.ZodString;
    mine: z.ZodBoolean;
}, z.core.$strict>;
export declare const CompanyBoardUnitActionsSchema: z.ZodObject<{
    sveglia: z.ZodObject<{
        available: z.ZodBoolean;
        reason: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    via: z.ZodObject<{
        available: z.ZodBoolean;
        reason: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    ferma: z.ZodObject<{
        available: z.ZodBoolean;
        reason: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    riprendi: z.ZodObject<{
        available: z.ZodBoolean;
        reason: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const CompanyBoardUnitSchema: z.ZodObject<{
    buSlug: z.ZodString;
    name: z.ZodString;
    /** From the plan; drives the colour. */
    typeId: z.ZodEnum<{
        dati: "dati";
        design: "design";
        sviluppo: "sviluppo";
        finanza: "finanza";
        marketing: "marketing";
    }>;
    /** Forge slug of the lead (`managementAgentId`). */
    leadAgentId: z.ZodNullable<z.ZodString>;
    referent: z.ZodObject<{
        name: z.ZodNullable<z.ZodString>;
        initials: z.ZodNullable<z.ZodString>;
        verified: z.ZodBoolean;
        missing: z.ZodBoolean;
    }, z.core.$strict>;
    state: z.ZodEnum<{
        errore: "errore";
        al_lavoro: "al_lavoro";
        fermo: "fermo";
        non_partito: "non_partito";
        aspetta_referente: "aspetta_referente";
        aspetta_proprietario: "aspetta_proprietario";
        aspetta_director: "aspetta_director";
        aspetta_reparto: "aspetta_reparto";
        attesa_del_via: "attesa_del_via";
        approvato_non_ripartito: "approvato_non_ripartito";
        in_pausa: "in_pausa";
        non_iniziato: "non_iniziato";
        finito: "finito";
        non_noto: "non_noto";
    }>;
    stateLabel: z.ZodString;
    since: z.ZodNullable<z.ZodISODateTime>;
    why: z.ZodString;
    late: z.ZodBoolean;
    alert: z.ZodNullable<z.ZodObject<{
        kind: z.ZodEnum<{
            errore: "errore";
            ritardo: "ritardo";
        }>;
        text: z.ZodString;
        attempts: z.ZodArray<z.ZodObject<{
            at: z.ZodISODateTime;
            text: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    waitingFor: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            director: "director";
            referente: "referente";
            proprietario: "proprietario";
            reparto: "reparto";
            guasto: "guasto";
        }>;
        who: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            initials: z.ZodString;
            role: z.ZodString;
        }, z.core.$strict>>;
        /** Every unit touched by the wait. */
        buSlugs: z.ZodArray<z.ZodString>;
        partIndex: z.ZodNullable<z.ZodNumber>;
        since: z.ZodNullable<z.ZodISODateTime>;
        what: z.ZodString;
        action: z.ZodNullable<z.ZodEnum<{
            rispondi: "rispondi";
            sveglia: "sveglia";
            dai_il_via: "dai_il_via";
            apri_reparto: "apri_reparto";
        }>>;
        unblockHint: z.ZodNullable<z.ZodObject<{
            channel: z.ZodEnum<{
                paperclip: "paperclip";
                persona: "persona";
                mail: "mail";
            }>;
            text: z.ZodString;
            /** Only for the link; never shown. */
            ref: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
        openIn: z.ZodNullable<z.ZodObject<{
            issueIdentifier: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    sharedAcrossProjects: z.ZodBoolean;
    parts: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        title: z.ZodString;
        state: z.ZodEnum<{
            in_corso: "in_corso";
            non_noto: "non_noto";
            fatto: "fatto";
            da_fare: "da_fare";
        }>;
        note: z.ZodNullable<z.ZodString>;
        at: z.ZodNullable<z.ZodISODateTime>;
        after: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strict>>;
    computerSession: z.ZodNullable<z.ZodObject<{
        state: z.ZodEnum<{
            adesso: "adesso";
            oggi_finita: "oggi_finita";
        }>;
        at: z.ZodISODateTime;
        computerName: z.ZodNullable<z.ZodString>;
        what: z.ZodNullable<z.ZodString>;
        /** Null until the 5734 proof says whether stopping the lead stops this session. */
        stopsOnPause: z.ZodNullable<z.ZodBoolean>;
    }, z.core.$strict>>;
    history: z.ZodArray<z.ZodObject<{
        at: z.ZodISODateTime;
        kind: z.ZodEnum<{
            ricerca: "ricerca";
            approvazione: "approvazione";
            passo: "passo";
            messaggio: "messaggio";
            materiale: "materiale";
            mandato: "mandato";
            richiesta_modifica: "richiesta_modifica";
            tentativo_fallito: "tentativo_fallito";
        }>;
        text: z.ZodString;
        mine: z.ZodBoolean;
    }, z.core.$strict>>;
    paused: z.ZodNullable<z.ZodObject<{
        at: z.ZodNullable<z.ZodISODateTime>;
        byOwner: z.ZodNullable<z.ZodBoolean>;
    }, z.core.$strict>>;
    actions: z.ZodObject<{
        sveglia: z.ZodObject<{
            available: z.ZodBoolean;
            reason: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        via: z.ZodObject<{
            available: z.ZodBoolean;
            reason: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        ferma: z.ZodObject<{
            available: z.ZodBoolean;
            reason: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        riprendi: z.ZodObject<{
            available: z.ZodBoolean;
            reason: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    pauseWarning: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type CompanyBoardUnit = z.infer<typeof CompanyBoardUnitSchema>;
export declare const CompanyBoardMilestoneSchema: z.ZodObject<{
    number: z.ZodNumber;
    buSlug: z.ZodString;
    dueDate: z.ZodNullable<z.ZodISODate>;
    closeCriterion: z.ZodString;
    state: z.ZodEnum<{
        aperta: "aperta";
        fatta: "fatta";
        scaduta: "scaduta";
        non_nota: "non_nota";
    }>;
}, z.core.$strict>;
export declare const CompanyBoardServiceSchema: z.ZodObject<{
    role: z.ZodEnum<{
        director: "director";
        ricerca_sviluppo: "ricerca_sviluppo";
    }>;
    name: z.ZodString;
    stateLabel: z.ZodString;
    why: z.ZodString;
    since: z.ZodNullable<z.ZodISODateTime>;
    servingProjects: z.ZodArray<z.ZodObject<{
        projectId: z.ZodString;
        what: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const CompanyBoardSpendSchema: z.ZodUnion<readonly [z.ZodObject<{
    status: z.ZodLiteral<"non_collegata">;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"ok">;
    scope: z.ZodEnum<{
        progetto: "progetto";
        azienda: "azienda";
    }>;
    usdPerEur: z.ZodNumber;
    since: z.ZodISODateTime;
    todayMicros: z.ZodNumber;
    totalMicros: z.ZodNumber;
    days: z.ZodArray<z.ZodObject<{
        date: z.ZodISODate;
        micros: z.ZodNumber;
    }, z.core.$strict>>;
    rows: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            director: "director";
            reparto: "reparto";
            ricerca_sviluppo: "ricerca_sviluppo";
            altro: "altro";
        }>;
        buSlug: z.ZodNullable<z.ZodString>;
        todayMicros: z.ZodNullable<z.ZodNumber>;
        totalMicros: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
    estimated: z.ZodBoolean;
}, z.core.$strict>]>;
export type CompanyBoardSpend = z.infer<typeof CompanyBoardSpendSchema>;
/** Project page. At most 40 units: agent-core cuts before building (the cut is declared in `sources`). */
export declare const CompanyBoardSchema: z.ZodObject<{
    units: z.ZodArray<z.ZodObject<{
        buSlug: z.ZodString;
        name: z.ZodString;
        /** From the plan; drives the colour. */
        typeId: z.ZodEnum<{
            dati: "dati";
            design: "design";
            sviluppo: "sviluppo";
            finanza: "finanza";
            marketing: "marketing";
        }>;
        /** Forge slug of the lead (`managementAgentId`). */
        leadAgentId: z.ZodNullable<z.ZodString>;
        referent: z.ZodObject<{
            name: z.ZodNullable<z.ZodString>;
            initials: z.ZodNullable<z.ZodString>;
            verified: z.ZodBoolean;
            missing: z.ZodBoolean;
        }, z.core.$strict>;
        state: z.ZodEnum<{
            errore: "errore";
            al_lavoro: "al_lavoro";
            fermo: "fermo";
            non_partito: "non_partito";
            aspetta_referente: "aspetta_referente";
            aspetta_proprietario: "aspetta_proprietario";
            aspetta_director: "aspetta_director";
            aspetta_reparto: "aspetta_reparto";
            attesa_del_via: "attesa_del_via";
            approvato_non_ripartito: "approvato_non_ripartito";
            in_pausa: "in_pausa";
            non_iniziato: "non_iniziato";
            finito: "finito";
            non_noto: "non_noto";
        }>;
        stateLabel: z.ZodString;
        since: z.ZodNullable<z.ZodISODateTime>;
        why: z.ZodString;
        late: z.ZodBoolean;
        alert: z.ZodNullable<z.ZodObject<{
            kind: z.ZodEnum<{
                errore: "errore";
                ritardo: "ritardo";
            }>;
            text: z.ZodString;
            attempts: z.ZodArray<z.ZodObject<{
                at: z.ZodISODateTime;
                text: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        waitingFor: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                director: "director";
                referente: "referente";
                proprietario: "proprietario";
                reparto: "reparto";
                guasto: "guasto";
            }>;
            who: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                initials: z.ZodString;
                role: z.ZodString;
            }, z.core.$strict>>;
            /** Every unit touched by the wait. */
            buSlugs: z.ZodArray<z.ZodString>;
            partIndex: z.ZodNullable<z.ZodNumber>;
            since: z.ZodNullable<z.ZodISODateTime>;
            what: z.ZodString;
            action: z.ZodNullable<z.ZodEnum<{
                rispondi: "rispondi";
                sveglia: "sveglia";
                dai_il_via: "dai_il_via";
                apri_reparto: "apri_reparto";
            }>>;
            unblockHint: z.ZodNullable<z.ZodObject<{
                channel: z.ZodEnum<{
                    paperclip: "paperclip";
                    persona: "persona";
                    mail: "mail";
                }>;
                text: z.ZodString;
                /** Only for the link; never shown. */
                ref: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>;
            openIn: z.ZodNullable<z.ZodObject<{
                issueIdentifier: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        sharedAcrossProjects: z.ZodBoolean;
        parts: z.ZodArray<z.ZodObject<{
            index: z.ZodNumber;
            title: z.ZodString;
            state: z.ZodEnum<{
                in_corso: "in_corso";
                non_noto: "non_noto";
                fatto: "fatto";
                da_fare: "da_fare";
            }>;
            note: z.ZodNullable<z.ZodString>;
            at: z.ZodNullable<z.ZodISODateTime>;
            after: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        }, z.core.$strict>>;
        computerSession: z.ZodNullable<z.ZodObject<{
            state: z.ZodEnum<{
                adesso: "adesso";
                oggi_finita: "oggi_finita";
            }>;
            at: z.ZodISODateTime;
            computerName: z.ZodNullable<z.ZodString>;
            what: z.ZodNullable<z.ZodString>;
            /** Null until the 5734 proof says whether stopping the lead stops this session. */
            stopsOnPause: z.ZodNullable<z.ZodBoolean>;
        }, z.core.$strict>>;
        history: z.ZodArray<z.ZodObject<{
            at: z.ZodISODateTime;
            kind: z.ZodEnum<{
                ricerca: "ricerca";
                approvazione: "approvazione";
                passo: "passo";
                messaggio: "messaggio";
                materiale: "materiale";
                mandato: "mandato";
                richiesta_modifica: "richiesta_modifica";
                tentativo_fallito: "tentativo_fallito";
            }>;
            text: z.ZodString;
            mine: z.ZodBoolean;
        }, z.core.$strict>>;
        paused: z.ZodNullable<z.ZodObject<{
            at: z.ZodNullable<z.ZodISODateTime>;
            byOwner: z.ZodNullable<z.ZodBoolean>;
        }, z.core.$strict>>;
        actions: z.ZodObject<{
            sveglia: z.ZodObject<{
                available: z.ZodBoolean;
                reason: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            via: z.ZodObject<{
                available: z.ZodBoolean;
                reason: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            ferma: z.ZodObject<{
                available: z.ZodBoolean;
                reason: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            riprendi: z.ZodObject<{
                available: z.ZodBoolean;
                reason: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        pauseWarning: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
    projectHistory: z.ZodArray<z.ZodObject<{
        at: z.ZodISODateTime;
        kind: z.ZodEnum<{
            ricerca: "ricerca";
            approvazione: "approvazione";
            passo: "passo";
            messaggio: "messaggio";
            materiale: "materiale";
            mandato: "mandato";
            richiesta_modifica: "richiesta_modifica";
            tentativo_fallito: "tentativo_fallito";
        }>;
        text: z.ZodString;
    }, z.core.$strict>>;
    project: z.ZodObject<{
        projectId: z.ZodString;
        name: z.ZodNullable<z.ZodString>;
        planVersion: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>;
    readAt: z.ZodISODateTime;
    summary: z.ZodString;
    director: z.ZodObject<{
        state: z.ZodEnum<{
            errore: "errore";
            al_lavoro: "al_lavoro";
            fermo: "fermo";
            non_partito: "non_partito";
            aspetta_referente: "aspetta_referente";
            aspetta_proprietario: "aspetta_proprietario";
            aspetta_director: "aspetta_director";
            aspetta_reparto: "aspetta_reparto";
            attesa_del_via: "attesa_del_via";
            approvato_non_ripartito: "approvato_non_ripartito";
            in_pausa: "in_pausa";
            non_iniziato: "non_iniziato";
            finito: "finito";
            non_noto: "non_noto";
        }>;
        doing: z.ZodNullable<z.ZodString>;
        wokenAt: z.ZodNullable<z.ZodISODateTime>;
        wokenWhy: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    milestoneLine: z.ZodNullable<z.ZodObject<{
        text: z.ZodString;
        overdue: z.ZodBoolean;
    }, z.core.$strict>>;
    milestones: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        buSlug: z.ZodString;
        dueDate: z.ZodNullable<z.ZodISODate>;
        closeCriterion: z.ZodString;
        state: z.ZodEnum<{
            aperta: "aperta";
            fatta: "fatta";
            scaduta: "scaduta";
            non_nota: "non_nota";
        }>;
    }, z.core.$strict>>;
    waits: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            director: "director";
            referente: "referente";
            proprietario: "proprietario";
            reparto: "reparto";
            guasto: "guasto";
        }>;
        who: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            initials: z.ZodString;
            role: z.ZodString;
        }, z.core.$strict>>;
        /** Every unit touched by the wait. */
        buSlugs: z.ZodArray<z.ZodString>;
        partIndex: z.ZodNullable<z.ZodNumber>;
        since: z.ZodNullable<z.ZodISODateTime>;
        what: z.ZodString;
        action: z.ZodNullable<z.ZodEnum<{
            rispondi: "rispondi";
            sveglia: "sveglia";
            dai_il_via: "dai_il_via";
            apri_reparto: "apri_reparto";
        }>>;
        unblockHint: z.ZodNullable<z.ZodObject<{
            channel: z.ZodEnum<{
                paperclip: "paperclip";
                persona: "persona";
                mail: "mail";
            }>;
            text: z.ZodString;
            /** Only for the link; never shown. */
            ref: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
        openIn: z.ZodNullable<z.ZodObject<{
            issueIdentifier: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    exchanges: z.ZodArray<z.ZodObject<{
        fromBu: z.ZodString;
        toBu: z.ZodString;
        what: z.ZodString;
        blocking: z.ZodBoolean;
        open: z.ZodBoolean;
    }, z.core.$strict>>;
    spend: z.ZodUnion<readonly [z.ZodObject<{
        status: z.ZodLiteral<"non_collegata">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"ok">;
        scope: z.ZodEnum<{
            progetto: "progetto";
            azienda: "azienda";
        }>;
        usdPerEur: z.ZodNumber;
        since: z.ZodISODateTime;
        todayMicros: z.ZodNumber;
        totalMicros: z.ZodNumber;
        days: z.ZodArray<z.ZodObject<{
            date: z.ZodISODate;
            micros: z.ZodNumber;
        }, z.core.$strict>>;
        rows: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                director: "director";
                reparto: "reparto";
                ricerca_sviluppo: "ricerca_sviluppo";
                altro: "altro";
            }>;
            buSlug: z.ZodNullable<z.ZodString>;
            todayMicros: z.ZodNullable<z.ZodNumber>;
            totalMicros: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>>;
        estimated: z.ZodBoolean;
    }, z.core.$strict>]>;
    sources: z.ZodArray<z.ZodObject<{
        source: z.ZodEnum<{
            piano: "piano";
            decisioni: "decisioni";
            materiali: "materiali";
            incarichi: "incarichi";
            sessioni: "sessioni";
            mappa: "mappa";
            spesa: "spesa";
        }>;
        status: z.ZodEnum<{
            ok: "ok";
            non_disponibile: "non_disponibile";
            tagliata: "tagliata";
        }>;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    company: z.ZodObject<{
        clientId: z.ZodString;
        name: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type CompanyBoard = z.infer<typeof CompanyBoardSchema>;
/** A project inside the company overview: units without `history`. */
export declare const CompanyOverviewProjectSchema: z.ZodObject<{
    units: z.ZodArray<z.ZodObject<{
        state: z.ZodEnum<{
            errore: "errore";
            al_lavoro: "al_lavoro";
            fermo: "fermo";
            non_partito: "non_partito";
            aspetta_referente: "aspetta_referente";
            aspetta_proprietario: "aspetta_proprietario";
            aspetta_director: "aspetta_director";
            aspetta_reparto: "aspetta_reparto";
            attesa_del_via: "attesa_del_via";
            approvato_non_ripartito: "approvato_non_ripartito";
            in_pausa: "in_pausa";
            non_iniziato: "non_iniziato";
            finito: "finito";
            non_noto: "non_noto";
        }>;
        name: z.ZodString;
        actions: z.ZodObject<{
            sveglia: z.ZodObject<{
                available: z.ZodBoolean;
                reason: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            via: z.ZodObject<{
                available: z.ZodBoolean;
                reason: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            ferma: z.ZodObject<{
                available: z.ZodBoolean;
                reason: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            riprendi: z.ZodObject<{
                available: z.ZodBoolean;
                reason: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        paused: z.ZodNullable<z.ZodObject<{
            at: z.ZodNullable<z.ZodISODateTime>;
            byOwner: z.ZodNullable<z.ZodBoolean>;
        }, z.core.$strict>>;
        typeId: z.ZodEnum<{
            dati: "dati";
            design: "design";
            sviluppo: "sviluppo";
            finanza: "finanza";
            marketing: "marketing";
        }>;
        buSlug: z.ZodString;
        referent: z.ZodObject<{
            name: z.ZodNullable<z.ZodString>;
            initials: z.ZodNullable<z.ZodString>;
            verified: z.ZodBoolean;
            missing: z.ZodBoolean;
        }, z.core.$strict>;
        why: z.ZodString;
        leadAgentId: z.ZodNullable<z.ZodString>;
        since: z.ZodNullable<z.ZodISODateTime>;
        waitingFor: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                director: "director";
                referente: "referente";
                proprietario: "proprietario";
                reparto: "reparto";
                guasto: "guasto";
            }>;
            who: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                initials: z.ZodString;
                role: z.ZodString;
            }, z.core.$strict>>;
            /** Every unit touched by the wait. */
            buSlugs: z.ZodArray<z.ZodString>;
            partIndex: z.ZodNullable<z.ZodNumber>;
            since: z.ZodNullable<z.ZodISODateTime>;
            what: z.ZodString;
            action: z.ZodNullable<z.ZodEnum<{
                rispondi: "rispondi";
                sveglia: "sveglia";
                dai_il_via: "dai_il_via";
                apri_reparto: "apri_reparto";
            }>>;
            unblockHint: z.ZodNullable<z.ZodObject<{
                channel: z.ZodEnum<{
                    paperclip: "paperclip";
                    persona: "persona";
                    mail: "mail";
                }>;
                text: z.ZodString;
                /** Only for the link; never shown. */
                ref: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>;
            openIn: z.ZodNullable<z.ZodObject<{
                issueIdentifier: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        stateLabel: z.ZodString;
        late: z.ZodBoolean;
        alert: z.ZodNullable<z.ZodObject<{
            kind: z.ZodEnum<{
                errore: "errore";
                ritardo: "ritardo";
            }>;
            text: z.ZodString;
            attempts: z.ZodArray<z.ZodObject<{
                at: z.ZodISODateTime;
                text: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        sharedAcrossProjects: z.ZodBoolean;
        parts: z.ZodArray<z.ZodObject<{
            index: z.ZodNumber;
            title: z.ZodString;
            state: z.ZodEnum<{
                in_corso: "in_corso";
                non_noto: "non_noto";
                fatto: "fatto";
                da_fare: "da_fare";
            }>;
            note: z.ZodNullable<z.ZodString>;
            at: z.ZodNullable<z.ZodISODateTime>;
            after: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        }, z.core.$strict>>;
        computerSession: z.ZodNullable<z.ZodObject<{
            state: z.ZodEnum<{
                adesso: "adesso";
                oggi_finita: "oggi_finita";
            }>;
            at: z.ZodISODateTime;
            computerName: z.ZodNullable<z.ZodString>;
            what: z.ZodNullable<z.ZodString>;
            /** Null until the 5734 proof says whether stopping the lead stops this session. */
            stopsOnPause: z.ZodNullable<z.ZodBoolean>;
        }, z.core.$strict>>;
        pauseWarning: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
    projectHistory: z.ZodArray<z.ZodObject<{
        at: z.ZodISODateTime;
        kind: z.ZodEnum<{
            ricerca: "ricerca";
            approvazione: "approvazione";
            passo: "passo";
            messaggio: "messaggio";
            materiale: "materiale";
            mandato: "mandato";
            richiesta_modifica: "richiesta_modifica";
            tentativo_fallito: "tentativo_fallito";
        }>;
        text: z.ZodString;
    }, z.core.$strict>>;
    project: z.ZodObject<{
        projectId: z.ZodString;
        name: z.ZodNullable<z.ZodString>;
        planVersion: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>;
    readAt: z.ZodISODateTime;
    summary: z.ZodString;
    director: z.ZodObject<{
        state: z.ZodEnum<{
            errore: "errore";
            al_lavoro: "al_lavoro";
            fermo: "fermo";
            non_partito: "non_partito";
            aspetta_referente: "aspetta_referente";
            aspetta_proprietario: "aspetta_proprietario";
            aspetta_director: "aspetta_director";
            aspetta_reparto: "aspetta_reparto";
            attesa_del_via: "attesa_del_via";
            approvato_non_ripartito: "approvato_non_ripartito";
            in_pausa: "in_pausa";
            non_iniziato: "non_iniziato";
            finito: "finito";
            non_noto: "non_noto";
        }>;
        doing: z.ZodNullable<z.ZodString>;
        wokenAt: z.ZodNullable<z.ZodISODateTime>;
        wokenWhy: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    milestoneLine: z.ZodNullable<z.ZodObject<{
        text: z.ZodString;
        overdue: z.ZodBoolean;
    }, z.core.$strict>>;
    milestones: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        buSlug: z.ZodString;
        dueDate: z.ZodNullable<z.ZodISODate>;
        closeCriterion: z.ZodString;
        state: z.ZodEnum<{
            aperta: "aperta";
            fatta: "fatta";
            scaduta: "scaduta";
            non_nota: "non_nota";
        }>;
    }, z.core.$strict>>;
    waits: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            director: "director";
            referente: "referente";
            proprietario: "proprietario";
            reparto: "reparto";
            guasto: "guasto";
        }>;
        who: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            initials: z.ZodString;
            role: z.ZodString;
        }, z.core.$strict>>;
        /** Every unit touched by the wait. */
        buSlugs: z.ZodArray<z.ZodString>;
        partIndex: z.ZodNullable<z.ZodNumber>;
        since: z.ZodNullable<z.ZodISODateTime>;
        what: z.ZodString;
        action: z.ZodNullable<z.ZodEnum<{
            rispondi: "rispondi";
            sveglia: "sveglia";
            dai_il_via: "dai_il_via";
            apri_reparto: "apri_reparto";
        }>>;
        unblockHint: z.ZodNullable<z.ZodObject<{
            channel: z.ZodEnum<{
                paperclip: "paperclip";
                persona: "persona";
                mail: "mail";
            }>;
            text: z.ZodString;
            /** Only for the link; never shown. */
            ref: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
        openIn: z.ZodNullable<z.ZodObject<{
            issueIdentifier: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    exchanges: z.ZodArray<z.ZodObject<{
        fromBu: z.ZodString;
        toBu: z.ZodString;
        what: z.ZodString;
        blocking: z.ZodBoolean;
        open: z.ZodBoolean;
    }, z.core.$strict>>;
    spend: z.ZodUnion<readonly [z.ZodObject<{
        status: z.ZodLiteral<"non_collegata">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"ok">;
        scope: z.ZodEnum<{
            progetto: "progetto";
            azienda: "azienda";
        }>;
        usdPerEur: z.ZodNumber;
        since: z.ZodISODateTime;
        todayMicros: z.ZodNumber;
        totalMicros: z.ZodNumber;
        days: z.ZodArray<z.ZodObject<{
            date: z.ZodISODate;
            micros: z.ZodNumber;
        }, z.core.$strict>>;
        rows: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                director: "director";
                reparto: "reparto";
                ricerca_sviluppo: "ricerca_sviluppo";
                altro: "altro";
            }>;
            buSlug: z.ZodNullable<z.ZodString>;
            todayMicros: z.ZodNullable<z.ZodNumber>;
            totalMicros: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>>;
        estimated: z.ZodBoolean;
    }, z.core.$strict>]>;
    sources: z.ZodArray<z.ZodObject<{
        source: z.ZodEnum<{
            piano: "piano";
            decisioni: "decisioni";
            materiali: "materiali";
            incarichi: "incarichi";
            sessioni: "sessioni";
            mappa: "mappa";
            spesa: "spesa";
        }>;
        status: z.ZodEnum<{
            ok: "ok";
            non_disponibile: "non_disponibile";
            tagliata: "tagliata";
        }>;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const CompanyOverviewSchema: z.ZodObject<{
    company: z.ZodObject<{
        clientId: z.ZodString;
        name: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    summary: z.ZodString;
    services: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<{
            director: "director";
            ricerca_sviluppo: "ricerca_sviluppo";
        }>;
        name: z.ZodString;
        stateLabel: z.ZodString;
        why: z.ZodString;
        since: z.ZodNullable<z.ZodISODateTime>;
        servingProjects: z.ZodArray<z.ZodObject<{
            projectId: z.ZodString;
            what: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    projects: z.ZodArray<z.ZodObject<{
        units: z.ZodArray<z.ZodObject<{
            state: z.ZodEnum<{
                errore: "errore";
                al_lavoro: "al_lavoro";
                fermo: "fermo";
                non_partito: "non_partito";
                aspetta_referente: "aspetta_referente";
                aspetta_proprietario: "aspetta_proprietario";
                aspetta_director: "aspetta_director";
                aspetta_reparto: "aspetta_reparto";
                attesa_del_via: "attesa_del_via";
                approvato_non_ripartito: "approvato_non_ripartito";
                in_pausa: "in_pausa";
                non_iniziato: "non_iniziato";
                finito: "finito";
                non_noto: "non_noto";
            }>;
            name: z.ZodString;
            actions: z.ZodObject<{
                sveglia: z.ZodObject<{
                    available: z.ZodBoolean;
                    reason: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                via: z.ZodObject<{
                    available: z.ZodBoolean;
                    reason: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                ferma: z.ZodObject<{
                    available: z.ZodBoolean;
                    reason: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                riprendi: z.ZodObject<{
                    available: z.ZodBoolean;
                    reason: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>;
            paused: z.ZodNullable<z.ZodObject<{
                at: z.ZodNullable<z.ZodISODateTime>;
                byOwner: z.ZodNullable<z.ZodBoolean>;
            }, z.core.$strict>>;
            typeId: z.ZodEnum<{
                dati: "dati";
                design: "design";
                sviluppo: "sviluppo";
                finanza: "finanza";
                marketing: "marketing";
            }>;
            buSlug: z.ZodString;
            referent: z.ZodObject<{
                name: z.ZodNullable<z.ZodString>;
                initials: z.ZodNullable<z.ZodString>;
                verified: z.ZodBoolean;
                missing: z.ZodBoolean;
            }, z.core.$strict>;
            why: z.ZodString;
            leadAgentId: z.ZodNullable<z.ZodString>;
            since: z.ZodNullable<z.ZodISODateTime>;
            waitingFor: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    director: "director";
                    referente: "referente";
                    proprietario: "proprietario";
                    reparto: "reparto";
                    guasto: "guasto";
                }>;
                who: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    initials: z.ZodString;
                    role: z.ZodString;
                }, z.core.$strict>>;
                /** Every unit touched by the wait. */
                buSlugs: z.ZodArray<z.ZodString>;
                partIndex: z.ZodNullable<z.ZodNumber>;
                since: z.ZodNullable<z.ZodISODateTime>;
                what: z.ZodString;
                action: z.ZodNullable<z.ZodEnum<{
                    rispondi: "rispondi";
                    sveglia: "sveglia";
                    dai_il_via: "dai_il_via";
                    apri_reparto: "apri_reparto";
                }>>;
                unblockHint: z.ZodNullable<z.ZodObject<{
                    channel: z.ZodEnum<{
                        paperclip: "paperclip";
                        persona: "persona";
                        mail: "mail";
                    }>;
                    text: z.ZodString;
                    /** Only for the link; never shown. */
                    ref: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>>;
                openIn: z.ZodNullable<z.ZodObject<{
                    issueIdentifier: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            stateLabel: z.ZodString;
            late: z.ZodBoolean;
            alert: z.ZodNullable<z.ZodObject<{
                kind: z.ZodEnum<{
                    errore: "errore";
                    ritardo: "ritardo";
                }>;
                text: z.ZodString;
                attempts: z.ZodArray<z.ZodObject<{
                    at: z.ZodISODateTime;
                    text: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            sharedAcrossProjects: z.ZodBoolean;
            parts: z.ZodArray<z.ZodObject<{
                index: z.ZodNumber;
                title: z.ZodString;
                state: z.ZodEnum<{
                    in_corso: "in_corso";
                    non_noto: "non_noto";
                    fatto: "fatto";
                    da_fare: "da_fare";
                }>;
                note: z.ZodNullable<z.ZodString>;
                at: z.ZodNullable<z.ZodISODateTime>;
                after: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
            }, z.core.$strict>>;
            computerSession: z.ZodNullable<z.ZodObject<{
                state: z.ZodEnum<{
                    adesso: "adesso";
                    oggi_finita: "oggi_finita";
                }>;
                at: z.ZodISODateTime;
                computerName: z.ZodNullable<z.ZodString>;
                what: z.ZodNullable<z.ZodString>;
                /** Null until the 5734 proof says whether stopping the lead stops this session. */
                stopsOnPause: z.ZodNullable<z.ZodBoolean>;
            }, z.core.$strict>>;
            pauseWarning: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
        projectHistory: z.ZodArray<z.ZodObject<{
            at: z.ZodISODateTime;
            kind: z.ZodEnum<{
                ricerca: "ricerca";
                approvazione: "approvazione";
                passo: "passo";
                messaggio: "messaggio";
                materiale: "materiale";
                mandato: "mandato";
                richiesta_modifica: "richiesta_modifica";
                tentativo_fallito: "tentativo_fallito";
            }>;
            text: z.ZodString;
        }, z.core.$strict>>;
        project: z.ZodObject<{
            projectId: z.ZodString;
            name: z.ZodNullable<z.ZodString>;
            planVersion: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>;
        readAt: z.ZodISODateTime;
        summary: z.ZodString;
        director: z.ZodObject<{
            state: z.ZodEnum<{
                errore: "errore";
                al_lavoro: "al_lavoro";
                fermo: "fermo";
                non_partito: "non_partito";
                aspetta_referente: "aspetta_referente";
                aspetta_proprietario: "aspetta_proprietario";
                aspetta_director: "aspetta_director";
                aspetta_reparto: "aspetta_reparto";
                attesa_del_via: "attesa_del_via";
                approvato_non_ripartito: "approvato_non_ripartito";
                in_pausa: "in_pausa";
                non_iniziato: "non_iniziato";
                finito: "finito";
                non_noto: "non_noto";
            }>;
            doing: z.ZodNullable<z.ZodString>;
            wokenAt: z.ZodNullable<z.ZodISODateTime>;
            wokenWhy: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        milestoneLine: z.ZodNullable<z.ZodObject<{
            text: z.ZodString;
            overdue: z.ZodBoolean;
        }, z.core.$strict>>;
        milestones: z.ZodArray<z.ZodObject<{
            number: z.ZodNumber;
            buSlug: z.ZodString;
            dueDate: z.ZodNullable<z.ZodISODate>;
            closeCriterion: z.ZodString;
            state: z.ZodEnum<{
                aperta: "aperta";
                fatta: "fatta";
                scaduta: "scaduta";
                non_nota: "non_nota";
            }>;
        }, z.core.$strict>>;
        waits: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                director: "director";
                referente: "referente";
                proprietario: "proprietario";
                reparto: "reparto";
                guasto: "guasto";
            }>;
            who: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                initials: z.ZodString;
                role: z.ZodString;
            }, z.core.$strict>>;
            /** Every unit touched by the wait. */
            buSlugs: z.ZodArray<z.ZodString>;
            partIndex: z.ZodNullable<z.ZodNumber>;
            since: z.ZodNullable<z.ZodISODateTime>;
            what: z.ZodString;
            action: z.ZodNullable<z.ZodEnum<{
                rispondi: "rispondi";
                sveglia: "sveglia";
                dai_il_via: "dai_il_via";
                apri_reparto: "apri_reparto";
            }>>;
            unblockHint: z.ZodNullable<z.ZodObject<{
                channel: z.ZodEnum<{
                    paperclip: "paperclip";
                    persona: "persona";
                    mail: "mail";
                }>;
                text: z.ZodString;
                /** Only for the link; never shown. */
                ref: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>;
            openIn: z.ZodNullable<z.ZodObject<{
                issueIdentifier: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        exchanges: z.ZodArray<z.ZodObject<{
            fromBu: z.ZodString;
            toBu: z.ZodString;
            what: z.ZodString;
            blocking: z.ZodBoolean;
            open: z.ZodBoolean;
        }, z.core.$strict>>;
        spend: z.ZodUnion<readonly [z.ZodObject<{
            status: z.ZodLiteral<"non_collegata">;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"ok">;
            scope: z.ZodEnum<{
                progetto: "progetto";
                azienda: "azienda";
            }>;
            usdPerEur: z.ZodNumber;
            since: z.ZodISODateTime;
            todayMicros: z.ZodNumber;
            totalMicros: z.ZodNumber;
            days: z.ZodArray<z.ZodObject<{
                date: z.ZodISODate;
                micros: z.ZodNumber;
            }, z.core.$strict>>;
            rows: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    director: "director";
                    reparto: "reparto";
                    ricerca_sviluppo: "ricerca_sviluppo";
                    altro: "altro";
                }>;
                buSlug: z.ZodNullable<z.ZodString>;
                todayMicros: z.ZodNullable<z.ZodNumber>;
                totalMicros: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>>;
            estimated: z.ZodBoolean;
        }, z.core.$strict>]>;
        sources: z.ZodArray<z.ZodObject<{
            source: z.ZodEnum<{
                piano: "piano";
                decisioni: "decisioni";
                materiali: "materiali";
                incarichi: "incarichi";
                sessioni: "sessioni";
                mappa: "mappa";
                spesa: "spesa";
            }>;
            status: z.ZodEnum<{
                ok: "ok";
                non_disponibile: "non_disponibile";
                tagliata: "tagliata";
            }>;
            reason: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CompanyOverview = z.infer<typeof CompanyOverviewSchema>;
export declare const CompanyListSchema: z.ZodObject<{
    companies: z.ZodArray<z.ZodObject<{
        directorAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        clientId: z.ZodString;
        name: z.ZodNullable<z.ZodString>;
        projects: z.ZodArray<z.ZodObject<{
            projectId: z.ZodString;
            name: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CompanyList = z.infer<typeof CompanyListSchema>;
//# sourceMappingURL=company-board.d.ts.map