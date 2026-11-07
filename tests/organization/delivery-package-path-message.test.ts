import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  DELIVERY_PACKAGE_DOCUMENT_EXTENSIONS,
  DeliveryPackageSchema,
  type DeliveryPackage,
} from '../../src/organization/index.js';
import type * as SrcOrganization from '../../src/organization/index.js';

const require = createRequire(import.meta.url);
const commonJs: typeof SrcOrganization = require('../../dist/organization/index.cjs');

const minimal = (): DeliveryPackage => ({
  version: 1,
  title: 'Design delivery',
  forReferent: {
    whatIs: 'A design proposal.',
    whatToLook: 'Review the main screen.',
    whatToDecide: 'Approve the design.',
    limits: [],
  },
  keyScreens: [],
});

describe('delivery package path messages', () => {
  it('lists every allowed document extension for an unsupported archive', () => {
    const result = DeliveryPackageSchema.safeParse({
      ...minimal(),
      documents: [{ path: 'archivio.zip', caption: 'Archive' }],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([expect.objectContaining({
      path: ['documents', 0, 'path'],
      message: `Package path must be relative, without whitespace or unsafe segments; allowed extensions: ${DELIVERY_PACKAGE_DOCUMENT_EXTENSIONS.join(', ')}`,
    })]);
  });

  it('lists only image extensions for an unsupported screen', () => {
    const result = DeliveryPackageSchema.safeParse({
      ...minimal(),
      keyScreens: [{ path: 'a.pdf', caption: 'Main screen' }],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([expect.objectContaining({
      path: ['keyScreens', 0, 'path'],
      message: 'Package path must be relative, without whitespace or unsafe segments; allowed extensions: png, jpg, jpeg',
    })]);
  });

  it('still rejects parent traversal with an allowed extension', () => {
    const result = DeliveryPackageSchema.safeParse({
      ...minimal(),
      documents: [{ path: 'docs/../notes.pdf', caption: 'Notes' }],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([expect.objectContaining({
      path: ['documents', 0, 'path'],
      code: 'custom',
    })]);
  });

  it('lists every allowed document extension in the CommonJS build', () => {
    const result = commonJs.DeliveryPackageSchema.safeParse({
      ...minimal(),
      documents: [{ path: 'archivio.zip', caption: 'Archive' }],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([expect.objectContaining({
      path: ['documents', 0, 'path'],
      message: `Package path must be relative, without whitespace or unsafe segments; allowed extensions: ${DELIVERY_PACKAGE_DOCUMENT_EXTENSIONS.join(', ')}`,
    })]);
  });
});
