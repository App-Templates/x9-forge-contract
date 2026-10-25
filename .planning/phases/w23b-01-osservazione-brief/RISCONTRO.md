# W23B-01 — Osservazione di brief e Ricerca (T2)

## Contratti riscontrati

Il contratto esiste dalla v1.67.0 (TV2B-01, 328). Le letture permettono alla sonda T2 di osservare il brief elaborato e le ricerche collegate senza reinviare il brief.

| Contratto | Metodo | Percorso | Servizio X9 | Autenticazione |
| --- | --- | --- | --- | --- |
| `labBriefGapsListContract` (`src/http/endpoints/internal-rd-observations.ts:30`) | `GET` | `/internal/capability/agents/:agentId/lab/brief-gaps` | `cap-lab` | `authType: 'secret'`, `authHeader: INTERNAL_SECRET_HEADER` |
| `ricercaResearchListContract` (`src/http/endpoints/internal-rd-observations.ts:59`) | `GET` | `/internal/capability/agents/:agentId/ricerca/researches` | `cap-ricerca` | `authType: 'secret'`, `authHeader: INTERNAL_SECRET_HEADER` |

I servizi consumatori sono indicati in `CHANGELOG.md:22`. Entrambi i contratti sono esportati da `@x9-forge/contracts/http/endpoints` tramite `src/http/endpoints/index.ts:35`. Si usa il nome della costante di autenticazione, senza riportarne il valore.

## Richiesta e risposta

Entrambe le richieste hanno params `{ agentId }`, validati da `CapabilityAgentParamsSchema` (`src/http/endpoints/internal-capability-agent.ts:25`).

Le query richiedono `tenantId`, `ownerId` e `projectId`; solo Lab richiede anche `clientId`. Entrambe accettano `limit` facoltativo, intero da 1 a 50, con conversione da stringa (`src/http/endpoints/internal-rd-observations.ts:9-15` e `:41-46`).

Lab risponde con `analyses[]`: ogni analisi contiene `gapsRef`, `topics`, `covered[{slug, version}]`, `gaps[{topic}]` e `analyzedAt`, data e ora ISO. Ricerca risponde con `researches[]`: ogni ricerca contiene `researchId`, `state` e `labGapsRef` facoltativo. Ogni lista contiene al massimo 50 elementi; le risposte e i loro elementi rifiutano campi aggiuntivi (`src/http/endpoints/internal-rd-observations.ts:18-26` e `:49-55`).

## Correlazione

L'identità è data da `agentId` + `tenantId` + `ownerId` + `clientId`/`projectId`: `clientId` compare solo nella query Lab, `projectId` in entrambe. Lo scope va mantenuto esplicito nelle due letture.

Brief → Ricerca: il `labGapsRef` della ricerca è uguale al `gapsRef` dell'analisi (`LabGapsRefSchema` in `src/capability/ricerca/research.ts:15`, campo `labGapsRef` in `:37`). Per una ricerca di progetto senza `labGapsRef`, il comportamento richiesto a cap-ricerca è il rifiuto con `consulta_prima_il_quaderno` (`research.ts:38-42`); questo vincolo del servizio non è una validazione condizionale nello schema della richiesta.

## Esempio depurato

Valori ripresi da `tests/http/internal-rd-observations.test.ts:12-22`; `agentId` è `agent-1`, come nella prova dei params dello stesso file. Non sono inclusi dati di autenticazione o indirizzi personali.

```json
{
  "lab": {
    "params": { "agentId": "agent-1" },
    "query": {
      "tenantId": "tenant-1",
      "ownerId": "owner-1",
      "clientId": "client-acme",
      "projectId": "launch-2026"
    },
    "response": {
      "analyses": [{
        "gapsRef": "brief_123",
        "topics": ["Market", "Competitors"],
        "covered": [{ "slug": "acme-market", "version": 2 }],
        "gaps": [{ "topic": "Competitors" }],
        "analyzedAt": "2026-10-24T10:00:00.000Z"
      }]
    }
  },
  "ricerca": {
    "params": { "agentId": "agent-1" },
    "query": {
      "tenantId": "tenant-1",
      "ownerId": "owner-1",
      "projectId": "launch-2026"
    },
    "response": {
      "researches": [{
        "researchId": "research-1",
        "state": "queued",
        "labGapsRef": "brief_123"
      }]
    }
  }
}
```

## Blocco (contratto mancante)

Nessuna delle due risposte ha un `runId` o un riferimento al turno; `researches[]` non ha un orario. L'orario è presente solo sull'analisi, in `analyzedAt`. Non si può quindi vedere se brief e ricerca appartengano allo «stesso run», né se il quaderno preceda la Ricerca nel tempo. L'ordine si vede solo dal riferimento `labGapsRef`, che indica il legame con il quaderno senza provare una sequenza temporale.

Il consumer night non deve inventare un sostituto: l'eventuale estensione del ponte spetta a Opus o Stefano. Chi aggiungerà questi campi deve aggiornare insieme questo documento e il test associato.

Questo riscontro da solo non rende T2 provabile: servono le rotte cap-lab/cap-ricerca (W23L-02), la sonda (W23N-03) e la decisione sul blocco del run. Dopo tali passaggi Stefano potrà provare T2 in sola lettura.
