from pathlib import Path
import subprocess, json, hashlib

root = Path(__file__).resolve().parents[3]
paths = {name: root / name for name in ["src/agent/agent-workspace-attestation.ts", "src/agent/agent-management.ts", "src/agent/agent-workspace.ts", "src/http/endpoints/internal-agents-list.ts"]}
original = {name: path.read_text() for name, path in paths.items()}
a, m, w, l = paths
recipes = [
    ("positive-version", a, None, "appliedVersion: AgentConfigVersionSchema", "appliedVersion: z.number().int()"),
    ("integer-version", a, None, "appliedVersion: AgentConfigVersionSchema", "appliedVersion: z.number().positive()"),
    ("safe-version", a, None, "appliedVersion: AgentConfigVersionSchema", "appliedVersion: z.number().refine(Number.isInteger).positive()"),
    ("numeric-version", a, None, "appliedVersion: AgentConfigVersionSchema", "appliedVersion: z.any()"),
    ("no-coercion", a, None, "appliedVersion: AgentConfigVersionSchema", "appliedVersion: z.coerce.number().int().positive()"),
    ("required-version", a, None, "appliedVersion: AgentConfigVersionSchema", "appliedVersion: AgentConfigVersionSchema.optional()"),
    ("hash-length", a, None, "/^[a-f0-9]{64}$/", "/^[a-f0-9]+$/"),
    ("hash-hex", a, None, "/^[a-f0-9]{64}$/", "/^.{64}$/"),
    ("hash-lowercase", a, None, "/^[a-f0-9]{64}$/", "/^[a-fA-F0-9]{64}$/"),
    ("hash-type", a, None, "sha256: z.string().regex(/^[a-f0-9]{64}$/)", "sha256: z.any()"),
    ("hash-required", a, None, "sha256: z.string().regex(/^[a-f0-9]{64}$/)", "sha256: z.string().regex(/^[a-f0-9]{64}$/).optional()"),
    ("date-iso", a, None, "loadedAt: z.iso.datetime({ offset: true })", "loadedAt: z.string()"),
    ("date-type", a, None, "loadedAt: z.iso.datetime({ offset: true })", "loadedAt: z.any()"),
    ("date-offset", a, None, "loadedAt: z.iso.datetime({ offset: true })", "loadedAt: z.iso.datetime()"),
    ("date-required", a, None, "loadedAt: z.iso.datetime({ offset: true })", "loadedAt: z.iso.datetime({ offset: true }).optional()"),
    ("strict-attestation", a, None, ").strict();", ");"),
    ("object-attestation", a, None, "export const AgentWorkspaceAttestationSchema = z.object({", "export const AgentWorkspaceAttestationSchema = z.any(); const unused = z.object({"),
    ("workspace-version-present", m, None, "workspace != null && versions?.applied != null", "versions?.applied != null"),
    ("applied-config-present", m, None, "workspace != null && versions?.applied != null", "workspace != null"),
    ("bundle-version-equality", m, None, "workspace?.appliedVersion !== versions?.applied", "false"),
    ("command-version-binding", m, None, "addWorkspaceVersionIssues(result.workspace, result.versions, ctx);", "void result.workspace;"),
    ("state-version-binding", m, None, "addWorkspaceVersionIssues(state.workspace, state.versions, ctx);", "void state.workspace;"),
    ("command-null-outcome", m, None, "result.workspace === null && !result.results.some", "false && !result.results.some"),
    ("command-runtime-target", m, None, "entry.target.kind === 'runtime' && entry.outcome !== 'ok'", "entry.outcome !== 'ok'"),
    ("command-runtime-failure", m, None, "entry.target.kind === 'runtime' && entry.outcome !== 'ok'", "entry.target.kind === 'runtime'"),
    ("selector-object", w, None, "if (row === null || typeof row !== 'object') return null;", "void row;"),
    ("selector-validation", w, None, "return selected.success ? selected.data.appliedVersion : null;", "return (row as { workspace?: { appliedVersion?: number } }).workspace?.appliedVersion ?? null;"),
    ("selector-null", w, None, "return selected.success ? selected.data.appliedVersion : null;", "return selected.success ? selected.data.appliedVersion : 0;"),
    ("selector-fallback", w, None, "return selected.success ? selected.data.appliedVersion : null;", "return selected.success ? selected.data.appliedVersion : (row as { configVersion?: number }).configVersion ?? null;"),
    ("selector-fresh", w, None, "return selected.success ? selected.data.appliedVersion : null;", "return selected.success ? 8 : null;"),
    ("public-schema", w, None, "export { AgentWorkspaceAttestationSchema } from './agent-workspace-attestation.js';", "// Removed public schema export."),
    ("public-helper", w, None, "export function attestedWorkspaceVersionOf(", "export function rejectedWorkspaceVersionOf("),
]
for label, file, region in [("command", m, "export const AgentManagementCommandResultSchema"), ("state", m, "export const AgentManagementStateSchema"), ("list", l, "export const ListAgentsAgentSchema")]:
    field = "workspace: AgentWorkspaceAttestationSchema.nullable().optional(),"
    recipes.extend([(label + "-optional", file, region, field, "workspace: AgentWorkspaceAttestationSchema.nullable(),"), (label + "-nullable", file, region, field, "workspace: AgentWorkspaceAttestationSchema.optional(),"), (label + "-retained", file, region, field, "// Workspace field removed.")])

def run(label):
    report = Path("/private/tmp/b139-source-" + label + ".json")
    log = report.with_suffix(".log")
    command = ["/Users/admintemp/.nvm/versions/node/v24.14.1/bin/pnpm", "exec", "vitest", "run", "tests/agent/bridge139-workspace-attestation.test.ts", "--maxWorkers=1", "--no-file-parallelism", "--testTimeout=60000", "--reporter=json", "--outputFile=" + str(report)]
    with log.open("w") as output: result = subprocess.run(command, cwd=root, stdout=output, stderr=subprocess.STDOUT)
    data = json.loads(report.read_text())
    failed = [test for suite in data["testResults"] for test in suite.get("assertionResults", []) if test["status"] == "failed"]
    semantic = [test["fullName"] for test in failed if any("AssertionError" in message for message in test.get("failureMessages", []))]
    return {"exit": result.returncode, "passed": data["numPassedTests"], "total": data["numTotalTests"], "semantic": semantic, "report": str(report), "log": str(log)}

records = []
try:
    baseline = run("baseline")
    assert baseline["exit"] == 0
    for name, file, region, old, new in recipes:
        text = original[file]
        start = text.index(region) if region else 0
        position = text.index(old, start)
        paths[file].write_text(text[:position] + text[position:].replace(old, new, 1))
        mutation = run(name)
        paths[file].write_text(text)
        restore = run(name + "-restore")
        records.append({"name": name, "file": file, "qualified": mutation["exit"] != 0 and bool(mutation["semantic"]), "mutation": mutation, "restore": restore, "sha_restored": paths[file].read_text() == text})
        Path("/private/tmp/b139-source-mutations.json").write_text(json.dumps({"baseline": baseline, "records": records, "source_sha256": {name: hashlib.sha256(text.encode()).hexdigest() for name, text in original.items()}}, indent=2) + "\n")
        print(name, records[-1]["qualified"], flush=True)
finally:
    for name, path in paths.items(): path.write_text(original[name])
