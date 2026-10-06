# STATO

## 06/10/2026 — bridge 1.29 corretta, PRONTO PER REVISIONE (Codex B, BRIDGE-129)

R1–R7 chiuse: parametri generici con liste/pattern/optional/editableBy e limiti pubblici; feedback
rating/approval con nome e foto, scale numeriche dichiarate. Manifest/registry additivi, ESM/CJS aggiornati.
Lab allineato alla decisione Samira: models/budget obbligatori, spesa per agente, errori e ingest queued/status.
Questa è la sola eccezione non additiva verso 1.28, autorizzata perché lab non ha consumer e documentata nel CHANGELOG.

194 casi della prima consegna + 275 di revisione = 469/469 distinti, tutti visti rossi con asserzioni.
Suite finale 1436/1436 (93/93 file), CJS 36/36; tipi, lint, build/dts e check:pack con codice 0.
256/256 .d.ts portabili, 1024/1024 file dist identici alla build pulita.
Warning preesistente check:pack sulle types CJS del root; profilo/esclusioni invariati.
299/299 mutazioni in UN giro completo, baseline/ripristino 469/469 e hash sorgenti/dist intatti;
nessuna somma di lotti o timeout conteggiato. Riepiloghi compatti e copertura nominativa committati.

Nessuna nuova rotta B1/B7 prevista: salvataggio della config dal PUT per agente già esistente, come accetta Samira.
Nessun export precedente rimosso o rinominato, nessun consumer aggiornato, push, tag, merge o deploy.
Implementato e testato localmente; montaggio nei consumer e verifica dal vivo attendono revisione/rilascio.
APPROVE ricevuto; ritocchi neutri di CHANGELOG/JSDoc e report MD unico completati.
Dopo il JSDoc, mirati 119/119 e build 256/256 .d.ts; qualità completa sopra riferita a 233ca43.
SUMMARY: .planning/phases/54-05-bridge-129/BRIDGE-129-SUMMARY.md.
Coda B: 33-01 solo dopo il tag 1.29 e base/worktree preparati dalla coordinatrice; poi BRIDGE-130 e X9 56-01.

## 05/10/2026 — v1.28.0, contratti di cap-ricerca e cap-lab per agente (Claude, `feat/54-ricerca-lab-contracts`)

Fase 54 di agent-x9, piano 54-01, riallineato la sera stessa alla decisione di Stefano «tutto per agente».
Solo aggiunte: sottopercorsi `capability/ricerca` e `capability/lab`, rotte per agente in `http`. Contiene la
v1.27.1 (fix SEC 01/10) unita da `origin/main`. 967 test,
31/31 CJS, mutazioni nuove **20/20** (`scripts/mutate-54-ricerca-lab.py`), voice-led 12/12, B0 28/28. Nessun push, tag o rilascio
senza l'OK di Stefano; nessun consumer aggiornato.

## 02/10/2026 — v1.27.0, onboarding condotto dalla voce (Claude, `feat/voice-led-onboarding`)

Turni `prepare`/`exchange`, risposte `lead`/`noted`, campi `lead`/`note` sulla rotta per agente. Solo aggiunte.
926/926 test (74 file), 28/28 CJS, typecheck, lint, build e controllo del pacchetto verdi. Mutazioni nuove
**12/12** (`scripts/mutate-voice-led.py`); B0 riallineate e rieseguite **28/28** (B0-10 e B0-26 spostate dalle
aggiunte, B0-25 già fuori ancoraggio dalla v1.26.0). Nessun tag né rilascio: merge e tag a Claude/Stefano.

# STATO — MVP-07, bridge B0

01/10/2026. Branch `codex/mvp07-t5-bridge`, worktree proprio, base `b64c605`.
Mandato: solo §0 «Taglio MVP» del piano tappa 5 in enterprise-adoption, con §6 e §6-bis.

## Dove siamo

Contratti 1.25.0 implementati e testati localmente: turni originali, guida facoltativa per agente,
risposta `speak`/`release`, ID della mossa fino alla voce. Vecchi payload compatibili e rotta personale
invariata. La PR B0 precede i consumer. Nessun tag, pubblicazione o rilascio; non verificato a voce.

## Diario

- Riutilizzati schema del contesto, manifest, registry e rotta per agente. Aggiunto solo il raccordo MVP.
  La ricevuta richiede `moveId` anche nella risposta della rotta per agente: campo facoltativo,
  documentato nella PR. `delivery` non autorizza un’ulteriore risposta vocale o un ciclo libero.
- Baseline Node 20: 893/893 test, 25/25 verifiche CJS. Dopo B0: **903/903 test (71/71 file)**,
  **28/28 CJS**, typecheck/build/lint, portabilità dichiarazioni e controllo del pacchetto verdi.
  Consumer CJS sintetico installato dall’archivio locale 1.25.0 e compilato su Node 20.20.2.
- **28/28 mutazioni** B0-01…28 rilevate da asserzioni; sorgenti ripristinate, suite finale verde.
  Runner `scripts/mutate-turn-lead.py`. Test nuovi sintetici, incluso un server HTTP su loopback.
- Il test del bridge sull’identità degli oggetti-schema è adeguato alla loro estensione separata:
  controlla gli stessi payload legacy. Nessun test protetto elencato nel §6-bis modificato.
- `dist/` rigenerata e inclusa, come richiesto dalla distribuzione attuale del bridge; versione 1.25.0
  nel pacchetto, senza tag. README chiarisce il vecchio riferimento ormai errato a dist non versionata.
- Prossimi blocchi: voce, agent-core, Forge, ea-core e collaudo della demo, ciascuno nella propria PR.
  Tutto spento di default; merge, attivazione, snapshot e rilascio restano a Claude/Stefano.
