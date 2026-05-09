import z from 'zod/v4';
export declare const dataContentSchema: z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array, Uint8Array>, z.ZodCustom<ArrayBuffer, ArrayBuffer>, z.ZodCustom<Buffer, Buffer>]>;
export type DataContent = z.infer<typeof dataContentSchema>;
//# sourceMappingURL=data-content.d.ts.map