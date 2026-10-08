# BRIDGE-IDENTITA-AGENTE — identità unica del contesto

Codex D, 2026-10-08T14:42:44.052778+02:00→2026-10-08T15:27:44.052778+02:00, massimo45min/3repair. Mandato coor143238 dopo FORGE-IDENTITA-CONTESTI; worktree128-1 codex/bridge-identita-agente, base origin/main1.43 a251bbc9451381a67afa10f330fa5a3b501e8ba4. M3 chiuso a checkpointd1d016d3, nessuna modifica prodottoJC. Letti STATO e piano precedenteM3B, nessunAGENTS locale. Piano prima del codice; perimetro applicativo attende concessione esplicita.

## Risultato e R-31

Una sola autorità Forge per agentId/ownerId/tenantId, identity management/runtime/Vault, role master|erede e masterAgentId per erede. Campo role è radice del contesto; masterAgentId identifica il RUNTIME Master, non il numero Vault o lo slug management. agentId deve uguagliare identity.runtimeAgentId. management/runtime possono differire per il primario. vaultAgentId obbligatorio intero positivo; nessuna derivazione numerica da slug. tenantId obbligatorio nonvuoto, nessun default. Master vieta masterAgentId, erede lo richiede e non può riferirsi ai propri runtime/management ID. Lo schema attesta la dichiarazione fornita da Forge: appartenenza effettiva del Master allo stesso owner/tenant richiede riscontro del contesto Master nel consumer, non può essere dedotta da questo singolo payload.

API proposta nel subpath pubblico @x9-forge/contracts/agent:
- AgentContextIdentitySchema e AgentContextIdentity: discriminante role con campi sopra, strict per authority payload e identity nested.
- createAgentContextIdentity(input: AgentContextIdentityInput): costruzione/validazione unica, input tipato richiede tutte le autorità, restituisce copia detached. Schema e funzione riusano gli stessi controlli, nessun DTO locale crossrepo.
- AgentContextWithIdentitySchema e AgentContextWithIdentityWriteSchema, tipi corrispondenti: contesto completo moderno con identity/tenant/role/master obbligatori secondo ramo. Riusano i guard canonici WithChannels e writer no-platform-credentials, conservando workspace/modelConfiguration e altri campi runtime passthrough.

Schema/lettori storici restano identici, senza nuovi default o migrazione implicita. Il nuovo writer e i consumer moderni adottano il contratto obbligatorio dopo rilascio normale; il solo bridge non rende obbligatori retroattivamente i writer legacy. Forge pagina/nascita interna/Applica e X9/M3 sono lotti consumer successivi assegnati dalla coordinatrice, un repo alla volta. Codex A usa queste esportazioni dopo release/pin della coordinatrice, non copie/merge propri. Nessun token personale nel contratto, niente provider/lifecycle/ready dal solo ruolo.

## File esatti proposti

1. src/agent/agent-context-identity.ts (nuovo): schema/funzione unica e contesti moderni reader/writer.
2. src/agent/index.ts: sole esportazioni nuove.
3. tests/agent/bridge-identita-agente.test.ts (nuovo): runtime source, clone, guardie e compat.
4. .planning/phases/bridge-identita-agente/**: PLAN/SUMMARY/proof/ricette/testconsumer statico.

Nessun src/agent/agent-context-core.ts, schema legacy, runtime-identity legacy, model-router, canali callback diA, vecchi test, dist/package/versione/lock modificato. Build ESM/CJS/dts e consumer nel checkout privato; dist derivato non copiato nel worktree autore come nel lottoM3B. Se servono altri file, richiesta prima modifica.

## Test prima, mutazioni e verifica

Prove su entrypoint pubblico: master/erede e primario con mapping diverso; campi mancanti/null/blank; Vault zero/negativo/frazionario/numericstring; role sconosciuto; Master conparent/erede senza parent/self; correlazione runtime; nessuna inferenza dal Wanted/credenziali/canali; ownerA/B e tenant distinti; clone non altera input; moderne reader/writer conservano tutti campi extra e i guard channel ownership/no-platform-credentials; legacy parse byte-equivalente. Nuovi controlli rotti semanticamente con AssertionError e SHA/green dopo ciascun ripristino; niente import/type/setup/timeout accreditato.

Qualifica completa Vitest nativa env-i HOME/PATH Node24 worker1, tipi/lint/build/dts/pack/CJS storici e probe ESM/CJS nuovi, controllo compile input obbligatorio e discriminator master/erede con negative @ts-expect-error. Fault separato export compilato, poi ripristino fresh. Audit perimetro/protetti/vecchi test/package/versione/lock/zero deletion, SHA input e dist build privati. Posto x9-posti tentato, se3/3esauriti niente full finché disponibile; permesso fallbackswap solo se motivo èswap. Una verifica pesante perCodex. Nessunsegretoreale/harness/runtime/server/push/merge/publish/deploy.

Dopo prodotto commit atomico normale, SUMMARY/PLAN subito aggiornati+commit/rilettura, congelamento e verifica indipendente. Deadline/3repair rispettati; eventuali residui SALTATO separati, non proroga autonoma. Ultimo aggiornamento:14:42.

## Preparazione e attesa perimetro — 08/10 14:51

Piano c9da0f3 committato e riletto; richiesta di file esatti 20261008-144334-codex-d-a-coordinatrice-richiesta-perimetro. Perimetro ancora solo documentazione: nessuna nuova app/source o test nel worktree autore. Draft privati runtime guard/consumer TS obbligatorietà/probe ESM+CJS pronti in /private/tmp/d-bridge-identita-agente-20261008/drafts; SHA in PREPARATION.json, NON eseguiti né qualificati. Semaforo rifiuta3/3occupati, non soglia swap; full/mut in coda. Blocco qualifica distinto notificato alla coordinatrice144925, senza richiesta duplicata.

Copia privata3096input pubblici da worktree Git; audit preparatorio3093protetti+253vecchi test invariati,4/4fault sintetici di mappa rilevati (oldtest/deletion/perimetro/manifest). Sono verifiche del runner prima delle modifiche, NON audit finale né prova del nuovo prodotto. Nessuna build/full/mut nuovo contratto o consumer effettivo, nessun testverde di prodotto annunciato. M3 congelato d1d016d3. Timer14:42:44→15:27:44 immutato; ripresa applicativa solo dopo apertura perimetro. Ultimo aggiornamento:14:51.

## Checkpoint applicativo autorizzato — 08/10 15:15

Prodotto8a7aac014732775fcaeddecc110ebfe36f215b8b, commit dei mirati verdi esplicitamente richiesto dalla coordinatrice151322 durante attesa del posto. API approvata150018: AgentContextIdentitySchema/createAgentContextIdentity e reader/writer moderni; ruolo master|erede, Vault positivo obbligatorio, runtime===agentId, parent runtime solo erede/nonself. Fonte Forge dichiarativa, Master esistente/stessoowner/tenant da verificare nel consumer; nessundefault/Wanted/keyinference, legacy reader identici. Treapp+16artifactdist cambiati; dist/** aperto150018, 1344/1344artifact qualifica privata copiati esatti,336dts portabili. Package/versione/lock invariati,0filedeleted.

173/173nuovi mirati/1file,qualità7/7 tipi/lint/build/nuovitipi/CJS/ESM-CJS/pack. CJSstorici112/112,nuovi18/18;2/2fault compilati separati produconoAssertionError con18/18freshognirestore eSHA2identici.5/5chiamate incomplete rifiutate dal compilatore (5diagnostici reali togliendo direttive negative),ripristinoexit0; sono prove statiche, NONAssertionError runtime. Prima131Assertion tecnici/173,42green,0pending: ESCLUSO1BI14fixturechiaveNONinlista interna,130validi; cambiata solo fixture a TELEGRAM_SESSION_STRING,173finali suSHAfinale. PrimoVitecacheEPERM e packcacheEPERM esclusi, cacheprivate corrette senza cambiare codice/configsuite/profilopack.

Auditcheckpoint3appSHA/1344distSHA,1757protetti fuori dist+253oldtest invariati;nessuna modifica vecchi test o altri moduli. CHECKPOINT-PROOF e ricette25mutazioni durevoli. Full e25campagna sorgente ancora NONeseguiti: checkpoint implementato/testato mirato, qualifica completa incompleta, NON PRONTOREVISIONE completo néconsumer/Forge/X9/live/rilascio.

Posto finalmente preso15:15 comeCodexD-BridgeIdentita(scade15:25:28), dopo decisione151420; prossimi fullnativoenv-i Node24 worker1 poi25mut su3SHAfinali, uncomando pesantealla volta. Deadlineoriginaria15:27:44immutata,nessunaprorogaautonoma. Ultimo aggiornamento:15:15.
