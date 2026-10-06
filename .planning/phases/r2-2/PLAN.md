# R2-2 — pausa dei canali e replay della creazione

Autore Codex C, branch codex/r2-2, worktree43-1. Base iniziale515f84b, aggiornata dalla coordinatrice a897258d dopo BRIDGE131 APPROVE (C non ha fatto merge). VIA01:00/01:31; perimetro src/agent/**,src/http/endpoints/**,tests/**,.planning/phases/r2-2/**. Ultimo aggiornamento07/10 01:42.

## Scopo e riuso

Due canali di nascita, Telegram/email: intenzione active/paused distinta dalla versione applicata e dall'osservazione runtime. Pausa non cancella risorsa o configurazione; desiderata ma non ancora applicata non dichiara il canale fermo. Risorsa pubblica appartiene allo scope completo tenant/owner/agente e all'identità canonica; nessun token/valore nel job o nei descrittori. Errori solo codici fissi e retryability derivata, mai stringhe esterne.

Riuso: ChannelType e AgentRuntimeChannel/Readiness, AgentRuntimeIdentity, CapabilityAgentScope/sameCapabilityScope, AgentConfigVersion e AgentManagementRequestId; metadata pubblici da AgentTelegramBot/AgentEmailInbox. Nessuna copia del vocabolario canonico. Nuovi stati desiderati e checkpoint sono contratto additivo, non il vecchio runtimeStatus.

Esiste il contratto internalFactoryDeploy, non uno di job/replay. Il nuovo request usa i suoi campi non segreti; esclude il token diretto, owner/flag legacy sostituiti dallo scope e dalle due intenzioni esplicite. Lo schema vecchio non cambia. Il confronto idempotente considera tutti i campi normalizzati della richiesta, non un digest fidato dal client. Replay/resume restituisce lo stesso checkpoint/job/agente/risorse; conflitto se qualunque parte dell'intento cambia. Lookup e persistenza atomici, chiave partizionata dall'identità autenticata, competono al producer.

## File previsti (solo nuovi + append export)

- src/agent/agent-channel-configuration.ts: stati desiderato/applicato, resource descriptor, errori, helper di applicazione e di ammissione, estensione opzionale del context.
- src/agent/agent-creation-replay.ts: request additivo, checkpoint e risultato/disposizione replay che conserva lo stesso job. Pronto richiede un primo controllo su canale realmente caricato e tutte le pause/attivazioni applicate.
- src/http/endpoints/internal-factory-creation.ts: forma opt-in replayable del contratto deploy S2S esistente, medesimo percorso/auth; nessun nuovo endpoint runtime o modifica al vecchio contratto. Nessuna promessa che il producer1.30 legga già i nuovi campi.
- Append sole esportazioni in agent/index.ts e http/endpoints/index.ts.
- tests/agent/r2-channel-configuration.test.ts, tests/agent/r2-creation-replay.test.ts, tests/compat/r2-compat.test.ts; prove nella fase.

## Passi / controlli da rompere

1. Test prima del codice, conservando il rosso preparatorio (export assenti non accreditati come mutazioni).
2. Canali: forma stretta/assenza credenziali, scope e resource agent_id, kind, versioni applicate non avanti, stato coerente sulla stessa versione, intenzione in attesa, osservazione coerente e datata; resource conservata anche in pausa; errore/retryability fissi; ammissione fail-closed se nuova configurazione malformata.
3. Context: legacy assente compatibile; configurazione presente legata ad agent/owner/tenant; doppio canale rifiutato; writer conserva la guardia delle chiavi interne originale.
4. Creazione: schema non segreto; idempotencyKey obbligatoria, scope/identity/slug coerenti, checkpoint senza risorse estranee/doppie o diversa intenzione; completed richiede id DB, due canali applicati e primo check reale; incomplete/running non fingono successo.
5. Replay: nuova richiesta ammessa solo senza checkpoint; stesso intento ritorna lo stesso checkpoint (anche incompleto), modifiche a chiave/scope/template/config/versione/canali/parametri sono conflitto; ordine delle proprietà irrilevante; differenze nelle liste restano intenzioni diverse. Nessuna seconda risorsa costruita dall'helper.
6. Mutazione per ogni controllo nuovo, sola asserzione rossa; ripristino SHA e verde. Nessun import/runtime/timeout accreditato. Elenco nominativo e denominatori in evidence/.
7. Build/typecheck/lint/check:pack, suite completa1worker e CJS. Compatibilità base130: moduli/vecchi payload invariati, export ESM/CJS nuovi e vecchi. Perimetro/hash protetti e diff prodotto.
8. Commit atomico prodotto/test + commit SUMMARY/evidenze; rileggere PLAN/SUMMARY dopo ogni commit; CONSEGNATO con SHA, altro Codex per revisione.

## Limiti

Solo contratti e helper puri: no producer/consumer, provisioning/provider reale, credenziali, .env, browser, Meditation, release/versione/CHANGELOG/push/merge/deploy. Il job pronto è una forma verificabile, non una prova live. I producer devono attestare canali configurati/fonte fresca e controllare l'autorizzazione da contesto autenticato prima del lookup; non possono usare questo lotto per saltare i gate B1/R2-3.

Tempo task45min: checkpoint01:34, pausa per verifica897 fino01:39; codice ora, un comando pesante per volta.
