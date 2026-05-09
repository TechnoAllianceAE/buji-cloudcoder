import type { Logger } from '@bcp/common/types/contracts/logger';
export declare function processStrReplace(params: {
    path: string;
    replacements: {
        old: string;
        new: string;
        allowMultiple: boolean;
    }[];
    initialContentPromise: Promise<string | null>;
    logger: Logger;
}): Promise<{
    tool: 'str_replace';
    path: string;
    content: string;
    patch: string;
    messages: string[];
} | {
    tool: 'str_replace';
    path: string;
    error: string;
}>;
//# sourceMappingURL=process-str-replace.d.ts.map