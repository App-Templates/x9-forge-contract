# x9-forge-contract-bridge — Repo Guidelines

This package is the **single source of truth** for every contract shared
between `agent-x9/` (runtime) and `forge-v2/` (control plane). Any change
here ripples into both consumers at `pnpm install` time (or immediately
under the `pnpm.overrides` dev-link).

---

## BRIDGE-CONTRACTS = LEGGE (Rule R-14, NON NEGOZIABILE)

Everything that crosses the X9↔Forge boundary (types, endpoints, headers,
schemas, enums, constants) lives here and **only** here. X9 and Forge
consumers import from `@x9-forge/contracts/<subpath>` — never duplicate,
never re-declare inline.

**Why this repo exists:** Bug #15 (2026-04-11). X9 Phase 21.1 added
`X-Internal-Token` on `/webhook/post-call`; Forge v2 kept calling without
it. No TypeScript error. Caught in prod. This package exists so that a
breaking contract change fails at compile time in both repos — never in
production again.

---

## When adding or changing a contract

1. **Add the contract here first.**
   - New schema → `src/<domain>/<thing>.ts` with Zod schema + exported
     TypeScript type.
   - New endpoint → `src/http/endpoints/<name>.ts` with request/response
     schemas + auth type + path.
   - New header/constant → keep it in the matching `src/<domain>/` sub-path.
2. **Write a unit test** covering valid + invalid payloads (at least one of
   each). Tests live under `tests/` mirroring `src/`.
3. **Export from the sub-path `index.ts`** so consumers can import from
   `@x9-forge/contracts/<subpath>`.
4. **Build** (`pnpm build`) — `dist/` is not committed, but the consumer's
   `prepare` script expects the build artefacts to be producible.
5. **Bump version + CHANGELOG.md** describing the breaking/additive change
   and listing the affected consumer files.
6. **Update the consumer side** (X9 and/or Forge) in the same PR or a
   follow-up under the same GSD phase. Never land a bridge change with no
   consumer update tracked.

---

## When NOT to accept a consumer-side change

If a PR in `agent-x9/` or `forge-v2/` introduces:

- inline `z.enum([...])` for a tier/state/role that could be shared
- a string literal `"X-Internal-Token"` / `"X-Internal-Secret"`
- a local `z.object({ ... })` for a response that crosses the boundary
- a hardcoded URL path like `/internal/*` / `/webhook/*` / `/resolve/*`
  / `/api/voice/*`

— the PR is a **bridge-contracts violation**. Reject it and require the
contract to land here first, then be imported in the consumer.

---

## Repository map

```
src/
├── agent/           # AgentId, OwnerId, AgentIdentity, AgentCredentials
├── auth/            # INTERNAL_SECRET_HEADER, INTERNAL_TOKEN_HEADER, AuthInternal*Schema
├── capability/      # CapabilityManifest, ToolCall, env-schema
├── http/
│   ├── bridge-client.ts
│   ├── endpoints/   # one file per cross-repo endpoint
│   ├── sse-parser.ts
│   └── response.ts
├── memory/          # Memory types shared with memory-svc
├── model-router/    # ModelTier, ModelTierMapping, ModelPolicy (Phase 35)
├── rag/             # Cap-RAG cross-repo types (Phase 37)
└── vault/           # VaultTier, VaultEntry, VaultSyncEvent, AgentVaultedCredentials
```

---

## See also

- `README.md` — install, dev loop, scope, roadmap (Phase 0+M SHIPPED, Phase 1 next).
- `~/.claude/CLAUDE.md` — global rules R-01 through R-14.
- `~/.claude/projects/-Users-admintemp-Downloads-Claude/memory/feedback_bridge_contracts_non_negotiable.md` — detailed rationale.

---

*Last updated: 2026-04-17 — R-14 propagated repo-level.*

## Cross-repo map: stack-brain (second brain)

Before assuming ANY cross-repo behavior (X9 ↔ Forge ↔ bridge ↔ Storefront ↔ Parallel), consult
the code-grounded ecosystem map — it exists precisely to prevent cross-repo drift assumptions:
- `~/Downloads/Claude/stack-brain/00-INDEX.md` — map of maps + open DD findings
- `~/Downloads/Claude/stack-brain/bridge/` — THIS repo's component cards (path:line-cited; "unknown (not verified)" is a valid value)
- Cross-repo questions: `graphify query "<question>"` run from stack-brain, or read `~/Downloads/Claude/stack-brain/graphify-out/wiki/index.md`
- Runtime "is it up right now" state is NOT there — read `~/.claude/infra/ecosystem-capabilities.md` + live-status memory.
- Ideas/evolutions: capture with the `/idea` skill → `stack-brain/ideas/` (NEVER as aspirational notes in this repo's docs).
