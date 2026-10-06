# BRIDGE-131 — contratti condivisi per R1b, R3, R4, R5, R6

Autore: Claude S0 (bacheca forge-v2). Worktree `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-42-1`,
branch `claude/bridge-131`, base `515f84b` (= v1.30.0 su main). Perimetro `src/**`, `tests/**`,
`.planning/phases/bridge-131/**`. package.json, CHANGELOG e dist restano della coordinatrice (rilascio).
Niente push. Scritto prima del codice: 07/10/2026 00:59.

Governano: `piani/MODELLO-AGENTE.md`, `piani/DECISIONI-AGENTI.md` (D-A0..D-A9), `piani/FABBRICA-PLAN.md`
sezioni R1 (R1b-1), R3 (R3-1), R4 (R4-1), R5 (R5-1), R6 (R6-1).

## Regole del lotto

- Tutto **additivo**: nessuno schema 1.30 cambia forma; nessun export 1.30 sparisce (snapshot
  `tests/compat/bridge-130-exports.json`, generato dal dist 1.30 prima di ogni modifica).
- **Riuso, niente duplicati** (R-14): identità da `AgentRuntimeIdentitySchema` / `AgentIdSchema`; parametri agente
  da `ReloadAgentParamsSchema` e `CapabilityAgentParamsSchema`; versioni da `AgentConfigVersionSchema`; canali da
  `AgentRuntimeChannelSchema`/`AgentRuntimeReadinessSchema`; tier da `VaultTierSchema`; chiavi interne da
  `isPlatformInternalCredentialKey`; provider voce da `VoiceProviderSchema`; numero E.164 dal contratto voice-live;
  ambito tenant/owner/agent/user da `InternalMemoryExtractRequestSchema`.
- Nessun nuovo sottopercorso di package (package.json è della coordinatrice): i nuovi contratti escono dai
  sottopercorsi esistenti `./agent`, `./vault`, `./capability`, `./voice`, `./http`. Proposta alla coordinatrice per
  il rilascio (facoltativa): `./capability/agent-elevenlabs` e `./capability/coach` come alias dedicati dei moduli
  `src/capability/agent-elevenlabs/index.ts` e `src/capability/coach/index.ts`.
- Test prima e rossi, poi verdi; una mutazione per controllo nuovo (registrata in evidence/); un commit atomico per
  pezzo; SUMMARY aggiornato dopo ogni commit. Test con `--maxWorkers=1 --testTimeout=60000`.

## Task

| # | Pezzo | File | Sottopercorso |
|---|---|---|---|
| 0 | Base di compatibilità 1.30 | `tests/compat/bridge-130-exports.json`, `tests/compat/bridge-130-compat.test.ts` | — |
| 1 | R1b gestione logica | `src/agent/agent-management.ts`, `src/http/endpoints/internal-agents-management.ts` | `./agent`, `./http` |
| 2 | R3 chiavi collegate | `src/vault/credential-link.ts` | `./vault` |
| 3 | R3 contesto chiamata capability | `src/capability/capability-call-context.ts`, `src/http/endpoints/capability-call-context.ts` | `./capability`, `./http` |
| 4 | R4 voce per agente + chiamante | `src/capability/voice/agent-voice-settings.ts` | `./voice` |
| 5 | R5 ambito e politica | `src/agent/agent-scope-policy.ts` | `./agent` |
| 6 | R6 cap-agent-elevenlabs | `src/capability/agent-elevenlabs/index.ts`, `src/http/endpoints/internal-capability-elevenlabs.ts` | `./capability`, `./http` |
| 7 | R6 cap-coach | `src/capability/coach/index.ts`, `src/http/endpoints/internal-capability-coach.ts` | `./capability`, `./http` |
| 8 | Pubblicazione dist ESM/CJS dei nuovi simboli + build/lint/typecheck | `tests/compat/bridge-131-dist.test.ts` | — |

### 1 — R1b gestione logica
- Azioni `start|stop|restart|reload` (ciclo di vita logico, mai il processo condiviso) e `apply-config`.
- Chiave di richiesta (`requestId`) obbligatoria: stessa chiave + stesso comando = replay (`replayed: true`, nessuna
  seconda esecuzione); stessa chiave + comando diverso = `idempotency_conflict`. Helper `sameAgentCommand`.
- Versioni `desired`/`applied`/`failed` (`applied ≤ desired`; un fallimento riguarda una versione > applicata).
- Esito per bersaglio (`runtime`, `channel`, `capability`): `ok | error | unmanageable`, motivo obbligatorio se non ok.
  Esito complessivo derivato (`ok | partial | error | unmanageable`), mai dichiarato: nessun successo globale finto.
- `apply-config` riuscito ⇒ versione applicata = richiesta; fallito ⇒ precedente applicata conservata.
- Contratti: `POST /internal/agents/:agentId/commands`, `GET /internal/agents/:agentId/management`
  (versioni + azioni ammesse per bersaglio, con motivo per quelli non gestibili).

### 2 — R3 chiavi collegate
- Provenienza per chiave: `linked` (sorgente Master Chief X9) oppure `unlinked` con livello `owner|agent`.
- Versione per chiave, presenza; mai il valore (schema stretto). Chiavi interne di piattaforma rifiutate.
- Azioni `rotate` (versione già salvata, ambito `master` o `own`), `relink`; esito per agente collegato
  (`ok|error|unmanageable`), applicati/totale coerenti; replay per `requestId`.

### 3 — R3 contesto di chiamata capability
- Identità `tenantId/ownerId/agentId/userId` (dall'autenticazione, mai dal modello), capability, versione config,
  credenziali **minime** per quella capability (solo le chiavi richieste, con versione; nessuna chiave interna).
- Errori distinti: `credential_missing`, `source_unavailable`, `capability_disabled`, `capability_not_installed`.
- Helper `pickCapabilityCredentials` (minimo indispensabile, assenti elencate) e `toToolCallScope` (campi compatibili
  con `ToolCallRequestSchema` 1.30). Contratto `POST /resolve/capability-context` (auth token).

### 4 — R4 voce per agente
- `text-only` oppure `voice` con provider (aperto: id provider validato dal catalogo del producer; noti
  `elevenlabs`, `openai_live`), protocollo, trasporto, voce (id voce provider), modello, parametri.
- Catalogo provider (combinazioni ammesse, voci a menu o id libero con formato) + `validateAgentVoiceSettings`.
- Identità del chiamante per il numero Telnyx unico in uscita: agente (gestione/runtime), nome, persona, voce,
  numero condiviso E.164, versione impostazioni. `text-only` non produce identità (`voice_disabled`).

### 5 — R5 ambito
- Politica per capability/strumento: `allow|ask|deny`, lettura distinta da scrittura; regola strumento > capability >
  predefiniti; `scopeLimited` impone predefiniti `deny`; `defaultWebSearch`.
- Approvazione per `ask` (agente/persona/operazione/versione/scadenza; decisione umana autenticata).
- Evento di registro azione senza payload: decisione, esito, provenienza, versione politica; coerenza decisione/esito.

### 6 — R6 cap-agent-elevenlabs
- Provisioning all'Applica idempotente (`requestId`, `configVersion`); esiti `created|updated|unchanged|adopted`;
  mapping risorsa provider ↔ agente (tenant/owner/agente, adozione esplicita); stato canale esterno come
  `AgentRuntimeChannel` (così entra nello stato canonico dell'agente). Errori con `retryable`.

### 7 — R6 cap-coach
- Ambito tenant/owner/agente/persona per persona; programma (contenuto del progetto, per agente), sessione
  (idempotente, stati coerenti), progressi (punteggi breve/lungo periodo), budget minuti per periodo.
- Contratti: programma PUT, sessione POST, istantanea persona GET.

## Accettazione
- `pnpm build` verde (dist non committato), `pnpm test` completo verde, `pnpm lint`, `pnpm typecheck`.
- Snapshot export 1.30 integro; payload 1.30 (lista agenti, reload/stop, tool call, vault resolve, voce) validi.
- Una mutazione uccisa per ogni controllo nuovo, registrata in `evidence/`.

## Limiti dichiarati
- Contratti soltanto: nessun producer/consumer. Pin e lock dei consumer dopo il rilascio della coordinatrice.
- Catalogo voci reale e combinazioni effettive sono dati del producer (R4-2), non inventati qui.
