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
