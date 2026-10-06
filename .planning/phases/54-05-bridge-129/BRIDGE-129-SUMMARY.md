# BRIDGE-129 · B1 e B7
Ultimo aggiornamento: 11:25 (06/10/2026)

Base: d8ef67f (v1.28.0). Branch: codex/bridge-129-params-outputs.
Stato: PRESO, fonti lette. Nessun consumer o rilascio in questo incarico.

## Compiti e commit
| Task | Stato | Commit | Prova |
| --- | --- | --- | --- |
| 1 B1 parametri | implementato e testato | 6730dfb | 0/63 → 63/63, tipi/lint OK |
| 2 B7 uscite, feedback, andamento | implementato e testato | 10e5e53 | 0/77 → 140/140 B1+B7, tipi/lint OK |
| 3 dichiarazioni, export, smoke | implementato e testato | 377d97b | 3/16 → 16/16; regressioni 209/209; CJS 31/36 → 36/36 |
| 4 versione e qualità | verificato | questo commit | 16/17 → 17/17; pnpm test 1140/1140 + CJS 36/36; qualità OK |
| 5 mutazioni | da fare | — | — |

## Fonti e scelte da confermare
- D54-11: tutto per agente e capability, nessun projectId nella configurazione.
- PIANO-SVILUPPI §B, HANDOFF D1/D13, FORGE-REDESIGN §7.3 e VISTA-PROGETTO §0/2: dichiarazioni facoltative nel manifest; vecchi manifest invariati.
- Le fonti richiedono letture/scritture ma non stabiliscono nuove rotte B1/B7: questa proposta aggiunge schemi e dichiarazioni. Le rotte per agente di v1.28 e la loro autenticazione restano intatte; nessun endpoint inventato. Da concordare con Samira prima dei consumer.
- Parametri ordinari, mai credenziali: env-schema/vault restano il percorso delle chiavi. Nessun default di prodotto scelto dal bridge.
- Da quando vale: immediate oppure next_apply, coerente con D1. I valori dichiarano platform_default, agent_override o needs_choice.
- B7: la fonte è il tipo e l’identità della vista/app, distinta dal reviewerId autenticato. Content è JSON di dominio; i consumer ne verificano i campi dichiarati prima di renderlo. Solo rating 1–10 in questa proposta; approva/chiedi modifiche richiede un futuro contratto. Andamento giornaliero con unità dichiarata e valori finiti, anche negativi.
- Consumer previsti: Forge fase 33 (parametri); agent-x9 capability (dichiarazioni, prima cap-food); vista di progetto esterna/app di dominio (B7). Aggiornamenti fuori repo affidati alla coordinatrice/Samira.

## Prove
Task 1: tutti i 63 test nuovi hanno fallito per export assente (asserzione, nessun errore di raccolta); poi 63/63 verdi. Tipi e lint dei file nuovi riusciti. Mutazioni nel Task 5. Prove locali sintetiche, nessun servizio reale.

Task 2: 77/77 test nuovi visti rossi per export assente; 140/140 B1+B7 verdi. Collezioni rifiutano agenti/capability estranei e duplicati; date ordinate e reali, rating intero 1–10.

Task 3: 13/13 controlli nuovi rossi prima; i 3 casi preesistenti (legacy e autenticazione v1.28) erano già verdi. Poi 209/209 B1/B7/dichiarazioni/regressioni/smoke ESM; 36/36 CJS, build/dts, tipi e lint OK. Export parameters/presentation aggiunti nelle due mappe; manifest/registry dichiarano parameters e presentation facoltativi. Nessuna rotta nuova prevista dalle fonti: sola registrazione tramite il contratto manifest esistente.

Task 4: versione 1.29.0 e CHANGELOG proposta in review. Test versione visto rosso, 17/17 distribuzione verdi (16/16 sottopercorsi precedenti preservati). pnpm test 1140/1140 (82/82 file) + 36/36 CJS; tipi, lint, build/dts e check:pack riusciti senza warning. Dist 1024/1024 file identici byte per byte a build pulita in directory temporanea; nessun file vecchio rimosso. Alcune dichiarazioni enum rigenerate hanno solo ordine diverso delle proprietà, senza cambiare valori o tipi. Runner limitato a due worker/60 s.

## Resta
Mutazioni su copie per tutti i controlli nuovi, verifica finale del perimetro e consegna.
