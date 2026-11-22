"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELIVERY_PACKAGE_PROBLEM_CODES = exports.DeliveryPackageSchema = exports.DELIVERY_PACKAGE_DOCUMENT_EXTENSIONS = exports.DELIVERY_PACKAGE_PREVIEW_EXTENSIONS = exports.DELIVERY_PACKAGE_OVERVIEW_EXTENSIONS = exports.DELIVERY_PACKAGE_IMAGE_EXTENSIONS = exports.DELIVERY_PACKAGE_ATTACHMENT_MAX_BYTES = exports.DELIVERY_PACKAGE_FILE_MAX_BYTES = exports.DELIVERY_PACKAGE_MAX_PIECES = exports.DELIVERY_PACKAGE_MAX_KEY_SCREENS = exports.DELIVERY_PACKAGE_FILE_NAME = void 0;
exports.deliveryPackagePaths = deliveryPackagePaths;
exports.deliveryPackageProblems = deliveryPackageProblems;
exports.deliveryPackagePieceProblems = deliveryPackagePieceProblems;
const zod_1 = require("zod");
exports.DELIVERY_PACKAGE_FILE_NAME = 'CONSEGNA.json';
// Twenty contract screens can each have two format variants.
exports.DELIVERY_PACKAGE_MAX_KEY_SCREENS = 40;
// A redo can carry several pieces of the mandate (see DEV_SESSION_MAX_DELIVERABLE_KEYS); one package covers them all.
exports.DELIVERY_PACKAGE_MAX_PIECES = 20;
// The delivery chain currently carries individual files up to 25 MiB.
exports.DELIVERY_PACKAGE_FILE_MAX_BYTES = 25 * 1024 * 1024;
// Paperclip's issue attachment cap (wire-allegati.ts); above it a file travels as a link, since the issue could not hold it.
exports.DELIVERY_PACKAGE_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
exports.DELIVERY_PACKAGE_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg'];
exports.DELIVERY_PACKAGE_OVERVIEW_EXTENSIONS = [...exports.DELIVERY_PACKAGE_IMAGE_EXTENSIONS, 'pdf'];
exports.DELIVERY_PACKAGE_PREVIEW_EXTENSIONS = ['html', 'pdf', 'png'];
exports.DELIVERY_PACKAGE_DOCUMENT_EXTENSIONS = ['pdf', 'md', 'txt', 'csv', 'png', 'jpg', 'jpeg', 'html'];
function packagePath(exts) {
    return zod_1.z.string().min(1).max(512).refine((path) => {
        if (path.startsWith('/') || path.includes('\\') || /\s/.test(path))
            return false;
        if (path.split('/').some((segment) => segment === '' || segment === '.' || segment === '..'))
            return false;
        const fileName = path.split('/').at(-1);
        const dot = fileName.lastIndexOf('.');
        return dot !== -1 && exts.includes(fileName.slice(dot + 1).toLowerCase());
    }, { message: `Package path must be relative, without whitespace or unsafe segments; allowed extensions: ${exts.join(", ")}` });
}
// Same rule as AssetKeySchema (asset.ts), not imported: asset.ts -> business-unit-type.ts -> this file would be a cycle.
// A test compares the two rules key by key.
const PieceKeySchema = zod_1.z.string().min(1).max(40).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
exports.DeliveryPackageSchema = zod_1.z.strictObject({
    version: zod_1.z.literal(1),
    title: zod_1.z.string().min(1).max(120),
    forReferent: zod_1.z.strictObject({
        whatIs: zod_1.z.string().min(1).max(600),
        whatToLook: zod_1.z.string().min(1).max(600),
        whatToDecide: zod_1.z.string().min(1).max(600),
        limits: zod_1.z.array(zod_1.z.string().min(1).max(300)).max(5),
    }),
    keyScreens: zod_1.z.array(zod_1.z.strictObject({
        path: packagePath(exports.DELIVERY_PACKAGE_IMAGE_EXTENSIONS),
        caption: zod_1.z.string().min(1).max(140),
    })).max(exports.DELIVERY_PACKAGE_MAX_KEY_SCREENS),
    overviewSheet: zod_1.z.strictObject({ path: packagePath(exports.DELIVERY_PACKAGE_OVERVIEW_EXTENSIONS) }).optional(),
    // A preview remains one self-contained file; walkthrough steps describe how to navigate it.
    preview: zod_1.z.strictObject({
        path: packagePath(exports.DELIVERY_PACKAGE_PREVIEW_EXTENSIONS),
        walkthrough: zod_1.z.array(zod_1.z.strictObject({
            // Keep the contract screen name bounds here to avoid a dependency cycle with session contracts.
            screen: zod_1.z.string().min(1).max(40),
            caption: zod_1.z.string().min(1).max(140),
            clickText: zod_1.z.string().min(1).max(80).optional(),
        })).min(1).max(exports.DELIVERY_PACKAGE_MAX_KEY_SCREENS).optional(),
    }).optional(),
    documents: zod_1.z.array(zod_1.z.strictObject({
        path: packagePath(exports.DELIVERY_PACKAGE_DOCUMENT_EXTENSIONS),
        caption: zod_1.z.string().min(1).max(140),
    })).max(10).optional(),
    // Which preview and screens show which piece of a redo. Only points at files the package already lists, so the
    // attachments do not change; absent in every package saved before.
    pieces: zod_1.z.array(zod_1.z.strictObject({
        key: PieceKeySchema,
        preview: packagePath(exports.DELIVERY_PACKAGE_PREVIEW_EXTENSIONS),
        keyScreens: zod_1.z.array(packagePath(exports.DELIVERY_PACKAGE_IMAGE_EXTENSIONS)).min(1).max(exports.DELIVERY_PACKAGE_MAX_KEY_SCREENS),
    })).min(1).max(exports.DELIVERY_PACKAGE_MAX_PIECES).optional(),
}).superRefine((pkg, ctx) => {
    const seen = new Set();
    for (const path of deliveryPackagePaths(pkg)) {
        if (path === exports.DELIVERY_PACKAGE_FILE_NAME) {
            ctx.addIssue({ code: 'custom', message: 'The package manifest cannot be a delivery attachment' });
        }
        if (seen.has(path)) {
            ctx.addIssue({ code: 'custom', message: `Duplicate package path: ${path}` });
        }
        seen.add(path);
    }
    const screens = new Set();
    pkg.preview?.walkthrough?.forEach((step, index) => {
        // The first step is already open; later steps need a visible command to reach them.
        if (index > 0 && step.clickText === undefined) {
            ctx.addIssue({
                code: 'custom', path: ['preview', 'walkthrough', index, 'clickText'],
                message: 'A walkthrough step after the first requires clickText',
            });
        }
        if (screens.has(step.screen)) {
            ctx.addIssue({
                code: 'custom', path: ['preview', 'walkthrough', index, 'screen'],
                message: `Duplicate walkthrough screen: ${step.screen}`,
            });
        }
        screens.add(step.screen);
    });
    if (pkg.pieces !== undefined) {
        const listed = new Set(deliveryPackagePaths(pkg));
        const screens = new Set(pkg.keyScreens.map((screen) => screen.path));
        const keys = new Set();
        pkg.pieces.forEach((piece, index) => {
            if (keys.has(piece.key)) {
                ctx.addIssue({ code: 'custom', path: ['pieces', index, 'key'], message: `Duplicate piece: ${piece.key}` });
            }
            keys.add(piece.key);
            if (!listed.has(piece.preview)) {
                ctx.addIssue({
                    code: 'custom', path: ['pieces', index, 'preview'],
                    message: `Piece preview is not a package file: ${piece.preview}`,
                });
            }
            piece.keyScreens.forEach((path, screenIndex) => {
                if (!screens.has(path))
                    ctx.addIssue({
                        code: 'custom', path: ['pieces', index, 'keyScreens', screenIndex],
                        message: `Piece screen is not a package key screen: ${path}`,
                    });
            });
        });
    }
});
/** Attachment paths relative to the delivery commit root, in presentation order. */
function deliveryPackagePaths(pkg) {
    return [
        ...pkg.keyScreens.map((screen) => screen.path),
        ...(pkg.overviewSheet ? [pkg.overviewSheet.path] : []),
        ...(pkg.preview ? [pkg.preview.path] : []),
        ...(pkg.documents ?? []).map((document) => document.path),
    ];
}
exports.DELIVERY_PACKAGE_PROBLEM_CODES = [
    'manifest_missing',
    'manifest_not_at_root',
    'invalid_package',
    'cited_file_missing',
];
/**
 * Every reason why a delivery does not carry a usable package, in order: no manifest at the root, each manifest outside
 * the root, each schema problem of `pkg`, each cited file absent from the delivery. Pure: the caller lists the delivered
 * paths (relative to the commit root). Call it when the package is required or present.
 */
function deliveryPackageProblems(pkg, deliveredPaths) {
    const problems = [];
    if (!deliveredPaths.includes(exports.DELIVERY_PACKAGE_FILE_NAME))
        problems.push({ code: 'manifest_missing' });
    for (const path of deliveredPaths) {
        if (path.endsWith(`/${exports.DELIVERY_PACKAGE_FILE_NAME}`))
            problems.push({ code: 'manifest_not_at_root', path });
    }
    const parsed = exports.DeliveryPackageSchema.safeParse(pkg);
    if (!parsed.success) {
        for (const issue of parsed.error.issues) {
            problems.push({ code: 'invalid_package', path: issue.path.join('.'), message: issue.message });
        }
        return problems;
    }
    const delivered = new Set(deliveredPaths);
    for (const path of deliveryPackagePaths(parsed.data)) {
        if (!delivered.has(path))
            problems.push({ code: 'cited_file_missing', path });
    }
    return problems;
}
/**
 * Pieces of a redo that the package gives nothing to look at: each missing one lacks both preview and screens, since a
 * piece in `pieces` always has both. Without `pieces` the package describes a single piece (today's rules), so one
 * requested piece is fine and several cannot be told apart.
 */
function deliveryPackagePieceProblems(pkg, keys) {
    if (pkg.pieces === undefined)
        return keys.length > 1 ? keys.map((key) => ({ key, missing: ['anteprima', 'schermate'] })) : [];
    const described = new Set(pkg.pieces.map((piece) => piece.key));
    return keys.filter((key) => !described.has(key)).map((key) => ({ key, missing: ['anteprima', 'schermate'] }));
}
//# sourceMappingURL=delivery-package.js.map