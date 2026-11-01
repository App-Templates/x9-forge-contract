"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevSessionResultSchema = exports.DevSessionResultFileSchema = exports.DevSessionDeliverySchema = exports.DevSessionDeliveredFileSchema = exports.DevSessionCommitSchema = exports.DevSessionAssignmentSchema = exports.DevSessionMaterialSchema = exports.DevSessionGitHubLinkSchema = exports.DevSessionRepoSchema = exports.DevSessionKindSchema = exports.DEV_SESSION_BLOCK_MARKER = exports.DEV_SESSION_MAX_MATERIALS = exports.DEV_SESSION_MAX_FILES = exports.DEV_SESSION_COMMIT_LABEL = exports.DEV_SESSION_DELIVERED_FILES_LABEL = exports.DEV_SESSION_BRANCH_PREFIX = exports.DEV_SESSION_AUTONOMOUS_LABEL = void 0;
exports.devSessionBranch = devSessionBranch;
exports.devSessionId = devSessionId;
exports.devSessionAssignmentCanonicalJson = devSessionAssignmentCanonicalJson;
exports.renderDevSessionBlock = renderDevSessionBlock;
exports.parseDevSessionBlock = parseDevSessionBlock;
exports.renderDevSessionDelivery = renderDevSessionDelivery;
exports.parseDevSessionDelivery = parseDevSessionDelivery;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const asset_js_1 = require("../../organization/asset.cjs");
const participant_binding_js_1 = require("../../organization/participant-binding.cjs");
/**
 * Incarico di sessione di una business unit (F4): il contratto fra chi lo apre (cap-dev di X9, per conto del capo
 * BU) e chi lo esegue (l'esecutore sul laptop del proprietario). L'incarico vive nel corpo di una issue della
 * bacheca di sessione; il risultato vive nel ramo `consegna/<n>` e nel commento finale della stessa issue.
 *
 * Nessuna credenziale e nessun contenuto di file: solo identità, testo dell'incarico e riferimenti ai materiali.
 */
/** Etichetta con cui cap-dev marca una issue come incarico di sessione autonoma. */
exports.DEV_SESSION_AUTONOMOUS_LABEL = 'sessione:autonoma';
/** Il lavoro prodotto si committa sul ramo `consegna/<numero della issue>` del repository di destinazione. */
exports.DEV_SESSION_BRANCH_PREFIX = 'consegna/';
/** Riga che apre l'elenco dei file consegnati nel commento finale. */
exports.DEV_SESSION_DELIVERED_FILES_LABEL = 'File consegnati:';
/** Riga facoltativa del commento finale: il commit esatto della consegna (40 cifre esadecimali). */
exports.DEV_SESSION_COMMIT_LABEL = 'Commit:';
exports.DEV_SESSION_MAX_FILES = 20;
exports.DEV_SESSION_MAX_MATERIALS = 20;
/** Marcatore del blocco leggibile da macchina dentro il corpo della issue. */
exports.DEV_SESSION_BLOCK_MARKER = 'x9:dev-session:v1';
/** Una sessione produce codice o design; gli altri tipi di produzione non passano da qui. */
exports.DevSessionKindSchema = zod_1.z.enum(['code', 'design']);
const REPO_PATTERN = /^[A-Za-z0-9-]{1,39}\/(?!\.{1,2}$)[A-Za-z0-9_.-]{1,100}$/;
/** `owner/repo` su GitHub. */
exports.DevSessionRepoSchema = zod_1.z.string().regex(REPO_PATTERN);
/**
 * Link a un repository GitHub (o a un suo ramo, cartella o file): solo https, solo github.com, nessuna credenziale
 * nell'indirizzo, nessun parametro. Chi esegue clona o legge da qui: l'insieme dei proprietari ammessi lo decide chi
 * apre l'incarico, qui si garantisce solo la forma.
 */
exports.DevSessionGitHubLinkSchema = zod_1.z.string().max(512).refine((value) => {
    let url;
    try {
        url = new URL(value);
    }
    catch {
        return false;
    }
    // `new URL` resolves dot segments, so the spelling the consumer will receive is checked as written.
    if (value.includes('\\') || value.split('/').some((segment) => /^(?:\.|%2e){1,2}$/i.test(segment)))
        return false;
    if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.port !== '')
        return false;
    if (url.username !== '' || url.password !== '' || url.search !== '' || url.hash !== '')
        return false;
    const segments = url.pathname.split('/').filter((segment, index) => index > 0 || segment !== '');
    if (segments.some((segment) => segment === '' || segment === '.' || segment === '..'))
        return false;
    const repo = (segments[1] ?? '').replace(/\.git$/, '');
    return REPO_PATTERN.test(`${segments[0]}/${repo}`);
}, { message: 'GitHub link must be https://github.com/<owner>/<repo>[/path] with no credentials, query or fragment' });
const NoteSchema = zod_1.z.string().trim().min(1).max(500);
/** Un materiale ricevuto dal referente: un allegato già registrato come asset, oppure un link a GitHub. */
exports.DevSessionMaterialSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('asset'), asset: asset_js_1.AssetRefSchema, note: NoteSchema.optional() }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('github_link'), url: exports.DevSessionGitHubLinkSchema, note: NoteSchema.optional() }),
]);
/**
 * L'incarico. Tutto ciò che identifica chi lo apre (tenant, owner, organizzazione, agente, business unit) è messo da
 * cap-dev dall'identità verificata della chiamata, mai dal modello. I materiali devono essere della stessa azienda,
 * dello stesso progetto e dello stesso tenant dell'incarico, e di nessun'altra business unit: se non lo sono,
 * l'incarico non è valido, sia in apertura sia in lettura.
 */
exports.DevSessionAssignmentSchema = zod_1.z.strictObject({
    version: zod_1.z.literal(1),
    tenantId: zod_1.z.string().min(1),
    ownerId: zod_1.z.string().min(1),
    organizationId: zod_1.z.string().min(1),
    companyId: asset_js_1.AssetRefSchema.shape.companyId,
    projectId: asset_js_1.AssetRefSchema.shape.projectId,
    businessUnit: zod_1.z.strictObject({
        slug: zod_1.z.string().min(1).max(30).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    }),
    requestedBy: participant_binding_js_1.ParticipantAgentIdentitySchema,
    productKind: exports.DevSessionKindSchema,
    title: zod_1.z.string().trim().min(3).max(120),
    /** L'incarico, con le parole della business unit. */
    task: zod_1.z.string().min(3).max(20000),
    /** Il mini piano della business unit per questo incarico. */
    miniPlan: zod_1.z.string().min(3).max(20000),
    materials: zod_1.z.array(exports.DevSessionMaterialSchema).max(exports.DEV_SESSION_MAX_MATERIALS),
    destination: zod_1.z.strictObject({ repo: exports.DevSessionRepoSchema }),
    createdAt: zod_1.z.iso.datetime({ offset: true }),
}).superRefine((assignment, ctx) => {
    assignment.materials.forEach((material, index) => {
        if (material.kind !== 'asset')
            return;
        const { asset } = material;
        const mismatch = (message) => ctx.addIssue({ code: 'custom', path: ['materials', index, 'asset'], message });
        if (asset.tenantId !== assignment.tenantId)
            mismatch('material_foreign_tenant');
        else if (asset.companyId !== assignment.companyId)
            mismatch('material_foreign_company');
        else if (asset.projectId !== assignment.projectId)
            mismatch('material_foreign_project');
        else if (asset.buSlug !== undefined && asset.buSlug !== assignment.businessUnit.slug)
            mismatch('material_foreign_business_unit');
    });
});
/** Ramo di consegna dell'incarico aperto come issue `issueNumber`. */
function devSessionBranch(issueNumber) {
    if (!Number.isSafeInteger(issueNumber) || issueNumber < 1)
        throw new Error('issue number must be a positive integer');
    return `${exports.DEV_SESSION_BRANCH_PREFIX}${issueNumber}`;
}
/** Identificativo di sessione negli asset di origine `session`: `R<numero della issue>`. */
function devSessionId(issueNumber) {
    if (!Number.isSafeInteger(issueNumber) || issueNumber < 1)
        throw new Error('issue number must be a positive integer');
    return `R${issueNumber}`;
}
function sortKeys(value) {
    if (Array.isArray(value))
        return value.map(sortKeys);
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value)
            .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
            .map(([key, child]) => [key, sortKeys(child)]));
    }
    return value;
}
/**
 * Testo canonico dell'incarico (chiavi ordinate, nessuno spazio): chi apre ne calcola lo SHA-256 e lo scrive nel
 * blocco; chi legge lo ricalcola. Il ponte non calcola l'impronta: la calcola il servizio.
 */
function devSessionAssignmentCanonicalJson(raw) {
    return JSON.stringify(sortKeys({ domain: 'x9.cap-dev.session-assignment', assignment: exports.DevSessionAssignmentSchema.parse(raw) }));
}
const DIGEST_PATTERN = /^[0-9a-f]{64}$/;
/**
 * Blocco da mettere in fondo al corpo della issue: una riga di marcatore con l'impronta, poi un blocco di codice
 * `json` di una sola riga. Il `<` è scritto `<` perché nessun testo possa aprire un commento HTML.
 */
function renderDevSessionBlock(raw, digest) {
    if (!DIGEST_PATTERN.test(digest))
        throw new Error('digest must be 64 lowercase hex digits');
    const assignment = exports.DevSessionAssignmentSchema.parse(raw);
    const json = JSON.stringify(sortKeys(assignment)).replace(/</g, '\\u003c');
    return [`<!-- ${exports.DEV_SESSION_BLOCK_MARKER} sha256:${digest} -->`, '```json', json, '```'].join('\n');
}
/**
 * Legge il blocco dal corpo di una issue. Restituisce l'incarico validato e l'impronta dichiarata: confrontarla con
 * `devSessionAssignmentCanonicalJson` è compito di chi legge. Un blocco assente, doppio o illeggibile è un errore,
 * mai un incarico vuoto.
 */
function parseDevSessionBlock(body) {
    const lines = body.replace(/\r\n/g, '\n').split('\n');
    const markerPrefix = `<!-- ${exports.DEV_SESSION_BLOCK_MARKER} `;
    const at = lines.flatMap((line, index) => line.startsWith(markerPrefix) ? [index] : []);
    if (at.length === 0)
        return { ok: false, reason: 'absent' };
    if (at.length > 1)
        return { ok: false, reason: 'multiple' };
    const start = at[0];
    const marker = /^<!-- x9:dev-session:v1 sha256:([0-9a-f]{64}) -->$/.exec(lines[start]);
    if (!marker || lines[start + 1] !== '```json' || lines[start + 3] !== '```' || lines[start + 2] === undefined) {
        return { ok: false, reason: 'malformed' };
    }
    let value;
    try {
        value = JSON.parse(lines[start + 2]);
    }
    catch {
        return { ok: false, reason: 'invalid_json' };
    }
    const parsed = exports.DevSessionAssignmentSchema.safeParse(value);
    if (!parsed.success)
        return { ok: false, reason: 'invalid_assignment' };
    return { ok: true, assignment: parsed.data, digest: marker[1] };
}
// -- Consegna ------------------------------------------------------------------------------------------------------
const Sha256Schema = zod_1.z.string().regex(/^[0-9a-f]{64}$/);
const CommitSchema = zod_1.z.string().regex(/^[0-9a-f]{40}$/);
exports.DevSessionCommitSchema = CommitSchema;
/** Percorso relativo nel ramo di consegna: né assoluto, né con `..`, né con segmenti vuoti o con la barra inversa. */
const DeliveredPathSchema = zod_1.z.string().min(1).max(1024).refine((path) => {
    if (path.startsWith('/') || path.includes('\\'))
        return false;
    const segments = path.split('/');
    return segments.every((segment) => segment !== '' && segment !== '..' && segment !== '.' && !/\s/.test(segment))
        && segments[segments.length - 1].length <= 255;
}, { message: 'delivered path must be relative, without whitespace, `.` or `..` segments' });
exports.DevSessionDeliveredFileSchema = zod_1.z.strictObject({
    path: DeliveredPathSchema,
    sha256: Sha256Schema,
    sizeBytes: zod_1.z.number().int().min(0),
});
/** Commento finale dell'esecutore: riepilogo libero, riga `Commit:` facoltativa, poi l'elenco dei file. */
exports.DevSessionDeliverySchema = zod_1.z.strictObject({
    summary: zod_1.z.string().max(12000),
    commit: CommitSchema.nullable(),
    files: zod_1.z.array(exports.DevSessionDeliveredFileSchema).max(exports.DEV_SESSION_MAX_FILES),
});
function renderDevSessionDelivery(raw) {
    const delivery = exports.DevSessionDeliverySchema.parse(raw);
    const paths = new Set();
    for (const file of delivery.files) {
        if (paths.has(file.path))
            throw new Error('duplicate delivered path');
        paths.add(file.path);
    }
    return [
        delivery.summary.trim(),
        '',
        ...(delivery.commit === null ? [] : [`${exports.DEV_SESSION_COMMIT_LABEL} ${delivery.commit}`]),
        exports.DEV_SESSION_DELIVERED_FILES_LABEL,
        ...delivery.files.map((file) => `- ${file.path} sha256:${file.sha256} ${file.sizeBytes} byte`),
    ].join('\n');
}
/**
 * Legge il commento finale. Senza l'elenco dei file la consegna ha zero file (spetta a chi legge decidere se basta);
 * una riga dell'elenco malformata è un errore, mai una riga saltata.
 */
function parseDevSessionDelivery(body) {
    const lines = body.replace(/\r\n/g, '\n').split('\n');
    const label = exports.DEV_SESSION_DELIVERED_FILES_LABEL.toLowerCase();
    const commitLabel = exports.DEV_SESSION_COMMIT_LABEL.toLowerCase();
    const start = lines.findIndex((line) => line.trim().toLowerCase() === label);
    const commitLines = lines.filter((line) => line.trim().toLowerCase().startsWith(commitLabel));
    if (commitLines.length > 1)
        return { ok: false, reason: 'multiple_commits' };
    let commit = null;
    if (commitLines.length === 1) {
        const value = commitLines[0].trim().slice(exports.DEV_SESSION_COMMIT_LABEL.length).trim();
        if (!CommitSchema.safeParse(value).success)
            return { ok: false, reason: 'invalid_commit' };
        commit = value;
    }
    const files = [];
    if (start !== -1) {
        const paths = new Set();
        for (let index = start + 1; index < lines.length; index++) {
            const line = lines[index].trim();
            if (!/^[-*](?:\s|$)/.test(line))
                break;
            const match = /^(\S+)\s+sha256:([0-9a-f]{64})\s+(\d+)\s+byte$/.exec(line.slice(1).trim());
            if (!match)
                return { ok: false, reason: 'invalid_line' };
            const sizeBytes = Number(match[3]);
            const file = exports.DevSessionDeliveredFileSchema.safeParse({ path: match[1], sha256: match[2], sizeBytes });
            if (!file.success)
                return { ok: false, reason: Number.isSafeInteger(sizeBytes) ? 'unsafe_path' : 'invalid_line' };
            if (paths.has(file.data.path))
                return { ok: false, reason: 'duplicate_path' };
            if (files.length >= exports.DEV_SESSION_MAX_FILES)
                return { ok: false, reason: 'too_many_files' };
            paths.add(file.data.path);
            files.push(file.data);
        }
    }
    const headEnd = start === -1 ? lines.length : start;
    const summary = lines.slice(0, headEnd)
        .filter((line) => !line.trim().toLowerCase().startsWith(commitLabel))
        .join('\n').trim();
    return { ok: true, delivery: { summary, commit, files } };
}
// -- Risultato verificato letto da cap-dev ---------------------------------------------------------------------------
/**
 * Un file della consegna dopo la verifica: cap-dev ha riletto i byte al commit indicato e ne ha confrontato impronta
 * e dimensione con quelle dichiarate dall'esecutore.
 */
exports.DevSessionResultFileSchema = zod_1.z.strictObject({
    path: DeliveredPathSchema,
    name: asset_js_1.AssetRefSchema.shape.name,
    sha256: Sha256Schema,
    sizeBytes: zod_1.z.number().int().min(0),
    mediaType: asset_js_1.AssetRefSchema.shape.mediaType,
    link: zod_1.z.string().max(2048),
});
/** Risultato di una sessione consegnata e verificata: nessuna consegna «fatta» senza commit e file verificati. */
exports.DevSessionResultSchema = zod_1.z.strictObject({
    sessionId: zod_1.z.string().regex(/^R[1-9][0-9]*$/),
    issue: zod_1.z.number().int().min(1),
    scope: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    repo: exports.DevSessionRepoSchema,
    branch: zod_1.z.string().min(1),
    commit: CommitSchema,
    link: zod_1.z.string().max(2048),
    summary: zod_1.z.string().max(12000),
    files: zod_1.z.array(exports.DevSessionResultFileSchema).min(1).max(exports.DEV_SESSION_MAX_FILES),
    assets: zod_1.z.array(asset_js_1.AssetRefSchema).min(1).max(exports.DEV_SESSION_MAX_FILES),
});
//# sourceMappingURL=session-assignment.js.map