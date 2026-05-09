import z from 'zod/v4';
export declare const providerMetadataSchema: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodType<import("../json").JSONValue, unknown, z.core.$ZodTypeInternals<import("../json").JSONValue, unknown>>>>;
export type ProviderMetadata = z.infer<typeof providerMetadataSchema>;
//# sourceMappingURL=provider-metadata.d.ts.map