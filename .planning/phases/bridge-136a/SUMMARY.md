# BRIDGE-136a — identità voce canonica

Ultimo aggiornamento: 09:39. Prodotto `ab1c5a8`, base `5ddc97b` (1.36), rilascio 1.37 a cura della coordinatrice.

Corretto il difetto di BRIDGE-134: l’identità opzionale riusa AgentRuntimeIdentitySchema; runtime legato al contesto, voce legata alla gestione. Canali discordanti o in conflitto con identity rifiutati. Helper pubblico managementAgentIdOf restituisce null senza identity/canali; la compatibilità dei contesti 1.34 non inventa una fonte di gestione. Modificato solo agent-channel-configuration.ts; l’export wildcard già presente rende il helper pubblico, agent/index.ts e workspace di D intatti.

Test scritto prima del prodotto: bridge137-voice-identity.test.ts, 92 casi su reader/writer con canali e con workspace. Prima: 24/92 passano, 68/92 falliscono con AssertionError reale; dopo: 92/92, nessun pending. Evidenze 01-red/green ed exit JSON. Prima sonda con denominatore 96 invece di 92 conservata come diagnostica ed esclusa.

Mutazioni finali: 14/14 rilevate con AssertionError, 92/92 nomi colpiti, un SHA sorgente ripristinato byte per byte dopo ciascuna; ogni restauro 92/92. La prima campagna 13/13 copriva 88/92 nomi: esclusa come campagna finale, aggiunta mutazione dell’ammissione di identity valida e ripetuto tutto; non sommate. Manifesto 02-mutation-manifest.json.

Controlli originali: tipi/lint del worktree 2/2; copia privata esatta 393/393 input, typecheck/build/check:pack 3/3; CJS esistente 36/36 + 6/6 + 15/15; suite completa 2244/2244, 0 pending (2152 base + 92 nuovi). Profilo pack e tsconfig originali, nessun alias e nessun edit package/dist.

Consumer CJS installato in una cartella indipendente con node_modules/@x9-forge/contracts → build privata: risoluzione dist/agent/index.cjs asserita prima della qualifica. 14/14 controlli, 13/13 mutazioni del compilato, 14/14 nomi colpiti e un SHA ripristinato dopo ciascuna; ogni restauro 14/14. Consumer CTS originale: exit 0; null tolto dal tipo di ritorno → TS2322 reale, ripristino exit 0. Sonda iniziale con stringhe non branded nel consumer esclusa; corretta usando AgentRuntimeIdentitySchema.parse, nessun tipo canonico scritto a mano. Prove 04-cjs-proof/04-types-proof.

Integrità: 2415/2415 file protetti, 4/4 sonde fuori perimetro respinte; agent/index.ts e source/test workspace D identici alla base. Tutti i percorsi modificati entro il perimetro. PRONTO PER REVISIONE R-27; rilascio 1.37 affidato alla coordinatrice. R4-2 sospeso pulito a b424a97d; nessun live, provider API, push, publish, merge o deploy.
