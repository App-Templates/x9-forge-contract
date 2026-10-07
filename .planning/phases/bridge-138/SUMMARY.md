# BRIDGE-138 — explicit Forge vault identity

Prodotto 721dfa4ef2c4e6c21bee052f61dcb6ec662d74d2. Forge può scrivere identity.vaultAgentId nello stesso salvataggio della voce: intero positivo opzionale, diverso dagli slug gestione/runtime. Il reader pubblico vaultAgentIdOf legge solo identity.vaultAgentId e restituisce null se assente, senza conversioni/cache/fallback a canali o altri agenti. I contesti legacy1.37 restano identici. Existing wildcard agent/root export riusati: nessuna modifica agli index, versione o CHANGELOG.

Prima **0/81,81/81AssertionError** sul contratto137; dopo **81/81**,0pending. **15/15mutazioni,81/81nomi,2/2SHA**,ogni ripristino81/81 e finale81/81 (01/02stdout+JSON+recipe). Campo trattenuto, dominio numerico/noncoercizione/intero/positivo/opzionale, helperroot/null/nofallback/pubblico/fresco. Nessun TypeError/ZodError/0test/timeout qualificato.

Qualità: tipi/lint native2/2 exit0; tipi/build/checkpack originali nel privato3/3 exit0; **394/394input identici**, nessun alias o tsconfig modificato. **Full2325/2325**,0fail/0pending,base2244+81nuovi; smokeCJSesistente exit0. Profilo checkpack originale invariato. Builddist soltanto privata, perimetro source invariato. Consumer pubblico compilato indipendente/CTS/mutazioni compiled e integrityfinale ancora in corso: non CONSEGNATO fino alle prove. Nessuna lettura di segreti, no push/merge/publish/deploy/server/provider/live.

| Controllo | oggi → dopo | verificato da |
|---|---|---|
| id Vault | assente → intero positivo esplicito opzionale | 5schemi×14casi,70/70 |
| selettore pubblico | assente → identity.vaultAgentId/null | 11/11helper e15/15mutazioni |
| legacy137 | schema precedente → stessi byte/payload accettati | 5/5assenza + full2325/2325 |
| uso in post-call X9 | conversione legacy → ancora da collegare dopo rilascio138 | non ancora verificato |
