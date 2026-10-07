# BRIDGE-134 — execution

Start 2026-10-07 07:25, coordinator06:58/06:59. Base1646b79, branchcodex/bridge-134, only63-1. Reuse board/piani/BRIDGE-134-PLAN.md and STATO, no local AGENTS found. ≤45min/3attempts, then SALTATO.

1. Tests FIRST: read/write legacy context, scoped applied voice, malformed/version-incoherent voice; helper never guesses desired/default; register legacy+canonicalcaller, management-id binding, invalid caller; explicit voice_not_applied. AssertionError red before product.
2. Add canonical optional fields and helper; reuse existing schemas. caller.agent.managementAgentId binds legacyagentId (documented numericForge ID); runtimeAgentId may differ and never aliases it. voiceConfiguration.agentId equals context.agentId as explicit plan decision.
3. Deliberately break each new control, prove AssertionError with all new names covered, exact source SHA restore and green. Atomic source/test commit, immediate SUMMARY, reread plans.
4. Full tests/maxWorkers1, native typecheck/lint, build/check:pack/CJS on exact private public copy: dist/package.json/CHANGELOG forbidden inworktree. No secret/.env/networkprovider/live/push/release. Final SUMMARY commit, deliver frozen SHA; release1.34 coordinator.

2026-10-07 07:28: coordinator07:26 extends canonical scopePolicy?:AgentScopePolicy plus appliedAgentScopePolicy|null, applied snapshot with ownversion, no runtime/default guessed. Add9tests FIRST, qualify all35newnames. Voice malformed fixture strengthened to own-id incomplete object so identityguard cannot mask canonical-shapecontrol; null literal now explicit, same runtimevalue.

2026-10-07 07:39: tutti passi conclusi/full2028/2028,CJS36+6+5/type0,source16/16nomi35/35,compiled4/4nomi5/5,private386/386,protected2039/2039. Consegna/freeze63-1;rilascio1.34coordinatrice. Ordinenew07:27:R2bCI43-3primaR4-250-1.
