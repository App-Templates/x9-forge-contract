# BRIDGE-131 — execution record

Status: COMPLETO — pronto per revisione indipendente. Base 515f84b (1.30.0), branch claude/bridge-131. Piano: PLAN.md. Autore: Claude S0.
Test sempre con `--maxWorkers=1 --testTimeout=60000`. Mutazioni su file committati, ripristino con
`git checkout HEAD -- <file>` dopo ogni prova, esito in `evidence/mutation-<id>.txt`.

| Task | Stato | Commit | Rosso | Verde | Mutazioni |
|---|---|---|---|---|---|
| 0 — guardia 1.30 | fatto | bbf64bb | n/a (guardia su codice esistente) | 23/23 | 1/1 uccisa (export tolto) |
| 1 — R1b gestione logica | fatto | 155cdbd, ac09bb8, 73e0e68 | 46/46 falliti (export assenti) | 48/48 | 23/23 uccise (2 sopravvissute al primo giro → test aggiunti) |
| 2 — R3 chiavi collegate | fatto | f70d4a3 | 35/35 falliti | 35/35 | 18/18 uccise |
| 3 — R3 contesto chiamata | fatto | abde48b, 10f614c | 21/21 falliti | 22/22 | 11/11 uccise (1 sopravvissuta → test aggiunto) |
| 4 — R4 voce per agente | fatto | 97e3cc1 | 30/30 falliti | 30/30 | 22/22 uccise |
| 5 — R5 ambito | fatto | 529799e, b6034a1 | 40/40 falliti | 41/41 | 16/16 uccise (1 sopravvissuta → test aggiunto; 1 controllo ridondante rimosso, mutante equivalente) |
| 6 — R6 cap-agent-elevenlabs | fatto | 937e8b9, 48fbe05, 4e0334b, 8c56125 | 27/27 falliti | 27/27 | 19/19 uccise + 5/5 sugli ambiti condivisi (1 equivalente rimosso) |
| 7 — R6 cap-coach | fatto | 5d53240 | 41/41 falliti | 41/41 | 34/34 uccise |
| 8 — pubblicazione + verifica finale | fatto | d27e1a0, ffca8cd | 5/5 falliti (dist senza i nuovi simboli) | 5/5 | — |

## Task 0
Snapshot export 1.30 per sottopercorso generato dal dist 1.30 (`tests/compat/bridge-130-exports.json`), test che
ogni simbolo resta esportato dalla stessa sorgente e che payload 1.30 (lista agenti legacy/canonica, reload/stop,
tool call con e senza ambito, vault resolve, registry, avvio chiamata voce) validano invariati.

## Task 1 — R1b
`src/agent/agent-management.ts` (export `./agent`), `src/http/endpoints/internal-agents-management.ts` (export `./http`).
Azioni logiche + apply-config, requestId con replay/conflitto (`sameAgentCommand`), versioni desired/applied/failed,
esito per bersaglio con motivo obbligatorio, esito complessivo derivato, apply riuscito ⇔ versione applicata = richiesta.
Riusati `AgentConfigVersionSchema`, `AgentRuntimeIdentitySchema`, `ReloadAgentParamsSchema` (stessi parametri di
reload/stop). Incidente di processo: il primo giro di mutazioni è partito su file non ancora committati (commit fallito
per un glob zsh); i file sono stati riscritti identici, il runner ora rifiuta file non tracciati o sporchi.

## Task 2 — R3 chiavi collegate
`src/vault/credential-link.ts` (export `./vault`). Provenienza `linked`→Master / `unlinked`→owner|agent (tier da
`VaultTierSchema` senza platform), versione salvata e applicata, voce senza valore (schema stretto), chiavi interne
rifiutate (`isPlatformInternalCredentialKey`). Azioni rotate (master/own, solo versione già salvata), relink, unlink;
esito per agente con applicati/totale coerenti ed esito complessivo derivato con la stessa funzione di R1b.

## Task 3 — R3 contesto di chiamata capability
`src/capability/capability-call-context.ts` (export `./capability`), `src/http/endpoints/capability-call-context.ts`
(export `./http`, `POST /resolve/capability-context`, auth token). Identità tenant/owner/agent obbligatori (pick da
`InternalMemoryExtractRequestSchema`), persona facoltativa; credenziali minime con versione; errori distinti;
`pickCapabilityCredentials`, `toToolCallScope` (riempie i campi già esistenti di `ToolCallRequest` 1.30).

## Task 4 — R4 voce per agente
`src/capability/voice/agent-voice-settings.ts` (export `./voice`). `text-only` oppure `voice` (provider aperto con
formato id, noti `KNOWN_AGENT_VOICE_PROVIDERS` = `VoiceProviderSchema.options`; protocollo websocket/webrtc/sip;
trasporti phone/web; id voce provider; modello; locale; parametri dal vocabolario B1). Desired/applied con
`AgentConfigVersionStateSchema`. Catalogo del producer (voci a menu o id libero con pattern valido) e
`validateAgentVoiceSettings` con codici distinti. Identità del chiamante per il numero Telnyx unico in uscita
(`AgentRuntimeIdentitySchema`, nome, persona, voce, numero E.164 dalla regola cap-voice-live, versione); helper
`outboundCallerIdentityFor` rifiuta text-only (`voice_disabled`) e agenti senza telefono (`phone_not_enabled`).

## Task 5 — R5 ambito
`src/agent/agent-scope-policy.ts` (export `./agent`). allow/ask/deny per lettura e scrittura, regola strumento >
capability > predefiniti (`resolvePolicyDecision`), `defaultWebSearch`, `scopeLimited` con predefiniti deny e scopo
dichiarato; approvazioni umane con scadenza, versione politica e finestra di decisione; evento di registro senza
payload né segreti, coerenza decisione/esito, provenienza con `external-content` per i dati non fidati. Identità da
`CapabilityCallIdentitySchema`, nomi strumento dalla regola di `/call/:tool`.

## Task 6 — R6 cap-agent-elevenlabs
`src/capability/agent-elevenlabs/index.ts` (export `./capability`), `src/http/endpoints/internal-capability-elevenlabs.ts`
(export `./http`, PUT/GET `/internal/capability/agents/:agentId/elevenlabs`, auth secret, parametri riusati da
`CapabilityAgentParamsSchema`). Provisioning idempotente (`requestId`, `configVersion`; esiti created/updated/
unchanged/adopted), adozione esplicita di una risorsa esistente, mapping tenant/owner/agente, canale esterno come
`AgentRuntimeChannel` (lo stato canonico lo conta: agent-core fermo non fa sembrare spento un canale provider vivo),
`retryable` fissato dal codice d'errore (`reconcile_pending` dopo timeout). Ambiti condivisi estratti in
`CapabilityAgentScopeSchema` / `CapabilityPersonScopeSchema` / `sameCapabilityScope` (riusati da coach).

## Task 7 — R6 cap-coach
`src/capability/coach/index.ts` (export `./capability`), `src/http/endpoints/internal-capability-coach.ts` (export
`./http`: PUT/GET programma, POST sessione, GET istantanea persona; PUT risponde `AgentConfigSavedSchema` esistente).
Programmi generici per agente (contenuto del progetto), profilo/sessioni/progressi/budget per persona con isolamento
verificato negli aggregati, ciclo di vita della sessione coerente, scrittura idempotente, punteggi breve/lungo periodo,
`coachRemainingMinutes`. Fuso orario da `AgentTimeZoneSchema`, lingua da `AgentVoiceLocaleSchema`.

## Task 8 — pubblicazione e verifica finale
- Nessun nuovo sottopercorso: tutto da `./agent`, `./vault`, `./capability`, `./voice`, `./http` (ESM e CJS, test
  `tests/compat/bridge-131-dist.test.ts`). Proposta facoltativa per il rilascio: alias `./capability/agent-elevenlabs`
  e `./capability/coach`.
- `pnpm build` verde (check-portable-dts: 284 file portabili; il primo build aveva segnalato 3 contratti senza `z`
  in scope, corretti in d27e1a0). dist ricostruito solo localmente e riportato allo stato committato (non committato).
- Suite completa `vitest --maxWorkers=1`: **108 file, 1821/1821** (1549 della base + 272 nuovi), CJS smoke 36/36 +
  BRIDGE-130 6/6; `typecheck` e `lint` (src + tests) puliti; `check:pack` (publint + attw) verde come in 1.30.
- Mutazioni: 148 registrate in `evidence/`, tutte uccise; 2 mutanti equivalenti documentati e il codice ridondante rimosso.
- Compatibilità 1.30: snapshot di tutti gli export (18 sottopercorsi) invariato; payload 1.30 validi invariati.

## Limiti
- Solo contratti: producer/consumer (X9, Forge) e pin/lock da fare dopo il rilascio della coordinatrice (package.json,
  CHANGELOG e dist restano a lei; versione suggerita 1.31.0, minor additiva).
- Il catalogo voci e le combinazioni realmente supportate sono dati del producer (R4-2), qui solo la forma.
- Le rotte credential-link (rotate/relink/unlink) sono schemi senza percorso HTTP: chiamante e servizio sono entrambi
  Forge; il percorso si fissa nel lotto R3-2 se serve a X9.
- Il protocollo di riconciliazione ElevenLabs dopo timeout è espresso dall'errore `reconcile_pending`; la logica è del
  producer R6-2.

## Correzione scope — revisione C (P1)
Difetto: `ElevenLabsProvisionResultSchema` confrontava solo `providerAgentId` fra `mapping` e `status.mapping`; uno
stato di un altro tenant/owner/agente con lo stesso id, o una seconda versione/origine dello stesso legame, passavano.
- `3bda752` — `sameElevenLabsMapping`: scope completo (`sameCapabilityScope`), risorsa, origine, versione applicata e
  istante di creazione. Test equivalenti ai 7 casi di C (5 negativi, 2 validi) + istante di creazione.
- Stessa classe cercata in R6 e R3: `2e0eaea` coach — i progressi nel risultato di una sessione devono essere dello
  stesso programma della sessione; `4633a17` R1b — `agentId` deve essere l'id di gestione o di runtime di `identity`.
  R3 (chiavi, contesto di chiamata): nessun confronto fra oggetti per singolo id; snapshot coach e stato ElevenLabs
  usavano già lo scope completo.
- Rosso osservato: 7 test (evidence/fix-scope-red.txt). Mutazioni: 10/10 uccise (una per controllo nuovo, `fix-*`).
- Verifica: suite completa 108 file, **1830/1830**; CJS 36/36 + 6/6; build (284 d.ts portabili), typecheck, lint,
  check:pack verdi; dist riportato allo stato committato; package.json e CHANGELOG intatti.

Ultimo aggiornamento: 07/10 01:34
