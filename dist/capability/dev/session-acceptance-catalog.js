// Capabilities of the checking program; a session cannot supply these proofs itself.
export const DEV_SESSION_ACCEPTANCE_NEEDS = ['commit', 'prove_run', 'browser', 'screenshot', 'skill_log', 'gate', 'detector', 'static_scan', 'package', 'file_list', 'clean_install'];
// Criterion and proof texts are copied verbatim from the approved vertical tables.
// D-06 and D-10 await an asset-token type and a defined change perimeter.
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