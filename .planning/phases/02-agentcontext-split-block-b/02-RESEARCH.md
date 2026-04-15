# Phase 02 Research: AgentContext Split (Block B)

**Researched:** 2026-04-15
**Phase:** 02 — AgentContext Split (Block B)
**Researcher:** Claude (cross-repo source analysis)
**Confidence:** HIGH

## Current State Analysis

### Existing AgentContext Shape (X9)

The canonical `AgentContext` lives in `agent-x9/packages/types/src/agent-context.ts`:

```typescript
export interface AgentContext {
  agentId: string
  ownerId: string
  workspacePath: string        // absolute path: /data/workspaces/{agentId}
  registryPath: string         // absolute path: /data/agents/{agentId}/registry.json
  credentials: Record<string, string>  // 3-tier resolved from Forge vault
  llmConfig: {
    provider: string           // 'openai' | 'anthropic' | 'google'
    model: string
  }
  telegramBotToken: string
  telegramAllowFrom: string[]  // Telegram chat IDs allowed for this agent
  displayName: string          // Human-readable agent name for logs
}
```

There is also a Zod schema in `agent-x9/packages/types/src/agent-context.schema.ts`:

```typescript
export const AgentContextSchema = z.object({
  agentId: z.string().min(1),
  ownerId: z.string().min(1),
  workspacePath: z.string().min(1),
  registryPath: z.string().min(1),
  credentials: z.record(z.string(), z.string()),
  llmConfig: z.object({ provider: z.string(), model: z.string() }),
  telegramBotToken: z.string().min(1),
  telegramAllowFrom: z.array(z.string()),
  displayName: z.string().min(1),
})
```

### Existing AgentContext Shape (Forge)

`forge-v2/packages/types/src/x9.ts` has a local copy (explicitly marked for Phase 2 migration):

```typescript
// X9AgentContext stays local until Phase 2 (AgentContext split).
export interface X9AgentContext {
  agentId: string
  ownerId: string
  workspacePath: string
  registryPath: string
  credentials: Record<string, string>
  llmConfig: { provider: string; model: string }
  telegramBotToken: string
  telegramAllowFrom: string[]
  displayName: string
}
```

**Observation:** Both shapes are structurally identical. No divergence to resolve.

### How context.json Flows

**Writer (Forge):** `forge-v2/services/factory/src/services/deploy.machine.ts` Step 8 "write-agent-context":
1. Resolves credentials from vault (global + agent-level vault entries)
2. Injects `TELEGRAM_BOT_TOKEN` and `AGENT_EMAIL` into credentials object
3. Constructs a full `X9AgentContext` object with ALL fields (identity, paths, credentials, llmConfig, telegram, displayName)
4. Atomic write: `.tmp` then `rename()` to `context.json` (mode 0o600)

**Reader (X9):** `agent-x9/services/agent-core/src/core/agent-manager.ts`:
1. `loadAll(dataDir)` scans `/data/agents/*/context.json`
2. `load(contextPath)` reads JSON, parses with `AgentContextSchema.parse(raw)`, stores in Map
3. `reload(agentId, contextPath)` waits for idle, then re-loads

**File location on VPS:** `/data/agents/{agentId}/context.json`

### Bridge Sub-path `./agent` Status

Currently placeholder:
```typescript
// src/agent/index.ts
export {};
```

The sub-path export `@x9-forge/contracts/agent` is already declared in `package.json` exports map. Ready for Phase 2 content.

## Key Findings

### 1. AgentContext Core vs Runtime Split Analysis

**Fields that belong in `AgentContextCore` (bridge, cross-repo):**

| Field | Rationale |
|-------|-----------|
| `agentId` | Identity — both repos need it |
| `ownerId` | Identity — both repos need it |
| `credentials` | Forge writes, X9 reads — cross-repo contract |
| `llmConfig` | Forge configures, X9 reads — cross-repo contract |
| `telegramAllowFrom` | Forge configures, X9 reads — cross-repo contract |

**Fields that belong in `AgentContextRuntime` (X9-local, NOT in bridge):**

| Field | Rationale |
|-------|-----------|
| `workspacePath` | Absolute local path — X9 filesystem concern only |
| `registryPath` | Absolute local path — X9 filesystem concern only |
| `telegramBotToken` | Runtime secret consumed directly by X9 Telegram channel |
| `displayName` | Human-readable label, X9 logging concern |

**Observation on `telegramBotToken`:** This field is duplicated — it exists BOTH as a top-level field AND inside `credentials['TELEGRAM_BOT_TOKEN']`. The top-level field is the legacy shape; the credential key is the vault-resolved value. The Core schema should NOT include `telegramBotToken` as a top-level field (it lives in credentials). The Runtime extension in X9 can extract it from credentials at boot time.

**Observation on `telegramAllowFrom`:** This is in the success criteria as a Core field. This is correct — Forge's `deploy.machine.ts` builds the `telegramAllowFrom` array from operator params and writes it to context.json. It is a cross-repo configuration value.

### 2. Credential Keys Inventory

Complete inventory of credential keys found across both codebases:

**LLM Keys:**
- `OPENAI_API_KEY` — Used in agent-core, cap-netatmo, cap-briefing, cap-security, cap-news (6+ services)
- `ANTHROPIC_API_KEY` — Used in agent-core
- `GOOGLE_API_KEY` — Used in agent-core
- `AGENT_CHAT_MODEL` — LLM model override, used in deploy.machine.ts fallback

**Telegram:**
- `TELEGRAM_BOT_TOKEN` — Used in cap-briefing, cap-security, agent-core env

**Voice / ElevenLabs:**
- `ELEVENLABS_API_KEY` — Used in agent-core, cap-websocket, cap-briefing
- `ELEVENLABS_VOICE_ID` — Used in cap-briefing (default: "etz1gLgQTuQIYLCRkFJh")
- `ELEVENLABS_MINDFULNESS_AGENT_ID` — Used in cap-websocket
- `FORGE_VOICE_REGISTER_TOKEN` — Used in cap-voice for X-Internal-Token header to Forge voice-svc

**Email:**
- `AGENTMAIL_API_KEY` — Used in cap-email
- `AGENTMAIL_INBOX_ID` — Used in cap-email
- `AGENT_EMAIL` — Injected by Forge deploy.machine.ts

**Calendar:**
- `GOOGLE_CALENDAR_CLIENT_ID` — Used in cap-calendar env.ts
- `GOOGLE_CALENDAR_CLIENT_SECRET` — Used in cap-calendar env.ts

**Security / Internal:**
- `INTERNAL_SECRET` — Used in cap-security, cap-glasses, agent-core (X9-side shared secret)
- `X9_INTERNAL_SECRET` — Forge-side name for the same secret (used in factory env.ts, X9Client)

**Netatmo (capability-specific):**
- `NETATMO_CLIENT_ID`, `NETATMO_CLIENT_SECRET`, `NETATMO_ACCESS_TOKEN`, `NETATMO_REFRESH_TOKEN`, `NETATMO_HOME_ID`, `NETATMO_GATE_HOME_ID`, `NETATMO_EMAIL`, `NETATMO_PASSWORD` — All in cap-netatmo env.ts

**Total known keys: 20+ distinct keys** (exceeding the 10+ requirement in AGNT-04)

**Edge case observation:** Netatmo keys (8 keys) are capability-specific and would NOT be in the "known keys" auto-complete set — they are dynamic per-capability credential keys. They demonstrate WHY `Record<string, string>` extension is needed alongside the known-keys discriminated type.

### 3. The Discriminated Credentials Pattern (AGNT-04)

The requirement calls for "auto-complete for known keys + Record extension for dynamic keys." In TypeScript, the standard pattern is:

```typescript
type KnownCredentialKey =
  | 'OPENAI_API_KEY'
  | 'ANTHROPIC_API_KEY'
  | 'GOOGLE_API_KEY'
  | 'TELEGRAM_BOT_TOKEN'
  | 'ELEVENLABS_API_KEY'
  | 'ELEVENLABS_VOICE_ID'
  | 'FORGE_VOICE_REGISTER_TOKEN'
  | 'AGENTMAIL_API_KEY'
  | 'AGENTMAIL_INBOX_ID'
  | 'GOOGLE_CALENDAR_CLIENT_ID'
  | 'GOOGLE_CALENDAR_CLIENT_SECRET'
  | 'X9_INTERNAL_SECRET'
  | 'INTERNAL_SECRET'
  | 'AGENT_CHAT_MODEL'
  | 'AGENT_EMAIL';

type AgentCredentials = {
  [K in KnownCredentialKey]?: string;
} & Record<string, string>;
```

**Important TypeScript caveat with `exactOptionalPropertyTypes: true`:** When `exactOptionalPropertyTypes` is enabled (which this bridge uses), optional properties CANNOT be assigned `undefined`. The intersection `{ [K in KnownCredentialKey]?: string } & Record<string, string>` works because the `Record<string, string>` side makes ALL keys accessible as `string`, while the mapped type side provides autocomplete.

**Zod v4 approach:** Zod v4 has `.catchall()` on objects which allows a base set of known keys plus arbitrary additional keys:

```typescript
const AgentCredentialsSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  // ... known keys
}).catchall(z.string());
```

This gives Zod validation for known keys (optional string) plus passes through unknown keys as `string`. The inferred type provides autocomplete for known keys while allowing dynamic keys.

**Caveat with `exactOptionalPropertyTypes`:** `z.object({ key: z.string().optional() })` in Zod v4 infers `key?: string | undefined`. Under `exactOptionalPropertyTypes: true`, this means the property is optional but CANNOT be set to `undefined` explicitly. The `.catchall(z.string())` side makes `Record<string, string>` which has `string` values (not `string | undefined`). The intersection is: known keys get autocomplete but the value type is effectively `string` from the catchall. This is safe.

### 4. Branded Types for AgentId and OwnerId (AGNT-01)

Per PROJECT.md decision: "Branded types solo su IDs (AgentId, OwnerId, TenantId, SessionId, ConversationId)". Anti-feature AF-02 prevents branding everything.

Zod v4 supports `.brand<"AgentId">()`:

```typescript
const AgentIdSchema = z.string().min(1).brand<"AgentId">();
type AgentId = z.infer<typeof AgentIdSchema>;
// AgentId = string & { [z.$brand]: { AgentId: true } }
```

**Key design decision:** Brand direction should be `"out"` (default in Zod v4). This means:
- **Input** to `parse()` accepts plain `string` (no brand required)
- **Output** from `parse()` is branded `AgentId`
- Code that receives an `AgentId` from `parseAgentContext()` gets compile-time protection against swapping agentId/ownerId

This is the correct choice because Forge writes plain strings to context.json (no brands at rest), and X9 reads + parses into branded types.

**AgentIdentity type:**
```typescript
const AgentIdentitySchema = z.object({
  agentId: AgentIdSchema,
  ownerId: OwnerIdSchema,
});
type AgentIdentity = z.infer<typeof AgentIdentitySchema>;
// { agentId: AgentId; ownerId: OwnerId }
```

### 5. The `parseAgentContext` Helper (AGNT-05)

The helper must:
1. Accept `unknown` input (raw JSON)
2. Validate against `AgentContextCoreSchema`
3. Return typed `AgentContextCore` on success
4. Throw with clear error message on failure (fail-loud, not silent)

Pattern from Phase 1: all validation uses Zod `.parse()` (fail-loud) or `.safeParse()` (for tests). The helper should use `.parse()` directly since AGNT-05 says "fail-loud".

```typescript
export function parseAgentContext(json: unknown): AgentContextCore {
  return AgentContextCoreSchema.parse(json);
}
```

**X9 loader migration path:** `agent-manager.ts` currently does:
```typescript
const ctx = AgentContextSchema.parse(raw)  // validates full AgentContext (Core + Runtime)
```

After migration, it would:
```typescript
const core = parseAgentContext(raw);  // validates Core fields
const runtime: AgentContextRuntime = {
  ...core,
  workspacePath: /* derived from agentId */,
  registryPath: /* derived from agentId */,
  telegramBotToken: core.credentials['TELEGRAM_BOT_TOKEN'] ?? '',
  displayName: /* from raw or default */,
};
```

**Critical finding:** The current context.json INCLUDES Runtime fields (`workspacePath`, `registryPath`, `telegramBotToken`, `displayName`) because Forge writes them. The `parseAgentContext` validator must use `.passthrough()` or `.strip()` strategy:
- `.passthrough()` — allows extra fields, passes them through (needed for backward compat)
- `.strip()` — silently removes extra fields (cleaner but loses data)

**Recommendation:** Use `.passthrough()` in the Core schema so existing context.json files with Runtime fields still parse successfully. X9's loader can then pick up both Core and extra fields.

### 6. Forge-side Impact (deploy.machine.ts)

Forge currently writes the FULL `X9AgentContext` shape to context.json. After Phase 2:
- Forge should ideally write only `AgentContextCore` fields to context.json
- But this is a BREAKING CHANGE for existing X9 instances that expect `workspacePath`, `registryPath`, etc.

**Migration strategy (zero breaking runtime):**
1. Phase 02-02 (Bridge): Define `AgentContextCore` schema with `.passthrough()` — existing context.json files parse fine
2. Phase 02-03 (X9 migration): X9's `agent-manager.ts` loader derives Runtime fields from Core + conventions:
   - `workspacePath = /data/workspaces/{agentId}`
   - `registryPath = /data/agents/{agentId}/registry.json`
   - `telegramBotToken = credentials['TELEGRAM_BOT_TOKEN'] ?? ''`
   - `displayName = raw.displayName ?? agentId` (read from raw JSON, not Core)
3. Forge deploy.machine.ts CONTINUES writing the full shape (backward compat). The extra fields are harmless (passthrough). A future phase can trim them.

**This is the safest path: X9 changes how it reads, Forge does NOT change what it writes.**

## Technical Approach

### Schema Architecture

```
Bridge (src/agent/):
  AgentIdSchema         = z.string().min(1).brand<"AgentId">()
  OwnerIdSchema         = z.string().min(1).brand<"OwnerId">()
  AgentIdentitySchema   = z.object({ agentId, ownerId })
  KnownCredentialKeySchema = z.enum([...15 keys])
  AgentCredentialsSchema = z.object({ ...known optional }).catchall(z.string())
  LlmConfigSchema       = z.object({ provider: z.string(), model: z.string() })
  AgentContextCoreSchema = z.object({
    agentId: AgentIdSchema,
    ownerId: OwnerIdSchema,
    credentials: AgentCredentialsSchema,
    llmConfig: LlmConfigSchema,
    telegramAllowFrom: z.array(z.string()),
  }).passthrough()  // <-- allows Runtime fields to survive parsing

  parseAgentContext(json: unknown): AgentContextCore

X9 (NOT in bridge):
  AgentContextRuntime = AgentContextCore & {
    workspacePath: string;
    registryPath: string;
    telegramBotToken: string;
    displayName: string;
  }
```

### File Organization

Following the Phase 1 pattern (one file per concern + barrel index):

```
src/agent/
  index.ts                  — barrel exports
  agent-identity.ts         — AgentId, OwnerId branded types, AgentIdentity
  agent-credentials.ts      — KnownCredentialKey, AgentCredentials, schema
  agent-context-core.ts     — AgentContextCore, LlmConfig, schema
  parse-agent-context.ts    — parseAgentContext helper
```

### Test Organization

Following Phase 1 pattern:

```
tests/agent/
  agent-identity.test.ts    — branded type validation, swap prevention
  agent-credentials.test.ts — known keys autocomplete, dynamic keys, edge cases
  agent-context-core.test.ts — schema validation, passthrough behavior
  parse-agent-context.test.ts — real fixture parsing, error cases
```

### Compat Shim Strategy

**X9 `packages/types/src/agent-context.ts`:** Replace local interface with:
```typescript
export type { AgentContextCore as AgentContext } from '@x9-forge/contracts/agent';
// Re-export for backward compat — existing code uses AgentContext name
```

Wait — this is NOT straightforward. Existing X9 code uses `AgentContext` which has ALL fields (Core + Runtime). The compat shim must export `AgentContextRuntime` as `AgentContext` to avoid breaking all X9 service code.

**Revised approach:**
1. `packages/types/src/agent-context.ts` keeps exporting `AgentContext` but redefines it as `AgentContextRuntime` (which extends `AgentContextCore`)
2. `agent-context.schema.ts` re-exports `AgentContextCoreSchema` from bridge (renamed as needed)
3. `agent-manager.ts` imports `parseAgentContext` from bridge + builds `AgentContextRuntime` locally

**Forge `packages/types/src/x9.ts`:** Replace `X9AgentContext` with:
```typescript
export type { AgentContextCore as X9AgentContext } from '@x9-forge/contracts/agent';
```

This is clean because Forge only needs Core fields (it writes context.json, doesn't need Runtime fields).

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| `exactOptionalPropertyTypes` interaction with `AgentCredentials` intersection type | MEDIUM | Test thoroughly with Zod `.catchall()` + optional known keys. Verify `credentials['OPENAI_API_KEY']` access pattern compiles. |
| Branded types break existing X9 code that passes plain strings as agentId | LOW | Brand direction is `"out"` (default) — `parse()` accepts plain string input, output is branded. Existing code that constructs AgentContext from env vars will need `as AgentId` cast OR use the parser. |
| `.passthrough()` leaks unexpected fields into typed output | LOW | TypeScript type still only shows Core fields — extra fields are present at runtime but not accessible via type system. This is the intended behavior for backward compat. |
| X9 `agent-manager.ts` loads context.json → expects full AgentContext → Core schema is subset | LOW | The loader will be updated in 02-03 to parse Core + extend to Runtime. The `.passthrough()` ensures no parse failures. |
| Production context.json files may have unexpected shapes | MEDIUM | Plan 02-01 (research-phase) inventories VPS context.json files to detect edge cases before any code changes. |
| `telegramBotToken` duplication (top-level vs credentials) | LOW | Core schema does NOT include `telegramBotToken` as top-level field. X9 Runtime extracts it from `credentials['TELEGRAM_BOT_TOKEN']`. Legacy top-level field passes through harmlessly. |
| Forge `deploy.machine.ts` constructs full context — not just Core | NONE | Forge continues writing full shape. No Forge code changes needed in Phase 2. Future cleanup is optional. |

## Validation Architecture

### Success Criterion 1: AgentContextCore has agentId, ownerId, credentials, llmConfig, telegramAllowFrom

**Validation method:** Unit test in bridge
- Schema shape test: `AgentContextCoreSchema` accepts a fixture with exactly these fields
- Type-level assertion: `AgentContextCore` type has these fields with correct types
- Negative test: missing `agentId` or `ownerId` is rejected
- `agentId` and `ownerId` are branded types (`AgentId`, `OwnerId`)

### Success Criterion 2: AgentContextRuntime extends Core with workspacePath, registryPath, telegramBotToken, displayName — NOT in bridge

**Validation method:** Grep + typecheck
- `grep -r "workspacePath\|registryPath\|telegramBotToken\|displayName" src/agent/` returns zero matches (bridge has NO Runtime fields)
- X9 defines `AgentContextRuntime` locally with these 4 fields extending `AgentContextCore`
- X9 typecheck green: all services that use `AgentContext` continue to compile

### Success Criterion 3: AgentCredentials has auto-complete for 10+ known keys + Record extension

**Validation method:** Unit test in bridge
- Test that `AgentCredentialsSchema` parses a fixture with known keys (`OPENAI_API_KEY`, etc.)
- Test that unknown keys (`CUSTOM_CAP_KEY`) are accepted (Record extension)
- Test that known keys have `string` value type (not rejected)
- Count known keys in `KnownCredentialKey`: verify >= 10 (actual: 15)
- Type-level test: verify autocomplete works (IDE-level, documented in test comments)

### Success Criterion 4: parseAgentContext(json) validates real staging context.json

**Validation method:** Fixture test in bridge
- Construct a fixture that mirrors a REAL production context.json (all fields, including Runtime fields)
- `parseAgentContext(fixture)` succeeds (no throw)
- Returned object has branded `agentId` and `ownerId`
- Returned object has `credentials` with typed known keys
- Plan 02-01 captures real context.json shapes from VPS for fixture accuracy

### Success Criterion 5: X9 runtime boots with context.json format Core (via loader extending to Runtime)

**Validation method:** X9 integration test (Plan 02-03)
- X9 `agent-manager.ts` uses `parseAgentContext()` from bridge
- Loader derives Runtime fields: `workspacePath`, `registryPath`, `telegramBotToken`, `displayName`
- X9 typecheck green
- X9 test suite green (all existing tests pass)
- Manual smoke test: agent boots and responds to Telegram message

### Success Criterion 6: All production context.json files remain compatible

**Validation method:** Plan 02-01 inventory + parse test
- SSH into VPS, `find /data/agents -name context.json` — list all files
- Extract unique shapes (field names + types)
- Detect edge cases: missing fields, unexpected fields, empty credentials, etc.
- Feed each unique shape into `parseAgentContext()` test fixture
- All must parse without error

## Dependencies & Blockers

### From Phase 1 (SATISFIED)

- Bridge `src/capability/` pattern established (Zod schema + type + barrel export + tests) -- DONE
- Sub-path exports working (`@x9-forge/contracts/capability`) -- DONE
- X9 compat shim pattern validated (re-export from bridge) -- DONE
- Forge compat shim pattern validated (`x9.ts` re-exports with alias) -- DONE

### External Dependencies

- **VPS SSH access** (Plan 02-01): Stefano must provide or execute the context.json inventory. The planner should ask whether Stefano can run a `find + cat` command on VPS, or whether this should be a self-service script.
- **No npm publish needed**: Bridge consumed via `git+https://...#SHA`; SHA bump after Phase 2 bridge commits.

### Phase Ordering

- Phase 2 is independent of Phase 3 (auth) and Phase 4 (HTTP endpoints)
- Phase 5 (Vault) depends on Phase 2 because `AgentVaultedCredentials` categorizes the same keys inventoried here
- Plan 02-02 (bridge code) must complete before 02-03 (X9 migration)
- Plan 02-01 (research/inventory) should ideally complete before 02-02 to inform fixture design, but is not a hard blocker if production shapes are well-understood

## Open Questions

### Q1: Should `telegramAllowFrom` stay in Core or move to Runtime?

The success criteria explicitly place `telegramAllowFrom` in Core. This is correct because Forge computes it and writes it to context.json. However, it is only consumed by X9's Telegram channel. Consider whether this is a cross-repo CONTRACT (Forge guarantees to provide it) or an X9 implementation detail. **Recommendation: keep in Core per success criteria.**

### Q2: What to do about `telegramBotToken` duplication?

Currently `telegramBotToken` exists BOTH as a top-level field AND inside `credentials['TELEGRAM_BOT_TOKEN']`. The Core schema should NOT have it as top-level (it is a credential). X9 Runtime should extract it from credentials. But existing context.json files have it top-level. **Recommendation: `.passthrough()` handles this — the top-level field passes through parsing, X9 reads it from credentials in the Runtime loader.**

### Q3: How aggressive should the branded types be?

Options:
- **A (minimal):** Brand only `AgentId` and `OwnerId` (per AGNT-01)
- **B (moderate):** Also brand `TenantId`, `SessionId`, `ConversationId` (per PROJECT.md decision)
- **C (aggressive):** Brand all IDs in the bridge (anti-feature AF-02)

**Recommendation: Option A for Phase 2 scope.** Only `AgentId` and `OwnerId` are used in `AgentIdentity` and `AgentContextCore`. Other branded IDs can be added in later phases when their containing schemas are defined (e.g., `SessionId` in HTTP endpoint contracts Phase 4).

### Q4: Should `parseAgentContext` also return the passthrough fields?

If we use `.passthrough()`, the Zod output includes extra fields at runtime but TypeScript type only shows Core fields. X9's loader needs to access `displayName` and `telegramBotToken` from the raw JSON. Options:
- **A:** `parseAgentContext` returns `AgentContextCore` (typed). X9 reads extra fields from the raw JSON separately.
- **B:** `parseAgentContext` returns `AgentContextCore` but the raw parsed output is accessible via a second parameter or overload.
- **C:** Bridge exports a `parseAgentContextRaw` that returns the full passthrough result.

**Recommendation: Option A.** Keep the bridge helper simple and typed. X9's loader reads raw JSON once (`JSON.parse()`), validates Core with `parseAgentContext()`, then constructs Runtime from both the validated Core and the raw object for extra fields. This is 3 lines of code in the loader.

### Q5: Forge deploy.machine.ts — change now or later?

Forge currently writes the full shape (Core + Runtime fields) to context.json. Options:
- **Now:** Trim Forge output to Core-only fields. Requires updating the context.json writer AND ensuring X9 derives Runtime fields.
- **Later:** Leave Forge unchanged. X9 reads Core fields via parser, derives Runtime from conventions.

**Recommendation: Later (not in Phase 2).** Changing Forge's output is riskier and not required by the success criteria. The goal is zero breaking runtime. Forge continues writing what it writes; X9 changes how it reads.

---

## RESEARCH COMPLETE
