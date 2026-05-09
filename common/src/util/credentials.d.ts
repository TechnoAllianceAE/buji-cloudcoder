import { z } from 'zod/v4';
export declare const userSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodNullable<z.ZodString>;
    authToken: z.ZodString;
    fingerprintId: z.ZodString;
    fingerprintHash: z.ZodString;
}, z.core.$strip>;
export type User = z.infer<typeof userSchema>;
export declare const genAuthCode: (fingerprintId: string, expiresAt: string, secret: string) => string;
//# sourceMappingURL=credentials.d.ts.map