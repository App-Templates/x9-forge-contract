# G2a — Impatto dei due nuovi scope sui consumer

Ricognizione statica del 15 ottobre 2026, compito 166. **Patch consumer necessarie.** Una mappa esaustiva rompe la compilazione dopo l'adozione del contratto esteso; altri percorsi restano compilabili ma non rendono disponibile la lettura personale Gmail/Drive. Nessun typecheck eseguito: «si rompe» indica una deduzione dal sorgente, condizionata al pin effettivo del bridge nuovo, non un errore di compilatore osservato.

## Perimetro e riferimenti

- `X9` = `/Users/admintemp/Downloads/Claude/agent-x9-codex-210-1`.
- `Forge` = `/Users/admintemp/Downloads/Claude/forge-v2-integ-prossimo`.
- `Bridge` = questo worktree. I percorsi nelle tabelle sono relativi alla radice indicata.
- Specifica letta: `X9/.planning/phases/conn01/SPEC-LETTURA-GOOGLE.md`, sezioni Proprietà della fonte, Scope minimi, Percorso utente e Dipendenze dal bridge. La scelta ricevuta nel mandato risolve la domanda storica sulla proprietà: fonte della PERSONA, non automaticamente dell'owner.
- Riutilizzati `Bridge/STATO.md` e `.planning/conn01-bridge/G2B-IDENTITA-FONTE.md`. Lo stato storico non attesta la versione installata nei consumer.

Ricerca con `rg` dei simboli `ConnectScope`, `VaultAccessScope`, `ConnectScopeSchema` (incluso `Record<ConnectScope`) nei due alberi `services`, quindi dei quattro scope preesistenti nei sorgenti TypeScript e nel web Forge. Ricerca supplementare dei percorsi connessioni e del flusso Google in cap-connect e cap-rag. I risultati sotto inventariano tutti gli usi dei simboli richiesti trovati nei servizi; i riferimenti ai test sono selettivi. Nessun file di credenziali, dipendenza installata o generato letto. Nessuna verifica dello SHA installato: il pin è un prerequisito da attestare nello specifico compito di integrazione.

Il bridge contiene già sei valori in `src/capability/connect/index.ts:10`, tipo inferito a `:13`. `src/http/endpoints/internal-vault-connection.ts:78` deriva `VaultAccessScopeSchema` escludendo a runtime soltanto `mail_send`; tipo a `:81`, richiesta a `:84`. La refine non è una nuova mappa Google e non va sostituita da un enum locale.

## Inventario: compilazione e comportamento

| Repo e percorso:riga | Uso e conseguenza dopo pin | Mappa Google / intervento |
| --- | --- | --- |
| X9 `services/cap-connect/src/app.ts:18,37-42,68` | Import e `GOOGLE_SCOPE: Record<ConnectScope, string>` con quattro chiavi. **Sì, rottura statica prevista:** mancano `mail_read` e `drive_read`. A runtime il ripiego `?? s` manderebbe il nome logico a Google. | Aggiungere le due traduzioni OAuth nella mappa proprietaria; non risolvere con cast, mappa parziale o ripiego. Lotto A. |
| X9 `services/cap-connect/src/connect-tool.ts:1,16` | Import e array dello schema canonico. Nessuna rottura prevista: accetta automaticamente i due nuovi valori. | Nessuna mappa; nessuna modifica necessaria al solo ampliamento. |
| X9 `services/cap-connect/src/manifest.ts:1,28` | Enum del manifest da `ConnectScopeSchema.options`. Nessuna rottura prevista; nuovi valori pubblicati automaticamente. | Nessuna duplicazione dell'enum. |
| X9 `services/cap-connect/src/permit.ts:5,33,41,86` | Import, array, parametro scope e controllo `includes`. Nessuna rottura prevista: non è uno switch esaustivo. | Nessuna mappa OAuth; mantenere la verifica di appartenenza. |
| Forge `services/vault/src/services/connection.service.ts:7,84,187,209,214` | Import `VaultAccessScope`, risultato tipizzato, richiesta e controllo sui permessi persistiti. Nessuna rottura prevista: nessun `Record` o switch sui quattro valori. Il token si ottiene solo se `env.scopes.includes(request.scope)`. | **Non aggiungere una seconda mappa Google qui.** Vault deve ricevere nomi logici realmente concessi; test lotto D. |
| Forge `services/vault/src/routes/agent-connections.routes.ts:3,19,22,84` | Import di schema/tipo, default a tre permessi, parsing canonico e inoltro. Nessuna rottura prevista: un array non deve coprire tutta l'unione. Le richieste esplicite dei nuovi scope saranno ammesse dopo pin. | Non aggiungerli ai default: lettura separata e inizialmente non selezionata. Nessuna mappa OAuth; test lotto D. |
| X9 `services/cap-connect/src/return-page.ts:10-16,29` | Switch su `string` con default. Nessuna rottura prevista; entrambi diventano «un permesso aggiuntivo». | Aggiungere etichette di lettura, non URL Google. Lotto B. |
| X9 `services/agent-core/src/channel/connection-card-delivery.ts:31-38` | `Record<string,string>` con calendario, contatti e invio (manca già bozza), ripiego al nome grezzo. Nessuna rottura prevista. | Etichette leggibili per lettura Gmail/Drive e bozza. Lotto C. |

Chiamanti a scope singolo non esaustivi: X9 `services/cap-calendar/src/tools/index.ts:45` usa `calendar_events`; `services/cap-contacts/src/tools/index.ts:56` usa `contacts_read`; `services/cap-email/src/tools/email-draft-create.ts:49` usa `mail_draft`. Nessuna rottura prevista e nessuna mappa aggiuntiva necessaria. Non trasformare il tool di bozza in lettura. `email_read` è anche un nome di tool distinto: le occorrenze di quel nome non dimostrano un consenso `mail_read`.

## Mappa e consenso effettivo: problema operativo già presente

Traduzioni richieste dalla specifica locale:

| Scope bridge | Scope OAuth Google |
| --- | --- |
| `mail_read` | `https://www.googleapis.com/auth/gmail.readonly` |
| `drive_read` | `https://www.googleapis.com/auth/drive.readonly` |

La stessa mappa deve servire al consenso in uscita e al riconoscimento dei permessi effettivamente concessi in ingresso. Non basta aggiungere due chiavi per chiudere il percorso:

1. `X9/services/cap-connect/src/google-client.ts:118` restituisce `splitScopes(res.body.scope)`: valori OAuth del fornitore, non nomi logici.
2. `services/cap-connect/src/connection-flow.ts:102,114` inoltra quegli stessi valori a Vault e al risultato. `services/cap-connect/src/vault-http-port.ts:111-112` li valida tramite il contratto canonico; gli URL OAuth non sono valori di `ConnectScopeSchema` e vengono rifiutati. Questo difetto precede i due nuovi scope e non è un errore TypeScript.
3. `services/cap-connect/src/connection-flow.ts:110` comunica invece `record.scopes` come concessi: sono i permessi richiesti, non una prova del consenso effettivo. Il consenso parziale richiede normalizzazione e controllo prima di persistenza, evento e pagina di ritorno.
4. Forge `services/vault/src/routes/connection.routes.ts:74,116-118` riusa parsing e richiesta canonici; `connection.service.ts:209` confronta i nomi logici. Convertire anche in Vault creerebbe due fonti di verità.

La patch dovrà mantenere una sola mappa nel modulo proprietario OAuth esistente e riusarla da app e flusso, importando il tipo dal bridge. Nessun helper nuovo necessario. Test con risposte Google realistiche: scope URL concessi, consenso parziale, permesso richiesto ma assente, scope non riconosciuto. Non attestare mai come concesso ciò che è soltanto richiesto; la gestione dei permessi precedenti validi deve essere verificata esplicitamente nel lotto consumer.

## Web Forge e cap-rag: lacune, non errori esaustivi

Nel `Forge/web/src` indicato la ricerca non trova nessun uso dei tipi/schemi richiesti né dei quattro scope. Non trova neppure `accountLabel`, `startConnection` o il percorso `connections/.../start`. `web/src/pages/agent/Vault.tsx:1-4` delega ad `AgentKeysTab`; `web/src/features/keys/AgentKeysTab.tsx:8` monta `KeysView`. `web/src/lib/api.ts:525-535` espone operazioni delle chiavi Vault, non avvio/stato/revoca delle connessioni Google. **Non è attestato un pannello connessioni in questo checkout.** Non c'è quindi una sua mappa esaustiva da riparare: occorre un incarico UI esplicito, senza presumere componenti di un altro ramo. Nessuna mappa OAuth deve stare nel browser.

cap-rag non presenta usi dei simboli cercati. `X9/services/cap-rag/src/cap_rag/sources/registry.py:22-25` registra già gdocs/gdrive/gmail; `sources/gmail.py:3` richiede un token con gmail.readonly. `worker/handlers.py:877,982` chiama ancora `resolve_credential(row["credential_ref"], row["agent_id"])`; `credential_resolver.py:32-35` risolve il riferimento a token grezzo. L'ampliamento TypeScript non migra questo percorso Python. Serve instradare Gmail a `mail_read` e Drive/Docs al permesso approvato, usando il contratto canonico Python e l'identità personale; niente secondo rinnovo token o seconda traduzione OAuth nel connettore. Identità della fonte e blocco del recupero dopo revoca restano dipendenze G2b, non risolte dalle due chiavi.

## Lotti consumer proposti, ciascuno entro cinque file

Sono incarichi futuri distinti; nessun file consumer è modificato qui. Pin e generati richiedono incarichi separati autorizzati e non sono nascosti nei conteggi.

| Lotto | File da autorizzare | Scopo e prova da richiedere |
| --- | --- | --- |
| A — X9 OAuth, 5/5 | `services/cap-connect/src/app.ts`; `services/cap-connect/src/google-client.ts`; `services/cap-connect/src/connection-flow.ts`; `services/cap-connect/src/app.test.ts`; `services/cap-connect/src/connection-flow.test.ts` | Centralizzare la mappa nel modulo OAuth esistente, tradurre entrambi i nuovi scope, usare i concessi reali. Prove URL di consenso e ritorno con URL OAuth/consenso parziale. Mutazioni: rimuovere ogni nuova voce; sostituire i concessi con i richiesti. |
| B — X9 ritorno, 2/5 | `services/cap-connect/src/return-page.ts`; `services/cap-connect/src/return-page.test.ts` | Etichette distinte per lettura Gmail e Drive; mutazione di ogni etichetta. |
| C — X9 scheda, 2/5 | `services/agent-core/src/channel/connection-card-delivery.ts`; `services/agent-core/src/channel/connection-card-delivery.test.ts` (test da creare se assente) | Etichette dei permessi; test che impedisca la visualizzazione dei nomi grezzi per i permessi supportati. |
| D — Forge regressioni, 2/5 | `services/vault/tests/conn01/connection-access-token.test.ts`; `services/vault/tests/conn01/agent-connections-start.test.ts` | Provare nuovi permessi espliciti, default invariati, rifiuto scope non concesso e `mail_send` al confine access-token. Nessuna modifica a `connection.service.ts` necessaria per il solo enum; identità personale in altro lotto. Mutazioni consumer del controllo `includes` e del parsing canonico. |
| E — Forge pannello, massimo 4/5 | `web/src/features/keys/AgentKeysTab.tsx`; `web/src/lib/api.ts`; `web/src/features/keys/GoogleConnectionsPanel.tsx` (nuovo, autorizzazione esplicita); `web/src/features/keys/GoogleConnectionsPanel.test.tsx` (nuovo) | Riutilizzare il punto UI esistente; selezioni distinte non preselezionate, richiesta esplicita e stato effettivo. Assegnare solo dopo disponibilità dei contratti canonici di pannello: le rotte locali non autorizzano a inventare endpoint condivisi. |

Per cap-rag non assegnare ora una patch «solo due scope»: prima chiudere G2b e la rappresentazione canonica Python. Punti già identificati per un successivo lotto di integrazione (massimo 3/5 file): `services/cap-rag/src/cap_rag/credential_resolver.py`, `services/cap-rag/src/cap_rag/worker/handlers.py` e un test vicino da nominare esplicitamente nel mandato. Questo lotto non coprirebbe da solo query, cache e revoca dell'indice: occorre la scomposizione G4 della specifica, senza dichiarare finita la lettura personale.

## Stato della consegna

Creato soltanto questo documento; nessun contratto o firma cambiato. Ricognizione statica, nessun test o mutazione eseguito, nessuna compilazione o prova dal vivo. Accettazione e tipi affidati allo script come richiesto. Il blocco certo per struttura del sorgente è la mappa di cap-connect; consenso effettivo, pannello assente e migrazione cap-rag sono lacune funzionali separate.
