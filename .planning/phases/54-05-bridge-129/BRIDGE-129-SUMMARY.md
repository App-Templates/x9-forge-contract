# BRIDGE-129 · B1 e B7
Ultimo aggiornamento: 11:17 (06/10/2026)

Base: d8ef67f (v1.28.0). Branch: codex/bridge-129-params-outputs.
Stato: PRESO, fonti lette. Nessun consumer o rilascio in questo incarico.

## Compiti e commit
| Task | Stato | Commit | Prova |
| --- | --- | --- | --- |
| 1 B1 parametri | implementato e testato | questo commit | 0/63 → 63/63, tipi/lint OK |
| 2 B7 uscite, feedback, andamento | da fare | — | — |
| 3 dichiarazioni, export, smoke | da fare | — | — |
| 4 versione e qualità | da fare | — | — |
| 5 mutazioni | da fare | — | — |

## Fonti e scelte da confermare
- D54-11: tutto per agente e capability, nessun projectId nella configurazione.
- PIANO-SVILUPPI §B, HANDOFF D1/D13, FORGE-REDESIGN §7.3 e VISTA-PROGETTO §0/2: dichiarazioni facoltative nel manifest; vecchi manifest invariati.
- Le fonti richiedono letture/scritture ma non stabiliscono nuove rotte B1/B7: questa proposta aggiunge schemi e dichiarazioni. Le rotte per agente di v1.28 e la loro autenticazione restano intatte; nessun endpoint inventato. Da concordare con Samira prima dei consumer.
- Parametri ordinari, mai credenziali: env-schema/vault restano il percorso delle chiavi. Nessun default di prodotto scelto dal bridge.
- Da quando vale: immediate oppure next_apply, coerente con D1. I valori dichiarano platform_default, agent_override o needs_choice.
- Consumer previsti: Forge fase 33 (parametri); agent-x9 capability (dichiarazioni, prima cap-food); vista di progetto esterna/app di dominio (B7). Aggiornamenti fuori repo affidati alla coordinatrice/Samira.

## Prove
Task 1: tutti i 63 test nuovi hanno fallito per export assente (asserzione, nessun errore di raccolta); poi 63/63 verdi. Tipi e lint dei file nuovi riusciti. Mutazioni nel Task 5. Prove locali sintetiche, nessun servizio reale.

## Resta
B7, dichiarazioni facoltative, smoke, versione, qualità, mutazioni e consegna.
