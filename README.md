# x9-forge-contract-bridge

> TypeScript contract package that sits between [agent-x9](../agent-x9/) (Master Chief runtime) and [forge-v2](../forge-v2/) (control plane). Single source of truth for every type, endpoint, header, schema, and constant shared across the X9 ↔ Forge boundary.

**Package:** `@x9-forge/contracts` · **Current version:** `1.4.0` · **Last milestone:** v1.0 Bridge Foundation shipped 2026-04-16 (git tag `v1.0` at commit `1d709a1`) · **Status:** between milestones, v1.1 (Shim Cleanup) planned

## Why this repo exists (R-14 NON NEGOZIABILE)

A breaking contract change between X9 and Forge v2 **must** fail at compile time in both repos — never in production. This package exists because **Bug #15** happened: X9 Phase 21.1 added a required `X-Internal-Token` header on `/webhook/post-call`, Forge v2 kept calling without it, no TypeScript error, discovered empirically in production 2026-04-11.

With this package, Forge's build fails the moment X9 changes the contract. The rule is enforced globally (see [`~/.claude/CLAUDE.md` R-14](../../../.claude/CLAUDE.md)):

> Qualsiasi tipo, endpoint, header, schema, o costante condivisa tra X9 e Forge v2 DEVE essere importata da `@x9-forge/contracts`. Zero eccezioni.

**Enforcement:** planners list required bridge imports in `files_to_read`; executors that see inline `z.enum(...)`, literal `"X-Internal-Token"`, or hardcoded `/internal/*` URLs must STOP and extend the bridge first; verifiers reject PRs that skip the bridge.

## Install

Bridge is distributed via `git+https` URL with SHA pinning (RLSE-01). In consumers (X9, Forge v2, storefront when consuming X9 types):

```bash
pnpm add "@x9-forge/contracts@git+https://github.com/App-Templates/x9-forge-contract.git#<SHA>"
```

The `prepare` script builds the package at install time — `dist/` is not committed. Repo is private; consumers need GitHub access (or use the dev-link override below).

## Dev locale (hot-reload)

For local development without re-publishing on every edit, in the consumer's root `package.json` (X9 or Forge) add **without committing to main**:

```json
{
  "pnpm": {
    "overrides": {
      "@x9-forge/contracts": "link:../x9-forge-contract-bridge"
    }
  }
}
```

Then `pnpm install`. Bridge edits are visible to the consumer on the next `tsc --noEmit`. Remove the `pnpm.overrides` block before merging to main — the SHA pin is the only valid production dependency.

## Architecture relationship

```
                ┌──────────────────────────────────────────────┐
                │                FORGE v2                      │
                │  Control plane + 3-tier vault (platform →    │
                │  owner → agent) + factory + workspace +      │
                │  docker mgmt + voice webhook relay           │
                └────────────┬─────────────────────────────────┘
                             │  HTTP push (reload / sync / env)
                             │  typed by bridge
       ┌─────────────────────┴────────────────────────────────┐
       │  x9-forge-contract-bridge  ·  @x9-forge/contracts    │  ← types, no runtime
       │  Zod schemas + TS types + endpoint contracts         │
       │  8 sub-paths · 67 contract files · 384 tests         │
       └─────────────────────┬────────────────────────────────┘
                             │  both repos import from here
                             │  (SHA-pinned, no semver drift)
       ┌─────────────────────┴────────────────────────────────┐
       │         AGENT X9 — Master Chief runtime              │
       │  17 services · multi-agent: N agents per stack       │
       │  each with isolated workspace, registry,             │
       │  credentials, memory (Qdrant + Postgres)             │
       └──────────────────────────────────────────────────────┘
```

The bridge is a **compile-time** contract package. No runtime, no server. When Forge pushes a new key or model tier to X9, the shared Zod schemas guarantee both sides agree on the shape.

## Sub-paths and coverage

8 sub-path exports. Import via `@x9-forge/contracts/<sub-path>`.

| Sub-path | Files | Covers |
|----------|-------|--------|
| `capability` | 7 | `CapabilityManifest`, `ToolCall{Request,Response}`, env-schema, registry entry shapes |
| `agent` | 5 | `AgentId`, `OwnerId`, `AgentIdentity`, `AgentContext`, `AgentCredentials` (discriminated replacement for X9's legacy flat `Record<string, string>`) |
| `auth` | 2 | `INTERNAL_SECRET_HEADER`, `INTERNAL_TOKEN_HEADER`, `AuthInternal{Secret,Token}Schema` (discriminated per endpoint) |
| `http` | 22 | `createBridgeClient`, `NoAuthBridgeClient`, `sse-parser`, standardized `BridgeResponse`, one contract file per cross-repo endpoint under `endpoints/` |
| `vault` | 8 | `VaultTier` (platform/owner/agent ordered), `VaultEntry`, `VaultSyncEvent`, `AgentVaultedCredentials`, `WorkspaceFile` |
| `model-router` | 8 | `ModelTier` (standard < advanced < reasoning), `ModelTierMapping`, `ModelPolicy {min,max}`, hot-reload notification, model-push endpoint |
| `memory` | 9 | `MemoryStatus`, `MemoryCorrectiveAction`, `InvalidationReason`, `RecallTemporalMode`, `RecallTemporalFilter`, `BitemporalFields`, `TemporalSemantics`, `InvalidationMetadata` (Phase 41 Graphiti alignment) |
| `rag` | 6 | cap-rag cross-repo contracts (Phase 37.7): source sync, document open/list, topic intelligence shapes |

Full contract-by-contract coverage and ownership in `milestones/v1.0-REQUIREMENTS.md` and [`CHANGELOG.md`](CHANGELOG.md).

## HTTP endpoint contracts (authoritative list)

Each endpoint ships as `src/http/endpoints/<name>.ts` with `paramsSchema`, `requestSchema`, `responseSchema`, `authType`, `method`, `path`. Consumers import the contract object, not individual fields.

**Forge → X9** (control-plane push, auth: `X-Internal-Secret`):
- `GET  /internal/agents` — list
- `POST /internal/agents/:agentId/reload` — hot-reload context.json
- `POST /internal/agents/:agentId/stop` — graceful bot stop
- `POST /internal/turn` — synchronous turn (Forge tools, worker contexts)
- `POST /internal/turn/stream` — SSE turn with heartbeat
- `POST /internal/query` — self-test harness (Phase 31-F)
- `POST /internal/model-config` — push model tier mapping / per-cap policy (Phase 39)

**Forge → X9 capability services** (per-capability identity implicit in `baseUrl`):
- `GET  /:cap/manifest` — tool definitions
- `GET  /:cap/env-schema` — required env vars
- `GET  /:cap/health` — health probe

**X9 capabilities → Forge vault-svc** (auth: `X-Internal-Token`):
- `GET  /resolve/:agentId/:key` — per-agent credential resolve via 3-tier cascade (v1.3.0, 2026-04-18 — closes R-14 gap from Phase 38 Wave 1)

**X9 cap-voice → Forge voice-svc** (auth: `X-Internal-Secret`):
- `POST /api/voice/register` — register voice session for post-call routing

**ElevenLabs / Twilio → Forge voice-svc → X9 cap-voice** (HMAC signed):
- `POST /webhook/post-call` — forwarded by Forge with `agentId` resolved from `conversationId`

## Release history

See [`CHANGELOG.md`](CHANGELOG.md) for full detail.

| Version | Date | Highlight |
|---------|------|-----------|
| **1.4.0** | 2026-04-19 | Memory v2 Graphiti alignment: `InvalidationReason` (10-enum), `RecallTemporalMode`, `RecallTemporalFilter`, `BitemporalFields`, `InvalidationMetadata` + 45 unit tests (Phase 41 prerequisite) |
| **1.3.0** | 2026-04-18 | `vaultResolveContract` for `GET /resolve/:agentId/:key` (closes R-14 gap from Phase 38 Wave 1 VaultClient violation) |
| **1.2.0** | 2026-04-17 | `@x9-forge/contracts/rag` sub-path (Phase 37.7 — cap-rag cross-repo types) |
| **1.0.0** | 2026-04-16 | **v1.0 Bridge Foundation shipped.** 8 sub-paths, 384/384 tests, Phases 0–6 + 04.1 + M, PR #1 merged, git tag `v1.0` at `1d709a1` |

## How to add a new contract (canonical procedure)

1. **Identify the domain** — capability / agent / http / auth / vault / model-router / memory / rag. If none fits, propose a new sub-path in the same PR.
2. **Write the schema** — `src/<domain>/<name>.ts` with Zod + `z.infer<typeof schema>` type.
3. **Write the test** — `tests/<domain>/<name>.test.ts` covering at least one valid fixture + one invalid fixture (fail-loud).
4. **Export** — add to `src/<domain>/index.ts` so consumers can import from `@x9-forge/contracts/<domain>`.
5. **Build + test + lint** — `pnpm build && pnpm test && pnpm lint` all green.
6. **Bump version + CHANGELOG** — additive = minor bump; breaking = major bump + removal milestone noted; document consumer migration steps.
7. **Atomic consumer bump** — update X9 and Forge SHA pins in the **same** PR window (RLSE-02 breaking-change policy).
8. **Post-merge verify** — `pnpm why @x9-forge/contracts` in both consumers shows identical SHA.

## Breaking-change policy (RLSE)

Non-negotiable rules:

- **SHA-pinned**, never semver tag — no `^`, no `~`, no `latest`.
- **Atomic SHA bump across consumers** — X9 and Forge flip together. A unilateral bump breaks the other repo's staging build.
- **Deprecation** — `/** @deprecated use X instead (removal in v<X.Y>) */` JSDoc with explicit removal milestone. Minimum 1 milestone cycle grace period.
- **Removal** — only after both consumers grep clean (`grep -r <apiName> agent-x9/ forge-v2/` → zero references).
- **No force-push on `main`** — history is immutable.
- **Contract test mandatory on breaking change** — test must catch the rupture before merge.

## Repository layout

```
x9-forge-contract-bridge/
├── src/
│   ├── agent/            # AgentId, OwnerId, AgentIdentity, AgentContext, AgentCredentials
│   ├── auth/             # INTERNAL_*_HEADER constants + discriminated auth schemas
│   ├── capability/       # CapabilityManifest, ToolCall*, env-schema, registry entry
│   ├── http/
│   │   ├── bridge-client.ts        # createBridgeClient<authType>
│   │   ├── no-auth-bridge-client.ts  # public/unauthenticated variant (R-09)
│   │   ├── sse-parser.ts           # SSE event parser for /internal/turn/stream
│   │   ├── response.ts             # BridgeResponse { ok, data | error }
│   │   └── endpoints/              # 1 file per cross-repo endpoint contract
│   ├── memory/           # Memory v2 (ADR + Graphiti alignment)
│   ├── model-router/     # Phase 35 two-level routing contracts
│   ├── rag/              # Phase 37.7 cap-rag contracts
│   └── vault/            # 3-tier cascade, AgentVaultedCredentials, WorkspaceFile
├── tests/                # Mirrors src/ — 384+ unit tests across 42+ files
├── .planning/
│   ├── PROJECT.md        # Project mandate + decisions
│   ├── ROADMAP.md        # v1.0 shipped, v1.1 planned
│   ├── STATE.md          # Current milestone cursor
│   ├── RETROSPECTIVE.md  # Post-milestone retro
│   └── milestones/v1.0-phases/  # Archived v1.0 Phase 0-6 + 04.1 + M
├── CHANGELOG.md
├── package.json          # prepare = pnpm build
└── tsconfig.json
```

## v1.1 roadmap (next milestone)

Planned scope:

- **Phase 7 — Shim Removal (opzionale)**: remove compat re-export shims in `agent-x9/packages/types/capability.ts` and `forge-v2/packages/types/src/x9.ts`. Consumers already import from `@x9-forge/contracts/<sub-path>` directly; the shims exist for migration safety and can go.
- **Bookkeeping cleanup**: back-fill VERIFICATION.md for Phases 0/2/6/M, flip stale VALIDATION frontmatter, document atomic SHA bump procedure (RLSE-02) and `@deprecated` workflow (RLSE-03), add release notes template.

See `.planning/ROADMAP.md` for the live roadmap.

## Open risks carried from v1.0

- **R-07** — `forge-v2/web/` stuck on `zod@3` (MCP SDK upstream peer-dep chain). Defer until MCP SDK releases zod@4-compatible.
- **R-08** — Forge v2 `moduleResolution=node` legacy (partial close in v1.0 Phase 1). Stretches when next consumer migrates.

## Related phases in consumer repos

| Repo | Phase | Status | Bridge dependency |
|------|-------|--------|-------------------|
| forge-v2 | Phase 17 — Bridge Docker Integration | Executing (Waves 1–2 done) | Dockerfiles + compose build bridge via `git+https#SHA` pin (RLSE-01 realization) |
| agent-x9 | Phase 35 — Model Router | Shipped | Imports `@x9-forge/contracts/model-router` |
| agent-x9 | Phase 37.x — cap-rag | 37.6 executing | Imports `@x9-forge/contracts/rag` (v1.2.0) |
| agent-x9 | Phase 38 — Voice credentials via Forge vault | Waves 1–2 merged | Imports `@x9-forge/contracts/{vault,auth}` + `vaultResolveContract` (v1.3.0) |
| agent-x9 | Phase 40 — Memory v2 completion | Complete | Imports `@x9-forge/contracts/memory` |
| agent-x9 | Phase 41 — Memory v2 Graphiti alignment | Executing | Imports temporal primitives added in v1.4.0 |
| forge-v2 | Phase 10 — Model Router UI | Planned | Depends on X9 Phase 35 + model-router sub-path |

## See also

- [`agent-x9/README.md`](../agent-x9/README.md) — runtime, services, multi-tenancy
- [`forge-v2/README.md`](../forge-v2/README.md) — control plane, vault, factory
- [`CLAUDE.md`](CLAUDE.md) — repo guidelines + R-14 enforcement procedure
- [`CHANGELOG.md`](CHANGELOG.md) — full version history
- [`~/.claude/CLAUDE.md`](../../../.claude/CLAUDE.md) — global rules R-01 through R-16

## License

Private. Not for distribution.
