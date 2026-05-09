import type { LanguageConfig } from './languages';
export declare const DEBUG_PARSING = false;
export interface TokenCallerMap {
    [filePath: string]: {
        [token: string]: string[];
    };
}
export interface FileTokenData {
    tokenScores: {
        [filePath: string]: {
            [token: string]: number;
        };
    };
    tokenCallers: TokenCallerMap;
}
export declare function getFileTokenScores(projectRoot: string, filePaths: string[], readFile?: (filePath: string) => string | null): Promise<FileTokenData>;
export declare function parseTokens(filePath: string, languageConfig: LanguageConfig, readFile?: (filePath: string) => string | null): {
    numLines: number;
    identifiers: string[];
    calls: string[];
};
//# sourceMappingURL=parse.d.ts.map