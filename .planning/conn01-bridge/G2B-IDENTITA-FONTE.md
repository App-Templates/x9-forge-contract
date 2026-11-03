# G2b — Identità della fonte Google e blocco del recupero revocato

Ricognizione statica del 15 ottobre 2026, compito 164. **Esito: Patch necessaria**, non COMPLETO. Nessun contratto implementato da questo compito. La proprietà personale è una decisione ricevuta nel mandato; non va riaperta come domanda di prodotto.

## Perimetro ed evidenze

Percorsi `src/` e `tests/` relativi a questo bridge. Nei riferimenti seguenti, `SPEC` indica `/Users/admintemp/Downloads/Claude/agent-x9-codex-210-1/.planning/phases/conn01/SPEC-LETTURA-GOOGLE.md`, `C1` indica il vicino `C1-PUNTO-13-RAG-GOOGLE.md`. Sono stati letti soltanto questi due documenti esterni, non i consumer. `SPEC:9`, `SPEC:11`, `SPEC:13` e `SPEC:15` richiedono proprietà della persona, isolamento del corpus, Vault proprietario delle credenziali e blocco logico immediato dopo revoca, indipendente dalla cancellazione fisica.

Ricerca trasversale effettuata su tutta `src/` con `rg -l 'personRef|connectionId|connection_ref|connection_id|revoked' src`; ulteriori ricerche per `google|gmail|gdrive|gdocs` e per tenant/owner/agent/corpus/source. Approfonditi i moduli trovati, inclusi `src/rag/` e `src/memory/`. Nessuna lettura di `dist/`, segreti o configurazione di produzione. Il documento di stato preesistente `STATO.md:3` è riferito alla versione 1.29: per questa ricognizione fanno fede i sorgenti correnti. Le assenze sotto descritte riguardano campi tipizzati e controlli dei contratti, non eventuali dati nascosti nei payload liberi dei consumer.

## 1. Schemi già disponibili e lacune

| Area | Evidenza nel bridge | Copertura e limite |
| --- | --- | --- |
| Identità della chiamata | `src/capability/capability-call-identity.ts:5`; `src/http/endpoints/internal-memory-extract.ts:16` | `CapabilityCallIdentitySchema`: tenant, owner e agente obbligatori; `userId` facoltativo. Oggetto strict, nessun riferimento a connessione o corpus. |
| Contesto autenticato | `src/capability/capability-call-context.ts:13`, `:22`, `:26`, `:30`, `:44` | Identità da autenticazione e contesto validato; `CapabilityPersonScopeSchema` rende `userId` obbligatorio. `sameCapabilityScope` confronta anche `userId`, compresa la sua assenza. Né lo schema né l'helper attestano da soli l'autenticità dei dati ricevuti. |
| Identificatori dell'agente | `src/agent/agent-context-identity.ts:7`, `:23`, `:35`; `src/http/endpoints/internal-vault-connection.ts:23` | Esiste la distinzione fra runtime, management e `vaultAgentId` numerico. La rotta Vault richiede un identificativo numerico serializzato: non si può passare automaticamente il runtime ID. |
| Identità RAG | `src/rag/rag-common.ts:49`, `:65` | `RagIdentityEnvelopeSchema` contiene tenant/owner/agent in snake_case; `RagCorpusRefSchema` identifica un corpus UUID. Nessuna persona nell'envelope. |
| Fonte RAG | `src/rag/rag-source.ts:21`, `:85`, `:107` | `RagSourceConnectionSchema`: UUID della sorgente RAG, tenant/owner/agent, provider, stato, cursore, `credential_ref` facoltativo, configurazione libera. Mancano persona, corpus e riferimento tipizzato alla connessione OAuth. `source_connection_id` è l'ID della sorgente RAG, non un ID Vault. Anche sync/status sono a tre identità. |
| Autorizzazione RAG | `src/rag/authorized-context.ts:4`, `:8`, `:13`, `:19` | Principal umano/servizio con `person_id` facoltativo; assegnazione corpus con revisioni e stato active/revoked. L'helper confronta l'assegnazione corrente e l'identità a tre campi, non una connessione Google né una persona corrente attesa. |
| Query e citazioni | `src/rag/rag-query.ts:12`, `:24`; `src/rag/qualified-citation.ts:7`, `:18` | Query legacy: corpus e filtro libero, senza fonte personale. Citazione qualificata: documento/revisione/assegnazione, con verifica corrente del corpus; nessun vincolo sulla connessione OAuth. Non è sufficiente per revocare una sola fonte Google. |
| Memory | `src/memory/identity.ts:15`, `:25`; `src/memory/write-candidate.ts:67`; `src/memory/temporal.ts:94`; `src/memory/delete.ts:28` | Tenant obbligatorio, owner/agent/user facoltativi; coerenza semantica delegata ai consumer. Provenienza, invalidazione e cancellazione per riferimento esistono, ma non costituiscono un'associazione tipizzata persona–connessione–corpus né un controllo corrente della revoca Google. |
| Consenso e completamento | `src/capability/connect/index.ts:32`, `:54`; `src/http/endpoints/internal-connection-completed.ts:17` | Start porta `personRef`; evento completed porta tenant/owner/agent/persona e permessi. Evento di completamento non equivale a stato corrente: outcome connected/denied/expired (`:14`), nessun riferimento immutabile alla connessione. |
| Access-token | `src/http/endpoints/internal-connect.ts:61`, `:69`, `:118`; `src/http/endpoints/internal-vault-connection.ts:83`, `:89`, `:158` | Persona e scope attraversano entrambe le richieste. Risposta token non contiene identità o ID della connessione; non può attestare a quale associazione dell'indice appartenga. |

Gli scope di lettura sono già presenti: `ConnectScopeSchema` comprende `mail_read` e `drive_read` (`src/capability/connect/index.ts:10`); `VaultAccessScopeSchema` deriva da quello ed esclude solo `mail_send` (`src/http/endpoints/internal-vault-connection.ts:78`). L'osservazione storica in `C1:22` sui soli quattro scope non descrive più questo sorgente. Non aggiungere `docs_read` per questa patch.

## 2. Schema minimo proposto e autorità dei campi

Proposta additiva, da implementare nel lotto sotto: `RagGoogleSourceIdentitySchema` strict con tipo inferito `RagGoogleSourceIdentity`. Non estendere indiscriminatamente i contratti RAG legacy: restano validi per altri provider, ma il consumer Google dovrà obbligatoriamente usare il nuovo confine. Base della necessità: `src/rag/rag-source.ts:21` e `SPEC:11`.

| Campo proposto | Tipo da riusare | Chi attesta e confronto obbligatorio |
| --- | --- | --- |
| `source_connection_id` | `RagSourceConnectionSchema.shape.id` | Modulo proprietario delle sorgenti RAG; identico all'associazione salvata e alla provenienza di ogni documento/chunk. |
| `identity` | `CapabilityPersonScopeSchema` | Backend autenticato e contesto agente validato: tenant, owner, runtime agent, user obbligatori. Confronto completo con chiamante e sorgente persistita, senza ripiego sull'owner. |
| `personRef` | `ConnectStartRequestSchema.shape.personRef` | Risolutore autenticato della persona nel percorso connessioni. Deve essere attestata la relazione con `identity.userId`: non assumere uguaglianza testuale fra namespace diversi. |
| `agentContext` | `AgentContextIdentitySchema` | Forge attesta tenant/owner/runtime e mappatura Vault; confronto con `identity` e con l'agente Vault indirizzato. Nessuna conversione dedotta da slug o nome. |
| `connectionRef` | Nuovo riferimento opaco non vuoto, non un token | Vault lo genera per l'associazione personale all'account Google, lo conserva anche per riconoscere una revoca. Cambio account o nuovo consenso dopo revoca richiede nuovo riferimento; refresh ordinario no. L'etichetta account è solo presentazione. |
| `provider` | Sottoinsieme di `RagProviderSchema` | Modulo sorgenti: solo gmail/gdrive/gdocs (`src/rag/rag-common.ts:13`). Vault continua a usare `ConnectProviderSchema` google (`src/capability/connect/index.ts:4`). |
| `corpus_id` | `RagCorpusRefSchema.shape.id` | Proprietario delle assegnazioni RAG: corpus personale, mai condiviso implicitamente con altre persone dello stesso agente. Confronto con assegnazione corrente e risultato. |

Le autorità in tabella sono il protocollo **proposto**, non implementazioni osservate. La distinzione `userId`/`personRef` esiste nei contratti (`src/capability/capability-call-identity.ts:9`, `src/capability/connect/index.ts:34`), ma non una loro equivalenza certificata. La nuova risposta Vault deve attestare entrambi insieme, verificando il legame server-side; uno schema Zod di sole stringhe non può farlo.

Il nuovo schema deve riusare i campi canonici e rifiutare anche stringhe composte solo da spazi, dati incompleti e proprietà inattese. Tutti i confronti avvengono dopo parsing; la conversione esplicita camelCase/snake_case serve solo per confrontare l'identità col corpus, non per generare identità mancanti. Riferimenti riusabili: `src/capability/capability-call-context.ts:26`, `src/rag/rag-common.ts:49`, `src/agent/agent-context-identity.ts:23`.

## 3. Revoca: stato attuale e blocco proposto

**Oggi nel contratto:** lo stato connessione è `ConnectStatusSchema`, con `revoked` (`src/capability/connect/index.ts:51`). Vault espone stato, delete e revoke (`src/http/endpoints/internal-vault-connection.ts:44`, `:50`, `:142`) e access-token con errore `revoked` (`:74`). Stato pubblico e lista non riportano persona, ID connessione o versione (`src/capability/connect/index.ts:54`; `src/http/endpoints/internal-vault-connection.ts:106`). La revoca è indirizzata per agente/provider, non per persona (`src/capability/connect/index.ts:64`). Il bridge definisce il protocollo, non contiene la persistenza di Vault: la tabella concreta e l'atomicità del suo aggiornamento non sono verificate qui. Vault come unico proprietario è richiesto da `SPEC:13`.

**Diverso stato già presente:** `RagCorpusAssignmentSchema.state` revoca l'assegnazione al corpus (`src/rag/authorized-context.ts:8`). `isRagAuthorizedContextCurrent` esclude assegnazioni revocate e revisioni cambiate (`:23`), ma non legge Vault; la durata massima di 60 secondi del contesto (`:17`) non garantisce un blocco immediato della fonte. `RagSourceStatusEnumSchema` ha soltanto active/paused/error (`src/rag/rag-common.ts:25`): aggiungervi revoked senza autorità e collegamento al recupero creerebbe una seconda verità.

**Protocollo proposto:** Vault restituisce una verifica non segreta corrente della specifica `connectionRef`, completa di identità personale attestata, provider, scopes effettivi, stato canonico e revisione dell'autorizzazione. Il proprietario RAG conserva il legame immutabile della fonte, non una copia autorevole di `revoked`. Per ogni ricerca e apertura documento il consumer deve:

1. Risolvere chiamante e sorgente dal contesto autenticato e dal registro RAG; confrontare tutti i campi della tabella. Modello e browser non attestano l'identità (`src/capability/capability-call-context.ts:13`).
2. Verificare assegnazione corrente tramite `isRagAuthorizedContextCurrent`, aggiungendo il confronto personale esplicito; l'helper attuale non riceve la persona attesa (`src/rag/authorized-context.ts:19`).
3. Consultare il proprietario Vault per quella connessione e persona. Ammettere solo connected con scope di lettura corrispondente: gmail→mail_read, gdrive/gdocs→drive_read, derivati dagli enum canonici. Stato assente, errore, scope insufficiente o identità non attestata impediscono il recupero; nessun fallback a `credential_ref` o a un token grezzo. Base: `src/http/endpoints/internal-vault-connection.ts:74`, `:78` e `SPEC:15`.
4. Filtrare l'indice prima del recupero con identità, corpus e ID sorgente autorizzati; applicare gli stessi controlli a cache, aperture e citazioni. Riconfermare la revisione presso l'autorità prima della consegna dei contenuti se la ricerca attraversa una revoca. L'assegnazione e la citazione qualificate esistenti sono condizioni aggiuntive, non sostituti (`src/rag/qualified-citation.ts:18`).

Il punto di linearizzazione della consegna rispetto alla revoca e l'invalidazione di richieste concorrenti devono essere implementati nei consumer: una risposta HTTP vecchia, un timestamp o un TTL non sono prova di stato corrente. Non promettere revoca immediata con una cache positiva a tempo. Un collegamento nuovo non può riattivare l'indice associato alla vecchia `connectionRef` (`SPEC:15`). La cancellazione fisica resta distinta; anche eventuali copie in Memory richiedono provenienza e blocco nel relativo percorso, non sono coperte automaticamente dal contratto RAG (`src/memory/write-candidate.ts:75`, `src/memory/delete.ts:28`).

## 4. Patch esatta proposta — Lotto G2b, 5 file su 5

Nomi e firme qui sotto sono una proposta di modifica al bridge, **non export già disponibili**. Nessuna modifica ai file di questa tabella è stata eseguita nel compito 164.

| File | Modifica prevista |
| --- | --- |
| `src/rag/google-source.ts` (nuovo) | Definire `RagGoogleSourceIdentitySchema` e tipo inferito come §2; derivare il provider Google RAG e la mappa scope dagli enum esistenti. Esportare `checkRagGoogleSourceAccess(source: unknown, expectedSource: unknown, context: unknown, currentAssignment: unknown, connectionEvidence: unknown, now: Date): RagGoogleSourceAccessResult`. Il risultato discriminato è `{ok:true}` oppure `{ok:false, code, reason}`: codici canonici Vault riusati, più identity_mismatch, assignment_denied e source_unavailable per i rispettivi casi, definiti qui una sola volta. Riutilizzare `isRagAuthorizedContextCurrent`; confrontare integralmente fonte attesa attestata, persona del principal, identità, corpus, riferimento connessione, mappatura agente e scope. Nessun I/O nel validatore: il consumer deve fornire evidenza corrente autenticata. |
| `src/rag/index.ts` | Esportare i nuovi schemi, tipi, mappa e validatore dal sotto-percorso rag, come già fatto per authorized-context a `src/rag/index.ts:146`. |
| `src/http/endpoints/internal-vault-connection.ts` | Aggiungere `VaultConnectionRefSchema`, `VaultConnectionAuthorizationRequestSchema`, `VaultConnectionAuthorizationResponseSchema`, tipi inferiti e `checkVaultConnectionAuthorizationContract`: POST proposto `/internal/vault/connections/:agentId/:provider/authorization`, auth secret, params canonici. Body strict `{identity: CapabilityPersonScope, agentContext: AgentContextIdentity, personRef, connectionRef}`. Successo strict `{ok:true, identity, agentContext, personRef, connectionRef, provider, status: ConnectStatus, scopes: ConnectScope[], authorizationRevision: string nonblank, observedAt: datetime}`; errore strict `{ok:false,error,reason}` riusa i codici Vault e aggiunge identity_mismatch/unavailable in uno schema canonico locale. Nessun token. Confronto parametrico agente/body a cura dell'handler autenticato e nei test di contratto. Non modificare le risposte legacy strict. Export HTTP già transitivo da `src/http/endpoints/index.ts:95`. |
| `tests/rag-google-source.test.ts` (nuovo) | Casi positivi separati Gmail/Drive/Docs; casi negativi e mutazioni della tabella successiva. Import dal barrel rag e controllo della firma pubblica. |
| `tests/http/endpoints/vault-connection-authorization.test.ts` (nuovo) | Schema richiesta/risposta, contratto, assenza di segreti, persona e riferimento obbligatori; import dal barrel HTTP. Test e mutazioni inclusi nel file, senza runner aggiuntivo. |

Direzione degli import: google-source può importare il contratto Vault; il modulo Vault deve dipendere solo dagli schemi identità/Connect, non da google-source, per evitare un ciclo nuovo. La mappatura al Vault usa `agentContext.identity.vaultAgentId`, non `managementAgentId` né il runtime ID (`src/agent/agent-context-identity.ts:7`). Il consumer compara la forma numerica serializzata con i params validati (`src/http/endpoints/internal-vault-connection.ts:23`).

### Prove e mutazioni da assegnare con il lotto

Ogni mutazione è una modifica temporanea del controllo di produzione, mai un indebolimento del test; deve produrre rosso per asserzione e poi verde dopo ripristino. Questa è una matrice prevista, non un conteggio di prove eseguite.

| Caso negativo | Mutazione da rilevare |
| --- | --- |
| Omettere ciascun identificativo, oppure fornire spazi/null | Rendere facoltativo il campo o rimuovere il controllo nonblank. |
| Sostituire a turno tenant, owner, runtime agent, user o personRef con un altro valore valido | Eliminare il corrispondente confronto fra chiamante, fonte e risposta Vault. |
| Stesso owner/agente, altra persona; principal senza person_id o con persona differente | Eliminare il confronto personale, oppure ripiegare su ownerId. |
| Vault ID diverso a parità di runtime o params diversi dal mapping attestato | Saltare il confronto del contesto agente. |
| Cambiare source_connection_id, connectionRef o corpus_id | Ignorare a turno il vincolo; vecchio indice dopo cambio account deve restare negato. |
| Assegnazione revocata/cambiata o contesto scaduto | Eliminare la chiamata al controllo corrente riusato; test preesistente di riferimento `tests/rag-authorized-context.test.ts:10`. |
| Fonte già indicizzata con Vault revoked/not_connected/needs_reconnect | Sostituire il controllo connected con accettazione incondizionata. |
| Consenso soltanto mail_draft/mail_send/calendar_events, o drive_read per Gmail | Rimuovere la verifica dello scope effettivo richiesto. |
| Evidenza assente, errore unavailable o istante futuro/non valido | Accettare per default oppure rimuovere i controlli temporali. |
| Campo accessToken/value aggiunto alla risposta non segreta; provider non Google o scope sconosciuto | Togliere strict o allargare gli schemi canonici. |

Nessuna prova puramente Zod dimostra la persistenza di Vault, il legame autenticato userId/personRef o la revoca durante una query in corso: questi richiedono test consumer con indice già popolato, revoca intercalata e nessuna consegna successiva. Il comportamento legacy da non confondere con questo requisito è documentato in `C1:12`, `C1:13`, `C1:14`; non è stato riesaminato dal vivo.

## Passaggio operativo e limiti

Il lotto sopra conta 5/5 file sorgente/test, non artefatti generati. Se il processo richiede `dist/` versionata, separare la rigenerazione in un micro-compito autorizzato e pubblicare solo dopo che sorgenti e generati sono allineati; non affermare che una build rientri automaticamente nel limite di cinque file. Nessuna build eseguita qui.

Dopo il bridge servono incarichi distinti: Vault deve persistere riferimento immutabile e legame personale, fornire verifica corrente e revoca coerenti; cap-connect deve attestare il consenso e la persona; cap-rag deve usare il nuovo schema in ingest, query, aperture e cache, oltre al contratto Python canonico; Forge deve creare la fonte personale. Il punto di creazione della sorgente non è attestato dalla ricognizione precedente (`C1:15`); non va inventato in questo bridge. Gli endpoint access-token esistenti rimangono riusabili ma non sostituiscono la verifica della specifica connessione (`src/http/endpoints/internal-vault-connection.ts:83`, `:89`).

Consegna: solo questo documento. Analisi statica effettuata; nessun test, mutazione, accettazione, typecheck o controllo dal vivo eseguito. Accettazione e tipi affidati allo script della corsia.
