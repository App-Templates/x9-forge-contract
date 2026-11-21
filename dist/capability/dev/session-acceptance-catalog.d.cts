export declare const DEV_SESSION_ACCEPTANCE_NEEDS: readonly ["commit", "prove_run", "browser", "screenshot", "skill_log", "gate", "detector", "static_scan", "package", "file_list", "clean_install"];
export declare const DEV_SESSION_ACCEPTANCE_CATALOG: {
    readonly 'D-01': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["skill_log"];
        readonly text: "La skill obbligatoria è stata caricata prima del primo file di interfaccia";
        readonly proof: "riga dello strumento `Skill` nel registro della sessione";
    };
    readonly 'D-02': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["gate"];
        readonly text: "Il cancello finale passa sui file consegnati";
        readonly proof: "uscita del cancello rilanciato da lui";
    };
    readonly 'D-03': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["detector"];
        readonly text: "Il rilevatore non trova difetti bloccanti sui file consegnati";
        readonly proof: "uscita del rilevatore rilanciato da lui";
    };
    readonly 'D-04': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["static_scan"];
        readonly text: "Nessun errore di movimento dell'elenco, movimento ridotto gestito";
        readonly proof: "ricerca sui file consegnati";
    };
    readonly 'D-05': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["screenshot"];
        readonly text: "C'è almeno un'immagine per ogni sezione chiesta, ogni comportamento chiesto (stati e interazioni principali), ogni formato e ogni elemento identificativo (ingresso, navigazione, schermata del risultato)";
        readonly proof: "schermate fatte da lui, con impronta";
    };
    readonly 'D-07': {
        readonly attestor: "sessione";
        readonly needs: readonly [];
        readonly text: "Ogni stato chiesto è disegnato";
        readonly proof: "file per stato, elencati nell'attestazione";
    };
    readonly 'D-08': {
        readonly attestor: "sessione";
        readonly needs: readonly [];
        readonly text: "Scostamenti dal brand dichiarati con il motivo";
        readonly proof: "elenco nell'attestazione, anche vuoto";
    };
    readonly 'D-09': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["package"];
        readonly text: "Il pacchetto per il referente ha un pdf con ogni schermata disponibile della consegna e il collegamento alla demo navigabile, senza un numero fisso di schermate";
        readonly proof: "controllo del pacchetto";
    };
    readonly 'D-11': {
        readonly attestor: "referente";
        readonly needs: readonly [];
        readonly text: "Il design è quello che serve";
        readonly proof: "risposta alla richiesta di decisione, con l'anteprima";
    };
    readonly 'D-12': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["skill_log"];
        readonly text: "Dopo l'ultima modifica a un file di interfaccia la sessione ha lanciato la verifica finale di Impeccable (audit o critique; su un'app anche polish)";
        readonly proof: "riga dello strumento `Skill` di Impeccable con il suo comando, nel registro della sessione, dopo l'ultima scrittura di un file di interfaccia";
    };
    readonly 'D-13': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["skill_log"];
        readonly text: "La skill emil-design-eng è stata caricata prima del primo file con movimento (transizioni, animazioni, librerie di movimento); se la consegna non ha movimento il requisito è soddisfatto";
        readonly proof: "riga dello strumento `Skill` nel registro della sessione, prima del primo file con movimento";
    };
    readonly 'D-14': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["skill_log"];
        readonly text: "Dopo l'ultima modifica la sessione ha guardato con Playwright la pagina servita da un server locale, a 390 e a 1440 px";
        readonly proof: "righe degli strumenti di Playwright nel registro della sessione, dopo l'ultima scrittura di un file di interfaccia";
    };
    readonly 'S-01': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["commit"];
        readonly text: "I sorgenti sono in un commit raggiungibile";
        readonly proof: "commit del lavoro nel manifesto";
    };
    readonly 'S-02': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["prove_run"];
        readonly text: "Le prove passano sull'albero del commit";
        readonly proof: "uscita dei comandi di prova, lanciati dopo il commit";
    };
    readonly 'S-03': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["browser"];
        readonly text: "Le prove nel browser passano dopo il commit";
        readonly proof: "uscita di `test:browser`";
    };
    readonly 'S-04': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["screenshot"];
        readonly text: "Ogni schermata del percorso ha la sua immagine con impronta";
        readonly proof: "schermate fatte da lui";
    };
    readonly 'S-05': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["prove_run"];
        readonly text: "Il percorso dell'utente funziona dall'inizio alla fine sui dati dichiarati";
        readonly proof: "prova del percorso, comando della richiesta";
    };
    readonly 'S-06': {
        readonly attestor: "referente";
        readonly needs: readonly [];
        readonly text: "Le schermate corrispondono alla tavola di design";
        readonly proof: "confronto fra immagini";
    };
    readonly 'S-07': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["file_list"];
        readonly text: "I file cambiati stanno nel perimetro";
        readonly proof: "elenco dei file del commit";
    };
    readonly 'S-08': {
        readonly attestor: "sessione";
        readonly needs: readonly [];
        readonly text: "Che cosa è stato fatto e che cosa no, in parole";
        readonly proof: "attestazione";
    };
    readonly 'S-09': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["package"];
        readonly text: "Il foglio di consegna è valido";
        readonly proof: "controllo del pacchetto";
    };
    readonly 'S-10': {
        readonly attestor: "referente";
        readonly needs: readonly [];
        readonly text: "L'utente può usare il pezzo";
        readonly proof: "risposta alla richiesta di decisione, con l'anteprima";
    };
    readonly 'S-11': {
        readonly attestor: "esecutore";
        readonly needs: readonly ["clean_install"];
        readonly text: "Il lavoro si costruisce da un'installazione pulita: se il progetto ha un package.json, le dipendenze si installano dal lockfile consegnato prima delle prove";
        readonly proof: "uscita dell'installazione lanciata da lui sull'albero del commit, prima delle prove";
    };
};
//# sourceMappingURL=session-acceptance-catalog.d.ts.map