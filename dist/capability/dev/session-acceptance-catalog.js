// Capabilities of the checking program; a session cannot supply these proofs itself.
export const DEV_SESSION_ACCEPTANCE_NEEDS = ['commit', 'prove_run', 'browser', 'screenshot', 'skill_log', 'gate', 'detector', 'static_scan', 'package', 'file_list', 'clean_install', 'score_file'];
// D-10 still awaits a defined change perimeter. Version 2 adds excellence checks without
// expanding saved version 1 forms; numeric thresholds belong to the selected model only.
export const DEV_SESSION_ACCEPTANCE_CATALOG = {
    'D-01': {
        attestor: 'esecutore', needs: ['skill_log'],
        text: 'La skill obbligatoria è stata caricata prima del primo file di interfaccia',
        proof: 'riga dello strumento `Skill` nel registro della sessione',
    },
    'D-02': {
        attestor: 'esecutore', needs: ['gate'],
        text: 'Il cancello finale passa sui file consegnati',
        proof: 'uscita del cancello rilanciato da lui',
    },
    'D-03': {
        attestor: 'esecutore', needs: ['detector'],
        text: 'Il rilevatore non trova difetti bloccanti sui file consegnati',
        proof: 'uscita del rilevatore rilanciato da lui',
    },
    'D-04': {
        attestor: 'esecutore', needs: ['static_scan'],
        text: "Nessun errore di movimento dell'elenco, movimento ridotto gestito",
        proof: 'ricerca sui file consegnati',
    },
    'D-05': {
        attestor: 'esecutore', needs: ['screenshot'],
        text: "C'è almeno un'immagine per ogni sezione chiesta, ogni comportamento chiesto (stati e interazioni principali), ogni formato e ogni elemento identificativo (ingresso, navigazione, schermata del risultato)",
        proof: 'schermate fatte da lui, con impronta',
    },
    'D-06': {
        attestor: 'esecutore', needs: ['static_scan'],
        text: 'Colori, caratteri e loghi usano i token degli asset del marchio disponibili, salvo gli scostamenti dichiarati con il motivo',
        proof: 'confronto dei file consegnati con i token del marchio e gli scostamenti dichiarati',
    },
    'D-07': {
        attestor: 'sessione', needs: [],
        text: 'Ogni stato chiesto è disegnato',
        proof: "file per stato, elencati nell'attestazione",
    },
    'D-08': {
        attestor: 'sessione', needs: [],
        text: 'Scostamenti dal brand dichiarati con il motivo',
        proof: "elenco nell'attestazione, anche vuoto",
    },
    'D-09': {
        attestor: 'esecutore', needs: ['package'],
        // Stefano 21/11: no fixed count; the sheet is one pdf with every screen, the demo is one
        // self-contained page served by link. Id, attestor and the `package` need stay, so saved
        // contracts and templates at version 1 keep working.
        text: 'Il pacchetto per il referente ha un pdf con ogni schermata disponibile della consegna e il collegamento alla demo navigabile, senza un numero fisso di schermate',
        proof: 'controllo del pacchetto',
    },
    'D-11': {
        attestor: 'referente', needs: [],
        text: 'Il design è quello che serve',
        proof: "risposta alla richiesta di decisione, con l'anteprima",
    },
    // Design tools (8210): the catalog used to name no skill beyond "the mandatory one" (D-01), so the
    // final Impeccable check, Emil before motion and Playwright on the served page were enforced only
    // by the harness mod. These three let the executor attest them from the session log (`skill_log`
    // is the session registry, also for Playwright tool lines). Ids are new, so saved contracts are
    // untouched: form criteria are expanded from each consumer's own copy of this package.
    'D-12': {
        attestor: 'esecutore', needs: ['skill_log'],
        text: "Dopo l'ultima modifica a un file di interfaccia la sessione ha lanciato la verifica finale di Impeccable (audit o critique; su un'app anche polish)",
        proof: "riga dello strumento `Skill` di Impeccable con il suo comando, nel registro della sessione, dopo l'ultima scrittura di un file di interfaccia",
    },
    'D-13': {
        attestor: 'esecutore', needs: ['skill_log'],
        text: 'La skill emil-design-eng è stata caricata prima del primo file con movimento (transizioni, animazioni, librerie di movimento); se la consegna non ha movimento il requisito è soddisfatto',
        proof: 'riga dello strumento `Skill` nel registro della sessione, prima del primo file con movimento',
    },
    'D-14': {
        attestor: 'esecutore', needs: ['skill_log'],
        text: "Dopo l'ultima modifica la sessione ha guardato con Playwright la pagina servita da un server locale, a 390 e a 1440 px",
        proof: "righe degli strumenti di Playwright nel registro della sessione, dopo l'ultima scrittura di un file di interfaccia",
    },
    'D-15': {
        attestor: 'esecutore', needs: ['skill_log'],
        text: 'La sessione ha esaminato i design approvati e gli esempi di eccellenza disponibili prima di scegliere la direzione visiva',
        proof: 'registro della sessione con i materiali esaminati e il confronto che motiva la direzione scelta; assenze dichiarate',
    },
    'D-16': {
        attestor: 'esecutore', needs: ['skill_log', 'file_list'],
        text: 'La sessione ha esplorato direzioni visive distinte con la skill prototype e ha scelto la migliore motivando il confronto',
        proof: 'registro della skill e file delle alternative confrontate con la scelta motivata',
    },
    'D-17': {
        attestor: 'esecutore', needs: ['skill_log'],
        text: 'La sessione ha usato le skill obbligatorie Impeccable, Taste ed Emil nei passaggi pertinenti, correggendo i problemi emersi prima della consegna',
        proof: 'registro delle skill usate, delle verifiche e delle correzioni successive sui file consegnati',
    },
    'D-18': {
        attestor: 'esecutore', needs: ['score_file'],
        text: 'I punteggi finali di audit e critique rispettano le soglie del modello, con le voci non applicabili dichiarate',
        proof: 'file dei punteggi sul risultato consegnato, con dimensioni, voci valutate, totali e massimi verificabili',
    },
    'D-19': {
        attestor: 'esecutore', needs: ['detector'],
        text: 'Il rilevatore verifica gli errori di design e i dettagli sui file finali; ogni eccezione è dichiarata e motivata dalla sessione',
        proof: 'uscita del rilevatore sui file consegnati, confrontata con le eccezioni motivate',
    },
    'D-20': {
        attestor: 'esecutore', needs: ['skill_log'],
        text: 'La sessione ha rifinito gerarchia, tipografia, spaziature, stati e dettagli delle interazioni con le skill pertinenti',
        proof: 'registro della rifinitura finale e delle correzioni sui dettagli del risultato consegnato',
    },
    'D-21': {
        attestor: 'referente', needs: [],
        text: 'Il referente conferma i punteggi entro lo scarto ammesso dal modello, la fedeltà al marchio quando applicabile e il livello degli esempi disponibili',
        proof: 'voto del referente sulla stessa griglia di audit, con valutazione del marchio e confronto con gli esempi disponibili',
    },
    'S-01': {
        attestor: 'esecutore', needs: ['commit'],
        text: 'I sorgenti sono in un commit raggiungibile',
        proof: 'commit del lavoro nel manifesto',
    },
    'S-02': {
        attestor: 'esecutore', needs: ['prove_run'],
        text: "Le prove passano sull'albero del commit",
        proof: 'uscita dei comandi di prova, lanciati dopo il commit',
    },
    'S-03': {
        attestor: 'esecutore', needs: ['browser'],
        text: 'Le prove nel browser passano dopo il commit',
        proof: 'uscita di `test:browser`',
    },
    'S-04': {
        attestor: 'esecutore', needs: ['screenshot'],
        text: 'Ogni schermata del percorso ha la sua immagine con impronta',
        proof: 'schermate fatte da lui',
    },
    'S-05': {
        attestor: 'esecutore', needs: ['prove_run'],
        text: "Il percorso dell'utente funziona dall'inizio alla fine sui dati dichiarati",
        proof: 'prova del percorso, comando della richiesta',
    },
    'S-06': {
        attestor: 'referente', needs: [],
        text: 'Le schermate corrispondono alla tavola di design',
        proof: 'confronto fra immagini',
    },
    'S-07': {
        attestor: 'esecutore', needs: ['file_list'],
        text: 'I file cambiati stanno nel perimetro',
        proof: 'elenco dei file del commit',
    },
    'S-08': {
        attestor: 'sessione', needs: [],
        text: 'Che cosa è stato fatto e che cosa no, in parole',
        proof: 'attestazione',
    },
    'S-09': {
        attestor: 'esecutore', needs: ['package'],
        text: 'Il foglio di consegna è valido',
        proof: 'controllo del pacchetto',
    },
    'S-10': {
        attestor: 'referente', needs: [],
        text: "L'utente può usare il pezzo",
        proof: "risposta alla richiesta di decisione, con l'anteprima",
    },
    // Stefano, 20/11: the work must build from a clean install (R56 failed because the executor
    // re-ran the proofs without dependencies while the session's build was green). Without a
    // package.json the executor attests that there was nothing to install.
    'S-11': {
        attestor: 'esecutore', needs: ['clean_install'],
        text: "Il lavoro si costruisce da un'installazione pulita: se il progetto ha un package.json, le dipendenze si installano dal lockfile consegnato prima delle prove",
        proof: "uscita dell'installazione lanciata da lui sull'albero del commit, prima delle prove",
    },
};
//# sourceMappingURL=session-acceptance-catalog.js.map