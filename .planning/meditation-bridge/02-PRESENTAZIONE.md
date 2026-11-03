# Presentazione di una capacità: ricognizione bridge e X9

Analisi statica del 15/10/2026, punto 4 del piano RILASCIO-MEDITATION-1010. Consultati `STATO.md` e `01-CONFIG.md` della stessa cartella; lo stato 1.29 non sostituisce i sorgenti correnti. `PANNELLO-FORGE.md` non trovato nella ricerca dei documenti del bridge: il requisito è quello riportato nel compito. Nessuna verifica dal vivo; accettazione e tipi affidati allo script.

## Contratti attuali

| Informazione | Manifest | Registro | Significato |
| --- | --- | --- | --- |
| Nome | `src/capability/capability-manifest.ts:21` | `src/capability/capability-registry-entry.ts:35` | `name: string`, obbligatorio e non vuoto; identifica la capacità. Non esiste un nome di prodotto distinto. |
| Nome servizio | `src/capability/capability-manifest.ts:24` | Host a `src/capability/capability-registry-entry.ts:37` | `serviceName` opzionale: hostname aggiunto dalla discovery, come documentato nel manifest a riga 16; non titolo commerciale. |
| Presentazione | `src/capability/capability-manifest.ts:53` | `src/capability/capability-registry-entry.ts:83` | Entrambi usano `presentation?: CapabilityPresentationDeclaration`. |
| Titolo commerciale, descrizione della capacità, icona, categoria | Nessun campo dedicato nello schema, righe 20–54 | Nessun campo dedicato nello schema, righe 34–84 | Non sono dichiarati né conservati come campi tipizzati dai contratti attuali. |

`src/capability/presentation.ts:64` dichiara solo `outputs`, `feedback`, `trends`, tutti opzionali; l'oggetto è strict a riga 68. Aggiungere oggi `presentation.title` o `presentation.icon` causa quindi rifiuto. Manifest e registro sono invece oggetti Zod senza strict/passthrough: chiavi sconosciute al loro livello vengono eliminate dal parsing, non diventano contratti.

I nomi apparentemente utili hanno un altro ambito: `outputs.label` (`presentation.ts:47`) etichetta una sezione; `kinds[].label/description` (`:25`) descrive un tipo di risultato; `feedback.label` (`:57`) e `trends[].label` (`:43`) etichettano feedback e misure. `CapabilityOutputSchema.title/summary` (`:77`, `:78`) descrive un singolo risultato, non il prodotto. Nessuna categoria o icona è dichiarata in questi schemi.

Gli schemi e tipi manifest/registro sono già pubblici da `@x9-forge/contracts/capability` (`src/capability/index.ts:42`, `:47`). La presentazione è riesportata a `:82` ed è disponibile anche dal subpath `@x9-forge/contracts/capability/presentation` (`package.json:133`).

## Manifest X9 consultati

Qui `X9:` indica il checkout di riferimento `/Users/admintemp/Downloads/Claude/agent-x9-codex-220-1`; lettura soltanto dei due manifest, nessuna modifica al repository X9.

- **Coach:** `X9:services/cap-coach/src/manifest.ts:75`, firma `manifest(endpoint: string, ordinary = false): CapabilityManifest`. Restituisce `name: "coach"` (costante a `:10`, uso a `:77`), versione `0.1.0`, endpoint, dipendenze vuote, parametri budget e quattro strumenti (`:79`–`:84`); in modalità ordinaria aggiunge `ordinaryParameters` (`:78`). Non emette `presentation`, titolo di prodotto, descrizione della capacità, icona o categoria. Le descrizioni a `:44`, `:50`, `:57` riguardano parametri; quelle a `:80`–`:83` riguardano strumenti. Non presenta il prodotto come “Meditation”.
- **ElevenLabs:** `X9:services/cap-agent-elevenlabs/src/manifest.ts:34`, stessa firma. Esegue `CapabilityManifestSchema.parse` (`:35`), emette `name: "agent-elevenlabs"` (`:4`, `:36`), versione `0.1.0`, endpoint, dipendenze e strumenti vuoti, requisiti di credenziali e parametri legacy oppure ordinari (`:46`). Non emette metadati commerciali né `presentation`. `config.displayName` (`:16`) è il nome della risorsa agente sul provider, non il nome della capacità.

Queste sono evidenze del valore costruito dalle funzioni: montaggio HTTP, discovery, copia nel registro e visualizzazione Forge non sono stati verificati.

## Esito e proposta per il compito successivo

ESISTE: campo tecnico `name`, `src/capability/capability-manifest.ts:21` e `src/capability/capability-registry-entry.ts:35`.

ESISTE: campo `presentation` per risultati/feedback/andamenti, `src/capability/capability-manifest.ts:53`, `src/capability/capability-registry-entry.ts:83`, `src/capability/presentation.ts:64`.

MANCA: campo `presentation.product` con nome di prodotto, descrizione, icona e categoria (patch proposta in 2 file, con test ed export; non implementata).

1. `src/capability/presentation.ts`: aggiungere lo schema esportato `CapabilityProductPresentationSchema` e il tipo inferito `CapabilityProductPresentation`; proposta di forma `{ title: string; description: string; icon: string; category?: string }`. Riutilizzare `TextSchema` per titolo, `DescriptionSchema` per testo, `IdSchema` per identificatori di icona e categoria. Aggiungere `product: CapabilityProductPresentationSchema.optional()` alla dichiarazione esistente: entrambi i contratti lo ereditano senza duplicazioni, payload precedenti restano validi. L'icona proposta è un identificatore testuale, non markup eseguibile; il vocabolario e la resa grafica vanno concordati con Forge. Gli export esistenti dal subpath dedicato e da `index.ts:82` espongono automaticamente schema e tipo, senza un terzo file sorgente.
2. Nuovo `tests/capability/product-presentation.test.ts`: import pubblici di schema e tipo; parsing completo di manifest e registro con confronto dei metadati conservati, compatibilità senza `product` e con sezioni B7 preesistenti, rifiuto di testi vuoti/fuori limite e proprietà sconosciute. Prevedere mutazioni di rimozione del campo e dei singoli vincoli: ogni controllo deve avere un caso che diventa rosso; includere controllo statico del tipo esportato. Nessun test implementato o eseguito in questa ricognizione.

La proposta è additiva e resta nel bridge. L'emissione dei valori da Coach/ElevenLabs e il consumo Forge richiedono compiti separati dopo il contratto; non cambiare `name` per ottenere il titolo “Meditation”.
