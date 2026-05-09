import { z } from 'zod/v4';
export declare const BROWSER_DEFAULTS: {
    readonly headless: true;
    readonly debug: false;
    readonly timeout: 15000;
    readonly userDataDir: "_browser_profile";
    readonly retryOptions: {
        readonly maxRetries: 3;
        readonly retryDelay: 1000;
        readonly retryOnErrors: readonly ["TimeoutError", "TargetClosedError", "DetachedFrameError"];
    };
    readonly viewportWidth: 1280;
    readonly viewportHeight: 720;
    readonly waitUntil: "networkidle0";
    readonly waitForNavigation: false;
    readonly button: "left";
    readonly delay: 100;
    readonly fullPage: false;
    readonly screenshotCompression: "jpeg";
    readonly screenshotCompressionQuality: 25;
    readonly compressScreenshotData: true;
    readonly maxConsecutiveErrors: 3;
    readonly totalErrorThreshold: 10;
};
/**
 * Response schema for browser action results
 */
export declare const LogSchema: z.ZodObject<{
    type: z.ZodEnum<{
        error: "error";
        debug: "debug";
        info: "info";
        warning: "warning";
        verbose: "verbose";
    }>;
    message: z.ZodString;
    timestamp: z.ZodNumber;
    location: z.ZodOptional<z.ZodString>;
    stack: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    level: z.ZodOptional<z.ZodNumber>;
    source: z.ZodDefault<z.ZodEnum<{
        tool: "tool";
        browser: "browser";
    }>>;
}, z.core.$strip>;
export type Log = z.infer<typeof LogSchema>;
export declare const MetricsSchema: z.ZodObject<{
    loadTime: z.ZodNumber;
    memoryUsage: z.ZodNumber;
    jsErrors: z.ZodNumber;
    networkErrors: z.ZodNumber;
    ttfb: z.ZodOptional<z.ZodNumber>;
    lcp: z.ZodOptional<z.ZodNumber>;
    fcp: z.ZodOptional<z.ZodNumber>;
    domContentLoaded: z.ZodOptional<z.ZodNumber>;
    sessionDuration: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const NetworkEventSchema: z.ZodObject<{
    url: z.ZodString;
    method: z.ZodString;
    status: z.ZodOptional<z.ZodNumber>;
    errorText: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodNumber;
}, z.core.$strip>;
export declare const LogFilterSchema: z.ZodObject<{
    types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        error: "error";
        debug: "debug";
        info: "info";
        warning: "warning";
        verbose: "verbose";
    }>>>;
    minLevel: z.ZodOptional<z.ZodNumber>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const RequiredRetryOptionsSchema: z.ZodObject<{
    maxRetries: z.ZodNumber;
    retryDelay: z.ZodNumber;
    retryOnErrors: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const OptionalBrowserConfigSchema: z.ZodObject<{
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const OptionalStartConfigSchema: z.ZodObject<{
    maxConsecutiveErrors: z.ZodOptional<z.ZodNumber>;
    totalErrorThreshold: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type BrowserConfig = z.infer<typeof OptionalBrowserConfigSchema> & z.infer<typeof OptionalStartConfigSchema>;
export declare const OptionalNavigateConfigSchema: z.ZodObject<{
    waitUntil: z.ZodOptional<z.ZodEnum<{
        networkidle0: "networkidle0";
        load: "load";
        domcontentloaded: "domcontentloaded";
    }>>;
}, z.core.$strip>;
export declare const OptionalClickConfigSchema: z.ZodObject<{
    waitForNavigation: z.ZodOptional<z.ZodBoolean>;
    button: z.ZodOptional<z.ZodEnum<{
        left: "left";
        right: "right";
        middle: "middle";
    }>>;
    visualVerify: z.ZodOptional<z.ZodBoolean>;
    visualThreshold: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const OptionalTypeConfigSchema: z.ZodObject<{
    delay: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const OptionalScreenshotConfigSchema: z.ZodObject<{
    fullPage: z.ZodOptional<z.ZodBoolean>;
    screenshotCompression: z.ZodOptional<z.ZodEnum<{
        jpeg: "jpeg";
        png: "png";
    }>>;
    screenshotCompressionQuality: z.ZodOptional<z.ZodNumber>;
    compressScreenshotData: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const MAX_MESSAGE_SIZE: number;
export declare const BrowserResponseChunkSchema: z.ZodObject<{
    id: z.ZodString;
    total: z.ZodNumber;
    index: z.ZodNumber;
    data: z.ZodString;
}, z.core.$strip>;
export declare const ImageContentSchema: z.ZodObject<{
    type: z.ZodLiteral<"image">;
    source: z.ZodObject<{
        type: z.ZodLiteral<"base64">;
        media_type: z.ZodLiteral<"image/jpeg">;
        data: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ImageContent = z.infer<typeof ImageContentSchema>;
export declare const BrowserResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    error: z.ZodOptional<z.ZodString>;
    logs: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>;
        message: z.ZodString;
        timestamp: z.ZodNumber;
        location: z.ZodOptional<z.ZodString>;
        stack: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodString>;
        level: z.ZodOptional<z.ZodNumber>;
        source: z.ZodDefault<z.ZodEnum<{
            tool: "tool";
            browser: "browser";
        }>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    networkEvents: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        method: z.ZodString;
        status: z.ZodOptional<z.ZodNumber>;
        errorText: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodNumber;
    }, z.core.$strip>>>;
    metrics: z.ZodOptional<z.ZodObject<{
        loadTime: z.ZodNumber;
        memoryUsage: z.ZodNumber;
        jsErrors: z.ZodNumber;
        networkErrors: z.ZodNumber;
        ttfb: z.ZodOptional<z.ZodNumber>;
        lcp: z.ZodOptional<z.ZodNumber>;
        fcp: z.ZodOptional<z.ZodNumber>;
        domContentLoaded: z.ZodOptional<z.ZodNumber>;
        sessionDuration: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    screenshots: z.ZodOptional<z.ZodObject<{
        pre: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"image">;
            source: z.ZodObject<{
                type: z.ZodLiteral<"base64">;
                media_type: z.ZodLiteral<"image/jpeg">;
                data: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        post: z.ZodObject<{
            type: z.ZodLiteral<"image">;
            source: z.ZodObject<{
                type: z.ZodLiteral<"base64">;
                media_type: z.ZodLiteral<"image/jpeg">;
                data: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const RequiredBrowserStartActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"start">;
    url: z.ZodString;
}, z.core.$strip>;
export declare const BrowserStartActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"start">;
    url: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
    maxConsecutiveErrors: z.ZodOptional<z.ZodNumber>;
    totalErrorThreshold: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const RequiredBrowserNavigateActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"navigate">;
    url: z.ZodString;
}, z.core.$strip>;
export declare const BrowserNavigateActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"navigate">;
    url: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
    waitUntil: z.ZodOptional<z.ZodEnum<{
        networkidle0: "networkidle0";
        load: "load";
        domcontentloaded: "domcontentloaded";
    }>>;
}, z.core.$strip>;
export declare const RequiredBrowserClickActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"click">;
}, z.core.$strip>;
export declare const BrowserClickActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"click">;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
    waitForNavigation: z.ZodOptional<z.ZodBoolean>;
    button: z.ZodOptional<z.ZodEnum<{
        left: "left";
        right: "right";
        middle: "middle";
    }>>;
    visualVerify: z.ZodOptional<z.ZodBoolean>;
    visualThreshold: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const RequiredBrowserTypeActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"type">;
    selector: z.ZodString;
    text: z.ZodString;
}, z.core.$strip>;
export declare const BrowserTypeActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"type">;
    selector: z.ZodString;
    text: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
    delay: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const RequiredBrowserScrollActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"scroll">;
}, z.core.$strip>;
export declare const OptionalScrollConfigSchema: z.ZodObject<{
    direction: z.ZodOptional<z.ZodEnum<{
        up: "up";
        down: "down";
    }>>;
}, z.core.$strip>;
export declare const BrowserScrollActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"scroll">;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
    direction: z.ZodOptional<z.ZodEnum<{
        up: "up";
        down: "down";
    }>>;
}, z.core.$strip>;
export declare const RequiredBrowserScreenshotActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"screenshot">;
}, z.core.$strip>;
export declare const BrowserScreenshotActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"screenshot">;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
    fullPage: z.ZodOptional<z.ZodBoolean>;
    screenshotCompression: z.ZodOptional<z.ZodEnum<{
        jpeg: "jpeg";
        png: "png";
    }>>;
    screenshotCompressionQuality: z.ZodOptional<z.ZodNumber>;
    compressScreenshotData: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const RequiredBrowserStopActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"stop">;
}, z.core.$strip>;
export declare const BrowserStopActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"stop">;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const DiagnosticStepSchema: z.ZodObject<{
    label: z.ZodOptional<z.ZodString>;
    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"start">;
        url: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        retryOptions: z.ZodOptional<z.ZodObject<{
            maxRetries: z.ZodOptional<z.ZodNumber>;
            retryDelay: z.ZodOptional<z.ZodNumber>;
            retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        logFilter: z.ZodOptional<z.ZodObject<{
            types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                error: "error";
                debug: "debug";
                info: "info";
                warning: "warning";
                verbose: "verbose";
            }>>>;
            minLevel: z.ZodOptional<z.ZodNumber>;
            categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        debug: z.ZodOptional<z.ZodBoolean>;
        maxConsecutiveErrors: z.ZodOptional<z.ZodNumber>;
        totalErrorThreshold: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"navigate">;
        url: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        retryOptions: z.ZodOptional<z.ZodObject<{
            maxRetries: z.ZodOptional<z.ZodNumber>;
            retryDelay: z.ZodOptional<z.ZodNumber>;
            retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        logFilter: z.ZodOptional<z.ZodObject<{
            types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                error: "error";
                debug: "debug";
                info: "info";
                warning: "warning";
                verbose: "verbose";
            }>>>;
            minLevel: z.ZodOptional<z.ZodNumber>;
            categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        debug: z.ZodOptional<z.ZodBoolean>;
        waitUntil: z.ZodOptional<z.ZodEnum<{
            networkidle0: "networkidle0";
            load: "load";
            domcontentloaded: "domcontentloaded";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"click">;
        timeout: z.ZodOptional<z.ZodNumber>;
        retryOptions: z.ZodOptional<z.ZodObject<{
            maxRetries: z.ZodOptional<z.ZodNumber>;
            retryDelay: z.ZodOptional<z.ZodNumber>;
            retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        logFilter: z.ZodOptional<z.ZodObject<{
            types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                error: "error";
                debug: "debug";
                info: "info";
                warning: "warning";
                verbose: "verbose";
            }>>>;
            minLevel: z.ZodOptional<z.ZodNumber>;
            categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        debug: z.ZodOptional<z.ZodBoolean>;
        waitForNavigation: z.ZodOptional<z.ZodBoolean>;
        button: z.ZodOptional<z.ZodEnum<{
            left: "left";
            right: "right";
            middle: "middle";
        }>>;
        visualVerify: z.ZodOptional<z.ZodBoolean>;
        visualThreshold: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"type">;
        selector: z.ZodString;
        text: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        retryOptions: z.ZodOptional<z.ZodObject<{
            maxRetries: z.ZodOptional<z.ZodNumber>;
            retryDelay: z.ZodOptional<z.ZodNumber>;
            retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        logFilter: z.ZodOptional<z.ZodObject<{
            types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                error: "error";
                debug: "debug";
                info: "info";
                warning: "warning";
                verbose: "verbose";
            }>>>;
            minLevel: z.ZodOptional<z.ZodNumber>;
            categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        debug: z.ZodOptional<z.ZodBoolean>;
        delay: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"scroll">;
        timeout: z.ZodOptional<z.ZodNumber>;
        retryOptions: z.ZodOptional<z.ZodObject<{
            maxRetries: z.ZodOptional<z.ZodNumber>;
            retryDelay: z.ZodOptional<z.ZodNumber>;
            retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        logFilter: z.ZodOptional<z.ZodObject<{
            types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                error: "error";
                debug: "debug";
                info: "info";
                warning: "warning";
                verbose: "verbose";
            }>>>;
            minLevel: z.ZodOptional<z.ZodNumber>;
            categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        debug: z.ZodOptional<z.ZodBoolean>;
        direction: z.ZodOptional<z.ZodEnum<{
            up: "up";
            down: "down";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"screenshot">;
        timeout: z.ZodOptional<z.ZodNumber>;
        retryOptions: z.ZodOptional<z.ZodObject<{
            maxRetries: z.ZodOptional<z.ZodNumber>;
            retryDelay: z.ZodOptional<z.ZodNumber>;
            retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        logFilter: z.ZodOptional<z.ZodObject<{
            types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                error: "error";
                debug: "debug";
                info: "info";
                warning: "warning";
                verbose: "verbose";
            }>>>;
            minLevel: z.ZodOptional<z.ZodNumber>;
            categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        debug: z.ZodOptional<z.ZodBoolean>;
        fullPage: z.ZodOptional<z.ZodBoolean>;
        screenshotCompression: z.ZodOptional<z.ZodEnum<{
            jpeg: "jpeg";
            png: "png";
        }>>;
        screenshotCompressionQuality: z.ZodOptional<z.ZodNumber>;
        compressScreenshotData: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"stop">;
        timeout: z.ZodOptional<z.ZodNumber>;
        retryOptions: z.ZodOptional<z.ZodObject<{
            maxRetries: z.ZodOptional<z.ZodNumber>;
            retryDelay: z.ZodOptional<z.ZodNumber>;
            retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        logFilter: z.ZodOptional<z.ZodObject<{
            types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                error: "error";
                debug: "debug";
                info: "info";
                warning: "warning";
                verbose: "verbose";
            }>>>;
            minLevel: z.ZodOptional<z.ZodNumber>;
            categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        debug: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>], "type">;
    expectedLogs: z.ZodOptional<z.ZodArray<z.ZodString>>;
    noJsErrors: z.ZodOptional<z.ZodBoolean>;
    noNetworkErrors: z.ZodOptional<z.ZodBoolean>;
    customCondition: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const BrowserDiagnoseActionSchema: z.ZodObject<{
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
    type: z.ZodLiteral<"diagnose">;
    steps: z.ZodArray<z.ZodObject<{
        label: z.ZodOptional<z.ZodString>;
        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"start">;
            url: z.ZodString;
            timeout: z.ZodOptional<z.ZodNumber>;
            retryOptions: z.ZodOptional<z.ZodObject<{
                maxRetries: z.ZodOptional<z.ZodNumber>;
                retryDelay: z.ZodOptional<z.ZodNumber>;
                retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            logFilter: z.ZodOptional<z.ZodObject<{
                types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    error: "error";
                    debug: "debug";
                    info: "info";
                    warning: "warning";
                    verbose: "verbose";
                }>>>;
                minLevel: z.ZodOptional<z.ZodNumber>;
                categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            debug: z.ZodOptional<z.ZodBoolean>;
            maxConsecutiveErrors: z.ZodOptional<z.ZodNumber>;
            totalErrorThreshold: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"navigate">;
            url: z.ZodString;
            timeout: z.ZodOptional<z.ZodNumber>;
            retryOptions: z.ZodOptional<z.ZodObject<{
                maxRetries: z.ZodOptional<z.ZodNumber>;
                retryDelay: z.ZodOptional<z.ZodNumber>;
                retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            logFilter: z.ZodOptional<z.ZodObject<{
                types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    error: "error";
                    debug: "debug";
                    info: "info";
                    warning: "warning";
                    verbose: "verbose";
                }>>>;
                minLevel: z.ZodOptional<z.ZodNumber>;
                categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            debug: z.ZodOptional<z.ZodBoolean>;
            waitUntil: z.ZodOptional<z.ZodEnum<{
                networkidle0: "networkidle0";
                load: "load";
                domcontentloaded: "domcontentloaded";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"click">;
            timeout: z.ZodOptional<z.ZodNumber>;
            retryOptions: z.ZodOptional<z.ZodObject<{
                maxRetries: z.ZodOptional<z.ZodNumber>;
                retryDelay: z.ZodOptional<z.ZodNumber>;
                retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            logFilter: z.ZodOptional<z.ZodObject<{
                types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    error: "error";
                    debug: "debug";
                    info: "info";
                    warning: "warning";
                    verbose: "verbose";
                }>>>;
                minLevel: z.ZodOptional<z.ZodNumber>;
                categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            debug: z.ZodOptional<z.ZodBoolean>;
            waitForNavigation: z.ZodOptional<z.ZodBoolean>;
            button: z.ZodOptional<z.ZodEnum<{
                left: "left";
                right: "right";
                middle: "middle";
            }>>;
            visualVerify: z.ZodOptional<z.ZodBoolean>;
            visualThreshold: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"type">;
            selector: z.ZodString;
            text: z.ZodString;
            timeout: z.ZodOptional<z.ZodNumber>;
            retryOptions: z.ZodOptional<z.ZodObject<{
                maxRetries: z.ZodOptional<z.ZodNumber>;
                retryDelay: z.ZodOptional<z.ZodNumber>;
                retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            logFilter: z.ZodOptional<z.ZodObject<{
                types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    error: "error";
                    debug: "debug";
                    info: "info";
                    warning: "warning";
                    verbose: "verbose";
                }>>>;
                minLevel: z.ZodOptional<z.ZodNumber>;
                categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            debug: z.ZodOptional<z.ZodBoolean>;
            delay: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"scroll">;
            timeout: z.ZodOptional<z.ZodNumber>;
            retryOptions: z.ZodOptional<z.ZodObject<{
                maxRetries: z.ZodOptional<z.ZodNumber>;
                retryDelay: z.ZodOptional<z.ZodNumber>;
                retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            logFilter: z.ZodOptional<z.ZodObject<{
                types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    error: "error";
                    debug: "debug";
                    info: "info";
                    warning: "warning";
                    verbose: "verbose";
                }>>>;
                minLevel: z.ZodOptional<z.ZodNumber>;
                categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            debug: z.ZodOptional<z.ZodBoolean>;
            direction: z.ZodOptional<z.ZodEnum<{
                up: "up";
                down: "down";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"screenshot">;
            timeout: z.ZodOptional<z.ZodNumber>;
            retryOptions: z.ZodOptional<z.ZodObject<{
                maxRetries: z.ZodOptional<z.ZodNumber>;
                retryDelay: z.ZodOptional<z.ZodNumber>;
                retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            logFilter: z.ZodOptional<z.ZodObject<{
                types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    error: "error";
                    debug: "debug";
                    info: "info";
                    warning: "warning";
                    verbose: "verbose";
                }>>>;
                minLevel: z.ZodOptional<z.ZodNumber>;
                categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            debug: z.ZodOptional<z.ZodBoolean>;
            fullPage: z.ZodOptional<z.ZodBoolean>;
            screenshotCompression: z.ZodOptional<z.ZodEnum<{
                jpeg: "jpeg";
                png: "png";
            }>>;
            screenshotCompressionQuality: z.ZodOptional<z.ZodNumber>;
            compressScreenshotData: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"stop">;
            timeout: z.ZodOptional<z.ZodNumber>;
            retryOptions: z.ZodOptional<z.ZodObject<{
                maxRetries: z.ZodOptional<z.ZodNumber>;
                retryDelay: z.ZodOptional<z.ZodNumber>;
                retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            logFilter: z.ZodOptional<z.ZodObject<{
                types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    error: "error";
                    debug: "debug";
                    info: "info";
                    warning: "warning";
                    verbose: "verbose";
                }>>>;
                minLevel: z.ZodOptional<z.ZodNumber>;
                categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            debug: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>], "type">;
        expectedLogs: z.ZodOptional<z.ZodArray<z.ZodString>>;
        noJsErrors: z.ZodOptional<z.ZodBoolean>;
        noNetworkErrors: z.ZodOptional<z.ZodBoolean>;
        customCondition: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    automated: z.ZodOptional<z.ZodBoolean>;
    maxSteps: z.ZodOptional<z.ZodNumber>;
    sessionTimeoutMs: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const BrowserActionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"start">;
    url: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
    maxConsecutiveErrors: z.ZodOptional<z.ZodNumber>;
    totalErrorThreshold: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"navigate">;
    url: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
    waitUntil: z.ZodOptional<z.ZodEnum<{
        networkidle0: "networkidle0";
        load: "load";
        domcontentloaded: "domcontentloaded";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"click">;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
    waitForNavigation: z.ZodOptional<z.ZodBoolean>;
    button: z.ZodOptional<z.ZodEnum<{
        left: "left";
        right: "right";
        middle: "middle";
    }>>;
    visualVerify: z.ZodOptional<z.ZodBoolean>;
    visualThreshold: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"type">;
    selector: z.ZodString;
    text: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
    delay: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"scroll">;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
    direction: z.ZodOptional<z.ZodEnum<{
        up: "up";
        down: "down";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"screenshot">;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
    fullPage: z.ZodOptional<z.ZodBoolean>;
    screenshotCompression: z.ZodOptional<z.ZodEnum<{
        jpeg: "jpeg";
        png: "png";
    }>>;
    screenshotCompressionQuality: z.ZodOptional<z.ZodNumber>;
    compressScreenshotData: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"stop">;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    timeout: z.ZodOptional<z.ZodNumber>;
    retryOptions: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodOptional<z.ZodNumber>;
        retryDelay: z.ZodOptional<z.ZodNumber>;
        retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logFilter: z.ZodOptional<z.ZodObject<{
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warning: "warning";
            verbose: "verbose";
        }>>>;
        minLevel: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    debug: z.ZodOptional<z.ZodBoolean>;
    type: z.ZodLiteral<"diagnose">;
    steps: z.ZodArray<z.ZodObject<{
        label: z.ZodOptional<z.ZodString>;
        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"start">;
            url: z.ZodString;
            timeout: z.ZodOptional<z.ZodNumber>;
            retryOptions: z.ZodOptional<z.ZodObject<{
                maxRetries: z.ZodOptional<z.ZodNumber>;
                retryDelay: z.ZodOptional<z.ZodNumber>;
                retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            logFilter: z.ZodOptional<z.ZodObject<{
                types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    error: "error";
                    debug: "debug";
                    info: "info";
                    warning: "warning";
                    verbose: "verbose";
                }>>>;
                minLevel: z.ZodOptional<z.ZodNumber>;
                categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            debug: z.ZodOptional<z.ZodBoolean>;
            maxConsecutiveErrors: z.ZodOptional<z.ZodNumber>;
            totalErrorThreshold: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"navigate">;
            url: z.ZodString;
            timeout: z.ZodOptional<z.ZodNumber>;
            retryOptions: z.ZodOptional<z.ZodObject<{
                maxRetries: z.ZodOptional<z.ZodNumber>;
                retryDelay: z.ZodOptional<z.ZodNumber>;
                retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            logFilter: z.ZodOptional<z.ZodObject<{
                types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    error: "error";
                    debug: "debug";
                    info: "info";
                    warning: "warning";
                    verbose: "verbose";
                }>>>;
                minLevel: z.ZodOptional<z.ZodNumber>;
                categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            debug: z.ZodOptional<z.ZodBoolean>;
            waitUntil: z.ZodOptional<z.ZodEnum<{
                networkidle0: "networkidle0";
                load: "load";
                domcontentloaded: "domcontentloaded";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"click">;
            timeout: z.ZodOptional<z.ZodNumber>;
            retryOptions: z.ZodOptional<z.ZodObject<{
                maxRetries: z.ZodOptional<z.ZodNumber>;
                retryDelay: z.ZodOptional<z.ZodNumber>;
                retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            logFilter: z.ZodOptional<z.ZodObject<{
                types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    error: "error";
                    debug: "debug";
                    info: "info";
                    warning: "warning";
                    verbose: "verbose";
                }>>>;
                minLevel: z.ZodOptional<z.ZodNumber>;
                categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            debug: z.ZodOptional<z.ZodBoolean>;
            waitForNavigation: z.ZodOptional<z.ZodBoolean>;
            button: z.ZodOptional<z.ZodEnum<{
                left: "left";
                right: "right";
                middle: "middle";
            }>>;
            visualVerify: z.ZodOptional<z.ZodBoolean>;
            visualThreshold: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"type">;
            selector: z.ZodString;
            text: z.ZodString;
            timeout: z.ZodOptional<z.ZodNumber>;
            retryOptions: z.ZodOptional<z.ZodObject<{
                maxRetries: z.ZodOptional<z.ZodNumber>;
                retryDelay: z.ZodOptional<z.ZodNumber>;
                retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            logFilter: z.ZodOptional<z.ZodObject<{
                types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    error: "error";
                    debug: "debug";
                    info: "info";
                    warning: "warning";
                    verbose: "verbose";
                }>>>;
                minLevel: z.ZodOptional<z.ZodNumber>;
                categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            debug: z.ZodOptional<z.ZodBoolean>;
            delay: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"scroll">;
            timeout: z.ZodOptional<z.ZodNumber>;
            retryOptions: z.ZodOptional<z.ZodObject<{
                maxRetries: z.ZodOptional<z.ZodNumber>;
                retryDelay: z.ZodOptional<z.ZodNumber>;
                retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            logFilter: z.ZodOptional<z.ZodObject<{
                types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    error: "error";
                    debug: "debug";
                    info: "info";
                    warning: "warning";
                    verbose: "verbose";
                }>>>;
                minLevel: z.ZodOptional<z.ZodNumber>;
                categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            debug: z.ZodOptional<z.ZodBoolean>;
            direction: z.ZodOptional<z.ZodEnum<{
                up: "up";
                down: "down";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"screenshot">;
            timeout: z.ZodOptional<z.ZodNumber>;
            retryOptions: z.ZodOptional<z.ZodObject<{
                maxRetries: z.ZodOptional<z.ZodNumber>;
                retryDelay: z.ZodOptional<z.ZodNumber>;
                retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            logFilter: z.ZodOptional<z.ZodObject<{
                types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    error: "error";
                    debug: "debug";
                    info: "info";
                    warning: "warning";
                    verbose: "verbose";
                }>>>;
                minLevel: z.ZodOptional<z.ZodNumber>;
                categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            debug: z.ZodOptional<z.ZodBoolean>;
            fullPage: z.ZodOptional<z.ZodBoolean>;
            screenshotCompression: z.ZodOptional<z.ZodEnum<{
                jpeg: "jpeg";
                png: "png";
            }>>;
            screenshotCompressionQuality: z.ZodOptional<z.ZodNumber>;
            compressScreenshotData: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"stop">;
            timeout: z.ZodOptional<z.ZodNumber>;
            retryOptions: z.ZodOptional<z.ZodObject<{
                maxRetries: z.ZodOptional<z.ZodNumber>;
                retryDelay: z.ZodOptional<z.ZodNumber>;
                retryOnErrors: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            logFilter: z.ZodOptional<z.ZodObject<{
                types: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    error: "error";
                    debug: "debug";
                    info: "info";
                    warning: "warning";
                    verbose: "verbose";
                }>>>;
                minLevel: z.ZodOptional<z.ZodNumber>;
                categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            debug: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>], "type">;
        expectedLogs: z.ZodOptional<z.ZodArray<z.ZodString>>;
        noJsErrors: z.ZodOptional<z.ZodBoolean>;
        noNetworkErrors: z.ZodOptional<z.ZodBoolean>;
        customCondition: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    automated: z.ZodOptional<z.ZodBoolean>;
    maxSteps: z.ZodOptional<z.ZodNumber>;
    sessionTimeoutMs: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>], "type">;
/**
 * Creates an XML string from a BrowserAction object
 */
export declare function createBrowserActionXML(action: BrowserAction): string;
/**
 * Parses XML attributes into a BrowserAction object
 */
export declare function parseBrowserActionXML(xmlString: string): BrowserAction;
export type BrowserResponse = z.infer<typeof BrowserResponseSchema>;
export type BrowserAction = z.infer<typeof BrowserActionSchema>;
/**
 * Parse browser action XML attributes into a typed BrowserAction object
 */
export declare function parseBrowserActionAttributes(attributes: Record<string, string>): BrowserAction;
//# sourceMappingURL=browser-actions.d.ts.map