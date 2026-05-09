export interface TokenCallerMap {
    [filePath: string]: {
        [token: string]: string[];
    };
}
export declare function renderReadFilesResult(files: {
    path: string;
    content: string;
}[], tokenCallers: TokenCallerMap): {
    path: string;
    content: string;
    referencedBy: {
        [token: string]: string[];
    };
}[];
//# sourceMappingURL=render-read-files-result.d.ts.map