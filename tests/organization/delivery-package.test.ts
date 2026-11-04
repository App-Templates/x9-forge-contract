import { describe, expect, it } from 'vitest';
import {
  DELIVERY_PACKAGE_FILE_NAME,
  DELIVERY_PACKAGE_IMAGE_EXTENSIONS,
  DELIVERY_PACKAGE_OVERVIEW_EXTENSIONS,
  DELIVERY_PACKAGE_PREVIEW_EXTENSIONS,
  DELIVERY_PACKAGE_DOCUMENT_EXTENSIONS,
  DeliveryPackageSchema,
  deliveryPackagePaths,
  type DeliveryPackage,
} from '../../src/organization/index.js';

const minimal = (): DeliveryPackage => ({
  version: 1,
  title: 'Example delivery',
  forReferent: {
    whatIs: 'A proposal for the example project.',
    whatToLook: 'Review the main screens.',
    whatToDecide: 'Approve the proposed direction.',
    limits: [],
  },
  keyScreens: [],
});

const complete = (): DeliveryPackage => ({
  ...minimal(),
  keyScreens: [
    { path: 'screens/home.png', caption: 'Home screen' },
    { path: 'screens/detail.jpg', caption: 'Detail screen' },
  ],
  overviewSheet: { path: 'overview.pdf' },
  preview: { path: 'preview.html' },
  documents: [{ path: 'docs/notes.md', caption: 'Review notes' }],
});

describe('DeliveryPackageSchema', () => {
  it('accepts a complete package and returns paths in presentation order', () => {
    const pkg = complete();
    expect(DeliveryPackageSchema.parse(pkg)).toEqual(pkg);
    expect(deliveryPackagePaths(pkg)).toEqual([
      'screens/home.png', 'screens/detail.jpg', 'overview.pdf', 'preview.html', 'docs/notes.md',
    ]);
  });

  it('accepts a minimal package without optional attachments', () => {
    const pkg = minimal();
    expect(DeliveryPackageSchema.parse(pkg)).toEqual(pkg);
    expect(deliveryPackagePaths(pkg)).toEqual([]);
  });

  it('exports the canonical manifest name and extension lists', () => {
    expect(DELIVERY_PACKAGE_FILE_NAME).toBe('CONSEGNA.json');
    expect(DELIVERY_PACKAGE_IMAGE_EXTENSIONS).toEqual(['png', 'jpg', 'jpeg']);
    expect(DELIVERY_PACKAGE_OVERVIEW_EXTENSIONS).toEqual(['png', 'jpg', 'jpeg', 'pdf']);
    expect(DELIVERY_PACKAGE_PREVIEW_EXTENSIONS).toEqual(['html', 'pdf', 'png']);
    expect(DELIVERY_PACKAGE_DOCUMENT_EXTENSIONS).toEqual(['pdf', 'md', 'txt', 'csv', 'png', 'jpg', 'jpeg', 'html']);
  });

  it.each([
    '../a.png', '/a.png', 'a b.png', 'a\tb.png', 'a\nb.png', 'dir\\a.png',
    'dir//a.png', './a.png', 'dir/../a.png', 'a.png/', '', 'shot.gif', 'no-extension',
    'dir.png/file', `${'a'.repeat(509)}.png`,
  ])('rejects unsafe or unsupported screen path %j', (path) => {
    expect(DeliveryPackageSchema.safeParse({
      ...minimal(), keyScreens: [{ path, caption: 'Screen' }],
    }).success).toBe(false);
  });

  it('normalizes extension case for validation', () => {
    expect(DeliveryPackageSchema.safeParse({
      ...minimal(), keyScreens: [{ path: 'screens/HOME.PNG', caption: 'Home' }],
    }).success).toBe(true);
  });

  it('rejects an unsupported preview extension', () => {
    expect(DeliveryPackageSchema.safeParse({ ...minimal(), preview: { path: 'x.zip' } }).success).toBe(false);
  });

  it('accepts eight screens and rejects nine screens', () => {
    const keyScreens = Array.from({ length: 9 }, (_, index) => ({ path: `screen-${index}.png`, caption: 'Screen' }));
    expect(DeliveryPackageSchema.safeParse({ ...minimal(), keyScreens: keyScreens.slice(0, 8) }).success).toBe(true);
    expect(DeliveryPackageSchema.safeParse({ ...minimal(), keyScreens }).success).toBe(false);
  });

  it('rejects unknown keys at every object boundary', () => {
    const pkg = complete();
    for (const value of [
      { ...pkg, extra: true },
      { ...pkg, forReferent: { ...pkg.forReferent, extra: true } },
      { ...pkg, keyScreens: [{ ...pkg.keyScreens[0], extra: true }] },
      { ...pkg, overviewSheet: { path: 'overview.pdf', extra: true } },
      { ...pkg, preview: { path: 'preview.html', extra: true } },
      { ...pkg, documents: [{ path: 'notes.md', caption: 'Notes', extra: true }] },
    ]) expect(DeliveryPackageSchema.safeParse(value).success).toBe(false);
  });

  it('rejects duplicate paths within screens and across attachment categories', () => {
    const pkg = complete();
    const duplicate = { path: 'screens/home.png', caption: 'Duplicate' };
    for (const value of [
      { ...pkg, keyScreens: [duplicate, duplicate] },
      { ...pkg, overviewSheet: { path: duplicate.path } },
      { ...pkg, preview: { path: duplicate.path } },
      { ...pkg, documents: [duplicate] },
      { ...pkg, keyScreens: [], overviewSheet: { path: 'shared.pdf' }, preview: { path: 'shared.pdf' } },
      { ...pkg, documents: [{ path: 'notes.md', caption: 'Notes' }, { path: 'notes.md', caption: 'Again' }] },
    ]) expect(DeliveryPackageSchema.safeParse(value).success).toBe(false);
  });

  it('rejects the manifest as a document', () => {
    expect(DeliveryPackageSchema.safeParse({
      ...minimal(), documents: [{ path: DELIVERY_PACKAGE_FILE_NAME, caption: 'Manifest' }],
    }).success).toBe(false);
  });

  it('accepts a title of 120 characters and rejects 121 characters', () => {
    expect(DeliveryPackageSchema.safeParse({ ...minimal(), title: 'a'.repeat(120) }).success).toBe(true);
    expect(DeliveryPackageSchema.safeParse({ ...minimal(), title: 'a'.repeat(121) }).success).toBe(false);
  });
});
