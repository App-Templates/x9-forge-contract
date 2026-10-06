# BRIDGE-130 — producer and consumer migration

The source contract is implemented; it is not released or deployed. Version,
CHANGELOG and distribution generation are owned by the coordinator.

## Public imports

```ts
import {
  AgentRuntimeIdentitySchema,
  AgentRuntimeIdentitiesSchema,
  AgentRuntimeChannelSchema,
  AgentRuntimeEvidenceSchema,
  AgentRuntimeSnapshotSchema,
  AgentRuntimeSourceSchema,
  deriveAgentRuntimeState,
} from '@x9-forge/contracts/agent';
import type {
  AgentRuntimeIdentity,
  AgentRuntimeState,
  AgentRuntimeChannel,
  AgentRuntimeEvidence,
  AgentRuntimeSnapshot,
  AgentRuntimeSource,
} from '@x9-forge/contracts/agent';
import {
  ListAgentsResponseSchema,
  getListAgentsRuntimeState,
  listAgentsContract,
} from '@x9-forge/contracts/http';
```

The existing endpoint/authentication contract is retained. Consumers should use
its exported path/authentication contract and the existing shared auth headers.
No new endpoint, header, slug alias table or database-ID conversion is introduced.

## Additive wire example

```json
{
  "agents": [{
    "agentId": "x9",
    "displayName": "Master Chief",
    "ownerId": "owner-1",
    "identity": { "managementAgentId": "x9-staging", "runtimeAgentId": "x9" },
    "runtime": {
      "state": "active",
      "loadState": "loaded",
      "channelsComplete": true,
      "channels": [{
        "channelId": "web",
        "kind": "web",
        "state": "loaded",
        "loaded": true,
        "readiness": "not-ready"
      }]
    }
  }],
  "source": {
    "authority": "x9",
    "availability": "available",
    "completeness": "partial",
    "observedAt": "2026-10-06T21:00:00Z"
  }
}
```

This sample agent is active because its web channel is observed loaded, but the
channel is not ready. These are separate facts. `observedAt` is an ISO UTC time;
consumers may apply their freshness policy. A producer reporting cached data
while unreachable must mark source availability unavailable or unknown.

## Identity rules

`agentId` remains the runtime ID in a list row. `identity.runtimeAgentId` must
match it. The management ID is an explicit mapping from the authoritative
control plane, never a name guess. A database primary key stays outside these
slug identifiers. Duplicate IDs and names shared across different identity
namespaces are rejected; one agent may use the same ID in both namespaces.
Legacy rows reserve their observed runtime identifier for collision detection
but do not acquire an inferred management identity.

## Evidence rules

- Channel kinds reuse telegram/email/voice/whatsapp plus additive web. Distinct
  channelId values permit multiple transports/providers of the same kind.
- Channel states: loaded / paused / stopped / error / unknown. loaded=true is
  required for loaded; paused and stopped require false; unknown requires null.
  An error can retain true, false or null loading evidence. A paused channel is
  intentional and is never promoted to an error.
- Readiness: ready / not-ready / unknown. It describes readiness independently
  of runtime loading. A configured channel may be ready and paused; a loaded
  channel may be not ready. Neither readiness nor existing bot status proves
  that a channel is loaded.
- loadState: loaded / stopped / error / unknown. This is explicit evidence about
  the logical agent, including capability-owned execution; it is not simply a
  check for membership in a Telegram bot map. Absence from a loader must remain
  unknown unless an explicit overall stopped observation exists.
- channelsComplete is independent of the completeness of the whole agent list.
  Claim it only after accounting for all applicable channels, including channels
  owned by capabilities outside agent-core's bot supervisor.

Derivation order: any observed loaded channel → active; explicit agent error →
error; explicit agent stopped → stopped; observed channel error without a loaded
channel → error; loaded agent with complete, entirely known unloaded channels →
no-channel; otherwise unknown. A stopped agent plus a loaded channel is rejected.
The snapshot validates its claimed state against this derivation. Active does
not mean that all channels work or that an initial readiness check passed.

## Source and absence

`source.availability`: available / unavailable / unknown.
`source.completeness`: complete / partial / unknown.
An available source requires an observation time; only an available source can
claim complete. A partial available list can positively prove a present agent's
loaded channel. Missing rows never prove that an agent is stopped.

## Conservative consumer lookup

```ts
const payload = ListAgentsResponseSchema.parse(rawResponse);
const state = getListAgentsRuntimeState(payload, managementAgentSlug);
```

The helper resolves only exact declared management or runtime IDs. A valid old
1.29 response remains readable with its original fields unchanged; canonical
state is unknown even for legacy running/bot-less/stopped and loaded=true. Missing
runtime/source metadata, unavailable source or an absent row also yields unknown.
Invalid or ambiguous payloads throw; callers handle validation/transport errors
as unknown rather than falling back to stored database status.

Producers and consumers must migrate after package release. This change does not
add a live X9 collector, alter Forge UI/actions or assert production channel health.
The source contract, CJS/ESM package behavior and compatibility tests are verified;
release, consumer integration and live checks are separate work.
