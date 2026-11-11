"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELIVERY_PACKAGE_PROBLEM_CODES = exports.DeliveryPackageSchema = exports.DELIVERY_PACKAGE_DOCUMENT_EXTENSIONS = exports.DELIVERY_PACKAGE_PREVIEW_EXTENSIONS = exports.DELIVERY_PACKAGE_OVERVIEW_EXTENSIONS = exports.DELIVERY_PACKAGE_IMAGE_EXTENSIONS = exports.DELIVERY_PACKAGE_FILE_NAME = void 0;
exports.deliveryPackagePaths = deliveryPackagePaths;
exports.deliveryPackageProblems = deliveryPackageProblems;
const zod_1 = require("zod");
exports.DELIVERY_PACKAGE_FILE_NAME = 'CONSEGNA.json';
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
    })).max(8),
    overviewSheet: zod_1.z.strictObject({ path: packagePath(exports.DELIVERY_PACKAGE_OVERVIEW_EXTENSIONS) }).optional(),
    // A preview points to one self-contained file.
    preview: zod_1.z.strictObject({ path: packagePath(exports.DELIVERY_PACKAGE_PREVIEW_EXTENSIONS) }).optional(),
    documents: zod_1.z.array(zod_1.z.strictObject({
        path: packagePath(exports.DELIVERY_PACKAGE_DOCUMENT_EXTENSIONS),
        caption: zod_1.z.string().min(1).max(140),
    })).max(10).optional(),
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
//# sourceMappingURL=delivery-package.js.map