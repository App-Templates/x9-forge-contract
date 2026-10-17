---
phase: 34-chiavi-complete-elenco-modifica-sincronizzazione-e-consumo-e
plan: '02'
subsystem: contracts
tags: [credentials, netatmo, esm, cjs]
requires: [bridge-f88d02a0, independent-plan-review]
provides: [canonical-public-netatmo-account-email, immutable-local-package]
affects: [Forge-178, X9-179]
tech-stack:
  added: []
  patterns: [native-zshy-dual-build, native-vitest-with-private-env-disabled-config]
key-files:
  modified: [src/agent/agent-credentials.ts, src/agent/agent-credential-services.ts, tests/agent/agent-credentials.test.ts, tests/agent/agent-credential-services.test.ts, tests/cjs/smoke.cjs, dist/**]
key-decisions: [NETATMO_EMAIL belongs to the Netatmo credential bundle with secret false]
requirements-covered-local-scope: [CHIAVI-01, CHIAVI-02, CHIAVI-04, CHIAVI-08]
completed: 2026-10-09
product-commit: 23fc0e10734f01a51a482e209c50eae1c08cf6c9
---

# Phase 34 Plan 02 — email pubblico nel bundle canonico Netatmo

NETATMO_EMAIL è ora una chiave nota e un campo stringa opzionale esplicito, classificato credential, servizio commerciale netatmo, secret:false, etichetta «Indirizzo email account Netatmo». I 42 metadati precedenti sono identici; il registro esporta 43 campi. Le chiavi dinamiche restano ammesse dallo schema, senza acquisire metadati conosciuti. Le classificazioni auth/settings e la loro separazione dalle credenziali commerciali restano coperte dalla suite canonica.

## Implementato e testato localmente

Base f88d02a0a8517fe9aca1d969f55dd340847425d9; branch codex/chiavi-100-bridge; worktree180 assegnato dalla coordinatrice 20261009-195943. Solo cinque file prodotto pianificati e 44 file dist generati. Versione 1.44.0 invariata. Nessuna modifica Forge/X9.

| Prova | Risultato |
|---|---|
| Rosso iniziale sorgenti | exit 1, 8 assertion fallite su 86 test; 78/86 passano. Include il controllo di copertura già esistente e i 7 nuovi casi. Mancanza known-key, shape esplicita e metadata dimostrata |
| Sorgenti finali mirati |87/87 test,2/2 file,exit 0|
| Suite bridge completa |4749/4749 test,164/164 file,0skip/todo,exit 0|
| Rosso iniziale dist ESM/CJS |exit 1 per assertion known-key in entrambi i loader reali|
| ESM/CJS compilati e archivio estratto |8/8check per formato;42/42 metadata precedenti identici;43 campi finali|
| CJS nativo |7/7 nuove assertion;36/36 main+6/6 bridge130+15/15 R7+16/16 catalog+39/39 batch,exit 0|
| Tipi consumer archivio |2/2 fixture .mts/.cts con chiave KnownCredentialKey e shape esplicita,exit 0|
| Controprove |14/14 sorgenti+24/24 dist privati+2/2 dichiarazioni archivio:40/40 intercettate semanticamente|
| Ripristini |40/40 byte/hash esatti,verde fresco dopo ciascuno;1512/1512 file dist identici dopo rebuild finale|
| Build/check:dts |exit 0,378/378 declaration portabili|
| typecheck/lint/check:pack |exit 0 ciascuno;profilo ATTW preesistente node16 con false-cjs ignorato|
| npm pack --ignore-scripts |exit 0;1514 entry;archivio locale sola lettura|

Comandi, exit code e log raw in proof/34-02/; PACKAGE-MANIFEST.json contiene fonti, hash dei file sorgente/compilati e archivio. Nessun valore o hash di credenziali reali. Node 24.14.1, pnpm 9.15.9, Vitest 3.2.4 effettivo del bridge; ambiente env-i e config privato envDir:false. Nessuna dipendenza aggiornata.

## Matrice delle controprove

| Famiglia nuova o estesa | Sorgente | ESM privato | CJS privato |
|---|---|---|---|
| known-key |rimozione dichiarazione|rimozione dichiarazione|rimozione dichiarazione|
| shape esplicita |rimozione campo|rimozione campo|rimozione campo|
| stringa opzionale |required/number/any separati|required/number/any separati|required/number/any separati|
| metadata pubblico canonico |rimozione/secret/kind/service/label separati|stessi5 tagli|stessi5 tagli|
| metadata non falsificabile |bypass separati di secret/kind/service/label|coperto dalla suite sorgenti|coperto dalla suite sorgenti|
| unknown resta unknown |guardia canonica preesistente nella suite|getter attribuisce provider|getter attribuisce provider|
|42 metadata precedenti identici |classificazioni canoniche nella suite|etichetta vecchia alterata|etichetta vecchia alterata|
|dichiarazioni nell'archivio |nessuna modifica sorgente|2 fixture loader|rimozione literal KnownCredentialKey e shape nel .d.cts,2 tagli separati|

Ogni taglio ha raw rosso semanticamente pertinente e exit nonzero, copia privata post-fix, ripristino byte per byte verificato con SHA256 e raw verde finale. I tagli compilati avvengono soltanto nella copia privata o nell'archivio estratto; nessun vendor condiviso viene mutato. Il contatore 40/40 separa le controprove dai 4749/4749 test.

## Pacchetto locale qualificato

Archivio: /private/tmp/codex-a-chiavi-completamento/proofs/34-02/x9-forge-contracts-1.44.0.tgz. Nome/versione e hash contenuto attestati da PACKAGE-MANIFEST.json. È l'artefatto locale utilizzabile dagli esecutori Forge 178/X9 179 dopo revisione; nessun SHA remoto inventato, pubblicazione o push. La copia estratta è qualificata con Node ESM, Node CommonJS e tsc nativi.

## Scostamenti e limiti

Il primo tentativo del consumer di tipi ha prodotto TS5112 perché TypeScript 6 rileva il tsconfig del cwd quando riceve file espliciti. Log conservato come packed-types-harness-failure; non conteggiato come rosso semantico. Il comando privato corretto usa --ignoreConfig, senza modificare configurazione o prodotto.

La menzione Vitest 4.1.4 nel contratto comune è relativa all'inventario generale/Vault: il bridge usa davvero 3.2.4; nessun upgrade introdotto. Il file STATE storico del bridge è tra milestone; lo stato complessivo della fase 34 è mantenuto dall'orchestratore in Forge 178. Non viene riscritto come se la fase intera fosse completata qui.

Implementato e testato offline il solo piano 34-02. La composizione Forge/X9 e l'adozione del pacchetto restano ai loro piani; consumer/provider reali non verificati dal vivo. Nessun punteggio100% o 10/10, nessun segreto/env reale, ~/.claude, server, deploy, push o merge.

## Revisione indipendente e commit

Revisione parent APPROVED 34-02: diff dei5 file prodotto e44 dist controllato, raw rossi e matrici 14+24 riletti, SHA archivio verificato,87/87 mirati ripetuti indipendentemente con exit 0. Log independent-parent-green incluso. Il piano è stato emendato con dist/** nel commit centrale c3dab5e7 prima di questo commit prodotto.

Commit prodotto locale 23fc0e10734f01a51a482e209c50eae1c08cf6c9:49 file,hook normali senza bypass. Prove e riepilogo in commit separato. L'artefatto locale attesta questo commit, mantenendo identico il proprio hash contenuto.

## Self-Check: PASSED

Letti piano emendato e SUMMARY; tutti i file dichiarati, prove e archivio presenti. Commit prodotto verificato in Git, hash archivio verificato,40/40 ripristini esatti e1512/1512 dist rigenerati identici. Nessun sorgente modificato dopo le prove e la revisione. Stato della fase complessiva demandato a Forge 178, senza attribuire completamento globale ai requisiti locali.
