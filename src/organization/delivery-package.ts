import { z } from 'zod';

export const DELIVERY_PACKAGE_FILE_NAME = 'CONSEGNA.json' as const;
export const DELIVERY_PACKAGE_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg'] as const;
export const DELIVERY_PACKAGE_OVERVIEW_EXTENSIONS = [...DELIVERY_PACKAGE_IMAGE_EXTENSIONS, 'pdf'] as const;
export const DELIVERY_PACKAGE_PREVIEW_EXTENSIONS = ['html', 'pdf', 'png'] as const;
export const DELIVERY_PACKAGE_DOCUMENT_EXTENSIONS = ['pdf', 'md', 'txt', 'csv', 'png', 'jpg', 'jpeg', 'html'] as const;

function packagePath(exts: readonly string[]) {
  return z.string().min(1).max(512).refine((path) => {
    if (path.startsWith('/') || path.includes('\\') || /\s/.test(path)) return false;
    if (path.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')) return false;
    const fileName = path.split('/').at(-1)!;
    const dot = fileName.lastIndexOf('.');
    return dot !== -1 && exts.includes(fileName.slice(dot + 1).toLowerCase());
  }, { message: `Package path must be relative, without whitespace or unsafe segments; allowed extensions: ${exts.join(", ")}` });
}

export const DeliveryPackageSchema = z.strictObject({
  version: z.literal(1),
  title: z.string().min(1).max(120),
  forReferent: z.strictObject({
    whatIs: z.string().min(1).max(600),
    whatToLook: z.string().min(1).max(600),
    whatToDecide: z.string().min(1).max(600),
    limits: z.array(z.string().min(1).max(300)).max(5),
  }),
  keyScreens: z.array(z.strictObject({
    path: packagePath(DELIVERY_PACKAGE_IMAGE_EXTENSIONS),
    caption: z.string().min(1).max(140),
  })).max(8),
  overviewSheet: z.strictObject({ path: packagePath(DELIVERY_PACKAGE_OVERVIEW_EXTENSIONS) }).optional(),
  // A preview points to one self-contained file.
  preview: z.strictObject({ path: packagePath(DELIVERY_PACKAGE_PREVIEW_EXTENSIONS) }).optional(),
  documents: z.array(z.strictObject({
    path: packagePath(DELIVERY_PACKAGE_DOCUMENT_EXTENSIONS),
    caption: z.string().min(1).max(140),
  })).max(10).optional(),
}).superRefine((pkg, ctx) => {
  const seen = new Set<string>();
  for (const path of deliveryPackagePaths(pkg)) {
    if (path === DELIVERY_PACKAGE_FILE_NAME) {
      ctx.addIssue({ code: 'custom', message: 'The package manifest cannot be a delivery attachment' });
    }
    if (seen.has(path)) {
      ctx.addIssue({ code: 'custom', message: `Duplicate package path: ${path}` });
    }
    seen.add(path);
  }
});
export type DeliveryPackage = z.infer<typeof DeliveryPackageSchema>;

/** Attachment paths relative to the delivery commit root, in presentation order. */
export function deliveryPackagePaths(pkg: DeliveryPackage): string[] {
  return [
    ...pkg.keyScreens.map((screen) => screen.path),
    ...(pkg.overviewSheet ? [pkg.overviewSheet.path] : []),
    ...(pkg.preview ? [pkg.preview.path] : []),
    ...(pkg.documents ?? []).map((document) => document.path),
  ];
}
