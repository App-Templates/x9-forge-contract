# C5 Canali TG/email — bridge B

Ultimo aggiornamento: 08/10/2026 20:47 CEST.

B1 implementato e testato, prodotto `f5fef32`. Entro il lotto 20:33–21:18, nessuna riparazione del prodotto; una fixture CAS corretta nella qualifica (una versione applied paused diversa da desired active deve essere inferiore, non uguale). B2 segue; B3 dipende dall'integrazione HISTORY4 di C 89cc499, richiesta nella posta 204435. Nessun file di altri Codex modificato.

## Fruibilità alla consegna (R-34)

Pronti soltanto gli schemi e gli helper puri delle risorse TG/email degli agenti esistenti. Il percorso completo non è consegnato: mancano handler/persistenza/writer/provider, adozione dei context esistenti, consumer X9/Forge, pagina integrata e prova reale ingresso → turno → risposta. Zero bot/caselle creati, zero provider contattati, zero operazioni live. Applied nel contratto significa versione risorsa caricata o pausa applicata, non risposta dell'agente.

## B1 — contratto risorse

Comando browser senza identità, risorsa, credenziali o URL. Intento server con scope, tre identità, CAS e vecchia risorsa propria: creazione solo in assenza attestata, rotazione solo bot TG esistente. Ricevuta stretta pending/applied/failed/reconcile_pending; fallimento certo conserva risorsa, risorsa acquisita con errore impone riconciliazione. Applied richiede versione successiva ed evidenza runtime datata. Correlazione completa anche nei replay. Si riusano schemi canonical configuration/resource/binding/version/requestId/failure; nessuna tabella births/storico parallelo o modifica dei contratti precedenti.

| Elemento | Elemento della tavola | Stati coperti dal contratto |
|---|---|---|
| ResourceCommand/Intent | Agente: Crea bot, Crea casella; Configura TG: Rigenera | assente attestato, bot proprio esistente, CAS/stale, porta/owner/tenant/Vault incompatibili |
| ResourceResult | Stati: avanzamento, errore, riprova | pending, applied, failed, reconcile_pending; risorsa nota conservata e tempo/versione coerenti |
| IntentReady/ResultForIntent | Salva/riprova di una sola porta | CAS, identità, risorsa originale e requestId; replay identico |

## Prove rosso → verde

- Test prima del codice: 70/70 rossi per asserzioni di export assente usando il barrel esistente; 1/1 file raccolto correttamente. È una prova di disponibilità dell'API, non 70 dimostrazioni indipendenti del comportamento. Nessun import/timeout/runner error contato.
- Primo verde 70/70. Poi rafforzati i confini indipendenti: 79/79 nuovi test nel file corrente, inclusi nella full.
- Mutazioni finali **34/34** rosse per asserzioni pertinenti, ripristino SHA `f10b666d8b49fe7121e0bdef51b2b365258d293c7ba7a0fb96c434f5d6f2ff76` e successiva full verde. Il primo giro era 24/32: otto controlli non erano isolati da casi validi. Il secondo 31/32: CAS applied era mascherato da fixture invalida, corretta e con validità canonical esplicitamente verificata. Questi giri intermedi non vengono sommati al totale finale.
- Full source nativa **4294/4294**, **153/153** file, zero falliti/saltati; include 79 nuovi e 4215 precedenti. Node24/env-i, worker1, no-file-parallelism, no-cache, testTimeout60000.
- Typecheck nativo e lint completo: exit0, zero errori. Log originali e lista delle mutazioni in proof/. Nessuna configurazione del runner o asserzione precedente cambiata.
- **Dist/build/CJS/pack non eseguiti**: la coordinatrice 202442 ha escluso dist da questo worktree; F la rigenera e verifica all'integrazione 1.45. Non si dichiara qualificato il pacchetto compilato.

## Commit per compito

| Lotto | Prodotto + test | Prove |
|---|---|---|
| B1 | f5fef32 | B1-PROOF.json, B1-red/green/full/types/lint.log, B1-mutation-results.json e raw log; commit documentale immediatamente successivo |
| B2 | da eseguire | facciata Forge e progress |
| B3 | dipendenza richiesta | HISTORY4 unico di C, poi probe |

## Scelte da confermare

- Rigenera mantiene il bot: metadata canonici hanno username e data, non provider bot ID. Il consumer deve validare getMe e rotazione reale, senza delete/create.
- Null non prova da solo assenza al provider: produttore deve risolvere legacy/unknown e riconciliare prima di creare. Gli helper non sostituiscono autorizzazione, freshness, lock, persistenza o attestation del provider.
- Manual-token oggi ricarica l'agente intero (Forge00a468 rotate-telegram-token.ts:92). Cambiare questo flusso alla sola porta richiede decisione precisa R-35, già segnalata 203714.
- Storico C 89cc499 non presente nella base ae7c464; B3 aspetta integrazione autorizzata. Pin/vendor consumer148/149 e dist competono alla coordinatrice/F, non a B.
