# Phase 1: Modelli bridge 145 — Context

Gathered: 2026-10-09. Status: ready for planning. Auto mode, single pass. Assigned C5-MODELLI-BRIDGE-145-GSD, base 6d1bafbd, worktree156-1 and existing branch codex/c5-modelli-consumatori-bridge.

<domain>
Release preparation only: version1.45.0, accurate changelog, native rebuilt distribution and isolated Forge/X9 install from the exact published SHA. No DTO/handler/runtime implementation, no consumer repository writes, no push/tag/merge/deploy by F.
</domain>

<decisions>
- **D-01 [auto, recommended]**: Preserve existing package-manager and GitHTTPS SHA distribution. Version changes only package.version; dependency graph, lock, scripts and export map remain unchanged.
- **D-02 [auto, recommended]**: Reuse existing native source suite, declaration/build/package checks and public-entrypoint first-import matrix. A consumer mode may be added to that runner to prevent bridge self-reference from masquerading as an installed consumer.
- **D-03 [auto, recommended]**: Use separate isolated installation fixtures for Forge and X9 with their existing peer/pnpm policy. Run all18exports×2formats with real installed package resolution. Prove package.version, resolved release SHA and import behavior; synthetic payload contains identity/key names only, never secrets.
- **D-04 [auto, recommended]**: Create a reviewable release commit locally, send exactSHA to coordinator for authorized publication, then install from GitHTTPS. Tarball/localGit results are separate diagnostics and cannot close remoteSHA proof.
- **D-05 [auto, recommended]**: Fail verification with gaps_found while publication/install is unproved. Do not use stale6d/1.44 install to label1.45 complete. Independent Codex verification remains required after author's GSD verification.
- Discretion: compact one-plan phase, sequential work, max45min/3technicalattempts; no broad historical GSD cleanup. No matchedtodos.
</decisions>

<canonical_refs>
- /Users/admintemp/Downloads/Claude/forge-v2-bacheca/compiti/C5-MODELLI-BRIDGE-145-GSD.md — assigned scope.
- /Users/admintemp/Downloads/Claude/forge-v2-bacheca/piani/COMPLETAMENTO-R5.md:23 — Models expectation.
- .planning/phases/c5-modelli-consumatori/PLAN.md — approved canonical contracts, oldForge mapping and scope.
- .planning/phases/c5-modelli-consumatori/CONTRATTO.md — canonical Models API.
- package.json:3 — current1.44, existing18exportmap/scripts/peer.
- README.md:17 — SHA installation; :25 committed dual-format dist and husky-only prepare.
- CHANGELOG.md:5 — SHA distribution policy.
- tests/cjs/public-entrypoints-first.mjs:1 — isolated first-import matrix.
- .planning/phases/c5-modelli-consumatori/IMPORT-FIX-PROOF.json — initial-import regression qualification.
</canonical_refs>

## Trasversalità (R-31)

Bridge is the sole canonical contract source for ForgeFactory/Web and X9core/SDK. Only bridge release metadata, tests and generateddist change. Owner/tenant identity, privateMaster scope, CAS/freshness, single/failover/embedding, synchronization and install receipts retain existing approved behavior. B/C/D/E own actualconsumer pin/runtime work. Coordinator publishes acceptedSHA; F does not write in their repos. No .env/secrets/provider calls.

## Esistente (R-35)

**Esiste già?** sì: releasevia GitHTTPS SHA, committed ESM/CJSdist, native type/lint/build/portable-declarations/pack and source regressions.
**Dove vive oggi:** package.json:3 and exports/scripts, README.md:17–27, tests/cjs/public-entrypoints-first.mjs:1, src/model-router/model-consumers.ts:78, src/agent/agent-management.ts:85.
**Come funziona oggi:** consumer overrides resolve exactSHA; prepare installs hooks, compiled dist ships inGit. Existing matrix imports package from bridge itself; new proof must resolve actual installed package from consumer cwd.
**Vecchio Forge:** original4f3fc42bf26ef191642f7f8d0cc94153c1302fe0: web/src/pages/agent/Models.tsx:29/155, web/src/pages/GlobalModels.tsx:45, services/vault/src/routes/vault.ts:521, already read/mapped in approved priorPLAN. Selection/reset/readback and agent/global/default origin remain represented. This release changes no writer.
**Comportamento da mantenere:** contracts and subpaths stay compatible; no installed/real-time claim from registrymetadata; no keys/context exposure; consumers compile and load samecanonicaltypes.
**Cosa si riusa:** whole native release toolchain and existing first-import test, unchanged export map and dependencygraph.
**Si riscrive?** no: version and release proof only; tests extend existingrunner.
**Cambia come funziona lo stack?** no: coordinator102715 authorizes release metadata/build only; previously approved Masterchange remains untouched.

## Fruibilità (R-34)

1. Di cosa si occupa: makes approved Models contracts installable as identifiable1.45.0 package.
2. Obiettivo: exactreleaseSHA installs and all publicsubpaths load in isolatedconsumercontexts before delivery.
3. Cosa potrà fare l'utente: after coordinated consumerrelease, continue configuring Models through canonical sharedcontracts; this package alone adds noUI/runtime.
4. Manca qualcosa: finalModelsuserflow requires producer/runtime/integration/live tasks B/C/D/E; none is fabricated by this release. Phase-specific installproof is mandatory.

## Corrispondenza aspettativa e tavola (R-34)

**Aspettativa:** non serve: questa fase distribuisce il contratto già approvato e non costruisce un percorso utente; l’aspettativa Modelli è richiamata nel piano di rilascio e resta ai consumer.
**Tavola:** non serve: pacchetto di contratti senza interfaccia; non vengono costruiti pulsanti o colonne.

| Elemento | Cosa si costruisce | Come si prova |
| --- | --- | --- |
| Identificare1.45.0 | Versione e changelog | Assertionversion e metadati archivio |
| Distribuzione canonica completa | NativeESM/CJSdist | Fullsource,types,lint,build,portable,pack,36entrychecks |
| Installabile nei due consumer | GitHTTPSreleaseSHA in fixture isolate | Actualpnpminstall,lockSHA,version,36checksperconsumer |

<deferred>
No historical shimcleanup, runtimework, actualconsumerpins, tagpublication, integration or liveModelchanges in this phase. Independentreview of6d pending initially; must honor coordinator conclusions.
</deferred>
