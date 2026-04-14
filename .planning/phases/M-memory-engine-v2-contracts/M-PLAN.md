# Phase M — Memory Engine v2 Contracts (mini-phase)

**Phase:** M — Memory Engine v2 Contracts
**Type:** Mini-phase (single plan, scope-restricted, non-blocking)
**Created:** 2026-04-15
**Status:** Ready for execution
**Depends on:** Phase 0 COMPLETE (bridge scaffolding + zod v4 + TS 6 + eopt)

---

## Context & motivation

Stefano richiede di **fissare ORA** le semantiche stabili cross-repo (X9 ↔ Forge) per il futuro Memory Engine v2, PRIMA che parta il refactor della memoria X9.

**Razionale:** senza contratti fissati, il refactor Memory Engine farebbe drift tra le shape serializzate emesse da X9 e quelle consumate/persistite da Forge. Drift compile-time silente = classe di bug Bug-#15-like. Il bridge `@x9-forge/contracts` è la sede naturale: è già la single source of truth TS cross-repo.

**Principio di design:** tipizzare solo le **semantiche stabili** (enum + envelope + discriminator), **NON i dettagli interni** di come X9/Forge organizzano memoria internamente. Shape = contratto, implementazione = libera.

## Out of scope

- Nessun codice X9 / Forge toccato (mini-phase è bridge-only)
- Nessun runtime import (solo `import type`)
- Nessun merge consumer-side (solo pubblicazione schemi nel bridge)
- Nessuna decisione architetturale Memory Engine v2 — solo contratti envelope
- Nessun shim compat (non serve — nessun consumer attuale)

## Scope (in-bridge only)

Introdurre in `src/memory/` i seguenti Zod schemas + TypeScript types (via `z.infer`):

### Enum stabili
1. **MemoryScope** — `'platform' | 'owner' | 'agent' | 'user'`
2. **MemoryType** — `'profile' | 'procedural' | 'episodic' | 'relationship'`
3. **MemoryStatus** — `'active' | 'invalidated' | 'superseded' | 'redacted' | 'archived'`
4. **MemoryCorrectiveAction** — `'invalidate' | 'pin' | 'promote' | 'demote' | 'redact' | 'merge' | 'forget'`

### Object envelopes
5. **TemporalSemantics** — `{ validAt, invalidAt?, supersedes?, supersededBy? }`
6. **MemoryIdentityEnvelope** — `{ tenantId, ownerId?, agentId?, userId? }`
7. **MemoryWriteCandidate** — payload estrattore pre-persistenza: `{ scope, type, subtype?, confidence, content, identity, temporal, source, privacy }`
8. **RecallBundle** — payload recall memory-svc → agent-core: `{ profile, procedural, relationships, episodes, auditMeta }`
9. **RetentionPolicyMetadata** — `{ retentionClass, ttlSeconds?, archivalPolicy, purgeEligible }`

### Organizzazione
- `src/memory/enums.ts` — i 4 enum (MemoryScope, MemoryType, MemoryStatus, MemoryCorrectiveAction)
- `src/memory/temporal.ts` — TemporalSemantics
- `src/memory/identity.ts` — MemoryIdentityEnvelope
- `src/memory/write-candidate.ts` — MemoryWriteCandidate (composto)
- `src/memory/recall-bundle.ts` — RecallBundle (composto)
- `src/memory/retention.ts` — RetentionPolicyMetadata
- `src/memory/index.ts` — barrel export
- `src/index.ts` (root bridge) — aggiungere `export * from './memory'` se non presente via sub-path

### Sub-path export
Aggiungere a `package.json` del bridge:
```json
"exports": {
  ".": "./dist/index.js",
  "./memory": {
    "import": "./dist/memory/index.js",
    "require": "./dist/memory/index.js",
    "types": "./dist/memory/index.d.ts"
  },
  ...
}
```

Consumer futuri potranno fare:
```typescript
import type { MemoryWriteCandidate, RecallBundle } from '@x9-forge/contracts/memory';
```

---

## Task breakdown (single plan, single commit preferred)

### Task M-01.1 — Create enum schemas
File: `src/memory/enums.ts`
- `MemoryScopeSchema`, `MemoryScope` type
- `MemoryTypeSchema`, `MemoryType` type
- `MemoryStatusSchema`, `MemoryStatus` type
- `MemoryCorrectiveActionSchema`, `MemoryCorrectiveAction` type

### Task M-01.2 — Create temporal + identity envelopes
File: `src/memory/temporal.ts`, `src/memory/identity.ts`

### Task M-01.3 — Create write candidate + recall bundle + retention
File: `src/memory/write-candidate.ts`, `src/memory/recall-bundle.ts`, `src/memory/retention.ts`

### Task M-01.4 — Barrel + root export + sub-path
File: `src/memory/index.ts`, `src/index.ts` (eventual update), `package.json` exports field

### Task M-01.5 — Smoke test
File: `tests/memory.smoke.test.ts`
- Zod parse success su payload esempio per ogni schema
- Type inference via `z.infer` compila (test compile-time)
- Verifica che enum values sono esaustive

### Task M-01.6 — Build + commit atomic
- `pnpm build && pnpm test` exit 0
- Un commit atomico: `feat(memory): add Memory Engine v2 cross-repo contracts`

---

## Success criteria (binary)

- [ ] `src/memory/` contiene 7 file (.ts) + `index.ts` barrel
- [ ] 9 Zod schemas + 9 TS types esportati (via `z.infer`)
- [ ] `package.json` ha sub-path export `./memory`
- [ ] `pnpm build` exit 0 — `dist/memory/` popolata
- [ ] `pnpm test` exit 0 — smoke test covered
- [ ] Nessun consumer X9/Forge toccato
- [ ] Un commit atomico su branch `mini-phase-memory-contracts`

---

## Merge strategy

**Merge in bridge main con `--no-ff`** (preserva cronologia atomic commit + separa la mini-phase dal main body v1).

Consumer adoption:
- **Non urgente.** Nessun consumer importa memoria oggi.
- Memory Engine v2 X9 refactor (quando partirà) importerà da `@x9-forge/contracts/memory`.
- Fino ad allora, schemi stanno fermi nel bridge. Zero risk di drift runtime (import type only).

---

## Non-negoziabili

1. **Zero touch X9/Forge** (nemmeno in docs/README). Confinato al bridge.
2. **Shape stabile, implementazione libera** — gli envelope catturano forma semantica, NON prescrivono organizzazione interna delle entries.
3. **Zod v4 strict** — `exactOptionalPropertyTypes: true` coerente con bridge baseline.
4. **Sub-path export obbligatorio** — evita "import everything" sul root bridge.

---

## Rollback (se emergono problemi in session successiva)

- Branch `mini-phase-memory-contracts` è isolato dal main bridge finché non mergiato
- Se post-merge emerge che una shape è sbagliata: `git revert <merge-sha>` → schemi tornano assenti, zero impatto consumer (nessuno li importa ancora)
- Iterazione normale: branch nuovo, fix, re-merge

---

*Plan scritto 2026-04-15*
