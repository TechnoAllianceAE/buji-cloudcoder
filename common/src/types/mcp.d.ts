import { z } from 'zod/v4';
export declare const mcpConfigStdioSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodLiteral<"stdio">>;
    command: z.ZodString;
    args: z.ZodDefault<z.ZodArray<z.ZodString>>;
    env: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strict>;
export declare const mcpConfigRemoteSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<{
        http: "http";
        sse: "sse";
    }>>;
    url: z.ZodString;
    params: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strict>;
export declare const mcpConfigSchema: z.ZodUnion<readonly [z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<{
        http: "http";
        sse: "sse";
    }>>;
    url: z.ZodString;
    params: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodDefault<z.ZodLiteral<"stdio">>;
    command: z.ZodString;
    args: z.ZodDefault<z.ZodArray<z.ZodString>>;
    env: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strict>]>;
export type MCPConfig = z.infer<typeof mcpConfigSchema>;
//# sourceMappingURL=mcp.d.ts.map