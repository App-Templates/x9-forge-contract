# S1 — gap dei contratti delle sessioni (16/10/2026)

## Ricostruzione del formato 13/10 dai riferimenti v2
- Fonte canonica: `src/capability/dev/signed-command.ts`, `DevSignedCommandV2Schema`.
- Identità firmata: tenantId, ownerId, agentId; contesto: boardId, computerId,
  projectId, issueId. Comandi: status, plan, start, stop, report.
- Correlazione e anti-replay: requestId non vuoto, nonce minimo 16 caratteri,
  expiresAt ISO; verifica della firma e consumo del nonce spettano ai consumer.
- version=2, domain=x9.cap-dev.command, configVersion>=0, keyVersion>=1.
- reportDigest: 64 cifre esadecimali oppure null (default null).
- Canonicalizzazione: JSON compatto con chiavi ordinate; tutti i campi restano firmati.
- `dev/config-state.ts`: configurazione per tenant/owner/agent, boardId,
  versioni, bindings computerId/projectId/pathLabel/addedAt e stato applicato.
  Lo stato comprende ready/applied/pending/offline/revoked, versione e lastSeenAt.

## Modello additivo 16/10
- S1 introduce DevelopmentSessionBinding: scope canonico tenant/owner/agent,
  sessionId, target e engines. Nessuna nuova definizione di incarico o esito.
- Locale/cloud è indipendente dai motori claude/codex: 2 x 3 = 6 combinazioni.
- Locale: solo kind e DeviceId canonico; cloud: solo kind e connectionRef non vuoto.
  connectionRef è un riferimento pubblico, non un URL operativo o una credenziale.
- Oggetti strict e motori senza duplicati (1..2); ConnectProvider resta OAuth Google.
- Binding configurato non significa sessione online, firma verificata o esecuzione permessa.
- Raccomandazione: dispositivo locale con connessione in uscita; nessuna porta,
  shell o comando remoto nel formato. Passkey e autorizzazione restano altri domini.
- v2 resta canonico per il percorso storico; nuovi domini solo additivi.

## Mappa 191–198 e passaggio
- 191: S1, identità e scelta sessioni; questo contratto, test e mutazioni.
- 192–198: lotti successivi della corsia; i singoli titoli non sono disponibili
  nei riferimenti presenti in questo worktree. Non se ne inventa l'assegnazione.
- S2–S5: consumer ancora da implementare, inclusi pannello Connessioni,
  cap-dev, collegamento/presenza effettiva, approvazione passkey e restituzione
  del risultato. Il compito 191 non stabilisce nuove firme o rotte per questi lotti.
- Piano indicato dal mandato: CAPDEV-SESSIONI-NIGHT-1610, S1; non presente qui.
  STATO.md locale è storico (06/10): non prova l'avanzamento del piano 16/10.
- Nessun recupero di 169–172, 177, 178 o prove 182/184.
- Dist e pin esclusi: i soli sorgenti nuovi non rendono il pacchetto disponibile
  ai consumer; distribuzione e verifica dal vivo alla sessione autorizzata.
- Accettazione completa, tipi e protocollo mutazioni affidati al banco della corsia.
