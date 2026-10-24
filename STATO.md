# STATO

## 24/10/2026 — ponte unico 1.67.0 (TV2B-02)

REF = SHA completo della punta di `integ/azienda-bridge` con `package.json` 1.67.0, dopo il commit e l'integrazione di TV2B-02 a cura dello script. Ricavarlo con `git rev-parse integ/azienda-bridge` e verificare la versione su quel commit prima del ripin; pubblicazione del riferimento a cura della coordinatrice.
Base verificata in lettura: `33e212ed273c4f46ab81e4ab768aae1c042433d4`, punta comune con i sorgenti di TV2B-01 e `package.json` ancora 1.66.0, discendente di `d3ba734`.
Compiti contenuti nel riferimento da pubblicare: 328 (TV2B-01, contratti delle due letture R&D) e 329 (TV2B-02, versione 1.67.0, CHANGELOG e `dist`).
`dist/` è versionato e ricostruito con `pnpm build` (esito 0); verificati 627/627 export conservati in `http/endpoints`, più 6 nuovi (totale 633). Accettazione completa, suite e controllo dei tipi restano allo script.

| Consumatore | File | Valore attuale | Valore da mettere |
|---|---|---|---|
| X9 (agent-x9, `integ/azienda-x9`) | `package.json` (dipendenze e override), `pnpm-workspace.yaml`, `pnpm-lock.yaml` | Da rilevare in TV2X-01 nel repo X9 | REF, voce del lockfile `version: 1.67.0` |
| X9 (agent-x9, `integ/azienda-x9`) | `packages/capability-sdk`, `packages/company-memory-engine`, `services/cap-dev`, `services/cap-lab` (`package.json`) e altri pin del ponte rilevati da TV2X-01 | Da rilevare in TV2X-01 nel repo X9 | REF |
| X9 (agent-x9, `integ/azienda-x9`) | `vendor/x9-forge-contract-bridge/.synced-from-sha` | Da rilevare in TV2X-01 nel repo X9 | REF, con `scripts/sync-bridge.sh` |
| Forge (`integ/azienda-forge`) | `package.json` (`pnpm.overrides`), `pnpm-workspace.yaml`, `pnpm-lock.yaml` | Da rilevare nel repo Forge quando necessario | REF solo quando serve a Forge |

I pacchetti interni di Forge usano `workspace:*` e seguono l'override della radice.
Ripin X9: TV2X-01; fruibilità T2 dopo TV2L-01, TV2L-02 e TV2N-04. Tag v1.67.0 a cura della coordinatrice su REF.

## 22/10/2026 — ponte unico 1.60.0 (F1B-07)

REF = `19a9142177df3eb786487becc7ca3952a65f300a` (compito 312 pubblicato dal night nuovo su `integ/azienda-bridge` il 23/10 alle 10:47, `package.json` 1.60.0, su GitHub).
Lo stesso albero di `opus/cancello-20261023` 757e3c0 (lavoro di opus-cancello, consegnato con `tools/consegna_esterna.py`).
Antenati verificati con `git merge-base --is-ancestor`: 9534310 (286), d74d24a (287), afb7c78 (288), 717cba2 (289),
c7bd971 (290), edf5e56 (291), e949553 (292), f22876e (293), 19a9142 (312 versione 1.60.0, CHANGELOG e `dist`).
Compiti contenuti: 286-293 e 312. `dist/` è versionato e ricostruito con `pnpm run build` (601 export in `http/endpoints`, 152 in `organization`, nessuno perso).

| Consumatore | File | Valore attuale (letto in sola lettura, 23/10) | Valore da mettere |
|---|---|---|---|
| X9 (agent-x9, `integ/azienda-x9`) | `package.json:30,34,38` | `e3b3cf9c3465097e8478294f9bd8ac51c143c10c` (1.59.0) | REF (modello 70102c641) |
| X9 (agent-x9, `integ/azienda-x9`) | `pnpm-workspace.yaml:8`, `pnpm-lock.yaml` | `e3b3cf9c3465097e8478294f9bd8ac51c143c10c` | REF, voce del lockfile `version: 1.60.0` |
| X9 (agent-x9, `integ/azienda-x9`) | `packages/capability-sdk`, `packages/company-memory-engine`, `services/cap-dev`, `services/cap-lab` (`package.json`) | `e3b3cf9c3465097e8478294f9bd8ac51c143c10c` | REF |
| X9 (agent-x9, `integ/azienda-x9`) | `vendor/x9-forge-contract-bridge/.synced-from-sha` | `d72fe5b53e6222af52f332bb5decfe19221a5b5b` (1.58.0) | REF, con `scripts/sync-bridge.sh` (modello 0d6ea575d) |
| Forge forge-backend e forge-azienda (`integ/azienda-forge`, un solo lockfile) | `package.json:26` (`pnpm.overrides`), `pnpm-workspace.yaml:26`, `pnpm-lock.yaml` | `e3b3cf9c3465097e8478294f9bd8ac51c143c10c` (1.59.0, compito 1111) | REF |
| Forge main | `package.json:26` (`pnpm.overrides`) | `c99f570342a2661a87459362b129eb2858676c96` | REF quando i rami Azienda entrano in main |

I pacchetti interni di Forge (`web`, `packages/types`, `services/*`) usano `workspace:*` e seguono l'override della radice.
Ripinnare: corsie di X9 e Forge, come F0X-01 e F0F-01 (x9-consumer/1169, forge-backend/1122).
Tag v1.60.0: da mettere dalla coordinatrice su REF

## 22/10/2026 — ponte unico 1.59.0 (F0B-01)

REF = `e3b3cf9c3465097e8478294f9bd8ac51c143c10c` (compito 283, punta del ramo, `package.json` 1.59.0).
Antenati verificati con `git merge-base --is-ancestor`: 7220faa (276 accesso per strumento), 4657857 (278),
a95021c (279 rotte asset), 353cf95 (282 nascita Ricerca e Lab), 4102a90 (280 posti Paperclip),
73ad05d (281 incarichi del posto), e3b3cf9 (283 versione 1.59.0 e CHANGELOG).
Compiti contenuti: 276-283. Il 284 (dist ESM) non produce commit perché `dist/` non è versionato: si rifà con `pnpm build` da REF.

| Consumatore | File | Valore attuale (letto in sola lettura) | Valore da mettere |
|---|---|---|---|
| X9 (agent-x9, main) | `package.json:32` | `link:../x9-forge-contract-bridge` | REF (`git+…#e3b3cf9c3465097e8478294f9bd8ac51c143c10c`, modello 70102c641) |
| X9 (agent-x9, main) | `pnpm-workspace.yaml` | nessun riferimento al ponte | voce del ponte su REF, come nel modello 0d6ea575d |
| X9 (agent-x9, main) | `vendor/x9-forge-contract-bridge/.synced-from-sha` | `5034eef5e54698b16e97466b0f2ac416cf861e66` (`package.json` 1.41.0) | REF, con `scripts/sync-bridge.sh` |
| Forge forge-backend (`night/forge-completo-backend`) | `package.json:26` (`pnpm.overrides`) | `716b5c3a4eefe47e262683e87bffca9045a3ac5c` | REF |
| Forge forge-azienda (`integ/azienda-forge`) | `package.json:26` (`pnpm.overrides`) | `539e225724a325a62d53568b96d6e3ddb72d9944` | REF |
| Forge `azienda/forge-tipi-bu-20261022` | `package.json:26` (`pnpm.overrides`) | `353cf955e1245b7fb12f7e2a7bb2cc940fe8905c` (282) | REF |
| Forge main | `package.json:26` (`pnpm.overrides`) | `b64c6051f42a0910c11a6b10a5beb76125891b62` | REF quando i rami Azienda entrano in main |

I pacchetti interni di Forge (`web`, `packages/types`, `services/*`) usano `workspace:*` e seguono l'override della radice.
Il pin `git+https` richiede che REF sia su GitHub: push di backup del ramo a cura della coordinatrice (R-21).
Tag v1.59.0: da mettere dalla coordinatrice su REF

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
