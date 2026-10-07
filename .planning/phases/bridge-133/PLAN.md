# BRIDGE-133 — versione di configurazione applicata nel contesto dell'agente

Autore: Claude S0 (bacheca forge-v2, richiesta 48 compito 1). Worktree
`/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-48-1`, branch `claude/bridge-133`, base `dd6b724`
(1.32.0). Perimetro `src/agent/**`, `tests/**`, `.planning/phases/bridge-133/**`. package.json, CHANGELOG e dist
restano della coordinatrice. Niente push. Scritto prima del codice: 07/10/2026 05:55.

## Perché
X9 R1b-2 deve dichiarare la versione di configurazione applicata (`AgentConfigVersionStateSchema.applied`) senza
inventarla e senza leggere un campo passthrough non tipizzato (domanda di Codex D, 05:46).

## Cambiamento (solo additivo)
- `configVersion?: AgentConfigVersionSchema` nei campi runtime di `context.json` (`AgentContextRuntimeFieldsSchema`),
  quindi in `AgentContextFileSchema`, `AgentContextFileWriteSchema`, `AgentContextWithChannelsSchema` e
  `AgentContextWithChannelsWriteSchema` (estendono lo stesso schema). JSDoc: è la versione dell'intera configurazione
  salvata dell'agente; Forge la scrive all'Applica, X9 la legge dopo aver validato il contesto.
- Helper `appliedAgentConfigVersion(context)`: il valore letto, oppure `null` (mai applicata) se assente. Mai un
  valore indovinato.
- Contesti 1.32 senza il campo restano validi e invariati.

## Test e prove
- Rosso prima, poi verde: valori validi; assenza → `null`; valori non validi (0, negativo, decimale, stringa,
  null) rifiutati in tutte e quattro le varianti; payload 1.32 invariati; export pubblico ESM/CJS.
- Una mutazione per controllo nuovo, in `evidence/`.
- Suite completa con `--maxWorkers=1`, build, typecheck, lint, `check:pack`, CJS.

## Limite
Un contesto 1.32 che avesse già un `configVersion` non numerico nel passthrough ora viene rifiutato: Forge 1.32 non
scrive quel campo, quindi nessun contesto reale è coinvolto.
