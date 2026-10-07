# BRIDGE-138 — explicit Forge vault identity

Prodotto 721dfa4ef2c4e6c21bee052f61dcb6ec662d74d2. Forge può scrivere identity.vaultAgentId nello stesso salvataggio della voce: intero positivo opzionale, diverso dagli slug gestione/runtime. Il reader pubblico vaultAgentIdOf legge solo identity.vaultAgentId e restituisce null se assente, senza conversioni/cache/fallback a canali o altri agenti. I contesti legacy1.37 restano identici. Export wildcard del solo sub-path agent riusato: nessuna modifica agli index, versione o CHANGELOG.

Prima **0/81,81/81AssertionError** sul contratto137; dopo **81/81**,0pending. **15/15mutazioni,81/81nomi,2/2SHA**,ogni ripristino81/81 e finale81/81 (01/02stdout+JSON+recipe). Campo trattenuto, dominio numerico/noncoercizione/intero/positivo/opzionale, helperroot/null/nofallback/pubblico/fresco. Nessun TypeError/ZodError/0test/timeout qualificato.

Qualità: tipi/lint native2/2 exit0; tipi/build/checkpack originali nel privato3/3 exit0; **394/394input identici**, nessun alias o tsconfig modificato. **Full2325/2325**,0fail/0pending,base2244+81nuovi; smokeCJSesistente exit0. Profilo checkpack originale invariato. Builddist soltanto privata, perimetro source invariato. Consumer pubblico compilato e controlli finali ora completati nel lotto seguente. Nessuna lettura di segreti, no push/merge/publish/deploy/server/provider/live.

| Controllo | oggi → dopo | verificato da |
|---|---|---|
| id Vault | assente → intero positivo esplicito opzionale | 5schemi×14casi,70/70 |
| selettore pubblico | assente → identity.vaultAgentId/null | 11/11helper e15/15mutazioni |
| legacy137 | schema precedente → stessi byte/payload accettati | 5/5assenza + full2325/2325 |
| uso in post-call X9 | conversione legacy → ancora da collegare dopo rilascio138 | non ancora verificato |

## Consumer e consegna — 10:35

Installato il vero archivio pnpm del build in un consumer separato: **1192/1192file compilati identici**, dipendenza da tarball (non symlink al source), normale risoluzione @x9-forge/contracts/agent verificata prima di accreditare i casi. **12/12CJS**, **15/15mutazioni compilate**,12/12nomi,2/2SHA ripristinati e tutti restore12/12. Campagna distinta da15/15source, non sommata. CTS strict normale: exit0 → rimozione delnull dal tipo dà **TS2322** → ripristino exit0; bytes CTS identici. Smoke preesistenti36/36+6/6+15/15.

Integrità: **2618/2618file protetti immutati**,211/211file nel perimetro al primo snapshot;4/4probe fuori zona rifiutate, agent/rootindex eworkspaceD unchanged. Perimetro finale ricontrollato dopo aggiuntaPROOF. Nessuna builddist nelworktree, nessun package/CHANGELOG/hook/test precedenti modificato. L'export root menzionato nel SUMMARY intermedio era impreciso: il root espone model-router; il nuovo helper è nel sub-path agent richiesto dal piano e gli index restano immutati. Prove complete inPROOF.json e recipe/stdout/JSON della fase.

**Implementato e testato localmente, PRONTO PER REVISIONE.** Rilascio1.38 e integrazione spettano alla coordinatrice dopo revisore diverso. Post-call X9 ancora non collegato; R4-2 riprende nel50-1 dopo il rilascio senza usare source alias o campi scritti a mano. Nessun push/merge/publish/deploy/provider/live.
