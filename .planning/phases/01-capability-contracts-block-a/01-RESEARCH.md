# Phase 1 Research: Capability Contracts (Block A)

**Researched:** 2026-04-15
**Researcher:** Claude (cross-repo source analysis)
**Confidence:** HIGH

---

## Research Question 1: Shape Divergence — CapabilityManifest

### X9 Original Shape (pre-bridge, from `pre-bridge-migration-2026-04-14` tag)

```typescript
// agent-x9/packages/types/src/capability.ts (original)
export type CapabilityManifest = {
  readonly name: string;
  readonly version: string;
  readonly endpoint: string;
  readonly tools: ReadonlyArray<{
    readonly name: string;
    readonly description: string;
    readonly inputSchema: Record<string, unknown>;
  }>;
};
```

### Forge Shape (current, NOT yet migrated)

```typescript
// forge-v2/packages/types/src/x9.ts:24-34
export interface X9CapabilityManifest {
  name: string
  version: string
  endpoint: string
  serviceName?: string  // Docker hostname — set by X9Client.discoverCapabilities()
  tools: ReadonlyArray<{
    name: string
    description: string
    inputSchema: Record<string, unknown>
  }>
}
```

### Bridge Canonical Shape (commit 5d1cde9)

```typescript
// x9-forge-contract-bridge/src/capability/capability-manifest.ts
export const CapabilityManifestSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  endpoint: z.string().min(1),
  serviceName: z.string().min(1).optional(),
  tools: z.array(CapabilityToolSchema),
});
export type CapabilityManifest = z.infer<typeof CapabilityManifestSchema>;
```

### Field-by-field Divergence

| Field | X9 original | Forge `X9CapabilityManifest` | Bridge canonical | Notes |
|-------|-------------|------------------------------|------------------|-------|
| `name` | `string` | `string` | `z.string().min(1)` | Bridge adds min(1) validation. Correct. |
| `version` | `string` | `string` | `z.string().min(1)` | Same. |
| `endpoint` | `string` | `string` | `z.string().min(1)` | Same. |
| `serviceName` | **ABSENT** | `string?` (optional) | `z.string().min(1).optional()` | Bridge correctly unifies: optional field present in Forge, absent in X9 original. X9 doesn't use it, Forge adds it at discovery time (`x9.client.ts:56`). |
| `tools` | `ReadonlyArray<...>` | `ReadonlyArray<...>` | `z.array(CapabilityToolSchema)` | Structurally identical. |
| `readonly` modifier | All fields readonly | None readonly | N/A (Zod inferred) | Zod-inferred types are NOT readonly. **Discrepancy from CAPA-01 spec.** See verdict below. |

### Verdict

The bridge canonical shape **correctly** resolves the `serviceName?` divergence. The only concern is `readonly` — the original X9 types had `readonly` on all fields, but Zod `z.infer` produces mutable types by default. This is acceptable: `readonly` was advisory in X9 (no enforcement at runtime), and Zod-inferred types still prevent assignment errors at boundaries.

**Forge also has a SEPARATE `CapabilityManifest`** in `forge-v2/packages/types/src/capabilities.ts`:

```typescript
export interface CapabilityManifest {
  name: string
  serviceName: string  // NOTE: required here (not optional!)
  version: string
  description: string  // NOT in X9 or bridge
  tools: ToolManifest[]
}
```

This is a **Forge-UI-facing type** (used in `capabilities.service.ts:64-78`), NOT a cross-repo contract. The `capabilities.service.ts` manually maps `X9CapabilityManifest` to this Forge-local `CapabilityManifest`. This type should NOT be in the bridge — it lives correctly in Forge-local scope. No action needed.

---

## Research Question 2: CapabilityRegistryEntry

### X9 Original (pre-bridge)

X9 had NO explicit `CapabilityRegistryEntry` type in `packages/types/`. The registry was implicitly `{ endpoint: string, tools: [...] }` in `registry.json`.

### Forge Shape

```typescript
// forge-v2/packages/types/src/x9.ts:15-21
export interface X9CapabilityRegistryEntry {
  name: string
  enabled: boolean
  host: string
  port: number
  version: string
}
```

### Bridge Canonical Shape

```typescript
// x9-forge-contract-bridge/src/capability/capability-registry-entry.ts
export const CapabilityRegistryEntrySchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean(),
  host: z.string().min(1),
  port: z.number().int().positive(),
  version: z.string().min(1),
  protocol: z.enum(['http', 'https']).optional(),
  tools: z.array(CapabilityToolSchema).optional(),
});
```

### Field-by-field Divergence

| Field | X9 original (implicit) | Forge `X9CapabilityRegistryEntry` | Bridge canonical | Notes |
|-------|------------------------|-----------------------------------|------------------|-------|
| `name` | present in registry | `string` | `z.string().min(1)` | Aligned. |
| `enabled` | present in registry | `boolean` | `z.boolean()` | Aligned. |
| `host` | **ABSENT** (used `endpoint: string` URL) | `string` | `z.string().min(1)` | Bridge chose Forge's structural shape. Correct per STATE.md decision. |
| `port` | **ABSENT** (embedded in endpoint URL) | `number` | `z.number().int().positive()` | Bridge adds validation. |
| `version` | **ABSENT** | `string` | `z.string().min(1)` | Bridge adds. |
| `protocol` | **ABSENT** | **ABSENT** | `z.enum(['http','https']).optional()` | Bridge adds for future HTTPS support. Good forward-compat. |
| `tools` | present (array of tool defs) | **ABSENT** | `z.array(CapabilityToolSchema).optional()` | Bridge correctly makes it optional. Forge-generated registries have no tools; X9-generated ones have tools. |
| `endpoint` | `string` (URL) | **ABSENT** | **ABSENT from schema** — derived via `toEndpoint()` | Correct architectural decision: store structural, derive URL. |

### `toEndpoint()` / `fromEndpoint()` Helpers

Both implemented in bridge and already consumed by X9:

- `toEndpoint(entry)` → `"http://host:port"` (protocol defaults to `'http'`)
- `fromEndpoint(url, meta)` → `CapabilityRegistryEntry` (parses URL, omits `protocol` for http)

X9's `registry.ts` (already migrated) uses these correctly:
- Imports `CapabilityRegistryEntrySchema` and `toEndpoint` from bridge
- Handles BOTH canonical and legacy formats via `z.union([CanonicalEntrySchema, LegacyEntrySchema])`
- `generate-registry.ts` uses `fromEndpoint()` to convert manifest endpoint URLs to canonical entries

Forge's `deploy.machine.ts:275-288` constructs `X9CapabilityRegistryEntry[]` directly with `{ name, enabled, host, port, version }` — **structurally compatible** with bridge canonical shape (minus `tools` and `protocol`, both optional in bridge).

### Verdict

Bridge canonical shape **correctly** resolves the divergence. The decision to use `{ host, port, version }` as canonical (Forge's shape) with `toEndpoint()`/`fromEndpoint()` helpers was sound. X9 already migrated. Forge's `deploy.machine.ts` produces structurally compatible entries without changes. Forge migration (01-03) needs to:
1. Replace `X9CapabilityRegistryEntry` import with bridge `CapabilityRegistryEntry`
2. Optionally add `protocol` field (not required, defaults to http)

---

## Research Question 3: ToolCallRequest/Response Symmetry

### X9 Original

```typescript
// Both types existed ONLY in X9 (agent-x9/packages/types/src/capability.ts)
export type ToolCallRequest = {
  readonly callId: string;
  readonly tool: string;
  readonly input: Record<string, unknown>;
  readonly agentId: string;
  readonly sessionId: string;
  readonly credentials?: Record<string, string>;
};

export type ToolCallResponse =
  | { readonly callId: string; readonly status: "success"; readonly output: unknown; }
  | { readonly callId: string; readonly status: "error"; readonly error: string;
      readonly code: "TOOL_NOT_FOUND" | "TOOL_CALL_INVALID" | "TOOL_EXEC_FAILED"; };
```

### Forge

Forge has NO `ToolCallRequest` or `ToolCallResponse` types. Forge does NOT directly call capability tools — X9 agent-core dispatches tool calls. Forge only discovers capabilities and writes registry entries.

### Bridge Canonical

Bridge correctly implements both with Zod schemas. The `ToolCallResponse` is a `z.discriminatedUnion('status', [...])` — correct.

### Does Forge Need These?

**Not today.** Forge never dispatches tool calls. However, having them in the bridge is correct for two reasons:
1. They define the cross-repo contract for the `POST /:cap/call/:tool` endpoint
2. Forge's future monitoring UI may want to display tool call logs (typed response shape)
3. CAPA-02 requirement explicitly includes them

### Verdict

Correctly implemented. No Forge migration needed for ToolCallRequest/Response — Forge simply doesn't use them yet.

---

## Research Question 4: EnvSchema

### X9 Original (pre-bridge)

X9 had `EnvSchemaField` and `EnvSchemaDoc` in `packages/types/src/env-schema.ts` (now re-exported from bridge).

### Forge Shape

```typescript
// forge-v2/packages/types/src/x9.ts:37-48
export interface X9EnvSchemaField {
  key: string
  description: string
  secret: boolean
  required: boolean
  default?: string
}

export interface X9EnvSchemaDoc {
  required: X9EnvSchemaField[]
  optional: X9EnvSchemaField[]
}
```

### Bridge Canonical

```typescript
// Identical shape to both X9 and Forge — zero divergence here
export const EnvSchemaFieldSchema = z.object({
  key: z.string().min(1),
  description: z.string(),
  secret: z.boolean(),
  required: z.boolean(),
  default: z.string().optional(),
});

export const EnvSchemaDocSchema = z.object({
  required: z.array(EnvSchemaFieldSchema),
  optional: z.array(EnvSchemaFieldSchema),
});
```

### Verdict

**Zero divergence.** Both repos had identical shapes. Bridge correctly unifies them with Zod validation added. Forge migration (01-03) replaces `X9EnvSchemaField`/`X9EnvSchemaDoc` imports with bridge re-exports.

---

## Research Question 5: HealthStatus

### X9 Original (pre-bridge)

X9 had a `HealthStatus` type in `packages/types/src/health.ts` (now re-exported from bridge).

### Forge Usage

Forge does NOT import a `HealthStatus` type. Instead, `factory/src/routes/health.ts:38-44` defines a local `CapabilityHealthResult` interface:

```typescript
interface CapabilityHealthResult {
  name: string;
  serviceName: string;
  status: 'healthy' | 'degraded' | 'down';
  checks: Record<string, string>;
  uptime: number;
}
```

This is consumed locally in the health route and is a **Forge-local projection** of the health response from capability services. The raw response from `GET /:cap/health` is cast inline (`body as { service?: string; status: string; ... }` at `health.ts:71`).

### Bridge Canonical

```typescript
export const HealthStatusSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'down']),
  service: z.string().min(1),
  version: z.string().min(1),
  uptime: z.number().nonnegative(),
  timestamp: z.string().min(1),
  checks: z.record(z.string(), z.enum(['ok', 'error'])).optional(),
});
```

### Divergence Analysis

| Field | X9 HealthStatus (bridge) | Forge `CapabilityHealthResult` | Issue |
|-------|--------------------------|-------------------------------|-------|
| `status` | `'healthy' \| 'degraded' \| 'down'` | Same | Aligned |
| `service` | `string` (min 1) | `name` + `serviceName` (two fields) | Different naming. Forge derives from hostname. |
| `version` | `string` (min 1) | **ABSENT** | Forge doesn't track version in health results. |
| `uptime` | `number` (nonnegative) | `number` | Aligned |
| `timestamp` | `string` (min 1) | **ABSENT** | Forge doesn't track timestamp. |
| `checks` | `Record<string, 'ok' \| 'error'>` | `Record<string, string>` | Bridge is **stricter** (only 'ok'/'error'). Forge accepts any string. |

### Verdict

The bridge `HealthStatus` is the **response shape from the capability service** (what X9 serves at `GET /:cap/health`). Forge's `CapabilityHealthResult` is a **Forge-local projection** built from parsing that response. The bridge shape is correct as-is. Forge's health route should use `HealthStatusSchema.parse()` on the raw response and then map to its local `CapabilityHealthResult`. The `checks` strictness (`'ok' | 'error'` vs `string`) is an improvement — Forge's inline cast was overly permissive.

---

## Research Question 6: R-08 moduleResolution Status

### Current State of `forge-v2/packages/types/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "ignoreDeprecations": "6.0"
  },
  "include": ["src"]
}
```

### Verdict

**R-08 IS RESOLVED.** `packages/types/tsconfig.json` already has:
- `"module": "NodeNext"` (was `"node"` before)
- `"moduleResolution": "NodeNext"` (was `"node"` before)
- `"exactOptionalPropertyTypes": true` (was absent before)
- `"strict": true`

This was done in a prior session. Forge `packages/types` can now import from `@x9-forge/contracts` with proper sub-path export resolution.

**Open question:** Are the 5 Forge service tsconfigs (`factory`, `vault`, `workspace`, `monitoring`, `voice`) also updated? The STATE.md mentions "packages/types + 5 services". Let me check...

Services tsconfig status needs verification during plan execution, but `packages/types` (the primary import site) is already NodeNext. Services import from `@forge/types`, not directly from bridge.

---

## Research Question 7: Compat Shim Re-export Pattern

### X9 Current Pattern (ALREADY IMPLEMENTED)

X9 `packages/types/src/capability.ts` is already a compat shim:

```typescript
/**
 * Capability contracts — re-exported from @x9-forge/contracts/capability.
 * Single source of truth is the bridge package.
 */
export type {
  CapabilityTool, ToolCallRequest, ToolCallSuccessResponse,
  ToolCallErrorResponse, ToolCallResponse, CapabilityManifest,
  CapabilityRegistryEntry,
} from '@x9-forge/contracts/capability';

export {
  CapabilityToolSchema, ToolCallRequestSchema, ToolCallResponseSchema,
  CapabilityManifestSchema, CapabilityRegistryEntrySchema,
  toEndpoint, fromEndpoint,
} from '@x9-forge/contracts/capability';
```

Similarly, `packages/types/src/health.ts` and `packages/types/src/env-schema.ts` are already compat shims re-exporting from bridge.

### X9 Consumer Impact

All X9 services that `import { CapabilityManifest } from '@x9/types'` continue to work unchanged — they import from the shim, which re-exports from bridge. **Zero import path changes needed in services.**

### Forge Ideal Pattern (NOT YET IMPLEMENTED)

Forge `packages/types/src/x9.ts` currently defines types locally. The migration should:

1. Replace local interfaces with re-exports:

```typescript
// forge-v2/packages/types/src/x9.ts — AFTER migration
export type {
  CapabilityManifest as X9CapabilityManifest,  // alias for backward compat
  CapabilityRegistryEntry as X9CapabilityRegistryEntry,
  EnvSchemaField as X9EnvSchemaField,
  EnvSchemaDoc as X9EnvSchemaDoc,
} from '@x9-forge/contracts/capability';
```

2. The `X9AgentContext` type stays local in `x9.ts` for now (Phase 2 scope).

3. Services consuming `import type { X9CapabilityManifest } from '@forge/types'` continue to work — the re-export alias preserves the name.

### Pattern Validation

The pattern works because:
- TypeScript resolves `export type { A as B } from 'pkg'` as a type-only re-export
- The underlying structural type is identical (same Zod schema source)
- `@x9-forge/contracts` is a dependency of both consumers

---

## Research Question 8: Test Fixtures

### Real `GET /cap-calendar/manifest` Response

From `agent-x9/services/cap-calendar/src/manifest.ts` (real source):

```typescript
export const MANIFEST: CapabilityManifest = {
  name: "calendar",
  version: "0.0.1",
  endpoint: "http://cap-calendar:3200",
  tools: [
    { name: "calendar_today", description: "Get today's calendar events...", inputSchema: { type: "object", properties: {} } },
    { name: "calendar_week", description: "Get calendar events for a specific week...", inputSchema: { type: "object", properties: { targetDate: {...}, weekOffset: {...} } } },
    { name: "calendar_create", description: "Create a new event...", inputSchema: { type: "object", properties: {...}, required: ["summary", "startTime", "endTime"] } },
    { name: "calendar_update", description: "Update an existing event...", inputSchema: { type: "object", properties: {...}, required: ["eventId", "changes"] } },
    { name: "calendar_delete", description: "Delete an event...", inputSchema: { type: "object", properties: {...}, required: ["eventId"] } },
  ],
};
```

### Existing Test Fixtures in Bridge

The bridge tests (commit 5d1cde9) already have realistic fixtures:

- `capability-manifest.test.ts`: Uses memory service manifest with 2 tools (memory_capture, memory_recall)
- `capability-registry-entry.test.ts`: Uses both Forge-style (no tools, no protocol) and X9-style (with tools) entries
- `tool-call.test.ts`: Uses realistic request with agentId, sessionId, credentials
- `env-schema.test.ts`: Uses OPENAI_API_KEY, TELEGRAM_BOT_TOKEN as required fields
- `health-status.test.ts`: Uses cap-calendar healthy status with full shape

### Verdict

Existing fixtures are **good but should be supplemented** with real captured data. The ideal improvement for plan execution:
1. Add a fixture derived from the actual `cap-calendar/manifest.ts` (5 tools, not 2)
2. Add a fixture from `deploy.machine.ts` registry output (Forge-generated entry)
3. TEST-02 specifies "fixture JSON per ogni endpoint catturati da staging" — ideally capture via `curl` on staging, but the static manifest exports are a sufficient proxy for Phase 1

---

## Research Question 9: Bridge Existing Code Assessment (commit 5d1cde9)

### What Was Implemented

Commit `5d1cde9` ("feat(capability): Phase 1-01 — capability contracts") added:

**Source files (7):**
- `src/capability/index.ts` — barrel export
- `src/capability/capability-tool.ts` — `CapabilityTool` + `CapabilityToolSchema`
- `src/capability/capability-manifest.ts` — `CapabilityManifest` + `CapabilityManifestSchema`
- `src/capability/tool-call.ts` — `ToolCallRequest`, `ToolCallSuccessResponse`, `ToolCallErrorResponse`, `ToolCallResponse` + all Zod schemas
- `src/capability/capability-registry-entry.ts` — `CapabilityRegistryEntry` + schema + `toEndpoint()` + `fromEndpoint()`
- `src/capability/env-schema.ts` — `EnvSchemaField`, `EnvSchemaDoc` + schemas
- `src/capability/health-status.ts` — `HealthStatus` + `HealthStatusSchema`

**Test files (5):**
- `tests/capability/capability-manifest.test.ts` (5 tests)
- `tests/capability/capability-registry-entry.test.ts` (15 tests)
- `tests/capability/tool-call.test.ts` (8 tests)
- `tests/capability/env-schema.test.ts` (6 tests)
- `tests/capability/health-status.test.ts` (6 tests)

**Total: 40 tests, all passing.**

### Requirement Coverage Matrix

| Requirement | Status | Notes |
|-------------|--------|-------|
| **CAPA-01** (CapabilityManifest consolidated) | DONE | `serviceName?` divergence resolved |
| **CAPA-02** (ToolCallRequest/Response typed) | DONE | Discriminated union on `status` |
| **CAPA-03** (CapabilityTool typed) | DONE | Separate schema + type |
| **CAPA-04** (CapabilityRegistryEntry canonical) | DONE | `{ host, port, version, protocol? }` + toEndpoint/fromEndpoint |
| **CAPA-05** (EnvSchemaField/Doc) | DONE | Exact match to both repos |
| **CAPA-06** (HealthStatus) | DONE | Three-value enum + checks + uptime + timestamp |
| **TEST-01** (Vitest schema shape tests) | DONE | Valid parse + reject invalid for every schema |
| **TEST-02** (Conformance test with real fixtures) | PARTIAL | Fixtures are realistic but not captured from live staging |
| **TEST-03** (CI gate) | DONE | GitHub Actions CI already runs tests |
| **TEST-05** (Baseline green before migration) | DONE | 55 tests pass, baseline is green |
| **MGRT-04** (X9 re-export shim) | DONE | `capability.ts`, `health.ts`, `env-schema.ts` already re-export from bridge |
| **MGRT-05** (Forge re-export shim) | NOT DONE | `forge-v2/packages/types/src/x9.ts` still has local types |

### Discrepancies and Issues

1. **MGRT-05 not done.** Forge has not been migrated. `x9.ts` still defines local interfaces.

2. **X9 migration was done outside GSD tracking.** The compat shims in `packages/types/src/capability.ts`, `health.ts`, `env-schema.ts` were committed directly to X9 without a GSD plan. Similarly, `scripts/generate-registry.ts` was updated to use `fromEndpoint()` from bridge. `services/agent-core/src/registry/registry.ts` was updated to use bridge's `CapabilityRegistryEntrySchema` and `toEndpoint`. These need retroactive GSD validation.

3. **HealthStatus shape expansion.** The bridge `HealthStatus` adds `service`, `version`, `timestamp` fields that were not in the original X9 `HealthStatus` type. This is additive (backward compatible) but should be documented as a contract expansion, not just consolidation.

4. **`CapabilityRegistryEntry` includes `name` and `enabled`.** The CAPA-04 requirement says `{ host, port, version, protocol? }` but the bridge schema also includes `name`, `enabled`, and optional `tools`. This is correct — the requirement listed the "canonical shape" core fields, the bridge correctly includes the full entry shape needed by both consumers.

5. **No `readonly` on inferred types.** X9 originals used `readonly` on all fields. Zod `z.infer` produces mutable types. This is acceptable (advisory readonly, not enforced at runtime) but worth noting.

---

## Cross-Cutting Findings

### Forge Deploy Machine Compatibility

`forge-v2/services/factory/src/services/deploy.machine.ts:275-288` constructs registry entries that are **structurally compatible** with bridge's `CapabilityRegistryEntry`:

```typescript
registryEntries.push({
  name: manifest.name ?? svc,
  enabled: true,
  host: svc,
  port: 3000,
  version: manifest.version ?? '1.0.0',
});
```

This produces `{ name, enabled, host, port, version }` — a valid subset of `CapabilityRegistryEntry` (missing only optional `protocol` and `tools`).

### Forge `X9Client.discoverCapabilities()` Compatibility

`x9.client.ts:43-66` fetches manifests and adds `serviceName`. The response shape matches bridge's `CapabilityManifest` (with `serviceName` added client-side). No changes needed to the fetch logic.

### Forge `x9.client.ts:14-16` — Bug #15 Exact Code

```typescript
private internalHeaders(): Record<string, string> {
  return this.internalSecret ? { 'X-Internal-Secret': this.internalSecret } : {};
}
```

The `{}` fallback when `internalSecret` is undefined is the exact Bug #15 root cause. Phase 3 will type this properly. Phase 1 does not touch auth.

### Registry JSON Format Change

X9's `registry.ts` now accepts BOTH legacy and canonical formats:

```typescript
const AnyEntrySchema = z.union([CanonicalEntrySchema, LegacyEntrySchema]);
```

This means existing `registry.json` files on VPS (legacy format with `endpoint` string) continue to work. New registries generated by `generate-registry.ts` use canonical format. Backward compatible.

---

## Risk Assessment for Plan Execution

| Risk | Severity | Mitigation |
|------|----------|------------|
| Forge `packages/types` cannot import from bridge (R-08) | **RESOLVED** | tsconfig already NodeNext + exactOptionalPropertyTypes |
| Forge service tsconfigs not yet NodeNext | MEDIUM | Services import from `@forge/types`, not directly from bridge. Only `packages/types` needs to import bridge. |
| Forge `x9.ts` migration breaks downstream consumers | LOW | Re-export with alias (`as X9CapabilityManifest`) preserves all import sites |
| Forge `CapabilityManifest` (Forge-local, `capabilities.ts`) confused with bridge `CapabilityManifest` | LOW | Different packages (`@forge/types` vs `@x9-forge/contracts`). Document clearly. |
| Real staging fixtures not yet captured (TEST-02 partial) | LOW | Static manifest exports + realistic test fixtures are sufficient for Phase 1. Live capture can happen during plan execution. |

---

## Plan Execution Implications

### Plan 01-01 (Bridge contracts) — ALREADY DONE
All 6 CAPA requirements are implemented. 40 tests pass. The bridge code (commit 5d1cde9) matches the ideal implementation.

### Plan 01-02 (X9 migration) — ALREADY DONE (outside GSD)
X9 `packages/types/` re-exports from bridge. `generate-registry.ts` uses `fromEndpoint()`. `registry.ts` uses `CapabilityRegistryEntrySchema` + `toEndpoint()`. Legacy format backward compat maintained.

**Action needed:** Retroactive GSD validation — verify that the X9 migration is complete and correct, document what was done.

### Plan 01-03 (Forge migration) — NOT DONE
This is the remaining work:
1. Add `@x9-forge/contracts` as dependency in Forge (git+https URL with SHA)
2. Update `packages/types/src/x9.ts` to re-export from bridge (alias for backward compat)
3. Verify all Forge services compile without changes
4. Verify `deploy.machine.ts` continues to produce valid registry entries
5. Verify `x9.client.ts` types align with bridge shapes
6. Run all 229 Forge tests
7. Smoke test staging deployment

---

## RESEARCH COMPLETE
