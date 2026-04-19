# x9-forge-contract-bridge

> TypeScript contract package that sits between [agent-x9](../agent-x9/) (Master Chief runtime) and [forge-v2](../forge-v2/) (control plane). Single source of truth for all cross-repo types: HTTP endpoints, request/response shapes, auth headers, vault entries, model router contracts.

**Status:** Planning phase (research not yet started). PROJECT.md + config.json committed.

## Why

A breaking contract change between X9 and Forge v2 **must** fail at compile time in both repos — never in production. This package exists because Bug #15 happened: X9 Phase 21.1 added a required `X-Internal-Token` header on `/webhook/post-call`, Forge v2 kept calling without it. No TypeScript error. Discovered empirically in production 2026-04-11.

With this package, Forge's build would have failed the moment X9 changed the contract.

## Install

Distribuzione via `git+https` URL con SHA pinning (BRDG-01). Nei consumer (X9 o Forge):

```bash
pnpm add "@x9-forge/contracts@git+https://github.com/App-Templates/x9-forge-contract.git#<SHA>"
```

Il `prepare` script builda il package al momento dell'install — `dist/` non è committato.

## Dev locale (hot-reload)

Per sviluppo locale senza republish a ogni modifica, nel `package.json` root del consumer (X9 o Forge) aggiungi (NON committare in main):

```json
{
  "pnpm": {
    "overrides": {
      "@x9-forge/contracts": "link:../x9-forge-contract-bridge"
    }
  }
}
```

Poi `pnpm install`. Modifiche al bridge → consumer le vede al successivo `tsc --noEmit`. Copre BRDG-06 (dev loop).

Cleanup pre-merge: rimuovi il blocco `pnpm.overrides` prima di mergiare in main (il plan 00-04 valida questo flusso end-to-end).

## Scope v1

### Cross-repo HTTP contracts (existing, to consolidate)

**Forge → X9** (10 endpoints, `X-Internal-Secret` or `X-Internal-Token`):
- `/internal/agents` (GET / reload / stop)
- `/internal/turn`, `/internal/turn/stream` (SSE), `/internal/query`
- `/webhook/post-call`
- `/manifest`, `/env-schema`, `/health` (capability identity is implicit in the caller's `baseUrl` — Docker hostname/port — not a path prefix)

**X9 → Forge** (1 endpoint):
- `/api/voice/register`

Existing duplicated types to unify:
- X9: `ToolCallRequest`, `ToolCallResponse`, `CapabilityManifest` in `packages/types/src/capability.ts`
- Forge: `X9AgentContext`, `X9CapabilityRegistryEntry`, `X9CapabilityManifest`, `X9EnvSchemaField`, `X9EnvSchemaDoc` in `packages/types/src/x9.ts`
- Known divergence: `CapabilityRegistryEntry` (X9 uses `endpoint` URL) vs `X9CapabilityRegistryEntry` (Forge uses `host + port + version`)

### Vault & multi-tenant contracts

Forge v2 already implements **3-tier vault cascade**: `platform → owner → agent`. The bridge types this mechanism so X9 can consume it safely.

- `VaultEntry` shape (key, encrypted value, `tier`, `isCustomized`, `ownerId?`, `agentId?`)
- `VaultTier` enum: `platform | owner | agent` — normalizes the "synced vs overridden" semantic
  - `synced` (resync propagates) = `tier === 'platform' | 'owner'`
  - `overridden` (resync skips) = `tier === 'agent'`
- `VaultSyncEvent` (bulk resync payload, touches only non-agent-tier entries)
- `AgentIdentity` (`agentId`, `ownerId/tenantId`) — basis for multi-tenant routing
- `AgentCredentials` discriminated shape (replaces X9's flat `Record<string, string>` in `context.credentials` for per-key type safety)
- `WorkspaceFile` shape (path, content, tier, isCustomized)

### Model Router contracts (Phase 35 prerequisite)

Phase 35 (Model Router — Two-Level Routing) in agent-x9 introduces 5 new cross-repo contracts. They **must be born in this bridge**, not retrofitted:

- `ModelTier` ordered enum (`standard < advanced < reasoning`)
- `ModelTierMapping` (`tier → modelId`, e.g. `standard: "gpt-4.1-mini"`)
- `ModelPolicy` (`{ min, max }`) + `modelPolicy` field in registry
- Forge Model Push API (`POST /internal/model-config` or equivalent) — **new endpoint, not yet implemented**
- Hot-reload notification shape

### Out of scope (v1)

- CI/CD publish pipeline (add after v1 stabilizes)
- Hot-reload "live" push vault → X9 bypassing context.json (real gap, but not a bridge blocker)
- Multi-user-within-agent (`userId` filter in memory recall) — X9 gap, separate phase
- Tenant self-service UI (Forge scope)
- Env var renaming (`INTERNAL_SECRET` vs `X9_INTERNAL_SECRET` etc.) — document asymmetry, don't rename

## Contracts coverage

Tabella popolata incrementalmente phase-per-phase (OBS-01). Oggi (Phase 0): **vuota — solo scaffolding**.

| Dominio | Contratto | File | Phase aggiunto |
|---------|-----------|------|----------------|
| — | — | — | Phase 1+ |

Sub-path exports disponibili:

- `@x9-forge/contracts/capability`
- `@x9-forge/contracts/agent`
- `@x9-forge/contracts/http`
- `@x9-forge/contracts/auth`
- `@x9-forge/contracts/vault`
- `@x9-forge/contracts/model-router`
- `@x9-forge/contracts/memory`
- `@x9-forge/contracts/voice` (Phase 42 — CAP-Voice v2.2 runtime, 27 schemas)

### Coverage per sub-path

| Sub-path | Schemas | Covers |
|----------|---------|--------|
| `capability` | 7 | `CapabilityManifest`, `ToolCall{Request,Response}`, env-schema, registry entry shapes |
| `agent` | 5 | `AgentId`, `OwnerId`, `AgentIdentity`, `AgentContext`, `AgentCredentials` |
| `auth` | 2 | `INTERNAL_SECRET_HEADER`, `INTERNAL_TOKEN_HEADER`, `AuthInternal{Secret,Token}Schema` |
| `http` | 11+ | `createBridgeClient`, endpoint contracts (incl. Phase 42 `voice.ts` path + method constants) |
| `vault` | 8 | `VaultTier`, `VaultEntry`, `VaultSyncEvent`, `AgentVaultedCredentials`, `WorkspaceFile` |
| `model-router` | 8 | `ModelTier`, `ModelTierMapping`, `ModelPolicy {min,max}`, hot-reload notification |
| `memory` | 9 | `MemoryStatus`, `MemoryCorrectiveAction`, console read shapes |
| `voice` | 27 | **Phase 42 — CAP-Voice v2.2.** Call brief, authorized actions, call-start req/resp, 12-tool surface, 8 calendar tool shapes, 3 lenient ElevenLabs event schemas, strict Forge normalized event, cap-voice ingest req/resp, reconciled outcome, tool log, Memory v2 handoff payload (stub), privacy metadata. |

## How to add a new contract

Procedura canonica (OBS-02):

1. Identifica il dominio (capability/agent/http/auth/vault/model-router)
2. Crea `src/<dominio>/<nome>.ts` con Zod schema + `z.infer<typeof schema>` type
3. Esporta da `src/<dominio>/index.ts`
4. Scrivi contract test in `tests/<dominio>/<nome>.test.ts` (schema + fixture valida + fixture invalida fail-loud)
5. `pnpm build && pnpm test && pnpm lint` verdi
6. Aggiorna la tabella **Contracts coverage** qui sopra con riga `dominio | contratto | file | phase`
7. Bump SHA nei consumer **atomicamente** (entrambi X9 + Forge in un singolo PR coordinato)
8. Verifica post-merge: `pnpm why @x9-forge/contracts` in entrambi i consumer mostra lo stesso SHA

## Breaking change policy

Regole non negoziabili (OBS-03):

- **SHA-pinned** nei consumer — no semver tag mobile, no `^` né `~`
- **Breaking change = bump SHA simultaneo nei 2 consumer**, mai uno solo. Se X9 bumpa senza Forge, Forge build rompe in staging
- **Deprecation**: aggiungi `/** @deprecated use X instead */` JSDoc, mantieni export per ≥ 1 cycle di phase
- **Rimozione**: solo dopo che entrambi i consumer hanno zero reference all'API deprecata (`grep -r "<nomeApi>" agent-x9/ forge-v2/` → zero risultati)
- **Never force-push** sul main del bridge — history immutable
- **Mai ruotare SHA senza PR cross-repo coordinato** — rollback = reset consumer al SHA precedente
- **Contract test obbligatori** per ogni breaking change: test deve catturare la rottura PRIMA del merge

## Verified ground truth (2026-04-14)

Don't trust this README or `.planning/PROJECT.md` descriptions. Every contract decision must cite `file:line` from the actual code. Verified snapshots:

**Forge v2** (very mature already):
- 3-tier vault cascade implemented: `services/vault/src/services/vault.service.ts:73-116`
- DB schema: `packages/db/src/schema.ts:13-70`
- Ownership middleware: `services/factory/src/middleware/require-agent-ownership.ts`
- Bulk sync endpoint: `POST /api/vault/sync-all` (`services/vault/src/routes/vault.ts:167`)
- X9 client: `services/factory/src/services/x9.client.ts`

**Agent X9** (multi-agent by design):
- Multi-agent manager: `services/agent-core/src/core/agent-manager.ts:1-67`
- AgentContext per-agent with workspace/registry/credentials isolated
- SessionStore keyed `${agentId}-${chatId}`: `session-store.ts:25-64`
- Qdrant memory isolated per `agent_${agentId}_memories`: `memory/src/client.ts:49-84`
- Hot-reload: `POST /internal/agents/:id/reload` (`agent-core/src/index.ts:336-368`)
- **No** `/webhook/post-call` endpoint on X9 — flow goes Forge voice-svc → cap-voice
- **No** Phase 35 Model Router code yet (only design doc)
- `context.credentials` is flat `Record<string, string>` (zero per-key type safety)

## Research mandate (non-negotiable)

1. **Verify everything on code** before typing — cite `file:line` for every contract
2. **Zero regressions** — contract tests green before AND after migration
3. **Incremental migration** — one contract at a time, never big-bang
4. **Backward compat during migration** — old types can re-export from bridge as compat shim, removed last
5. **X9 production continuity** — cannot go down during migration (Stefano's non-negotiable rule)
6. **README updates are part of DoD** — update this README + X9 + Forge READMEs when a contract moves
7. **Don't reinvent Forge multi-tenant** — the 3-tier vault already exists, bridge types it
8. **Don't reinvent X9 multi-agent** — already designed for clones, bridge types existing behavior

Full research mandate: [`.planning/PROJECT.md`](.planning/PROJECT.md).

## Architecture relationship

```
                ┌────────────────────────────────────┐
                │            FORGE v2                │
                │  Control plane + vault centralized │
                │  (3-tier: platform / owner / agent)│
                └─────────────┬──────────────────────┘
                              │ HTTP push (reload, sync)
                              │ typed by bridge
         ┌────────────────────┴──────────────────┐
         │   x9-forge-contract-bridge (pkg)      │  ← types, no runtime
         │   HTTP contracts + vault + model      │
         └────────────────────┬──────────────────┘
                              │ both repos import
                              │ from here
         ┌────────────────────┴──────────────────┐
         │   AGENT X9 — Master Chief runtime     │
         │   Multi-agent: N agents per stack,    │
         │   each with isolated workspace,       │
         │   registry, credentials, memory       │
         └───────────────────────────────────────┘
```

The bridge is a **compile-time** contract package. No runtime, no server. When Forge UI pushes a new key or model tier to X9, the types ensure both sides agree on the shape.

## Status & next steps

- [x] Repo initialized, `.git/` + `.planning/PROJECT.md` + `.planning/config.json` committed
- [x] Gap analysis verified on both repos (2026-04-14)
- [ ] GSD research phase (next)
- [ ] REQUIREMENTS.md
- [ ] ROADMAP.md
- [ ] Implementation

To resume:

```bash
cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge
cat .planning/PROJECT.md    # read full research mandate
# then: /gsd-new-project (resumes from where it left off) or /gsd-progress
```

## Related phases

| Repo | Phase | Status | Dependency |
|------|-------|--------|------------|
| agent-x9 | Phase 35 — Model Router | Planned | **Depends on bridge v1** — Phase 35 must import contracts from here, not define locally |
| forge-v2 | Phase 10 — Model Router UI | Planned | Depends on X9 Phase 35 + bridge v1 |
| agent-x9 | Multi-user-in-agent (userId filter) | Not scoped | Separate X9 phase, not bridge scope |
| forge-v2 | Tenant self-service UI | Not scoped | Separate Forge phase, not bridge scope |

## License

Private. Not for distribution.
