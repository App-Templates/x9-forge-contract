# Review incrementale indipendente 34-02 e 34-03

**34-02: VERIFICATION PASSED, solo bundle canonico NETATMO_EMAIL e build bridge.**

**34-03: VERIFICATION PASSED, nella revisione che include i due collegamenti UI.**

Questa review comprende soltanto i due piani privati indicati. 34-02 riguarda il bridge180, 34-03 Forge178. Non è un'approvazione dell'intera fase 34 né di consumer/runtime, provider-save o prove live. Il gate valid-only rimane invariato.

Il validatore GSD rileva task completi 2/2 per ciascun piano. 34-02: 5 file, wave1 indipendente; 34-03 revisionato: 8 file, wave2 dopo 34-01, dipendenza valida. Entrambi richiedono red prima del fix, tagli per famiglie di comportamento, restore esatto e commit locali atomici mediante il contratto comune. I config test privati bridge/web sono da generare secondo quel contratto, con envDir:false, prima dei comandi; non esiste ancora evidenza di esecuzione. Nyquist formale SKIPPED per configurazione esplicita false, verifica automatica prevista in tutti i task.

## 34-02 approvato nel proprio perimetro

NETATMO_EMAIL è la sola aggiunta autorizzata: kind credential, secret:false, servizio Netatmo. Test positivi e negativi mantengono classificazioni e catchall, con denominatore derivato dagli export dopo l'aggiunta. Il piano qualifica source, ESM/CJS effettivi, dichiarazioni portabili e pacchetto locale, senza pubblicare né inventare SHA remoti. I test sono collegati ai contratti canonici; nessuno schema condiviso viene riscritto a valle. Nessun problema bloccante rilevato.

## 34-03 rilievi risolti nella revisione riletta

1. **Sezione ordinaria unknown/unclassified non collegata.** Il task1 modifica soltanto catalog-service-model e test, ma `/Users/admintemp/Downloads/Claude/forge-v2-codex-178-1/web/src/features/keys/ServiceKeysView.tsx:166` mostra oggi soltanto nomi degli agenti e rimanda il dettaglio ad Avanzate. Il contratto UI richiede nella vista ordinaria ogni nome autorizzato e una spiegazione della gestione non disponibile, senza azioni unsafe. Includere ServiceKeysView (o componente nativo equivalente) nei file/task e testare il DOM ordinario con nome chiave, agente, motivo e assenza di azioni. Il modello che conserva unclassified da solo non realizza tale risultato.

2. **Stato failed per riga senza sorgente dell'esito.** ServiceKeyTable riceve soltanto la mappa; gli esiti reali sono nel controller useCredentialLinks creato dentro InlineCredentialActions e nel masterResult di ServiceKeysView. Il task2 promette failed/stale/late nella cella Sincronizzazione ma i file previsti non collegano queste sorgenti alla tabella. Includere esplicitamente callback/receipt source+version dalla vera azione nativa inline e Master verso la riga, con invalidazione per fonte/versione/ambito e test attraverso azioni raggiungibili. Non fare deduzioni di errore da appliedVersion arretrata e non aggiungere richieste per ogni riga. Nessun cambiamento all'autorità writer/reload del backend.

**Entrambi risolti:** task1 e files_modified includono ora ServiceKeysView e il rendering ordinario autorizzato per key/agente/motivo senza azioni unsafe. Task2 e files_modified includono InlineCredentialActions e ServiceKeysView con percorso receipt nativo→tabella condiviso fra azioni inline e Master; cattura source/version, cleanup scope e ignorare late/stale sono espliciti. I test richiesti passano attraverso failed rotate-own, partial Master, retry e completamento tardivo della vera pagina, oltre ai test modello. L'esecuzione deve verificare il DOM unknown/unavailable nella suite React già compresa nel task2; il test catalogo unitario da solo non costituisce tale prova.

## Delta successivo 34-03: credenziali dinamiche attestate

Riletta la nuova guardia Inventory completeness all'inizio dei task. **Verdetto scoped 34-03 confermato PASSED.** Il produttore con manifest autorevole può classificare `credential` una chiave dinamica senza brand metadata; la sola assenza dal catalogo commerciale non deve retrocederla a unknown. Il piano conserva servizio/etichetta attestati, segretezza conservativa, scope e azioni native autorizzate. Richiede prova DOM di azioni per DYNAMIC_CONNECTOR_TOKEN attestato e controllo opposto per il medesimo nome classificato unknown, privo di azioni unsafe. Si applicano il protocollo comune red/green, taglio causale e restore anche a questa nuova famiglia di comportamento.

La guardia completa CHIAVI-01/02 senza introdurre una nuova lista statica o promuovere un unknown dal nome. Rimangono valide le esclusioni internal/settings già esplicitate nei task e la protezione unavailable. Nessuna nuova dipendenza o file oltre agli 8 dichiarati. Questa approvazione riguarda il piano, non attesta implementazione o test dinamici già riusciti.

```yaml
status:
  '34-02': PASSED
  '34-03': PASSED
full_phase_coverage: NOT_REVIEWED
implementation_tests_live: NOT_EXECUTED
resolved_issues: 2
blocking_issues: 0
warnings: 0
issues: []
```

Letti piani, contratto comune, contesto/UI-SPEC/review approvata, codice e test pertinenti di catalogo/tabella/link, azioni/controller e contratti/build bridge. AGENTS.md e skills locali non presenti nelle radici controllate; valgono le regole globali utente. Nessun test eseguito, nessun prodotto modificato, nessun segreto/env/`~/.claude` o sistema reale letto.
