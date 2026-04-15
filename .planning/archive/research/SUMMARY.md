# Riepilogo Research — x9-forge-contract-bridge

**Project:** x9-forge-contract-bridge
**Domain:** Pacchetto TypeScript di contratti condivisi cross-repo (compile-time, zero runtime)
**Researched:** 2026-04-14
**Confidence:** HIGH

---

## Executive Summary

Il bridge e un pacchetto TypeScript puro, senza server e senza runtime, il cui unico scopo e essere la singola source of truth per tutti i contratti che attraversano il confine `agent-x9 <-> forge-v2`. La strategia di distribuzione e `git+ssh://...#<commit-sha>` con `prepare` build hook: nessun registry, nessun submodule, nessun meta-monorepo. In locale il consumer usa `pnpm.overrides` con `link:` per feedback loop istantaneo. Tutti gli altri meccanismi (Verdaccio, submodule, `file:` protocol) sono stati valutati ed esclusi con ragioni documentate in STACK.md.

Il pattern architetturale e lo **strangler fig su tipi**: il bridge nasce vuoto, ogni contratto viene migrato un blocco alla volta attraverso compat shim (`@x9/types` e `@forge/types` diventano thin re-export dal bridge). X9 production non si ferma mai perche ogni step e un commit atomico rollback-able su un singolo repo. Lo split di `AgentContext` in `AgentContextCore` (cross-repo, nel bridge) + `AgentContextRuntime` (X9-only, locale) e la decisione architetturale piu rilevante: Forge tipizza solo cio che genera, X9 estende col resto senza impattare il contratto wire.

I rischi critici sono quattro: (1) Forge usa zod@3 e deve fare upgrade a zod@4 **prima** di importare dal bridge (prerequisito non negoziabile); (2) `exactOptionalPropertyTypes` e asimmetrico tra X9 (true) e Forge (non impostato), richiedendo allineamento tsconfig Forge; (3) la migrazione di `AgentCredentials` da `Record<string,string>` a discriminated union deve avvenire in 3 step con migration script + VPS snapshot altrimenti X9 in produzione perde tutti gli agenti; (4) ts-rest e bloccato da peer-dep conflict (zod@4 + fastify@5) in v1 — il typed HTTP client va implementato custom (~80 righe).

---

## Key Findings

### Stack Raccomandato

(Dettaglio completo: `.planning/research/STACK.md`)

La scelta e TypeScript `^6.0.2` + Zod `^4.0.0` + distribuzione via git SHA. Il bridge ha `zod` come unica dipendenza runtime; tutto il resto e devDependency. Il package usa ESM nativo con export map sub-barrel (`.`, `./http`, `./vault`, `./model-router`) per tree-shaking. Il `prepare` script esegue `tsc` al momento dell'install nei consumer, eliminando il bisogno di committare `dist/`.

**Prerequisiti bloccanti — da completare PRIMA del bridge v1:**

- **Forge: upgrade zod@3 -> zod@4** — breaking ma limitato. Il bridge dipende da zod@4; Forge con zod@3 non puo importare dal bridge senza conflitti peer-dep.
- **Forge: allineare `exactOptionalPropertyTypes: true`** — senza allineamento, Forge compila con semantica opzionale diversa dal bridge, generando falsi negativi TS.
- **Forge: TypeScript 5.9.3 -> 6.0.2** — allineamento con X9 gia su 6.0.2.

**Tecnologie core:**

| Technology | Versione | Scopo | Perche |
|---|---|---|---|
| TypeScript | `^6.0.2` | Source language + compile-time enforcement | Gia in uso X9; Forge in bump |
| Zod | `^4.0.0` | Schema -> tipo via `z.infer` + runtime validation al boundary HTTP | X9 gia su zod@4; Forge in upgrade |
| pnpm | `^10.33.0` | Distribuzione via git URL con SHA pin + `link:` per dev locale | Standard in entrambi i consumer |
| vitest | `^2.x` | Unit + contract test schema round-trip | Allineato ai consumer esistenti |
| `@changesets/cli` | `^2.30.0` | Changelog + semver bump | Da Phase 2 in poi, prima del primo breaking change |

**Nota critica: ts-rest BLOCCATO in v1.** `@ts-rest/core@3.52.1` richiede `zod@^3.22.3` come peer dep, incompatibile con zod@4. Typed HTTP client va implementato custom (~80 righe, zero deps).

---

### Features Attese

(Dettaglio completo: `.planning/research/FEATURES.md`)

**Table stakes — senza queste il bridge non ha valore:**

| ID | Feature | Previene Bug #15 |
|---|---|---|
| TS-01 | Plain TS interfaces + `readonly` per tutti i contratti | Parziale |
| TS-02 | Branded types per identificatori (AgentId, OwnerId, TenantId, SessionId) | No (ma previene leak cross-tenant) |
| TS-03 | Discriminated union per auth headers — literal type per endpoint | SI — primary fix |
| TS-04 | Typed HTTP client wrapper zero-dep ~80 righe — `callEndpoint<T>` rifiuta senza auth corretto | SI — primary fix |
| TS-05 | Zod v4 schemas paralleli ai tipi TS (solo boundary HTTP); tipo derivato via `z.infer<>` | Complementare |
| TS-06 | Canonical shape: risoluzione divergenze CapabilityRegistryEntry, CapabilityManifest, ToolCallRequest/Response | Indirettamente |
| TS-07 | Env-var naming asimmetria documentata + helper `resolveHeader` | Tangente |
| TS-08 | VaultEntry + VaultTier discriminated + semantica "synced vs overridden" | No (ma previene tier leak) |
| TS-09 | Contract tests bidirezionali (fixture da log produzione, round-trip Zod parse) | SI — avrebbe catchato Bug #15 |
| TS-10 | Semver discipline + CHANGELOG + policy expand-contract per breaking change | Mitiga classi future |

**Should have (differentiatori DX, NON bloccanti v1):**

- DF-01: ts-rest — POSTPONE (bloccato da peer dep)
- DF-02: Model Router contracts come first-class citizen (Phase 35 prereq — alta priorita)
- DF-03: `@deprecated` JSDoc workflow per migration path tracciato
- DF-06: Fastify schema binding helper

**Defer a v2+:** DF-04 (JSON Schema export per consumer non-TS), DF-05 (contract diff tool)

**Anti-features da non implementare:** pubblicazione npm pubblico, branded types ovunque, tRPC, OpenAPI codegen, Zod su strutture interne, Pact full consumer-driven.

---

### Approccio Architetturale

(Dettaglio completo: `.planning/research/ARCHITECTURE.md`)

Il bridge e un **leaf node** nel grafo delle dipendenze. Regola non negoziabile: X9 e Forge importano dal bridge, il bridge non importa da nessuno dei due. Enforcement automatico via ESLint `no-restricted-imports` + `madge --circular` in CI.

**Componenti principali del bridge:**

| Modulo | Path | Responsabilita |
|---|---|---|
| Identity | `src/agent/identity.ts` | AgentIdentity (agentId, ownerId) — foglia del grafo tipi |
| AgentContextCore | `src/agent/context-core.ts` | Cross-repo contract; Forge scrive, X9 estende con AgentContextRuntime |
| AgentCredentials | `src/agent/credentials.ts` | KnownCredentials & Record<string,string> — migrazione dal flat Record |
| Auth headers | `src/auth/headers.ts` | InternalSecretHeader, InternalTokenHeader, discriminated union |
| HTTP contracts | `src/http/*.ts` | 11 endpoint, 1 file per endpoint |
| Vault | `src/vault/entry.ts` | Shape wire; VaultEntryEncrypted vs VaultEntryPlain come tipi distinti |
| Model Router | `src/model-router/*.ts` | ModelTier, ModelPolicy, ModelPushRequest/Response — greenfield |
| Capability | `src/capability/*.ts` | CapabilityTool, CapabilityManifest, CapabilityRegistryEntry canonici |

**Split AgentContext (decisione architetturale centrale):** AgentContextCore nel bridge (agentId, ownerId, credentials, llmConfig, telegramAllowFrom) + AgentContextRuntime in X9 locale extends AgentContextCore (workspacePath, registryPath, telegramBotToken, displayName). Disaccoppia evoluzioni runtime X9 dai bump del bridge.

**Compat shim pattern per ogni contratto (4-5 commit atomici):** commit bridge (tipo+schema) -> commit X9 shim (re-export) -> commit Forge shim (alias) -> smoke test staging -> (molto dopo) shim removal.

---

### Pitfall Critici

(Dettaglio completo: `.planning/research/PITFALLS.md`)

**CRITICAL (8 pitfall):**

| ID | Pitfall | Prevenzione | Phase |
|---|---|---|---|
| P-01 | Compat shim loop infinito | ESLint no-restricted-imports + madge circular CI | P0 |
| P-02 | Compile-time vs runtime gap al boundary HTTP | Coppia tipo+schema; Zod .parse() obbligatorio al boundary | P0+P1 |
| P-03 | Zod schema diverge dal tipo TS dopo refactor | Convenzione rigida: type X = z.infer<typeof XSchema>, mai type manuali in file con schema | CROSS |
| P-04 | Version drift tra consumer | Pin SHA esatto in entrambi; CI step verify-bridge-parity | CROSS |
| P-05 | Breaking change senza atomic cross-repo release | Pattern expand-contract: aggiungi prima di rimuovere | CROSS |
| P-06 | AgentCredentials discriminated rompe context.json prod | Migration 3-step con union tolerante + migration script + VPS snapshot | P2 |
| P-07 | Payload AES cifrato vs decriptato tipizzati come VaultEntry | Due tipi distinti: VaultEntryEncrypted + VaultEntryPlain; branded EncryptedBlob | P5 |
| P-08 | Breaking Model Router contracts durante Phase 35 X9 in-flight | Freeze contrattuale dopo P3-Model; dry-run Phase 35 contract test nel bridge | P6 |

**HIGH selezionati:** P-09 (as any che vanifica contratto), P-10 (over-broadcasting tipi interni X9), P-13 (enum vs literal union — mai enum), P-14 (exactOptionalPropertyTypes asimmetrico — prerequisito Phase 0), P-16 (bridge green, consumer rotti per mancanza integration test).

---

## Implications for Roadmap

Struttura a 7 fasi derivata dal migration order a 6 blocchi (A-F) di ARCHITECTURE.md.

### Phase 0: Prerequisiti e Setup Infrastruttura Bridge

**Rationale:** Bloccante per tutto il resto. Zod@3 Forge rompe l'install. tsconfig asimmetrico produce falsi negativi.

**Delivers:** Upgrade Forge (zod@4, TS 6.0.2, exactOptionalPropertyTypes), bridge package.json + tsconfig + export map + ESLint + vitest + CI (madge, tsc --noEmit, consumer smoke test), pin SHA in entrambi i consumer.

**Avoids:** P-01, P-02, P-03, P-04, P-12, P-13, P-14, P-15

**Research flag:** Pattern standard. Skip research-phase.

---

### Phase 1: Blocco A — Contratti capability simmetrici

**Rationale:** Valida il pattern shim su tipi semplici prima di usarlo su tipi con implicazioni production.

**Delivers (5 contratti):** CapabilityTool, CapabilityManifest (risolve divergenza serviceName?), ToolCallRequest/Response, EnvSchemaField/Doc, HealthStatus. Ciascuno: 1 commit bridge + 1 X9 shim + 1 Forge shim + smoke test staging.

**Addresses:** TS-05, TS-06 (parziale)
**Avoids:** P-04, P-16

**Research flag:** Pattern meccanico. Skip research-phase.

---

### Phase 2: Blocco B — AgentContext split

**Rationale:** La modifica architetturale piu significativa. Eseguita dopo Phase 1 con pattern validato.

**Delivers (6 contratti):** AgentIdentity, AgentCredentials discriminated (migration 3-step con union tolerante), LLMConfig, AgentContextCore, AgentContextRuntime X9-local, Forge shim X9AgentContext.

**Addresses:** TS-02, TS-08 (partial)
**Avoids:** P-06, P-11

**Research flag:** Leggere file context.json reali su VPS prima del migration script. Valutare gsd-research-phase.

---

### Phase 3: Blocco C — Auth headers discriminated

**Rationale:** Il contratto che avrebbe prevenuto Bug #15. Prima lo si implementa, prima il sistema e protetto.

**Delivers:** InternalSecretHeader, InternalTokenHeader, InternalAuthHeader discriminated, EndpointAuth<E>. Aggiornamento forge x9.client.ts per errore compilazione se header mancante.

**Addresses:** TS-03, TS-04 (base del typed HTTP client)
**Avoids:** P-02, P-09

**Research flag:** Pattern standard. Skip research-phase. Nota: risolvere open question X9_INTERNAL_SECRET source of truth prima di questa phase.

---

### Phase 4: Blocco D — 11 endpoint HTTP contracts

**Rationale:** Meccanico e voluminoso. Dipende da Blocchi A, B, C. Parallelizzabile su piu executor.

**Delivers:** Tutti gli 11 endpoint tipizzati (incluito /webhook/post-call che chiude definitivamente Bug #15) + typed HTTP client callEndpoint<T> zero-dep.

**Addresses:** TS-04, TS-09
**Avoids:** P-05, P-16

**Research flag:** Pattern meccanico con template definito. Skip research-phase. Verificare Dockerfile X9 per P-15.

---

### Phase 5: Blocco E — Vault contracts

**Rationale:** Dipende da AgentIdentity (Phase 2). Il pitfall P-07 (cifrato vs decriptato) richiede attenzione.

**Delivers:** VaultTier literal union, VaultEntryEncrypted + VaultEntryPlain distinti, VaultSyncEvent, WorkspaceFile, endpoint vault typed.

**Addresses:** TS-08, TS-02
**Avoids:** P-07

**Research flag:** Leggere vault.service.ts:73-116 per shape esatta AES. Valutare gsd-research-phase.

---

### Phase 6: Blocco F — Model Router contracts

**Rationale:** Greenfield. Per ultimo perche Phase 35 X9 dipende da shape frozen.

**Delivers:** ModelTier literal union + TIER_ORDER, ModelTierMapping, ModelPolicy, CapabilityRegistryEntry esteso, ModelPushRequest/Response, ModelReloadEvent. Freeze contrattuale dichiarato a fine phase.

**Addresses:** DF-02
**Avoids:** P-08, P-13

**Research flag:** Coordinare shape con implementatori Phase 35 X9. Breve gsd-research-phase consigliata.

---

### Phase 7: Cleanup shim e import diretti (post-v1, opzionale)

**Delivers:** Search-replace import diretti in X9 e Forge, rimozione compat shim, prima major bump semver.

**Research flag:** Standard. Skip research-phase.

---

### Phase Ordering Rationale

Phase 0 sblocca tutto (prerequisiti tecnici Forge). Phase 1 valida il pattern su casi semplici. Phase 2 esegue la modifica architetturale piu invasiva con pattern validato. Phase 3 implementa la protezione diretta Bug #15. Phase 4 completa gli 11 endpoint (dipende da tutti i tipi foglia precedenti). Phase 5 vault usa AgentIdentity ma non dipende dall'HTTP client. Phase 6 greenfield per ultimo con pattern completamente sedimentato.

### Research Flags

Necessitano gsd-research-phase: Phase 2 (edge case context.json produzione), Phase 5 (shape AES vault), Phase 6 (coordinamento shape Model Router con Phase 35).

Pattern standard (skip research-phase): Phase 0, Phase 1, Phase 3, Phase 4, Phase 7.

---

## Confidence Assessment

| Area | Confidence | Note |
|---|---|---|
| Stack | HIGH | Verificato su codice reale X9 (tsconfig.base.json, package.json) e Forge (packages/types/tsconfig.json). ts-rest blocking verificato su peerDeps ufficiali. |
| Features | HIGH | Ogni feature mappata al codice esistente con citazione file:linea. MEDIUM solo su ts-rest timing. |
| Architecture | HIGH | Verificato su file sorgenti reali: agent-context.ts:1-14, x9.ts:3-13, schema.ts:41-55, agent-manager.ts. |
| Pitfalls | HIGH | 8 CRITICAL + 9 HIGH derivati da analisi statica codice esistente + incidente documentato Bug #15. |

**Confidence complessiva:** HIGH

### Open Questions (decisioni pendenti)

1. **CapabilityRegistryEntry canonical shape**: X9 usa `{ endpoint: string }` (URL), Forge usa `{ host, port, version }` (x9.ts:15-21). Research consiglia `{ endpoint: string }` con adapter, ma decisione va validata con consumer Forge in factory/src/. **Decidere prima di Phase 1.**

2. **X9_INTERNAL_SECRET source of truth**: incoerenza tra factory/src/env.ts:19 (platform env) e voice.ts:95-98 (vault per-agent). **Decidere prima di Phase 3.**

3. **AgentCredentials migration scope**: quanti file context.json esistono in produzione? Verificare su VPS prima del migration script in Phase 2.

4. **VaultSyncEvent payload esatto**: POST /api/vault/sync-all payload non verificato in vault.service.ts. Da leggere prima di Phase 5.

5. **Dockerfile X9 con bridge linkato**: non esaminato. Verificare pattern COPY necessario prima di Phase 4 per evitare P-15.

---

## Sources

### Primary (HIGH confidence — codice sorgente verificato)

- `agent-x9/packages/types/src/agent-context.ts:1-14` — shape AgentContext attuale
- `agent-x9/packages/types/src/capability.ts:1-38` — CapabilityTool, CapabilityManifest, ToolCallRequest/Response
- `agent-x9/tsconfig.base.json:11-13` — strictness flags incluso exactOptionalPropertyTypes: true
- `forge-v2/packages/types/src/x9.ts:3-48` — X9AgentContext, X9CapabilityManifest, EnvSchemaDoc
- `forge-v2/packages/types/tsconfig.json:10` — MANCANZA di exactOptionalPropertyTypes
- `forge-v2/packages/db/src/schema.ts:41-55` — VaultEntry shape DB
- `forge-v2/services/vault/src/services/vault.service.ts:73-116` — vault AES-256-GCM logic
- `forge-v2/services/factory/src/services/x9.client.ts:14-16` — codice esatto di Bug #15

### Secondary (MEDIUM confidence — documentazione ufficiale)

- pnpm docs — git URL install, link: protocol, prepare hook behavior
- TypeScript 6.0 release notes — exactOptionalPropertyTypes, verbatimModuleSyntax
- Zod v4 release — z.infer, .brand(), .toJSONSchema(), breaking changes da v3
- @ts-rest/core peerDependencies su NPM — blocking conflict verificato

### Tertiary (LOW confidence — inferenza)

- Docker pnpm multi-stage pattern (P-15) — inferito da pnpm docs, non testato su Dockerfile X9 reale
- @changesets/cli comportamento in non-workspace setup — da verificare in Phase 0

---

*Research completata: 2026-04-14*
*Pronta per roadmap: si*
