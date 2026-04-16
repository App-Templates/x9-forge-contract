# Phase 5: Vault Contracts (Block E) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in 05-CONTEXT.md — this log preserves the analysis.

**Date:** 2026-04-15
**Phase:** 05-vault-contracts-block-e
**Mode:** discuss (`--auto`)
**Areas analyzed:** Module layout, VaultTier/VaultSyncState, Plain/Encrypted separation, AES wire format, VaultSyncEvent/sync-all, PlatformBootstrapEnv, AgentVaultedCredentials, WorkspaceFile

---

## Gray Areas Identified (auto-selected all)

Sourced from ROADMAP.md Phase 5 goal + REQUIREMENTS VLT-01..08 + codebase scan of `forge-v2/services/vault/` and `forge-v2/services/workspace/`.

---

## Area 1: Module layout & sub-path

| Option | Description | Selected |
|--------|-------------|----------|
| Sub-path `@x9-forge/contracts/vault` with `src/vault/` barrel | Consistent with Phase M/1/2/3/4 sub-path pattern, `BRDG-02` aligned | ✓ |
| Monolithic `@x9-forge/contracts` export | Breaks tree-shaking + sub-path contract | |

**Selected:** sub-path `@x9-forge/contracts/vault`.
**Rationale:** BRDG-02 requires sub-path exports; all prior phases used sub-paths; existing placeholder `src/vault/index.ts` confirms the slot.

---

## Area 2: VaultTier enum shape & cascade helper

| Option | Description | Selected |
|--------|-------------|----------|
| `z.enum(['platform','owner','agent'])` + `compareTiers(a,b)` helper | Minimal, matches Forge `VaultTier`, enables future Phase 6 ordered-enum pattern | ✓ |
| Branded tier literals | Over-engineered for literal union; anti-feature AF-02 | |
| Numeric priority table | Not necessary — ordering already encoded in enum position | |

**Selected:** `z.enum` + compare helper.
**Rationale:** Exact match to `forge-v2/services/vault/src/repositories/vault.repo.ts:5`. Ordered enum pattern anticipa ModelTier (Phase 6).

---

## Area 3: VaultSyncState derivation (synced vs overridden)

| Option | Description | Selected |
|--------|-------------|----------|
| `toSyncState(tier)` only, no reverse | Lossy reverse would be ambiguous (synced = platform OR owner) | ✓ |
| `toSyncState` + `fromSyncState('synced') => 'platform'` (arbitrary) | Arbitrary choice hides ambiguity, bug-prone | |
| Expose pair + throw on lossy reverse | Consumer confusion | |

**Selected:** one-way mapping, JSDoc docu warns against reverse.
**Rationale:** Matches PROJECT.md decision "synced vs overridden = tier platform|owner vs agent".

---

## Area 4: VaultEntryPlain vs VaultEntryEncrypted separation

| Option | Description | Selected |
|--------|-------------|----------|
| Two distinct Zod schemas, no union | Strongest guard against wire-format leak | ✓ |
| Discriminated union on `isSecret` | `isSecret` also exists on Plain (for ordinary env vars) — doesn't discriminate | |
| Single schema + runtime guard | Ambiguous API surface | |

**Selected:** distinct schemas.
**Rationale:** Bug #15-style defensive design (Phase 3 precedent). Parse test rifiuta mixing.

---

## Area 5: AES wire format validation

| Option | Description | Selected |
|--------|-------------|----------|
| Regex `^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$` on Encrypted.value | Precise to Forge crypto.ts output: iv=12B, tag=16B, lowercase hex | ✓ |
| Loose `string.includes(':')` | Too permissive, admits plaintext with colons | |
| Parse to Buffer + validate segment bytes | Over-engineered, regex sufficient at schema level | |

**Selected:** regex with explicit lengths.
**Rationale:** `forge-v2/services/vault/src/lib/crypto.ts:29-36` guarantees Node `toString('hex')` lowercase output; regex catches any format drift (which would be a code change in Forge — worth catching loudly).

---

## Area 6: numeric IDs (agentId/ownerId) — brand or not

| Option | Description | Selected |
|--------|-------------|----------|
| Keep `number \| null` (not branded) | Matches Forge DB Drizzle `serial` type; no lossless cast needed | ✓ |
| Brand as `VaultAgentId = number & { __brand }` | Conflict with `AgentId` (string branded in Phase 2) — concetto diverso | |
| Reuse `AgentId` branded string | Not a string in DB — wrong coercion | |

**Selected:** plain numbers.
**Rationale:** DB agentId (numeric row ID) is different from deployment `AgentId` (string slug, Phase 2). Document the split in JSDoc.

---

## Area 7: VaultSyncEvent / sync-all payload

| Option | Description | Selected |
|--------|-------------|----------|
| Empty request + `{ ok, synced[], errors[] }` response, auth session-based | Matches existing Forge route `vault.ts:167-181` exactly | ✓ |
| Add request body `{ agentIds?: number[] }` to allow partial sync | Scope creep — Phase 5 tipizza l'esistente, non lo estende | |
| Introduce separate POST per agent | New endpoint = scope creep | |

**Selected:** exact contract of existing endpoint.
**Rationale:** Phase goal is tipizzare contratti esistenti, non aggiungerne. Partial sync è out of scope (non in VLT-01..08).

---

## Area 8: PlatformBootstrapEnv validation strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Type-only export (no Zod) | Env vars sono boundary layer, ogni servizio Forge ha già env validation | ✓ |
| Full Zod schema + `parseBootstrapEnv(process.env)` | Duplicates Forge env validation in `services/*/env.ts` | |
| Zod + runtime parse at import-time | Mai eseguire logic al top-level di un type-only package | |

**Selected:** type-only.
**Rationale:** VLT-06 richiede "documenta env server, NON nel vault" — documentazione tipata ≠ validazione runtime. Il bridge non è un runtime service.

---

## Area 9: AgentVaultedCredentials source

| Option | Description | Selected |
|--------|-------------|----------|
| Re-export `AgentCredentials` from Phase 2 `src/agent/agent-credentials.ts` | Zero duplicazione, 17 known keys già consolidati | ✓ |
| Duplicate schema with vault-specific subset | Forks the known-keys list, drift risk | |
| New `VaultedCredentialCategory` enum | Over-engineered for documentation that JSDoc handles | |

**Selected:** re-export + JSDoc categorization.
**Rationale:** DRY; categorie (LLM/Telegram/Webhook/Internal) sono doc semantica, non type-level.

---

## Area 10: WorkspaceFile shape

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse `VaultTier` + shape mirrors Forge `workspace.service.ts` DB upsert | 1:1 fedeltà al consumer, stesso pattern 3-tier | ✓ |
| Separate `WorkspaceTier` enum | Forge usa lo stesso `VaultTier` (col `tier` ha stesse 3 values); duplicazione inutile | |
| Embed `content` as `Buffer` | Forge DB stores `text` nullable — string\|null è corretto | |

**Selected:** reuse `VaultTier`, `content: string | null`.
**Rationale:** Codice Forge (`workspace.service.ts:361-389`) usa esattamente questo pattern. VLT-08 richiede "stesso pattern tier-based di vault".

---

## Auto-Resolved (all areas)

Because `--auto` flag was present, each gray area was resolved by selecting the option most consistent with:
1. Forge source of truth (reads of `vault.service.ts`, `crypto.ts`, `vault.repo.ts`, `workspace.service.ts`, `routes/vault.ts`)
2. Prior phase patterns (Phase M/1/2/3/4 sub-path, Zod+z.infer, JSDoc @see, fixture tests)
3. PROJECT.md decisions (synced/overridden semantics, PlatformBootstrapEnv recursion, brand policy AF-02)
4. Requirements VLT-01..08 exact wording

**10 gray areas → 10 recommended picks, 0 user corrections needed.**

---

## External Research

None performed — codebase (Forge + bridge prior phases) was sufficient. Phase 5 plan 05-01 (research) remains in roadmap to validate fixture shapes against live staging queries before implementation.

---

## Deferred Ideas (repeated here for audit)

- Live push vault → X9 (RNTM-01)
- Credential rotation endpoints
- Vault UI schema (Forge-local)
- New push/pull endpoints beyond `sync-all`
- Branded vault IDs
- `fromSyncState` helper
- Multi-user per agent (RNTM-02)

All reflected in `05-CONTEXT.md` `<deferred>` section.
