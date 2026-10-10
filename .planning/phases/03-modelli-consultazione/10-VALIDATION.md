---
phase: 10
slug: modelli-consultazione
status: planned
nyquist_compliant: false
wave_0_complete: false
created: 2026-10-09
---
# Strategia di verifica — da eseguire dopo il gate

I campi compliant/wave_0 sono false perché non sono stati eseguiti test di prodotto in questa preparazione. La verifica documentale dei piani non li rende true.

| Criterio | Contratto / sorgente | Prova negativa necessaria | Prova composta / visuale |
|---|---|---|---|
| AC01 | identità/mapping e epoch | ritorno tardivo A dopo B; slug/management diversi | due agenti, cambio mentre risposta A attende |
| AC02 | coverage/origin e selezioni osservate | uguale al Master ma custom; provenance mancante | valore fonte confrontato con riga, origine unknown non inventata |
| AC03 | desired/default/applied versionati | desired nuovo/applied vecchio o assente | dettaglio discordanza leggibile, mai «chiamata verificata» |
| AC04 | observedAt e stato refresh | fonte fallisce dopo successo; risponde dopo revoca | stale visibile solo nello stesso scope; nuovo timestamp solo da risposta valida |
| AC05 | inventario/copertura | legacy omesso; cap timeout; zero senza coverage | complete0 distinto da partial/absent/unknown |
| AC06 | errore per scope/funzione | catalogo offline mentre configurato è valido | righe valide conservate, motivo e solo GET al retry |
| AC07 | sessione/renderer readonly | click/Enter e retry tentando invio writer | zero POST/PUT/PATCH/DELETE, zero preview/batch/Applica |
| AC08 | auth server e owner DB | ownerB rivendicato in coverage/riga; logout/403 | SA/owner autorizzato, rimozione immediata dati alla revoca |

## Comandi e sequenza futura

Prima esecuzione: baseline sui candidati esatti e runtime già configurato senza leggere .env; raccogliere comando, SHA, versione dipendenze, uscita e conteggio N/N. Poi test nuovo rosso semantico prima dell’implementazione; dopo ogni guardia eliminata in copia temporanea: rosso, ripristino byte-identico e verde fresco. Non è sufficiente un test che ripeta le condizioni del codice senza attraversare la rotta o il renderer.

- F bridge: pnpm test, pnpm typecheck, pnpm lint, pnpm build, pnpm check:dts, pnpm check:pack; smoke ESM/CJS sui barrel http/model-router e fixture vecchie/nuove dopo la build.
- D: pnpm -C services/agent-core exec vitest run src/tests/c5-modelli; tipi/build nativi verificati dal package corrente. Test Fastify montano le vere route e reader; nessuna configurazione provider o credenziale reale.
- B: pnpm -C services/vault test e pnpm -C services/factory test; typecheck/lint/build dei due servizi. Scenari PGlite reali con schema esistente e zero cambi delle tabelle configurazione/batch/audit dopo GET. Se manca migration0010, indisponibilità dichiarata, nessun push schema.
- C: pnpm -C web exec vitest run (config nativa individuata dal repo), pnpm -C web exec tsc -b, pnpm -C web lint, pnpm -C web build; browser sulla pagina vera con traffico registrato e controllo metodo. Verificare script/config prima di eseguire, non creare alias per far passare la suite.
- Integrato: stessa versione bridge/pin attraverso tutti gli anelli; confronto API→pagina su due owner e SA; screenshot/tastiera/8stati; caso modello discordante; ripristino procedura C esistente. L’operatore autorizzato rilascia, poi verificatore prova il percorso e riferisce link ambiente e ID candidato tramite X9.

## Denominatori

Otto AC pianificati, zero/otto verificati sul prodotto nuovo durante questa preparazione. Il numero di agenti/funzioni si ricava dall’inventario autorizzato all’esecuzione (observed/expected), non dai vecchi13/34. Conteggi test raccolti per suite e file con skip/failure espliciti; nessun vecchio full vale per il candidato nuovo. Lista delle mutazioni e relativo controllo devono risultare entrambi con denominatore esplicito, non «tutti verdi» senza raw. Primo fallimento infrastrutturale non è mutazione di prodotto. Review indipendente include almeno un campione causale e la prova completa degli8AC.

## Sicurezza

ASVS livello1 come riferimento della skill, controlli pertinenti al confine auth/scoping/privacy. Rischi alti: cross-owner, riflesso di dati privati, scrittura inattesa. Un rischio alto aperto blocca il candidato. Nessuna nuova libreria/servizio/DB schema previsto, quindi nessun schema push richiesto. Non disabilitare sicurezza o test nativi per ottenere un verde.


## Precisazioni dopo review C — due P2 documentali

Nel futuro test del bridge W01..W03 il comando riguarda solo A valido: B estraneo partial/unavailable/unknown non deve bloccarlo. W04 mantiene il rifiuto per A richiesto partial/unavailable; controlli installation/origin sugli slot richiesti. Il parsing strutturale globale non viene allentato.
I01..I04 confrontano full identity coverage/righe con sameModelAgentIdentity e owner coerente, unicità del record coverage per management, AgentRuntimeIdentitiesSchema sull’unione deduplicata e guardia vault esplicita (non fornita dal validatore attuale), più missingSlots non contraddittori. Test futuri; nessun codice o test prodotto eseguito ora.
