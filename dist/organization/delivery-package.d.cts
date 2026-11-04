import { z } from 'zod';
export declare const DELIVERY_PACKAGE_FILE_NAME: "CONSEGNA.json";
export declare const DELIVERY_PACKAGE_IMAGE_EXTENSIONS: readonly ["png", "jpg", "jpeg"];
export declare const DELIVERY_PACKAGE_OVERVIEW_EXTENSIONS: readonly ["png", "jpg", "jpeg", "pdf"];
export declare const DELIVERY_PACKAGE_PREVIEW_EXTENSIONS: readonly ["html", "pdf", "png"];
export declare const DELIVERY_PACKAGE_DOCUMENT_EXTENSIONS: readonly ["pdf", "md", "txt", "csv", "png", "jpg", "jpeg", "html"];
export declare const DeliveryPackageSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    title: z.ZodString;
    forReferent: z.ZodObject<{
        whatIs: z.ZodString;
        whatToLook: z.ZodString;
        whatToDecide: z.ZodString;
        limits: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    keyScreens: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        caption: z.ZodString;
    }, z.core.$strict>>;
    overviewSheet: z.ZodOptional<z.ZodObject<{
        path: z.ZodString;
    }, z.core.$strict>>;
    preview: z.ZodOptional<z.ZodObject<{
        path: z.ZodString;
    }, z.core.$strict>>;
    documents: z.ZodOptional<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        caption: z.ZodString;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type DeliveryPackage = z.infer<typeof DeliveryPackageSchema>;
/** Attachment paths relative to the delivery commit root, in presentation order. */
export declare function deliveryPackagePaths(pkg: DeliveryPackage): string[];
//# sourceMappingURL=delivery-package.d.ts.map