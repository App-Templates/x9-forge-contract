# Suite completa · 56-01

Permesso esplicito della coordinatrice alle 15:24: un solo giro, un worker, nessun comando parallelo.
Comando: pnpm -C /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-56-1 exec vitest run --maxWorkers=1 --testTimeout=60000 --reporter=json --outputFile=/var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-full-suite-wui3do2a/vitest.json
1067/1067 test, 79/79 file verdi; success true, suite fallite 0. Base 967 + nuovi 100.
JSON/log completi: /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-full-suite-wui3do2a
SHA256 reporter JSON: 4c16999146ab91fefb224ae0a5499be44b4922855c7d0c00d519edd2a95301d0

| File | Test passati | Stato |
| --- | --- | --- |
| tests/console.test.ts | 20/20 | verde |
| tests/corrective-action.test.ts | 36/36 | verde |
| tests/memory.smoke.test.ts | 14/14 | verde |
| tests/rag.test.ts | 37/37 | verde |
| tests/smoke.test.ts | 2/2 | verde |
| tests/agent/agent-context-core.test.ts | 18/18 | verde |
| tests/agent/agent-context-file.test.ts | 17/17 | verde |
| tests/agent/agent-credentials.test.ts | 8/8 | verde |
| tests/agent/agent-identity.test.ts | 8/8 | verde |
| tests/agent/agent-paths.test.ts | 6/6 | verde |
| tests/agent/parse-agent-context.test.ts | 6/6 | verde |
| tests/auth/auth-headers.test.ts | 11/11 | verde |
| tests/capability/agent-registry-file.test.ts | 4/4 | verde |
| tests/capability/capability-context.test.ts | 5/5 | verde |
| tests/capability/capability-manifest.test.ts | 11/11 | verde |
| tests/capability/capability-registry-entry.test.ts | 27/27 | verde |
| tests/capability/capability-turn-lead.test.ts | 9/9 | verde |
| tests/capability/env-schema.test.ts | 6/6 | verde |
| tests/capability/health-status.test.ts | 6/6 | verde |
| tests/capability/meditation-user-id.test.ts | 10/10 | verde |
| tests/capability/tool-call.test.ts | 11/11 | verde |
| tests/capability/tts.test.ts | 5/5 | verde |
| tests/capability/voice-led-onboarding.test.ts | 5/5 | verde |
| tests/capability/voice-live.test.ts | 11/11 | verde |
| tests/esm/smoke.test.ts | 15/15 | verde |
| tests/memory/delete.test.ts | 12/12 | verde |
| tests/memory/invalidation-reason.test.ts | 14/14 | verde |
| tests/memory/temporal.test.ts | 31/31 | verde |
| tests/messaging/agent-email-inbox.test.ts | 5/5 | verde |
| tests/messaging/agent-telegram-bot.test.ts | 7/7 | verde |
| tests/messaging/attachment.test.ts | 6/6 | verde |
| tests/messaging/channel-type.test.ts | 11/11 | verde |
| tests/messaging/incoming-message-envelope.test.ts | 18/18 | verde |
| tests/messaging/webhook-inbound-endpoints.test.ts | 6/6 | verde |
| tests/model-router/barrel.test.ts | 15/15 | verde |
| tests/model-router/fixtures.test.ts | 8/8 | verde |
| tests/model-router/model-hot-reload.test.ts | 5/5 | verde |
| tests/model-router/model-policy.test.ts | 10/10 | verde |
| tests/model-router/model-provider.test.ts | 3/3 | verde |
| tests/model-router/model-push.test.ts | 18/18 | verde |
| tests/model-router/model-tier-mapping.test.ts | 5/5 | verde |
| tests/model-router/model-tier.test.ts | 14/14 | verde |
| tests/model-router/per-agent-model-override.test.ts | 8/8 | verde |
| tests/http/bridge-client.test.ts | 23/23 | verde |
| tests/http/cap-tool-call.test.ts | 8/8 | verde |
| tests/http/internal-capability-agent.test.ts | 6/6 | verde |
| tests/http/no-auth-client.test.ts | 10/10 | verde |
| tests/http/sse-frames.test.ts | 16/16 | verde |
| tests/http/sse-parser.test.ts | 17/17 | verde |
| tests/vault/agent-vaulted-credentials.test.ts | 3/3 | verde |
| tests/vault/platform-internal-credentials.test.ts | 3/3 | verde |
| tests/vault/vault-entry.test.ts | 13/13 | verde |
| tests/vault/vault-sync-event.test.ts | 9/9 | verde |
| tests/vault/vault-sync-state.test.ts | 8/8 | verde |
| tests/vault/vault-tier.test.ts | 10/10 | verde |
| tests/vault/workspace-file.test.ts | 4/4 | verde |
| tests/capability/lab/lab.test.ts | 12/12 | verde |
| tests/capability/ricerca/ricerca.test.ts | 15/15 | verde |
| tests/capability/voice/origination.test.ts | 37/37 | verde |
| tests/capability/voice/schemas.test.ts | 67/67 | verde |
| tests/http/endpoints/cap-env-schema.test.ts | 4/4 | verde |
| tests/http/endpoints/cap-health.test.ts | 5/5 | verde |
| tests/http/endpoints/cap-manifest.test.ts | 4/4 | verde |
| tests/http/endpoints/internal-agent-turn.test.ts | 14/14 | verde |
| tests/http/endpoints/internal-agents-list.test.ts | 14/14 | verde |
| tests/http/endpoints/internal-agents-reload.test.ts | 13/13 | verde |
| tests/http/endpoints/internal-agents-stop.test.ts | 6/6 | verde |
| tests/http/endpoints/internal-dev-conferme.test.ts | 100/100 | verde |
| tests/http/endpoints/internal-factory-deploy.test.ts | 23/23 | verde |
| tests/http/endpoints/internal-factory-telegram-token.test.ts | 13/13 | verde |
| tests/http/endpoints/internal-memory-recall-bundle.test.ts | 8/8 | verde |
| tests/http/endpoints/internal-query.test.ts | 7/7 | verde |
| tests/http/endpoints/internal-turn-stream.test.ts | 4/4 | verde |
| tests/http/endpoints/internal-turn.test.ts | 19/19 | verde |
| tests/http/endpoints/memory-console.test.ts | 14/14 | verde |
| tests/http/endpoints/memory-correct.test.ts | 9/9 | verde |
| tests/http/endpoints/vault-resolve.test.ts | 16/16 | verde |
| tests/http/endpoints/voice-register.test.ts | 9/9 | verde |
| tests/http/endpoints/webhook-post-call.test.ts | 20/20 | verde |
