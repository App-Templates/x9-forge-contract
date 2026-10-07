# BRIDGE-136a — identità canonica nel contesto e voce legata all'id di gestione (correzione di BRIDGE-134)

Repo bridge, worktree `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-70-1`, branch `codex/bridge-136a`, base main 3576f6c (1.35).
Autore Codex A (≤45 min). Rilascio 1.36.0 insieme a R7-1 di D (file diversi: tu agent-channel-configuration.ts, D agent-workspace.ts; agent/index.ts: solo
export aggiunti, coordinatevi in MESSAGGI per l'ordine). Additivo.

## Difetto (Codex A 09:04)
checkContextScope impone voiceConfiguration.agentId === context.agentId (runtime), ma AgentVoiceConfig.agentId è l'id di GESTIONE (Forge). Con
gestione 101 / runtime «alice» il contesto non si legge.

## Decisione della coordinatrice
- Campo opzionale `identity?: AgentRuntimeIdentity` (schema ESISTENTE, coppia managementAgentId/runtimeAgentId) nel contesto con canali e Write.
  Writer: Forge. È la fonte canonica autonoma della coppia.
- Regole in checkContextScope:
  1. identity presente → identity.runtimeAgentId === context.agentId;
  2. id di gestione del contesto = identity.managementAgentId se presente, altrimenti l'identity.managementAgentId dei channelConfigurations
     (tutti concordi; discordanti → rifiuto);
  3. voiceConfiguration.agentId === id di gestione del contesto; se nessuna fonte di gestione esiste, compatibilità 1.34: accettato solo se
     === context.agentId;
  4. identity e canali discordanti → rifiuto.
- Helper `managementAgentIdOf(ctx): AgentId | null` (null se nessuna fonte).
## Test
compat 1.34/1.35; coppia 101/alice con identity; coppia ricavata dai canali; canali discordanti; identity vs canali discordante; voce con id
sbagliato; helper null/presente. Mutazione per ciascuna regola. build/typecheck/lint/check:pack/test + CJS.
## Perimetro
src/agent/agent-channel-configuration.ts, src/agent/index.ts (solo export), tests/**, .planning/phases/bridge-136a/**.

09:11: rilascio1.37 dopo rebaseautorizzato5ddc97b (1.36 eR7 giàintegrato). Take09:19,deadline10:04. R4 checkpointb424a97d,nessunedit50-1 duranteponte. D09:06exportworkspaceconservato,helper nelblockchannelconfig. Nessunpackage/distmodificato,buildprivataesatta;no push/merge/deploy/live.
