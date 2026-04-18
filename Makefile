.PHONY: ai-task-new ai-verify ai-verify-dry ai-release-check ai-audit ai-help

ai-task-new:
	@test -n "$(TASK)" || (echo "Usage: make ai-task-new TASK=<id>" && exit 2)
	@mkdir -p .ai/contracts/$(TASK) .ai/artifacts/$(TASK)/logs
	@test -f .ai/contracts/$(TASK)/contract.yaml || cp .ai/contracts/_template.yaml .ai/contracts/$(TASK)/contract.yaml
	@echo "Created .ai/contracts/$(TASK)/contract.yaml"

ai-verify:
	@test -n "$(TASK)" || (echo "Usage: make ai-verify TASK=<id>" && exit 2)
	python3 ~/.claude/scripts/ai/verify_task.py --task $(TASK) --project-dir $(CURDIR)

ai-verify-dry:
	@test -n "$(TASK)" || (echo "Usage: make ai-verify-dry TASK=<id>" && exit 2)
	python3 ~/.claude/scripts/ai/verify_task.py --task $(TASK) --project-dir $(CURDIR) --dry-run

ai-release-check:
	@test -n "$(TASK)" || (echo "Usage: make ai-release-check TASK=<id>" && exit 2)
	@if [ ! -f .ai/artifacts/$(TASK)/verification.json ]; then \
		echo "ERROR: verification.json not found. Run 'make ai-verify TASK=$(TASK)' first."; \
		exit 2; \
	fi
	@python3 -c "import json,sys; d=json.load(open('.ai/artifacts/$(TASK)/verification.json')); s=d.get('status','?'); print(f'verification status: {s}'); sys.exit(0 if s=='VERIFIED' else 1)"

ai-audit:
	@tail -n 100 .ai/audit/*/tools.jsonl 2>/dev/null || true

ai-help:
	@echo "AI governance targets: ai-task-new, ai-verify, ai-verify-dry, ai-release-check, ai-audit"
