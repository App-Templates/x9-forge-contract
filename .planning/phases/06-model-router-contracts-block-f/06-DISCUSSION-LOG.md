# Phase 6: Model Router Contracts (Block F) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the analysis and auto-selected defaults.

**Date:** 2026-04-16
**Phase:** 06-model-router-contracts-block-f
**Mode:** discuss (--auto, all gray areas auto-resolved)
**Areas analyzed:** Sub-path & module layout, ModelTier enum + comparator, ModelProvider enum, ModelTierMapping, ModelPolicy invariant, ModelPushRequest/Response + endpoint, ModelHotReloadNotification mechanism, PerAgentModelOverride, CapabilityRegistryEntry.modelPolicy? extension, Fixture strategy, X9 Phase 35 coordination, JSDoc traceability

---

## Sub-path & module layout

| Option | Description | Selected |
|--------|-------------|----------|
| `@x9-forge/contracts/model-router` + split files per schema | Pattern Phase 5 `vault`, Phase M `memory`. 7 file + barrel. Consistente con repo. | ✓ |
| Singolo file `model-router.ts` | Più compatto ma meno navigabile | |
| Split al volo in planning | Rimandare la decisione a plan 06-02 | |

**Auto-selected:** `@x9-forge/contracts/model-router` + split files (D-01, D-02).
**Notes:** Coerenza 1:1 con Phase 5 (vault) e Phase M (memory). Zero friction per downstream.

---

## ModelTier enum + comparator

| Option | Description | Selected |
|--------|-------------|----------|
| `z.enum(['standard', 'advanced', 'reasoning'])` + `TIER_ORDER` array + `compareTiers` via indexOf | Stringa literal, ordine esposto via array, helper share-friendly. Consistente con Phase 5 VaultTier | ✓ |
| Numeric enum | Ordine implicito ma debug-unfriendly + breaking per JSON | |
| Zod branded + compare map object | Più ceremoniale senza benefit tangibile | |

**Auto-selected:** Option 1 (D-04, D-05, D-06).
**Notes:** `compareTiers` canonicalizzato come helper bridge condiviso (precedente era "Claude's Discretion" in Phase 5 D-74).

---

## ModelProvider enum

| Option | Description | Selected |
|--------|-------------|----------|
| `z.enum(['openai', 'anthropic', 'google'])` — 3 provider v1 | Coerente con PROJECT.md ("Google se necessario"). `google` marcato come confirm-in-research | ✓ |
| Solo `['openai', 'anthropic']` | Più prudente ma research 06-01 potrebbe riaprire | |
| Extensible aperto (`z.string()`) | Perde type safety, contro BRDG-03 | |

**Auto-selected:** Option 1 (D-08).
**Notes:** Research 06-01 può rimuovere `google` se Phase 35 X9 draft non lo include.

---

## ModelTierMapping shape

| Option | Description | Selected |
|--------|-------------|----------|
| Flat `Record<ModelTier, string>` + provider scoping nel `ModelPushRequest` | Mapping semplice. Completezza forzata via refine | ✓ |
| Discriminated union per provider con per-provider shape | Troppo ceremoniale per v1 | |
| `Record<Provider, Record<Tier, string>>` nested | Complessità nested, meno leggibile | |

**Auto-selected:** Option 1 (D-09, D-10).
**Notes:** Refine Zod enforce tutti i 3 tier presenti — evita fallback runtime ambigui.

---

## ModelPolicy invariant min <= max

| Option | Description | Selected |
|--------|-------------|----------|
| Zod `.refine()` con `compareTiers(min, max) <= 0` + errore diagnostico | Pattern T-05-01 Phase 5, fail-loud contrattuale | ✓ |
| Helper function separata con throw (no Zod refine) | Non fail-loud a parse time | |
| Type-level only (`if min > max` in code) | Non enforceable via Zod | |

**Auto-selected:** Option 1 (D-11).
**Notes:** Messaggio d'errore cita i valori ricevuti per debug rapido.

---

## ModelPushRequest / ModelPushResponse / endpoint contract

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal coherent shape pattern Phase 4 (`reloadAgentContract`), auth `X-Internal-Secret`, response discriminated `ok` | Coerente con tutti gli altri endpoint contract del bridge | ✓ |
| Heavier shape con versioning esplicito da subito | YAGNI — `reloadVersion?` opzionale è sufficiente per v1 | |
| Skip endpoint contract, solo request/response types | MDRT-05 richiede contract dichiarato | |

**Auto-selected:** Option 1 (D-13, D-14, D-15, D-16).
**Notes:** Endpoint dichiarato ma NON implementato in Phase 6 (MDRT-05 SC #4). X9 Phase 35 lo implementa.

---

## ModelHotReloadNotification mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Shape locked, meccanismo (SSE/polling) deferred a research-phase 06-01 | "Bridge tipizza, non decide" (Phase 5 D-21). Research 06-01 coordina con X9 Phase 35 | ✓ |
| SSE scelto subito (pattern Phase 4 `/internal/turn/stream`) | Preempt research, rischio misalignment con X9 | |
| Polling scelto subito | Idem | |

**Auto-selected:** Option 1 (D-17, D-18, D-19).
**Notes:** Shape del payload stabile indipendentemente dal transport. Plan 06-02 implementa il meccanismo dopo research 06-01.

---

## PerAgentModelOverride

| Option | Description | Selected |
|--------|-------------|----------|
| `{ agentId: AgentIdentity (Phase 2 branded), policy?, tierMapping? (partial) }` + refine "at least one" | Runtime-facing (slug, come AgentContextCore). Flessibile (policy OR mapping OR entrambi) | ✓ |
| Numeric agentId come vault Phase 5 D-09 | DB-facing, inconsistente con X9 runtime che parla slug | |
| Solo policy override (no tierMapping) | Limita caso "clone X su Opus 4.6" (visione PROJECT.md line 58) | |

**Auto-selected:** Option 1 (D-20, D-21, D-22).
**Notes:** Documentazione cross-reference con vault `tier=agent` (semantica equivalente, storage separato).

---

## CapabilityRegistryEntry.modelPolicy? extension (MDRT-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Aggiunta `modelPolicy: ModelPolicySchema.optional()` a schema esistente, non-breaking, migration test con fixtures | Pattern Phase 1 (schema extension), coerente con BRDG-03 | ✓ |
| Schema separato `CapabilityRegistryEntryV2` | Breaking, forza shim | |
| Version bump package | Sovracosto per field opzionale | |

**Auto-selected:** Option 1 (D-23, D-24, D-25).
**Notes:** Default comportamentale `{ min: 'standard', max: 'standard' }` applicato dal consumer (D-24), non dal bridge — forza decisione consapevole.

---

## Fixture strategy (greenfield)

| Option | Description | Selected |
|--------|-------------|----------|
| Fixture invented sintetiche, marcate `// SYNTHETIC` in header, replace quando Phase 35 ships | Pattern ROADMAP plan 06-02 "fixture invented" | ✓ |
| Skip fixtures fino a Phase 35 X9 | Contract drift guard non attivabile, rischio regressione futura | |
| Mock da Forge design doc | Phase 10 Forge ancora non pianificata | |

**Auto-selected:** Option 1 (D-26, D-27).
**Notes:** 7 fixtures minime (request min/full, response success/4 errors, hot-reload, registry entry con/senza modelPolicy).

---

## Coordination with X9 Phase 35 (plan 06-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Research-phase 06-01 obbligatoria, produce RESEARCH.md con mapping nomi + meccanismo hot-reload + provider list | Coerente con plan 06-01 esistente ("coordinamento con Phase 35 X9") | ✓ |
| Skip research, procedere con bridge-first decisions | Rischio amend dopo freeze | |
| Joint session con X9 developer | User è Stefano, single-dev flow | |

**Auto-selected:** Option 1 (D-28, D-29).
**Notes:** Bridge precede X9 per BRDG-03; se X9 Phase 35 ha divergenze strutturali, amend prima del freeze (non dopo).

---

## JSDoc & traceability

| Option | Description | Selected |
|--------|-------------|----------|
| Pattern Phase 5 D-03 + marker `@status greenfield` + paths Phase 35/Phase 10 post-research | Pattern consolidato | ✓ |
| Skip JSDoc (greenfield, niente implementazione da citare) | Perde traceability per consumer futuri | |
| Auto-generate JSDoc da Zod description | Richiede tooling non esistente | |

**Auto-selected:** Option 1 (D-30).

---

## Claude's Discretion

- Formulazione messaggi d'errore Zod (entro vincolo D-11).
- Split test files (un file per schema vs `model-router.test.ts` unico).
- `MODEL_PROVIDERS` const parallel a `MODEL_TIERS`.
- Naming `pushModelConfigContract` vs `modelConfigPushContract`.
- Re-export sub-path da root `src/index.ts` (default: sì, coerenza Phase 5).

## Deferred Ideas

- Implementazione endpoint in X9 (Phase 35).
- UI Forge Phase 10.
- Billing / usage tracking per tier.
- Rotation / versioning mapping (v1.1).
- Provider-specific mapping nested (scartato, reintroducibile post-research).
- Brand su ModelTier / CapabilityName (AF-02).
- Plugin architecture provider (enum chiuso in v1).
- Validazione cross-field policy runtime/registry (downstream concern).
- SSE auth model per hot-reload (assume X-Internal-Secret, research conferma).

## Reviewed Todos (not folded)

Nessun match — `gsd-tools todo match-phase 6` → 0.
