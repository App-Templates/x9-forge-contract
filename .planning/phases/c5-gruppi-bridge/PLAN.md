# C5-GRUPPI — B0d contratto eliminazione definitiva

08/10/2026,20:09–20:54/max45min o3tentativi implementazione. Worktree145-1, branchcodex/c5-gruppi-bridge, baseae7c464 (27749e4 più distF). Perimetro194839: soltanto nuovi agent-deletion/endpoints/tests/planning, due export append, README append. Dist build locale consentita ma NON committata; package/version/lock invariati, consolidamento1.45 e dist aF. Forge136-1 congelato HEADb87fc9f4; X9 nessuna scrittura.

## Fruibilità (R-34)

1. Stefano vuole Apri/Archivia/Elimina definitivamente, archivio+ripristino e report per pezzo; Master protetto, nome forte, niente container condiviso. Questo lotto crea solo il confine canonico Forge→X9, non quelle azioni complete.
2. Catena: UI e Factory autorizzano owner/SA, verificano nome esatto/identità corrente/Master anche sotto gara, salvano job0014; chiamano bridge POST interno; X9 blocca nuove ammissioni e resurrezione durevole, drena turni, chiude canali del singolo, rimuove runtime/caches/context/workspace/stato privato; Factory completa risorse proprie e conserva eventuale report parziale. Non tocca chiavi/memoria/file del proprietario, altri agenti o il processo condiviso.
3. Mancano producer X9, consumer Forge, migrazione0014/job/audit/UI CG7 e integrazione. File X9 esistenti manager/management/turn/index esclusi finchéX3D integrato. Nessuna promessa di100% da questo contratto e nessuna rimozione reale nel lotto.
4. Prova: schemi e metadati endpoint pubblici, richiesta/risposta correlate,8pezzi obbligatori unici, fallimento non occultabile, tombstone prima effetti, blocchi dipendenze, report senza path/token/detail liberi; replay durevole/guardie operative sono responsabilità dei consumer e saranno testate lì. Test nativi, rossi funzionali prima prodotto, mutazioni per controllo, CJS reale Node20/24 disponibili, tipi/build/lint/pack e fullsuite. Nessun server/prod.

## Forma e semantica

AgentDeletionCommand: requestId canonico AgentManagementRequestIdSchema, identity canonica AgentRuntimeIdentitySchema stretta con IDs validati da ReloadAgentParamsSchema, confirmedName esatto e non normalizzato. Endpoint POST /internal/agents/:agentId/deletion authType secret, params canonici; solo managementID indirizzato (helper di correlazione obbligatorio), runtimeID mai usato come fallback. Conferma confrontata con nome autorevole Factory; X9 verifica mapping e tutela primario autonomamente. Non si mette un ruolo utente nel body.

8passi: tombstone, admission, channels, runtime, caches, context, workspace, private-state. Esito completed/absent/failed/blocked con codici enum sanitizzati soltanto sui fallimenti/blocchi; complete deriva da tutti gli8conclusi e tombstonecompleted. Tombstonefailed blocca ogni effetto; admissionfailed blocca passaggi successivi; channels/runtime non conclusi bloccano caches e cancellazioni durevoli. Tombstone conserva identità/requestId/fingerprint/progresso e impedisce start/reload/apply/load anche dopo restart; non viene cancellato come private-state. Private-state comprende soltanto stato scoped del runtime (sessioni/history/retained/versioni/cache dei receipt lifecycle), non job/tombstone di eliminazione e non memoria owner.

Stessa requestId+body: riprende solo passi non conclusi, risponde replayedtrue; diversa intenzione/mapping/nome con stessa chiave409idempotency_conflict. Stato incompleto restituisce200partial con tutti8pezzi, maicomplete dal solo stop. Errori non processati: invalid_request, agent_not_found, protected_agent, confirmation_mismatch, identity_mismatch, idempotency_conflict, command_in_progress, source_unavailable. Validazione non attesta effetti: producer persiste progressi prima/dopo ogni effetto, consumer usa isAgentDeletionResultCurrent prima di accettare risposta.

## Sequenza

Scrivere test prima; baseline nuovi simboli assenti => asserzioni rosse (namespace import, nessun errore import counted). Implementare una correzione, test; qualifica mutazioni con restore SHA esatto; build locale/CJS/typecheck/lint/pack/full. SUMMARY con denominatori, rossi/mutazioni e limiti. Consegna SOLO B0d per revisione indipendente; poi consumer solo da contratto rilasciato/base autorizzata.

## Checkpoint20:35

Source B0d implementato,85/85nuovi,4300/4300full154file;45/48candidati sorgente (3ridondanti non contati),5/5compilati,restoreSHA;build362/362dts e7/7quality0. Primo giro namespace testblindspot corretto senza cambiare implementazione; dettaglio SUMMARY/PROOF. Dist locale provata e poi ripristinata alla base prima del congelamento; copia completa compilata nelle prove temporanee. Revisione indipendente e consolidamento1.45 prima dei consumer. Nessuna azione reale.
