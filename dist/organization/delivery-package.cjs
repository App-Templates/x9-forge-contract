"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryPackageSchema = exports.DELIVERY_PACKAGE_DOCUMENT_EXTENSIONS = exports.DELIVERY_PACKAGE_PREVIEW_EXTENSIONS = exports.DELIVERY_PACKAGE_OVERVIEW_EXTENSIONS = exports.DELIVERY_PACKAGE_IMAGE_EXTENSIONS = exports.DELIVERY_PACKAGE_FILE_NAME = void 0;
exports.deliveryPackagePaths = deliveryPackagePaths;
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
    }, { message: 'Package path must be relative, without whitespace or unsafe segments, and have an allowed extension' });
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
//# sourceMappingURL=delivery-package.js.map