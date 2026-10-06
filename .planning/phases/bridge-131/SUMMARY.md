# BRIDGE-131 — execution record

Status: IN CORSO. Base 515f84b (1.30.0), branch claude/bridge-131. Piano: PLAN.md. Autore: Claude S0.
Test sempre con `--maxWorkers=1 --testTimeout=60000`. Mutazioni su file committati, ripristino con
`git checkout HEAD -- <file>` dopo ogni prova, esito in `evidence/mutation-<id>.txt`.

| Task | Stato | Commit | Rosso | Verde | Mutazioni |
|---|---|---|---|---|---|
| 0 — guardia 1.30 | fatto | bbf64bb | n/a (guardia su codice esistente) | 23/23 | 1/1 uccisa (export tolto) |
| 1 — R1b gestione logica | fatto | 155cdbd, ac09bb8, 73e0e68 | 46/46 falliti (export assenti) | 48/48 | 23/23 uccise (2 sopravvissute al primo giro → test aggiunti) |
| 2 — R3 chiavi collegate | fatto | f70d4a3 | 35/35 falliti | 35/35 | 18/18 uccise |
| 3 — R3 contesto chiamata | fatto | abde48b, 10f614c | 21/21 falliti | 22/22 | 11/11 uccise (1 sopravvissuta → test aggiunto) |
| 4 — R4 voce per agente | fatto | 97e3cc1 | 30/30 falliti | 30/30 | 22/22 uccise |
| 5 — R5 ambito | fatto | 529799e + correzione | 40/40 falliti | 41/41 | 16/16 uccise (1 sopravvissuta → test aggiunto; 1 controllo ridondante rimosso, mutante equivalente) |

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

Ultimo aggiornamento: 07/10 01:14
