# Passo 10 — Modelli, sola consultazione

Stato: PREPARAZIONE AUTORIZZATA; esecuzione NON autorizzata. Incarico coordinatrice 20261009-142727-coordinatrice-a-codex-f-info. Specifica FILIERA-BOOTSTRAP-SPEC.md:219. Snapshot 09/10/2026; SOURCES.json identifica le quattro basi e 29 file letti, senza leggere contesti/credenziali reali.

## Mandato e decisioni vincolanti

«Nella sezione Modelli vedo il modello realmente configurato per l’agente selezionato, con provenienza corretta e stati comprensibili.» Solo lettura, incluso Ricarica/Riprova e dettagli; nessun set/reset/preview/batch/Applica, bootstrap privato, priming, fanout o migrazione dati come effetto della lettura. Stack Forge/X9 e @x9-forge/contracts invariati. Nessun fork Paperclip né nuovo orchestratore/executor. Si recuperano B150-1, C153-1, D157-1, F156-1; i rispettivi lavori vecchi restano parcheggiati.

Riferimento funzionale FILIERA-F-MODELLI-CONSULTAZIONE v2, f-formato/v2/riferimento.json; manifest d2c64708cb69ce5eeb4b785681d0254d4ed2fbfae5782d87e5df4d9a1dffc80a. Review tecnica C acquisita, approvazione del referente assente: il piano non trasforma la review in consenso umano. Gli otto AC sono in 10-REQUIREMENTS.md, contratto UI in 10-UI-SPEC.md. Nessun ampliamento alla modifica dei modelli.

## Prima di eseguire qualunque piano

La coordinatrice deve chiudere esplicitamente il bootstrap (§14) e assegnare l’incremento e i task necessari nel Paperclip operativo, con un owner dell’intero risultato e verificatore diverso dagli autori. Le lettere nei piani indicano competenze proposte, non nuove assegnazioni. Si conferma il riferimento v2 attraverso X9 con decisione correlata; nessun silenzio vale approvazione. Si riesaminano HEAD/perimetri/AGENTS e disponibilità delle fonti al momento della ripresa. Questi piani sono un handoff: non sono registrati come nuova fase del prodotto e non avviano execute-phase dalla cartella filiera.

Ogni piano prodotto opera in UN solo repo e worktree personale assegnato, con branch proprio. 10-03 e 10-04 riguardano Forge, su perimetri separati; niente checkout della cartella principale. La fase contenitore in 166-1 conserva solo documentazione. La migrazione nel progetto GSD/ROADMAP pertinente si farà dopo l’assegnazione reale, senza inventare issue o assignee. Questa preparazione non modifica la roadmap globale né lo stato dei vecchi task.

## Esclusioni e limiti

Non completare le 18 pianificazioni D59, la fase F02 o tutto Modelli come prerequisito indistinto. Un contratto/reader necessario si estrae in un task minimo, mantenendo le compatibilità. Installatori e modifiche capability di E sono fuori incremento; una funzione non osservabile resta esplicitamente non verificata. Se una sorgente minima non esiste si richiede il solo raccordo necessario, senza inventare un modello o dichiarare assenza.
Nessun segreto, .env, context.json reale, server SSH o Docker condiviso; nessun push/merge/deploy da Codex senza OK di Stefano. Il rilascio finale è un passaggio esterno autorizzato con evidenza pubblica e prova del percorso, non un comando incluso nel piano.

## Metodo GSD adattato al mandato

Ricerca locale → CONTEXT/REQUIREMENTS/UI-SPEC → piani XML/frontmatter → VALIDATION → controllo strutturale e revisione indipendente nel pool esistente. Nessun subagent aggiuntivo: la priorità della bacheca sul pool prevale sulla delega standard della skill. Nessun auto-advance. La mancanza dell’approvazione finale del riferimento non impedisce la preparazione documentale richiesta.
