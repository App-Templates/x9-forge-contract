# Phase 5: Vault Contracts (Block E) — Research

**Researched:** 2026-04-15
**Domain:** Cross-repo vault type contracts (3-tier + AES wire format + sync-all)
**Confidence:** HIGH (all decisions cross-checked against live Forge code; 2 minor flags — see Decision Verification)
**Researcher:** gsd-phase-researcher
**Consumed by:** gsd-planner for plans 05-02 (bridge) + 05-03 (Forge migration). Plan 05-01 IS this research.

## Summary

Phase 5 tipizza nel bridge il vault 3-tier esistente in Forge. Nessun nuovo endpoint, nessun nuovo crypto, nessuna logica di cascade — solo contratti TS/Zod che entrambi i repo consumeranno. Il lavoro principale è **defensive separation**: `VaultEntryPlain` vs `VaultEntryEncrypted` come schemi Zod distinti (nessuna union), con regex guard sul wire format AES-256-GCM per prevenire leak "wire-format-as-plaintext". Tutte le 23 locked decisions della CONTEXT.md sono state verificate contro `forge-v2/services/vault/**` e risultano coerenti con l'implementazione reale, con 2 flag minori documentati sotto.

**Primary recommendation:** Procedi con plan 05-02 seguendo il file layout D-01, usando il pattern Zod+z.infer consolidato in Phase 2-4. Per 05-03 (Forge migration), sostituisci i tipi locali in `forge-v2/packages/types/src/vault.ts` e `services/vault/src/repositories/vault.repo.ts` con import dal bridge + aggiungi contract test bulk-sync usando fixture real-SQL con valori redacted.

<user_constraints>
## User Constraints (from 05-CONTEXT.md)

### Locked Decisions (D-01..D-23)
Copiate verbatim dalla CONTEXT.md `<decisions>` block — non replicare qui, usare `.planning/phases/05-vault-contracts-block-e/05-CONTEXT.md:27-80` come source of truth. Sintesi:

- **D-01** Sub-path `@x9-forge/contracts/vault`; file layout `src/vault/{vault-tier, vault-sync-state, vault-entry, vault-sync-event, workspace-file, platform-bootstrap-env, agent-vaulted-credentials}.ts` + `index.ts` barrel.
- **D-02** Zod v4 + `z.infer` source of truth. Eccezione: `PlatformBootstrapEnv` è type-only.
- **D-03** JSDoc `@see forge-v2/services/vault/src/...` su ogni export.
- **D-04** `VaultTier = z.enum(['platform','owner','agent'])` + helper `compareTiers(a,b): -1|0|1`.
- **D-05** No branding su tier.
- **D-06** `VaultSyncState = z.enum(['synced','overridden'])`; helper `toSyncState(tier) = tier === 'agent' ? 'overridden' : 'synced'`. Reverse non esposto.
- **D-07** Unit test per ogni tier→syncState + 1 test che afferma reverse non-fornito.
- **D-08** Due schema distinti, NO union. Shape condiviso, `value` divergente: Plain = `z.string()`, Encrypted = regex wire format + `isSecret: z.literal(true)`.
- **D-09** IDs numerici (`number | null`), NON branded.
- **D-10** Fixture reali redacted (mai secret decrypted).
- **D-11** `isCustomized = tier === 'agent'` regola Forge (consumer invariant, non enforced Zod).
- **D-12..D-13** Wire format `iv_hex:auth_tag_hex:ciphertext_hex`, regex `^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$`, errore diagnostico.
- **D-14** Parse-reject cross-schema (plain/encrypted).
- **D-15** `sync-all`: empty request, response `{ ok, synced, errors }`, `SyncAgentResult = { slug, keys?, error? }`.
- **D-16** Auth Clerk session (not bridge client); contract uses `auth: 'none'`.
- **D-17** Nome canonical `SyncAllRequest` / `SyncAllResponse` + alias `VaultSyncEvent = SyncAllResponse`.
- **D-18..D-19** `PlatformBootstrapEnv` type-only, 4 env vars.
- **D-20** `AgentVaultedCredentials` = re-export alias di `AgentCredentials` da `@x9-forge/contracts/agent`.
- **D-21** Nessun refinement "must include LLM key".
- **D-22..D-23** `WorkspaceFile` shape 3-tier, `content: string | null`, `path` stringa opaca.

### Claude's Discretion
- Test organization (split vs single file).
- Esatto wording dei messaggi Zod error (entro D-13 vincolo diagnostico).
- Nome helper: `compareTiers` vs `cascadePriority` — raccomandato `compareTiers` (consistenza con Phase 6 `compareTiers` model tier).
- Se esporre `VAULT_TIERS` / `VAULT_SYNC_STATES` const arrays — raccomandato SI, per parità con `KNOWN_CREDENTIAL_KEYS` (Phase 2).

### Deferred Ideas (OUT OF SCOPE)
- Live push vault → X9 (RNTM-01, v1.1).
- Credential rotation endpoints.
- Vault UI schema (Forge-local).
- Endpoint nuovi push/pull vault (oltre `sync-all`).
- Brand IDs vault (anti-feature AF-02).
- `fromSyncState` helper (lossy, non esposto).
- Multi-user dentro agent (RNTM-02).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **VLT-01** | `VaultTier` enum `'platform' \| 'owner' \| 'agent'` (ordered) | Verified in `forge-v2/services/vault/src/repositories/vault.repo.ts:5`. Schema bridge `z.enum(['platform','owner','agent'])` + helper `compareTiers`. See "Exact shapes extracted" §1. |
| **VLT-02** | `VaultSyncState` derived `'synced'\|'overridden'` + `toSyncState(tier)` | Helper one-way — see Validation Architecture §Invariants. |
| **VLT-03** | `VaultEntryPlain` DTO post-decrypt | Shape extracted from `vault.service.ts:42-51` + `findAllForAgent` return type. See "Exact shapes extracted" §3a. |
| **VLT-04** | `VaultEntryEncrypted` wire-format distinct | Regex from `crypto.ts:29-36`. See "Exact shapes extracted" §2 + §3b. Parse-reject tests in Validation Architecture. |
| **VLT-05** | `VaultSyncEvent` for POST /api/vault/sync-all | Verified `routes/vault.ts:167-181` + `vault.service.ts:289-308`. See "Exact shapes extracted" §4. Named `SyncAllRequest/Response` + alias `VaultSyncEvent`. |
| **VLT-06** | `PlatformBootstrapEnv` non-vaulted, 4 env vars | Recursion rationale validated — `VAULT_KEY` read from `process.env` in `crypto.ts:21`, cannot be in the vault. Type-only (D-18). |
| **VLT-07** | `AgentVaultedCredentials` categories | Re-export alias of Phase 2 `AgentCredentials` (17 keys). JSDoc categorization LLM/Telegram/Webhook/Internal. |
| **VLT-08** | `WorkspaceFile` shape 3-tier | Shape extracted from `forge-v2/services/workspace/src/services/workspace.service.ts:361-391` + Drizzle `workspace_files` table. See "Exact shapes extracted" §5. |
</phase_requirements>

## Project Constraints (from project CLAUDE.md / PROJECT.md)

- Zod v4 single source of truth (BRDG-04); types via `z.infer`.
- JSDoc `@see forge-v2/<path>` cross-repo traceability (OBS-04).
- `exactOptionalPropertyTypes: true` — opzionali come `field?: T | undefined` esplicito.
- Zero-runtime-dep per sub-moduli — no crypto lib, no deps. Wire format validato solo via regex.
- Mai committare fixture con secret decrypted reali (ASVS V7, PROJECT.md §Research Mandate).
- Ogni contratto ha parse-test (unit) + fixture reale redacted (TEST-01, TEST-02).

---

## Decision Verification (D-01..D-23)

Ogni decision CONTEXT.md è stata verificata contro la sorgente Forge. Esito:

| # | Decision | Status | Evidence |
|---|----------|--------|----------|
| D-01 | Sub-path `@x9-forge/contracts/vault` + file layout | ✓ confirmed | `package.json` ha già `./vault` export (line 38-41); dir `src/vault/index.ts` placeholder presente. |
| D-02 | Zod v4 + `z.infer`; `PlatformBootstrapEnv` type-only | ✓ confirmed | Pattern consolidato Phase 2-4 (`src/agent/agent-context-core.ts:37`, `src/http/endpoints/voice-register.ts:24`). |
| D-03 | JSDoc `@see forge-v2/...` | ✓ confirmed | Pattern già applicato nelle Phase 1/4 (`voice-register.ts:12`). |
| D-04 | `VaultTier = z.enum([...])` + `compareTiers` | ✓ confirmed | `vault.repo.ts:5`: `export type VaultTier = 'platform' \| 'owner' \| 'agent';` — identica semantica. |
| D-05 | No branding | ✓ confirmed | `AgentId` branded è per slug string; vault tier/IDs sono DB number. Coerente con AF-02. |
| D-06 | `toSyncState(tier)` mapping one-way | ✓ confirmed | Nessun codice Forge calcola `fromSyncState` — è semantic UI label, non field persisted. |
| D-07 | Unit test reverse non-fornito | ✓ confirmed | Nuova test case, implementa in Plan 05-02. |
| D-08 | Plain vs Encrypted schema distinti | ✓ confirmed | `vault.repo.ts:12`: `value: string; // AES-256 encrypted — caller must decrypt`. `vault.service.ts:44`: `VaultEntry.value // decrypted`. Shape stesso, semantica divergente — legittimo splittare. |
| D-09 | IDs numerici non-branded | ✓ confirmed | Drizzle `agent_id: integer`, `owner_id: integer` (schema.ts:43-44). Branded `AgentId` (Phase 2) è `string` (slug) — concetti diversi (DB row PK vs deployment slug). Coerente. |
| D-10 | Fixture redacted | ✓ confirmed — implementativa | Pattern Phase 2 `tests/agent/fixtures/context-production-sample.json` già usa `"REDACTED"`. |
| D-11 | `isCustomized = tier==='agent'` invariant consumer | ✓ confirmed | `vault.repo.ts:64`: `const isCustomized = tier === 'agent';`. Forge lo enforca sul write; il bridge lo documenta senza duplicare la logica. **Attenzione:** `workspace.service.ts:388` preserva `isCustomized` su onConflict (non lo reimposta) — quindi per workspace l'invariant è meno rigido (può diventare `true` su platform/owner tier se operator lo setta manualmente). Documentare in JSDoc che regola è Forge-side e può divergere per WorkspaceFile. |
| D-12 | Wire format `iv:tag:ct` AES-256-GCM | ✓ confirmed | `crypto.ts:29-36` — verbatim: `return `${iv.toString("hex")}:${tag}:${encrypted}`;` con iv=12B (`randomBytes(12)`), tag da `getAuthTag()` (16B per GCM standard), cipher `aes-256-gcm`. |
| D-13 | Regex `^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$` lowercase | ✓ confirmed | Node `Buffer.toString('hex')` ritorna lowercase (documentato). iv 12B → 24 hex; tag 16B → 32 hex; ciphertext variable ≥2 hex (min 1 byte). **Refinement suggerito:** regex `^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]{2,}$` (min 2 hex = 1 byte plaintext) per prevenire edge `""` encrypted. |
| D-14 | Parse-reject cross-schema | ✓ confirmed | Testabile con fixture: see Validation Architecture §Parse-reject matrix. |
| D-15 | sync-all shape empty req + `{ok,synced,errors}` | ✓ confirmed | `routes/vault.ts:171-174`: `const result = await vaultService.syncGlobalToAllAgents(); reply.send({ ok: true, ...result });`. Service returns `{ synced, errors }` (both `SyncAgentResult[]`). `SyncAgentResult = { slug: string; keys?: number; error?: string }` (`vault.service.ts:62-66`). |
| D-15 | (same) | ⚠ minor flag | `vault.service.ts:301` hardcodes `synced.push({ slug, keys: 0 })` — `keys` is always 0 in current Forge (never counts actual vars written). Bridge schema deve tipizzare `keys?: number` (opzionale), ma documentare in JSDoc che l'attuale Forge implementation passa 0. Fix count is Forge-side follow-up, NON in scope Phase 5. |
| D-16 | Clerk auth, bridge contract `auth: 'none'` | ✓ confirmed | `routes/vault.ts:170`: `preHandler: [requireAuth, requireSuperadmin]` — Clerk session + superadmin check. Nessun `X-Internal-*` header. Bridge tipizza solo shape, auth delegato (come AuthNone pattern consolidato Phase 4.1). |
| D-17 | Nomi `SyncAllRequest/Response` + alias `VaultSyncEvent` | ✓ confirmed | Naming discretion OK — no precedente Forge con nome `SyncAllRequest`. |
| D-18 | `PlatformBootstrapEnv` type-only | ✓ confirmed | Ricorsione `VAULT_KEY` verificata — `crypto.ts:21` reads `process.env.VAULT_KEY` al boot, quindi non può vivere nel vault. Analoga ricorsione: `DATABASE_URL` (vault store), `CLERK_SECRET_KEY` (auth pre-vault), `SUPERADMIN_CLERK_ID` (auth pre-vault). |
| D-19 | Shape 4 env vars | ✓ confirmed | `VAULT_KEY` (`crypto.ts:21`), `CLERK_SECRET_KEY` + `SUPERADMIN_CLERK_ID` (Forge auth middleware), `DATABASE_URL` (Drizzle bootstrap). Matches PROJECT.md §"Key Decisions" line 124. |
| D-20 | Re-export alias di `AgentCredentials` | ✓ confirmed | Pattern identico a `X9AgentContext` alias in `forge-v2/packages/types/src/x9.ts:35`. Zero dup. **Circular-import risk analysis:** re-export è TS-only alias, no runtime import loop. `src/vault/agent-vaulted-credentials.ts` può fare `export { AgentCredentialsSchema as AgentVaultedCredentialsSchema, type AgentCredentials as AgentVaultedCredentials } from '../agent/agent-credentials.js'` — sibling sub-path, nessun ciclo (bridge root → vault → agent). Safe. |
| D-21 | No refinement "must include LLM key" | ✓ confirmed | Business-level rule, non schema-enforcable (capability-dynamic). |
| D-22 | `WorkspaceFile` shape | ✓ confirmed | Drizzle `workspace_files` (schema.ts:57-70) + `syncWorkspaceFilesToDB` (`workspace.service.ts:361-389`). |
| D-23 | `content: string \| null` | ✓ confirmed | `workspace.service.ts:368`: `let content: string \| null = null; try { content = fs.readFileSync(...); } catch { /* unreadable */ }`. Drizzle col `content: text('content')` nullable (schema.ts:63). |

**Flags summary:**
- ⚠ **D-15 minor** — Forge `keys: 0` hardcoded. Document in JSDoc, keep `keys?: number`. No CONTEXT decision change needed.
- ⚠ **D-08 minor** — CONTEXT §D-08 says `updatedAt: z.iso.datetime()`. Il pattern Phase M usa `z.string().datetime({ offset: true })` (`src/memory/temporal.ts:21`). Raccomando allineamento col pattern esistente (`z.string().datetime({ offset: true })`) per consistenza cross-phase. Nessun blocker.

**Nessun conflitto sostanziale tra CONTEXT.md e codice Forge.** CONTEXT.md è affidabile come source of truth per il planner.

---

## Exact Shapes Extracted from Forge Code

Tutti gli snippet sono verbatim dal repository `forge-v2/` (letto 2026-04-15).

### §1. VaultTier (source of truth)

```ts
// forge-v2/services/vault/src/repositories/vault.repo.ts:5
export type VaultTier = 'platform' | 'owner' | 'agent';
```

Drizzle column:
```ts
// forge-v2/packages/db/src/schema.ts:49
tier: text('tier').notNull().default('agent'), // 'platform' | 'owner' | 'agent'
```

**Ordering semantics** (from `vault.service.ts:258`):
> `// Merge: later tiers override earlier tiers (platform < owner < agent)`

Cascade resolve order (highest priority first) in `resolve()`:
```ts
// vault.service.ts:82,94,106 — commented tiers
// Tier 1: agent-specific entry
// Tier 2: owner-scoped entry
// Tier 3: platform-wide entry
```

Bridge mapping: `compareTiers(a, b)` = compare index in `['platform','owner','agent']` — **higher index = higher priority** (overrides). Beware: in `resolve()` comments "Tier 1" = agent (highest), but array ordering in Zod enum is lexical `['platform','owner','agent']` where agent is index 2 (still highest). Consistent.

### §2. AES wire format (source of truth)

```ts
// forge-v2/services/vault/src/lib/crypto.ts:29-36 (encrypt)
export function encrypt(text: string): string {
  const iv = randomBytes(12);                          // 12 bytes = 24 hex chars
  const cipher = createCipheriv("aes-256-gcm", ENC_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");     // 16 bytes = 32 hex chars (GCM default)
  return `${iv.toString("hex")}:${tag}:${encrypted}`;
}
```

Key: `ENC_KEY = Buffer.from(process.env.VAULT_KEY, "hex")` — 32 bytes (AES-256). Fallback in dev = `sha256("forge-vault-default-key")`.

**Bridge regex** (recommended):
```ts
const AES_WIRE_FORMAT_REGEX = /^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]{2,}$/;
```
Rationale: `{2,}` en lieu de `+` garantisce minimo 1 byte ciphertext (previene parse di `""` encrypted pathologici).

Error message suggestion (for D-13):
> `"expected AES-256-GCM wire format: iv_hex(24):authTag_hex(32):ciphertext_hex(lowercase, ≥2 hex chars)"`

### §3. VaultEntry shapes

#### §3a. VaultEntryPlain (DTO post-decrypt)

Source: `vault.service.ts:42-51` (public interface `VaultEntry`):
```ts
export interface VaultEntry {
  id: number;
  key: string;
  value: string;   // decrypted
  isSecret: boolean;
  isCustomized: boolean;
  tier: VaultTier;
  agentId: number | null;
  ownerId: number | null;
}
```

Also used as API response by `listForAgent(agentId, ownerId)` (`vault.service.ts:119-131`) and exposed via `GET /api/vault/:agentSlug` (`routes/vault.ts:80-88`).

**Note:** `updatedAt` appears NOT in current Forge `VaultEntry` interface but **IS** in Drizzle `vault_entries` table (`createdAt: timestamp('created_at').defaultNow().notNull()` — but NO `updated_at` column on `vault_entries`!). Actually `workspace_files` has `updatedAt` but `vault_entries` has only `createdAt` (schema.ts:50). CONTEXT §D-08 says `updatedAt: z.iso.datetime()` for `VaultEntryPlain` — ⚠ **FLAG:** this field does not exist on Forge `vault_entries` table. Either:
- Option A: Drop `updatedAt` from `VaultEntryPlain` (match reality).
- Option B: Rename to `createdAt`.
- Option C: Add `updatedAt` as optional (`updatedAt?: string | undefined`), Forge can omit.

**Recommendation to planner:** Option B (`createdAt` as `z.string().datetime({ offset: true })` optional). Less friction, matches DB. Matches `workspaceFiles.updatedAt` as separate field on WorkspaceFile (which DOES have `updated_at`, schema.ts:65).

Bridge schema (proposed):
```ts
export const VaultEntryPlainSchema = z.object({
  id: z.number().int().nonnegative(),
  key: z.string().min(1),
  value: z.string(),                       // decrypted plaintext
  isSecret: z.boolean(),
  isCustomized: z.boolean(),
  tier: VaultTierSchema,
  agentId: z.number().int().nullable(),
  ownerId: z.number().int().nullable(),
  createdAt: z.string().datetime({ offset: true }).optional(),
});
```

#### §3b. VaultEntryEncrypted (wire format)

Source: `vault.repo.ts:7-16` (`VaultRow`) — shape identical PLUS `value` is encrypted when `isSecret=true`. Non-secret entries (`isSecret=false`) are stored plaintext in the same `value` column.

⚠ **Edge case (important for planner):** Not all rows are encrypted! Only rows with `isSecret=true` are encrypted. A row with `isSecret=false` has plaintext `value` even at the wire/DB level. This makes the Plain vs Encrypted distinction **state-dependent** not **field-dependent**.

**Decision D-08** says: `VaultEntryEncrypted` requires `isSecret: z.literal(true)` + value matches wire regex. This correctly captures only the encrypted subset. Rows with `isSecret=false` are `VaultEntryPlain` (even when read directly from DB) — they have plaintext value by design. Good.

Bridge schema (proposed):
```ts
export const VaultEntryEncryptedSchema = z.object({
  id: z.number().int().nonnegative(),
  key: z.string().min(1),
  value: z.string().regex(AES_WIRE_FORMAT_REGEX, {
    message: "expected AES-256-GCM wire format: iv_hex(24):authTag_hex(32):ciphertext_hex(lowercase, ≥2 hex chars)",
  }),
  isSecret: z.literal(true),
  isCustomized: z.boolean(),
  tier: VaultTierSchema,
  agentId: z.number().int().nullable(),
  ownerId: z.number().int().nullable(),
  createdAt: z.string().datetime({ offset: true }).optional(),
});
```

### §4. SyncAllRequest / SyncAllResponse / SyncAgentResult

Source: `vault.service.ts:62-66`:
```ts
export interface SyncAgentResult {
  slug: string;
  keys?: number;
  error?: string;
}
```

Source: `vault.service.ts:289-308` (service return):
```ts
async syncGlobalToAllAgents(): Promise<{ synced: SyncAgentResult[]; errors: SyncAgentResult[] }>
```

Source: `routes/vault.ts:168-181` (route):
```ts
fastify.post(
  "/api/vault/sync-all",
  { preHandler: [requireAuth, requireSuperadmin] },
  async (_request, reply) => {
    try {
      const result = await vaultService.syncGlobalToAllAgents();
      reply.send({ ok: true, ...result });
    } catch (err) {
      reply.status(500).send({ ok: false, error: (err as Error).message });
    }
  }
);
```

**Success shape:** `{ ok: true, synced: SyncAgentResult[], errors: SyncAgentResult[] }`
**Error shape:** `{ ok: false, error: string }` (500-level only).
**Request body:** Empty (`_request` unused).

Bridge schemas (proposed):
```ts
export const SyncAgentResultSchema = z.object({
  slug: z.string().min(1),
  keys: z.number().int().nonnegative().optional(),  // NOTE: Forge hardcodes 0 currently (vault.service.ts:301)
  error: z.string().optional(),
});

export const SyncAllRequestSchema = z.object({}).strict(); // empty body

export const SyncAllResponseSchema = z.object({
  ok: z.literal(true),
  synced: z.array(SyncAgentResultSchema),
  errors: z.array(SyncAgentResultSchema),
});

export const SyncAllErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
});

/** Alias for VLT-05 nomenclature adherence */
export type VaultSyncEvent = z.infer<typeof SyncAllResponseSchema>;
```

### §5. WorkspaceFile

Source: `forge-v2/services/workspace/src/services/workspace.service.ts:361-389` + Drizzle `workspace_files` table (`schema.ts:57-70`):

Drizzle columns:
```ts
agentId: integer('agent_id').references(() => agents.id),       // nullable
ownerId: integer('owner_id').references(() => owners.id),       // nullable, Phase 2 WKSP-01
tier: text('tier').notNull().default('agent'),                  // 'platform' | 'owner' | 'agent'
path: text('path').notNull(),
content: text('content'),                                       // nullable
isCustomized: boolean('is_customized').notNull().default(false),
updatedAt: timestamp('updated_at').defaultNow().notNull(),
```

⚠ **FLAG vs CONTEXT D-22:** CONTEXT says `agentId: number` (non-null). Drizzle says `agentId: integer` nullable (platform-tier workspace files have `agentId=null`). `syncWorkspaceFilesToDB` always passes an agentId, but platform-tier entries upserted elsewhere could have null. **Recommendation to planner:** follow Drizzle — `agentId: number | null` for consistency with VaultEntry tier pattern. Confirm with user or inspect `classifyTier()` to see if non-agent tier is ever set via syncWorkspaceFilesToDB.

Bridge schema (proposed):
```ts
export const WorkspaceFileSchema = z.object({
  agentId: z.number().int().nullable(),
  ownerId: z.number().int().nullable(),
  tier: VaultTierSchema,
  path: z.string().min(1),
  content: z.string().nullable(),
  isCustomized: z.boolean(),
  updatedAt: z.string().datetime({ offset: true }),
});
```

### §6. PlatformBootstrapEnv

Type-only (D-18). No Drizzle table (these are env vars, not DB rows).

```ts
/**
 * Environment variables that MUST exist at Forge service boot.
 * These CANNOT live in the vault (recursion: vault reads VAULT_KEY to decrypt).
 *
 * @see forge-v2/services/vault/src/lib/crypto.ts:21 (VAULT_KEY)
 * @see forge-v2/services/*\/src/env.ts (service env loading)
 * @see PROJECT.md §"Key Decisions" line 124
 */
export type PlatformBootstrapEnv = {
  VAULT_KEY: string;           // hex-encoded 32-byte AES key
  DATABASE_URL: string;        // Drizzle/Postgres connection string
  CLERK_SECRET_KEY: string;    // Clerk auth server key
  SUPERADMIN_CLERK_ID: string; // hardcoded super-admin user ID (RNTM-03: removable post v1)
};
```

### §7. AgentVaultedCredentials (re-export)

```ts
// src/vault/agent-vaulted-credentials.ts
/**
 * Agent-scoped vaulted credentials — alias of AgentCredentials (Phase 2).
 *
 * Categories (documentation-only, no schema enforcement):
 *   - LLM:       OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY, AGENT_CHAT_MODEL
 *   - Telegram:  TELEGRAM_BOT_TOKEN
 *   - Voice/Webhook: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, ELEVENLABS_MINDFULNESS_AGENT_ID,
 *                    FORGE_VOICE_REGISTER_TOKEN
 *   - Mail:      AGENTMAIL_API_KEY, AGENTMAIL_INBOX_ID, AGENT_EMAIL
 *   - Calendar:  GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET,
 *                GOOGLE_CALENDAR_REFRESH_TOKEN
 *   - Internal:  INTERNAL_SECRET, X9_INTERNAL_SECRET
 *   - (dynamic): any capability-specific key (catchall)
 *
 * @see @x9-forge/contracts/agent (source of truth)
 * @see src/agent/agent-credentials.ts (KNOWN_CREDENTIAL_KEYS)
 */
export {
  AgentCredentialsSchema as AgentVaultedCredentialsSchema,
} from '../agent/agent-credentials.js';
export type { AgentCredentials as AgentVaultedCredentials } from '../agent/agent-credentials.js';
```

---

## Fixture Strategy

### Where fixtures live
```
tests/vault/fixtures/
├── vault-entry-plain-agent.json           # tier=agent, plaintext value
├── vault-entry-plain-platform.json        # tier=platform, plaintext value, isSecret=false
├── vault-entry-encrypted-agent.json       # tier=agent, wire-format value, isSecret=true
├── vault-entry-encrypted-owner.json       # tier=owner, wire-format value, isSecret=true
├── sync-all-response-ok.json              # 3 agents synced, 1 error
├── sync-all-response-all-ok.json          # happy path, empty errors
├── sync-all-response-all-errors.json      # pathological, empty synced
├── workspace-file-platform.json           # content=null (unreadable), tier=platform
├── workspace-file-agent.json              # content=string, tier=agent, isCustomized=true
└── REDACTION-NOTES.md                     # how each field was redacted
```

### Redaction rules (ASVS L1 — fixture file policy)

1. **NEVER commit real secret values.** Use `"REDACTED"` for plaintext that was a real secret, `"not-a-secret"` for non-sensitive.
2. **For encrypted values:** use synthetic hex generated via test utility (not real `encrypt()` output from staging). Example: `"aaaaaaaaaaaaaaaaaaaaaaaa:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb:deadbeef"` — cryptographically meaningless but regex-valid. Document in fixture JSON with `"_synthetic": true` sentinel.
3. **Real DB IDs:** OK to keep (they're not secret). Use small numbers (1, 2, 3) for readability.
4. **Slugs:** use `"test-agent-a"`, `"test-agent-b"` (not real agent slugs).
5. **Timestamps:** use fixed `"2026-04-15T12:00:00Z"` for determinism.

### Capture workflow (optional, Plan 05-03)
If staging VPS has deployed agents with real vault entries, SQL to capture (redacted at source):
```sql
-- Run on staging VPS via SSH (reference_vps_ssh.md)
SELECT id, agent_id, owner_id, key, tier, is_secret, is_customized, created_at
FROM vault_entries
LIMIT 10;
-- Export result, then MANUALLY redact `value` column before committing fixture.
-- NEVER run: SELECT ... value ... — avoid accidentally capturing real ciphertext or plaintext.
```

**Preferred approach:** start with synthetic fixtures (regex-valid, deterministic). Capture real fixtures only if Plan 05-03 contract test requires it for bulk-sync smoke test. Synthetic suffices for unit-level Zod tests (Plan 05-02).

---

## Plan 05-02 (Bridge) — Implementation Notes

### File list to create

```
src/vault/
├── index.ts                          # barrel (REPLACE placeholder)
├── vault-tier.ts                     # VaultTierSchema + compareTiers + VAULT_TIERS
├── vault-sync-state.ts               # VaultSyncStateSchema + toSyncState + VAULT_SYNC_STATES
├── vault-entry.ts                    # VaultEntryPlainSchema + VaultEntryEncryptedSchema + AES_WIRE_FORMAT_REGEX
├── vault-sync-event.ts               # SyncAllRequest/Response/ErrorResponse + SyncAgentResult + VaultSyncEvent alias
├── workspace-file.ts                 # WorkspaceFileSchema
├── platform-bootstrap-env.ts         # PlatformBootstrapEnv type-only
└── agent-vaulted-credentials.ts      # Re-export alias of AgentCredentials
```

### Export layout (src/vault/index.ts)

```ts
/**
 * Vault domain — cross-repo contracts for 3-tier vault + workspace files.
 *
 * @module @x9-forge/contracts/vault
 * @see .planning/phases/05-vault-contracts-block-e/05-RESEARCH.md
 */

// Tier
export { VaultTierSchema, VAULT_TIERS, compareTiers } from './vault-tier.js';
export type { VaultTier } from './vault-tier.js';

// Sync state
export { VaultSyncStateSchema, VAULT_SYNC_STATES, toSyncState } from './vault-sync-state.js';
export type { VaultSyncState } from './vault-sync-state.js';

// Entries
export {
  AES_WIRE_FORMAT_REGEX,
  VaultEntryPlainSchema,
  VaultEntryEncryptedSchema,
} from './vault-entry.js';
export type { VaultEntryPlain, VaultEntryEncrypted } from './vault-entry.js';

// Sync event
export {
  SyncAgentResultSchema,
  SyncAllRequestSchema,
  SyncAllResponseSchema,
  SyncAllErrorResponseSchema,
  syncAllContract,
} from './vault-sync-event.js';
export type {
  SyncAgentResult,
  SyncAllRequest,
  SyncAllResponse,
  SyncAllErrorResponse,
  VaultSyncEvent,
} from './vault-sync-event.js';

// Workspace file
export { WorkspaceFileSchema } from './workspace-file.js';
export type { WorkspaceFile } from './workspace-file.js';

// Bootstrap env (type-only, no runtime Zod)
export type { PlatformBootstrapEnv } from './platform-bootstrap-env.js';

// Vaulted credentials alias
export { AgentVaultedCredentialsSchema } from './agent-vaulted-credentials.js';
export type { AgentVaultedCredentials } from './agent-vaulted-credentials.js';
```

### Test file layout

```
tests/vault/
├── vault-tier.test.ts                # enum, compareTiers, VAULT_TIERS const
├── vault-sync-state.test.ts          # enum, toSyncState each tier, reverse not provided test
├── vault-entry.test.ts               # Plain parse, Encrypted parse, cross-reject matrix (D-14)
├── vault-sync-event.test.ts          # empty request, response shapes, SyncAgentResult optional fields
├── workspace-file.test.ts            # 3 fixtures parse, content null allowed
├── agent-vaulted-credentials.test.ts # alias parity (same output as AgentCredentials)
└── fixtures/                         # see Fixture Strategy above
```

### Endpoint contract object (pattern from Phase 4)

```ts
// src/vault/vault-sync-event.ts
export const syncAllContract = {
  method: 'POST' as const,
  path: '/api/vault/sync-all' as const,
  authType: 'none' as const,                   // D-16: Clerk session handled externally
  bodySchema: SyncAllRequestSchema,
  responseSchema: SyncAllResponseSchema,
  errorResponseSchema: SyncAllErrorResponseSchema,
} as const;
```

Matches `EndpointContract` type in `src/http/endpoint-contract.ts` (verify shape in Plan 05-02).

### Test count estimate
- vault-tier: 5 tests (enum, 3 compare cases, const export)
- vault-sync-state: 4 tests (enum, platform→synced, owner→synced, agent→overridden, reverse-not-provided assertion)
- vault-entry: 10 tests (4 fixtures × parse + 4 cross-reject + regex edge cases)
- vault-sync-event: 6 tests (empty req, happy response, all-errors, all-ok, SyncAgentResult optional fields, contract shape)
- workspace-file: 4 tests (platform/owner/agent fixture + content-null)
- agent-vaulted-credentials: 2 tests (alias parity + JSDoc categories documented)

**Total: ~31 new tests.** Current bridge 228 → target ~259 after Phase 5.

---

## Plan 05-03 (Forge Migration) — Implementation Notes

### Files to edit in forge-v2

| File | Current | Change |
|------|---------|--------|
| `forge-v2/packages/types/src/vault.ts` | Local `VaultTier` + `VaultEntry` | Replace with re-exports from `@x9-forge/contracts/vault` (alias pattern from `x9.ts:35`). |
| `forge-v2/packages/types/src/index.ts` | `export * from './vault';` | Unchanged (re-export path same, internals shimmed). |
| `forge-v2/services/vault/src/repositories/vault.repo.ts` | `export type VaultTier` local | Import `VaultTier` from `@x9-forge/contracts/vault`. Keep `VaultRow` local (DB-layer detail). |
| `forge-v2/services/vault/src/services/vault.service.ts` | Local `ResolvedCredential`, `VaultEntry`, `SyncAgentResult` | Import `VaultTier`, `SyncAgentResult`, `VaultEntryPlain` (as `VaultEntry` alias) from bridge. |
| `forge-v2/services/vault/src/routes/vault.ts` | Fastify route inline zod schemas | Use `SyncAllResponseSchema` from bridge in route response (optional, for contract test validation). |
| `forge-v2/services/workspace/src/services/workspace.service.ts` | Inline upsert shape | Optional: validate upsert value via `WorkspaceFileSchema` before insert (fail-loud guard). |

### Exact import statements to land

```ts
// forge-v2/packages/types/src/vault.ts (REWRITE)
/**
 * Vault types — re-exported from @x9-forge/contracts/vault (bridge v1, Phase 5).
 * Do NOT define vault types here — add them to the bridge instead.
 * @see x9-forge-contract-bridge/src/vault/
 */
export type {
  VaultTier,
  VaultSyncState,
  VaultEntryPlain as VaultEntry,   // alias preserves Forge consumer imports
  VaultEntryEncrypted,
  SyncAgentResult,
  SyncAllRequest,
  SyncAllResponse,
  WorkspaceFile,
  PlatformBootstrapEnv,
  AgentVaultedCredentials,
} from '@x9-forge/contracts/vault';

export {
  VaultTierSchema,
  VaultSyncStateSchema,
  VaultEntryPlainSchema,
  VaultEntryEncryptedSchema,
  SyncAgentResultSchema,
  SyncAllRequestSchema,
  SyncAllResponseSchema,
  WorkspaceFileSchema,
  compareTiers,
  toSyncState,
  VAULT_TIERS,
  VAULT_SYNC_STATES,
  AES_WIRE_FORMAT_REGEX,
} from '@x9-forge/contracts/vault';
```

```ts
// forge-v2/services/vault/src/repositories/vault.repo.ts (TOP CHANGE)
import type { VaultTier } from '@x9-forge/contracts/vault';
// Remove: export type VaultTier = ...   (line 5)
// Keep: export interface VaultRow { ... } (it's a DB-row superset, includes `id`)
```

```ts
// forge-v2/services/vault/src/services/vault.service.ts (TOP CHANGE)
import type { VaultTier, SyncAgentResult } from '@x9-forge/contracts/vault';
// Remove: local SyncAgentResult interface (line 62-66)
// Keep: ResolvedCredential, VaultEntry, DisplayVar (Forge-specific DTOs)
// Or: alias VaultEntry = VaultEntryPlain from bridge (D-20 pattern)
```

### Contract test for sync-all (Plan 05-03)

**Two-tier approach** (recommended):

1. **Unit-level contract test** (fast, runs in CI):
   - `forge-v2/services/vault/test/routes/sync-all.contract.test.ts`
   - Mock `agentRepo.findAll` → returns 2 test agents.
   - Mock `syncToEnvFile` → resolves for 1, throws for the other.
   - Call `vaultService.syncGlobalToAllAgents()`.
   - Validate result shape with `SyncAllResponseSchema.parse({ ok: true, ...result })` from bridge.
   - Assert `synced.length === 1`, `errors.length === 1`, `errors[0].error` is a string.

2. **Integration smoke test** (optional, manual/VPS):
   - Defer to `05-03-SMOKE.md` post-merge (pattern from Phase 4).
   - `curl -X POST https://forge-staging.x9.local/api/vault/sync-all -H 'Cookie: <clerk-session>' -H 'Content-Type: application/json' -d '{}'`
   - Pipe response through `SyncAllResponseSchema.parse()` via a one-liner node script.
   - NOT in CI (requires Clerk session + VPS). Operator task, matches Phase 4 smoke-deferred pattern.

**Mock vs. real:** unit-level with mocks is sufficient for drift guard (bridge schema change → Forge test fails). Integration smoke is belt-and-suspenders, not gating.

### Package dep updates
- `forge-v2/packages/types/package.json`: no change — already depends on `@x9-forge/contracts` (Phase 1).
- `forge-v2/services/vault/package.json`: add `"@x9-forge/contracts": "workspace:*"` dep if not already present (verify in Plan 05-03 task 1).

---

## Validation Architecture (Nyquist Dimension 8)

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.0.x (bridge) + Vitest (forge-v2 services/vault) |
| Config file | `vitest.config.ts` (bridge root), `services/vault/vitest.config.ts` (Forge) |
| Quick run command | `pnpm test -- tests/vault` (bridge) / `pnpm -F forge-vault-svc test` (Forge) |
| Full suite command | `pnpm test` (bridge, all ~259 tests) |

### Invariants (the things Validation Architecture must guarantee)

| # | Invariant | How enforced | Test file |
|---|-----------|--------------|-----------|
| I1 | `VaultTier` enum exactly `['platform','owner','agent']` | `z.enum([...])` + exhaustiveness test | `tests/vault/vault-tier.test.ts` |
| I2 | `compareTiers(a,b)` returns `-1\|0\|1` consistent with cascade order | 3-way comparison table test | `tests/vault/vault-tier.test.ts` |
| I3 | `toSyncState(tier)` surjective: platform,owner → synced; agent → overridden | Enum iteration test | `tests/vault/vault-sync-state.test.ts` |
| I4 | Reverse `fromSyncState` not exposed (lossy) | Type-level assertion (`// @ts-expect-error`) + runtime `expect(vault.fromSyncState).toBeUndefined()` | `tests/vault/vault-sync-state.test.ts` |
| I5 | **`VaultEntryPlain` REJECTS wire-format value when `isSecret=true`** | Regex-negative fixture parse | `tests/vault/vault-entry.test.ts` — `Plain rejects wire format` case. ⚠ Subtle: Plain's `value: z.string()` accepts ANY string including wire format. To enforce rejection, Plain must NOT match wire-format. Options: (A) Plain.value = `z.string().regex(/^[^:]*$|^((?![0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$).)*$/)` — negative regex. (B) Add semantic refinement: `if isSecret=true, reject if value matches wire regex`. **Recommended B** — more explicit, clearer error. See "Parse-reject matrix" below. |
| I6 | `VaultEntryEncrypted` REJECTS plaintext value (no `:` or wrong segments) | Regex parse failure | `tests/vault/vault-entry.test.ts` — `Encrypted rejects plaintext` case |
| I7 | `VaultEntryEncrypted.isSecret === true` enforced | `z.literal(true)` | `tests/vault/vault-entry.test.ts` |
| I8 | `SyncAllResponse` shape exact: `ok=true, synced[], errors[]` | Fixture parse + `.strict()` consideration | `tests/vault/vault-sync-event.test.ts` |
| I9 | `SyncAllRequest` rejects non-empty body | `.strict()` or explicit shape test | `tests/vault/vault-sync-event.test.ts` |
| I10 | `WorkspaceFile.content` accepts null | Null fixture parse | `tests/vault/workspace-file.test.ts` |
| I11 | `AgentVaultedCredentials` schema === `AgentCredentials` schema (referential) | `expect(AgentVaultedCredentialsSchema).toBe(AgentCredentialsSchema)` | `tests/vault/agent-vaulted-credentials.test.ts` |
| I12 | Bridge `VaultTier` matches Forge DB column values | Fixture from DB dump parses | contract test Plan 05-03 |

### Parse-reject matrix (invariants I5+I6)

| Fixture value | `VaultEntryPlain.parse()` | `VaultEntryEncrypted.parse()` | Meaning |
|---|---|---|---|
| `"plain-text-password"` + `isSecret=false` | ✅ pass | ❌ reject (regex) | plaintext non-secret |
| `"plain-text-password"` + `isSecret=true` | ⚠ edge — see I5 | ❌ reject (regex) | **LEAK RISK** — decrypted secret posing as plain |
| `"aaaaaa...a:bbbb..b:dead"` + `isSecret=true` | ⚠ edge — I5 guard needed | ✅ pass | normal encrypted |
| `"aaaaaa...a:bbbb..b:dead"` + `isSecret=false` | ✅ pass (matches Plain's loose string) | ❌ reject (literal true) | suspicious — plaintext stored looking like wire format |

**Conclusion:** Implement **I5 guard via Zod refinement**:
```ts
VaultEntryPlainSchema.refine(
  (data) => !(data.isSecret && AES_WIRE_FORMAT_REGEX.test(data.value)),
  { message: "Plain secret value matches AES wire format — decrypt was not performed?" }
);
```
This catches the main leak scenario: a secret field still in ciphertext being returned as Plain DTO.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File |
|--------|----------|-----------|-------------------|------|
| VLT-01 | `VaultTier` enum + ordering | unit | `pnpm test -- tests/vault/vault-tier.test.ts` | ❌ Wave 0 — create |
| VLT-02 | `toSyncState` mapping + reverse-absent | unit | `pnpm test -- tests/vault/vault-sync-state.test.ts` | ❌ Wave 0 — create |
| VLT-03 | `VaultEntryPlain` parse + cross-reject | unit | `pnpm test -- tests/vault/vault-entry.test.ts` | ❌ Wave 0 — create |
| VLT-04 | `VaultEntryEncrypted` wire-format regex | unit | `pnpm test -- tests/vault/vault-entry.test.ts` | ❌ Wave 0 — create |
| VLT-05 | `SyncAll*` shape + `syncAllContract` | unit | `pnpm test -- tests/vault/vault-sync-event.test.ts` | ❌ Wave 0 — create |
| VLT-06 | `PlatformBootstrapEnv` compiles type-only | type-check | `pnpm typecheck` | covered |
| VLT-07 | `AgentVaultedCredentials` alias parity | unit | `pnpm test -- tests/vault/agent-vaulted-credentials.test.ts` | ❌ Wave 0 — create |
| VLT-08 | `WorkspaceFile` parse 3-tier + null content | unit | `pnpm test -- tests/vault/workspace-file.test.ts` | ❌ Wave 0 — create |
| — | Forge contract test bulk sync | integration (mock) | `pnpm -F forge-vault-svc test sync-all.contract` | ❌ Plan 05-03 — create |

### Sampling Rate
- **Per task commit:** `pnpm test -- tests/vault/<file>.test.ts` (seconds).
- **Per wave merge:** `pnpm test` (full bridge suite, ~5s).
- **Phase gate:** Bridge full suite green + Forge vault-svc test green before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `tests/vault/` — create entire subdir (currently empty, no tests reference vault).
- [ ] `tests/vault/fixtures/` — create 9 fixtures (see Fixture Strategy).
- [ ] No new framework install needed — Vitest in place.
- [ ] Forge-side: `forge-v2/services/vault/test/routes/sync-all.contract.test.ts` — create for Plan 05-03.

---

## Security Domain (ASVS L1)

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes (documentary) | Clerk session + superadmin (D-16) — Forge concern, bridge tipizza `auth: 'none'` |
| V4 Access Control | yes | Tier cascade + ownership — Forge concern, bridge tipizza shape only |
| V5 Input Validation | yes (primary) | Zod v4 regex + literal + parse (all invariants I1-I11) |
| V6 Cryptography | yes (documentary) | AES-256-GCM — implementato Forge (`crypto.ts`), bridge valida solo wire format. No hand-rolled crypto in bridge. |
| V7 Data Protection | yes (fixture policy) | Redaction rules above — no real secrets in git. Synthetic hex for encrypted fixtures. |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Wire-format-as-plaintext leak (decrypted secret still ciphertext) | Information Disclosure | I5 refinement — Plain rejects wire format when isSecret=true |
| Tier escalation (platform entry masquerading as agent) | Elevation of Privilege | Forge concern (repo layer); bridge doesn't enforce. Document as consumer invariant. |
| Fixture commit with real ciphertext | Information Disclosure | Redaction rules (§Fixture Strategy) — synthetic hex only |
| Fixture commit with real plaintext secret | Information Disclosure | Redaction rules — `"REDACTED"` for all plaintext |
| Bridge regex too loose (`iv_hex:anything:anything`) | Tampering | Explicit lengths: `{24}:{32}:{2,}` — matches AES-256-GCM wire exactly |

### Threat model inputs for planner
1. **Attacker scenario:** a compromised consumer writes wire-format strings into a Plain DTO response, hoping UI treats as plaintext → I5 refinement catches.
2. **Operator mistake:** developer commits a real encrypted vault dump as fixture → REDACTION-NOTES.md + pre-commit review gate (manual for now, ESLint rule future).
3. **Backward compat:** if `VAULT_KEY` rotates, old ciphertext becomes undecryptable. Out of scope v1 (credential rotation deferred). Bridge schema unaffected.

---

## Dependencies on Phase 2 (Circular-import risk analysis)

### Import graph
```
src/vault/agent-vaulted-credentials.ts
    └─> imports from '../agent/agent-credentials.js'

src/agent/agent-credentials.ts
    └─> imports from 'zod' (external)
```

**No cycle.** The bridge's internal structure is DAG:
- `src/agent/*` — leaf (only depends on `zod`).
- `src/vault/*` — depends on `src/agent/agent-credentials.js` (for alias) + `zod`. No other vault→agent or vault→http edges.

**Verification command (Plan 05-02 pre-merge):**
```bash
pnpm --filter @x9-forge/contracts exec madge --circular dist/
# or
npx dpdm --no-tree --no-warning --exit-code circular:1 src/index.ts
```
(Note: madge/dpdm optional, not in current devDependencies — don't install just for this check; the file layout makes cycles impossible by inspection.)

### Re-export pattern safety
- TS alias via `export type { Foo as Bar }` + `export { FooSchema as BarSchema }` is **structural**, no runtime loop.
- Compiled output: `dist/vault/agent-vaulted-credentials.js` will `export * from '../agent/agent-credentials.js';` — standard ESM re-export, fully supported in NodeNext resolution.

### Consumer impact
- Forge `packages/types/src/vault.ts` re-exports both `AgentVaultedCredentials` (from `@x9-forge/contracts/vault`) and `AgentCredentials` (from `@x9-forge/contracts/agent`). They're the same type under two names. Pick one import path per Forge module to avoid dup imports.
- Recommended: Forge vault-svc uses `AgentVaultedCredentials`, Forge deploy machine uses `AgentCredentials` (Phase 2). Different intent = different name, same runtime.

---

## Fixture / Security Policy Summary

**File policy (enforced manually, CI pre-commit future):**
1. All files under `tests/vault/fixtures/*.json` MUST pass:
   - `grep -l '(sk-|AIza|Bearer|ghp_|pk_live|secret)' tests/vault/fixtures/` returns nothing (no obvious key patterns).
   - All `value` fields for `isSecret: true` entries are either `"REDACTED"` or match `AES_WIRE_FORMAT_REGEX` with `"_synthetic": true` sentinel.
2. `REDACTION-NOTES.md` documents every redacted field and the original source (DB query, date, operator).
3. Pre-commit review: at least one approver confirms redaction on any `tests/vault/fixtures/` diff (MANUAL v1, RLSE-03 future).

**Git history risk:** `git log --all -- tests/vault/fixtures/` must never show real secrets (if accidentally committed, purge via BFG — operator task, not GSD).

---

## Open Questions / Risks

1. **Q1: `VaultEntryPlain.createdAt` vs `updatedAt`** (⚠ CONTEXT D-08 flag)
   - CONTEXT.md says `updatedAt`, but Drizzle schema has only `createdAt` on `vault_entries`.
   - **Recommendation:** rename to `createdAt`, optional. Or drop entirely (Forge doesn't expose it in DTO).
   - **Action:** Planner to confirm with user in Plan 05-02 task 0 before writing schema.

2. **Q2: `WorkspaceFile.agentId` nullable?** (⚠ CONTEXT D-22 flag)
   - CONTEXT says `agentId: number` non-null; Drizzle says nullable.
   - **Recommendation:** use `number | null` (match DB). If Forge callers never pass null, Zod parses fine.
   - **Action:** Planner to align D-22 with DB truth in Plan 05-02 task 0.

3. **Q3: `SyncAgentResult.keys` always 0 in Forge** — minor, documentary.
   - Document JSDoc. No action needed for Phase 5.

4. **Q4: `VaultEntryPlain` without `id`?**
   - Some Forge contexts pass partial entries (e.g., `{ key, value, tier, isCustomized, ownerId, agentId }` for upsert payloads) without `id`.
   - CONTEXT D-08 implies `id` not listed. Current Forge interface has `id` (post-read). For API response DTO (primary use), `id` is present.
   - **Recommendation:** `id: z.number().int().nonnegative()` (required). For write-side payloads, Forge has its own shape (out of scope Phase 5).

5. **Q5: Should `VaultEntryEncrypted` ever appear in API responses?**
   - Short answer: NO. Forge always decrypts before sending. `VaultEntryEncrypted` is primarily the DB/wire storage type (pre-decrypt).
   - Bridge ships it anyway (VLT-04) for defensive typing — e.g., if a future endpoint exposes raw encrypted rows (credential export?), the schema is ready.
   - Document in JSDoc: "typically used for storage-layer types; API responses use `VaultEntryPlain`."

### Risks
- **R-Phase5-01 (low):** Forge has no test coverage today for `syncGlobalToAllAgents` empty-list edge (zero agents). Bridge schema accepts `synced: [], errors: []`. Plan 05-03 contract test should cover.
- **R-Phase5-02 (low):** If a future agent tier gets added (e.g., `tenant` tier), bridge enum + Forge DB default constraint `'agent'` must update atomically. Tracked as Phase 6+ concern, not Phase 5.

---

## Environment Availability

Phase 5 is code-only (Zod schemas + TS types). No new external tools needed.

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node 22 | Bridge build | ✓ | v22.x (engines) | — |
| pnpm 9+ | Bridge build | ✓ | per repo engines | — |
| Zod 4 | Schemas | ✓ | `^4.3.6` (devDep) | — |
| Vitest 3 | Tests | ✓ | `^3.0.0` | — |
| VPS SSH | Optional — real fixture capture | ✓ (user has access) | — | Synthetic fixtures sufficient |

No blockers.

---

## Sources

### Primary (HIGH confidence) — files read verbatim 2026-04-15
- `/Users/admintemp/Downloads/Claude/forge-v2/services/vault/src/lib/crypto.ts` (wire format, VAULT_KEY, AES-256-GCM)
- `/Users/admintemp/Downloads/Claude/forge-v2/services/vault/src/repositories/vault.repo.ts` (VaultTier, VaultRow, upsert)
- `/Users/admintemp/Downloads/Claude/forge-v2/services/vault/src/services/vault.service.ts` (cascade resolve, syncGlobalToAllAgents, SyncAgentResult)
- `/Users/admintemp/Downloads/Claude/forge-v2/services/vault/src/routes/vault.ts` (sync-all route, auth middleware)
- `/Users/admintemp/Downloads/Claude/forge-v2/services/workspace/src/services/workspace.service.ts:361-389` (WorkspaceFile write shape)
- `/Users/admintemp/Downloads/Claude/forge-v2/packages/db/src/schema.ts:41-70` (Drizzle vault_entries + workspace_files)
- `/Users/admintemp/Downloads/Claude/forge-v2/packages/types/src/vault.ts` (current Forge type — to be replaced)
- `/Users/admintemp/Downloads/Claude/forge-v2/packages/types/src/x9.ts` (re-export pattern reference)
- `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge/src/agent/agent-credentials.ts` (17-key source for alias)
- `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge/src/agent/agent-context-core.ts` (Zod pattern)
- `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge/src/http/endpoints/voice-register.ts` (endpoint contract pattern)
- `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge/src/memory/temporal.ts:21` (`z.string().datetime({ offset: true })` idiom)
- `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge/package.json` (sub-path export already wired)

### Secondary (documentary)
- `.planning/phases/05-vault-contracts-block-e/05-CONTEXT.md` — 23 locked decisions
- `.planning/REQUIREMENTS.md:60-69` — VLT-01..08
- `.planning/PROJECT.md:114-135` — Key Decisions + Research Mandate
- `.planning/ROADMAP.md:165-187` — Phase 5 goal + plans
- `.planning/STATE.md:82-88` — carried-forward risks

### No external (WebSearch/Context7) needed
Phase 5 is pure typing of existing Forge implementation. No library research, no version discovery. Node `crypto` AES-256-GCM is stdlib (documented in Node docs — wire format inspected via source code of Forge's `crypto.ts`).

---

## Metadata

**Confidence breakdown:**
- Decision verification: HIGH — all 23 decisions cross-checked against Forge source files (file:line cited).
- Exact shapes: HIGH — Drizzle schema + Forge TS types verbatim.
- Fixture strategy: HIGH — pattern from Phase 2 (`tests/agent/fixtures/`).
- Forge migration import lines: HIGH — pattern from Phase 1/2 (`x9.ts:35` alias style).
- Validation Architecture: HIGH — invariants directly testable via Zod.
- Open questions Q1/Q2: MEDIUM — require planner to reconcile CONTEXT vs DB truth (2 small divergences).

**Research date:** 2026-04-15
**Valid until:** 2026-05-15 (30 days — pure typing, low drift risk). If Forge `vault.service.ts` changes structure before planning completes, re-verify §Exact shapes.

---

## RESEARCH COMPLETE

**Phase:** 5 — Vault Contracts (Block E)
**Confidence:** HIGH

### Key Findings
- All 23 CONTEXT.md decisions verified against live Forge code; only 2 minor flags (Q1: `createdAt` vs `updatedAt`, Q2: `WorkspaceFile.agentId` nullability) need planner reconciliation before writing schemas.
- AES wire format regex `^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]{2,}$` confirmed from `crypto.ts:29-36` (iv=12B=24 hex, tag=16B=32 hex, lowercase via Node `toString('hex')`).
- `SyncAllResponse` shape = `{ ok: true, synced: SyncAgentResult[], errors: SyncAgentResult[] }` (+ 500 error variant). Request body is empty. Auth = Clerk superadmin (bridge tipizza `auth: 'none'`).
- Zero circular-import risk: `src/vault/agent-vaulted-credentials.ts → src/agent/agent-credentials.ts` is single-direction sibling edge.
- Critical defensive invariant (I5): `VaultEntryPlain` needs a Zod `.refine()` to reject wire-format values when `isSecret=true` — catches decrypted-but-still-ciphertext leak class (pattern-analog to Bug #15 compile-time guard).
- Fixture strategy: synthetic hex + `"REDACTED"` plaintext suffices for 05-02 unit tests; real staging SQL capture is optional and only needed for 05-03 contract test (can defer to operator, matches Phase 4 pattern).

### File Created
`/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge/.planning/phases/05-vault-contracts-block-e/05-RESEARCH.md`

### Confidence Assessment
| Area | Level | Reason |
|------|-------|--------|
| Decision verification | HIGH | Every D-01..D-23 cross-checked against Forge source file:line |
| Exact shapes | HIGH | Drizzle + TS interface verbatim, no interpretation |
| Fixture strategy | HIGH | Pattern from Phase 2 proven |
| Forge migration plan | HIGH | Pattern from Phase 1/2 (`x9.ts:35` alias) |
| Validation Architecture | HIGH | Invariants I1-I12 directly Zod-testable |

### Open Questions (for planner to resolve in Plan 05-02 task 0)
1. `VaultEntryPlain.createdAt` vs `updatedAt` — reconcile CONTEXT D-08 with Drizzle schema (no `updated_at` column on `vault_entries`).
2. `WorkspaceFile.agentId` — nullable (match Drizzle) vs non-null (CONTEXT D-22)?

### Ready for Planning
Research complete. Planner can now write plans 05-02 (bridge schemas + 31 tests) and 05-03 (Forge migration + 1 contract test) with concrete file lists, import statements, and test coverage mapping.
