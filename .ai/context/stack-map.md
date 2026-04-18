# x9-forge-contract-bridge — Stack Map

**Authority.** This repo is a **contract library** — no runtime deploy, no
services. It publishes TypeScript types and Zod schemas consumed by
agent-x9 and forge-v2 (and soon forge-storefront).

## What this repo is

`@x9-forge/contracts` — single source of truth for every shape, endpoint,
header, constant shared across X9 ↔ Forge. Rule R-14: any bypass of this
package is a future Bug #15.

See: `CLAUDE.md` + `README.md` at repo root.

## Bridge sub-paths (src/)

| Sub-path | Domain | Key exports |
|---|---|---|
| `agent/` | Identity | `AgentId`, `OwnerId`, `AgentIdentity`, `AgentCredentials` |
| `auth/` | Internal auth headers + schemas | `INTERNAL_TOKEN_HEADER`, `INTERNAL_SECRET_HEADER`, `AuthInternal*Schema` |
| `capability/` | Capability manifest + env-schema | `CapabilityManifest`, `ToolCall` |
| `http/bridge-client.ts` | Generic HTTP client with bridge pinning | `BridgeClient` |
| `http/endpoints/` | One file per cross-repo endpoint | request + response schemas + path |
| `http/sse-parser.ts` | SSE stream parser | voice / live |
| `http/response.ts` | Response envelope | |
| `memory/` | Memory v2 envelope shared with memory-svc | Fact, Session, envelope types |
| `model-router/` | Per-turn model selection (Phase 35) | `ModelTier`, `ModelTierMapping`, `ModelPolicy` |
| `rag/` | Cap-RAG cross-repo types (Phase 37) | corpus, feedback, query types |
| `vault/` | Credential vault (Phase 38+) | `VaultTier` (=`['platform','owner','agent']`), `VaultEntry`, `VaultSyncEvent`, `AgentVaultedCredentials` |

## Consumers

- `agent-x9/` — imports from `@x9-forge/contracts/{auth,vault,capability,memory,model-router,rag,http/endpoints/*}`
- `forge-v2/` — imports from `@x9-forge/contracts/{auth,vault,agent,capability,http/endpoints/*,memory,model-router}`
- `forge-storefront/` — imports from `@x9-forge/contracts/{auth,http/endpoints/*}` (provisioning to forge-v2)

## Dev loop

| Task | Command |
|---|---|
| Install | `pnpm -C /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge install` |
| Build | `pnpm -C bridge build` |
| Test | `pnpm -C bridge test` |
| Typecheck | `pnpm -C bridge typecheck` |
| Add a schema | 1) file in `src/<subpath>/`, 2) export from `src/<subpath>/index.ts`, 3) test in `tests/<subpath>/`, 4) CHANGELOG, 5) version bump |

Consumers use pnpm link in dev:
- Local: `pnpm install` in a consumer with `pnpm.overrides` pointing at this path
- Docker build: bridge is vendored to `<consumer>/vendor/x9-forge-contract-bridge/` (synced manually)

## Distribution

This repo is NOT deployed. Bridge v1+ is published to private GitHub
(`App-Templates/x9-forge-contract.git`) and consumed via pnpm link / vendor
copy. `dist/` is not committed; consumer builds run the bridge build step
as a prepare hook.

## CHANGELOG discipline

Every release bumps `package.json` version. Entry in `CHANGELOG.md` lists:
- What changed (schema/type/constant)
- Breaking vs additive
- Consumer file(s) that must be updated

## Incidents / reasons this repo exists

- **Bug #15** (2026-04-11) — X9 Phase 21.1 added `X-Internal-Token` header
  on `/webhook/post-call`. Forge v2 kept calling without. No TypeScript
  error because the types were inline, not shared. Caught in prod.
  This repo was created so a breaking contract change fails at compile
  time in both repos.
- **Phase 38 Wave 1** (2026-04-17) — VaultClient in agent-x9 wrote
  `z.enum(["agent","owner","platform"])` inline (wrong order vs bridge's
  `['platform','owner','agent']`). Fixed by importing `VaultTierSchema`
  from bridge.

## Rules R-14 reminder

Every consumer MUST import from `@x9-forge/contracts/<subpath>`. No inline
`z.enum`, no literal `"X-Internal-Token"`, no hardcoded `/internal/*` URLs,
no local schema shadowing. See `CLAUDE.md` + memory
`feedback_bridge_contracts_non_negotiable.md`.

## Worktrees / coordination

This repo has no `.claude/worktrees/` currently (library is small, parallel
work rare). Coordination file: `~/.claude/agent-coordination/x9-forge-contract-bridge.json`.

*Last updated: 2026-04-18 — initial scaffold (AI-GOVERNANCE replication).*
