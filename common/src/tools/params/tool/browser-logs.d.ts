import z from 'zod/v4';
export declare const browserLogsParams: {
    toolName: "browser_logs";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{
        type: z.ZodString;
        url: z.ZodString;
        waitUntil: z.ZodOptional<z.ZodEnum<{
            networkidle0: "networkidle0";
            load: "load";
            domcontentloaded: "domcontentloaded";
        }>>;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<{
            success: boolean;
            logs: {
                type: "error" | "debug" | "info" | "warning" | "verbose";
                message: string;
                timestamp: number;
                source: "tool" | "browser";
                location?: string;
                stack?: string;
                category?: string;
                level?: number;
            }[];
            error?: string;
            logFilter?: {
                types?: ("error" | "debug" | "info" | "warning" | "verbose")[];
                minLevel?: number;
                categories?: string[];
            };
            networkEvents?: {
                url: string;
                method: string;
                timestamp: number;
                status?: number;
                errorText?: string;
            }[];
            metrics?: {
                loadTime: number;
                memoryUsage: number;
                jsErrors: number;
                networkErrors: number;
                ttfb?: number;
                lcp?: number;
                fcp?: number;
                domContentLoaded?: number;
                sessionDuration?: number;
            };
            screenshots?: {
                post: {
                    type: "image";
                    source: {
                        type: "base64";
                        media_type: "image/jpeg";
                        data: string;
                    };
                };
                pre?: {
                    type: "image";
                    source: {
                        type: "base64";
                        media_type: "image/jpeg";
                        data: string;
                    };
                };
            };
        }, unknown, z.core.$ZodTypeInternals<{
            success: boolean;
            logs: {
                type: "error" | "debug" | "info" | "warning" | "verbose";
                message: string;
                timestamp: number;
                source: "tool" | "browser";
                location?: string;
                stack?: string;
                category?: string;
                level?: number;
            }[];
            error?: string;
            logFilter?: {
                types?: ("error" | "debug" | "info" | "warning" | "verbose")[];
                minLevel?: number;
                categories?: string[];
            };
            networkEvents?: {
                url: string;
                method: string;
                timestamp: number;
                status?: number;
                errorText?: string;
            }[];
            metrics?: {
                loadTime: number;
                memoryUsage: number;
                jsErrors: number;
                networkErrors: number;
                ttfb?: number;
                lcp?: number;
                fcp?: number;
                domContentLoaded?: number;
                sessionDuration?: number;
            };
            screenshots?: {
                post: {
                    type: "image";
                    source: {
                        type: "base64";
                        media_type: "image/jpeg";
                        data: string;
                    };
                };
                pre?: {
                    type: "image";
                    source: {
                        type: "base64";
                        media_type: "image/jpeg";
                        data: string;
                    };
                };
            };
        }, unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=browser-logs.d.ts.map