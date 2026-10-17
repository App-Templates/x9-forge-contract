# G2c — Mirror Python access-token per cap-rag

Ricognizione statica del 15 ottobre 2026, compito 167. **Esito: Patch necessaria in X9; R2 non completo.** Nel bridge i contratti TypeScript richiesti sono già disponibili. Nessuna modifica operativa o ai contratti eseguita qui.

## Evidenze e aggiornamento del mirror

I percorsi bridge sono relativi a questo repository. `X9` indica il checkout di riferimento `/Users/admintemp/Downloads/Claude/agent-x9-codex-210-1`, consultato solo in lettura. Riutilizzati `STATO.md`, `.planning/conn01-bridge/G2B-IDENTITA-FONTE.md` e `X9/.planning/phases/conn01/C1-PUNTO-13-RAG-GOOGLE.md` (R2 nella sezione 4). Lo stato storico non prevale sui sorgenti correnti.

| Oggetto | Evidenza | Conclusione |
| --- | --- | --- |
| Mirror cap-rag | `X9/services/cap-rag/src/cap_rag/_bridge_mirror.py:1`, `:20`, `:25`, `:29` | Modulo mantenuto esplicitamente a mano, con citazioni della fonte. Contiene header token, percorso Vault resolve e campi della sua risposta; non contiene access-token. Le citazioni non aggiornano il codice automaticamente. |
| Test di deriva Vault | `X9/services/cap-rag/tests/test_credential_resolver.py:115`, `:131`, `:136` | La fixture `installed_bridge` usa Node `createRequire` ancorato a `services/agent-core/package.json`, importa i sottopercorsi pubblici auth/http e confronta header e percorso resolve. Il pacchetto mancante causa errore, non un salto del test. È il modello da riusare per R2. |
| Test di deriva RAG | `X9/services/cap-rag/tests/test_bridge_mirror.py:44`, `:53`, `:108`, `:138` | Parser testuale dei bundle: confronti di uguaglianza degli insiemi. Cerca checkout adiacente/vendor e può saltare i controlli se gli artefatti mancano. Non garantisce il confronto con il pin effettivamente installato e non copre access-token. Non replicare questo limite nel nuovo controllo. |
| Generatore bridge | `scripts/generate-portable-capability-contracts.mjs:16–29`; `package.json:149` | Esiste ed è invocato dalla build. Legge il catalogo canonico compilato e il template, produce `capabilities.contracts.json` e `x9_forge_contracts_capabilities.py` sotto `dist/python`, con digest e verifica di importazione. **Non genera `_bridge_mirror.py`.** |
| Perimetro del generatore | `src/capability/portable-contracts.ts:116–162` | Esporta contratti ordinary, RAG query, authority e lifecycle. Nei contratti e trasporti elencati non compare Vault access-token. Il testo storico del mirror «no Python SDK» non descrive questa più recente esportazione Python parziale. |
| Verifica del generatore | `tests/capability/portable-contracts.test.ts:137–158`; `tests/python/test_generated_capabilities.py:1` | Test di generazione deterministica, importazione Python, parità semantica e cataloghi invalidi. Esistono quindi verifiche Python nel bridge, ma non un test di deriva del mirror access-token di cap-rag. |

Non trovato un riferimento a `_bridge_mirror` negli script bridge né negli script Python/Node/shell/TypeScript della directory `X9/scripts`. Questa è una ricognizione dei file indicati e dei punti di generazione/test pertinenti, non una prova sull'intera automazione esterna. Non letti artefatti `dist/`, vendor, segreti o configurazione di produzione.

## Contratto canonico da riportare in Python

Fonte: `src/http/endpoints/internal-vault-connection.ts:23`, `:73–101`, `:158–165`; scope e provider: `src/capability/connect/index.ts:4`, `:10`, `:34`.

- `postVaultAccessTokenContract`: metodo POST, percorso con parametri `agentId` e `provider`, autenticazione `secret`. Il template Python deve derivare dal percorso canonico sostituendo i segnaposto, senza nuovi URL nei chiamanti. Usare `INTERNAL_SECRET_HEADER` da `auth`; l'header token del vecchio resolve non è intercambiabile.
- Parametri strict: `agentId` stringa numerica positiva di massimo dieci cifre, `provider` Google. Non convertire implicitamente un runtime ID in un Vault agent ID.
- `PostVaultAccessTokenBodySchema`: oggetto strict `{scope, personRef}`; persona stringa non vuota. `VaultAccessScopeSchema` deriva da `ConnectScopeSchema` escludendo `mail_send`. Ammette già `mail_read` e `drive_read`, oltre agli scope preesistenti ammessi. Nessun `docs_read` da aggiungere.
- `PostVaultAccessTokenResponseSchema`: oggetto strict `{ok: true, accessToken, expiresAt, scopes}`; token non vuoto, massimo `VAULT_ACCESS_TOKEN_MAX_LENGTH` (4096); scadenza intera positiva; array di scope derivato da `ConnectScopeSchema`. Lo schema della risposta non impone array non vuoto, unicità o esclusione di `mail_send`: non attribuirgli restrizioni inesistenti.
- `VaultAccessErrorResponseSchema`: oggetto strict `{ok: false, error}` con `VAULT_ACCESS_ERROR_CODES = not_connected | revoked | scope_missing | expired`. Il descrittore della rotta non include questo schema come proprietà dedicata: importarlo separatamente. Non dedurre una mappa HTTP degli errori dal solo enum.

Il riferimento C1 sui quattro scope è superato da `src/capability/connect/index.ts:10`. Sono da aggiungere le rappresentazioni Python e i relativi controlli di deriva, non nuovi contratti condivisi TypeScript. La persona è quella che ha collegato la fonte: decisione già presa, non un parametro da inventare dal solo agente.

## Patch esatta proposta — Lotto R2 in X9, 2 file

Richiesta per la corsia X9 dopo disponibilità e pin del bridge aggiornato. Nessun file X9 è autorizzato in scrittura da questo compito. Restare sul mirror manuale circoscritto già esistente; non creare un secondo generatore. Una migrazione al modulo Python generato richiederebbe estendere il suo catalogo e qualificare i refinement, ed è un lavoro separato.

1. `services/cap-rag/src/cap_rag/_bridge_mirror.py`: conservare tutti gli export esistenti; aggiungere una sezione Vault access-token con fonti canoniche. Export proposti: `VAULT_ACCESS_TOKEN_METHOD: str`, `VAULT_ACCESS_TOKEN_PATH_TEMPLATE: str`, `INTERNAL_SECRET_HEADER: str`, `VAULT_ACCESS_SCOPE_VALUES: frozenset[str]`, `VAULT_ACCESS_ERROR_CODES: frozenset[str]`, `VAULT_ACCESS_TOKEN_MAX_LENGTH: int`. Aggiungere i tipi `VaultAccessTokenBody`, `VaultAccessTokenResponse`, `VaultAccessErrorResponse` e validatori `validate_vault_access_token_body(value: object) -> VaultAccessTokenBody`, `validate_vault_access_token_response(value: object) -> VaultAccessTokenResponse`, `validate_vault_access_error_response(value: object) -> VaultAccessErrorResponse`, con `ValueError` per dati invalidi. I soli TypedDict non validano a runtime. La validazione deve rispettare strict, campi obbligatori e limiti del bridge; in Python i booleani non devono passare come numeri. Nessuna lettura di credenziali o chiamata HTTP in questo modulo.
2. `services/cap-rag/tests/test_credential_resolver.py`: estendere la fixture `installed_bridge` e aggiungere casi, mantenendo tutte le asserzioni esistenti. Riutilizzare `createRequire` e i sottopercorsi pubblici `auth`, `http`, `capability/connect`. Esportare verso il test solo metadati e risultati `safeParse` su valori sintetici: metodo, percorso, authType, header, codici, limite e scope ammessi calcolati filtrando `ConnectScopeSchema.options` tramite `VaultAccessScopeSchema.safeParse`. Confrontare insiemi esatti, non semplici inclusioni. Usare gli stessi payload sintetici per confrontare accettazione Zod e validatori Python. Percorsi relativi al file, Node 24, nessuna dipendenza dal checkout bridge adiacente, nessun token reale, nessun nuovo pacchetto.

Questo lotto non modifica `test_bridge_mirror.py`: le sue verifiche RAG restano esistenti; il nuovo controllo usa il modello di risoluzione del pacchetto già presente nei test Vault. Non richiede file generati da conteggiare nel limite. Gli export Python proposti non esistono ancora.

## Prove richieste al lotto di implementazione

Confrontare body validi per entrambi gli scope di lettura; rifiutare persona assente/vuota, scope sconosciuto, `mail_send`, campi extra e tipi errati. Risposta: token vuoto/oltre limite, scadenza booleana/non intera/non positiva, scope sconosciuto, campi extra o mancanti. Errori: ciascuno dei quattro codici ammesso, codice estraneo e forma incoerente rifiutati. Usare valori sintetici, senza stamparli come credenziali operative.

Per dimostrare che i nuovi controlli funzionano, alterare temporaneamente uno alla volta percorso, header, uno scope, un codice e un vincolo di validazione del mirror: il rispettivo caso deve fallire; ripristinare prima del successivo. Il pacchetto mancante deve far fallire il controllo, non saltarlo. Registrare casi e mutazioni rilevate con il loro denominatore; qui nessuna di queste prove è stata eseguita.

## Dipendenze e limite operativo

R2 rende disponibile il contratto Python, ma non migra il recupero delle credenziali. Il lotto consumer R5 deve usare persona e identità Vault attendibili, mappare Gmail a `mail_read` e Drive/Docs a `drive_read`, gestire scadenza ed errori reali senza fallback al valore grezzo. Autenticazione e possibilità di invocare direttamente questa rotta Vault vanno verificate nei consumer: il commento del contratto descrive cap-connect → Vault, non autorizza automaticamente cap-rag. Non riusare il vecchio token di servizio come secret.

L'associazione persistente fonte/persona e il blocco dopo revoca restano nel lavoro G2b e nei consumer; un token valido non prova da solo l'appartenenza di una fonte indicizzata. Dopo push e pin autorizzati occorrono i consumer cap-connect/Vault/cap-rag e la prova dal vivo. Questo compito consegna solo la ricognizione: nessun test, build, controllo dei tipi o comando di accettazione lanciato; accettazione e tipi allo script.
