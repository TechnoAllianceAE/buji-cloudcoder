import z from 'zod/v4';
export declare const CLIENT_ENV_PREFIX = "NEXT_PUBLIC_";
export declare const clientEnvSchema: z.ZodObject<{
    NEXT_PUBLIC_CB_ENVIRONMENT: z.ZodDefault<z.ZodEnum<{
        dev: "dev";
        test: "test";
        prod: "prod";
    }>>;
    NEXT_PUBLIC_BCP_APP_URL: z.ZodDefault<z.ZodURL>;
    NEXT_PUBLIC_SUPPORT_EMAIL: z.ZodDefault<z.ZodEmail>;
    NEXT_PUBLIC_POSTHOG_API_KEY: z.ZodDefault<z.ZodString>;
    NEXT_PUBLIC_POSTHOG_HOST_URL: z.ZodDefault<z.ZodURL>;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.ZodDefault<z.ZodString>;
    NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL: z.ZodDefault<z.ZodURL>;
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION_ID: z.ZodOptional<z.ZodString>;
    NEXT_PUBLIC_WEB_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const clientEnvVars: ("NEXT_PUBLIC_CB_ENVIRONMENT" | "NEXT_PUBLIC_BCP_APP_URL" | "NEXT_PUBLIC_SUPPORT_EMAIL" | "NEXT_PUBLIC_POSTHOG_API_KEY" | "NEXT_PUBLIC_POSTHOG_HOST_URL" | "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" | "NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL" | "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION_ID" | "NEXT_PUBLIC_WEB_PORT")[];
export type ClientEnvVar = (typeof clientEnvVars)[number];
export type ClientInput = {
    [K in (typeof clientEnvVars)[number]]: string | undefined;
};
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export declare const clientProcessEnv: ClientInput;
//# sourceMappingURL=env-schema.d.ts.map